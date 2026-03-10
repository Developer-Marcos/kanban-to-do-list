import { useTranslation } from 'react-i18next';

export function CardTarefa({ tarefa }) {
  const { t, i18n } = useTranslation();

  const formatarData = (dataStr) => {
    if (!dataStr) return null;
    return new Intl.DateTimeFormat(i18n.language, { 
      day: '2-digit', 
      month: '2-digit' 
    }).format(new Date(dataStr));
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group mb-3 relative overflow-hidden">
      
      {/* Header: ID e Título */}
      <div className="flex justify-between items-start gap-2 mb-2">
        {/* Subi para gray-900 para destaque total no título */}
        <h4 className="text-gray-900 font-bold text-sm leading-tight group-hover:text-indigo-700 transition-colors flex-1">
          {tarefa.titulo}
        </h4>
        
        {/* ID mais nítido com gray-600 */}
        <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-black/5 font-bold">
          #{tarefa.id}
        </span>
      </div>
      
      {/* Descrição: Subi para gray-700 para melhor legibilidade */}
      {tarefa.desc && (
        <p className="text-gray-700 text-[11px] line-clamp-2 mb-3 leading-relaxed font-medium">
          {tarefa.desc}
        </p>
      )}

      {/* Footer do Card */}
      <div className="flex flex-col gap-3">
        
        {/* Tags: Texto em gray-600 */}
        {tarefa.tags && tarefa.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tarefa.tags.map(tag => (
              <span 
                key={tag.id} 
                className="px-2 py-0.5 rounded-md text-[9px] font-bold border border-black/10 bg-black/5 text-gray-600 tracking-wider"
              >
                {tag.nome.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Datas: Troquei gray-400 por gray-500/600 para dar contraste */}
        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-black/10">
          <div className="flex gap-1 text-gray-500 font-semibold">
            <span className="opacity-80">{t('label_criado_em', 'Criado em')}:</span>
            <span className="text-gray-700">{formatarData(tarefa.criado_em)}</span>
          </div>
          
          {tarefa.data_limite && (
            <div className="flex gap-1 bg-black/10 px-2 py-0.5 rounded text-gray-700 font-bold">
              <span className="opacity-80 text-gray-600 font-semibold">{t('label_prazo', 'Prazo')}:</span>
              <span>{formatarData(tarefa.data_limite)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ColunaKanban({ titulo, children }) {
  return (
    <div className="bg-white/30 rounded-2xl p-4 border border-white/50 flex flex-col gap-4 shadow-sm overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/80 transition-all ">
      {titulo && (
        <div className="h-8 shrink-0 bg-white/70 rounded-lg w-full flex items-center px-3 font-semibold text-gray-700 shadow-sm">
          {titulo}
        </div>
      )}
      
      {children}
    </div>
  )
}