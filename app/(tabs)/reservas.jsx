import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useItens } from '../../context/ItensContext';
import { calcularDiasRestantes, formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

const PERFIL_THEME = {
  aluno: { accent: Colors.primary, bg: '#3D1A25', icon: 'school' },
  professor: { accent: Colors.primary, bg: '#3D1A25', icon: 'briefcase' },
  atendente: { accent: Colors.primary, bg: '#3D1A25', icon: 'shield-checkmark' },
};

// ========================= GESTÃO DE EMPRÉSTIMOS (ATENDENTE) =========================
function GestaoEmprestimos({ livros, itens, router, confirmarRetirada, confirmarDevolucao, confirmarRetiradaItem }) {
  const atrasados = livros.filter((l) => l.status === 'atrasado');
  const emprestados = livros.filter((l) => l.status === 'emprestado');
  const reservados = livros.filter((l) => l.status === 'reservado');
  const itensSolicitados = itens.filter((i) => i.status === 'solicitado');

  const todosAtivos = [...atrasados, ...emprestados, ...reservados];

  const porUsuario = {};
  todosAtivos.forEach((l) => {
    const email = l.reservadoPor || 'Desconhecido';
    if (!porUsuario[email]) porUsuario[email] = [];
    porUsuario[email].push(l);
  });

  const getColor = (d) => d < 0 ? Colors.error : d === 0 ? Colors.primary : d <= 3 ? Colors.primary : Colors.success;
  const getBg = (d) => d < 0 ? '#2D1A1A' : d === 0 ? '#2D1F1A' : d <= 3 ? '#2D1A25' : '#1A2D1A';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: Colors.primary }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="swap-horizontal" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>Gestão de Empréstimos</Text>
        </View>
        <Text style={styles.headerSub}>{todosAtivos.length} ativo(s) • {atrasados.length} atrasados</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={gs.kpiRow}>
          <View style={[gs.kpi, { backgroundColor: '#2D1A1A' }]}>
            <Text style={[gs.kpiNum, { color: Colors.error }]}>{atrasados.length}</Text>
            <Text style={gs.kpiLabel}>Atrasados</Text>
          </View>
          <View style={[gs.kpi, { backgroundColor: '#1A233A' }]}>
            <Text style={[gs.kpiNum, { color: Colors.info }]}>{emprestados.length}</Text>
            <Text style={gs.kpiLabel}>Emprestados</Text>
          </View>
          <View style={[gs.kpi, { backgroundColor: '#2D1A25' }]}>
            <Text style={[gs.kpiNum, { color: Colors.primary }]}>{reservados.length}</Text>
            <Text style={gs.kpiLabel}>Reservados</Text>
          </View>
        </View>

        <Text style={gs.sectionTitle}>Por Usuário</Text>
        {Object.entries(porUsuario).map(([email, userLivros]) => (
          <View key={email} style={gs.userSection}>
            <View style={gs.userHeader}>
              <View style={gs.userAvatar}>
                <Ionicons name="person" size={14} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={gs.userName}>{email.split('@')[0]}</Text>
                <Text style={gs.userEmail}>{email}</Text>
              </View>
            </View>
            {userLivros.map((l) => {
              const d = l.dataPrevistaDevolucao ? calcularDiasRestantes(l.dataPrevistaDevolucao) : null;
              const c = d !== null ? getColor(d) : Colors.primary;
              return (
                <View key={l.id} style={[gs.loanCard, { borderLeftColor: c }]}>
                  <View style={gs.loanInfo}>
                    <Text style={gs.loanTitle}>{l.titulo}</Text>
                    <StatusBadge status={l.status} />
                  </View>
                  <TouchableOpacity 
                    style={[gs.actionBtn, { backgroundColor: l.status === 'reservado' ? Colors.primary : Colors.success }]}
                    onPress={() => l.status === 'reservado' ? confirmarRetirada(l.id) : confirmarDevolucao(l.id)}
                  >
                    <Text style={gs.actionBtnText}>{l.status === 'reservado' ? 'Entregar' : 'Devolver'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ========================= RESERVAS (ALUNO) =========================
export default function Reservas() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { livros, meusLivros, confirmarRetirada, confirmarDevolucao } = useLivros();
  const { itens, meusSolicitados, confirmarRetiradaItem } = useItens();
  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;

  if (usuario?.perfil === 'atendente') {
    return <GestaoEmprestimos livros={livros} itens={itens} router={router} confirmarRetirada={confirmarRetirada} confirmarDevolucao={confirmarDevolucao} confirmarRetiradaItem={confirmarRetiradaItem} />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.accent }]}>
        <Text style={styles.headerTitle}>Minhas Reservas</Text>
        <Text style={styles.headerSub}>{meusLivros.length + meusSolicitados.length} ativo(s)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.limitCard, { backgroundColor: theme.bg }]}>
          <Ionicons name="information-circle" size={22} color={theme.accent} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.limitTitle, { color: theme.accent }]}>Limites do Perfil</Text>
            <Text style={styles.limitText}>{meusLivros.length}/{usuario?.maxLivros} livros • {usuario?.prazoDias} dias de prazo</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Livros</Text>
        {meusLivros.length === 0 ? <EmptyState icon="bookmark-outline" message="Nenhuma reserva." /> : 
          meusLivros.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => router.push(`/livro/${item.id}`)}>
              <Image source={{ uri: item.capa }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.titulo}</Text>
                <StatusBadge status={item.status} />
                <Text style={styles.dateText}>Prazo: {formatDate(item.dataPrevistaDevolucao)}</Text>
              </View>
            </TouchableOpacity>
          ))
        }

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Itens Solicitados</Text>
        {meusSolicitados.length === 0 ? <EmptyState icon="search-outline" message="Nenhum item solicitado." /> :
          meusSolicitados.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => router.push(`/item/${item.id}`)}>
              <Image source={{ uri: item.imagem }} style={styles.itemImg} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.nome}</Text>
                <StatusBadge status="solicitado" />
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { backgroundColor: Colors.black, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20, borderBottomWidth: 3 },
  headerTitle: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  limitCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 12 },
  limitTitle: { fontSize: 13, fontWeight: '800' },
  limitText: { fontSize: 12, color: '#AAA', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, marginBottom: 12 },
  card: { backgroundColor: Colors.darkGray, borderRadius: 18, flexDirection: 'row', padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.borderGray },
  cover: { width: 60, height: 85, borderRadius: 8, backgroundColor: '#333' },
  itemImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 14, justifyContent: 'center', gap: 4 },
  title: { fontSize: 14, fontWeight: '800', color: Colors.white },
  dateText: { fontSize: 11, color: '#777' },
});

const gs = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kpi: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 2 },
  kpiNum: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, marginBottom: 12 },
  userSection: { backgroundColor: Colors.darkGray, borderRadius: 16, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.borderGray },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  userName: { fontSize: 13, fontWeight: '800', color: Colors.white },
  userEmail: { fontSize: 10, color: '#666' },
  loanCard: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 12, padding: 10, marginBottom: 6, borderLeftWidth: 3, alignItems: 'center', justifyContent: 'space-between' },
  loanInfo: { flex: 1, gap: 2 },
  loanTitle: { fontSize: 12, fontWeight: '700', color: Colors.white },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});