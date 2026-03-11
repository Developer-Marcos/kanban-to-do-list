import os
from dotenv import load_dotenv
from datetime import datetime
from typing import Annotated, TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import SystemMessage
from langgraph.checkpoint.memory import MemorySaver

# Prompt e Ferramentas do Agente
from prompt import INSTRUCOES_SISTEMA
from ai_tools import (
      criar_tarefa_tool,
      atualizar_tarefa_tool,
      deletar_tarefa_tool,
      buscar_tarefas_tool
)

# Variaveis do ambiente
if not load_dotenv():
    load_dotenv("../.env")
    
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.5-flash")

if not GOOGLE_API_KEY:
      raise ValueError("Chave de API do Google não encontrada, verifique o arquivo .env")

# Inicializacao do modelo de LLM e conectando ele com as ferramentas
llm = ChatGoogleGenerativeAI(model = MODEL_NAME, api_key = GOOGLE_API_KEY, temperature = 0)
ferramentas = [criar_tarefa_tool, atualizar_tarefa_tool, deletar_tarefa_tool, buscar_tarefas_tool]

llm_com_ferramentas = llm.bind_tools(ferramentas)

# Definindo o State do grafo (Memória)
class State(TypedDict):
      messages: Annotated[list, add_messages]

# Criando o nó do agente
def agente_node(state: State):
      data_atual = datetime.now().strftime("%d/%m/%Y %H:%M")
      mensagem_sistema = f"{INSTRUCOES_SISTEMA}\n<contexto_adicional>A data e hora atuais são: {data_atual}. Use isso para calcular prazos relativos como 'amanhã', 'semana que vem', etc.</contexto_adicional>"
      
      mensagens_para_llm = [SystemMessage(content=mensagem_sistema)] + state["messages"]
      resposta_do_agente = llm_com_ferramentas.invoke(mensagens_para_llm)
      return {"messages": [resposta_do_agente]}

# Montando o Grafo
grafo = StateGraph(State)

grafo.add_node("Agente", agente_node)
grafo.add_node("Ferramentas", ToolNode(tools=ferramentas))

grafo.add_edge(START, "Agente")
grafo.add_conditional_edges("Agente", tools_condition, {"tools": "Ferramentas", END: END})

grafo.add_edge("Ferramentas", "Agente")

# Compilando o Agente 
memoria = MemorySaver()
agente = grafo.compile(checkpointer=memoria)


# Teste no terminal
if __name__ == "__main__":
      print(f"Agente iniciado com o modelo: {MODEL_NAME}")
      print('Digite 0 para encerrar.\n')

      config_thread = {"configurable": {"thread_id": "meu_kanban_1"}}

      while True:
            input_usuario = input("Você: ")
            if input_usuario == "0":
                  print("Agente: Até Logo!")
                  break
      
            print("Pensando...")
            eventos = agente.stream(
                  {"messages": [("user", input_usuario)]},
                  config=config_thread,
                  stream_mode = "values"
            )

            for evento in eventos:
                  ultima_msg = evento["messages"][-1]

                  if ultima_msg.type == "ai" and ultima_msg.content:
                        conteudo = ultima_msg.content
                        
                        if isinstance(conteudo, list):
                              texto_limpo = "".join(
                                    [bloco.get("text", "") for bloco in conteudo if isinstance(bloco, dict) and "text" in bloco]
                              )
                              print(f"IA: {texto_limpo}\n")
                        else:
                              print(f"IA: {conteudo}\n")

