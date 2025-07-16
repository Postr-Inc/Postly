import { api } from "../..";
import { createSignal } from "solid-js";
import useNavigation from "./useNavigation";
export default function useAuth() {
  const { navigate } = useNavigation()
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    api.authStore.isValid()
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const login = async (email: string, password: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        setIsLoading(true);
        let res = await api.authStore.login(email, password);
        setIsAuthenticated(api.authStore.isValid());
        setIsLoading(false);
        navigate("/")
        resolve(true)
      } catch (error: any) {
        setIsLoading(false);
        setError(error.message);
        reject(error)
      }
    })

  };

  console.log(error())
  const checkAuth = () => {
    setIsAuthenticated(api.authStore.isValid());
  };
  const logout = () => {
    localStorage.removeItem("postr_auth");
    setIsAuthenticated(false);
  };
  return { isAuthenticated, isLoading, error, login, checkAuth, logout };
}
