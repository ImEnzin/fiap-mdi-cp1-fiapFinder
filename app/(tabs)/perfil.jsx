import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useItens } from '../../context/ItensContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

const PERFIL_THEME = {
  aluno: { accent: Colors.primary, icon: 'school' },
  professor: { accent: Colors.primary, icon: 'briefcase' },
  atendente: { accent: Colors.primary, icon: 'shield-checkmark' },
};

function getInitials(nome) {
  if (!nome) return '?';
  return nome.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Perfil() {
  const router = useRouter();
  const { usuario, logout, getPendentes, aprovarUsuario, rejeitarUsuario } = useAuth();
  const { meusLivros } = useLivros();
  const { meusSolicitados } = useItens();
  const { theme, isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const theme_perfil = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendentes, setPendentes] = useState([]);
  const isAtendente = usuario?.perfil === 'atendente';

  const fetchPendentes = useCallback(async () => {
    if (!isAtendente) return;
    const list = await getPendentes();
    setPendentes(list);
  }, [isAtendente]);

  useEffect(() => { fetchPendentes(); }, [fetchPendentes]);

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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace('/login');
  };

  const handleThemeToggle = async () => {
    await toggleTheme();
    showToast(`Tema alterado para ${isDark ? 'modo claro' : 'modo escuro'}.`, 'info');
  };

  const handleResetDemo = () => {
    Alert.alert(
      'Resetar dados da demo',
      'Isso limpa usuários cadastrados, sessão, reservas, itens reportados, favoritos, tema e mensagens de primeiro acesso. Use para apresentar o app desde o cadastro inicial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            const keys = await AsyncStorage.getAllKeys();
            const firstAccessKeys = keys.filter((key) => key.startsWith('@first_access_seen:'));
            await AsyncStorage.multiRemove([
              '@user',
              '@users',
              '@livros',
              '@itens',
              '@favoritos',
              '@theme',
              '@history',
              ...firstAccessKeys,
            ]);
            showToast('Dados da demo limpos. Faça login novamente.', 'success');
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const infoItems = [
    { icon: 'person-outline', label: 'Nome', value: usuario?.nome || 'Carlos Silva' },
    { icon: 'school-outline', label: 'Tipo', value: usuario?.tipo || 'Aluno' },
    { icon: 'book-outline', label: 'Curso', value: usuario?.curso || 'Engenharia de Software' },
    { icon: 'id-card-outline', label: 'RM', value: usuario?.rm || '550123' },
    { icon: 'mail-outline', label: 'Email', value: usuario?.email || 'aluno@fiap.com.br' },
    ...(usuario?.sala ? [{ icon: 'calendar-outline', label: 'Turma', value: usuario.sala }] : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <View style={[styles.avatar, { backgroundColor: theme_perfil.accent }]}>
          <Text style={styles.avatarText}>{getInitials(usuario?.nome)}</Text>
        </View>
        <Text style={[styles.headerName, { color: theme.text }]}>{usuario?.nome}</Text>
        <Text style={[styles.headerEmail, { color: theme.subText }]}>{usuario?.email}</Text>
        {usuario?.sala && (
          <View style={styles.turmaBadge}>
            <Ionicons name="school-outline" size={12} color={Colors.primary} />
            <Text style={styles.turmaBadgeText}>{usuario.sala}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Painel de Aprovações (apenas atendente) */}
        {isAtendente && (
          <View style={[styles.aprovCard, { backgroundColor: theme.card, borderColor: pendentes.length > 0 ? Colors.warning : theme.border }]}>
            <View style={styles.aprovHeader}>
              <Ionicons name="time" size={18} color={pendentes.length > 0 ? Colors.warning : theme.icon} />
              <Text style={[styles.aprovTitle, { color: theme.text }]}>
                Aprovações Pendentes
              </Text>
              {pendentes.length > 0 && (
                <View style={styles.aprovBadge}>
                  <Text style={styles.aprovBadgeText}>{pendentes.length}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.aprovHelp, { color: theme.subText }]}>
              Revise os cadastros novos aqui. Contas pendentes não acessam o app até serem aprovadas.
            </Text>
            {pendentes.length === 0 ? (
              <Text style={[styles.aprovEmpty, { color: theme.subText }]}>Nenhuma conta aguardando aprovação.</Text>
            ) : (
              pendentes.map((p) => (
                <View key={p.email} style={[styles.aprovItem, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                  <View style={styles.aprovUserInfo}>
                    <View style={[styles.aprovInitials, { backgroundColor: Colors.primary }]}>
                      <Text style={styles.aprovInitialsText}>{getInitials(p.nome)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.aprovUserName, { color: theme.text }]}>{p.nome}</Text>
                      <Text style={[styles.aprovUserMeta, { color: theme.subText }]}>{p.email}</Text>
                      <Text style={[styles.aprovUserMeta, { color: theme.subText }]}>RM: {p.rm} • {p.sala}</Text>
                    </View>
                  </View>
                  <View style={styles.aprovActions}>
                    <TouchableOpacity style={[styles.aprovBtn, { backgroundColor: Colors.success }]} onPress={() => handleAprovar(p.email)}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                      <Text style={styles.aprovBtnText}>Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.aprovBtn, { backgroundColor: Colors.error }]} onPress={() => handleRejeitar(p.email)}>
                      <Ionicons name="close" size={14} color="#FFF" />
                      <Text style={styles.aprovBtnText}>Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme_perfil.accent }]}>
            <Ionicons name="bookmark" size={24} color="#FFF" />
            <Text style={styles.statNumber}>{meusLivros.length}</Text>
            <Text style={styles.statLabel}>Reservas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardAlt }]}>
            <Ionicons name="cube" size={24} color={theme.text} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{meusSolicitados.length}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Solicitações</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="refresh" size={24} color="#FFF" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Renovações</Text>
          </View>
        </View>

        {/* --- MODO ESCURO TOGGLE --- */}
        <View style={[styles.darkModeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.darkModeLeft}>
            <View style={[styles.darkModeIcon, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F5' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? Colors.primary : '#F59E0B'} />
            </View>
            <View>
              <Text style={[styles.darkModeTitle, { color: theme.text }]}>
                {isDark ? 'Modo Escuro' : 'Modo Claro'}
              </Text>
              <Text style={[styles.darkModeSub, { color: theme.subText }]}>
                Alternar aparência do app
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={handleThemeToggle}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {isAtendente && (
          <View style={[styles.demoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.demoHeader}>
              <View style={[styles.demoIcon, { backgroundColor: theme.cardAlt }]}>
                <Ionicons name="refresh-circle" size={22} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoTitle, { color: theme.text }]}>Resetar demo</Text>
                <Text style={[styles.demoSub, { color: theme.subText }]}>
                  Limpa os dados locais para testar cadastro, aprovação e reservas do zero.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.demoBtn} onPress={handleResetDemo}>
              <Ionicons name="trash-outline" size={16} color="#FFF" />
              <Text style={styles.demoBtnText}>Limpar dados da demo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- SEÇÃO LIMITES DO PERFIL (A QUE TINHA SUMIDO) --- */}
        <View style={styles.sectionRow}>
          <Ionicons name="speedometer" size={18} color={theme_perfil.accent} />
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>Limites do Perfil</Text>
        </View>
        
        <View style={[styles.limitsDarkCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[
            { icon: 'book-outline', label: 'Livros simultâneos', value: usuario?.maxLivros || '2' },
            { icon: 'refresh-outline', label: 'Renovações por livro', value: usuario?.maxRenovacoes || '1' },
            { icon: 'calendar-outline', label: 'Prazo de empréstimo', value: `${usuario?.prazoDias || 7} d` },
          ].map((item, i, arr) => (
            <View key={i}>
              <View style={styles.limitRow}>
                <View style={[styles.limitIconCircle, { backgroundColor: theme.cardAlt }]}>
                  <Ionicons name={item.icon} size={18} color={theme.text} />
                </View>
                <Text style={[styles.limitLabelText, { color: theme.subText }]}>{item.label}</Text>
                <Text style={[styles.limitValueText, { color: theme_perfil.accent }]}>{item.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        {/* --- SEÇÃO INFORMAÇÕES (DARK MODE) --- */}
        <View style={styles.sectionRow}>
          <Ionicons name="person-circle" size={18} color={theme_perfil.accent} />
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>Informações</Text>
        </View>

        <View style={[styles.infoDarkCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {infoItems.map((item, index) => (
            <View key={index}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBox, { backgroundColor: theme.cardAlt }]}>
                  <Ionicons name={item.icon} size={20} color={theme_perfil.accent} />
                </View>
                <View style={styles.infoTextColumn}>
                  <Text style={[styles.infoLabelText, { color: theme.subText }]}>{item.label}</Text>
                  <Text style={[styles.infoValueText, { color: theme.text }]}>{item.value}</Text>
                </View>
              </View>
              {index < infoItems.length - 1 && <View style={[styles.infoDivider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmação de logout */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="log-out-outline" size={32} color={Colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sair da conta</Text>
            <Text style={[styles.modalMessage, { color: theme.subText }]}>Deseja realmente sair? Você precisará fazer login novamente.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.cardAlt }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.subText }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 12, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  headerName: { fontSize: 18, fontWeight: '900' },
  headerEmail: { fontSize: 12, marginTop: 2 },
  turmaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6,
    backgroundColor: 'rgba(255,0,85,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  turmaBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  aprovCard: { borderRadius: 20, padding: 16, borderWidth: 1.5, marginBottom: 20, marginTop: 8 },
  aprovHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  aprovTitle: { fontSize: 15, fontWeight: '800', flex: 1 },
  aprovHelp: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  aprovBadge: { backgroundColor: Colors.warning, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  aprovBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  aprovEmpty: { fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  aprovItem: { borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 10 },
  aprovUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  aprovInitials: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  aprovInitialsText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  aprovUserName: { fontSize: 14, fontWeight: '800' },
  aprovUserMeta: { fontSize: 12, marginTop: 2 },
  aprovActions: { flexDirection: 'row', gap: 8 },
  aprovBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 10 },
  aprovBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  scroll: { paddingHorizontal: 15, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statCard: { flex: 1, height: 110, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 5 },
  statLabel: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  
  // ESTILO LIMITES (CARD ESCURO)
  limitsDarkCard: { backgroundColor: '#1A1A1A', borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  limitRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  limitIconCircle: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  limitLabelText: { flex: 1, fontSize: 14, fontWeight: '500' },
  limitValueText: { fontSize: 16, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#333', marginHorizontal: 15 },

  // ESTILO INFORMAÇÕES (CARD ESCURO)
  infoDarkCard: { backgroundColor: '#1A1A1A', borderRadius: 25, padding: 10, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  infoIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  infoTextColumn: { flex: 1 },
  infoLabelText: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  infoValueText: { fontSize: 16, fontWeight: '800' },
  infoDivider: { height: 1, backgroundColor: '#333', marginLeft: 72 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '700' },

  // Dark Mode Toggle Card
  darkModeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 20, padding: 16, marginBottom: 25, borderWidth: 1,
  },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  darkModeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  darkModeTitle: { fontSize: 15, fontWeight: '800' },
  darkModeSub: { fontSize: 12, marginTop: 2 },
  demoCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 25 },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  demoIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  demoTitle: { fontSize: 15, fontWeight: '800' },
  demoSub: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error,
    borderRadius: 14,
    paddingVertical: 12,
  },
  demoBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  modalIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(244,67,54,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#2A2A2A', alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '700', color: '#AAA' },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.error, alignItems: 'center' },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
