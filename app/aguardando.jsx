import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Aguardando() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Ícone */}
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,0,85,0.1)' }]}>
        <Ionicons name="time" size={52} color={Colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>Conta em Análise</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>
        Sua conta está aguardando aprovação de um{'\n'}atendente FIAP. O processo leva até 24h.
      </Text>

      {/* Card de informações */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.subText }]}>Dados cadastrados</Text>

        {[
          { icon: 'person-outline', label: 'Nome', value: usuario?.nome },
          { icon: 'mail-outline', label: 'E-mail', value: usuario?.email },
          { icon: 'id-card-outline', label: 'RM', value: usuario?.rm ? `${usuario.rm}` : '—' },
          { icon: 'school-outline', label: 'Turma', value: usuario?.sala || '—' },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <View style={[styles.infoIconBg, { backgroundColor: 'rgba(255,0,85,0.1)' }]}>
              <Ionicons name={item.icon} size={15} color={Colors.primary} />
            </View>
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoLabel, { color: theme.subText }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Dicas */}
      <View style={[styles.tipsCard, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
        <View style={styles.tipsHeader}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={[styles.tipsTitle, { color: theme.text }]}>O que acontece agora?</Text>
        </View>
        {[
          'Um atendente da biblioteca FIAP irá revisar seu cadastro.',
          'Você receberá liberação em até 24 horas úteis.',
          'Após aprovação, faça login novamente para acessar o sistema.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipBullet, { backgroundColor: Colors.primary }]}>
              <Text style={styles.tipNum}>{i + 1}</Text>
            </View>
            <Text style={[styles.tipText, { color: theme.subText }]}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Botão Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: Colors.error }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={Colors.error} />
        <Text style={[styles.logoutText]}>Sair e tentar depois</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', padding: 28, paddingTop: 80, paddingBottom: 50 },
  iconCircle: {
    width: 110, height: 110, borderRadius: 35,
    alignItems: 'center', justifyContent: 'center', marginBottom: 26,
  },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  card: { width: '100%', borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16, gap: 14 },
  cardTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconBg: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoTextGroup: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { fontSize: 14, fontWeight: '700', marginTop: 1 },
  tipsCard: { width: '100%', borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 28, gap: 14 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tipsTitle: { fontSize: 14, fontWeight: '800' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipBullet: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tipNum: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  tipText: { fontSize: 13, flex: 1, lineHeight: 20 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '700' },
});
