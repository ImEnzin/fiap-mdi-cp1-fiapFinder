import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function LoadingState({ message }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.message, { color: theme.text }]}>
          {message || 'Carregando...'}
        </Text>
        <Text style={[styles.helper, { color: theme.subText }]}>
          Só um instante, estamos preparando tudo para você.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  message: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  helper: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
