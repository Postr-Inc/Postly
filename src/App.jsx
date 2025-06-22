import { createSignal, onMount, lazy, Suspense } from 'solid-js';
import { api } from '.';
import useNavigation from './Utils/Hooks/useNavigation';
import useTheme from './Utils/Hooks/useTheme';
import { joinClass } from './Utils/Joinclass';

// Lazily import components for route-based loading
const Home = lazy(() => import('./Pages'));
const Login = lazy(() => import('./Pages/auth/login'));
const Registration = lazy(() => import('./Pages/auth/Registration')); 
function App() {
  const { route, navigate } = useNavigation();
  const [checkedAuth, setCheckedAuth] = createSignal(false);
  const { theme } = useTheme();

  onMount(async () => {
    await api.checkAuth();

    // If still not valid, try basic token
    if (!api.authStore.isValid()) {
      try {
        await api.authStore.getBasicAuthToken();
        setTimeout(() => setCheckedAuth(true), 3500);
      } catch (err) {
        console.warn("Unable to issue basic auth token:", err);
      }
    } else {
      setCheckedAuth(true);
    }

    window.addEventListener('beforeunload', () => {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    });

    api.on('change', () => {
      if (!api.authStore.isValid()) navigate('/auth/login');
    });
  });

  const renderContent = () => {
    switch (route()) {
      case '/':
        return <Home navigate={navigate} />; 
      case '/auth/login':
        return <Login navigate={navigate} />;
      case '/auth/register':
        return <Registration navigate={navigate} />;
      default:
        return (
          <div class="flex flex-col items-center justify-center h-screen w-full">
            <h1 class="text-2xl font-bold mb-4">404 - Not Found</h1>
            <button onClick={() => navigate('/')} class="text-blue-600 underline">
              Go Home
            </button>
          </div>
        );
    }
  };

  return (
    <>
      {checkedAuth() ? (
        <Suspense>
          {renderContent()}
        </Suspense>
      ) : (
        <div class="flex h-screen w-full items-center justify-center text-xl font-bold text-gray-600">
          <img
            src="/icons/icon_transparent.png"
            class={joinClass(
              'rounded-full w-32 h-32',
              theme() === "light" ? "black" : "light"
            )}
          />
        </div>
      )}
    </>
  );
}

export default App;
