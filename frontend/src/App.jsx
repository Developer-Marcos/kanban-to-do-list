// src/App.jsx
import { useState, useEffect, useCallback } from 'react'; 
import './App.css'
import { useTranslation } from 'react-i18next';
import { ColunaKanban, CardTarefa } from './components/ColunaKanban' // 🎯 Removido CardEsqueleto
import { ChatSidebar } from './components/ChatSidebar'

function App() {
  const { t } = useTranslation();
  
  // 🎯 Estado para armazenar as tarefas vindas do banco
  const [tarefas, setTarefas] = useState([]);

  // 🎯 Função para buscar tarefas no FastAPI
  const carregarTarefas = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/tarefas');
      if (!response.ok) throw new Error("Erro ao carregar banco");
      const data = await response.json();
      setTarefas(data);
    } catch (error) {
      console.error("Erro na busca:", error);
    }
  }, []);

  // 🎯 Busca inicial ao abrir o site
  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  return (
    <div className="h-screen w-full fundo-animado-diagonal flex p-6 gap-6 font-sans box-border overflow-hidden">
      
      <main className="flex-1 bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-3xl p-6 flex flex-col overflow-hidden">
        
        <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
          
          {/* Coluna: A Fazer */}
          <ColunaKanban titulo={t('coluna_fazer')}>
            {tarefas
                .filter(t => t.status === 'A_FAZER')
                .map(tarefa => <CardTarefa key={tarefa.id} tarefa={tarefa} />)
            }
          </ColunaKanban>

          {/* Coluna: Em Andamento */}
          <ColunaKanban titulo={t('coluna_andamento')}>
            {tarefas
                .filter(t => t.status === 'EM_PROGRESSO')
                .map(tarefa => <CardTarefa key={tarefa.id} tarefa={tarefa} />)
            }
          </ColunaKanban>

          {/* Coluna: Concluído */}
          <ColunaKanban titulo={t('coluna_concluido')}>
            {tarefas
                .filter(t => t.status === 'FEITO')
                .map(tarefa => <CardTarefa key={tarefa.id} tarefa={tarefa} />)
            }
          </ColunaKanban>

        </div>
      </main>

      {/* 🎯 Sidebar que dispara o refresh via props.aoAtualizarBanco */}
      <ChatSidebar aoAtualizarBanco={carregarTarefas} />

    </div>
  )
}

export default App