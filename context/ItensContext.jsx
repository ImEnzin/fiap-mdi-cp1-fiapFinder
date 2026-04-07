import React, { createContext, useContext, useState } from 'react';
import itensIniciais from '../data/itens';
import { hoje } from '../utils/dateUtils';
import { useAuth } from './AuthContext';

const ItensContext = createContext();

export function ItensProvider({ children }) {
  const [itens, setItens] = useState(itensIniciais);
  const { usuario } = useAuth();

  const solicitarItem = (itemId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };

    const item = itens.find((i) => i.id === itemId);
    if (!item) return { ok: false, erro: 'Item não encontrado.' };
    if (item.status !== 'encontrado') return { ok: false, erro: 'Item não está disponível para solicitação.' };

    setItens((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              status: 'solicitado',
              solicitadoPor: usuario.email,
              dataSolicitacao: hoje(),
            }
          : i
      )
    );
    return { ok: true };
  };

  const confirmarRetiradaItem = (itemId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil !== 'atendente') return { ok: false, erro: 'Apenas atendentes podem confirmar retirada.' };

    const item = itens.find((i) => i.id === itemId);
    if (!item || item.status !== 'solicitado') return { ok: false, erro: 'Item não está solicitado.' };

    setItens((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, status: 'retirado', dataRetirada: hoje() }
          : i
      )
    );
    return { ok: true };
  };

  const meusSolicitados = usuario
    ? itens.filter((i) => i.solicitadoPor === usuario.email && i.status === 'solicitado')
    : [];

  return (
    <ItensContext.Provider
      value={{
        itens,
        meusSolicitados,
        solicitarItem,
        confirmarRetiradaItem,
      }}
    >
      {children}
    </ItensContext.Provider>
  );
}

export function useItens() {
  const ctx = useContext(ItensContext);
  if (!ctx) throw new Error('useItens must be used within ItensProvider');
  return ctx;
}
