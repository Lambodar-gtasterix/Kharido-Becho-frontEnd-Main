import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import TextField from './form/TextField';
import { colors, spacing } from '@theme/tokens';

interface AutocompleteFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (value: string) => void;
  onBlur: () => void;
  onFocus?: () => void;
  options: string[];
  loading?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showOnFocus?: boolean;
}

export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  label,
  value,
  onChangeText,
  onSelect,
  onBlur,
  onFocus,
  options,
  loading,
  error,
  required,
  placeholder,
  disabled,
  showOnFocus = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = useCallback((option: string) => {
    onSelect(option);
    setShowSuggestions(false);
  }, [onSelect]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
    onBlur();
  }, [onBlur]);

  const shouldShowDropdown = showSuggestions && (loading || options.length > 0) && (showOnFocus || value.length > 0);

  return (
    <View style={styles.container}>
      <TextField
        label={label}
        value={value}
        onChangeText={(text) => {
          const upperText = text.toUpperCase();
          onChangeText(upperText);
          if (upperText.length > 0 || showOnFocus) {
            setShowSuggestions(true);
          }
        }}
        onBlur={handleBlur}
        onFocus={() => {
          if (showOnFocus || value.length > 0) {
            setShowSuggestions(true);
          }
          onFocus?.();
        }}
        error={error}
        required={required}
        placeholder={placeholder}
        editable={!disabled}
        autoCapitalize="characters"
      />

      {shouldShowDropdown && (
        <View style={styles.dropdown}>
          {loading && options.length === 0 ? (
            <View style={styles.loadingInDropdown}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {options.map((item, index) => (
                <TouchableOpacity
                  key={`${item}-${index}`}
                  style={[styles.option, index === options.length - 1 && styles.lastOption]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    maxHeight: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: 4,
  },
  list: {
    maxHeight: 200,
  },
  option: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  loadingInDropdown: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
