from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.schemas.task import TaskResponse


class ProjectBase(BaseModel):
    title: str = Field(..., max_length=100, description="Название проекта")
    description: Optional[str] = Field(None, max_length=500, description="Описание проекта")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailResponse(ProjectResponse):
    tasks: List[TaskResponse] = []