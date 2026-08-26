import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { shortDate } from "../../utils/date.js";
import { useAppData } from "../../context/AppDataContext.jsx";
import CollectionEditor from "./CollectionEditor.jsx";
import CollectionViewer from "./CollectionViewer.jsx";

export default function CollectionPage({
  title,
  empty,
  kind,
  listKey,
  cacheKey,
  itemPath,
  showFlash,
  createMessage,
  updateMessage,
  deleteMessage,
  apiClient,
}) {
  const { cache, optimisticUpdate } = useAppData();
  const [modal, setModal] = useState(null);
  const gridRef = useRef(null);

  const items = cache[cacheKey]?.[listKey] ?? [];

  // ── Stagger cards in whenever items change ──────────────────────────────────
  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".grid-card",
        { opacity: 0, y: 22, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "power3.out",
          stagger: { amount: 0.35, from: "start" },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [items.length]);

  // ── Mutations ───────────────────────────────────────────────────────────────

  async function save(item) {
    const editing = Boolean(item.id);
    setModal(null);
    showFlash(editing ? updateMessage : createMessage);

    await optimisticUpdate(
      cacheKey,
      (prev) => {
        const list = prev?.[listKey] ?? [];
        if (editing) {
          return { ...prev, [listKey]: list.map((i) => (i.id === item.id ? { ...i, ...item } : i)) };
        }
        const tempItem = {
          ...item,
          id: `temp-${Date.now()}`,
          updated_at: new Date().toISOString(),
          _optimistic: true,
        };
        return { ...prev, [listKey]: [tempItem, ...list] };
      },
      () => apiClient(editing ? `${itemPath}/${item.id}` : itemPath, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(item),
      }),
      (err) => showFlash(`Failed to save: ${err.message}`)
    );
  }

  async function remove(id) {
    setModal(null);
    showFlash(deleteMessage);

    await optimisticUpdate(
      cacheKey,
      (prev) => ({ ...prev, [listKey]: (prev?.[listKey] ?? []).filter((i) => i.id !== id) }),
      () => apiClient(`${itemPath}/${id}`, { method: "DELETE" }),
      (err) => showFlash(`Failed to delete: ${err.message}`)
    );
  }

  return (
    <>
      <h1>{title}</h1>

      <div ref={gridRef} className="item-grid">
        <article
          className={`grid-card grid-card-add grid-card-${kind}`}
          onClick={() =>
            setModal({
              mode: "edit",
              item: { title: "", content: "", code: "", language: "python" },
            })
          }
          tabIndex="0"
        >
          <div className="grid-card-add-inner">
            <span className="grid-card-add-label">
              Add new {kind === "code" ? "Code Snippet" : "Note"}
            </span>
          </div>
        </article>

        {items.map((item) => (
          <article
            className={`grid-card grid-card-${kind} grid-card-real`}
            key={item.id}
            onClick={() => setModal({ mode: "view", item })}
            tabIndex="0"
          >
            <div className="grid-card-top">
              <h3 className="grid-card-title">{item.title}</h3>
              {kind === "code" && (
                <span className={`snippet-lang lang-${item.language}`}>{item.language}</span>
              )}
            </div>
            {kind === "code" ? (
              <pre className="grid-card-preview grid-card-preview-code">
                {item.code.slice(0, 120)}
              </pre>
            ) : (
              <p className="grid-card-preview">{item.content.slice(0, 160)}</p>
            )}
            <div className="grid-card-meta">{shortDate(item.updated_at)}</div>
          </article>
        ))}
      </div>

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
