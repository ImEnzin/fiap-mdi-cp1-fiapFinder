import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';

const CAT_COLORS = {
  encontrado: { border: Colors.info },
  solicitado: { border: Colors.primary },
  retirado: { border: Colors.success },
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
          <Ionicons name="location" size={13} color={Colors.primary} />
          <Text style={styles.location} numberOfLines={1}>{item.localEncontrado}</Text>
        </View>
        
        <View style={styles.row}>
          <Ionicons name="calendar" size={13} color="#888" />
          <Text style={styles.date}>{formatDate(item.dataEncontrado)}</Text>
        </View>
        
        <View style={styles.row}>
          <Ionicons name="folder" size={13} color="#888" />
          <Text style={styles.catText}>{item.categoria}</Text>
        </View>

        <View style={{ marginTop: 4, alignSelf: 'flex-start' }}>
          <StatusBadge status={item.status} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.darkGray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkGray, 
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', 
    alignItems: 'center'
  },
  imgWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: '#222',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white, 
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    fontSize: 12,
    color: '#AAA', 
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#777',
  },
  catText: {
    fontSize: 12,
    color: '#777',
  },
});