// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    pt: {
      translation: {
        "status": "Sempre online",
        "placeholder": "Mande um comando...",
        "coluna_fazer": "A Fazer",
        "coluna_andamento": "Em Andamento",
        "coluna_concluido": "Concluído",
        "boas_vindas": "Olá! Eu sou o seu Assistente de Tarefas. O que vamos organizar hoje?",
        "tooltip_limpar": "Limpar conversa",
        "modal_limpar_titulo": "Limpar Chat",
        "modal_limpar_desc": "Tem certeza que deseja apagar o histórico dessa conversa?",
        "botao_cancelar": "Cancelar",
        "botao_confirmar": "Apagar",
        "label_criado_em": "Criado em",
        "label_prazo": "Prazo"
      }
    },
    en: {
      translation: {
        "status": "Always online",
        "placeholder": "Send a command...",
        "coluna_fazer": "To Do",
        "coluna_andamento": "In Progress",
        "coluna_concluido": "Done",
        "boas_vindas": "Hello! I am your Task Assistant. What shall we organize today?",
        "tooltip_limpar": "Clear chat",
        "modal_limpar_titulo": "Clear Chat",
        "modal_limpar_desc": "Are you sure you want to delete this conversation history?",
        "botao_cancelar": "Cancel",
        "botao_confirmar": "Delete",
        "label_criado_em": "Created at",
        "label_prazo": "Deadline"
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;