import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { useAuthStore } from '../store/authStore';


const ProjectCard = ({
  project,
  onUpdate,
  onDelete
}: {
  project: any;
  onUpdate: (id: number, data: { title: string; description: string }) => void;
  onDelete: (id: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editDescription, setEditDescription] = useState(project.description || '');

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editTitle.trim()) return;

    onUpdate(project.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Вы уверены, что хотите удалить проект "${project.title}"?`)) {
      onDelete(project.id);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderLeft: '5px solid #007bff',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  if (isEditing) {
    return (
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Сохранить
          </button>
          <button onClick={handleCancel} style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Link
        to={`/projects/${project.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ paddingRight: '220px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{project.title}</h4>
            <p style={{ margin: '0', color: '#666' }}>{project.description || 'Без описания'}</p>
          </div>
        </div>
      </Link>

      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', zIndex: 2 }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          style={{ padding: '6px 12px', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
        >
          ✏️ Редактировать
        </button>
        <button
          onClick={handleDeleteClick}
          style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
        >
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
};


export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setTitle('');
      setDescription('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Не удалось создать проект');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title: string; description: string } }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Не удалось обновить проект');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Не удалось удалить проект');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title, description });
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Мои Проекты 🚀</h1>
        <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Выйти
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3>Создать новый проект</h3>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Название проекта"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <textarea
            placeholder="Описание проекта"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
          />
        </div>
        <button type="submit" disabled={createMutation.isPending} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {createMutation.isPending ? 'Создание...' : 'Добавить проект'}
        </button>
      </form>

      <h2>Список проектов</h2>
      {isLoading && <p>Загрузка проектов...</p>}
      {isError && <p style={{ color: 'red' }}>Ошибка при загрузке проектов. Проверь бэкенд.</p>}

      {projects && projects.length === 0 && <p>У тебя пока нет ни одного проекта. Самое время создать!</p>}

      <div style={{ display: 'grid', gap: '15px' }}>
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onUpdate={(id, data) => updateMutation.mutate({ id, data })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
};