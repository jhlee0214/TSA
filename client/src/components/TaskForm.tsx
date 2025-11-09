import React, { useEffect, useRef, useState } from 'react';
import type { Task } from '../types/task';
import '../styles/TaskForm.css';

type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

type Props = {
  task: Task;
  onSubmit: (payload: { title: string; description?: string; status: Status }) => void | Promise<void>;
  onCancel: () => void;
};

export default function TaskForm({ task, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState<string>(task?.title ?? '');
  const [description, setDescription] = useState<string>(task?.description ?? '');
  const [status, setStatus] = useState<Status>((task?.status as Status) ?? 'NOT_STARTED');
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setStatus((task?.status as Status) ?? 'NOT_STARTED');
  }, [task]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const canSubmit = title.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="tfForm" onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div className="tfRow">
        <label htmlFor="tf-title" className="tfLabel">Title:</label>
        <input
          id="tf-title"
          ref={titleRef}
          type="text"
          placeholder="Enter a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="tfInput"
        />
      </div>

      {/* Description */}
      <div className="tfRow tfRowTextarea">
        <label htmlFor="tf-desc" className="tfLabel">Description:</label>
        <textarea
          id="tf-desc"
          placeholder="Optional details"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="tfTextarea"
        />
      </div>

      {/* Progress */}
      <div className="tfRow">
        <label htmlFor="tf-status" className="tfLabel">Progress:</label>
        <select
          id="tf-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="tfSelect"
        >
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Actions */}
      <div className="tfActions">
        <button
          type="submit"
          disabled={!canSubmit}
          className="tfBtn tfBtnPrimary"
        >
          {submitting ? 'Saving…' : 'Edit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="tfBtn tfBtnGhost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
