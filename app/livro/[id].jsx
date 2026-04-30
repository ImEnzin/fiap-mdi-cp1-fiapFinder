import React, { useState, useEffect } from 'react';

// Ajuste simples para republicar a versao completa.
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/colors';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { calcularDiasRestantes, formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');
const AVALIACOES_KEY = '@avaliacoes';

export default function LivroDetalhe() {
  const { id } = useLocalSearchParams();
  const { usuario } = useAuth();
  const { livros, reservarLivro, renovarEmprestimo, confirmarRetirada, confirmarDevolucao } = useLivros();
  const { isFavorito, toggleFavorito } = useFavoritos();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(0);

  const livro = livros.find((l) => l.id === id);
  const favorito = livro ? isFavorito(livro.id) : false;

  useEffect(() => {
    if (!livro) return;
    AsyncStorage.getItem(AVALIACOES_KEY).then((raw) => {
      if (raw) {
        const all = JSON.parse(raw);
        setMinhaAvaliacao(all[livro.id] || 0);
      }
    });
  }, [livro?.id]);

  const saveAvaliacao = async (stars) => {
    setMinhaAvaliacao(stars);
    const raw = await AsyncStorage.getItem(AVALIACOES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[livro.id] = stars;
    await AsyncStorage.setItem(AVALIACOES_KEY, JSON.stringify(all));
    showToast(`Avaliação de ${stars} estrela${stars !== 1 ? 's' : ''} salva!`, 'success');
  };

  if (!livro) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Header title="Detalhe do Livro" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Livro não encontrado.</Text>
        </View>
      </View>
    );
  }

  const isMeu = livro.reservadoPor === usuario?.email;
  const diasRestantes = livro.dataPrevistaDevolucao
    ? calcularDiasRestantes(livro.dataPrevistaDevolucao)
    : null;

  const doAction = (fn, ...args) => {
    setActionLoading(true);
    setFeedback(null);
    setTimeout(() => {
      const result = fn(...args);
      setActionLoading(false);
      if (result.ok) {
        const successMsg = getSuccessMsg(fn);
        setFeedback({ type: 'success', message: successMsg });
        showToast(successMsg, 'success');
      } else {
        setFeedback({ type: 'error', message: result.erro });
        showToast(result.erro, 'error');
      }
      setTimeout(() => setFeedback(null), 4000);
    }, 1200);
  };

  const getSuccessMsg = (fn) => {
    if (fn === reservarLivro) return 'Livro reservado com sucesso! Aguarde a liberação para retirada.';
    if (fn === renovarEmprestimo) return `Empréstimo renovado por mais ${usuario?.prazoDias} dias!`;
    if (fn === confirmarRetirada) return 'Retirada confirmada! Empréstimo iniciado.';
    if (fn === confirmarDevolucao) return 'Devolução confirmada! Livro disponível novamente.';
    return 'Ação realizada com sucesso!';
  };

  const confirmAction = (title, message, fn, ...args) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => doAction(fn, ...args) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header title="Detalhe do Livro" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Capa + Favorito */}
        <View style={[styles.coverContainer, { backgroundColor: theme.card }]}>
          <Image source={{ uri: livro.capa }} style={styles.cover} />
          <TouchableOpacity
            style={[styles.favBtn, favorito && styles.favBtnActive]}
            onPress={() => {
              toggleFavorito(livro.id);
              showToast(
                favorito ? 'Removido dos favoritos.' : 'Adicionado aos favoritos!',
                favorito ? 'info' : 'success'
              );
            }}
          >
            <Ionicons
              name={favorito ? 'heart' : 'heart-outline'}
              size={22}
              color={favorito ? Colors.primary : '#CCC'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.title, { color: theme.text }]}>{livro.titulo}</Text>
          <Text style={[styles.author, { color: theme.subText }]}>{livro.autor}</Text>
          <View style={styles.metaRow}>
            <StatusBadge status={livro.status} />
            <Text style={styles.category}>{livro.categoria}</Text>
          </View>

          {/* Card de Detalhes */}
          <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.subText }]}>Prazo de empréstimo</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{livro.prazoDias} dias</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.subText }]}>Status</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {livro.status === 'disponivel'
                  ? 'Disponível para reserva'
                  : livro.status === 'reservado'
                  ? `Reservado${isMeu ? ' por você' : ''}`
                  : livro.status === 'emprestado'
                  ? `Emprestado${isMeu ? ' para você' : ''}`
                  : `Atrasado${isMeu ? ' (seu)' : ''}`}
              </Text>
            </View>

            {livro.dataReserva && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.subText }]}>Data da reserva</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{formatDate(livro.dataReserva)}</Text>
                </View>
              </>
            )}

            {livro.dataRetirada && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.subText }]}>Data de retirada</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{formatDate(livro.dataRetirada)}</Text>
                </View>
              </>
            )}

            {livro.dataPrevistaDevolucao && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.subText }]}>Devolução prevista</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.text },
                      diasRestantes < 0 && { color: Colors.error },
                      diasRestantes >= 0 && diasRestantes <= 2 && { color: '#F57C00' },
                    ]}
                  >
                    {formatDate(livro.dataPrevistaDevolucao)}
                    {diasRestantes !== null && (
                      diasRestantes < 0
                        ? ` (${Math.abs(diasRestantes)}d atrasado)`
                        : diasRestantes === 0
                        ? ' (HOJE)'
                        : ` (${diasRestantes}d)`
                    )}
                  </Text>
                </View>
              </>
            )}

            {livro.renovacoes > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.subText }]}>Renovações</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{livro.renovacoes}x</Text>
                </View>
              </>
            )}
          </View>

          {/* Sinopse */}
          <Text style={[styles.sinopseLabel, { color: theme.text }]}>Sinopse</Text>
          <Text style={[styles.sinopse, { color: theme.subText }]}>{livro.sinopse}</Text>

          {/* Avaliação com estrelas */}
          {usuario?.perfil !== 'atendente' && (
            <View style={[styles.ratingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.ratingHeader}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={[styles.ratingTitle, { color: theme.text }]}>Sua avaliação</Text>
              </View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => saveAvaliacao(star)}>
                    <Ionicons
                      name={star <= minhaAvaliacao ? 'star' : 'star-outline'}
                      size={30}
                      color={star <= minhaAvaliacao ? '#F59E0B' : '#444'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {minhaAvaliacao > 0 && (
                <Text style={[styles.ratingLabel, { color: theme.text }]}>
                  {['', 'Não gostei', 'Regular', 'Bom', 'Ótimo', 'Excelente!'][minhaAvaliacao]}
                </Text>
              )}
            </View>
          )}

          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
              ]}
            >
              <Ionicons
                name={feedback.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={feedback.type === 'success' ? Colors.success : Colors.error}
              />
              <Text style={styles.feedbackText}>{feedback.message}</Text>
            </View>
          )}

          {/* Botões baseados no perfil e status */}
          <View style={styles.buttonGroup}>
            {/* Aluno/Professor: Reservar */}
            {usuario?.perfil !== 'atendente' && livro.status === 'disponivel' && (
              <PrimaryButton
                title="Reservar Livro"
                onPress={() => confirmAction('Confirmar reserva', `Reservar "${livro.titulo}"?`, reservarLivro, livro.id)}
                loading={actionLoading}
              />
            )}

            {/* Aluno/Professor: Renovar */}
            {usuario?.perfil !== 'atendente' &&
              isMeu &&
              (livro.status === 'emprestado' || livro.status === 'atrasado') &&
              livro.renovacoes < usuario?.maxRenovacoes && (
                <SecondaryButton
                  title={`Renovar Empréstimo (${livro.renovacoes}/${usuario?.maxRenovacoes})`}
                  onPress={() => confirmAction('Confirmar renovação', `Renovar o empréstimo de "${livro.titulo}"?`, renovarEmprestimo, livro.id)}
                  loading={actionLoading}
                />
              )}

            {/* Aluno/Professor: Sem renovação */}
            {usuario?.perfil !== 'atendente' &&
              isMeu &&
              (livro.status === 'emprestado' || livro.status === 'atrasado') &&
              livro.renovacoes >= usuario?.maxRenovacoes && (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#FF0055" />
                  <Text style={styles.warningText}>Limite de renovações atingido.</Text>
                </View>
              )}

            {/* Atendente: Confirmar retirada */}
            {usuario?.perfil === 'atendente' && livro.status === 'reservado' && (
              <PrimaryButton
                title="Confirmar Retirada"
                onPress={() => confirmAction('Confirmar retirada', `Confirmar retirada de "${livro.titulo}"?`, confirmarRetirada, livro.id)}
                loading={actionLoading}
              />
            )}

            {/* Atendente: Confirmar devolução */}
            {usuario?.perfil === 'atendente' &&
              (livro.status === 'emprestado' || livro.status === 'atrasado') && (
                <SecondaryButton
                  title="Confirmar Devolução"
                  onPress={() => confirmAction('Confirmar devolução', `Confirmar devolução de "${livro.titulo}"?`, confirmarDevolucao, livro.id)}
                  loading={actionLoading}
                />
              )}

            {/* Livro reservado aguardando (não é meu) */}
            {livro.status === 'reservado' && !isMeu && usuario?.perfil !== 'atendente' && (
              <View style={styles.unavailableBox}>
                <Text style={styles.unavailableText}>
                  Este livro está reservado por outro usuário.
                </Text>
              </View>
            )}

            {/* Livro emprestado (não é meu, não é atendente) */}
            {(livro.status === 'emprestado' || livro.status === 'atrasado') &&
              !isMeu &&
              usuario?.perfil !== 'atendente' && (
                <View style={styles.unavailableBox}>
                  <Text style={styles.unavailableText}>
                    Este livro está emprestado no momento.
                  </Text>
                </View>
              )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    paddingBottom: 24,
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.black,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cover: {
    width: Math.min(width * 0.32, 220),
    height: Math.min(width * 0.44, 300),
    borderRadius: 14,
    backgroundColor: Colors.darkGray,
    resizeMode: 'cover',
  },
  favBtn: {
    marginTop: 14,
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#1C1C1C',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#333',
  },
  favBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,0,85,0.1)' },
  ratingCard: {
    backgroundColor: '#F8F8F8', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  ratingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingTitle: { fontSize: 14, fontWeight: '800', color: Colors.black },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  ratingLabel: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
  infoSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 2,
  },
  author: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  category: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    maxWidth: '55%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 4,
  },
  sinopseLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  sinopse: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 14,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  feedbackSuccess: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  feedbackError: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },
  buttonGroup: {
    gap: 10,
    marginBottom: 14,
  },
  unavailableBox: {
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  unavailableText: {
    color: '#F57C00',
    fontWeight: '600',
    fontSize: 14,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 12,
  },
  warningText: {
    color: '#FF0055',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
  },
});
