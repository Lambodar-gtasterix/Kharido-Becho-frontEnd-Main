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
  AutocompleteField,
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
import { useBrandAutocomplete } from '@core/car/hooks/useBrandAutocomplete';
import { useVariantAutocomplete } from '@core/car/hooks/useVariantAutocomplete';
import { useSubVariantAutocomplete } from '@core/car/hooks/useSubVariantAutocomplete';
import { useStates, useCities, useLocalities } from '@shared/hooks/useLocationData';

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
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [brandFocused, setBrandFocused] = useState(false);
  const [variantFocused, setVariantFocused] = useState(false);
  const [subVariantFocused, setSubVariantFocused] = useState(false);
  const [stateFocused, setStateFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [localityFocused, setLocalityFocused] = useState(false);

  const { brands, loading: brandsLoading } = useBrandAutocomplete(values.brand || '', brandFocused);
  const { variants, loading: variantsLoading } = useVariantAutocomplete(
    values.brand || '',
    values.model || '',
    variantFocused
  );
  const { subVariants, loading: subVariantsLoading } = useSubVariantAutocomplete(
    values.brand || '',
    values.model || '',
    values.variant || '',
    subVariantFocused
  );

  // Location hooks
  const { states, loading: statesLoading } = useStates();
  const { cities, loading: citiesLoading } = useCities(values.state || '', stateFocused || !!values.state);
  const { localities, loading: localitiesLoading } = useLocalities(
    values.state || '',
    values.city || '',
    cityFocused || !!(values.state && values.city)
  );

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

  const colorOptions = useMemo<BottomSheetPickerOption<string>[]>(() => [
    { label: 'Pearl White', value: 'Pearl White' },
    { label: 'Jet Black', value: 'Jet Black' },
    { label: 'Midnight Black', value: 'Midnight Black' },
    { label: 'Arctic White', value: 'Arctic White' },
    { label: 'Silver Metallic', value: 'Silver Metallic' },
    { label: 'Grey Metallic', value: 'Grey Metallic' },
    { label: 'Space Gray', value: 'Space Gray' },
    { label: 'Deep Blue', value: 'Deep Blue' },
    { label: 'Navy Blue', value: 'Navy Blue' },
    { label: 'Sky Blue', value: 'Sky Blue' },
    { label: 'Wine Red', value: 'Wine Red' },
    { label: 'Maroon', value: 'Maroon' },
    { label: 'Ruby Red', value: 'Ruby Red' },
    { label: 'Titanium Grey', value: 'Titanium Grey' },
    { label: 'Champagne Gold', value: 'Champagne Gold' },
    { label: 'Bronze', value: 'Bronze' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Beige', value: 'Beige' },
    { label: 'Orange', value: 'Orange' },
    { label: 'Green', value: 'Green' },
    { label: 'Other', value: 'OTHER' },
  ], []);

  const fieldConfig = useMemo(
    () =>
      getCarDetailsFieldConfig({
        onOpenYearPicker: () => setYearPickerVisible(true),
        onOpenInsuranceDatePicker: () => setInsuranceDatePickerVisible(true),
        onOpenColorPicker: () => setColorPickerVisible(true),
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
          field === 'carInsuranceDate'
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
        const isInsuranceTypeField = field === 'carInsuranceType';
        const isDisabled = isInsuranceTypeField ? values.carInsurance !== true : false;

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
            disabled={isDisabled}
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
      case 'autocomplete': {
        const formattedValue = value == null ? '' : String(value);
        const isBrandField = field === 'brand';
        const isVariantField = field === 'model';
        const isSubVariantField = field === 'variant';
        const isStateField = field === 'state';
        const isCityField = field === 'city';
        const isLocalityField = field === 'address';

        let options: string[] = [];
        let autocompleteLoading = false;

        if (isBrandField) {
          options = brands;
          autocompleteLoading = brandsLoading;
        } else if (isVariantField) {
          options = variants;
          autocompleteLoading = variantsLoading;
        } else if (isSubVariantField) {
          options = subVariants;
          autocompleteLoading = subVariantsLoading;
        } else if (isStateField) {
          options = states;
          autocompleteLoading = statesLoading;
        } else if (isCityField) {
          options = cities;
          autocompleteLoading = citiesLoading;
        } else if (isLocalityField) {
          options = localities;
          autocompleteLoading = localitiesLoading;
        }

        const zIndex = isBrandField ? 1000 : isVariantField ? 999 : isSubVariantField ? 998 : isStateField ? 997 : isCityField ? 996 : 995;

        return (
          <View key={String(field)} style={{ zIndex }}>
            <AutocompleteField
              label={config.label}
              value={formattedValue}
              onChangeText={(text) => {
                setFieldValue(field, text, { validate: Boolean(touched[field]) });
                if (isBrandField && text !== values.brand) {
                  setFieldValue('model', '', { validate: false });
                  setFieldValue('variant', '', { validate: false });
                  setVariantFocused(false);
                  setSubVariantFocused(false);
                } else if (isVariantField && text !== values.model) {
                  setFieldValue('variant', '', { validate: false });
                  setSubVariantFocused(false);
                } else if (isStateField && text !== values.state) {
                  setFieldValue('city', '', { validate: false });
                  setFieldValue('address', '', { validate: false });
                  setCityFocused(false);
                  setLocalityFocused(false);
                } else if (isCityField && text !== values.city) {
                  setFieldValue('address', '', { validate: false });
                  setLocalityFocused(false);
                }
              }}
              onSelect={(option) => {
                touchField(field);
                setFieldValue(field, option, { validate: true });
                if (isBrandField) {
                  setFieldValue('model', '', { validate: false });
                  setFieldValue('variant', '', { validate: false });
                  setVariantFocused(false);
                  setSubVariantFocused(false);
                  setBrandFocused(false);
                } else if (isVariantField) {
                  setFieldValue('variant', '', { validate: false });
                  setSubVariantFocused(false);
                  setVariantFocused(false);
                } else if (isStateField) {
                  setFieldValue('city', '', { validate: false });
                  setFieldValue('address', '', { validate: false });
                  setCityFocused(false);
                  setLocalityFocused(false);
                  setStateFocused(false);
                } else if (isCityField) {
                  setFieldValue('address', '', { validate: false });
                  setLocalityFocused(false);
                  setCityFocused(false);
                }
              }}
              onFocus={() => {
                if (isBrandField) {
                  setBrandFocused(true);
                } else if (isVariantField) {
                  setVariantFocused(true);
                } else if (isSubVariantField) {
                  setSubVariantFocused(true);
                } else if (isStateField) {
                  setStateFocused(true);
                } else if (isCityField) {
                  setCityFocused(true);
                } else if (isLocalityField) {
                  setLocalityFocused(true);
                }
              }}
              onBlur={() => {
                handleBlur(field);
                if (isBrandField) {
                  setTimeout(() => setBrandFocused(false), 200);
                } else if (isVariantField) {
                  setTimeout(() => setVariantFocused(false), 200);
                } else if (isSubVariantField) {
                  setTimeout(() => setSubVariantFocused(false), 200);
                } else if (isStateField) {
                  setTimeout(() => setStateFocused(false), 200);
                } else if (isCityField) {
                  setTimeout(() => setCityFocused(false), 200);
                } else if (isLocalityField) {
                  setTimeout(() => setLocalityFocused(false), 200);
                }
              }}
              options={options}
              loading={autocompleteLoading}
              error={error}
              required={config.required}
              disabled={
                (isVariantField && !values.brand) ||
                (isSubVariantField && (!values.brand || !values.model)) ||
                (isCityField && !values.state) ||
                (isLocalityField && (!values.state || !values.city))
              }
              showOnFocus={true}
              {...config.props}
            />
          </View>
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

      <BottomSheetPicker
        visible={colorPickerVisible}
        title="Select Color"
        options={colorOptions}
        selectedValue={values.color === 'OTHER' ? 'OTHER' : values.color}
        onSelect={(color) => {
          if (color === 'OTHER') {
            setColorPickerVisible(false);
            setTimeout(() => {
              Alert.prompt(
                'Enter Custom Color',
                'Please enter your car color',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: (customColor) => {
                      if (customColor && customColor.trim()) {
                        touchField('color');
                        setFieldValue('color', customColor.trim(), { validate: true });
                      }
                    },
                  },
                ],
                'plain-text',
                values.color && values.color !== 'OTHER' ? values.color : '',
              );
            }, 300);
          } else {
            touchField('color');
            setFieldValue('color', color, { validate: true });
            setColorPickerVisible(false);
          }
        }}
        onClose={() => setColorPickerVisible(false)}
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
