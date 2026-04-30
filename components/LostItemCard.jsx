import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

const STATUS_ACCENT = {
  encontrado: Colors.info,
  solicitado: Colors.primary,
  retirado: Colors.success,
};

export default function LostItemCard({ item }) {
  const router = useRouter();
  const { theme } = useTheme();
  const accent = STATUS_ACCENT[item.status] || Colors.info;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.mode === 'dark' ? '#000' : '#111827',
        },
      ]}
      activeOpacity={0.88}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={[styles.imgWrap, { backgroundColor: theme.cardAlt }]}>
        <Image source={{ uri: item.imagem }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
            {item.nome}
          </Text>

          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={accent} />
          <Text style={[styles.location, { color: theme.subText }]} numberOfLines={1}>
            {item.localEncontrado}
          </Text>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.subText }]} numberOfLines={1}>
              {formatDate(item.dataEncontrado)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={13} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.subText }]} numberOfLines={1}>
              {item.categoria}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <StatusBadge status={item.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  imgWrap: {
    width: 82,
    height: 82,
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: 2,
    alignItems: 'flex-start',
  },
});
