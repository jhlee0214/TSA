import { useState, useEffect } from 'react'
import './App.css'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import type { Task, Status } from './types/task'
import { deleteTask, getTaskStats } from './api/tasks'

const API_ENV = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedPercent, setCompletedPercent] = useState<number | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ENV);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data: Task[] = await response.json();
      setTasks(data);
      try {
        const stats = await getTaskStats();
        setCompletedPercent(stats.percentCompleted);
      } catch (statsError) {
        console.error(statsError);
        setCompletedPercent(null);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  if (loading) {
    return (
      <div className="tsa-spinner" role="status" aria-live="polite">
        <div className="tsa-spinner__circle" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const onEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (payload: { title: string; description?: string; status: Status }) => {
    if (!editingTask) return;
    try {
      const response = await fetch(`http://localhost:3000/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Close modal and refresh tasks
      setIsModalOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };
  
  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const onDelete = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  return (
    <div className="app-shell">
      <div className="titleBar" role="banner">
        <h2 className="title">Task Management for TSA</h2>
      </div>
      <div className="completion">
        <div
          className="completion__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completedPercent !== null && Number.isFinite(completedPercent) ? Number(completedPercent.toFixed(2)) : 0}
        >
          <div
            className="completion__fill"
            style={{ width: `${Math.max(0, Math.min(100, completedPercent ?? 0))}%` }}
          />
        </div>
        <div className="task-complete-stat">
          Completion: {completedPercent !== null && Number.isFinite(completedPercent) ? `${completedPercent.toFixed(2)}%` : '—'}
        </div>
      </div>
      {error && <p className="error">Error: {error}</p>}
      {!error && <TaskList tasks={tasks} onEdit={onEdit} onDelete={onDelete} />}
      {isModalOpen && editingTask && (
        <div
          onClick={handleCancelEdit}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
          style={{ backgroundColor: '#fff', padding: '1rem', minWidth: '400px' }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Task #{editingTask.id}</h2>
            <TaskForm
              task={editingTask}
              onSubmit={handleUpdateSubmit}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
