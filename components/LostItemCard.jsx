import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';

const CAT_COLORS = {
  encontrado: { bg: '#E3F2FD', border: '#1976D2' },
  solicitado: { bg: '#FFF3E0', border: '#F57C00' },
  retirado: { bg: '#E8F5E9', border: '#28A745' },
};

export default function LostItemCard({ item }) {
  const router = useRouter();
  const colors = CAT_COLORS[item.status] || CAT_COLORS.encontrado;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={styles.imgWrap}>
        <Image source={{ uri: item.imagem }} style={styles.image} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.nome}</Text>
        <View style={styles.row}>
          <Ionicons name="location" size={13} color="#E65100" />
          <Text style={styles.location} numberOfLines={1}>{item.localEncontrado}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar" size={13} color="#999" />
          <Text style={styles.date}>{formatDate(item.dataEncontrado)}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="folder" size={13} color="#999" />
          <Text style={styles.catText}>{item.categoria}</Text>
        </View>
        <StatusBadge status={item.status} />
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
    borderLeftWidth: 4,
  },
  imgWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: Colors.lightGray,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  catText: {
    fontSize: 12,
    color: '#999',
  },
});
