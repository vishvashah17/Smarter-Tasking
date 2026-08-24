import CollectionPage from "./shared/CollectionPage.jsx";
import { api } from "../services/api.js";

export default function Codes({ showFlash }) {
  return (
    <CollectionPage
      title="Code Snippets"
      empty="No code snippets yet. Create one with the + button."
      kind="code"
      cacheKey="codes"
      listKey="snippets"
      itemPath="/api/codes"
      showFlash={showFlash}
      createMessage="Snippet created."
      updateMessage="Snippet updated."
      deleteMessage="Snippet deleted."
      apiClient={api}
    />
  );
}
