from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.projects import ProjectService


class TaskService:
    @staticmethod
    async def get_all(
            db: AsyncSession,
            owner_id: int,
            project_id: Optional[int] = None,
            status: Optional[TaskStatus] = None,
            limit: int = 10,
            offset: int = 0,
            search: Optional[str] = None
    ):
        """Получить задачи только из проектов этого пользователя"""
        query = select(Task).join(Project).where(Project.owner_id == owner_id)

        if project_id is not None:
            query = query.where(Task.project_id == project_id)

        if status is not None:
            query = query.where(Task.status == status)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    Task.title.ilike(search_filter),
                    Task.description.ilike(search_filter)
                )
            )

        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, task_id: int, owner_id: int):
        """Получить задачу по ID, проверив владельца проекта"""
        result = await db.execute(
            select(Task).join(Project).where(Task.id == task_id, Project.owner_id == owner_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, task_data: TaskCreate, owner_id: int):
        project = await ProjectService.get_by_id(db, task_data.project_id, owner_id=owner_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Проект не найден или у вас нет к нему доступа. Невозможно создать задачу."
            )

        new_task = Task(**task_data.model_dump())
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)
        return new_task

    @staticmethod
    async def update(db: AsyncSession, task_id: int, task_data: TaskUpdate, owner_id: int):
        task = await TaskService.get_by_id(db, task_id, owner_id=owner_id)
        if not task:
            return None

        if hasattr(task_data, 'project_id') and getattr(task_data, 'project_id') is not None:
            project = await ProjectService.get_by_id(db, task_data.project_id, owner_id=owner_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Новый проект не найден или недоступен. Невозможно перенести задачу."
                )

        update_data = task_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def delete(db: AsyncSession, task_id: int, owner_id: int) -> bool:
        task = await TaskService.get_by_id(db, task_id, owner_id=owner_id)
        if not task:
            return False
        await db.delete(task)
        await db.commit()
        return True