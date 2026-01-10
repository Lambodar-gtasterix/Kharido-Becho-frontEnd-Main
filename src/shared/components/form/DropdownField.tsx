// src/components/form/DropdownField.tsx
import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import FormField from './FormField';
import { colors, radii, spacing } from '../../../theme/tokens';

export interface DropdownOption<TValue = any> {
  label: string;
  value: TValue;
}

interface DropdownFieldProps<TValue = any> {
  label: string;
  data: Array<DropdownOption<TValue>>;
  value: TValue | null;
  onChange: (item: DropdownOption<TValue>) => void;
  onFocus?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  search?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
}

const DropdownField = <TValue,>({
  label,
  data,
  value,
  onChange,
  onFocus,
  placeholder,
  required = false,
  error,
  disabled = false,
  search = false,
  containerStyle,
  dropdownStyle,
}: DropdownFieldProps<TValue>) => {
  const handleFocus = () => {
    onFocus?.();
  };

  return (
    <FormField label={label} required={required} error={error} containerStyle={containerStyle}>
      <Dropdown
        style={[
          styles.dropdownContainer,
          error && styles.dropdownError,
          disabled && styles.dropdownDisabled,
          dropdownStyle,
        ]}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        inputSearchStyle={search ? styles.inputSearchStyle : undefined}
        iconStyle={styles.iconStyle}
        data={data}
        search={search}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
        searchPlaceholder={search ? "Search..." : undefined}
        value={value as any}
        onChange={(item) => onChange(item as DropdownOption<TValue>)}
        onFocus={handleFocus}
        disable={disabled}
        containerStyle={styles.dropdownListContainer}
        itemTextStyle={styles.itemText}
        activeColor={colors.bgSecondary || '#F3F4F6'}
        autoScroll={false}
        dropdownPosition="auto"
        showsVerticalScrollIndicator={true}
      />
    </FormField>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  dropdownError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  dropdownDisabled: {
    backgroundColor: colors.bgSecondary || '#F3F4F6',
    opacity: 0.6,
  },
  placeholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
  selectedText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownListContainer: {
    borderRadius: radii.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 9999,
    zIndex: 9999,
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});

export default DropdownField;
