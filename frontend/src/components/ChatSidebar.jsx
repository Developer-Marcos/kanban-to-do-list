import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MensagemIA, MensagemUsuario } from './MensagensChat';

const MensagemDigitando = () => (
  <div className="flex w-full justify-start animate-fade-in">
    <div className="bg-gray-500/60 backdrop-blur-sm text-white rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%] shadow-sm border border-white/10 flex gap-1.5 items-center h-[48px]">
      <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
);

export function ChatSidebar({ aoAtualizarBanco }) {
  const { t, i18n } = useTranslation();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false); 
  
  const [mensagens, setMensagens] = useState([
    { id: 1, role: 'ia', texto: t('boas_vindas') }
  ]);

  useEffect(() => {
    setMensagens(prev => 
      prev.map(msg => 
        msg.id === 1 ? { ...msg, texto: t('boas_vindas') } : msg
      )
    );
  }, [i18n.language, t]);

  const chatFimRef = useRef(null);

  const toggleLanguage = () => {
    const novoIdioma = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(novoIdioma);
  };

const confirmarLimpeza = async () => {
  const token = localStorage.getItem('kanban_token');
  if (!token) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/historico`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    if (response.ok) {
      setMensagens([{ id: 1, role: 'ia', texto: t('boas_vindas') }]);
      setMostrarConfirmacao(false);
    } else {
      console.error("Erro ao apagar histórico no servidor.");
    }
  } catch (error) {
    console.error("Erro na rede ao tentar apagar o chat:", error);
  }
};

  useEffect(() => {
    const carregarHistorico = async () => {
      const token = localStorage.getItem('kanban_token');
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/historico`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          const dados = await response.json();
          
          if (dados.length > 0) {
            const historicoFormatado = dados.map(msg => ({
              id: msg.id,
              role: msg.role,
              texto: msg.texto
            }));
            
            setMensagens(prev => {
              const msgBoasVindas = prev.find(m => m.id === 1);
              return [msgBoasVindas, ...historicoFormatado].filter(Boolean);
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar o histórico do chat:", error);
      }
    };

    carregarHistorico();
  }, []);

  useEffect(() => {
    chatFimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, isLoading]);
  
  const handleEnviar = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const textoEnviado = input;
  setInput("");

  setMensagens(prev => [...prev, { id: Date.now(), role: 'user', texto: textoEnviado }]);
  setIsLoading(true); 

  try {
  const token = localStorage.getItem('kanban_token');

  const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      mensagem: textoEnviado, 
    }),
  });

  if (response.status === 401) {
    localStorage.removeItem('kanban_token');
    window.location.reload(); 
    return;
  }

  if (!response.ok) throw new Error("Erro na rede");

  const data = await response.json();

  setMensagens(prev => [...prev, { 
    id: Date.now(), 
    role: 'ia', 
    texto: data.resposta 
  }]);

  if (aoAtualizarBanco) {
    aoAtualizarBanco();
  }

} catch (error) {
  console.error("Erro no chat:", error);
  setMensagens(prev => [...prev, { 
    id: Date.now(), 
    role: 'ia', 
    texto: "Ops, tive um probleminha na conexão. Pode tentar de novo?" 
  }]);
} finally {
    setIsLoading(false); 
  }
};

  return (
    <aside className="relative w-[400px] bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-3xl flex flex-col overflow-hidden">
      
      <div className="p-4 border-b border-black/20 flex items-center justify-between gap-3 shrink-0 bg-white/10 backdrop-blur-md">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400/80 via-purple-400/80 to-teal-300/80 flex items-center justify-center border border-black/20 shadow-sm shrink-0 animate-breathe">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.527 2.527l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.527 2.527l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.527-2.527l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-gray-800 font-bold text-sm tracking-wide">
                Kortex AI
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                </div>
                <span className="text-gray-600 text-xs font-medium tracking-wide">
                  {t('status', 'Sempre online')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMostrarConfirmacao(true)}
              title={t('tooltip_limpar', 'Limpar conversa')}
              className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 transition-all duration-300 text-gray-700 shadow-sm shrink-0 hover:bg-red-400/20 hover:text-red-600 hover:border-red-300/60 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>

            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-[11px] font-bold uppercase transition-all duration-300 text-gray-800 shadow-sm shrink-0 flex items-center gap-2 hover:bg-gradient-to-r hover:from-indigo-400/30 hover:to-purple-400/30 hover:border-indigo-300/60 hover:shadow-[0_0_15px_rgba(165,180,252,0.5)] hover:scale-105 active:scale-95"
            >
              <span className="text-sm">{i18n.language === 'pt' ? '🇺🇸' : '🇧🇷'}</span>
              <span>{i18n.language === 'pt' ? 'EN' : 'PT'}</span>
            </button>
          </div>

      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/80 transition-all pr-2 mr-1">
        
        {mensagens.map((msg) => (
          msg.role === 'ia' 
            ? <MensagemIA key={msg.id} texto={msg.texto} />
            : <MensagemUsuario key={msg.id} texto={msg.texto} />
        ))}

        {isLoading && <MensagemDigitando />}
        
        <div ref={chatFimRef} />

      </div>

      <div className="p-4 shrink-0 mb-2">
        <form onSubmit={handleEnviar} className="flex items-center gap-3">
          <input 
            type="text" 
            value={input}               
            onChange={(e) => setInput(e.target.value)} 
            disabled={isLoading}        
            placeholder={t('placeholder', 'Mande um comando...')} 
            className="flex-1 h-12 px-5 bg-white/20 backdrop-blur-md border border-black/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-600 text-gray-800 shadow-sm text-sm transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-400/80 via-purple-400/80 to-teal-300/80 backdrop-blur-sm border border-black/30 hover:opacity-80 hover:scale-105 text-white rounded-2xl transition-all shadow-md shrink-0 disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -mr-0.5 drop-shadow-sm">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
        <div className="h-1 w-1/3 mx-auto bg-black/10 rounded-full mt-4"></div>
      </div>

      {mostrarConfirmacao && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-center w-full max-w-[300px]">
            <h3 className="font-bold text-gray-800 text-lg">
              {t('modal_limpar_titulo', 'Limpar Chat')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('modal_limpar_desc', 'Tem certeza que deseja apagar o histórico dessa conversa?')}
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button 
                onClick={() => setMostrarConfirmacao(false)}
                className="flex-1 py-2 rounded-xl bg-white/40 border border-black/10 text-gray-700 text-sm font-semibold hover:bg-white/60 transition-all"
              >
                {t('botao_cancelar', 'Cancelar')}
              </button>
              <button 
                onClick={confirmarLimpeza}
                className="flex-1 py-2 rounded-xl bg-red-500/80 text-white border border-red-600/30 text-sm font-semibold hover:bg-red-600/90 transition-all shadow-md"
              >
                {t('botao_confirmar', 'Apagar')}
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  )
}