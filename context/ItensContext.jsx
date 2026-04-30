import React, { createContext, useContext, useState, useEffect } from 'react';
import itensIniciais from '../data/itens';
import { hoje } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { loadData as loadStorageData, saveData as saveStorageData } from '../utils/storage';
import { addHistory } from '../utils/history';

const STORAGE_KEY = '@itens';

const ItensContext = createContext();

export function ItensProvider({ children }) {
  const [itens, setItens] = useState(itensIniciais);
  const [hydrated, setHydrated] = useState(false);
  const { usuario } = useAuth();

  const loadData = async () => {
    const stored = await loadStorageData(STORAGE_KEY);
    setItens(stored && stored.length > 0 ? stored : itensIniciais);
    setHydrated(true);
  };

  const saveData = async (data) => {
    await saveStorageData(STORAGE_KEY, data);
  };

  // Carrega dados persistidos na inicialização
  useEffect(() => {
    loadData();
  }, []);

  // Wrapper que persiste ao setar
  const setItensPersistido = (updater) => {
    setItens((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (hydrated) saveData(next);
      return next;
    });
  };

  const solicitarItem = (itemId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };

    const item = itens.find((i) => i.id === itemId);
    if (!item) return { ok: false, erro: 'Item não encontrado.' };
    if (item.status !== 'encontrado') return { ok: false, erro: 'Item não está disponível para solicitação.' };

    setItensPersistido((prev) =>
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
    addHistory({
      tipo: 'item_solicitado',
      titulo: 'Item solicitado',
      descricao: `${usuario.email} solicitou "${item.nome}".`,
      ator: usuario.email,
      alvo: item.nome,
    });
    return { ok: true };
  };

  const confirmarRetiradaItem = (itemId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil !== 'atendente') return { ok: false, erro: 'Apenas atendentes podem confirmar retirada.' };

    const item = itens.find((i) => i.id === itemId);
    if (!item || item.status !== 'solicitado') return { ok: false, erro: 'Item não está solicitado.' };

    setItensPersistido((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, status: 'retirado', dataRetirada: hoje() }
          : i
      )
    );
    addHistory({
      tipo: 'item_retirado',
      titulo: 'Item retirado',
      descricao: `${usuario.email} confirmou retirada de "${item.nome}" para ${item.solicitadoPor}.`,
      ator: usuario.email,
      alvo: item.nome,
    });
    return { ok: true };
  };

  const reportarItem = ({ nome, categoria, localEncontrado, observacoes, imagem }) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (!nome || !nome.trim()) return { ok: false, erro: 'Nome do item é obrigatório.' };
    if (!localEncontrado || !localEncontrado.trim()) return { ok: false, erro: 'Local encontrado é obrigatório.' };

    const novoItem = {
      id: String(Date.now()),
      nome: nome.trim(),
      categoria: categoria || 'Outros',
      imagem: imagem || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400',
      localEncontrado: localEncontrado.trim(),
      dataEncontrado: hoje(),
      status: 'encontrado',
      observacoes: observacoes ? observacoes.trim() : '',
      reportadoPor: usuario.email,
    };

    setItensPersistido((prev) => [novoItem, ...prev]);
    addHistory({
      tipo: 'item_reportado',
      titulo: 'Item reportado',
      descricao: `${usuario.email} reportou "${novoItem.nome}" em ${novoItem.localEncontrado}.`,
      ator: usuario.email,
      alvo: novoItem.nome,
    });
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
        reportarItem,
        loadData,
        saveData,
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
