import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../../components/SearchBar';
import BookCard from '../../components/BookCard';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { calcularDiasRestantes, formatDate } from '../../utils/dateUtils';

const STATUS_FILTROS = ['Todos', 'disponivel', 'reservado', 'emprestado', 'atrasado'];
const { width } = Dimensions.get('window');

const PERFIL_THEME = {
  aluno: { accent: '#FF0055', bg: '#1E1E1E' },
  professor: { accent: '#FF0055', bg: '#1E1E1E' },
  atendente: { accent: '#FF0055', bg: '#1E1E1E' },
};

// ========================= GESTÃO ACERVO (ATENDENTE) =========================
function GestaoAcervo({ livros, router, confirmarRetirada, confirmarDevolucao }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const categorias = ['Todas', ...Array.from(new Set(livros.map((l) => l.categoria).filter(Boolean)))];

  const livrosFiltrados = livros.filter((l) => {
    const matchBusca =
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase()) ||
      (l.reservadoPor || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || l.status === filtroStatus;
    const matchCategoria = filtroCategoria === 'Todas' || l.categoria === filtroCategoria;
    return matchBusca && matchStatus && matchCategoria;
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, filtroCategoria === cat && { backgroundColor: '#E65100', borderColor: '#E65100' }]}
                  onPress={() => setFiltroCategoria(cat)}
                >
                  <Ionicons name="pricetag" size={14} color={filtroCategoria === cat ? '#FFF' : '#999'} />
                  <Text style={[styles.filterText, filtroCategoria === cat && styles.filterTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
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
  const { favoritos, isFavorito } = useFavoritos();
  const { theme: appTheme } = useTheme();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const perfilTheme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const isAtendente = usuario?.perfil === 'atendente';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (loading) return <View style={[styles.container, { backgroundColor: appTheme.bg }]}><LoadingState message="Carregando acervo..." /></View>;

  if (isAtendente) {
    return <GestaoAcervo livros={livros} router={router} confirmarRetirada={confirmarRetirada} confirmarDevolucao={confirmarDevolucao} />;
  }

  const livrosFiltrados = livros.filter((l) => {
    const matchBusca =
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || l.status === filtroStatus;
    const matchCategoria = filtroCategoria === 'Todas' || l.categoria === filtroCategoria;
    return matchBusca && matchStatus && matchCategoria;
  });

  const livrosFavoritos = livros.filter((l) => isFavorito(l.id));
  const categorias = ['Todas', ...Array.from(new Set(livros.map((l) => l.categoria).filter(Boolean)))];

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
    <View style={[styles.container, { backgroundColor: appTheme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: appTheme.header, borderBottomColor: perfilTheme.accent || Colors.primary }]}>
        <Text style={[styles.headerTitle, { color: appTheme.text }]}>Biblioteca</Text>
        <Text style={[styles.headerSub, { color: appTheme.subText }]}>{livros.length} livros no acervo</Text>
      </View>

      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard livro={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por título ou autor..." />

            {/* Status filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {STATUS_FILTROS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filtroStatus === f && { backgroundColor: perfilTheme.accent, borderColor: perfilTheme.accent }]}
                  onPress={() => setFiltroStatus(f)}
                >
                  <Ionicons name={statusIcons[f]} size={14} color={filtroStatus === f ? '#FFF' : '#999'} />
                  <Text style={[styles.filterText, filtroStatus === f && styles.filterTextActive]}>
                    {statusLabels[f]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, filtroCategoria === cat && { backgroundColor: perfilTheme.accent, borderColor: perfilTheme.accent }]}
                  onPress={() => setFiltroCategoria(cat)}
                >
                  <Ionicons name="pricetag" size={14} color={filtroCategoria === cat ? '#FFF' : '#999'} />
                  <Text style={[styles.filterText, filtroCategoria === cat && styles.filterTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Favoritos section */}
            {!busca && filtroStatus === 'Todos' && filtroCategoria === 'Todas' && livrosFavoritos.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={18} color={Colors.primary} />
                  <Text style={[styles.sectionTitle, { color: appTheme.text }]}>Favoritos</Text>
                  <Text style={styles.sectionCount}>{livrosFavoritos.length}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {livrosFavoritos.map((l) => (
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

            {/* Featured books carousel (only when no search/filter) */}
            {!busca && filtroStatus === 'Todos' && filtroCategoria === 'Todas' && destaques.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text style={[styles.sectionTitle, { color: appTheme.text }]}>Destaques</Text>
                </View>
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
              <Text style={[styles.resultText, { color: appTheme.subText }]}>
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
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    backgroundColor: Colors.black, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, borderBottomWidth: 4,
    borderBottomColor: Colors.primary,
  },
  headerTitle: { color: Colors.white, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  headerSub: { color: Colors.lightGray, fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  filterRow: { marginBottom: 20, maxHeight: 44 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    backgroundColor: Colors.darkGray, marginRight: 10, borderWidth: 1.5, borderColor: Colors.borderGray,
  },
  filterText: { fontSize: 13, color: Colors.mediumGray, fontWeight: '700' },
  filterTextActive: { color: Colors.white },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: 0.5, flex: 1 },
  sectionCount: { fontSize: 14, color: Colors.primary, fontWeight: '800', backgroundColor: 'rgba(255,0,85,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  featCard: { width: 160, height: 220, marginRight: 14, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.darkGray, borderWidth: 1, borderColor: Colors.primary },
  featCover: { width: '100%', height: '100%', position: 'absolute' },
  featOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.75)', padding: 14 },
  featTitle: { color: Colors.white, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  featAuthor: { color: Colors.lightGray, fontSize: 11, marginTop: 2 },
  resultRow: { marginBottom: 12 },
  resultText: { fontSize: 13, color: Colors.lightGray, fontWeight: '700' },
});

// Gestão Acervo styles (atendente)
const gs = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kpi: { 
    flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', gap: 4,
    backgroundColor: Colors.darkGray, borderWidth: 1, borderColor: Colors.borderGray,
  },
  kpiNum: { fontSize: 22, fontWeight: '900', color: Colors.white },
  kpiLabel: { fontSize: 11, color: Colors.lightGray, fontWeight: '700' },
  urgentBar: {
    backgroundColor: Colors.primary, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20,
  },
  urgentBarText: { color: Colors.white, fontSize: 14, fontWeight: '800', flex: 1 },
  resultLabel: { fontSize: 13, color: Colors.lightGray, fontWeight: '700', marginBottom: 12 },
  card: {
    flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: 18, padding: 16,
    marginBottom: 14, borderLeftWidth: 5, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    borderColor: Colors.borderGray,
  },
  cardImg: { width: 58, height: 80, borderRadius: 10, backgroundColor: Colors.mediumGray, marginRight: 14 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 0.3 },
  cardAuthor: { fontSize: 12, color: Colors.lightGray, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 11, color: Colors.mediumGray },
  urgText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
  },
  actionBtnText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
});
