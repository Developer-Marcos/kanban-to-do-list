import requests
from langchain_core.tools import tool
from typing import Union
import requests
import unicodedata
from langchain_core.tools import tool
from typing import Union

API_BASE_URL = "http://localhost:8000"

def remover_acentos(texto: str) -> str:
    """Transforma 'Irmão' em 'irmao', 'Açúcar' em 'asucar', etc."""
    if not texto: return ""
    return "".join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    ).lower()

def buscar_id_por_nome(nome_busca: str) -> Union[int, str]:
    """
    Versão 2.0: Busca inteligente com remoção de stop-words e normalização.
    """
    try:
        # 1. Busca todas as tarefas
        resposta = requests.get(f"{API_BASE_URL}/tarefas")
        if resposta.status_code != 200:
            return "Erro ao acessar o banco de dados."
        
        tarefas = resposta.json()
        busca_original_limpa = remover_acentos(nome_busca)
        
        # --- PASSO A: TENTATIVA DE MATCH EXATO ---
        for t in tarefas:
            if busca_original_limpa == remover_acentos(t["titulo"]):
                return t["id"]

        # --- PASSO B: LIMPEZA DE STOP WORDS ---
        # Palavras que a IA costuma adicionar e que "sujam" a busca
        stop_words = [
            "tarefa", "de", "da", "do", "o", "a", "os", "as", "um", "uma", 
            "para", "com", "meu", "minha", "ir", "ver", "passar", "mudar", 
            "colocar", "como", "no", "na", "status", "marcar", "finalizada"
        ]
        
        # Filtra a busca para focar apenas nas palavras importantes
        palavras_relevantes = [
            p for p in busca_original_limpa.split() 
            if p not in stop_words and len(p) > 2
        ]
        
        # Se após o filtro não sobrar nada, voltamos para a busca original
        if not palavras_relevantes:
            palavras_relevantes = busca_original_limpa.split()

        # --- PASSO C: BUSCA POR RANKING ---
        ranking = []

        for t in tarefas:
            titulo_limpo = remover_acentos(t["titulo"])
            # Conta quantos "pontos" a tarefa ganha baseado nas palavras relevantes
            pontos = 0
            for palavra in palavras_relevantes:
                if palavra in titulo_limpo:
                    pontos += 1
            
            if pontos > 0:
                ranking.append((pontos, t))
        
        # Ordena: Tarefas com mais matches primeiro
        ranking.sort(key=lambda x: x[0], reverse=True)

        # --- PASSO D: ANÁLISE DO RESULTADO ---
        if not ranking:
            return f"Nenhuma tarefa encontrada para '{nome_busca}'."

        # Se houver um vencedor claro (o 1º tem mais pontos que o 2º)
        if len(ranking) == 1 or ranking[0][0] > ranking[1][0]:
            return ranking[0][1]["id"]
        
        # Se houver empate técnico, pedimos esclarecimento
        maior_pontuacao = ranking[0][0]
        empatadas = [item[1] for item in ranking if item[0] == maior_pontuacao]
        
        ids_nomes = [f"#{t['id']} '{t['titulo']}'" for t in empatadas]
        return f"Encontrei tarefas parecidas: {', '.join(ids_nomes)}. Qual delas você prefere?"

    except Exception as e:
        return f"Erro na busca: {str(e)}"
    


# Criar tarefa
@tool
def criar_tarefa_tool(titulo: str, desc: str = None, status: str = "A_FAZER", data_limite: str = None, tags: list[str] = None) -> str:
      """
            Cria uma nova tarefa no quadro Kanban.
            Sempre use esta ferramenta quando o usuário pedir para criar, adicionar ou agendar uma nova tarefa. (Basicamente fazer uma nova tarefa surgir)
            O status padrão deve ser "A_FAZER" a menos que o usuário especifique outro.
            IMPORTANTE: O campo 'data_limite' DEVE estar estritamente no formato 'YYYY-MM-DD' (ex: 2026-03-10).
      """
      tarefa_payload = {
            "titulo": titulo,
            "desc": desc,
            "status": status,
            "data_limite": data_limite
      }

      if tags is not None:
            tarefa_payload["tags"] = tags

      resposta = requests.post(f"{API_BASE_URL}/tarefas", json=tarefa_payload)

      if resposta.status_code == 200:
            dados = resposta.json()
            return f"Sucesso! Tarefa '{dados['titulo']}' criada com ID {dados['id']}."
      else:
            return f"Erro ao criar tarefa: {resposta.text}"

# Atualizar tarefa
@tool
def atualizar_tarefa_tool(
    nome_tarefa_busca: str = None, 
    tarefa_id: int = None, 
    novo_titulo: str = None, 
    novo_desc: str = None, 
    novo_status: str = None, 
    nova_data_limite: str = None,
    nova_tag: list[str] = None
) -> str:
      """
            Atualiza uma tarefa existente no quadro Kanban.
            Para encontrar a tarefa, você DEVE fornecer o 'tarefa_id' OU o 'nome_tarefa_busca'.
            Se fornecer o 'nome_tarefa_busca', a ferramenta vai buscar o ID automaticamente.
            Os campos com prefixo 'novo_' são os dados que serão alterados na tarefa.
            IMPORTANTE: O campo 'nova_data_limite' DEVE estar estritamente no formato 'YYYY-MM-DD' (ex: 2026-03-10).
      """

      if not tarefa_id and not nome_tarefa_busca:
            return "Erro: Você precisa fornecer o 'tarefa_id' ou o 'nome_tarefa_busca' para eu encontrar o card."
      
      if not tarefa_id:
            resultado = buscar_id_por_nome(nome_tarefa_busca)
            if isinstance(resultado, str): return resultado
            tarefa_id = resultado

      tarefa_payload = {k: v for k, v in {
            "titulo": novo_titulo, 
            "desc": novo_desc, 
            "status": novo_status, 
            "data_limite": nova_data_limite,
            "tags": nova_tag
      }.items() if v is not None}

      if not tarefa_payload:
            return f"A tarefa '{nome_tarefa_busca or tarefa_id}' foi encontrada, mas você não informou nenhum dado novo para atualizar."
      
      resposta = requests.put(f"{API_BASE_URL}/tarefas/{tarefa_id}", json=tarefa_payload)

      if resposta.status_code == 200:
            return f"Sucesso! Tarefa {tarefa_id} atualizada com os dados: {tarefa_payload}"
      else:
            return f"Erro ao atualizar tarefa: {resposta.text}"
      
#Deletar tarefa
@tool
def deletar_tarefa_tool(nome_tarefa_busca: str = None, tarefa_id: int = None) -> str:
      """Deleta uma tarefa. Forneça 'tarefa_id' ou 'nome_tarefa_busca'."""
      if not tarefa_id and not nome_tarefa_busca:
           return "Erro: Forneça o 'tarefa_id' ou o 'nome_tarefa_busca'."
      
      if not tarefa_id:
           resultado = buscar_id_por_nome(nome_tarefa_busca)
           if isinstance(resultado, str): return resultado
           tarefa_id = resultado
      
      resposta = requests.delete(f"{API_BASE_URL}/tarefas/{tarefa_id}")
      return f"Tarefa {tarefa_id} excluída com sucesso." if resposta.status_code == 200 else f"Erro: {resposta.text}"

# Ler tarefas
@tool
def buscar_tarefas_tool(status: str = None, termo_busca: str = None):
      """
            Busca e lista tarefas do quadro Kanban.
            Use esta ferramenta quando o usuário perguntar quais tarefas existem, 
            pedir detalhes de uma tarefa específica, ou perguntar o que está com um status específico (ex: "o que eu tenho pra fazer?").
            - status: Opcional. Filtra por status exato (A_FAZER, EM_PROGRESSO, FEITO).
            - termo_busca: Opcional. Busca tarefas que contenham esta palavra no título ou na descrição.
      """
      
      try:
            resposta = requests.get(f"{API_BASE_URL}/tarefas")
            if resposta.status_code != 200:
                  return "Erro ao acessar o banco de dados para buscar tarefas."
                  
            tarefas = resposta.json()

            if status:
                  tarefas = [t for t in tarefas if t["status"] == status]

            if termo_busca:
                 termo_busca = termo_busca.lower()
                 tarefas = [
                      t for t in tarefas
                      if termo_busca in t["titulo"].lower()
                      or (t["desc"] and termo_busca in t["desc"].lower())
                 ]
            
            if not tarefas:
                 return "Nenhuma tarefa encontrada com os filtros informados."

            resultado = f"Encontrei {len(tarefas)} tarefa(s):\n"
            for t in tarefas:
                 desc = t.get('desc') or 'Sem descrição'
                 prazo = t.get('data_limite') or 'Sem prazo'
                 resultado += f" ID {t['id']}: '{t['titulo']}' | Status: {t['status']} | Detalhes: {desc} | Prazo: {prazo}\n"
            
            return resultado
      except Exception as e:
           return f"Erro na comunicação com a API: {str(e)}"
