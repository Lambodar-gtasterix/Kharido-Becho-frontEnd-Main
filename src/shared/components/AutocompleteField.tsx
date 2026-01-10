import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
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
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<View>(null);

  const handleSelect = useCallback((option: string) => {
    onSelect(option);
    setShowSuggestions(false);
  }, [onSelect]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
    onBlur();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownLayout({ top: y + height, left: x, width });
    });
    setShowSuggestions(true);
    onFocus?.();
  }, [onFocus]);

  const handleChangeText = useCallback((text: string) => {
    const upperText = text.toUpperCase();
    onChangeText(upperText);
    if (!showSuggestions) {
      containerRef.current?.measureInWindow((x, y, width, height) => {
        setDropdownLayout({ top: y + height, left: x, width });
      });
    }
    setShowSuggestions(true);
  }, [onChangeText, showSuggestions]);

  const shouldShowDropdown = showSuggestions && (showOnFocus || value.length > 0);
  const hasContent = loading || options.length > 0;

  return (
    <>
      <View style={styles.container} ref={containerRef}>
        <TextField
          label={label}
          value={value}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          error={error}
          required={required}
          placeholder={placeholder}
          editable={!disabled}
          autoCapitalize="characters"
        />
      </View>

      <Modal
        visible={shouldShowDropdown && hasContent}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSuggestions(false)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdown,
                  {
                    top: dropdownLayout.top,
                    left: dropdownLayout.left,
                    width: dropdownLayout.width,
                  },
                  options.length <= 5 && styles.dropdownSmall,
                ]}
              >
                {loading && options.length === 0 ? (
                  <View style={styles.loadingInDropdown}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={options}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={[styles.option, index === options.length - 1 && styles.lastOption]}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    style={styles.flatList}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    maxHeight: 250,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: 4,
  },
  dropdownSmall: {
    maxHeight: 200,
  },
  flatList: {
    flexGrow: 0,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
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
