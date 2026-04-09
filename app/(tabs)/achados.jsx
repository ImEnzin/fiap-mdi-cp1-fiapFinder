import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useItens } from '../../context/ItensContext';
import SearchBar from '../../components/SearchBar';
import LostItemCard from '../../components/LostItemCard';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/dateUtils';

const STATUS_FILTROS = ['Todos', 'encontrado', 'solicitado', 'retirado'];

const PERFIL_THEME = {
  aluno: { accent: Colors.primary },
  professor: { accent: Colors.primary },
  atendente: { accent: Colors.primary },
};

// ========================= GESTÃO DE ITENS (ATENDENTE) =========================
function GestaoItens({ itens, router, confirmarRetiradaItem }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const itensFiltrados = itens.filter((i) => {
    const matchBusca =
      i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      i.localEncontrado.toLowerCase().includes(busca.toLowerCase()) ||
      (i.solicitadoPor || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || i.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const encontrados = itens.filter((i) => i.status === 'encontrado');
  const solicitados = itens.filter((i) => i.status === 'solicitado');
  const retirados = itens.filter((i) => i.status === 'retirado');

  const handleConfirmarEntrega = (item) => {
    Alert.alert('Confirmar Entrega', `Entregar "${item.nome}" para ${item.solicitadoPor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => confirmarRetiradaItem(item.id) },
    ]);
  };

  const statusLabels = { Todos: 'Todos', encontrado: 'Encontrado', solicitado: 'Solicitado', retirado: 'Retirado' };
  const statusIcons = { Todos: 'apps', encontrado: 'eye', solicitado: 'hand-left', retirado: 'checkmark-done' };

  const CATEGORIAS = {};
  itens.forEach((i) => {
    const cat = i.categoria || 'Outros';
    if (!CATEGORIAS[cat]) CATEGORIAS[cat] = 0;
    CATEGORIAS[cat]++;
  });

  const renderGestaoItem = ({ item: it }) => {
    const isSolicitado = it.status === 'solicitado';
    const isRetirado = it.status === 'retirado';
    const bg = isSolicitado ? '#2D1A1A' : isRetirado ? '#1A2D1A' : Colors.darkGray;
    const borderColor = isSolicitado ? Colors.primary : isRetirado ? Colors.success : Colors.borderGray;

    return (
      <TouchableOpacity style={[gs.card, { backgroundColor: bg, borderLeftColor: borderColor }]} onPress={() => router.push(`/item/${it.id}`)}>
        <Image source={{ uri: it.imagem }} style={gs.cardImg} />
        <View style={gs.cardInfo}>
          <Text style={[gs.cardTitle, {color: Colors.white}]} numberOfLines={1}>{it.nome}</Text>
          <View style={gs.metaRow}>
            <Ionicons name="location" size={11} color="#888" />
            <Text style={gs.metaText}>{it.localEncontrado}</Text>
          </View>
          {it.solicitadoPor && (
            <View style={gs.metaRow}>
              <Ionicons name="person" size={11} color={Colors.primary} />
              <Text style={[gs.metaText, { color: Colors.primary, fontWeight: '700' }]}>{it.solicitadoPor}</Text>
            </View>
          )}

          <View style={gs.actionRow}>
            <StatusBadge status={it.status} />
            {isSolicitado && (
              <TouchableOpacity style={[gs.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => handleConfirmarEntrega(it)}>
                <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                <Text style={gs.actionBtnText}>Entregar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: Colors.primary }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="cube" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>Gestão de Itens</Text>
        </View>
        <Text style={styles.headerSub}>{itens.length} itens • {solicitados.length} p/ entregar</Text>
      </View>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderGestaoItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={gs.kpiRow}>
              <View style={[gs.kpi, { backgroundColor: '#1A233A' }]}>
                <Ionicons name="eye" size={16} color={Colors.info} />
                <Text style={[gs.kpiNum, { color: Colors.info }]}>{encontrados.length}</Text>
                <Text style={gs.kpiLabel}>Aguardando</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#2D1A25' }]}>
                <Ionicons name="hand-left" size={16} color={Colors.primary} />
                <Text style={[gs.kpiNum, { color: Colors.primary }]}>{solicitados.length}</Text>
                <Text style={gs.kpiLabel}>Solicitados</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#1A2D1A' }]}>
                <Ionicons name="checkmark-done" size={16} color={Colors.success} />
                <Text style={[gs.kpiNum, { color: Colors.success }]}>{retirados.length}</Text>
                <Text style={gs.kpiLabel}>Entregues</Text>
              </View>
            </View>

            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar item, local ou solicitante..." />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {STATUS_FILTROS.map((f) => {
                const count = f === 'Todos' ? itens.length : itens.filter(i => i.status === f).length;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, filtroStatus === f && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                    onPress={() => setFiltroStatus(f)}
                  >
                    <Ionicons name={statusIcons[f]} size={14} color={filtroStatus === f ? '#FFF' : '#888'} />
                    <Text style={[styles.filterText, filtroStatus === f && styles.filterTextActive]}>
                      {statusLabels[f]} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={<EmptyState icon="cube-outline" message="Nenhum item encontrado." />}
      />
    </View>
  );
}

export default function Achados() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { itens, confirmarRetiradaItem } = useItens();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const theme = PERFIL_THEME[usuario?.perfil] || PERFIL_THEME.aluno;
  const isAtendente = usuario?.perfil === 'atendente';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <View style={styles.container}><LoadingState message="Carregando itens..." /></View>;

  if (isAtendente) {
    return <GestaoItens itens={itens} router={router} confirmarRetiradaItem={confirmarRetiradaItem} />;
  }

  const itensFiltrados = itens.filter((i) => {
    const matchBusca =
      i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      i.localEncontrado.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || i.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const statusLabels = { Todos: 'Todos', encontrado: 'Encontrado', solicitado: 'Solicitado', retirado: 'Retirado' };
  const statusIcons = { Todos: 'apps', encontrado: 'eye', solicitado: 'hand-left', retirado: 'checkmark-done' };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.accent }]}>
        <Text style={styles.headerTitle}>Achados e Perdidos</Text>
        <Text style={styles.headerSub}>{itens.length} itens registrados</Text>
      </View>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LostItemCard item={item} onPress={() => router.push(`/item/${item.id}`)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#1A233A' }]}>
                <Ionicons name="eye" size={18} color={Colors.info} />
                <Text style={[styles.statNum, { color: Colors.info }]}>{itens.filter(i => i.status === 'encontrado').length}</Text>
                <Text style={styles.statLbl}>Encontrados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#2D1A25' }]}>
                <Ionicons name="hand-left" size={18} color={Colors.primary} />
                <Text style={[styles.statNum, { color: Colors.primary }]}>{itens.filter(i => i.status === 'solicitado').length}</Text>
                <Text style={styles.statLbl}>Solicitados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#1A2D1A' }]}>
                <Ionicons name="checkmark-done" size={18} color={Colors.success} />
                <Text style={[styles.statNum, { color: Colors.success }]}>{itens.filter(i => i.status === 'retirado').length}</Text>
                <Text style={styles.statLbl}>Retirados</Text>
              </View>
            </View>

            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar item por nome ou local..." />

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

            <View style={styles.resultRow}>
              <Text style={styles.resultText}>{itensFiltrados.length} resultado(s)</Text>
            </View>
          </>
        }
        ListEmptyComponent={<EmptyState icon="cube-outline" message="Nenhum item encontrado." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    backgroundColor: Colors.black, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderBottomWidth: 3,
  },
  headerTitle: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLbl: { fontSize: 10, color: '#888', fontWeight: '600' },
  filterRow: { marginBottom: 14, maxHeight: 44 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22,
    backgroundColor: Colors.darkGray, marginRight: 8, borderWidth: 1, borderColor: Colors.borderGray,
  },
  filterText: { fontSize: 13, color: '#999', fontWeight: '700' },
  filterTextActive: { color: '#FFF' },
  resultRow: { marginBottom: 10 },
  resultText: { fontSize: 12, color: '#AAA', fontWeight: '600' },
});

const gs = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kpi: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 3 },
  kpiNum: { fontSize: 18, fontWeight: '900' },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '600' },
  pendingBar: {
    backgroundColor: Colors.primary, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  pendingBarText: { color: '#FFF', fontSize: 13, fontWeight: '700', flex: 1 },
  resultLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 10 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.darkGray, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.borderGray,
  },
  catChipText: { fontSize: 11, color: '#888', fontWeight: '600' },
  catChipNum: { fontSize: 11, color: Colors.primary, fontWeight: '800' },
  card: {
    flexDirection: 'row', borderRadius: 14, padding: 10,
    marginBottom: 10, borderLeftWidth: 4, alignItems: 'flex-start',
  },
  cardImg: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#333', marginRight: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 10, color: '#999' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
  },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});