export async function api(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const response = await fetch(path, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Timezone-Offset": String(new Date().getTimezoneOffset()),
      ...headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
