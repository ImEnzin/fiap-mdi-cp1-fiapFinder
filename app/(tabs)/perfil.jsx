import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useItens } from '../../context/ItensContext';

const PERFIL_THEME = {
  aluno: { accent: Colors.primary, icon: 'school' },
  professor: { accent: Colors.primary, icon: 'briefcase' },
  atendente: { accent: Colors.primary, icon: 'shield-checkmark' },
};

export default function Perfil() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const { meusLivros } = useLivros();
  const { meusSolicitados } = useItens();
  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace('/login');
  };

  const infoItems = [
    { icon: 'person-outline', label: 'Nome', value: usuario?.nome || 'Carlos Silva' },
    { icon: 'school-outline', label: 'Tipo', value: usuario?.tipo || 'Aluno' },
    { icon: 'book-outline', label: 'Curso', value: usuario?.curso || 'Engenharia de Software' },
    { icon: 'id-card-outline', label: 'RM', value: usuario?.rm || '550123' },
    { icon: 'mail-outline', label: 'Email', value: usuario?.email || 'aluno@fiap.com.br' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Ionicons name={theme.icon} size={28} color="#FFF" />
        </View>
        <Text style={styles.headerName}>{usuario?.nome}</Text>
        <Text style={styles.headerEmail}>{usuario?.email}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.accent }]}>
            <Ionicons name="bookmark" size={24} color="#FFF" />
            <Text style={styles.statNumber}>{meusLivros.length}</Text>
            <Text style={styles.statLabel}>Reservas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#262626' }]}>
            <Ionicons name="cube" size={24} color="#FFF" />
            <Text style={styles.statNumber}>{meusSolicitados.length}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="refresh" size={24} color="#FFF" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Renovações</Text>
          </View>
        </View>

        {/* --- SEÇÃO LIMITES DO PERFIL (A QUE TINHA SUMIDO) --- */}
        <View style={styles.sectionRow}>
          <Ionicons name="speedometer" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Limites do Perfil</Text>
        </View>
        
        <View style={styles.limitsDarkCard}>
          {[
            { icon: 'book-outline', label: 'Livros simultâneos', value: usuario?.maxLivros || '2' },
            { icon: 'refresh-outline', label: 'Renovações por livro', value: usuario?.maxRenovacoes || '1' },
            { icon: 'calendar-outline', label: 'Prazo de empréstimo', value: `${usuario?.prazoDias || 7} d` },
          ].map((item, i, arr) => (
            <View key={i}>
              <View style={styles.limitRow}>
                <View style={styles.limitIconCircle}>
                  <Ionicons name={item.icon} size={18} color="#000" />
                </View>
                <Text style={styles.limitLabelText}>{item.label}</Text>
                <Text style={[styles.limitValueText, { color: theme.accent }]}>{item.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* --- SEÇÃO INFORMAÇÕES (DARK MODE) --- */}
        <View style={styles.sectionRow}>
          <Ionicons name="person-circle" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Informações</Text>
        </View>

        <View style={styles.infoDarkCard}>
          {infoItems.map((item, index) => (
            <View key={index}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={item.icon} size={20} color={theme.accent} />
                </View>
                <View style={styles.infoTextColumn}>
                  <Text style={styles.infoLabelText}>{item.label}</Text>
                  <Text style={styles.infoValueText}>{item.value}</Text>
                </View>
              </View>
              {index < infoItems.length - 1 && <View style={styles.infoDivider} />}
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
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="log-out-outline" size={32} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={styles.modalMessage}>Deseja realmente sair? Você precisará fazer login novamente.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
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
  container: { flex: 1, backgroundColor: '#000' },
  header: { backgroundColor: '#000', paddingTop: 50, paddingBottom: 12, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  headerName: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  headerEmail: { fontSize: 12, color: '#888', marginTop: 2 },
  scroll: { paddingHorizontal: 15, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statCard: { flex: 1, height: 110, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 5 },
  statLabel: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#444' },
  
  // ESTILO LIMITES (CARD ESCURO)
  limitsDarkCard: { backgroundColor: '#1A1A1A', borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  limitRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  limitIconCircle: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  limitLabelText: { flex: 1, fontSize: 14, color: '#555', fontWeight: '500' },
  limitValueText: { fontSize: 16, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#333', marginHorizontal: 15 },

  // ESTILO INFORMAÇÕES (CARD ESCURO)
  infoDarkCard: { backgroundColor: '#1A1A1A', borderRadius: 25, padding: 10, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  infoIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  infoTextColumn: { flex: 1 },
  infoLabelText: { fontSize: 11, color: '#666', fontWeight: '600', marginBottom: 2 },
  infoValueText: { fontSize: 16, color: '#EEE', fontWeight: '800' },
  infoDivider: { height: 1, backgroundColor: '#333', marginLeft: 72 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '700' },

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