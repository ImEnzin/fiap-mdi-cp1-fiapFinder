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
  aluno: { accent: '##FF0055', bg: '#E3F2FD', icon: 'school' },
  professor: { accent: '#FF0055', bg: '#F3E5F5', icon: 'briefcase' },
  atendente: { accent: '#FF0055', bg: '#FFF3E0', icon: 'shield-checkmark' },
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
  label: { fontSize: 12, color: '#666', fontWeight: '600' },
  pct: { fontSize: 12, fontWeight: '800' },
  track: { height: 8, backgroundColor: '#E8E8E8', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  detail: { fontSize: 10, color: '#BBB', marginTop: 2, textAlign: 'right' },
});

// ========================= PAINEL ATENDENTE =========================
function PainelAtendente({ livros, itens, router, theme }) {
  const total = livros.length;
  const disponiveis = livros.filter((l) => l.status === 'disponivel');
  const atrasados = livros.filter((l) => l.status === 'atrasado');
  const emprestados = livros.filter((l) => l.status === 'emprestado');
  const reservasPendentes = livros.filter((l) => l.status === 'reservado');
  const itensSolicitados = itens.filter((i) => i.status === 'solicitado');
  const itensEncontrados = itens.filter((i) => i.status === 'encontrado');
  const itensRetirados = itens.filter((i) => i.status === 'retirado');

  const emCirculacao = emprestados.length + atrasados.length;
  const taxaOcupacao = total > 0 ? ((emCirculacao + reservasPendentes.length) / total * 100).toFixed(0) : 0;

  const vencendoEm3 = emprestados.filter((l) => {
    if (!l.dataPrevistaDevolucao) return false;
    const d = calcularDiasRestantes(l.dataPrevistaDevolucao);
    return d >= 0 && d <= 3;
  });

  const todosEmprestimos = [...atrasados, ...emprestados].sort((a, b) => {
    const da = a.dataPrevistaDevolucao ? calcularDiasRestantes(a.dataPrevistaDevolucao) : 999;
    const db = b.dataPrevistaDevolucao ? calcularDiasRestantes(b.dataPrevistaDevolucao) : 999;
    return da - db;
  });

  // Usuários únicos com empréstimo
  const usuariosAtivos = [...new Set([...emprestados, ...atrasados, ...reservasPendentes].map(l => l.reservadoPor).filter(Boolean))];

  const getColor = (d) => d < 0 ? Colors.error : d === 0 ? '#D84315' : d <= 3 ? '#F57C00' : d <= 5 ? '#FFA726' : Colors.success;
  const getBg = (d) => d < 0 ? '#FFEBEE' : d === 0 ? '#FBE9E7' : d <= 3 ? '#FFF3E0' : d <= 5 ? '#FFF8E1' : '#E8F5E9';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

      {/* ── ALERTAS URGENTES ── */}
      {atrasados.length > 0 && (
        <View style={s.urgentBanner}>
          <View style={s.urgentIconWrap}>
            <Ionicons name="alert-circle" size={22} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.urgentTitle}>{atrasados.length} livro(s) em atraso!</Text>
            <Text style={s.urgentSub}>Ação necessária — contate os usuários</Text>
          </View>
        </View>
      )}

      {/* ── RESUMO DO DIA ── */}
      <Text style={s.sectionTitle}>Resumo Geral</Text>
      <View style={s.kpiGrid}>
        <View style={[s.kpiCard, { backgroundColor: '#111' }]}>
          <Ionicons name="library" size={18} color="#FF0055" />
          <Text style={[s.kpiNum, { color: '#FF0055' }]}>{total}</Text>
          <Text style={s.kpiLabel}>Acervo Total</Text>
        </View>
        <View style={[s.kpiCard, { backgroundColor: '#111' }]}>
          <Ionicons name="trending-up" size={18} color="#FFB74D" />
          <Text style={[s.kpiNum, { color: '#FFB74D' }]}>{taxaOcupacao}%</Text>
          <Text style={s.kpiLabel}>Taxa Ocupação</Text>
        </View>
        <View style={[s.kpiCard, { backgroundColor: '#111' }]}>
          <Ionicons name="people" size={18} color="#4FC3F7" />
          <Text style={[s.kpiNum, { color: '#4FC3F7' }]}>{usuariosAtivos.length}</Text>
          <Text style={s.kpiLabel}>Usuários Ativos</Text>
        </View>
      </View>

      {/* ── STATUS DO ACERVO ── */}
      <Text style={s.sectionTitle}>Status do Acervo</Text>
      <View style={s.acervoCard}>
        <ProgressBar value={disponiveis.length} max={total} color={Colors.success} label="Disponível" />
        <ProgressBar value={emCirculacao} max={total} color={Colors.info} label="Em circulação" />
        <ProgressBar value={reservasPendentes.length} max={total} color='#FF0055' label="Reservado (aguardando)" />
        <ProgressBar value={atrasados.length} max={total} color={Colors.error} label="Atrasados" />
      </View>

      {/* ── PAINEL DE ALERTAS ── */}
      <Text style={s.sectionTitle}>Painel de Alertas</Text>
      <View style={s.alertGrid}>
        {[
          { n: atrasados.length, label: 'Livros\nAtrasados', icon: 'alert-circle', color: Colors.error, bg: '#FFEBEE' },
          { n: vencendoEm3.length, label: 'Vencendo\nem 3 dias', icon: 'warning', color: '#FF0055', bg: '#FFF3E0' },
          { n: reservasPendentes.length, label: 'Reservas\nPendentes', icon: 'bookmark', color: '#FF0055', bg: '#F3E5F5' },
          { n: itensSolicitados.length, label: 'Itens p/\nEntregar', icon: 'cube', color: Colors.info, bg: '#E3F2FD' },
    ].map((a, i) => (
          <View key={i} style={[s.alertBox, { backgroundColor: a.bg }]}>
            <View style={[s.alertIconBox, { backgroundColor: a.color }]}>
              <Ionicons name={a.icon} size={18} color="#FFF" />
            </View>
            <Text style={[s.alertNum, { color: a.color }]}>{a.n}</Text>
            <Text style={s.alertLabel}>{a.label}</Text>
          </View>
        ))}
      </View>

      {/* ── AÇÕES RÁPIDAS ── */}
      <Text style={s.sectionTitle}>Ações Rápidas</Text>
      <View style={s.actionsRow}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FF0055' }]} onPress={() => router.push('/biblioteca')}>
          <Ionicons name="library" size={20} color="#FFF" />
          <Text style={s.actionText}>Gestão{'\n'}Acervo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '##FF0055' }]} onPress={() => router.push('/reservas')}>
          <Ionicons name="swap-horizontal" size={20} color="#FFF" />
          <Text style={s.actionText}>Todos{'\n'}Empréstimos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '##FF0055' }]} onPress={() => router.push('/achados')}>
          <Ionicons name="cube" size={20} color="#FFF" />
          <Text style={s.actionText}>Gestão{'\n'}Itens</Text>
        </TouchableOpacity>
      </View>

      {/* ── SITUAÇÃO POR USUÁRIO ── */}
      {usuariosAtivos.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Situação por Usuário</Text>
          {usuariosAtivos.map((email) => {
            const livrosUser = [...emprestados, ...atrasados, ...reservasPendentes].filter(l => l.reservadoPor === email);
            const temAtraso = livrosUser.some(l => l.status === 'atrasado');
            const nomeDisplay = email.split('@')[0];
            return (
              <View key={email} style={[s.userCard, temAtraso && { borderLeftColor: Colors.error }]}>
                <View style={[s.userAvatar, { backgroundColor: temAtraso ? '#FFCDD2' : '#E3F2FD' }]}>
                  <Ionicons name={temAtraso ? 'alert' : 'person'} size={16} color={temAtraso ? Colors.error : Colors.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{nomeDisplay}</Text>
                  <Text style={s.userEmail}>{email}</Text>
                  <View style={s.userChips}>
                    {livrosUser.map((l) => {
                      const d = l.dataPrevistaDevolucao ? calcularDiasRestantes(l.dataPrevistaDevolucao) : null;
                      const chipColor = l.status === 'atrasado' ? Colors.error : l.status === 'reservado' ? '#FF0055' : d !== null && d <= 3 ? '##FF0055' : Colors.info;
                      return (
                        <TouchableOpacity key={l.id} style={[s.userChip, { backgroundColor: chipColor + '18', borderColor: chipColor }]} onPress={() => router.push(`/livro/${l.id}`)}>
                          <Text style={[s.userChipText, { color: chipColor }]} numberOfLines={1}>{l.titulo.substring(0, 18)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <Text style={[s.userCount, { color: temAtraso ? Colors.error : '#999' }]}>{livrosUser.length}</Text>
              </View>
            );
          })}
        </>
      )}

      {/* ── DEVOLUÇÕES MAIS URGENTES ── */}
      <Text style={[s.sectionTitle, { marginTop: 8 }]}>Devoluções — Ordem de Urgência</Text>
      {todosEmprestimos.length === 0 ? (
        <View style={s.emptyBox}>
          <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
          <Text style={s.emptyText}>Nenhum empréstimo ativo</Text>
        </View>
      ) : todosEmprestimos.slice(0, 6).map((l) => {
        const d = l.dataPrevistaDevolucao ? calcularDiasRestantes(l.dataPrevistaDevolucao) : null;
        const c = d !== null ? getColor(d) : '#999';
        const bg = d !== null ? getBg(d) : '#F5F5F5';
        return (
          <TouchableOpacity key={l.id} style={[s.gestaoCard, { backgroundColor: bg, borderLeftColor: c }]} onPress={() => router.push(`/livro/${l.id}`)}>
            <Image source={{ uri: l.capa }} style={s.gestaoImg} />
            <View style={s.gestaoInfo}>
              <Text style={s.gestaoTitle} numberOfLines={1}>{l.titulo}</Text>
              <Text style={s.gestaoSub}>{l.autor}</Text>
              <View style={s.gestaoMeta}>
                <Ionicons name="person" size={11} color="#999" />
                <Text style={s.gestaoMetaText}>{l.reservadoPor}</Text>
              </View>
              {l.dataPrevistaDevolucao && (
                <View style={s.gestaoMeta}>
                  <Ionicons name="calendar" size={11} color="#999" />
                  <Text style={s.gestaoMetaText}>{formatDate(l.dataPrevistaDevolucao)}</Text>
                </View>
              )}
            </View>
            <View style={[s.gestaoBadge, { backgroundColor: c }]}>
              <Text style={s.gestaoBadgeText}>
                {d === null ? '—' : d < 0 ? `${Math.abs(d)}d atraso` : d === 0 ? 'HOJE' : `${d}d`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* ── RESERVAS AGUARDANDO RETIRADA ── */}
      {reservasPendentes.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: 12 }]}>Aguardando Retirada</Text>
          {reservasPendentes.map((l) => (
            <TouchableOpacity key={l.id} style={[s.gestaoCard, { backgroundColor: '#F3E5F5', borderLeftColor: '#FF0055' }]} onPress={() => router.push(`/livro/${l.id}`)}>
              <Image source={{ uri: l.capa }} style={s.gestaoImg} />
              <View style={s.gestaoInfo}>
                <Text style={s.gestaoTitle} numberOfLines={1}>{l.titulo}</Text>
                <View style={s.gestaoMeta}>
                  <Ionicons name="person" size={11} color="#999" />
                  <Text style={s.gestaoMetaText}>{l.reservadoPor}</Text>
                </View>
              </View>
              <View style={[s.gestaoBadge, { backgroundColor: '#FF0055' }]}>
                <Text style={s.gestaoBadgeText}>Retirar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* ── ITENS SOLICITADOS ── */}
      {itensSolicitados.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: 12 }]}>Itens Aguardando Entrega</Text>
          {itensSolicitados.map((it) => (
            <TouchableOpacity key={it.id} style={[s.gestaoCard, { backgroundColor: '#E3F2FD', borderLeftColor: Colors.info }]} onPress={() => router.push(`/item/${it.id}`)}>
              <Image source={{ uri: it.imagem }} style={s.gestaoImgSquare} />
              <View style={s.gestaoInfo}>
                <Text style={s.gestaoTitle} numberOfLines={1}>{it.nome}</Text>
                <View style={s.gestaoMeta}>
                  <Ionicons name="person" size={11} color="#999" />
                  <Text style={s.gestaoMetaText}>{it.solicitadoPor}</Text>
                </View>
                <View style={s.gestaoMeta}>
                  <Ionicons name="location" size={11} color="#999" />
                  <Text style={s.gestaoMetaText}>{it.localEncontrado}</Text>
                </View>
              </View>
              <View style={[s.gestaoBadge, { backgroundColor: Colors.info }]}>
                <Text style={s.gestaoBadgeText}>Entregar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* ── STATUS ACHADOS ── */}
      <Text style={[s.sectionTitle, { marginTop: 12 }]}>Achados e Perdidos</Text>
      <View style={s.acervoCard}>
        <ProgressBar value={itensEncontrados.length} max={itens.length} color={Colors.info} label="Aguardando dono" />
        <ProgressBar value={itensSolicitados.length} max={itens.length} color="#FF0055" label="Solicitados" />
        <ProgressBar value={itensRetirados.length} max={itens.length} color={Colors.success} label="Entregues" />
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ========================= HOME ALUNO / PROFESSOR =========================
function HomeUser({ usuario, livros, meusLivros, itens, router, theme }) {
  const emprestados = meusLivros.filter((l) => l.status === 'emprestado' || l.status === 'atrasado');
  const reservados = meusLivros.filter((l) => l.status === 'reservado');
  const itensDisp = itens.filter((i) => i.status === 'encontrado').length;
  const disponiveis = livros.filter((l) => l.status === 'disponivel');

  const proxima = emprestados
    .filter((l) => l.dataPrevistaDevolucao)
    .sort((a, b) => a.dataPrevistaDevolucao.localeCompare(b.dataPrevistaDevolucao))[0];
  const diasProx = proxima ? calcularDiasRestantes(proxima.dataPrevistaDevolucao) : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Role badge */}
      <View style={[s.roleBadge, { backgroundColor: theme.accent }]}>
        <Ionicons name={theme.icon} size={14} color="#FFF" />
        <Text style={s.roleBadgeText}>{usuario?.tipo}</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow3}>
        <View style={[s.statCard3, { backgroundColor: theme.accent }]}>
          <Ionicons name="bookmark" size={20} color="#FFF" />
          <Text style={s.statNum3}>{reservados.length}</Text>
          <Text style={s.statLbl3}>Reservados</Text>
        </View>
        <View style={[s.statCard3, { backgroundColor: '#222' }]}>
          <Ionicons name="book" size={20} color="#FFF" />
          <Text style={s.statNum3}>{emprestados.length}</Text>
          <Text style={s.statLbl3}>Emprestados</Text>
        </View>
        <View style={[s.statCard3, { backgroundColor: Colors.info }]}>
          <Ionicons name="cube" size={20} color="#FFF" />
          <Text style={s.statNum3}>{itensDisp}</Text>
          <Text style={s.statLbl3}>Achados</Text>
        </View>
      </View>

      {/* Alerta de prazo */}
      {proxima && (
        <TouchableOpacity
          style={[s.alertCard, diasProx < 0 ? s.alertDanger : diasProx <= 2 ? s.alertWarn : s.alertOk]}
          onPress={() => router.push(`/livro/${proxima.id}`)}
        >
          <Ionicons name={diasProx < 0 ? 'alert-circle' : 'time'} size={22} color="#FFF" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.alertTitle}>
              {diasProx < 0 ? `Atrasado ${Math.abs(diasProx)} dia(s)!` : diasProx === 0 ? 'Devolução é HOJE!' : `${diasProx} dia(s) para devolver`}
            </Text>
            <Text style={s.alertSub} numberOfLines={1}>{proxima.titulo}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      )}

      {/* Acesso rápido */}
      <Text style={s.sectionTitle}>Acesso Rápido</Text>
      <View style={s.quickRow}>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/biblioteca')}>
          <View style={[s.quickIcon, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="book" size={26} color={Colors.primary} />
          </View>
          <Text style={s.quickLabel}>Biblioteca</Text>
          <Text style={s.quickCount}>{livros.length} livros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/achados')}>
          <View style={[s.quickIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="search" size={26} color={Colors.info} />
          </View>
          <Text style={s.quickLabel}>Achados</Text>
          <Text style={s.quickCount}>{itens.length} itens</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.quickCard} onPress={() => router.push('/reservas')}>
          <View style={[s.quickIcon, { backgroundColor: theme.bg }]}>
            <Ionicons name="bookmark" size={26} color={theme.accent} />
          </View>
          <Text style={s.quickLabel}>Reservas</Text>
          <Text style={s.quickCount}>{meusLivros.length} ativo(s)</Text>
        </TouchableOpacity>
      </View>

      {/* Livros disponíveis - destaque visual */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Disponíveis para Reserva</Text>
        <TouchableOpacity onPress={() => router.push('/biblioteca')}>
          <Text style={[s.seeAll, { color: theme.accent }]}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {disponiveis.slice(0, 8).map((l) => (
          <TouchableOpacity key={l.id} style={s.bookCard} onPress={() => router.push(`/livro/${l.id}`)}>
            <Image source={{ uri: l.capa }} style={s.bookCover} />
            <View style={s.bookOverlay}>
              <Text style={s.bookTitle} numberOfLines={2}>{l.titulo}</Text>
              <Text style={s.bookAuthor} numberOfLines={1}>{l.autor}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Todos os livros - carousel */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Catálogo Completo</Text>
        <TouchableOpacity onPress={() => router.push('/biblioteca')}>
          <Text style={[s.seeAll, { color: theme.accent }]}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {livros.map((l) => (
          <TouchableOpacity key={l.id} style={s.miniCard} onPress={() => router.push(`/livro/${l.id}`)}>
            <Image source={{ uri: l.capa }} style={s.miniCover} />
            <Text style={s.miniTitle} numberOfLines={2}>{l.titulo}</Text>
            <StatusBadge status={l.status} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Últimos achados */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Últimos Achados</Text>
        <TouchableOpacity onPress={() => router.push('/achados')}>
          <Text style={[s.seeAll, { color: theme.accent }]}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      {itens.slice(0, 3).map((it) => (
        <TouchableOpacity key={it.id} style={s.itemRow} onPress={() => router.push(`/item/${it.id}`)}>
          <Image source={{ uri: it.imagem }} style={s.itemThumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.itemName}>{it.nome}</Text>
            <Text style={s.itemLoc}>{it.localEncontrado}</Text>
          </View>
          <StatusBadge status={it.status} />
        </TouchableOpacity>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ========================= COMPONENTE PRINCIPAL =========================
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
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.accent }]}>
        <View>
          <Text style={s.greeting}>
            {isAtendente ? 'Painel do Atendente' : `Olá, ${usuario?.nome?.split(' ')[0]} 👋`}
          </Text>
          <Text style={s.subtitle}>
            {isAtendente ? 'Gestão de empréstimos e itens' : `${usuario?.tipo} • ${usuario?.curso}`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/perfil')} style={[s.avatarBtn, { backgroundColor: theme.accent }]}>
          <Ionicons name={theme.icon} size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {isAtendente ? (
        <PainelAtendente livros={livros} itens={itens} router={router} theme={theme} />
      ) : (
        <HomeUser usuario={usuario} livros={livros} meusLivros={meusLivros} itens={itens} router={router} theme={theme} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  loadingBg: { flex: 1, backgroundColor: Colors.black },
  header: {
    backgroundColor: Colors.black, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, borderBottomWidth: 4,
    borderBottomColor: Colors.primary,
  },
  greeting: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#888', fontSize: 12, marginTop: 2 },
  avatarBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  // Role badge
  roleBadge: {
    flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14,
  },
  roleBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // ── ATENDENTE: Urgent banner ──
  urgentBanner: {
    backgroundColor: Colors.error, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  urgentIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  urgentTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  urgentSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 },

  // ── ATENDENTE: KPI cards ──
  kpiGrid: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  kpiCard: {
    flex: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  kpiNum: { fontSize: 24, fontWeight: '900', marginTop: 6 },
  kpiLabel: { fontSize: 9, color: '#888', fontWeight: '700', marginTop: 2, textAlign: 'center' },

  // ── ATENDENTE: Acervo card ──
  acervoCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },

  // ── ATENDENTE: Alert grid ──
  alertGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  alertBox: { width: (width - 50) / 2, borderRadius: 18, padding: 14, alignItems: 'center' },
  alertIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  alertNum: { fontSize: 28, fontWeight: '900' },
  alertLabel: { fontSize: 11, color: '#888', fontWeight: '600', textAlign: 'center', marginTop: 2, lineHeight: 15 },

  // ── ATENDENTE: Action buttons ──
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  actionBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 18, alignItems: 'center', gap: 6,
  },
  actionText: { color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 15 },

  // ── ATENDENTE: User cards ──
  userCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#E0E0E0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  userAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  userName: { fontSize: 13, fontWeight: '800', color: '#222' },
  userEmail: { fontSize: 10, color: '#BBB', marginTop: 1 },
  userChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  userChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  userChipText: { fontSize: 9, fontWeight: '700' },
  userCount: { fontSize: 20, fontWeight: '900', marginLeft: 8 },

  // ── ATENDENTE: Gestao cards ──
  gestaoCard: {
    flexDirection: 'row', borderRadius: 14, padding: 10, marginBottom: 8,
    borderLeftWidth: 4, alignItems: 'center',
  },
  gestaoImg: { width: 44, height: 62, borderRadius: 8, backgroundColor: '#DDD', marginRight: 10 },
  gestaoImgSquare: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#DDD', marginRight: 10 },
  gestaoInfo: { flex: 1 },
  gestaoTitle: { fontSize: 13, fontWeight: '700', color: '#222' },
  gestaoSub: { fontSize: 11, color: '#999', marginTop: 1 },
  gestaoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  gestaoMetaText: { fontSize: 10, color: '#999' },
  gestaoBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 6 },
  gestaoBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 14, color: '#AAA', fontWeight: '600' },

  // Section
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#222', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '700' },

  // User stats
  statsRow3: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard3: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  statNum3: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 6 },
  statLbl3: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Alert
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 16 },
  alertDanger: { backgroundColor: Colors.error },
  alertWarn: { backgroundColor: '##FF0055' },
  alertOk: { backgroundColor: Colors.info },
  alertTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  alertSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

  // Quick access
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  quickIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: '#222', textAlign: 'center' },
  quickCount: { fontSize: 10, color: '#AAA', marginTop: 2 },

  // Book cards
  bookCard: { width: 140, height: 200, marginRight: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#222' },
  bookCover: { width: '100%', height: '100%', position: 'absolute' },
  bookOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', padding: 10 },
  bookTitle: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  bookAuthor: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },

  // Mini cards
  miniCard: { width: 110, marginRight: 10 },
  miniCover: { width: 110, height: 150, borderRadius: 12, backgroundColor: '#EEE', marginBottom: 6 },
  miniTitle: { fontSize: 11, fontWeight: '600', color: '#333', marginBottom: 4 },

  // Item rows
  itemRow: {
    backgroundColor: '#FFF', borderRadius: 14, flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  itemThumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: '#EEE' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#222' },
  itemLoc: { fontSize: 11, color: '#AAA', marginTop: 2 },
});
