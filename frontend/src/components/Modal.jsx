export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-overlay active" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-content ${wide ? "modal-content-wide" : ""}`}>
        <div className="view-modal-header">
          <h2>{title}</h2>
          <button className="view-action-btn" onClick={onClose}>x</button>
        </div>
        {children}
      </section>
    </div>
  );
}
