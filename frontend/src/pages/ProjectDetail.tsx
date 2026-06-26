import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import type { Task, TaskStatus } from '../api/types';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: '📋 Нужно сделать', color: '#e2e8f0' },
  { id: 'in_progress', title: '⚡ В работе', color: '#feebc8' },
  { id: 'testing', title: '🧪 Тестирование', color: '#e0f2fe' },
  { id: 'done', title: '✅ Готово', color: '#c6f6d5' },
];

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const pId = Number(projectId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (pId) {
      loadTasks();
    }
  }, [pId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getTasks(pId);
      setTasks(data);
    } catch (err) {
      console.error('Ошибка при загрузке задач:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const newTask = await tasksApi.createTask({
        title: newTitle,
        description: newDesc,
        project_id: pId,
        status: 'todo',
      });
      setTasks([...tasks, newTask]);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    } catch (err) {
      console.error('Не удалось создать задачу:', err);
    }
  };

  const handleMoveTask = async (taskId: number, currentStatus: TaskStatus, direction: 'next' | 'prev') => {
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'testing', 'done'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= statusOrder.length) return;

    const nextStatus = statusOrder[nextIndex];

    try {
      const updated = await tasksApi.updateTask(taskId, { status: nextStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Ошибка при перемещении задачи:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Удалить эту задачу?')) return;
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка задач...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => navigate('/projects')}
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
      >
        ⬅ К списку проектов
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Доска задач проекта #{projectId}</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          style={{ padding: '10px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isCreating ? 'Отмена' : '+ Добавить задачу'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTask} style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Название задачи"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea
              placeholder="Описание задачи"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '60px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Сохранить</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', alignItems: 'start' }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} style={{ background: col.color, padding: '15px', borderRadius: '8px', minHeight: '400px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>{col.title} ({colTasks.length})</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colTasks.map((task) => (
                  <div key={task.id} style={{ background: '#fff', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{task.title}</h4>
                    {task.description && <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#4a5568' }}>{task.description}</p>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <div>
                        {col.id !== 'todo' && (
                          <button onClick={() => handleMoveTask(task.id, task.status, 'prev')} style={{ marginRight: '4px', cursor: 'pointer' }}>◀</button>
                        )}
                        {col.id !== 'done' && (
                          <button onClick={() => handleMoveTask(task.id, task.status, 'next')} style={{ cursor: 'pointer' }}>▶</button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '13px' }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};