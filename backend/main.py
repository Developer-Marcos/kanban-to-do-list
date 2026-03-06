from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import schemas
import models
from database import engine, pegar_db
from fastapi import FastAPI, Depends, HTTPException

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Kanban To-Do API")


@app.get("/")
def ler_raiz():
      return {"mensagem": "API do Kanban está rodando!"}

# Criar tarefa (Crud) - Create
@app.post("/tarefas", response_model=schemas.Tarefa)
def criar_tarefa(tarefa: schemas.CriarTarefa, db: Session = Depends(pegar_db)):
      nova_tarefa = models.Tarefa(
            titulo = tarefa.titulo,
            desc = tarefa.desc,
            status = tarefa.status,
            data_limite = tarefa.data_limite
      )

      db.add(nova_tarefa)
      db.commit()
      db.refresh(nova_tarefa)

      return nova_tarefa

# Le as tarefas disponiveis (cRud) - Read
@app.get("/tarefas", response_model=List[schemas.Tarefa])
def listar_tarefas(db: Session = Depends(pegar_db)):
      tarefas = db.query(models.Tarefa).all()
      return tarefas


# Editar tarefa (crUd)- Update
@app.put("/tarefas/{tarefa_id}", response_model=schemas.Tarefa)
def atualizar_tarefa(tarefa_id: int, tarefa_atualizada: schemas.AtualizarTarefa, db: Session = Depends(pegar_db)):
      tarefa_db = db.query(models.Tarefa).filter(models.Tarefa.id == tarefa_id).first()

      if not tarefa_db:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")
      
      if tarefa_atualizada.titulo is not None:
            tarefa_db.titulo = tarefa_atualizada.titulo
      if tarefa_atualizada.desc is not None:
            tarefa_db.desc = tarefa_atualizada.desc
      if tarefa_atualizada.status is not None:
            tarefa_db.status = tarefa_atualizada.status
      if tarefa_atualizada.data_limite is not None:
            tarefa_db.data_limite = tarefa_atualizada.data_limite

      db.commit()
      db.refresh(tarefa_db)

      return tarefa_db

# Deletar tarefa (cruD) - Delete
@app.delete("/tarefas/{tarefa_id}")
def deletar_tarefa(tarefa_id: int, db: Session = Depends(pegar_db)):
      tarefa_db = db.query(models.Tarefa).filter(models.Tarefa.id == tarefa_id).first()

      if not tarefa_db:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")
      
      titulo_excluido = tarefa_db.titulo

      db.delete(tarefa_db)
      db.commit()

      return {
          "status": "Sucesso", 
          "mensagem": f"Tarefa '{titulo_excluido}' (ID {tarefa_id}) excluída com sucesso!"
      }