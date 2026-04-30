import React, { useRef, useState } from 'react';

// Ajuste simples para republicar a versao completa.
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'library',
    title: 'Biblioteca FIAP',
    subtitle: 'Consulte o acervo, filtre por status ou categoria e reserve livros disponiveis em poucos toques.',
    color: Colors.primary,
    bg: 'rgba(255,0,85,0.08)',
    features: ['Busca em tempo real', 'Filtros por disponibilidade', 'Reserva com confirmacao visual'],
  },
  {
    id: '2',
    icon: 'search',
    title: 'Achados e Perdidos',
    subtitle: 'Registre itens encontrados, pesquise por categoria e acompanhe solicitacoes de retirada.',
    color: '#FF6B35',
    bg: 'rgba(255,107,53,0.08)',
    features: ['Registro de itens encontrados', 'Filtro por status e categoria', 'Identificacao de itens reportados por voce'],
  },
  {
    id: '3',
    icon: 'bookmark',
    title: 'Reservas e Prazos',
    subtitle: 'Acompanhe livros reservados, retirados, renovados e atrasados em uma area separada.',
    color: Colors.info,
    bg: 'rgba(33,150,243,0.08)',
    features: ['Limite por perfil', 'Renovacao controlada', 'Prazos e devolucoes visiveis'],
  },
  {
    id: '4',
    icon: 'person-circle',
    title: 'Perfis e Aprovacao',
    subtitle: 'Aluno, professor e atendente enxergam fluxos diferentes, com aprovacao para novas contas.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    features: ['Cadastro pendente ate aprovacao', 'Dashboard do atendente', 'Historico de acoes do sistema'],
  },
  {
    id: '5',
    icon: 'moon',
    title: 'Modo Escuro',
    subtitle: 'Alterne entre modo claro e escuro pelo perfil, mantendo a preferencia salva no app.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    features: ['Tema persistido', 'Contraste ajustado', 'Cards, textos e abas tematizados'],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const finish = async () => {
    await AsyncStorage.setItem('@onboarding_done', 'true');
    router.replace('/login');
  };

  const next = () => {
    if (current < SLIDES.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        slideAnim.setValue(30);
        setCurrent((c) => c + 1);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();
      });
    } else {
      finish();
    }
  };

  const slide = SLIDES[current];

  return (
    <View style={styles.container}>
      {current < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skip} onPress={finish}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.slideWrapper,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={[styles.iconArea, { backgroundColor: slide.bg }]}>
          <View style={[styles.iconCircle, { backgroundColor: slide.color }]}>
            <Ionicons name={slide.icon} size={52} color="#FFF" />
          </View>
        </View>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

        <View style={styles.features}>
          {slide.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: slide.color }]} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === current ? 24 : 8,
                opacity: i === current ? 1 : 0.3,
                backgroundColor: slide.color,
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: slide.color }]} onPress={next} activeOpacity={0.85}>
        <Text style={styles.btnText}>{current < SLIDES.length - 1 ? 'Proximo' : 'Comecar'}</Text>
        <Ionicons name={current < SLIDES.length - 1 ? 'arrow-forward' : 'checkmark'} size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' },
  skip: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  skipText: { color: '#888', fontSize: 14, fontWeight: '700' },
  slideWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconArea: {
    width: 160, height: 160, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  iconCircle: {
    width: 110, height: 110, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  slideTitle: {
    fontSize: 28, fontWeight: '900', color: '#FFF',
    textAlign: 'center', marginBottom: 14,
  },
  slideSubtitle: {
    fontSize: 15, color: '#AAA', textAlign: 'center',
    lineHeight: 24, marginBottom: 28,
  },
  features: { width: '100%', gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { color: '#DDD', fontSize: 14, fontWeight: '600', flex: 1 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { height: 8, borderRadius: 4 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 30, marginBottom: 50, width: width - 60,
    justifyContent: 'center', borderRadius: 18, paddingVertical: 17,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
