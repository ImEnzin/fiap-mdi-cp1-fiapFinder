import React, { useCallback, useEffect, useState } from 'react';

// Ajuste simples para republicar a versao completa.
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

function getInitials(nome) {
  if (!nome) return '?';
  return nome.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Aprovacoes() {
  const { usuario, getPendentes, aprovarUsuario, rejeitarUsuario } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [pendentes, setPendentes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isAtendente = usuario?.perfil === 'atendente';

  const fetchPendentes = useCallback(async () => {
    if (!isAtendente) return;
    const list = await getPendentes();
    setPendentes(list);
  }, [getPendentes, isAtendente]);

  useEffect(() => {
    fetchPendentes();
  }, [fetchPendentes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendentes();
    setRefreshing(false);
  };

  const handleAprovar = async (email) => {
    await aprovarUsuario(email);
    showToast(`Conta de ${email} aprovada!`, 'success');
    fetchPendentes();
  };

  const handleRejeitar = (email) => {
    Alert.alert('Rejeitar conta', `Rejeitar e remover a conta de ${email}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rejeitar',
        style: 'destructive',
        onPress: async () => {
          await rejeitarUsuario(email);
          showToast(`Conta de ${email} rejeitada.`, 'warning');
          fetchPendentes();
        },
      },
    ]);
  };

  if (!isAtendente) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header title="Aprovações" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIcon}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <View style={styles.summaryText}>
              <Text style={[styles.summaryLabel, { color: theme.subText }]}>Contas aguardando revisão</Text>
              <Text style={[styles.summaryNumber, { color: theme.text }]}>{pendentes.length}</Text>
            </View>
          </View>
          <Text style={[styles.summaryHelp, { color: theme.subText }]}>
            Aprove apenas cadastros identificados. Contas pendentes continuam bloqueadas até a liberação.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Solicitações recentes</Text>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}
            onPress={handleRefresh}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={17} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {pendentes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.cardAlt }]}>
              <Ionicons name="checkmark-done" size={28} color={Colors.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhuma aprovação pendente</Text>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              Quando novos alunos ou professores criarem conta, eles aparecerão aqui.
            </Text>
          </View>
        ) : (
          pendentes.map((p) => (
            <View key={p.email} style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.userTop}>
                <View style={styles.userMain}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(p.nome)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{p.nome}</Text>
                    <Text style={[styles.userEmail, { color: theme.subText }]} numberOfLines={1}>{p.email}</Text>
                  </View>
                </View>
                <View style={styles.statusPill}>
                  <Ionicons name="time" size={13} color={Colors.warning} />
                  <Text style={styles.statusText}>Pendente</Text>
                </View>
              </View>

              <View style={[styles.detailsBox, { backgroundColor: theme.cardAlt }]}>
                <View style={styles.detailItem}>
                  <Ionicons name="id-card-outline" size={16} color={theme.subText} />
                  <Text style={[styles.detailText, { color: theme.subText }]}>RM {p.rm || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="school-outline" size={16} color={theme.subText} />
                  <Text style={[styles.detailText, { color: theme.subText }]}>{p.sala || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={16} color={theme.subText} />
                  <Text style={[styles.detailText, { color: theme.subText }]}>{p.tipo || p.perfil || '-'}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleRejeitar(p.email)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close" size={16} color="#FFF" />
                  <Text style={styles.actionText}>Rejeitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleAprovar(p.email)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.actionText}>Aprovar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  summaryCard: { borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 22 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  summaryIcon: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,0,85,0.12)' },
  summaryText: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  summaryNumber: { fontSize: 34, fontWeight: '900', marginTop: 2 },
  summaryHelp: { fontSize: 13, lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  refreshBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { borderWidth: 1, borderRadius: 18, padding: 24, alignItems: 'center' },
  emptyIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  emptyText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  userCard: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 12 },
  userTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  userMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 15, fontWeight: '900' },
  userEmail: { fontSize: 12, marginTop: 3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,152,0,0.12)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { color: Colors.warning, fontSize: 11, fontWeight: '800' },
  detailsBox: { borderRadius: 14, padding: 12, gap: 8, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 11 },
  approveBtn: { backgroundColor: Colors.success },
  rejectBtn: { backgroundColor: Colors.error },
  actionText: { color: '#FFF', fontSize: 13, fontWeight: '900' },
});
