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

const PERFIL_THEME = {
  aluno: { accent: '#1976D2', bg: '#E3F2FD', icon: 'school' },
  professor: { accent: '#7B1FA2', bg: '#F3E5F5', icon: 'briefcase' },
  atendente: { accent: '#E65100', bg: '#FFF3E0', icon: 'shield-checkmark' },
};

// ========================= GESTÃO DE EMPRÉSTIMOS (ATENDENTE) =========================
function GestaoEmprestimos({ livros, itens, router, confirmarRetirada, confirmarDevolucao, confirmarRetiradaItem }) {
  const atrasados = livros.filter((l) => l.status === 'atrasado');
  const emprestados = livros.filter((l) => l.status === 'emprestado');
  const reservados = livros.filter((l) => l.status === 'reservado');
  const itensSolicitados = itens.filter((i) => i.status === 'solicitado');

  const todosAtivos = [...atrasados, ...emprestados, ...reservados];

  // Sort by urgency: atrasados first (most overdue first), then by days remaining
  const todosOrdenados = todosAtivos.sort((a, b) => {
    const da = a.dataPrevistaDevolucao ? calcularDiasRestantes(a.dataPrevistaDevolucao) : 999;
    const db = b.dataPrevistaDevolucao ? calcularDiasRestantes(b.dataPrevistaDevolucao) : 999;
    if (a.status === 'reservado' && b.status !== 'reservado') return 1;
    if (a.status !== 'reservado' && b.status === 'reservado') return -1;
    return da - db;
  });

  // Group by user
  const porUsuario = {};
  todosAtivos.forEach((l) => {
    const email = l.reservadoPor || 'Desconhecido';
    if (!porUsuario[email]) porUsuario[email] = [];
    porUsuario[email].push(l);
  });

  const getColor = (d) => d < 0 ? Colors.error : d === 0 ? '#D84315' : d <= 3 ? '#F57C00' : d <= 5 ? '#FFA726' : Colors.success;
  const getBg = (d) => d < 0 ? '#FFEBEE' : d === 0 ? '#FBE9E7' : d <= 3 ? '#FFF3E0' : d <= 5 ? '#FFF8E1' : '#F5F5F5';

  const handleConfirmarRetirada = (livro) => {
    Alert.alert('Confirmar Retirada', `Confirmar retirada de "${livro.titulo}" por ${livro.reservadoPor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => confirmarRetirada(livro.id) },
    ]);
  };

  const handleConfirmarDevolucao = (livro) => {
    Alert.alert('Confirmar Devolução', `Confirmar devolução de "${livro.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => confirmarDevolucao(livro.id) },
    ]);
  };

  const handleConfirmarEntregaItem = (item) => {
    Alert.alert('Confirmar Entrega', `Entregar "${item.nome}" para ${item.solicitadoPor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => confirmarRetiradaItem(item.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: '#E65100' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="swap-horizontal" size={22} color="#E65100" />
          <Text style={styles.headerTitle}>Gestão de Empréstimos</Text>
        </View>
        <Text style={styles.headerSub}>{todosAtivos.length} ativo(s) • {atrasados.length} atrasados • {itensSolicitados.length} itens p/ entregar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* KPI bar */}
        <View style={gs.kpiRow}>
          <View style={[gs.kpi, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[gs.kpiNum, { color: Colors.error }]}>{atrasados.length}</Text>
            <Text style={gs.kpiLabel}>Atrasados</Text>
          </View>
          <View style={[gs.kpi, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[gs.kpiNum, { color: Colors.info }]}>{emprestados.length}</Text>
            <Text style={gs.kpiLabel}>Emprestados</Text>
          </View>
          <View style={[gs.kpi, { backgroundColor: '#F3E5F5' }]}>
            <Text style={[gs.kpiNum, { color: '#7B1FA2' }]}>{reservados.length}</Text>
            <Text style={gs.kpiLabel}>Reservados</Text>
          </View>
          <View style={[gs.kpi, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[gs.kpiNum, { color: '#F57C00' }]}>{itensSolicitados.length}</Text>
            <Text style={gs.kpiLabel}>Itens</Text>
          </View>
        </View>

        {/* Urgent banner */}
        {atrasados.length > 0 && (
          <View style={gs.urgentBar}>
            <Ionicons name="alert-circle" size={16} color="#FFF" />
            <Text style={gs.urgentBarText}>{atrasados.length} livro(s) com atraso — prioridade máxima!</Text>
          </View>
        )}

        {/* === POR USUÁRIO === */}
        <Text style={gs.sectionTitle}>Por Usuário</Text>
        {Object.entries(porUsuario).map(([email, userLivros]) => {
          const temAtraso = userLivros.some((l) => l.status === 'atrasado');
          const nomeDisplay = email.split('@')[0];
          return (
            <View key={email} style={[gs.userSection, temAtraso && { borderLeftColor: Colors.error }]}>
              <View style={gs.userHeader}>
                <View style={[gs.userAvatar, { backgroundColor: temAtraso ? '#FFCDD2' : '#E3F2FD' }]}>
                  <Ionicons name={temAtraso ? 'alert' : 'person'} size={14} color={temAtraso ? Colors.error : Colors.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={gs.userName}>{nomeDisplay}</Text>
                  <Text style={gs.userEmail}>{email}</Text>
                </View>
                <View style={[gs.countBadge, { backgroundColor: temAtraso ? Colors.error : '#E65100' }]}>
                  <Text style={gs.countBadgeText}>{userLivros.length}</Text>
                </View>
              </View>
              {userLivros.map((l) => {
                const d = l.dataPrevistaDevolucao ? calcularDiasRestantes(l.dataPrevistaDevolucao) : null;
                const c = d !== null ? getColor(d) : (l.status === 'reservado' ? '#7B1FA2' : '#999');
                const bg = d !== null ? getBg(d) : (l.status === 'reservado' ? '#F3E5F5' : '#F5F5F5');
                return (
                  <TouchableOpacity key={l.id} style={[gs.loanCard, { backgroundColor: bg, borderLeftColor: c }]} onPress={() => router.push(`/livro/${l.id}`)}>
                    <Image source={{ uri: l.capa }} style={gs.loanImg} />
                    <View style={gs.loanInfo}>
                      <Text style={gs.loanTitle} numberOfLines={1}>{l.titulo}</Text>
                      {l.dataPrevistaDevolucao && (
                        <Text style={[gs.loanMeta, { color: c }]}>
                          {d < 0 ? `${Math.abs(d)}d atraso` : d === 0 ? 'VENCE HOJE' : `${d}d restante(s)`} • {formatDate(l.dataPrevistaDevolucao)}
                        </Text>
                      )}
                      {l.status === 'reservado' && <Text style={[gs.loanMeta, { color: '#7B1FA2' }]}>Aguardando retirada</Text>}
                      <View style={gs.loanActions}>
                        <StatusBadge status={l.status} />
                        {l.status === 'reservado' && (
                          <TouchableOpacity style={[gs.actionBtn, { backgroundColor: '#E65100' }]} onPress={() => handleConfirmarRetirada(l)}>
                            <Ionicons name="log-out" size={11} color="#FFF" />
                            <Text style={gs.actionBtnText}>Entregar</Text>
                          </TouchableOpacity>
                        )}
                        {(l.status === 'emprestado' || l.status === 'atrasado') && (
                          <TouchableOpacity style={[gs.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleConfirmarDevolucao(l)}>
                            <Ionicons name="log-in" size={11} color="#FFF" />
                            <Text style={gs.actionBtnText}>Devolver</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {todosAtivos.length === 0 && (
          <View style={gs.emptyBox}>
            <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
            <Text style={gs.emptyText}>Nenhum empréstimo ou reserva ativa!</Text>
          </View>
        )}

        {/* === ITENS SOLICITADOS === */}
        {itensSolicitados.length > 0 && (
          <>
            <Text style={[gs.sectionTitle, { marginTop: 16 }]}>Itens Aguardando Entrega</Text>
            {itensSolicitados.map((it) => (
              <TouchableOpacity key={it.id} style={[gs.loanCard, { backgroundColor: '#FFF3E0', borderLeftColor: '#F57C00' }]} onPress={() => router.push(`/item/${it.id}`)}>
                <Image source={{ uri: it.imagem }} style={[gs.loanImg, { borderRadius: 10 }]} />
                <View style={gs.loanInfo}>
                  <Text style={gs.loanTitle} numberOfLines={1}>{it.nome}</Text>
                  <Text style={gs.loanMeta}>{it.localEncontrado}</Text>
                  {it.solicitadoPor && <Text style={[gs.loanMeta, { color: '#F57C00' }]}>Solicitante: {it.solicitadoPor}</Text>}
                  <View style={gs.loanActions}>
                    <StatusBadge status="solicitado" />
                    <TouchableOpacity style={[gs.actionBtn, { backgroundColor: '#E65100' }]} onPress={() => handleConfirmarEntregaItem(it)}>
                      <Ionicons name="checkmark-circle" size={11} color="#FFF" />
                      <Text style={gs.actionBtnText}>Entregar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ========================= RESERVAS (ALUNO/PROFESSOR) =========================
export default function Reservas() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { livros, meusLivros, confirmarRetirada, confirmarDevolucao } = useLivros();
  const { itens, meusSolicitados, confirmarRetiradaItem } = useItens();
  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const isAtendente = usuario?.perfil === 'atendente';

  if (isAtendente) {
    return <GestaoEmprestimos livros={livros} itens={itens} router={router} confirmarRetirada={confirmarRetirada} confirmarDevolucao={confirmarDevolucao} confirmarRetiradaItem={confirmarRetiradaItem} />;
  }

  const getDeadlineColor = (d) => d < 0 ? Colors.error : d === 0 ? '#D84315' : d <= 2 ? '#F57C00' : Colors.info;

  const renderReserva = ({ item }) => {
    const diasRestantes = item.dataPrevistaDevolucao ? calcularDiasRestantes(item.dataPrevistaDevolucao) : null;
    const dlColor = diasRestantes !== null ? getDeadlineColor(diasRestantes) : '#999';

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/livro/${item.id}`)} activeOpacity={0.85}>
        <View style={styles.coverWrap}>
          <Image source={{ uri: item.capa }} style={styles.cover} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.titulo}</Text>
          <Text style={styles.meta}>{item.autor}</Text>

          {item.status === 'reservado' && (
            <View style={styles.dateRow}>
              <Ionicons name="bookmark" size={12} color={theme.accent} />
              <Text style={[styles.dateText, { color: theme.accent }]}>Reservado {formatDate(item.dataReserva)}</Text>
            </View>
          )}
          {(item.status === 'emprestado' || item.status === 'atrasado') && (
            <>
              <View style={styles.dateRow}>
                <Ionicons name="calendar" size={12} color="#999" />
                <Text style={styles.dateText}>Devolver: {formatDate(item.dataPrevistaDevolucao)}</Text>
              </View>
              <View style={[styles.deadlineBadge, { backgroundColor: dlColor }]}>
                <Ionicons name={diasRestantes < 0 ? 'alert-circle' : 'time'} size={12} color="#FFF" />
                <Text style={styles.deadlineText}>
                  {diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atrasado` : diasRestantes === 0 ? 'VENCE HOJE' : `${diasRestantes}d restante(s)`}
                </Text>
              </View>
            </>
          )}

          <View style={styles.badgeRow}>
            <StatusBadge status={item.status} />
            {item.renovacoes > 0 && (
              <View style={styles.renewBadge}>
                <Ionicons name="refresh" size={10} color={Colors.success} />
                <Text style={styles.renewText}>{item.renovacoes}x</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSolicitacao = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/item/${item.id}`)} activeOpacity={0.85}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: item.imagem }} style={styles.itemImg} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.nome}</Text>
        <View style={styles.dateRow}>
          <Ionicons name="location" size={12} color="#E65100" />
          <Text style={styles.meta}>{item.localEncontrado}</Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={12} color="#999" />
          <Text style={styles.dateText}>Solicitado {formatDate(item.dataSolicitacao)}</Text>
        </View>
        <StatusBadge status="solicitado" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.accent }]}>
        <Text style={styles.headerTitle}>Minhas Reservas</Text>
        <Text style={styles.headerSub}>{meusLivros.length + meusSolicitados.length} ativo(s)</Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={[styles.limitCard, { backgroundColor: theme.bg, borderLeftColor: theme.accent }]}>
              <Ionicons name="information-circle" size={22} color={theme.accent} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.limitTitle, { color: theme.accent }]}>Limites do Perfil</Text>
                <Text style={styles.limitText}>
                  {meusLivros.length}/{usuario?.maxLivros} livros • {usuario?.maxRenovacoes} renovação(ões) • {usuario?.prazoDias} dias
                </Text>
              </View>
            </View>

            <View style={styles.progressWrap}>
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${(meusLivros.length / (usuario?.maxLivros || 1)) * 100}%`, backgroundColor: theme.accent }]} />
              </View>
              <Text style={styles.progressText}>{meusLivros.length} de {usuario?.maxLivros} livros</Text>
            </View>

            <View style={styles.sectionRow}>
              <Ionicons name="book" size={18} color={theme.accent} />
              <Text style={styles.sectionTitle}>Livros</Text>
            </View>
            {meusLivros.length === 0 ? (
              <View style={styles.emptySection}>
                <EmptyState icon="bookmark-outline" message="Nenhuma reserva ativa." />
              </View>
            ) : (
              <FlatList data={meusLivros} keyExtractor={(item) => item.id} renderItem={renderReserva} scrollEnabled={false} />
            )}

            <View style={[styles.sectionRow, { marginTop: 20 }]}>
              <Ionicons name="cube" size={18} color={theme.accent} />
              <Text style={styles.sectionTitle}>Itens Solicitados</Text>
            </View>
            {meusSolicitados.length === 0 ? (
              <View style={styles.emptySection}>
                <EmptyState icon="search-outline" message="Nenhum item solicitado." />
              </View>
            ) : (
              <FlatList data={meusSolicitados} keyExtractor={(item) => item.id} renderItem={renderSolicitacao} scrollEnabled={false} />
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  header: {
    backgroundColor: '#111', paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderBottomWidth: 3,
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  limitCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14,
    marginBottom: 12, borderLeftWidth: 4,
  },
  limitTitle: { fontSize: 13, fontWeight: '800' },
  limitText: { fontSize: 12, color: '#666', marginTop: 2 },
  progressWrap: { marginBottom: 18 },
  progressBg: { height: 6, backgroundColor: '#E8E8E8', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#AAA', marginTop: 4, textAlign: 'right' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#222' },
  emptySection: { backgroundColor: '#FFF', borderRadius: 18, paddingVertical: 20, marginBottom: 8 },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, flexDirection: 'row', padding: 10, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  coverWrap: { borderRadius: 12, overflow: 'hidden' },
  cover: { width: 72, height: 100, backgroundColor: '#EEE' },
  imgWrap: { borderRadius: 14, overflow: 'hidden' },
  itemImg: { width: 72, height: 72, backgroundColor: '#EEE' },
  info: { flex: 1, marginLeft: 14, justifyContent: 'center', gap: 4 },
  title: { fontSize: 14, fontWeight: '800', color: '#111', letterSpacing: -0.2 },
  meta: { fontSize: 12, color: '#888' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 11, color: '#999' },
  deadlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  deadlineText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  renewBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  renewText: { fontSize: 11, color: Colors.success, fontWeight: '700' },
});

// Gestão Empréstimos styles (atendente)
const gs = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kpi: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 2 },
  kpiNum: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '600' },
  urgentBar: {
    backgroundColor: Colors.error, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  urgentBarText: { color: '#FFF', fontSize: 13, fontWeight: '700', flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#222', marginBottom: 12 },
  userSection: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#E0E0E0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  userName: { fontSize: 13, fontWeight: '800', color: '#222' },
  userEmail: { fontSize: 10, color: '#BBB' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  loanCard: {
    flexDirection: 'row', borderRadius: 12, padding: 8, marginBottom: 6,
    borderLeftWidth: 3, alignItems: 'center',
  },
  loanImg: { width: 40, height: 56, borderRadius: 6, backgroundColor: '#DDD', marginRight: 8 },
  loanInfo: { flex: 1 },
  loanTitle: { fontSize: 12, fontWeight: '700', color: '#222' },
  loanMeta: { fontSize: 10, color: '#999', marginTop: 1 },
  loanActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 14, color: '#AAA', fontWeight: '600' },
});
