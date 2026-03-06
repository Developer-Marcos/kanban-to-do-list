from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime, Date, Table
from sqlalchemy.orm import declarative_base, relationship
import enum
from datetime import datetime, timezone

Base = declarative_base()

class StatusEnum(str, enum.Enum):
      A_FAZER = "A_FAZER"
      EM_PROGRESSO = "EM_PROGRESSO"
      FEITO = "FEITO"

tarefas_tags = Table(
    'tarefas_tags',
    Base.metadata,
    Column('tarefa_id', Integer, ForeignKey('tarefas.id', ondelete="CASCADE"), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete="CASCADE"), primary_key=True)
)

class Tarefa(Base):
      __tablename__ = "tarefas"

      id = Column(Integer, primary_key=True, index=True)
      titulo = Column(String(255), nullable=False)
      desc = Column(Text, nullable=True)
      status = Column(Enum(StatusEnum), default=StatusEnum.A_FAZER, nullable=False)
      criado_em = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
      data_limite = Column(DateTime, nullable=True)

      tags = relationship("Tag", secondary=tarefas_tags, back_populates="tarefas")

class Tag(Base):
      __tablename__ = "tags"

      id = Column(Integer, primary_key=True, index=True)
      nome = Column(String(50), unique=True, nullable=False)
      desc = Column(Text, nullable=True)
      cor = Column(String(7), nullable=True)

      tarefas = relationship("Tarefa", secondary=tarefas_tags, back_populates="tags")