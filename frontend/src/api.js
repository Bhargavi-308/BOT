
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

function normalizeError(data, fallback = "Request failed") {
  if (!data) return fallback;

  if (typeof data === "string") return data;

  if (typeof data.message === "string") return data.message;

  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg) return item.msg;
        return JSON.stringify(item);
      })
      .join(", ");
  }

  if (typeof data.detail === "object" && data.detail !== null) {
    return JSON.stringify(data.detail);
  }

  return fallback;
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(normalizeError(data));
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request("/auth/me"),

  listConversations: () => request("/conversations"),

  getConversation: (id) => request(`/conversations/${id}`),

  sendMessage: (payload) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteConversation: (id) =>
    request(`/conversations/${id}`, {
      method: "DELETE",
    }),
};
