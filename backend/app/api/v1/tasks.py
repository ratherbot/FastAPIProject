from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.models.task import TaskStatus
from app.services.tasks import TaskService
# Защита
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    project_id: Optional[int] = None,
    status: Optional[TaskStatus] = None,
    limit: int = 10,
    offset: int = 0,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <-- Защита
):
    """Получить список задач (только из проектов текущего пользователя)"""
    return await TaskService.get_all(
        db,
        owner_id=current_user.id,  # <-- Передаем хозяина
        project_id=project_id,
        status=status,
        limit=limit,
        offset=offset,
        search=search,
    )

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <-- Защита
):
    """Создать задачу (только в своем проекте)"""
    return await TaskService.create(db, task_in, owner_id=current_user.id)

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <-- Защита
):
    """Получить задачу по ID (только если проект твой)"""
    task = await TaskService.get_by_id(db, task_id, owner_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена или нет доступа")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <-- Защита
):
    """Обновить задачу (только в своем проекте)"""
    updated_task = await TaskService.update(db, task_id, task_in, owner_id=current_user.id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Задача не найдена или нет доступа")
    return updated_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <-- Защита
):
    """Удалить задачу (только в своем проекте)"""
    success = await TaskService.delete(db, task_id, owner_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Задача не найдена или нет доступа")
    return None