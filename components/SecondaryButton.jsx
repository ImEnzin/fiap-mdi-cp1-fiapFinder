import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function SecondaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary} size="small" />
      ) : (
        <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  btnDisabled: {
    borderColor: Colors.mediumGray,
  },
  text: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  textDisabled: {
    color: Colors.mediumGray,
  },
});
