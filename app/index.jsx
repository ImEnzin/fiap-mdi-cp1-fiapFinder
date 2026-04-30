import React, { useEffect, useState } from 'react';

// Ajuste simples para republicar a versao completa.
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/colors';

export default function RootIndex() {
  const router = useRouter();
  const { loading, isAuthenticated, usuario } = useAuth();
  const { theme } = useTheme();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;

    const resolveRoute = async () => {
      try {
        if (loading) return;

        const onboarded = (await AsyncStorage.getItem('@onboarding_done')) === 'true';

        if (!mounted) return;

        if (!onboarded) {
          router.replace('/onboarding');
          return;
        }

        if (!isAuthenticated) {
          router.replace('/login');
          return;
        }

        if (usuario?.aprovado === false && usuario?.perfil !== 'atendente') {
          router.replace('/aguardando');
          return;
        }

        router.replace('/(tabs)');
      } finally {
        if (mounted) setBooting(false);
      }
    };

    resolveRoute();

    return () => {
      mounted = false;
    };
  }, [loading, isAuthenticated, usuario, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          {booting ? 'Abrindo o app...' : 'Redirecionando...'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>
          Preparando sua experiência.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
