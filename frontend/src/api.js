const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("kanban_token");
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (response.status === 401) {
    localStorage.removeItem("kanban_token");
    window.location.reload();
  }

  return response.json();
};