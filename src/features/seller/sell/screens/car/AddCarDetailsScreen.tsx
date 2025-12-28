// src/screens/CarScreens/AddCarDetailsScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import SellFlowLayout from '../common/SellFlowLayout';
import {
  PrimaryButton,
  BottomSheetPicker,
  BottomSheetPickerOption,
  TextField,
  Textarea,
  DropdownField,
  DropdownOption,
  ReadonlyPickerInput,
} from '@shared/components';
import { colors, spacing } from '@theme/tokens';
import { useFormState } from '@shared/form/hooks/useFormState';
import {
  CarDetailsFormValues,
  CURRENT_YEAR,
  MIN_CAR_YEAR,
  carDetailsSchema,
  getDefaultCarDetailsValues,
} from '@shared/form/schemas/carDetailsSchema';
import { FormFieldConfig } from '@shared/form/config/types';
import { getCarDetailsFieldConfig } from '@shared/form/config/carDetailsFields';
import { useAuth } from '@context/AuthContext';
import { toCarCreateDTO } from '@shared/mappers/listingMappers';
import { addCar } from '@features/seller/sell/api/CarsApi';
import { normalizeCreateResponse } from '@shared/utils';
import { getFriendlyApiError } from '@shared/utils';
import { SellCarStackParamList } from '../../navigation/SellCarStack';

type AddCarDetailsScreenNavigationProp = NativeStackNavigationProp<
  SellCarStackParamList,
  'AddCarDetails'
>;

const AddCarDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddCarDetailsScreenNavigationProp>();
  const { sellerId } = useAuth();

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    touchField,
    validateForm,
  } = useFormState<CarDetailsFormValues>({
    initialValues: getDefaultCarDetailsValues(),
    schema: carDetailsSchema,
  });

  const [loading, setLoading] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [insuranceDatePickerVisible, setInsuranceDatePickerVisible] = useState(false);

  useEffect(() => {
    if (values.carInsurance === false) {
      if (values.carInsuranceDate !== '') {
        setFieldValue('carInsuranceDate', '' as CarDetailsFormValues['carInsuranceDate'], {
          validate: false,
        });
      }
      if (values.carInsuranceType !== '') {
        setFieldValue('carInsuranceType', '' as CarDetailsFormValues['carInsuranceType'], {
          validate: false,
        });
      }
    }
  }, [setFieldValue, values.carInsurance, values.carInsuranceDate, values.carInsuranceType]);

  const yearOptions = useMemo<BottomSheetPickerOption<string>[]>(() => {
    const years: BottomSheetPickerOption<string>[] = [];
    for (let year = CURRENT_YEAR; year >= MIN_CAR_YEAR; year -= 1) {
      const value = year.toString();
      years.push({ label: value, value });
    }
    return years;
  }, []);

  const fieldConfig = useMemo(
    () =>
      getCarDetailsFieldConfig({
        onOpenYearPicker: () => setYearPickerVisible(true),
        onOpenInsuranceDatePicker: () => setInsuranceDatePickerVisible(true),
      }),
    [],
  );

  const renderField = (config: FormFieldConfig<CarDetailsFormValues>) => {
    const field = config.field;
    const value = values[field];
    const error = touched[field] ? errors[field] : undefined;
    const labelAccessory = config.getLabelAccessory?.({ values });

    switch (config.component) {
      case 'text': {
        const formattedValue = value == null ? '' : String(value);
        const extraProps =
          field === 'carInsuranceDate' || field === 'carInsuranceType'
            ? { editable: values.carInsurance === true }
            : null;

        return (
          <TextField
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue = config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as CarDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            labelAccessory={labelAccessory}
            {...config.props}
            {...extraProps}
          />
        );
      }
      case 'textarea': {
        const formattedValue = value == null ? '' : String(value);
        return (
          <Textarea
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue = config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as CarDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            labelAccessory={labelAccessory}
            {...config.props}
          />
        );
      }
      case 'dropdown': {
        const props = config.props ?? {};
        const data: DropdownOption<any>[] = props.data ?? [];
        const { placeholder, ...restProps } = props;
        return (
          <DropdownField
            key={String(field)}
            label={config.label}
            data={data}
            value={value as any}
            onChange={(item) => {
              touchField(field);
              setFieldValue(field, item.value, { validate: true });
            }}
            required={config.required}
            error={error}
            placeholder={placeholder}
            {...restProps}
          />
        );
      }
      case 'readonlyPicker': {
        const props = config.props ?? {};
        const { onPress, ...restProps } = props;
        return (
          <ReadonlyPickerInput
            key={String(field)}
            label={config.label}
            value={value as string | number | null | undefined}
            required={config.required}
            error={error}
            onPress={onPress ?? (() => {})}
            {...restProps}
          />
        );
      }
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (sellerId == null) {
      Alert.alert('Error', 'Seller account not found');
      return;
    }

    const valid = validateForm();
    if (!valid) {
      return;
    }

    try {
      setLoading(true);
      const payload = toCarCreateDTO(values, Number(sellerId));
      const response = await addCar(payload);
      const normalized = normalizeCreateResponse(response, 'car');

      if (!normalized.success || normalized.id === null) {
        Alert.alert('Failed', normalized.rawMessage || 'Unable to create car listing');
        return;
      }

      Alert.alert('Success', normalized.message || 'Car created successfully');
      navigation.navigate('SelectPhoto', { carId: normalized.id });
    } catch (error: any) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to add car'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SellFlowLayout
        title="Car Details"
        onBack={() => navigation.goBack()}
        footer={
          <PrimaryButton
            label="Next"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            icon={<Icon name="arrow-right" size={20} color={colors.white} />}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      >
        {fieldConfig.map((config) => renderField(config))}
        <View style={{ height: spacing.xxxl }} />
      </SellFlowLayout>

      <BottomSheetPicker
        visible={yearPickerVisible}
        title="Select Year"
        options={yearOptions}
        selectedValue={values.yearOfPurchase}
        onSelect={(year) => {
          touchField('yearOfPurchase');
          setFieldValue('yearOfPurchase', year, { validate: true });
          setYearPickerVisible(false);
        }}
        onClose={() => setYearPickerVisible(false)}
      />

      {insuranceDatePickerVisible && (
        <DateTimePicker
          value={
            values.carInsuranceDate
              ? new Date(values.carInsuranceDate)
              : new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setInsuranceDatePickerVisible(Platform.OS === 'ios');
            if (event.type === 'set' && selectedDate) {
              const formattedDate = selectedDate.toISOString().split('T')[0];
              touchField('carInsuranceDate');
              setFieldValue('carInsuranceDate', formattedDate, { validate: true });
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </>
  );
};

export default AddCarDetailsScreen;
