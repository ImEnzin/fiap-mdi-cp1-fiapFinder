import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData } from '../utils/storage';

const STORAGE_KEY = '@favoritos';
const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    loadData(STORAGE_KEY).then((data) => {
      if (data) setFavoritos(data);
    });
  }, []);

  const toggleFavorito = (livroId) => {
    setFavoritos((prev) => {
      const next = prev.includes(livroId)
        ? prev.filter((id) => id !== livroId)
        : [...prev, livroId];
      saveData(STORAGE_KEY, next);
      return next;
    });
  };

  const isFavorito = (livroId) => favoritos.includes(livroId);

  return (
    <FavoritosContext.Provider value={{ favoritos, toggleFavorito, isFavorito }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error('useFavoritos must be used within FavoritosProvider');
  return ctx;
}
