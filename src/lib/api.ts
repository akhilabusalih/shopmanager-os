export const API_BASE_URL = "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("shopmanager_token");
  
  const headers = new Headers(options.headers || {});
  
  // Attach JWT if it exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // If body is JSON object, stringify and set content-type
  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
    body: body as RequestInit["body"],
  });

  if (!response.ok) {
    let errorData;
    let errorMessage = "An error occurred";
    try {
      errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text();
    }
    
    // If we get a 401 Unauthorized, we should clear the token and force login
    if (response.status === 401) {
      localStorage.removeItem("shopmanager_token");
      // Could dispatch an event here, but Root.tsx handles session validation on startup.
      // For immediate effect on 401 during operation, we might just reload or redirect.
      // A simple approach is just letting it throw, and the UI catches it.
    }
    
    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}
