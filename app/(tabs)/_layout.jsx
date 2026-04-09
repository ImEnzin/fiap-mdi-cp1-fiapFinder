import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

// Mantivemos a lógica de perfil, mas agora o accent é fixo no Magenta
export default function TabsLayout() {
  const { usuario } = useAuth();

  // LÓGICA DE LOGIN: MANTIDA
  if (!usuario) {
    return <Redirect href="/login" />;
  }

  // DEFINIÇÃO DO MAGENTA: APENAS ALTERAÇÃO VISUAL
  const accent = Colors.primary; 
  const isAtendente = usuario?.perfil === 'atendente';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent, // Aplica o Magenta no ícone ativo
        tabBarInactiveTintColor: '#BDBDBD',
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      {/* LÓGICA DE NOMES E ÍCONES POR PERFIL: MANTIDA INTEGRALMENTE */}
      <Tabs.Screen
        name="index"
        options={{
          title: isAtendente ? 'Dashboard' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isAtendente ? 'grid' : 'home'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="biblioteca"
        options={{
          title: isAtendente ? 'Acervo' : 'Biblioteca',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isAtendente ? 'library' : 'book'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achados"
        options={{
          title: isAtendente ? 'Itens' : 'Achados',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isAtendente ? 'cube' : 'search'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: isAtendente ? 'Empréstimos' : 'Reservas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isAtendente ? 'swap-horizontal' : 'bookmark'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: isAtendente ? 'Sistema' : 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isAtendente ? 'settings' : 'person'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}