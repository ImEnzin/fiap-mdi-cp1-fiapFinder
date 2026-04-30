import React, { createContext, useContext, useState, useEffect } from 'react';
import livrosIniciais from '../data/livros';
import { hoje, adicionarDias, calcularDiasRestantes } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { loadData as loadStorageData, saveData as saveStorageData } from '../utils/storage';
import { addHistory } from '../utils/history';

const STORAGE_KEY = '@livros';

const LivrosContext = createContext();

export function LivrosProvider({ children }) {
  const [livros, setLivros] = useState(livrosIniciais);
  const [hydrated, setHydrated] = useState(false);
  const { usuario } = useAuth();

  const loadData = async () => {
    const stored = await loadStorageData(STORAGE_KEY);
    setLivros(stored && stored.length > 0 ? stored : livrosIniciais);
    setHydrated(true);
  };

  const saveData = async (data) => {
    await saveStorageData(STORAGE_KEY, data);
  };

  // Carrega dados do AsyncStorage na inicialização
  useEffect(() => {
    loadData();
  }, []);

  // Persiste sempre que livros mudar
  const setLivrosPersistido = (updater) => {
    setLivros((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (hydrated) saveData(next);
      return next;
    });
  };

  // Atualizar status "atrasado" automaticamente
  useEffect(() => {
    if (!hydrated) return undefined;
    const interval = setInterval(() => {
      setLivrosPersistido((prev) =>
        prev.map((l) => {
          if (l.status === 'emprestado' && l.dataPrevistaDevolucao) {
            const dias = calcularDiasRestantes(l.dataPrevistaDevolucao);
            if (dias < 0) return { ...l, status: 'atrasado' };
          }
          return l;
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, [hydrated]);

  // Verificar atrasados no mount
  useEffect(() => {
    if (!hydrated) return;
    setLivrosPersistido((prev) =>
      prev.map((l) => {
        if (l.status === 'emprestado' && l.dataPrevistaDevolucao) {
          const dias = calcularDiasRestantes(l.dataPrevistaDevolucao);
          if (dias < 0) return { ...l, status: 'atrasado' };
        }
        return l;
      })
    );
  }, [hydrated]);

  const reservarLivro = (livroId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil === 'atendente') return { ok: false, erro: 'Atendentes não podem reservar livros.' };

    const meusLivros = livros.filter(
      (l) =>
        l.reservadoPor === usuario.email &&
        (l.status === 'reservado' || l.status === 'emprestado' || l.status === 'atrasado')
    );
    if (meusLivros.length >= usuario.maxLivros) {
      return { ok: false, erro: `Limite de ${usuario.maxLivros} livro(s) atingido.` };
    }

    const livro = livros.find((l) => l.id === livroId);
    if (!livro) return { ok: false, erro: 'Livro não encontrado.' };
    if (livro.status !== 'disponivel') return { ok: false, erro: 'Livro não está disponível.' };

    setLivrosPersistido((prev) =>
      prev.map((l) =>
        l.id === livroId
          ? {
              ...l,
              status: 'reservado',
              reservadoPor: usuario.email,
              dataReserva: hoje(),
              renovacoes: 0,
            }
          : l
      )
    );
    addHistory({
      tipo: 'livro_reservado',
      titulo: 'Livro reservado',
      descricao: `${usuario.email} reservou "${livro.titulo}".`,
      ator: usuario.email,
      alvo: livro.titulo,
    });
    return { ok: true };
  };

  const confirmarRetirada = (livroId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil !== 'atendente') return { ok: false, erro: 'Apenas atendentes podem confirmar retirada.' };

    const livro = livros.find((l) => l.id === livroId);
    if (!livro || livro.status !== 'reservado') return { ok: false, erro: 'Livro não está reservado.' };

    const prazoDias = livro.prazoDias || 14;

    setLivrosPersistido((prev) =>
      prev.map((l) =>
        l.id === livroId
          ? {
              ...l,
              status: 'emprestado',
              dataRetirada: hoje(),
              dataPrevistaDevolucao: adicionarDias(hoje(), prazoDias),
            }
          : l
      )
    );
    addHistory({
      tipo: 'livro_retirado',
      titulo: 'Retirada confirmada',
      descricao: `${usuario.email} confirmou retirada de "${livro.titulo}" para ${livro.reservadoPor}.`,
      ator: usuario.email,
      alvo: livro.titulo,
    });
    return { ok: true };
  };

  const confirmarDevolucao = (livroId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil !== 'atendente') return { ok: false, erro: 'Apenas atendentes podem confirmar devolução.' };

    const livro = livros.find((l) => l.id === livroId);
    if (!livro || (livro.status !== 'emprestado' && livro.status !== 'atrasado')) {
      return { ok: false, erro: 'Livro não está emprestado.' };
    }

    setLivrosPersistido((prev) =>
      prev.map((l) =>
        l.id === livroId
          ? {
              ...l,
              status: 'disponivel',
              reservadoPor: null,
              dataReserva: null,
              dataRetirada: null,
              dataPrevistaDevolucao: null,
              renovacoes: 0,
            }
          : l
      )
    );
    addHistory({
      tipo: 'livro_devolvido',
      titulo: 'Devolução confirmada',
      descricao: `${usuario.email} confirmou devolução de "${livro.titulo}".`,
      ator: usuario.email,
      alvo: livro.titulo,
    });
    return { ok: true };
  };

  const renovarEmprestimo = (livroId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil === 'atendente') return { ok: false, erro: 'Atendentes não podem renovar.' };

    const livro = livros.find((l) => l.id === livroId);
    if (!livro) return { ok: false, erro: 'Livro não encontrado.' };
    if (livro.status !== 'emprestado' && livro.status !== 'atrasado') {
      return { ok: false, erro: 'Livro não está emprestado.' };
    }
    if (livro.reservadoPor !== usuario.email) {
      return { ok: false, erro: 'Este livro não é seu.' };
    }
    if (livro.renovacoes >= usuario.maxRenovacoes) {
      return { ok: false, erro: `Limite de ${usuario.maxRenovacoes} renovação(ões) atingido.` };
    }

    const novaData = adicionarDias(hoje(), usuario.prazoDias);

    setLivrosPersistido((prev) =>
      prev.map((l) =>
        l.id === livroId
          ? {
              ...l,
              status: 'emprestado',
              dataPrevistaDevolucao: novaData,
              renovacoes: l.renovacoes + 1,
            }
          : l
      )
    );
    addHistory({
      tipo: 'livro_renovado',
      titulo: 'Empréstimo renovado',
      descricao: `${usuario.email} renovou "${livro.titulo}".`,
      ator: usuario.email,
      alvo: livro.titulo,
    });
    return { ok: true };
  };

  const meusLivros = usuario
    ? livros.filter(
        (l) =>
          l.reservadoPor === usuario.email &&
          (l.status === 'reservado' || l.status === 'emprestado' || l.status === 'atrasado')
      )
    : [];

  return (
    <LivrosContext.Provider
      value={{
        livros,
        meusLivros,
        reservarLivro,
        confirmarRetirada,
        confirmarDevolucao,
        renovarEmprestimo,
        loadData,
        saveData,
      }}
    >
      {children}
    </LivrosContext.Provider>
  );
}

export function useLivros() {
  const ctx = useContext(LivrosContext);
  if (!ctx) throw new Error('useLivros must be used within LivrosProvider');
  return ctx;
}
