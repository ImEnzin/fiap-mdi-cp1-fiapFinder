import React, { useState, useCallback } from 'react';

// Ajuste simples para republicar a versao completa.
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useItens } from '../../context/ItensContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../../components/SearchBar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/dateUtils';

const FILTROS = ['Todos', 'encontrado', 'solicitado', 'retirado'];
const FILTRO_LABELS = { Todos: 'Todos', encontrado: 'Encontrado', solicitado: 'Solicitado', retirado: 'Retirado' };
const FILTRO_ICONS = { Todos: 'apps', encontrado: 'eye', solicitado: 'hand-left', retirado: 'checkmark-done' };
const CATEGORIAS = ['Eletronico', 'Documento', 'Acessorio', 'Roupa', 'Chave', 'Carteira', 'Outros'];

function ItemCard({ item, onPress, usuario }) {
  const { theme } = useTheme();
  const statusColor = { encontrado: Colors.info, solicitado: Colors.primary, retirado: Colors.success }[item.status] || Colors.info;
  const foiReportadoPorMim = item.reportadoPor && item.reportadoPor === usuario?.email;
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderLeftColor: statusColor }]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImgWrap}>
        <Image source={{ uri: item.imagem || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400' }} style={styles.cardImg} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.nome}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location" size={12} color={Colors.primary} />
          <Text style={styles.cardMetaText} numberOfLines={1}>{item.localEncontrado}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Ionicons name="calendar" size={12} color="#666" />
          <Text style={styles.cardMetaText}>{formatDate(item.dataEncontrado)}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Ionicons name="folder" size={12} color="#666" />
          <Text style={styles.cardMetaText}>{item.categoria}</Text>
        </View>
        {foiReportadoPorMim ? (
          <View style={styles.mineBadge}>
            <Ionicons name="person-circle" size={13} color={Colors.primary} />
            <Text style={styles.mineBadgeText}>Você reportou este item</Text>
          </View>
        ) : null}
        <View style={{ marginTop: 6, alignSelf: 'flex-start' }}>
          <StatusBadge status={item.status} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#444" />
    </TouchableOpacity>
  );
}

function GestaoItens({ itens, onConfirmarEntrega }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const categoriasFiltro = ['Todas', ...Array.from(new Set(itens.map((i) => i.categoria).filter(Boolean)))];

  const encontrados = itens.filter((i) => i.status === 'encontrado').length;
  const solicitados = itens.filter((i) => i.status === 'solicitado').length;
  const retirados = itens.filter((i) => i.status === 'retirado').length;

  const itensFiltrados = itens.filter((i) => {
    const nome = (i.nome || '').toLowerCase();
    const local = (i.localEncontrado || '').toLowerCase();
    const sol = (i.solicitadoPor || '').toLowerCase();
    const q = busca.toLowerCase();
    const rep = (i.reportadoPor || '').toLowerCase();
    const matchCategoria = filtroCategoria === 'Todas' || i.categoria === filtroCategoria;
    return (nome.includes(q) || local.includes(q) || sol.includes(q) || rep.includes(q)) && (filtro === 'Todos' || i.status === filtro) && matchCategoria;
  });

  const handleEntrega = (item) => {
    Alert.alert('Confirmar Entrega', `Entregar "${item.nome}" para ${item.solicitadoPor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => onConfirmarEntrega(item.id) },
    ]);
  };

  const renderItem = ({ item }) => {
    const isSolicitado = item.status === 'solicitado';
    const isRetirado = item.status === 'retirado';
    const bg = isSolicitado ? '#2D1A1A' : isRetirado ? '#1A2D1A' : Colors.darkGray;
    const borderColor = isSolicitado ? Colors.primary : isRetirado ? Colors.success : Colors.borderGray;
    return (
      <TouchableOpacity style={[styles.gestaoCard, { backgroundColor: bg, borderLeftColor: borderColor }]} onPress={() => router.push(`/item/${item.id}`)} activeOpacity={0.85}>
        <Image source={{ uri: item.imagem || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400' }} style={styles.gestaoCardImg} />
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: Colors.white }]} numberOfLines={1}>{item.nome}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="location" size={12} color="#888" />
            <Text style={styles.cardMetaText}>{item.localEncontrado}</Text>
          </View>
          {item.solicitadoPor ? (
            <View style={styles.cardMeta}>
              <Ionicons name="person" size={12} color={Colors.primary} />
              <Text style={[styles.cardMetaText, { color: Colors.primary, fontWeight: '700' }]}>{item.solicitadoPor}</Text>
            </View>
          ) : null}
          {item.reportadoPor ? (
            <View style={styles.cardMeta}>
              <Ionicons name="person-circle" size={12} color={Colors.info} />
              <Text style={[styles.cardMetaText, { color: Colors.info, fontWeight: '700' }]}>Reportado por {item.reportadoPor}</Text>
            </View>
          ) : null}
          <View style={[styles.cardMeta, { marginTop: 6, gap: 8 }]}>
            <StatusBadge status={item.status} />
            {isSolicitado ? (
              <TouchableOpacity style={styles.entregarBtn} onPress={() => handleEntrega(item)}>
                <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                <Text style={styles.entregarBtnText}>Entregar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: Colors.primary }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="cube" size={20} color={Colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Gestao de Itens</Text>
        </View>
        <Text style={[styles.headerSub, { color: theme.subText }]}>{itens.length} itens  {solicitados} p/ entregar</Text>
      </View>
      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#1A233A' }]}>
                <Ionicons name="eye" size={16} color={Colors.info} />
                <Text style={[styles.statNum, { color: Colors.info }]}>{encontrados}</Text>
                <Text style={styles.statLbl}>Aguardando</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#2D1A25' }]}>
                <Ionicons name="hand-left" size={16} color={Colors.primary} />
                <Text style={[styles.statNum, { color: Colors.primary }]}>{solicitados}</Text>
                <Text style={styles.statLbl}>Solicitados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#1A2D1A' }]}>
                <Ionicons name="checkmark-done" size={16} color={Colors.success} />
                <Text style={[styles.statNum, { color: Colors.success }]}>{retirados}</Text>
                <Text style={styles.statLbl}>Entregues</Text>
              </View>
            </View>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar item, local ou solicitante..." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {FILTROS.map((f) => {
                const count = f === 'Todos' ? itens.length : itens.filter((i) => i.status === f).length;
                const ativo = filtro === f;
                return (
                  <TouchableOpacity key={f} style={[styles.filterChip, ativo && styles.filterChipActive]} onPress={() => setFiltro(f)}>
                    <Ionicons name={FILTRO_ICONS[f]} size={13} color={ativo ? '#FFF' : '#888'} />
                    <Text style={[styles.filterText, ativo && styles.filterTextActive]}>{FILTRO_LABELS[f]} ({count})</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {categoriasFiltro.map((cat) => {
                const ativo = filtroCategoria === cat;
                return (
                  <TouchableOpacity key={cat} style={[styles.filterChip, ativo && styles.filterChipActive]} onPress={() => setFiltroCategoria(cat)}>
                    <Ionicons name="pricetag" size={13} color={ativo ? '#FFF' : '#888'} />
                    <Text style={[styles.filterText, ativo && styles.filterTextActive]}>{cat}</Text>
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
  const { itens, confirmarRetiradaItem, reportarItem } = useItens();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportNome, setReportNome] = useState('');
  const [reportLocal, setReportLocal] = useState('');
  const [reportCategoria, setReportCategoria] = useState('Outros');
  const [reportObs, setReportObs] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const isAtendente = usuario?.perfil === 'atendente';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    setReportNome(''); setReportLocal(''); setReportCategoria('Outros'); setReportObs('');
  };

  const handleReportar = () => {
    if (!reportNome.trim()) { showToast('Informe o nome do item.', 'error'); return; }
    if (!reportLocal.trim()) { showToast('Informe onde foi encontrado.', 'error'); return; }
    setReportLoading(true);
    const result = reportarItem({ nome: reportNome, categoria: reportCategoria, localEncontrado: reportLocal, observacoes: reportObs });
    setReportLoading(false);
    if (result && result.ok) {
      showToast('Item reportado com sucesso!', 'success');
      closeModal();
    } else {
      showToast((result && result.erro) || 'Erro ao reportar item.', 'error');
    }
  };

  if (isAtendente) {
    return <GestaoItens itens={itens} onConfirmarEntrega={confirmarRetiradaItem} />;
  }

  const itensFiltrados = itens.filter((i) => {
    const nome = (i.nome || '').toLowerCase();
    const local = (i.localEncontrado || '').toLowerCase();
    const rep = (i.reportadoPor || '').toLowerCase();
    const q = busca.toLowerCase();
    const matchCategoria = filtroCategoria === 'Todas' || i.categoria === filtroCategoria;
    return (nome.includes(q) || local.includes(q) || rep.includes(q)) && (filtro === 'Todos' || i.status === filtro) && matchCategoria;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: Colors.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Achados e Perdidos</Text>
        <Text style={[styles.headerSub, { color: theme.subText }]}>{itens.length} itens registrados</Text>
      </View>

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemCard item={item} usuario={usuario} onPress={() => router.push(`/item/${item.id}`)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
        ListHeaderComponent={
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#1A233A' }]}>
                <Ionicons name="eye" size={16} color={Colors.info} />
                <Text style={[styles.statNum, { color: Colors.info }]}>{itens.filter((i) => i.status === 'encontrado').length}</Text>
                <Text style={styles.statLbl}>Encontrados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#2D1A25' }]}>
                <Ionicons name="hand-left" size={16} color={Colors.primary} />
                <Text style={[styles.statNum, { color: Colors.primary }]}>{itens.filter((i) => i.status === 'solicitado').length}</Text>
                <Text style={styles.statLbl}>Solicitados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#1A2D1A' }]}>
                <Ionicons name="checkmark-done" size={16} color={Colors.success} />
                <Text style={[styles.statNum, { color: Colors.success }]}>{itens.filter((i) => i.status === 'retirado').length}</Text>
                <Text style={styles.statLbl}>Retirados</Text>
              </View>
            </View>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar por nome ou local..." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {FILTROS.map((f) => {
                const ativo = filtro === f;
                return (
                  <TouchableOpacity key={f} style={[styles.filterChip, ativo && styles.filterChipActive]} onPress={() => setFiltro(f)}>
                    <Ionicons name={FILTRO_ICONS[f]} size={13} color={ativo ? '#FFF' : '#888'} />
                    <Text style={[styles.filterText, ativo && styles.filterTextActive]}>{FILTRO_LABELS[f]}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {['Todas', ...CATEGORIAS].map((cat) => {
                const ativo = filtroCategoria === cat;
                return (
                  <TouchableOpacity key={cat} style={[styles.filterChip, ativo && styles.filterChipActive]} onPress={() => setFiltroCategoria(cat)}>
                    <Ionicons name="pricetag" size={13} color={ativo ? '#FFF' : '#888'} />
                    <Text style={[styles.filterText, ativo && styles.filterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={styles.resultText}>{itensFiltrados.length} resultado(s)</Text>
          </>
        }
        ListEmptyComponent={<EmptyState icon="cube-outline" message="Nenhum item encontrado." />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} style={styles.modalKAV}>
            <View style={[styles.modalSheet, { backgroundColor: theme.modalBg }]}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Ionicons name="add-circle" size={22} color={Colors.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Reportar Item Encontrado</Text>
                <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.modalLabel, { color: theme.subText }]}>Nome do item *</Text>
                <TextInput style={[styles.modalInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={reportNome} onChangeText={setReportNome} placeholder="Ex: Carteira preta, iPhone 14..." placeholderTextColor={theme.placeholder} />
                <Text style={[styles.modalLabel, { color: theme.subText }]}>Local encontrado *</Text>
                <TextInput style={[styles.modalInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={reportLocal} onChangeText={setReportLocal} placeholder="Ex: Corredor 3, Sala 201..." placeholderTextColor={theme.placeholder} />
                <Text style={[styles.modalLabel, { color: theme.subText }]}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {CATEGORIAS.map((c) => {
                    const ativo = reportCategoria === c;
                    return (
                      <TouchableOpacity key={c} style={[styles.catChip, ativo && styles.catChipActive]} onPress={() => setReportCategoria(c)}>
                        <Text style={[styles.catChipText, ativo && styles.catChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <Text style={[styles.modalLabel, { color: theme.subText }]}>Observacoes (opcional)</Text>
                <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top', backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={reportObs} onChangeText={setReportObs} placeholder="Detalhes adicionais sobre o item..." placeholderTextColor={theme.placeholder} multiline />
                <TouchableOpacity style={[styles.modalBtn, (!reportNome.trim() || !reportLocal.trim() || reportLoading) && { opacity: 0.5 }]} onPress={handleReportar} disabled={reportLoading || !reportNome.trim() || !reportLocal.trim()}>
                  {reportLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="checkmark-circle" size={18} color="#FFF" />}
                  <Text style={styles.modalBtnText}>Registrar Item</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { backgroundColor: Colors.black, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  headerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLbl: { fontSize: 10, color: '#888', fontWeight: '600' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22, backgroundColor: Colors.darkGray, marginRight: 8, borderWidth: 1, borderColor: Colors.borderGray },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: '#888', fontWeight: '700' },
  filterTextActive: { color: Colors.white },
  resultText: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: Colors.darkGray, borderRadius: 18, flexDirection: 'row', padding: 12, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  cardImgWrap: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#333' },
  cardImg: { width: 80, height: 80, backgroundColor: '#222' },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  cardMetaText: { color: '#888', fontSize: 11, flex: 1 },
  mineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,0,85,0.10)',
    borderColor: 'rgba(255,0,85,0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 5,
  },
  mineBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '800' },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 58, height: 58, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalKAV: { width: '100%' },
  modalSheet: { backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 36, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: '#FFF' },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  modalInput: { backgroundColor: '#1C1C1C', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#2D2D2D', color: '#FFF', fontSize: 14, marginBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1C1C1C', borderWidth: 1.5, borderColor: '#2D2D2D', marginRight: 8 },
  catChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,0,85,0.12)' },
  catChipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: Colors.primary, fontWeight: '800' },
  modalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15, marginTop: 18 },
  modalBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  gestaoCard: { flexDirection: 'row', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 4, alignItems: 'flex-start' },
  gestaoCardImg: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#333', marginRight: 12 },
  entregarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  entregarBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
