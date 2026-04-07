import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useItens } from '../../context/ItensContext';

const { width } = Dimensions.get('window');

const PERFIL_THEME = {
  aluno: { accent: '#1976D2', bg: '#E3F2FD', icon: 'school' },
  professor: { accent: '#7B1FA2', bg: '#F3E5F5', icon: 'briefcase' },
  atendente: { accent: '#E65100', bg: '#FFF3E0', icon: 'shield-checkmark' },
};

// ========================= PROGRESS BAR =========================
function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: '#666', fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: '800', color }}>{Math.round(pct)}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#E8E8E8', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: `${pct}%` }} />
      </View>
      <Text style={{ fontSize: 10, color: '#BBB', marginTop: 2, textAlign: 'right' }}>{value} de {max}</Text>
    </View>
  );
}

// ========================= SISTEMA (ATENDENTE) =========================
function SistemaAtendente({ usuario, livros, itens, router, handleLogout }) {
  const total = livros.length;
  const disponiveis = livros.filter((l) => l.status === 'disponivel');
  const emprestados = livros.filter((l) => l.status === 'emprestado');
  const atrasados = livros.filter((l) => l.status === 'atrasado');
  const reservados = livros.filter((l) => l.status === 'reservado');

  const encontrados = itens.filter((i) => i.status === 'encontrado');
  const solicitados = itens.filter((i) => i.status === 'solicitado');
  const retirados = itens.filter((i) => i.status === 'retirado');

  const emCirculacao = emprestados.length + atrasados.length;
  const taxaDisponibilidade = total > 0 ? (disponiveis.length / total * 100).toFixed(0) : 0;
  const taxaCirculacao = total > 0 ? (emCirculacao / total * 100).toFixed(0) : 0;
  const taxaAtraso = emCirculacao > 0 ? (atrasados.length / emCirculacao * 100).toFixed(0) : 0;
  const taxaEntregaItens = itens.length > 0 ? (retirados.length / itens.length * 100).toFixed(0) : 0;

  const usuariosAtivos = [...new Set([...emprestados, ...atrasados, ...reservados].map(l => l.reservadoPor).filter(Boolean))];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: '#E65100' }]}>
        <View style={[styles.avatar, { backgroundColor: '#E65100' }]}>
          <Ionicons name="settings" size={36} color="#FFF" />
        </View>
        <Text style={styles.name}>Sistema FIAP Finder</Text>
        <Text style={styles.email}>Painel Admin — {usuario?.nome}</Text>
        <View style={[styles.tipoBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name="shield-checkmark" size={12} color="#E65100" />
          <Text style={[styles.tipoText, { color: '#E65100' }]}>Atendente</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Estatísticas do Acervo */}
        <View style={ss.sectionRow}>
          <Ionicons name="bar-chart" size={18} color="#E65100" />
          <Text style={ss.sectionTitle}>Estatísticas do Acervo</Text>
        </View>
        <View style={ss.statsGrid}>
          <View style={[ss.statCard, { backgroundColor: '#111' }]}>
            <Ionicons name="library" size={20} color="#E65100" />
            <Text style={[ss.statNum, { color: '#E65100' }]}>{total}</Text>
            <Text style={ss.statLabel}>Total Acervo</Text>
          </View>
          <View style={[ss.statCard, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={ss.statNum}>{disponiveis.length}</Text>
            <Text style={ss.statLabel}>Disponíveis</Text>
          </View>
          <View style={[ss.statCard, { backgroundColor: Colors.info }]}>
            <Ionicons name="swap-horizontal" size={20} color="#FFF" />
            <Text style={ss.statNum}>{emCirculacao}</Text>
            <Text style={ss.statLabel}>Em Circulação</Text>
          </View>
          <View style={[ss.statCard, { backgroundColor: Colors.error }]}>
            <Ionicons name="alert-circle" size={20} color="#FFF" />
            <Text style={ss.statNum}>{atrasados.length}</Text>
            <Text style={ss.statLabel}>Atrasados</Text>
          </View>
        </View>

        {/* Saúde do Acervo */}
        <View style={ss.sectionRow}>
          <Ionicons name="pulse" size={18} color="#E65100" />
          <Text style={ss.sectionTitle}>Saúde do Acervo</Text>
        </View>
        <View style={ss.card}>
          <ProgressBar value={disponiveis.length} max={total} color={Colors.success} label="Disponibilidade" />
          <ProgressBar value={emCirculacao} max={total} color={Colors.info} label="Circulação" />
          <ProgressBar value={reservados.length} max={total} color="#7B1FA2" label="Aguardando Retirada" />
          <ProgressBar value={atrasados.length} max={total} color={Colors.error} label="Taxa de Atraso" />
        </View>

        {/* KPI Indicators */}
        <View style={ss.sectionRow}>
          <Ionicons name="analytics" size={18} color="#E65100" />
          <Text style={ss.sectionTitle}>Indicadores</Text>
        </View>
        <View style={ss.indicatorGrid}>
          {[
            { label: 'Disponibilidade', value: `${taxaDisponibilidade}%`, icon: 'checkmark-circle', color: Colors.success, bg: '#E8F5E9' },
            { label: 'Circulação', value: `${taxaCirculacao}%`, icon: 'trending-up', color: Colors.info, bg: '#E3F2FD' },
            { label: 'Taxa de Atraso', value: `${taxaAtraso}%`, icon: 'warning', color: atrasados.length > 0 ? Colors.error : Colors.success, bg: atrasados.length > 0 ? '#FFEBEE' : '#E8F5E9' },
            { label: 'Entrega Itens', value: `${taxaEntregaItens}%`, icon: 'cube', color: '#F57C00', bg: '#FFF3E0' },
            { label: 'Usuários Ativos', value: `${usuariosAtivos.length}`, icon: 'people', color: '#7B1FA2', bg: '#F3E5F5' },
            { label: 'Reservas Pendentes', value: `${reservados.length}`, icon: 'bookmark', color: '#E65100', bg: '#FFF3E0' },
          ].map((ind, i) => (
            <View key={i} style={[ss.indicator, { backgroundColor: ind.bg }]}>
              <Ionicons name={ind.icon} size={18} color={ind.color} />
              <Text style={[ss.indicatorNum, { color: ind.color }]}>{ind.value}</Text>
              <Text style={ss.indicatorLabel}>{ind.label}</Text>
            </View>
          ))}
        </View>

        {/* Itens Achados */}
        <View style={ss.sectionRow}>
          <Ionicons name="cube" size={18} color="#E65100" />
          <Text style={ss.sectionTitle}>Achados e Perdidos</Text>
        </View>
        <View style={ss.card}>
          <ProgressBar value={encontrados.length} max={itens.length} color={Colors.info} label="Aguardando Dono" />
          <ProgressBar value={solicitados.length} max={itens.length} color="#F57C00" label="Solicitados" />
          <ProgressBar value={retirados.length} max={itens.length} color={Colors.success} label="Entregues" />
        </View>

        {/* System Info */}
        <View style={ss.sectionRow}>
          <Ionicons name="information-circle" size={18} color="#E65100" />
          <Text style={ss.sectionTitle}>Sobre o Sistema</Text>
        </View>
        <View style={ss.infoCard}>
          {[
            { icon: 'person-outline', label: 'Operador', value: usuario?.nome },
            { icon: 'mail-outline', label: 'Email', value: usuario?.email },
            { icon: 'code-slash', label: 'Versão', value: 'FIAP Finder v1.0.0' },
            { icon: 'library-outline', label: 'Total Livros', value: `${total} títulos` },
            { icon: 'cube-outline', label: 'Total Itens', value: `${itens.length} registros` },
          ].map((item, index, arr) => (
            <React.Fragment key={item.label}>
              <View style={ss.infoRow}>
                <View style={[ss.infoIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name={item.icon} size={18} color="#E65100" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ss.infoLabel}>{item.label}</Text>
                  <Text style={ss.infoValue}>{item.value}</Text>
                </View>
              </View>
              {index < arr.length - 1 && <View style={ss.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FIAP Finder v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const { livros, meusLivros } = useLivros();
  const { itens, meusSolicitados } = useItens();

  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const isAtendente = usuario?.perfil === 'atendente';

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (isAtendente) {
    return <SistemaAtendente usuario={usuario} livros={livros} itens={itens} router={router} handleLogout={handleLogout} />;
  }

  const infoItems = [
    { icon: 'person-outline', label: 'Nome', value: usuario?.nome },
    { icon: theme.icon, label: 'Tipo', value: usuario?.tipo },
    { icon: 'school-outline', label: 'Curso', value: usuario?.curso },
    { icon: 'id-card-outline', label: 'RM', value: usuario?.rm },
    { icon: 'mail-outline', label: 'Email', value: usuario?.email },
  ];

  return (
    <View style={styles.container}>
      {/* Header with profile color */}
      <View style={[styles.header, { borderBottomColor: theme.accent }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Ionicons name={theme.icon} size={36} color="#FFF" />
        </View>
        <Text style={styles.name}>{usuario?.nome}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <View style={[styles.tipoBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name={theme.icon} size={12} color={theme.accent} />
          <Text style={[styles.tipoText, { color: theme.accent }]}>{usuario?.tipo}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.accent }]}>
            <Ionicons name="bookmark" size={20} color="#FFF" />
            <Text style={styles.statNumber}>{meusLivros.length}</Text>
            <Text style={styles.statLabel}>Reservas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#222' }]}>
            <Ionicons name="cube" size={20} color="#FFF" />
            <Text style={styles.statNumber}>{meusSolicitados.length}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.statNumber}>
              {meusLivros.reduce((acc, l) => acc + l.renovacoes, 0)}
            </Text>
            <Text style={styles.statLabel}>Renovações</Text>
          </View>
        </View>

        {/* Limites */}
        <View style={styles.sectionRow}>
          <Ionicons name="speedometer" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Limites do Perfil</Text>
        </View>
        <View style={styles.limitsCard}>
          {[
            { icon: 'book-outline', label: 'Livros simultâneos', value: `${usuario?.maxLivros}` },
            { icon: 'refresh-outline', label: 'Renovações por livro', value: `${usuario?.maxRenovacoes}` },
            { icon: 'calendar-outline', label: 'Prazo de empréstimo', value: `${usuario?.prazoDias} dias` },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.limitRow}>
                <View style={[styles.limitIcon, { backgroundColor: theme.bg }]}>
                  <Ionicons name={item.icon} size={18} color={theme.accent} />
                </View>
                <Text style={styles.limitLabel}>{item.label}</Text>
                <Text style={[styles.limitValue, { color: theme.accent }]}>{item.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Informações */}
        <View style={styles.sectionRow}>
          <Ionicons name="person-circle" size={18} color={theme.accent} />
          <Text style={styles.sectionTitle}>Informações</Text>
        </View>
        <View style={styles.infoCard}>
          {infoItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: theme.bg }]}>
                  <Ionicons name={item.icon} size={18} color={theme.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
              {index < infoItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FIAP Finder v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  header: {
    backgroundColor: '#111', paddingTop: 52, paddingBottom: 24, alignItems: 'center',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, borderBottomWidth: 3,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  email: { fontSize: 13, color: '#888', marginTop: 2 },
  tipoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10,
  },
  tipoText: { fontSize: 12, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 18, paddingVertical: 16, alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 6 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#222' },
  limitsCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  limitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  limitIcon: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  limitLabel: { flex: 1, fontSize: 14, color: '#333' },
  limitValue: { fontSize: 15, fontWeight: '800' },
  infoCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoIcon: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#AAA', fontWeight: '600' },
  infoValue: { fontSize: 15, color: '#222', fontWeight: '700', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, gap: 8,
    borderWidth: 1.5, borderColor: '#FFCDD2', marginBottom: 16,
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#CCC', fontSize: 12, marginTop: 4 },
});

// Sistema styles (atendente)
const ss = StyleSheet.create({
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#222' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: (width - 50) / 2, borderRadius: 18, paddingVertical: 16, alignItems: 'center',
  },
  statNum: { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 6 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  indicatorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  indicator: {
    width: (width - 50) / 3, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4,
  },
  indicatorNum: { fontSize: 20, fontWeight: '900' },
  indicatorLabel: { fontSize: 9, color: '#888', fontWeight: '600', textAlign: 'center' },
  infoCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoIcon: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  infoLabel: { fontSize: 11, color: '#AAA', fontWeight: '600' },
  infoValue: { fontSize: 15, color: '#222', fontWeight: '700', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
});
