import { useState } from "react";
import Modal from "../../components/Modal.jsx";
import { languages } from "../../constants.js";

export default function CollectionEditor({ kind, item, onClose, onSave }) {
  const [form, setForm] = useState(item);
  const bodyKey = kind === "code" ? "code" : "content";

  function submit(event) {
    event.preventDefault();
    onSave(form);
  }

  const isEditing = Boolean(item.id);
  const titleText = `${isEditing ? "Edit" : "New"} ${kind === "code" ? "Code Snippet" : "Note"}`;

  return (
    <Modal title={titleText} icon={null} sharp wide={kind === "code"} onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        <div className="form-group">
          <label htmlFor="col-title" className="form-label">Title</label>
          <input
            id="col-title"
            className="form-input"
            placeholder={kind === "code" ? "e.g. Binary Search Tree or API Helper" : "e.g. Meeting Notes..."}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </div>

        {kind === "code" && (
          <div className="form-group">
            <label htmlFor="col-lang" className="form-label">Language</label>
            <select
              id="col-lang"
              className="form-select"
              value={form.language || "python"}
              onChange={(event) => setForm({ ...form, language: event.target.value })}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="col-body" className="form-label">
            {kind === "code" ? "Code" : "Content"}
          </label>
          <textarea
            id="col-body"
            className={`form-textarea ${kind === "code" ? "code-font" : ""}`}
            placeholder={kind === "code" ? "Write or paste your code snippet here..." : "Write note details here..."}
            value={form[bodyKey] || ""}
            onChange={(event) => setForm({ ...form, [bodyKey]: event.target.value })}
            required
            rows={kind === "code" ? 8 : 5}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
