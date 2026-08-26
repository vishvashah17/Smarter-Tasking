import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Modal from "../components/Modal.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { api } from "../services/api.js";

export default function Tasks({ type, showFlash }) {
  const { cache, invalidate, optimisticUpdate } = useAppData();
  const cacheKey = type === "daily" ? "dailyTasks" : "periodicTasks";

  const tasks    = cache[cacheKey]?.tasks ?? [];
  const listRef  = useRef(null);
  const prevLen  = useRef(tasks.length);

  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ title: "", description: "", deadline: "" });

  // ── Stagger all items in when the page first mounts ───────────────────────
  useEffect(() => {
    if (!listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".task-item",
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power3.out", stagger: 0.07 }
      );
    }, listRef);
    return () => ctx.revert();
  // Only on initial mount — deliberately empty dep array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animate in each freshly-prepended task (after optimistic update) ───────
  useEffect(() => {
    if (!listRef.current) return;
    if (tasks.length <= prevLen.current) {
      prevLen.current = tasks.length;
      return;
    }
    prevLen.current = tasks.length;

    // The newly created task is prepended right after the add card
    const taskItems = listRef.current.querySelectorAll(".task-item-real");
    if (taskItems.length > 0) {
      const firstItem = taskItems[0];
      gsap.fromTo(
        firstItem,
        { opacity: 0, y: -28, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out" }
      );
    }
  }, [tasks.length]);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  async function createTask(event) {
    event.preventDefault();
    const newTask = {
      id: `temp-${Date.now()}`,
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

  async function completeTask(id, el) {
    // Animate the item out before removing it
    if (el) {
      await gsap.to(el, { opacity: 0, x: 40, scale: 0.95, duration: 0.28, ease: "power2.in" });
    }
    showFlash("Task completed.");

    await optimisticUpdate(
      cacheKey,
      (prev) => ({ ...prev, tasks: (prev?.tasks ?? []).filter((t) => t.id !== id) }),
      () => api(`/api/tasks/${id}/complete`, { method: "POST", body: "{}" }),
      (err) => showFlash(`Failed to complete task: ${err.message}`)
    );
    invalidate("history");
  }

  async function deleteTask(id, el) {
    if (el) {
      await gsap.to(el, { opacity: 0, x: 40, scale: 0.95, duration: 0.28, ease: "power2.in" });
    }
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
      <ul ref={listRef} className="task-list">
        <li className="task-item task-item-add" onClick={() => setModal(true)} tabIndex="0">
          <div className="task-add-btn">
            <span>Add new {type === "daily" ? "daily task" : "periodic task"}...</span>
          </div>
        </li>

        {tasks.map((task) => (
          <li className="task-item task-item-real" key={task.id}>
            <button
              className="complete-btn"
              title="Mark complete"
              onClick={(e) => completeTask(task.id, e.currentTarget.closest(".task-item"))}
            >✓</button>
            <div className="task-body">
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-desc">{task.description}</div>}
              {task.deadline    && (
                <div className="task-meta">Due {new Date(task.deadline).toLocaleString()}</div>
              )}
            </div>
            <button
              className="delete-btn"
              title="Delete"
              onClick={(e) => deleteTask(task.id, e.currentTarget.closest(".task-item"))}
            >x</button>
          </li>
        ))}
        {!tasks.length && (
          <li className="empty-state">No active tasks. Click above to add one.</li>
        )}
      </ul>

      {modal && (
        <Modal
          title={type === "daily" ? "New Daily Task" : "New Periodic Task"}
          icon={null}
          sharp
          onClose={() => setModal(false)}
        >
          <form onSubmit={createTask} className="modal-form">
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">Task Title</label>
              <input
                id="task-title"
                className="form-input"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="task-desc" className="form-label">Description / Notes</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Add optional details or subtasks..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            {type === "periodic" && (
              <div className="form-group">
                <label htmlFor="task-deadline" className="form-label">Target Deadline</label>
                <input
                  id="task-deadline"
                  type="datetime-local"
                  className="form-input"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Task
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
