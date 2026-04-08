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
  aluno: { accent: '#FF0055' },
  professor: { accent: '#FF0055' },
  atendente: { accent: '#FF0055' },
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
    const bg = isSolicitado ? '#FFF3E0' : isRetirado ? '#E8F5E9' : '#F5F5F5';
    const borderColor = isSolicitado ? '#FF0055' : isRetirado ? Colors.success : '#E0E0E0';

    return (
      <TouchableOpacity style={[gs.card, { backgroundColor: bg, borderLeftColor: borderColor }]} onPress={() => router.push(`/item/${it.id}`)}>
        <Image source={{ uri: it.imagem }} style={gs.cardImg} />
        <View style={gs.cardInfo}>
          <Text style={gs.cardTitle} numberOfLines={1}>{it.nome}</Text>
          <View style={gs.metaRow}>
            <Ionicons name="location" size={11} color="#999" />
            <Text style={gs.metaText}>{it.localEncontrado}</Text>
          </View>
          {it.dataEncontrado && (
            <View style={gs.metaRow}>
              <Ionicons name="calendar" size={11} color="#999" />
              <Text style={gs.metaText}>Encontrado: {formatDate(it.dataEncontrado)}</Text>
            </View>
          )}
          {it.solicitadoPor && (
            <View style={gs.metaRow}>
              <Ionicons name="person" size={11} color="#FF0055" />
              <Text style={[gs.metaText, { color: '##FF0055', fontWeight: '700' }]}>{it.solicitadoPor}</Text>
            </View>
          )}
          {it.dataSolicitacao && (
            <View style={gs.metaRow}>
              <Ionicons name="time" size={11} color="#999" />
              <Text style={gs.metaText}>Solicitado: {formatDate(it.dataSolicitacao)}</Text>
            </View>
          )}

          <View style={gs.actionRow}>
            <StatusBadge status={it.status} />
            {isSolicitado && (
              <TouchableOpacity style={[gs.actionBtn, { backgroundColor: '#FF0055' }]} onPress={() => handleConfirmarEntrega(it)}>
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
      <View style={[styles.header, { borderBottomColor: '#FF0055' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="cube" size={22} color="#FF0055" />
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
            {/* KPI row */}
            <View style={gs.kpiRow}>
              <View style={[gs.kpi, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="eye" size={16} color={Colors.info} />
                <Text style={[gs.kpiNum, { color: Colors.info }]}>{encontrados.length}</Text>
                <Text style={gs.kpiLabel}>Aguardando</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="hand-left" size={16} color="#FF0055" />
                <Text style={[gs.kpiNum, { color: '#FF0055' }]}>{solicitados.length}</Text>
                <Text style={gs.kpiLabel}>Solicitados</Text>
              </View>
              <View style={[gs.kpi, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-done" size={16} color={Colors.success} />
                <Text style={[gs.kpiNum, { color: Colors.success }]}>{retirados.length}</Text>
                <Text style={gs.kpiLabel}>Entregues</Text>
              </View>
            </View>

            {/* Pending deliveries alert */}
            {solicitados.length > 0 && (
              <View style={gs.pendingBar}>
                <Ionicons name="notifications" size={16} color="#FFF" />
                <Text style={gs.pendingBarText}>{solicitados.length} item(ns) aguardando entrega ao solicitante!</Text>
              </View>
            )}

            {/* Category breakdown */}
            {Object.keys(CATEGORIAS).length > 0 && (
              <View style={gs.catRow}>
                {Object.entries(CATEGORIAS).map(([cat, count]) => (
                  <View key={cat} style={gs.catChip}>
                    <Text style={gs.catChipText}>{cat}</Text>
                    <Text style={gs.catChipNum}>{count}</Text>
                  </View>
                ))}
              </View>
            )}

            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar item, local ou solicitante..." />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {STATUS_FILTROS.map((f) => {
                const count = f === 'Todos' ? itens.length : itens.filter(i => i.status === f).length;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, filtroStatus === f && { backgroundColor: '#FF0055', borderColor: '#FF0055' }]}
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

            <Text style={gs.resultLabel}>{itensFiltrados.length} resultado(s)</Text>
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

  const statusLabels = {
    Todos: 'Todos',
    encontrado: 'Encontrado',
    solicitado: 'Solicitado',
    retirado: 'Retirado',
  };

  const statusIcons = {
    Todos: 'apps',
    encontrado: 'eye',
    solicitado: 'hand-left',
    retirado: 'checkmark-done',
  };

  const encontrados = itens.filter((i) => i.status === 'encontrado').length;
  const solicitados = itens.filter((i) => i.status === 'solicitado').length;
  const retirados = itens.filter((i) => i.status === 'retirado').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.accent }]}>
        <Text style={styles.headerTitle}>Achados e Perdidos</Text>
        <Text style={styles.headerSub}>{itens.length} itens registrados</Text>
      </View>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LostItemCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="eye" size={18} color={Colors.info} />
                <Text style={[styles.statNum, { color: Colors.info }]}>{encontrados}</Text>
                <Text style={styles.statLbl}>Encontrados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="hand-left" size={18} color="#FF0055" />
                <Text style={[styles.statNum, { color: '#FF0055' }]}>{solicitados}</Text>
                <Text style={styles.statLbl}>Solicitados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-done" size={18} color={Colors.success} />
                <Text style={[styles.statNum, { color: Colors.success }]}>{retirados}</Text>
                <Text style={styles.statLbl}>Retirados</Text>
              </View>
            </View>

            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar item por nome ou local..." />

            {/* Filters */}
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
        ListEmptyComponent={
          loading ? (
            <LoadingState message="Buscando itens..." />
          ) : (
            <EmptyState icon="cube-outline" message="Nenhum item encontrado para sua busca." />
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
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4,
  },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLbl: { fontSize: 10, color: '#888', fontWeight: '600' },
  filterRow: { marginBottom: 14, maxHeight: 44 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22,
    backgroundColor: '#FFF', marginRight: 8, borderWidth: 1.5, borderColor: '#E8E8E8',
  },
  filterText: { fontSize: 13, color: '#999', fontWeight: '700' },
  filterTextActive: { color: '#FFF' },
  resultRow: { marginBottom: 10 },
  resultText: { fontSize: 12, color: '#AAA', fontWeight: '600' },
});

// Gestão Itens styles (atendente)
const gs = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kpi: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 3 },
  kpiNum: { fontSize: 18, fontWeight: '900' },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '600' },
  pendingBar: {
    backgroundColor: '#FF0055', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  pendingBarText: { color: '#FFF', fontSize: 13, fontWeight: '700', flex: 1 },
  resultLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 10 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0',
  },
  catChipText: { fontSize: 11, color: '#666', fontWeight: '600' },
  catChipNum: { fontSize: 11, color: '#FF0055', fontWeight: '800' },
  card: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, padding: 10,
    marginBottom: 10, borderLeftWidth: 4, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardImg: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#DDD', marginRight: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 10, color: '#999' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
  },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
