import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import StatusBadge from './StatusBadge';

const CAT_ICONS = {
  'Engenharia de Software': 'code-slash',
  'Redes': 'globe',
  'Mobile': 'phone-portrait',
  'Banco de Dados': 'server',
  'Inteligência Artificial': 'hardware-chip',
  'Sistemas Operacionais': 'desktop',
  'Programação': 'terminal',
  'Gestão': 'people',
};

export default function BookCard({ livro }) {
  const router = useRouter();
  const catIcon = CAT_ICONS[livro.categoria] || 'book';
  const { width: screenWidth } = Dimensions.get('window');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/livro/${livro.id}`)}
    >
      <View style={styles.coverWrap}>
        <Image source={{ uri: livro.capa }} style={[styles.cover, { width: Math.min(90, screenWidth * 0.22), height: Math.min(130, screenWidth * 0.32) }]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{livro.titulo}</Text>
        <Text style={styles.author} numberOfLines={1}>{livro.autor}</Text>
        <View style={styles.catRow}>
          <Ionicons name={catIcon} size={12} color={Colors.primary} />
          <Text style={styles.category}>{livro.categoria}</Text>
        </View>
        <View style={styles.footer}>
          <StatusBadge status={livro.status} />
          {livro.ano && <Text style={styles.year}>{livro.ano}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  coverWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cover: {
    backgroundColor: Colors.mediumGray,
  },
  info: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  author: {
    fontSize: 15,
    color: Colors.lightGray,
    fontWeight: '600',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  year: {
    fontSize: 13,
    color: Colors.mediumGray,
    fontWeight: '700',
  },
});
