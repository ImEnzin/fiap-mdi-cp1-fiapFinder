import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLivros } from '../../context/LivrosContext';
import { calcularDiasRestantes, formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

export default function LivroDetalhe() {
  const { id } = useLocalSearchParams();
  const { usuario } = useAuth();
  const { livros, reservarLivro, renovarEmprestimo, confirmarRetirada, confirmarDevolucao } = useLivros();
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const livro = livros.find((l) => l.id === id);

  if (!livro) {
    return (
      <View style={styles.container}>
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
        setFeedback({ type: 'success', message: getSuccessMsg(fn) });
      } else {
        setFeedback({ type: 'error', message: result.erro });
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

  return (
    <View style={styles.container}>
      <Header title="Detalhe do Livro" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Capa */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: livro.capa }} style={styles.cover} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{livro.titulo}</Text>
          <Text style={styles.author}>{livro.autor}</Text>
          <View style={styles.metaRow}>
            <StatusBadge status={livro.status} />
            <Text style={styles.category}>{livro.categoria}</Text>
          </View>

          {/* Card de Detalhes */}
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prazo de empréstimo</Text>
              <Text style={styles.detailValue}>{livro.prazoDias} dias</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
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
                  <Text style={styles.detailLabel}>Data da reserva</Text>
                  <Text style={styles.detailValue}>{formatDate(livro.dataReserva)}</Text>
                </View>
              </>
            )}

            {livro.dataRetirada && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data de retirada</Text>
                  <Text style={styles.detailValue}>{formatDate(livro.dataRetirada)}</Text>
                </View>
              </>
            )}

            {livro.dataPrevistaDevolucao && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Devolução prevista</Text>
                  <Text
                    style={[
                      styles.detailValue,
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
                  <Text style={styles.detailLabel}>Renovações</Text>
                  <Text style={styles.detailValue}>{livro.renovacoes}x</Text>
                </View>
              </>
            )}
          </View>

          {/* Sinopse */}
          <Text style={styles.sinopseLabel}>Sinopse</Text>
          <Text style={styles.sinopse}>{livro.sinopse}</Text>

          {/* Feedback */}
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
                onPress={() => doAction(reservarLivro, livro.id)}
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
                  onPress={() => doAction(renovarEmprestimo, livro.id)}
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
                onPress={() => doAction(confirmarRetirada, livro.id)}
                loading={actionLoading}
              />
            )}

            {/* Atendente: Confirmar devolução */}
            {usuario?.perfil === 'atendente' &&
              (livro.status === 'emprestado' || livro.status === 'atrasado') && (
                <SecondaryButton
                  title="Confirmar Devolução"
                  onPress={() => doAction(confirmarDevolucao, livro.id)}
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
    backgroundColor: Colors.lightGray,
  },
  scroll: {
    paddingBottom: 40,
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.black,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  cover: {
    width: Math.min(width * 0.38, 280),
    height: Math.min(width * 0.52, 380),
    borderRadius: 18,
    backgroundColor: Colors.darkGray,
    resizeMode: 'cover',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 4,
  },
  author: {
    fontSize: 15,
    color: Colors.mediumGray,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  category: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
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
    lineHeight: 22,
    color: '#555',
    marginBottom: 20,
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
    gap: 12,
    marginBottom: 20,
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
