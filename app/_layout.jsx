import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LivrosProvider } from '../context/LivrosContext';
import { ItensProvider } from '../context/ItensContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { FavoritosProvider } from '../context/FavoritosContext';
import Colors from '../constants/colors';

function ProtectedStack() {
  const { loading, isAuthenticated, usuario } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const route = async () => {
      const val = await AsyncStorage.getItem('@onboarding_done');
      const done = val === 'true';
      const current = segments[0];

      if (!done) {
        if (current !== 'onboarding') router.replace('/onboarding');
      } else if (!isAuthenticated) {
        if (current !== 'login' && current !== 'cadastro') router.replace('/login');
      } else if (usuario?.aprovado === false && usuario?.perfil !== 'atendente') {
        if (current !== 'aguardando') router.replace('/aguardando');
      } else {
        if (current === 'login' || current === 'onboarding' || current === 'aguardando') {
          router.replace('/(tabs)');
        }
      }

      setInitialized(true);
    };

    route();
  }, [loading, isAuthenticated, usuario, segments]);

  if (loading || !initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="aguardando" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="livro/[id]" />
      <Stack.Screen name="item/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LivrosProvider>
          <ItensProvider>
            <FavoritosProvider>
              <ToastProvider>
                <ProtectedStack />
              </ToastProvider>
            </FavoritosProvider>
          </ItensProvider>
        </LivrosProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

