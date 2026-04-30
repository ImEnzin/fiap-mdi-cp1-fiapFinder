import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { theme } = useTheme();
  const hasValue = Boolean(value && value.trim());

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.input,
          borderColor: hasValue ? Colors.primary : theme.inputBorder,
        },
      ]}
    >
      <Ionicons name="search" size={19} color={hasValue ? Colors.primary : theme.icon} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Buscar...'}
        placeholderTextColor={theme.placeholder}
        selectionColor={Colors.primary}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {hasValue ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color={theme.icon} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    marginLeft: 8,
  },
});
