import { api } from "../api";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const registerUser = async (userData: any) => {
  const response = await api.post("/register", userData);
  return response.data;
};

export const loginUser = async (username: string, password: string): Promise<string> => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await api.post<LoginResponse>("/login", formData);
    const token = response.data.access_token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username); // Store username for easy profile fetching
    }
    return token;
  } catch (error) {
    console.error("❌ Login Failed:", error);
    throw error;
  }
};

export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  }
};

export const getCurrentUsername = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("username");
  }
  return null;
};