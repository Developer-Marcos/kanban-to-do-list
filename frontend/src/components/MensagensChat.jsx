import ReactMarkdown from 'react-markdown';

export function MensagemIA({ texto }) {
  return (
    <div className="self-start w-5/6">
      <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm shadow-md text-gray-100 text-sm leading-relaxed">
        
        <ReactMarkdown 
          components={{
            // Adiciona recuo e as 'bolinhas' nas listas
            ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-2 flex flex-col gap-1" {...props} />,
            // Adiciona números nas listas numeradas
            ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-2 flex flex-col gap-1" {...props} />,
            // Garante que os parágrafos tenham um pequeno espaço entre eles
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            // Destaca textos em negrito
            strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />
          }}
        >
          {texto}
        </ReactMarkdown>

      </div>
    </div>
  )
}

export function MensagemUsuario({ texto }) {
  return (
    <div className="self-end w-4/5 flex justify-end">
      <div className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl rounded-tr-sm shadow-md text-white text-sm leading-relaxed">
        {texto}
      </div>
    </div>
  )
}