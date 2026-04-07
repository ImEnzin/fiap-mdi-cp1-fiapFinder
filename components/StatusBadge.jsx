import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

const STATUS_CONFIG = {
  disponivel: { label: 'Disponível', bg: '#E8F5E9', color: Colors.success },
  reservado: { label: 'Reservado', bg: '#FFF3E0', color: '#F57C00' },
  emprestado: { label: 'Emprestado', bg: '#E3F2FD', color: Colors.info },
  atrasado: { label: 'Atrasado', bg: '#FFEBEE', color: Colors.error },
  encontrado: { label: 'Encontrado', bg: '#E3F2FD', color: Colors.info },
  solicitado: { label: 'Solicitado', bg: '#FFF3E0', color: '#F57C00' },
  retirado: { label: 'Retirado', bg: '#E8F5E9', color: Colors.success },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: Colors.lightGray, color: Colors.mediumGray };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
