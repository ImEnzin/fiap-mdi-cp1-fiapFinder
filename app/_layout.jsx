import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { LivrosProvider } from '../context/LivrosContext';
import { ItensProvider } from '../context/ItensContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LivrosProvider>
        <ItensProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="livro/[id]" />
            <Stack.Screen name="item/[id]" />
          </Stack>
        </ItensProvider>
      </LivrosProvider>
    </AuthProvider>
  );
}
