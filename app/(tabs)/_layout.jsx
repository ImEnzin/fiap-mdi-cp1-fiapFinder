import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

const PERFIL_ACCENT = {
  aluno: '#1976D2',
  professor: '#7B1FA2',
  atendente: '#E65100',
};

export default function TabsLayout() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  const accent = PERFIL_ACCENT[usuario?.perfil] || Colors.primary;
  const isAtendente = usuario?.perfil === 'atendente';

  return (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: accent,
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
