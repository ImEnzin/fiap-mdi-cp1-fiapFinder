import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function SecondaryButton({ title, onPress, loading, disabled, style }) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.btn, isDisabled && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary} size="small" />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnDisabled: {
    borderColor: Colors.mediumGray,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  text: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  textDisabled: {
    color: Colors.mediumGray,
  },
});
