import { useState } from "react";
import { shortDate } from "../../utils/date.js";
import { useAppData } from "../../context/AppDataContext.jsx";
import CollectionEditor from "./CollectionEditor.jsx";
import CollectionViewer from "./CollectionViewer.jsx";

export default function CollectionPage({
  title,
  empty,
  kind,
  listKey,        // key inside cache (e.g. "codes" or "notes")
  cacheKey,       // key used in AppDataContext (e.g. "codes" or "notes")
  itemPath,       // base path for create/update/delete (e.g. "/api/codes")
  showFlash,
  createMessage,
  updateMessage,
  deleteMessage,
  apiClient,
}) {
  const { cache, invalidate } = useAppData();
  const [modal, setModal] = useState(null);

  // Read from shared cache — no local API call needed
  const items = cache[cacheKey]?.[listKey] ?? [];

  async function save(item) {
    const editing = Boolean(item.id);
    await apiClient(editing ? `${itemPath}/${item.id}` : itemPath, {
      method: editing ? "PATCH" : "POST",
      body: JSON.stringify(item),
    });
    setModal(null);
    showFlash(editing ? updateMessage : createMessage);
    invalidate(cacheKey);   // refresh this slice in cache
  }

  async function remove(id) {
    await apiClient(`${itemPath}/${id}`, { method: "DELETE" });
    setModal(null);
    showFlash(deleteMessage);
    invalidate(cacheKey);
  }

  return (
    <>
      <h1>{title}</h1>
      <button className="fab" onClick={() => setModal({ mode: "edit", item: { title: "", content: "", code: "", language: "python" } })}>+</button>
      {items.length ? (
        <div className="item-grid">
          {items.map((item) => (
            <article className={`grid-card grid-card-${kind}`} key={item.id} onClick={() => setModal({ mode: "view", item })} tabIndex="0">
              <div className="grid-card-top">
                <h3 className="grid-card-title">{item.title}</h3>
                {kind === "code" && <span className={`snippet-lang lang-${item.language}`}>{item.language}</span>}
              </div>
              {kind === "code" ? (
                <pre className="grid-card-preview grid-card-preview-code">{item.code.slice(0, 120)}</pre>
              ) : (
                <p className="grid-card-preview">{item.content.slice(0, 160)}</p>
              )}
              <div className="grid-card-meta">{shortDate(item.updated_at)}</div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">{empty}</div>
      )}
      {modal?.mode === "view" && (
        <CollectionViewer
          kind={kind}
          item={modal.item}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: "edit", item: modal.item })}
          onRemove={remove}
        />
      )}
      {modal?.mode === "edit" && (
        <CollectionEditor
          kind={kind}
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </>
  );
}
