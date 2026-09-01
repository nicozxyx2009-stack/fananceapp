/**
 * services/storage.js
 * Única responsabilidade: falar com o localStorage.
 * Nenhuma outra parte do app deve chamar localStorage diretamente —
 * tudo passa por aqui, então se um dia trocarmos por uma API real,
 * só este arquivo muda.
 */

const STORAGE_KEY = "financeapp_data_v1";

const Storage = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Dados corrompidos no localStorage, ignorando.", e);
      return null;
    }
  },

  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
