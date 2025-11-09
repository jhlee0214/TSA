import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task, Status } from '../types/task';
import '../styles/TaskList.css';

// Props definition for TaskList component
interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task, status: Status) => void;
  onDelete: (taskId: number) => void;
}

// Status options for filtering
const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

// TaskList component to display and manage a list of tasks
const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close filter panel when clicking outside
  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setFilterOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  // Filter tasks based on selected statuses
  const filteredTasks = useMemo(() => {
    if (selectedStatuses.length === 0) return tasks;
    return tasks.filter((task) => selectedStatuses.includes(task.status ?? 'NOT_STARTED'));
  }, [tasks, selectedStatuses]);

  // Render message if no tasks are available
  if (filteredTasks.length === 0) {
    const message = selectedStatuses.length
      ? 'No tasks match the selected status.'
      : 'No tasks available.';
    return (
      <div className="task-empty">
        <p>{message}</p>
      </div>
    );
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th className="task-table__th">ID</th>
          <th className="task-table__th">Title</th>
          <th className="task-table__th">Description</th>
          <th className="task-table__th task-table__th--status">
            <button
              type="button"
              className="task-status-filter__trigger"
              ref={triggerRef}
              onClick={() => setFilterOpen((prev) => !prev)}
            >
              Status
              {selectedStatuses.length > 0 && (
                <span className="task-status-filter__count">{selectedStatuses.length}</span>
              )}
              <span className="task-status-filter__chevron">▾</span>
            </button>
            {filterOpen && (
              <div className="task-status-filter__panel" ref={panelRef}>
                {STATUS_OPTIONS.map((option) => (
                  <label key={option.value} className="task-status-filter__option">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(option.value)}
                      onChange={(e) => {
                        setSelectedStatuses((prev) =>
                          e.target.checked
                            ? [...prev, option.value]
                            : prev.filter((status) => status !== option.value),
                        );
                      }}
                    />
                    {option.label}
                  </label>
                ))}
                <button
                  type="button"
                  className="task-status-filter__clear"
                  onClick={() => setSelectedStatuses([])}
                >
                  Clear
                </button>
              </div>
            )}
          </th>
          <th className="task-table__th">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredTasks.map((task) => (
          <tr key={task.id} className="task-table__row">
            <td className="task-table__td">{task.id}</td>
            <td className="task-table__td">{task.title}</td>
            <td className="task-table__td">{task.description ?? '-'}</td>
            <td className="task-table__td">
              <StatusBadge status={task.status ?? 'NOT_STARTED'} />
            </td>
            <td className="task-table__td task-table__td--actions">
              <button
                type="button"
                className="task-edit-button"
                onClick={() => onEdit(task, task.status ?? 'NOT_STARTED')}
              >
                Edit
              </button>
              <button
                type="button"
                className="task-delete-button task-delete-button--danger"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const label =
    status === 'NOT_STARTED'
      ? 'Not Started'
      : status === 'IN_PROGRESS'
      ? 'In Progress'
      : 'Completed';

  const statusClass =
    status === 'NOT_STARTED'
      ? 'status-badge--not-started'
      : status === 'IN_PROGRESS'
      ? 'status-badge--in-progress'
      : 'status-badge--completed';

  return <span className={`status-badge ${statusClass}`}>{label}</span>;
};

export default TaskList;
