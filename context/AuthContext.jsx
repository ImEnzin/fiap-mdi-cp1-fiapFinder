import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData, removeData } from '../utils/storage';
import { addHistory } from '../utils/history';

const PERFIS = {
  aluno: {
    tipo: 'Aluno',
    maxLivros: 2,
    maxRenovacoes: 1,
    prazoDias: 7,
    email: 'aluno@fiap.com.br',
    nome: 'Carlos Silva',
    rm: '550123',
    sala: 'ESPF-2026',
    curso: 'Engenharia de Software',
  },
  professor: {
    tipo: 'Professor',
    maxLivros: 4,
    maxRenovacoes: 2,
    prazoDias: 14,
    email: 'professor@fiap.com.br',
    nome: 'Dra. Ana Oliveira',
    rm: '100042',
    sala: 'Docentes',
    curso: 'Ciência da Computação',
  },
  atendente: {
    tipo: 'Atendente',
    maxLivros: 0,
    maxRenovacoes: 0,
    prazoDias: 0,
    email: 'atendente@fiap.com.br',
    nome: 'Marcos Souza',
    rm: '200001',
    sala: 'Biblioteca',
    curso: 'Administração Biblioteca',
  },
};

const SESSION_KEY = '@user';
const USERS_KEY = '@users';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendentesVersion, setPendentesVersion] = useState(0);

  // Restaura sessão ao abrir o app
  useEffect(() => {
    loadData(SESSION_KEY).then((u) => {
      if (u) setUsuario(u);
      setLoading(false);
    });
  }, []);

  const _getUsers = async () => {
    const stored = await loadData(USERS_KEY);
    return stored || {};
  };

  /** Login real: verifica usuários cadastrados + fallback para PERFIS hardcoded */
  const login = async (email, senha) => {
    const key = email.trim().toLowerCase();

    // Verifica usuários cadastrados via register()
    const users = await _getUsers();
    if (users[key]) {
      if (users[key].senha !== senha) return { ok: false, erro: 'Senha incorreta.' };
      const u = { ...users[key] };
      delete u.senha;
      setUsuario(u);
      await saveData(SESSION_KEY, u);
      return { ok: true, aprovado: u.aprovado !== false };
    }

    // Fallback: perfis de demonstração (senha padrão 123456) — sempre aprovados
    const perfilKey = Object.keys(PERFIS).find(
      (k) => PERFIS[k].email.toLowerCase() === key
    );
    if (perfilKey && senha === '123456') {
      const u = { ...PERFIS[perfilKey], perfil: perfilKey, aprovado: true };
      setUsuario(u);
      await saveData(SESSION_KEY, u);
      return { ok: true, aprovado: true };
    }

    return { ok: false, erro: 'E-mail ou senha inválidos.' };
  };

  /** Cadastro de novo usuário — fica pendente de aprovação */
  const register = async ({ nome, email, senha, perfil = 'aluno', rm, sala }) => {
    const users = await _getUsers();
    const key = email.trim().toLowerCase();
    if (users[key]) return { ok: false, erro: 'E-mail já cadastrado.' };

    const config = PERFIS[perfil] || PERFIS.aluno;
    const newUser = {
      ...config,
      nome: nome.trim(),
      email: key,
      senha,
      perfil,
      rm: rm ? rm.trim() : String(Math.floor(Math.random() * 900000 + 100000)),
      sala: sala ? sala.trim().toUpperCase() : config.sala,
      aprovado: false,  // conta pendente de aprovação
    };
    users[key] = newUser;
    await saveData(USERS_KEY, users);
    setPendentesVersion((v) => v + 1);

    // Loga mas com aprovado: false — será redirecionado para tela aguardando
    const u = { ...newUser };
    delete u.senha;
    setUsuario(u);
    await saveData(SESSION_KEY, u);
    return { ok: true, aprovado: false };
  };

  /** Atendente: lista de usuários pendentes */
  const getPendentes = async () => {
    const users = await _getUsers();
    return Object.values(users)
      .filter((u) => u.aprovado === false)
      .map((u) => { const c = { ...u }; delete c.senha; return c; });
  };

  /** Atendente: aprovar usuário */
  const aprovarUsuario = async (email) => {
    const users = await _getUsers();
    const key = email.toLowerCase();
    if (!users[key]) return { ok: false, erro: 'Usuário não encontrado.' };
    users[key].aprovado = true;
    await saveData(USERS_KEY, users);
    setPendentesVersion((v) => v + 1);
    await addHistory({
      tipo: 'usuario_aprovado',
      titulo: 'Usuário aprovado',
      descricao: `${users[key].nome} foi aprovado por ${usuario?.email || 'atendente'}.`,
      ator: usuario?.email || 'atendente',
      alvo: key,
    });
    if (usuario?.email?.toLowerCase() === key) {
      const updated = { ...users[key] };
      delete updated.senha;
      setUsuario(updated);
      await saveData(SESSION_KEY, updated);
    }
    return { ok: true };
  };

  /** Atendente: rejeitar / remover usuário */
  const rejeitarUsuario = async (email) => {
    const users = await _getUsers();
    const key = email.toLowerCase();
    const removed = users[key];
    delete users[key];
    await saveData(USERS_KEY, users);
    setPendentesVersion((v) => v + 1);
    await addHistory({
      tipo: 'usuario_rejeitado',
      titulo: 'Usuário rejeitado',
      descricao: `${removed?.nome || key} foi rejeitado por ${usuario?.email || 'atendente'}.`,
      ator: usuario?.email || 'atendente',
      alvo: key,
    });
    return { ok: true };
  };

  const logout = async () => {
    setUsuario(null);
    await removeData(SESSION_KEY);
  };

  const isAuthenticated = !!usuario;

  return (
    <AuthContext.Provider value={{
      usuario,
      user: usuario,
      isAuthenticated,
      loading,
      login,
      logout,
      register,
      loadData,
      saveData,
      getPendentes,
      pendentesVersion,
      aprovarUsuario,
      rejeitarUsuario,
      PERFIS,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
