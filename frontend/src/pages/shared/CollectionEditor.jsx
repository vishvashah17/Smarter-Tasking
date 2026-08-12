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

  return (
    <Modal title={`${item.id ? "Edit" : "New"} ${kind === "code" ? "Snippet" : "Note"}`} onClose={onClose}>
      <form onSubmit={submit}>
        <label>Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </label>
        {kind === "code" && (
          <label>Language
            <select value={form.language || "python"} onChange={(event) => setForm({ ...form, language: event.target.value })}>
              {languages.map((language) => <option key={language} value={language}>{language}</option>)}
            </select>
          </label>
        )}
        <label>{kind === "code" ? "Code" : "Content"}
          <textarea value={form[bodyKey] || ""} onChange={(event) => setForm({ ...form, [bodyKey]: event.target.value })} required />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
