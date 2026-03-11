import { useTranslation } from 'react-i18next';
import { useDraggable, useDroppable } from '@dnd-kit/core'; 

export function CardTarefa({ tarefa, isOverlay }) {
  const { t, i18n } = useTranslation();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tarefa.id.toString(), 
    data: { tarefa } 
  });

  const style = {
    opacity: isDragging && !isOverlay ? 0.3 : 1, 
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return null;
    return new Intl.DateTimeFormat(i18n.language, { 
      day: '2-digit', 
      month: '2-digit' 
    }).format(new Date(dataStr));
  };

  return (
    <div 
      ref={isOverlay ? null : setNodeRef} 
      {...(isOverlay ? {} : listeners)}   
      {...(isOverlay ? {} : attributes)} 
      style={style}
      className={`bg-white/70 backdrop-blur-md border border-white/50 p-4 rounded-xl shadow-sm transition-all group mb-3 relative overflow-hidden ${
        isOverlay 
          ? 'cursor-grabbing opacity-80 z-50' 
          : 'hover:shadow-md hover:scale-[1.01] cursor-grab active:cursor-grabbing'
      }`}
    >
      
      <div className="flex justify-between items-start gap-2 mb-2 pointer-events-none">
        <h4 className="text-gray-900 font-bold text-sm leading-tight group-hover:text-indigo-700 transition-colors flex-1">
          {tarefa.titulo}
        </h4>
        <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-black/5 font-bold">
          #{tarefa.id}
        </span>
      </div>
      
      {tarefa.desc && (
        <p className="text-gray-700 text-[11px] line-clamp-2 mb-3 leading-relaxed font-medium pointer-events-none">
          {tarefa.desc}
        </p>
      )}

      <div className="flex flex-col gap-3 pointer-events-none">
        {tarefa.tags && tarefa.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tarefa.tags.map(tag => (
              <span key={tag.id} className="px-2 py-0.5 rounded-md text-[9px] font-bold border border-black/10 bg-black/5 text-gray-600 tracking-wider">
                {tag.nome.toUpperCase()}
              </span>
            ))}
          </div>
        )}

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

export function ColunaKanban({ id, titulo, children }) {
  const { setNodeRef } = useDroppable({
    id: id, 
  });

  return (
    <div 
      ref={setNodeRef} 
      className="bg-white/30 rounded-2xl p-4 border border-white/50 flex flex-col gap-4 shadow-sm overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/80 transition-all min-h-[500px]"
    >
      {titulo && (
        <div className="h-8 shrink-0 bg-white/70 rounded-lg w-full flex items-center px-3 font-semibold text-gray-700 shadow-sm pointer-events-none">
          {titulo}
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-h-[50px]">
        {children}
      </div>
    </div>
  )
}