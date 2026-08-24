import { useState } from "react";
import Stat from "../components/Stat.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { shortDate } from "../utils/date.js";

export default function History() {
  const { cache, fetchHistoryWithFilters } = useAppData();
  const [filters, setFilters] = useState({ type: "", status: "" });

  // Default view: use the pre-fetched cache. Filtered view: fetch on the fly.
  const [filteredTasks, setFilteredTasks] = useState(null);
  const hasFilter = filters.type || filters.status;

  // tasks to display: filtered result if filters are active, otherwise cache
  const tasks = hasFilter ? (filteredTasks ?? []) : (cache.history?.tasks ?? []);

  async function applyFilters(nextFilters) {
    setFilters(nextFilters);
    const anyActive = nextFilters.type || nextFilters.status;
    if (anyActive) {
      const result = await fetchHistoryWithFilters(nextFilters);
      setFilteredTasks(result);
    } else {
      setFilteredTasks(null);   // back to cached default
    }
  }

  const daily    = tasks.filter((t) => t.type === "daily");
  const periodic = tasks.filter((t) => t.type === "periodic");
  const done     = tasks.filter((t) => t.status === "completed").length;
  const missed   = tasks.filter((t) => t.status === "missed").length;

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>History</h1>
        <p className="history-subtitle">Your completed and missed tasks</p>
      </div>
      <div className="history-toolbar">
        <div className="filter-form history-filter-form">
          <label className="filter-group">Type
            <select value={filters.type} onChange={(e) => applyFilters({ ...filters, type: e.target.value })}>
              <option value="">All types</option>
              <option value="daily">Daily</option>
              <option value="periodic">Periodic</option>
            </select>
          </label>
          <label className="filter-group">Status
            <select value={filters.status} onChange={(e) => applyFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
            </select>
          </label>
        </div>
        <div className="history-stats">
          <Stat label="Total"  value={tasks.length} />
          <Stat label="Done"   value={done} />
          <Stat label="Missed" value={missed} />
        </div>
      </div>
      <div className="history-columns">
        <HistoryColumn title="Daily"    tasks={daily} />
        <HistoryColumn title="Periodic" tasks={periodic} />
      </div>
    </div>
  );
}

function HistoryColumn({ title, tasks }) {
  return (
    <section className="history-column">
      <h2 className="history-column-title">{title}</h2>
      <ul className="task-list history-list">
        {tasks.map((task) => (
          <li className={`task-item history-item status-${task.status}`} key={task.id}>
            <div className="history-status-indicator">{task.status === "completed" ? "✓" : "x"}</div>
            <div className="task-body">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <span className={`status-badge ${task.status}`}>{task.status}</span>
                {task.completed_at && <span> - {shortDate(task.completed_at)}</span>}
              </div>
            </div>
          </li>
        ))}
        {!tasks.length && <li className="empty-state history-empty">No {title.toLowerCase()} history</li>}
      </ul>
    </section>
  );
}
