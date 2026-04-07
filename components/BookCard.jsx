import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
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

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/livro/${livro.id}`)}
    >
      <View style={styles.coverWrap}>
        <Image source={{ uri: livro.capa }} style={styles.cover} />
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
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  coverWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cover: {
    width: 85,
    height: 120,
    backgroundColor: Colors.lightGray,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    gap: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.2,
  },
  author: {
    fontSize: 13,
    color: '#888',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  category: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  year: {
    fontSize: 11,
    color: '#BBB',
    fontWeight: '600',
  },
});
