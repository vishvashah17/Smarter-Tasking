import CollectionPage from "./shared/CollectionPage.jsx";
import { api } from "../services/api.js";

export default function Notes({ showFlash }) {
  return (
    <CollectionPage
      title="Notes"
      empty="No notes yet. Create one with the + button."
      kind="note"
      listPath="/api/notes"
      listKey="notes"
      itemPath="/api/notes"
      showFlash={showFlash}
      createMessage="Note created."
      updateMessage="Note updated."
      deleteMessage="Note deleted."
      apiClient={api}
    />
  );
}
