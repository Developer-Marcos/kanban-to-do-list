from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import models
from database import engine, pegar_db

app = FastAPI(title="Kanban To-Do API")

app.get("/")
def ler_raiz():
      return {"mensagem": "API do Kanban está rodando!"}

@app.get("/testar-banco")
def testar_conexao(db: Session = Depends(pegar_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Sucesso", "mensagem": "Conectado ao PostgreSQL do Docker!"}
    except Exception as e:
        return {"status": "Erro", "mensagem": str(e)}