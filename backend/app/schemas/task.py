from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.models.task import TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(None, max_length=1024)
    status: TaskStatus = TaskStatus.TODO


class TaskCreate(TaskBase):
    project_id: int

    @field_validator("status", mode="before")
    @classmethod
    def to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None

    @field_validator("status", mode="before")
    @classmethod
    def to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v


class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True