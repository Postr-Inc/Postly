import { createSignal, onMount } from 'solid-js';
import { api } from '.';
import useNavigation from './Utils/Hooks/useNavigation';
import Login from './Pages/auth/login';
import Home from './Pages';
import Registration from './Pages/auth/Registration'; 
import useTheme from './Utils/Hooks/useTheme';
import { joinClass } from './Utils/Joinclass';

function App() {
  const { route, navigate } = useNavigation();
  const [checkedAuth, setCheckedAuth] = createSignal(false);
  const { theme } = useTheme()
  onMount(async () => {
    await api.checkAuth();

    // If still not valid, try basic token
    if (!api.authStore.isValid()) {
      try {
        await api.authStore.getBasicAuthToken();
      } catch (err) {
        console.warn("Unable to issue basic auth token:", err);
      }
    }

    setTimeout(()=>{   setCheckedAuth(true); }, 2000);

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
          <div>
            <h1>404 Not Found</h1>
            <button onClick={() => navigate('/')}>Go Home</button>
          </div>
        );
    }
  };

  return (
    <>
      {checkedAuth() ? renderContent() : (
        <div class="flex h-screen w-full items-center justify-center text-xl font-bold text-gray-600">
          <img src='/icons/icon_transparent.png' class={joinClass('rounded-full w-32 h-32 ', theme() == "light" ? "black" : "light")}/>
        </div>
      )}
    </>
  );
}

export default App;
