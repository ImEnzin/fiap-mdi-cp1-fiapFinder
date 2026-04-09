import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useItens } from '../../context/ItensContext';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { calcularDiasRestantes, formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

const PERFIL_THEME = {
  aluno: { accent: Colors.primary, icon: 'school' },
  professor: { accent: Colors.primary, icon: 'briefcase' },
  atendente: { accent: Colors.primary, icon: 'shield-checkmark' },
};

// ========================= BARRA DE PROGRESSO =========================
function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={pStyles.wrap}>
      <View style={pStyles.labelRow}>
        <Text style={pStyles.label}>{label}</Text>
        <Text style={[pStyles.pct, { color }]}>{Math.round(pct)}%</Text>
      </View>
      <View style={pStyles.track}>
        <View style={[pStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={pStyles.detail}>{value} de {max}</Text>
    </View>
  );
}
const pStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 12, color: '#888', fontWeight: '600' },
  pct: { fontSize: 12, fontWeight: '800' },
  track: { height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  detail: { fontSize: 10, color: '#555', marginTop: 2, textAlign: 'right' },
});

// ========================= PAINEL ATENDENTE =========================
function PainelAtendente({ livros, itens, router }) {
  const total = livros.length;
  const disponiveis = livros.filter((l) => l.status === 'disponivel');
  const atrasados = livros.filter((l) => l.status === 'atrasado');
  const emprestados = livros.filter((l) => l.status === 'emprestado');
  const reservasPendentes = livros.filter((l) => l.status === 'reservado');
  const itensSolicitados = itens.filter((i) => i.status === 'solicitado');
  
  const emCirculacao = emprestados.length + atrasados.length;
  const taxaOcupacao = total > 0 ? ((emCirculacao + reservasPendentes.length) / total * 100).toFixed(0) : 0;

  const usuariosAtivos = [...new Set([...emprestados, ...atrasados, ...reservasPendentes].map(l => l.reservadoPor).filter(Boolean))];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {atrasados.length > 0 && (
        <View style={s.urgentBanner}>
          <Ionicons name="alert-circle" size={22} color="#FFF" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.urgentTitle}>{atrasados.length} livro(s) em atraso!</Text>
            <Text style={s.urgentSub}>Ação necessária — contate os usuários</Text>
          </View>
        </View>
      )}

      <Text style={s.sectionTitle}>Resumo Geral</Text>
      <View style={s.kpiGrid}>
        <View style={s.kpiCard}>
          <Ionicons name="library" size={18} color={Colors.primary} />
          <Text style={[s.kpiNum, { color: Colors.primary }]}>{total}</Text>
          <Text style={s.kpiLabel}>Acervo Total</Text>
        </View>
        <View style={s.kpiCard}>
          <Ionicons name="trending-up" size={18} color="#FFB74D" />
          <Text style={[s.kpiNum, { color: '#FFB74D' }]}>{taxaOcupacao}%</Text>
          <Text style={s.kpiLabel}>Taxa Ocupação</Text>
        </View>
        <View style={s.kpiCard}>
          <Ionicons name="people" size={18} color={Colors.info} />
          <Text style={[s.kpiNum, { color: Colors.info }]}>{usuariosAtivos.length}</Text>
          <Text style={s.kpiLabel}>Usuários Ativos</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Status do Acervo</Text>
      <View style={s.acervoCard}>
        <ProgressBar value={disponiveis.length} max={total} color={Colors.success} label="Disponível" />
        <ProgressBar value={emCirculacao} max={total} color={Colors.info} label="Em circulação" />
        <ProgressBar value={reservasPendentes.length} max={total} color={Colors.primary} label="Reservado" />
      </View>

      <Text style={s.sectionTitle}>Ações Rápidas</Text>
      <View style={s.actionsRow}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push('/biblioteca')}>
          <Ionicons name="library" size={20} color="#FFF" />
          <Text style={s.actionText}>Gestão{'\n'}Acervo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.cardBg }]} onPress={() => router.push('/achados')}>
          <Ionicons name="cube" size={20} color="#FFF" />
          <Text style={s.actionText}>Gestão{'\n'}Itens</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Situação por Usuário</Text>
      {usuariosAtivos.map((email) => {
        const livrosUser = [...emprestados, ...atrasados, ...reservasPendentes].filter(l => l.reservadoPor === email);
        const temAtraso = livrosUser.some(l => l.status === 'atrasado');
        return (
          <View key={email} style={[s.userCard, temAtraso && { borderLeftColor: Colors.error }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{email.split('@')[0]}</Text>
              <Text style={s.userEmail}>{email}</Text>
              <View style={s.userChips}>
                {livrosUser.map((l) => (
                  <View key={l.id} style={[s.userChip, { borderColor: l.status === 'atrasado' ? Colors.error : Colors.primary }]}>
                    <Text style={[s.userChipText, { color: l.status === 'atrasado' ? Colors.error : Colors.primary }]}>{l.titulo.substring(0, 15)}...</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={[s.userCount, { color: temAtraso ? Colors.error : Colors.white }]}>{livrosUser.length}</Text>
          </View>
        );
      })}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ========================= HOME ALUNO / PROFESSOR =========================
function HomeUser({ usuario, livros, meusLivros, itens, router, theme }) {
  const emprestados = meusLivros.filter((l) => l.status === 'emprestado' || l.status === 'atrasado');
  const reservados = meusLivros.filter((l) => l.status === 'reservado');
  const disponiveis = livros.filter((l) => l.status === 'disponivel');

  const proxima = emprestados
    .filter((l) => l.dataPrevistaDevolucao)
    .sort((a, b) => a.dataPrevistaDevolucao.localeCompare(b.dataPrevistaDevolucao))[0];
  const diasProx = proxima ? calcularDiasRestantes(proxima.dataPrevistaDevolucao) : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <View style={[s.roleBadge, { backgroundColor: theme.accent }]}>
        <Ionicons name={theme.icon} size={14} color="#FFF" />
        <Text style={s.roleBadgeText}>{usuario?.tipo}</Text>
      </View>

      <View style={s.statsRow3}>
        <View style={[s.statCard3, { backgroundColor: Colors.primary }]}>
          <Ionicons name="bookmark" size={20} color="#FFF" />
          <Text style={s.statNum3}>{reservados.length}</Text>
          <Text style={s.statLbl3}>Reservados</Text>
        </View>
        <View style={[s.statCard3, { backgroundColor: Colors.darkGray }]}>
          <Ionicons name="book" size={20} color="#FFF" />
          <Text style={s.statNum3}>{emprestados.length}</Text>
          <Text style={s.statLbl3}>Emprestados</Text>
        </View>
      </View>

      {proxima && (
        <TouchableOpacity style={[s.alertCard, diasProx < 0 ? s.alertDanger : s.alertWarn]} onPress={() => router.push(`/livro/${proxima.id}`)}>
          <Ionicons name={diasProx < 0 ? 'alert-circle' : 'time'} size={22} color="#FFF" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.alertTitle}>{diasProx < 0 ? `Atrasado ${Math.abs(diasProx)} dia(s)!` : `${diasProx} dia(s) para devolver`}</Text>
            <Text style={s.alertSub}>{proxima.titulo}</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={s.sectionTitle}>Acesso Rápido</Text>
      <View style={s.quickRow}>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/biblioteca')}>
          <View style={[s.quickIcon, { backgroundColor: '#3D1A25' }]}><Ionicons name="book" size={26} color={Colors.primary} /></View>
          <Text style={s.quickLabel}>Biblioteca</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/achados')}>
          <View style={[s.quickIcon, { backgroundColor: '#1A233A' }]}><Ionicons name="search" size={26} color={Colors.info} /></View>
          <Text style={s.quickLabel}>Achados</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Disponíveis para Reserva</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {disponiveis.slice(0, 6).map((l) => (
          <TouchableOpacity key={l.id} style={s.bookCard} onPress={() => router.push(`/livro/${l.id}`)}>
            <Image source={{ uri: l.capa }} style={s.bookCover} />
            <View style={s.bookOverlay}>
              <Text style={s.bookTitle} numberOfLines={1}>{l.titulo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ========================= EXPORT PRINCIPAL =========================
export default function Home() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { livros, meusLivros } = useLivros();
  const { itens } = useItens();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <View style={s.loadingBg}><LoadingState message="Carregando..." /></View>;

  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const isAtendente = usuario?.perfil === 'atendente';

  return (
    <View style={s.container}>
      <View style={[s.header, { borderBottomColor: theme.accent }]}>
        <View>
          <Text style={s.greeting}>{isAtendente ? 'Painel do Atendente' : `Olá, ${usuario?.nome?.split(' ')[0]} 👋`}</Text>
          <Text style={s.subtitle}>{usuario?.tipo} • {usuario?.curso}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/perfil')} style={[s.avatarBtn, { backgroundColor: theme.accent }]}>
          <Ionicons name={theme.icon} size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
      {isAtendente ? <PainelAtendente livros={livros} itens={itens} router={router} /> : <HomeUser usuario={usuario} livros={livros} meusLivros={meusLivros} itens={itens} router={router} theme={theme} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  loadingBg: { flex: 1, backgroundColor: Colors.black },
  header: { backgroundColor: Colors.black, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 4 },
  greeting: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#888', fontSize: 12, marginTop: 2 },
  avatarBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  roleBadge: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14 },
  roleBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  urgentBanner: { backgroundColor: Colors.error, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  urgentTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  urgentSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  kpiCard: { flex: 1, backgroundColor: Colors.darkGray, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderGray },
  kpiNum: { fontSize: 24, fontWeight: '900', marginTop: 6 },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '700' },
  acervoCard: { backgroundColor: Colors.darkGray, borderRadius: 18, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: Colors.borderGray },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  actionBtn: { flex: 1, borderRadius: 16, paddingVertical: 18, alignItems: 'center', gap: 6 },
  actionText: { color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  userCard: { backgroundColor: Colors.darkGray, borderRadius: 16, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: Colors.borderGray },
  userName: { fontSize: 13, fontWeight: '800', color: Colors.white },
  userEmail: { fontSize: 10, color: '#666' },
  userChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  userChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  userChipText: { fontSize: 9, fontWeight: '700' },
  userCount: { fontSize: 20, fontWeight: '900', marginLeft: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, marginBottom: 12, marginTop: 10 },
  statsRow3: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard3: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  statNum3: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 6 },
  statLbl3: { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 16 },
  alertDanger: { backgroundColor: Colors.error },
  alertWarn: { backgroundColor: Colors.primary },
  alertTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  alertSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickCard: { flex: 1, backgroundColor: Colors.darkGray, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderGray },
  quickIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: Colors.white },
  bookCard: { width: 140, height: 200, marginRight: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#222' },
  bookCover: { width: '100%', height: '100%' },
  bookOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10 },
  bookTitle: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});