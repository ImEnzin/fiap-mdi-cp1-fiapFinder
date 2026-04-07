import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import SearchBar from '../../components/SearchBar';
import BookCard from '../../components/BookCard';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { calcularDiasRestantes, formatDate } from '../../utils/dateUtils';

const STATUS_FILTROS = ['Todos', 'disponivel', 'reservado', 'emprestado', 'atrasado'];
const { width } = Dimensions.get('window');

const PERFIL_THEME = {
  aluno: { accent: '#1976D2', bg: '#E3F2FD' },
  professor: { accent: '#7B1FA2', bg: '#F3E5F5' },
  atendente: { accent: '#E65100', bg: '#FFF3E0' },
};

// ========================= GESTÃO ACERVO (ATENDENTE) =========================
function GestaoAcervo({ livros, router, confirmarRetirada, confirmarDevolucao }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const livrosFiltrados = livros.filter((l) => {
    const matchBusca =
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase()) ||
      (l.reservadoPor || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const atrasados = livros.filter((l) => l.status === 'atrasado');
  const emprestados = livros.filter((l) => l.status === 'emprestado');
  const reservados = livros.filter((l) => l.status === 'reservado');
  const disponiveis = livros.filter((l) => l.status === 'disponivel');

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

  const getColor = (d) => d < 0 ? Colors.error : d === 0 ? '#D84315' : d <= 3 ? '#F57C00' : d <= 5 ? '#FFA726' : Colors.success;
  const getBg = (d) => d < 0 ? '#FFEBEE' : d === 0 ? '#FBE9E7' : d <= 3 ? '#FFF3E0' : d <= 5 ? '#FFF8E1' : '#F5F5F5';

  const statusLabels = { Todos: 'Todos', disponivel: 'Disponível', reservado: 'Reservado', emprestado: 'Emprestado', atrasado: 'Atrasado' };
  const statusIcons = { Todos: 'apps', disponivel: 'checkmark-circle', reservado: 'bookmark', emprestado: 'book', atrasado: 'alert-circle' };

  const renderGestaoItem = ({ item: l }) => {
    const d = l.dataPrevistaDevolucao ? calcularDiasRestantes(l.dataPrevistaDevolucao) : null;
    const c = d !== null ? getColor(d) : (l.status === 'reservado' ? '#7B1FA2' : l.status === 'disponivel' ? Colors.success : '#999');
    const bg = d !== null ? getBg(d) : (l.status === 'reservado' ? '#F3E5F5' : l.status === 'disponivel' ? '#E8F5E9' : '#F5F5F5');

    return (
      <TouchableOpacity style={[gs.card, { backgroundColor: bg, borderLeftColor: c }]} onPress={() => router.push(`/livro/${l.id}`)}>
        <Image source={{ uri: l.capa }} style={gs.cardImg} />
        <View style={gs.cardInfo}>
          <Text style={gs.cardTitle} numberOfLines={1}>{l.titulo}</Text>
          <Text style={gs.cardAuthor}>{l.autor}</Text>

          {l.reservadoPor && (
            <View style={gs.metaRow}>
              <Ionicons name="person" size={11} color="#999" />
              <Text style={gs.metaText}>{l.reservadoPor}</Text>
            </View>
          )}
          {l.dataPrevistaDevolucao && (
            <View style={gs.metaRow}>
              <Ionicons name="calendar" size={11} color="#999" />
              <Text style={gs.metaText}>Devolver: {formatDate(l.dataPrevistaDevolucao)}</Text>
              {d !== null && <Text style={[gs.urgText, { color: c }]}> ({d < 0 ? `${Math.abs(d)}d atraso` : d === 0 ? 'HOJE' : `${d}d`})</Text>}
            </View>
          )}
          {l.dataReserva && l.status === 'reservado' && (
            <View style={gs.metaRow}>
              <Ionicons name="time" size={11} color="#999" />
              <Text style={gs.metaText}>Reservado: {formatDate(l.dataReserva)}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={gs.actionRow}>
            <StatusBadge status={l.status} />
            {l.status === 'reservado' && (
              <TouchableOpacity style={[gs.actionBtn, { backgroundColor: '#E65100' }]} onPress={() => handleConfirmarRetirada(l)}>
                <Ionicons name="log-out" size={12} color="#FFF" />
                <Text style={gs.actionBtnText}>Entregar</Text>
              </TouchableOpacity>
            )}
            {(l.status === 'emprestado' || l.status === 'atrasado') && (
              <TouchableOpacity style={[gs.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleConfirmarDevolucao(l)}>
                <Ionicons name="log-in" size={12} color="#FFF" />
                <Text style={gs.actionBtnText}>Devolver</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: '#E65100' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="library" size={22} color="#E65100" />
          <Text style={styles.headerTitle}>Gestão do Acervo</Text>
        </View>
        <Text style={styles.headerSub}>{livros.length} livros • {atrasados.length} atrasados • {reservados.length} aguardando</Text>
      </View>

      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderGestaoItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* KPI Summary */}
            <View style={gs.kpiRow}>
              <View style={[gs.kpi, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[gs.kpiNum, { color: Colors.success }]}>{disponiveis.length}</Text>
                <Text style={gs.kpiLabel}>Disponível</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="bookmark" size={16} color="#7B1FA2" />
                <Text style={[gs.kpiNum, { color: '#7B1FA2' }]}>{reservados.length}</Text>
                <Text style={gs.kpiLabel}>Reservado</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="book" size={16} color={Colors.info} />
                <Text style={[gs.kpiNum, { color: Colors.info }]}>{emprestados.length}</Text>
                <Text style={gs.kpiLabel}>Emprestado</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={[gs.kpiNum, { color: Colors.error }]}>{atrasados.length}</Text>
                <Text style={gs.kpiLabel}>Atrasado</Text>
              </View>
            </View>

            {/* Alerta urgente */}
            {atrasados.length > 0 && (
              <View style={gs.urgentBar}>
                <Ionicons name="warning" size={16} color="#FFF" />
                <Text style={gs.urgentBarText}>{atrasados.length} livro(s) em atraso — ação necessária!</Text>
              </View>
            )}

            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar livro, autor ou usuário..." />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {STATUS_FILTROS.map((f) => {
                const count = f === 'Todos' ? livros.length : livros.filter(l => l.status === f).length;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, filtroStatus === f && { backgroundColor: '#E65100', borderColor: '#E65100' }]}
                    onPress={() => setFiltroStatus(f)}
                  >
                    <Ionicons name={statusIcons[f]} size={14} color={filtroStatus === f ? '#FFF' : '#999'} />
                    <Text style={[styles.filterText, filtroStatus === f && styles.filterTextActive]}>
                      {statusLabels[f]} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={gs.resultLabel}>{livrosFiltrados.length} resultado(s)</Text>
          </>
        }
        ListEmptyComponent={<EmptyState icon="book-outline" message="Nenhum livro encontrado." />}
      />
    </View>
  );
}

export default function Biblioteca() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { livros, confirmarRetirada, confirmarDevolucao } = useLivros();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const isAtendente = usuario?.perfil === 'atendente';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <View style={styles.container}><LoadingState message="Carregando acervo..." /></View>;

  if (isAtendente) {
    return <GestaoAcervo livros={livros} router={router} confirmarRetirada={confirmarRetirada} confirmarDevolucao={confirmarDevolucao} />;
  }

  const livrosFiltrados = livros.filter((l) => {
    const matchBusca =
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const statusLabels = {
    Todos: 'Todos',
    disponivel: 'Disponível',
    reservado: 'Reservado',
    emprestado: 'Emprestado',
    atrasado: 'Atrasado',
  };

  const statusIcons = {
    Todos: 'apps',
    disponivel: 'checkmark-circle',
    reservado: 'bookmark',
    emprestado: 'book',
    atrasado: 'alert-circle',
  };

  const destaques = livros.filter((l) => l.status === 'disponivel').slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.accent }]}>
        <Text style={styles.headerTitle}>Biblioteca</Text>
        <Text style={styles.headerSub}>{livros.length} livros no acervo</Text>
      </View>

      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard livro={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por título ou autor..." />

            {/* Status filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {STATUS_FILTROS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filtroStatus === f && { backgroundColor: theme.accent, borderColor: theme.accent }]}
                  onPress={() => setFiltroStatus(f)}
                >
                  <Ionicons name={statusIcons[f]} size={14} color={filtroStatus === f ? '#FFF' : '#999'} />
                  <Text style={[styles.filterText, filtroStatus === f && styles.filterTextActive]}>
                    {statusLabels[f]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured books carousel (only when no search/filter) */}
            {!busca && filtroStatus === 'Todos' && destaques.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Destaques</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {destaques.map((l) => (
                    <TouchableOpacity key={l.id} style={styles.featCard} onPress={() => router.push(`/livro/${l.id}`)}>
                      <Image source={{ uri: l.capa }} style={styles.featCover} />
                      <View style={styles.featOverlay}>
                        <Text style={styles.featTitle} numberOfLines={2}>{l.titulo}</Text>
                        <Text style={styles.featAuthor} numberOfLines={1}>{l.autor}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Result count */}
            <View style={styles.resultRow}>
              <Text style={styles.resultText}>
                {livrosFiltrados.length} resultado(s)
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState message="Buscando livros..." />
          ) : (
            <EmptyState icon="book-outline" message="Nenhum livro encontrado para sua busca." />
          )
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
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  filterRow: { marginBottom: 14, maxHeight: 44 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22,
    backgroundColor: '#FFF', marginRight: 8, borderWidth: 1.5, borderColor: '#E8E8E8',
  },
  filterText: { fontSize: 13, color: '#999', fontWeight: '700' },
  filterTextActive: { color: '#FFF' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#222', marginBottom: 12 },
  featCard: { width: 150, height: 210, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#222' },
  featCover: { width: '100%', height: '100%', position: 'absolute' },
  featOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', padding: 10 },
  featTitle: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  featAuthor: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  resultRow: { marginBottom: 10 },
  resultText: { fontSize: 12, color: '#AAA', fontWeight: '600' },
});

// Gestão Acervo styles (atendente)
const gs = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kpi: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 3 },
  kpiNum: { fontSize: 18, fontWeight: '900' },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '600' },
  urgentBar: {
    backgroundColor: Colors.error, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  urgentBarText: { color: '#FFF', fontSize: 13, fontWeight: '700', flex: 1 },
  resultLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 10 },
  card: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, padding: 10,
    marginBottom: 10, borderLeftWidth: 4, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardImg: { width: 50, height: 70, borderRadius: 8, backgroundColor: '#DDD', marginRight: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  cardAuthor: { fontSize: 11, color: '#999', marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 10, color: '#999' },
  urgText: { fontSize: 10, fontWeight: '800' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
  },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});