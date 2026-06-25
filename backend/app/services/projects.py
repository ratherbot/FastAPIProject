from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:

    @staticmethod
    async def get_all(db: AsyncSession, owner_id: int):
        """Получить все проекты текущего пользователя из БД"""
        result = await db.execute(select(Project).filter(Project.owner_id == owner_id))
        return result.scalars().all()

    @staticmethod
    async def create(db: AsyncSession, project_in: ProjectCreate, owner_id: int):
        """Создать новый проект в БД с привязкой к юзеру"""
        db_project = Project(
            title=project_in.title,
            description=project_in.description,
            owner_id=owner_id
        )
        db.add(db_project)
        await db.commit()
        await db.refresh(db_project)
        return db_project

    @staticmethod
    async def get_by_id(db: AsyncSession, project_id: int, owner_id: int):
        """Получить проект по его ID вместе с задачами (только если юзер — владелец)"""
        result = await db.execute(
            select(Project)
            .filter(Project.id == project_id, Project.owner_id == owner_id)
            .options(selectinload(Project.tasks))
        )
        return result.scalars().first()

    @staticmethod
    async def update(db: AsyncSession, project_id: int, project_in: ProjectUpdate, owner_id: int):
        """Обновить проект по ID (с проверкой владельца)"""
        project = await ProjectService.get_by_id(db, project_id, owner_id=owner_id)
        if not project:
            return None

        project.title = project_in.title
        project.description = project_in.description

        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete(db: AsyncSession, project_id: int, owner_id: int) -> bool:
        """Удалить проект по ID (с проверкой владельца)"""
        project = await ProjectService.get_by_id(db, project_id, owner_id=owner_id)
        if not project:
            return False

        await db.delete(project)
        await db.commit()
        return True