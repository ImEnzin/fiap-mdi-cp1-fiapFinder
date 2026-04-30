import React, { useEffect, useRef, useState } from 'react';

// Ajuste simples para republicar a versao completa.
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Colors from '../../constants/colors';

// Mantivemos a lógica de perfil, mas agora o accent é fixo no Magenta
export default function TabsLayout() {
  const { usuario, getPendentes, pendentesVersion } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const jaAvisouPendentes = useRef(false);
  const [pendentesCount, setPendentesCount] = useState(0);


  // DEFINIÇÃO DO MAGENTA: APENAS ALTERAÇÃO VISUAL
  const accent = Colors.primary; 
  const isAtendente = usuario?.perfil === 'atendente';

  useEffect(() => {
    if (!isAtendente) {
      setPendentesCount(0);
      return;
    }

    let ativo = true;
    const avisarPendentes = async () => {
      const list = await getPendentes();
      if (!ativo) return;

      setPendentesCount(list.length);
      if (list.length === 0 || jaAvisouPendentes.current) return;

      jaAvisouPendentes.current = true;
      const plural = list.length > 1;
      showToast(
        `Você tem ${list.length} aprovação${plural ? 'es' : ''} pendente${plural ? 's' : ''} para revisar.`,
        'warning',
        4500
      );
    };

    avisarPendentes();
    return () => {
      ativo = false;
    };
  }, [isAtendente, pendentesVersion, usuario?.email]);
  // LÓGICA DE LOGIN: MANTIDA
  if (!usuario) {
    return <Redirect href="/login" />;
  }

  if (usuario.aprovado === false && usuario.perfil !== 'atendente') {
    return <Redirect href="/aguardando" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent, // Aplica o Magenta no ícone ativo
        tabBarInactiveTintColor: theme.mode === 'dark' ? '#BDBDBD' : '#999999',
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
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
        name="aprovacoes"
        options={{
          title: 'Aprovações',
          href: isAtendente ? undefined : null,
          tabBarBadge: pendentesCount > 0 ? pendentesCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.warning,
            color: '#FFF',
            fontSize: 10,
            fontWeight: '900',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
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
