import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function PrimaryButton({ title, onPress, loading, disabled, style }) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: isDisabled ? Colors.mediumGray : Colors.primary },
        isDisabled && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={styles.text} numberOfLines={1}>
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  btnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
