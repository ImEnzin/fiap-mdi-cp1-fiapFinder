import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ icon, message }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.mode === 'dark' ? theme.cardAlt : theme.cardAlt,
            borderColor: theme.border,
          },
        ]}
      >
        <Ionicons name={icon || 'alert-circle-outline'} size={38} color={Colors.primary} />
      </View>

      <Text style={[styles.message, { color: theme.text }]}>
        {message || 'Nenhum item encontrado.'}
      </Text>

      <Text style={[styles.helper, { color: theme.subText }]}>
        Tente ajustar a busca ou os filtros para encontrar resultados.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
  },
  helper: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
