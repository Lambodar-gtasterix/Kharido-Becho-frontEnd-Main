// src/screens/MobileScreens/AddMobileDetailsScreen

import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  CURRENT_YEAR,
  MIN_MOBILE_YEAR,
  MobileDetailsFormValues,
  getDefaultMobileDetailsValues,
  mobileDetailsSchema,
} from '@shared/form/schemas/mobileDetailsSchema';
import { FormFieldConfig } from '@shared/form/config/types';
import { getMobileDetailsFieldConfig } from '@shared/form/config/mobileDetailsFields';
import { normalizeCreateResponse } from '@shared/utils';
import { toMobileCreateDTO } from '@shared/mappers/listingMappers';
import { addMobile } from '@features/seller/sell/api/MobilesApi';
import { useAuth } from '@context/AuthContext';
import { SellMobileStackParamList } from '../../navigation/SellMobileStack';
import { getFriendlyApiError } from '@shared/utils';
import { useBrandAutocomplete } from '../../hooks/mobile/useBrandAutocomplete';
import { useModelAutocomplete } from '../../hooks/mobile/useModelAutocomplete';
import { useStates, useCities, useLocalities } from '@shared/hooks/useLocationData';

type AddMobileDetailsScreenNavigationProp = NativeStackNavigationProp<
  SellMobileStackParamList,
  'AddMobileDetails'
>;

const AddMobileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddMobileDetailsScreenNavigationProp>();
  const { sellerId } = useAuth();

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    touchField,
    validateForm,
  } = useFormState<MobileDetailsFormValues>({
    initialValues: getDefaultMobileDetailsValues(),
    schema: mobileDetailsSchema,
  });

  const [loading, setLoading] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [stateFocused, setStateFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [localityFocused, setLocalityFocused] = useState(false);

  const { brands, loading: brandsLoading, fetchBrands } = useBrandAutocomplete();
  const { models, loading: modelsLoading, fetchModels } = useModelAutocomplete(selectedBrandId);

  // Location hooks
  const { states, loading: statesLoading } = useStates();
  const { cities, loading: citiesLoading } = useCities(values.state || '', stateFocused || !!values.state);
  const { localities, loading: localitiesLoading } = useLocalities(
    values.state || '',
    values.city || '',
    cityFocused || !!(values.state && values.city)
  );


  const yearOptions = useMemo<BottomSheetPickerOption<string>[]>(() => {
    const years: BottomSheetPickerOption<string>[] = [];
    for (let year = CURRENT_YEAR; year >= MIN_MOBILE_YEAR; year -= 1) {
      const value = year.toString();
      years.push({ label: value, value });
    }
    return years;
  }, []);

  const colorOptions = useMemo<BottomSheetPickerOption<string>[]>(() => [
    { label: 'Midnight Black', value: 'Midnight Black' },
    { label: 'Starlight White', value: 'Starlight White' },
    { label: 'Space Gray', value: 'Space Gray' },
    { label: 'Sierra Blue', value: 'Sierra Blue' },
    { label: 'Deep Purple', value: 'Deep Purple' },
    { label: 'Alpine Green', value: 'Alpine Green' },
    { label: 'Phantom Black', value: 'Phantom Black' },
    { label: 'Phantom Silver', value: 'Phantom Silver' },
    { label: 'Mystic Bronze', value: 'Mystic Bronze' },
    { label: 'Cloud Blue', value: 'Cloud Blue' },
    { label: 'Rose Gold', value: 'Rose Gold' },
    { label: 'Graphite', value: 'Graphite' },
    { label: 'Gold', value: 'Gold' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Product Red', value: 'Product Red' },
    { label: 'Other', value: 'OTHER' },
  ], []);

  const fieldConfig = useMemo(
    () =>
      getMobileDetailsFieldConfig({
        onOpenYearPicker: () => setYearPickerVisible(true),
        onOpenColorPicker: () => setColorPickerVisible(true),
      }),
    [],
  );

  const renderField = (config: FormFieldConfig<MobileDetailsFormValues>, fieldIndex: number) => {
    const field = config.field;
    const value = values[field];
    const error = touched[field] ? errors[field] : undefined;
    const labelAccessory = config.getLabelAccessory?.({ values });

    // Calculate z-index based on field position (reverse order so top fields have higher z-index)
    // Use much higher values to ensure dropdown lists appear above everything
    const baseZIndex = (fieldConfig.length - fieldIndex) * 100;

    switch (config.component) {
      case 'text': {
        const formattedValue = value == null ? '' : String(value);
        return (
          <TextField
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue =
                config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as MobileDetailsFormValues[typeof field], {
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
      case 'textarea': {
        const formattedValue = value == null ? '' : String(value);
        return (
          <Textarea
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue =
                config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as MobileDetailsFormValues[typeof field], {
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
        let data: DropdownOption<any>[] = props.data ?? [];
        let isDisabled = false;

        // Handle dynamic brand/model dropdowns
        if (field === 'brand') {
          data = brands.map(b => ({ label: b.name, value: b.name }));
          isDisabled = brandsLoading;
        } else if (field === 'model') {
          data = models.map(m => ({ label: m.name, value: m.name }));
          isDisabled = !selectedBrandId || modelsLoading;
        }

        const { placeholder, data: _unused, ...restProps } = props;

        return (
          <View
            key={String(field)}
            style={{
              zIndex: baseZIndex,
              elevation: baseZIndex,
            }}
          >
            <DropdownField
              label={config.label}
              data={data}
              value={value as any}
              onChange={(item) => {
                touchField(field);
                setFieldValue(field, item.value, { validate: true });

                // Handle brand selection
                if (field === 'brand') {
                  const selectedBrand = brands.find(b => b.name === item.value);
                  setSelectedBrandId(selectedBrand?.brandId || null);
                  setFieldValue('model', '', { validate: false });
                  setFieldValue('modelId', undefined, { validate: false });
                } else if (field === 'model') {
                  // Handle model selection - store the modelId
                  const selectedModel = models.find(m => m.name === item.value);
                  if (selectedModel) {
                    setFieldValue('modelId', selectedModel.modelId, { validate: false });
                  }
                }
              }}
              onFocus={field === 'brand' ? fetchBrands : field === 'model' ? fetchModels : undefined}
              required={config.required}
              error={error}
              placeholder={placeholder}
              disabled={isDisabled}
              search={false}
              {...restProps}
            />
          </View>
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
        const isStateField = field === 'state';
        const isCityField = field === 'city';
        const isLocalityField = field === 'address';

        let options: string[] = [];
        let autocompleteLoading = false;

        if (isStateField) {
          options = states;
          autocompleteLoading = statesLoading;
        } else if (isCityField) {
          options = cities;
          autocompleteLoading = citiesLoading;
        } else if (isLocalityField) {
          options = localities;
          autocompleteLoading = localitiesLoading;
        }

        const zIndex = isStateField ? 997 : isCityField ? 996 : 995;

        return (
          <View key={String(field)} style={{ zIndex }}>
            <AutocompleteField
              label={config.label}
              value={formattedValue}
              onChangeText={(text) => {
                setFieldValue(field, text, { validate: Boolean(touched[field]) });
                if (isStateField && text !== values.state) {
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
                if (isStateField) {
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
                if (isStateField) {
                  setStateFocused(true);
                } else if (isCityField) {
                  setCityFocused(true);
                } else if (isLocalityField) {
                  setLocalityFocused(true);
                }
              }}
              onBlur={() => {
                handleBlur(field);
                if (isStateField) {
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
      const payload = toMobileCreateDTO(values, Number(sellerId));
      const response = await addMobile(payload);
      const normalized = normalizeCreateResponse(response, 'mobile');

      if (!normalized.success || normalized.id === null) {
        Alert.alert('Failed', normalized.rawMessage || 'Something went wrong');
        return;
      }

      Alert.alert('Success', normalized.message);
      navigation.navigate('SelectPhoto', { mobileId: normalized.id });
    } catch (error: any) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to add mobile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SellFlowLayout
        title="Mobile Details"
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
        scrollProps={{
          nestedScrollEnabled: true,
        }}
      >
        {fieldConfig.map((config, index) => renderField(config, index))}
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
                'Please enter your mobile color',
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
          }
        }}
        onClose={() => setColorPickerVisible(false)}
      />
    </>
  );
};

export default AddMobileDetailsScreen;
