import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  disponivel: { label: 'Disponível', color: Colors.success },
  reservado: { label: 'Reservado', color: Colors.primary },
  emprestado: { label: 'Emprestado', color: Colors.info },
  atrasado: { label: 'Atrasado', color: Colors.error },
  encontrado: { label: 'Encontrado', color: Colors.info },
  solicitado: { label: 'Solicitado', color: Colors.primary },
  retirado: { label: 'Retirado', color: Colors.success },
};

export default function StatusBadge({ status }) {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status] || { label: status, color: theme.subText };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.mode === 'dark' ? `${config.color}22` : theme.cardAlt,
          borderColor: `${config.color}30`,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]} numberOfLines={1}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
