import { api } from "../..";
import { createSignal } from "solid-js";
export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    api.authStore.isValid()
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const login = async (email: string, password: string) => {  
    try {
      setIsLoading(true);
      await api.authStore.login(email, password);
      setIsAuthenticated(api.authStore.isValid());
      setIsLoading(false); 
      navigate("/", null);
    } catch (error: any) { 
      setIsLoading(false);
      setError(error.message);
    }
  };
  const checkAuth = () => {
    setIsAuthenticated(api.authStore.isValid());
  };
  const logout = () => {
    localStorage.removeItem("postr_auth");
    setIsAuthenticated(false);
  };
  return { isAuthenticated, isLoading, error, login, checkAuth, logout };
}
