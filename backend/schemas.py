from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import StatusEnum

class Tag(BaseModel):
      id: int
      nome: str
      cor: Optional[str] = None

      class Config:
            from_attributes = True

class Tarefa(BaseModel):
      id: int
      titulo: str
      desc: Optional[str] = None
      status: str
      data_limite: Optional[datetime] = None
      criado_em: datetime
      tags: List[Tag] = []

      class Config:
            from_attributes = True

class CriarTarefa(BaseModel):
      titulo: str
      desc: Optional[str] = None
      status: StatusEnum = StatusEnum.A_FAZER
      data_limite: Optional[datetime] = None
      tags: Optional[list[str]] = None

class AtualizarTarefa(BaseModel):
      titulo: Optional[str] = None
      desc: Optional[str] = None
      status: Optional[StatusEnum] = None
      data_limite: Optional[datetime] = None