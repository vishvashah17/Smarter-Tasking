import { useState } from "react";
import Modal from "../components/Modal.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { api } from "../services/api.js";

export default function Tasks({ type, showFlash }) {
  const { cache, invalidate, optimisticUpdate } = useAppData();
  const cacheKey = type === "daily" ? "dailyTasks" : "periodicTasks";

  // Read tasks directly from the shared cache
  const tasks = cache[cacheKey]?.tasks ?? [];

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });

  async function createTask(event) {
    event.preventDefault();
    const newTask = {
      id: `temp-${Date.now()}`,      // temporary id – replaced after server sync
      ...form,
      type,
      deadline: form.deadline || null,
      status: "active",
      _optimistic: true,
    };
    setModal(false);
    setForm({ title: "", description: "", deadline: "" });
    showFlash("Task added.");

    await optimisticUpdate(
      cacheKey,
      (prev) => ({ ...prev, tasks: [newTask, ...(prev?.tasks ?? [])] }),
      () => api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ ...form, type, deadline: form.deadline || null }),
      }),
      (err) => showFlash(`Failed to save task: ${err.message}`)
    );
  }

  async function completeTask(id) {
    showFlash("Task completed.");

    await optimisticUpdate(
      cacheKey,
      (prev) => ({ ...prev, tasks: (prev?.tasks ?? []).filter((t) => t.id !== id) }),
      () => api(`/api/tasks/${id}/complete`, { method: "POST", body: "{}" }),
      (err) => showFlash(`Failed to complete task: ${err.message}`)
    );
    // history slice is now stale regardless of rollback
    invalidate("history");
  }

  async function deleteTask(id) {
    showFlash("Task deleted.");

    await optimisticUpdate(
      cacheKey,
      (prev) => ({ ...prev, tasks: (prev?.tasks ?? []).filter((t) => t.id !== id) }),
      () => api(`/api/tasks/${id}`, { method: "DELETE" }),
      (err) => showFlash(`Failed to delete task: ${err.message}`)
    );
  }

  return (
    <>
      <h1>{type === "daily" ? "Daily tasks" : "Periodic tasks"}</h1>
      <button className="fab" onClick={() => setModal(true)} title="New task">+</button>
      <ul className="task-list">
        {tasks.map((task) => (
          <li className="task-item" key={task.id}>
            <button className="complete-btn" title="Mark complete" onClick={() => completeTask(task.id)}>✓</button>
            <div className="task-body">
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-desc">{task.description}</div>}
              {task.deadline && <div className="task-meta">Due {new Date(task.deadline).toLocaleString()}</div>}
            </div>
            <button className="delete-btn" title="Delete" onClick={() => deleteTask(task.id)}>x</button>
          </li>
        ))}
        {!tasks.length && <li className="empty-state">No tasks yet. Add one with the + button.</li>}
      </ul>
      {modal && (
        <Modal title={type === "daily" ? "New Task" : "New Periodic Task"} onClose={() => setModal(false)}>
          <form onSubmit={createTask}>
            <label>Title
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>
            <label>Notes
              <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            {type === "periodic" && (
              <label>Deadline
                <input type="datetime-local" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} required />
              </label>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Add task</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
