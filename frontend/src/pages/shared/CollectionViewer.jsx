import Modal from "../../components/Modal.jsx";
import { shortDate } from "../../utils/date.js";

export default function CollectionViewer({ kind, item, onClose, onEdit, onRemove }) {
  return (
    <Modal title={item.title} wide onClose={onClose}>
      <div className="view-modal-meta">
        Updated {shortDate(item.updated_at)}
        {item.created_at !== item.updated_at ? ` - Created ${shortDate(item.created_at)}` : ""}
      </div>
      {kind === "code" ? (
        <div className="view-modal-body view-modal-body-code"><pre><code>{item.code}</code></pre></div>
      ) : (
        <div className="view-modal-body">{item.content}</div>
      )}
      <div className="modal-actions">
        <button className="btn-cancel" onClick={onClose}>Close</button>
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={() => onRemove(item.id)}>Delete</button>
      </div>
    </Modal>
  );
}
