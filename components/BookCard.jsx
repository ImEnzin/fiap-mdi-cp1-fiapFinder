import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import StatusBadge from './StatusBadge';
import { useFavoritos } from '../context/FavoritosContext';
import { useTheme } from '../context/ThemeContext';

const CAT_ICONS = {
  'Engenharia de Software': 'code-slash',
  Redes: 'globe',
  Mobile: 'phone-portrait',
  'Banco de Dados': 'server',
  'Inteligência Artificial': 'hardware-chip',
  'Sistemas Operacionais': 'desktop',
  Programação: 'terminal',
  Gestão: 'people',
};

export default function BookCard({ livro }) {
  const router = useRouter();
  const { isFavorito, toggleFavorito } = useFavoritos();
  const { theme } = useTheme();
  const catIcon = CAT_ICONS[livro.categoria] || 'book';
  const { width: screenWidth } = Dimensions.get('window');
  const favorito = isFavorito(livro.id);

  const coverSize = {
    width: Math.min(92, screenWidth * 0.24),
    height: Math.min(132, screenWidth * 0.34),
  };

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
      onPress={() => router.push(`/livro/${livro.id}`)}
    >
      <View style={[styles.coverWrap, { backgroundColor: theme.cardAlt }]}>
        <Image
          source={{ uri: livro.capa }}
          style={[styles.cover, coverSize]}
          resizeMode="cover"
        />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
              {livro.titulo}
            </Text>
            <Text style={[styles.author, { color: theme.subText }]} numberOfLines={1}>
              {livro.autor}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleFavorito(livro.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.heartBtn,
              {
                backgroundColor: favorito ? `${Colors.primary}18` : theme.cardAlt,
                borderColor: favorito ? `${Colors.primary}28` : theme.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            activeOpacity={0.8}
          >
            <Ionicons
              name={favorito ? 'heart' : 'heart-outline'}
              size={18}
              color={favorito ? Colors.primary : theme.subText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.categoryRow}>
            <Ionicons name={catIcon} size={12} color={Colors.primary} />
            <Text style={[styles.category, { color: theme.subText }]} numberOfLines={1}>
              {livro.categoria}
            </Text>
          </View>

          {livro.ano ? (
            <View style={[styles.yearPill, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
              <Text style={[styles.year, { color: theme.text }]}>{livro.ano}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <StatusBadge status={livro.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  coverWrap: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cover: {
    borderRadius: 18,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    minHeight: 132,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  categoryRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
  },
  yearPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  year: {
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
});
