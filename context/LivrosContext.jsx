import React, { createContext, useContext, useState, useEffect } from 'react';
import livrosIniciais from '../data/livros';
import { hoje, adicionarDias, calcularDiasRestantes } from '../utils/dateUtils';
import { useAuth } from './AuthContext';

const LivrosContext = createContext();

export function LivrosProvider({ children }) {
  const [livros, setLivros] = useState(livrosIniciais);
  const { usuario } = useAuth();

  // Atualizar status "atrasado" automaticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setLivros((prev) =>
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
  }, []);

  // Verificar atrasados no mount
  useEffect(() => {
    setLivros((prev) =>
      prev.map((l) => {
        if (l.status === 'emprestado' && l.dataPrevistaDevolucao) {
          const dias = calcularDiasRestantes(l.dataPrevistaDevolucao);
          if (dias < 0) return { ...l, status: 'atrasado' };
        }
        return l;
      })
    );
  }, []);

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

    setLivros((prev) =>
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
    return { ok: true };
  };

  const confirmarRetirada = (livroId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil !== 'atendente') return { ok: false, erro: 'Apenas atendentes podem confirmar retirada.' };

    const livro = livros.find((l) => l.id === livroId);
    if (!livro || livro.status !== 'reservado') return { ok: false, erro: 'Livro não está reservado.' };

    const prazoDias = livro.prazoDias || 14;

    setLivros((prev) =>
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
    return { ok: true };
  };

  const confirmarDevolucao = (livroId) => {
    if (!usuario) return { ok: false, erro: 'Usuário não autenticado.' };
    if (usuario.perfil !== 'atendente') return { ok: false, erro: 'Apenas atendentes podem confirmar devolução.' };

    const livro = livros.find((l) => l.id === livroId);
    if (!livro || (livro.status !== 'emprestado' && livro.status !== 'atrasado')) {
      return { ok: false, erro: 'Livro não está emprestado.' };
    }

    setLivros((prev) =>
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

    setLivros((prev) =>
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
