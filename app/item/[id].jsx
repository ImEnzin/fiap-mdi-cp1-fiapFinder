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
import { useItens } from '../../context/ItensContext';
import { formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

export default function ItemDetalhe() {
  const { id } = useLocalSearchParams();
  const { usuario } = useAuth();
  const { itens, solicitarItem, confirmarRetiradaItem } = useItens();
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const item = itens.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Header title="Detalhe do Item" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item não encontrado.</Text>
        </View>
      </View>
    );
  }

  const isMeu = item.solicitadoPor === usuario?.email;

  const doAction = (fn, successMsg) => {
    setActionLoading(true);
    setFeedback(null);
    setTimeout(() => {
      const result = fn(item.id);
      setActionLoading(false);
      if (result.ok) {
        setFeedback({ type: 'success', message: successMsg });
      } else {
        setFeedback({ type: 'error', message: result.erro });
      }
      setTimeout(() => setFeedback(null), 4000);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Header title="Detalhe do Item" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Imagem */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imagem }} style={styles.image} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{item.nome}</Text>
          <View style={styles.metaRow}>
            <StatusBadge status={item.status} />
            <Text style={styles.category}>{item.categoria}</Text>
          </View>

          {/* Card de Detalhes */}
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailLabel}>Local encontrado</Text>
              </View>
              <Text style={styles.detailValue}>{item.localEncontrado}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailLabel}>Data encontrado</Text>
              </View>
              <Text style={styles.detailValue}>{formatDate(item.dataEncontrado)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconRow}>
                <Ionicons name="pricetag-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailLabel}>Categoria</Text>
              </View>
              <Text style={styles.detailValue}>{item.categoria}</Text>
            </View>

            {item.solicitadoPor && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailIconRow}>
                    <Ionicons name="person-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Solicitado por</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {isMeu ? 'Você' : item.solicitadoPor}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Observações */}
          {item.observacoes ? (
            <>
              <Text style={styles.obsLabel}>Observações</Text>
              <View style={styles.obsCard}>
                <Text style={styles.obsText}>{item.observacoes}</Text>
              </View>
            </>
          ) : null}

          {/* Descrição */}
          {item.descricao ? (
            <>
              <Text style={styles.descLabel}>Descrição</Text>
              <Text style={styles.descText}>{item.descricao}</Text>
            </>
          ) : null}

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
            {/* Aluno/Professor: Solicitar */}
            {usuario?.perfil !== 'atendente' && item.status === 'encontrado' && (
              <PrimaryButton
                title="Solicitar Item"
                onPress={() =>
                  doAction(solicitarItem, 'Item solicitado! Vá até a recepção para retirá-lo.')
                }
                loading={actionLoading}
              />
            )}

            {/* Aluno/Professor: já solicitou */}
            {usuario?.perfil !== 'atendente' && item.status === 'solicitado' && isMeu && (
              <View style={styles.waitingBox}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.waitingText}>
                  Você já solicitou este item. Vá até a recepção para retirá-lo.
                </Text>
              </View>
            )}

            {/* Aluno/Professor: solicitado por outro */}
            {usuario?.perfil !== 'atendente' && item.status === 'solicitado' && !isMeu && (
              <View style={styles.unavailableBox}>
                <Text style={styles.unavailableText}>
                  Este item já foi solicitado por outro usuário.
                </Text>
              </View>
            )}

            {/* Item já retirado */}
            {item.status === 'retirado' && (
              <View style={styles.unavailableBox}>
                <Text style={styles.unavailableText}>
                  Este item já foi retirado.
                </Text>
              </View>
            )}

            {/* Atendente: Confirmar retirada */}
            {usuario?.perfil === 'atendente' && item.status === 'solicitado' && (
              <PrimaryButton
                title="Confirmar Retirada do Item"
                onPress={() =>
                  doAction(confirmarRetiradaItem, 'Retirada confirmada! Item entregue.')
                }
                loading={actionLoading}
              />
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
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.black,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  image: {
    width: width * 0.55,
    height: width * 0.45,
    borderRadius: 14,
    backgroundColor: Colors.darkGray,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 8,
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
  detailIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    maxWidth: '45%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 4,
  },
  obsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  obsCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  obsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6D4C00',
  },
  descLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  descText: {
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
    textAlign: 'center',
  },
  waitingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
  },
  waitingText: {
    flex: 1,
    color: Colors.primary,
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
