import React, { createContext, useContext, useState } from 'react';

const PERFIS = {
  aluno: {
    tipo: 'Aluno',
    maxLivros: 2,
    maxRenovacoes: 1,
    prazoDias: 7,
    email: 'aluno@fiap.com.br',
    nome: 'Carlos Silva',
    rm: '550123',
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
    curso: 'Administração Biblioteca',
  },
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const login = (email, senha, perfil) => {
    const config = PERFIS[perfil];
    if (!config) return false;
    setUsuario({
      ...config,
      perfil,
      email: email || config.email,
    });
    return true;
  };

  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, PERFIS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
