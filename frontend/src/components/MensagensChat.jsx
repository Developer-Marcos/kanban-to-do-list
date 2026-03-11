export function MensagemIA({ texto }) {
  return (
    <div className="self-start w-5/6">
      <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm shadow-md text-gray-100 text-sm leading-relaxed">
        {texto}
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