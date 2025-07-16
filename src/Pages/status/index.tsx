import { createSignal, onMount, For, Show } from 'solid-js';

function Status() {
  const [services, setServices] = createSignal([
    { name: 'Hapta Backend', url: 'https://api.postlyapp.com', status: 'checking', lastChecked: null }, 
  ]);
  const [alerts, setAlerts] = createSignal([]);

  const pingService = async (service) => {
    try {
      // Using 'HEAD' method and 'no-cors' mode to attempt a ping.
      // Note: With 'no-cors', the response is opaque, and you cannot read status codes or headers.
      // A successful fetch (without throwing an error) implies the service is reachable.
      await fetch(service.url, { method: 'HEAD', mode: 'no-cors' });
      const newStatus = 'up';
      if (service.status !== newStatus && service.status !== 'checking') {
        setAlerts((prev) => [...prev, { id: Date.now(), message: `${service.name} is now ${newStatus}.`, type: 'success' }]);
      }
      return newStatus;
    } catch (error) {
      const newStatus = 'down';
      if (service.status !== newStatus && service.status !== 'checking') {
        setAlerts((prev) => [...prev, { id: Date.now(), message: `${service.name} is now ${newStatus}.`, type: 'error' }]);
      }
      return newStatus;
    }
  };

  const checkAllServices = async () => {
    const updatedServices = await Promise.all(
      services().map(async (service) => {
        const status = await pingService(service);
        return { ...service, status, lastChecked: new Date().toLocaleTimeString() };
      })
    );
    setServices(updatedServices);
  };

  onMount(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  });

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // P logo SVG
  const PLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-8 h-8 text-gray-800"
      aria-label="Postly Logo"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3h2v4h-2V7zm0 6h2v2h-2v-2z" />
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM10.5 7.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-4.5zM10.5 13.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-2.25z" clipRule="evenodd" />
    </svg>
  );

  // Animating green dot SVG
  const StatusDot = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-label="Status indicator">
      <circle cx="8" cy="8" r="6" class={props.status === 'up' ? 'fill-green-500 animate-pulse' : 'fill-red-500'} />
    </svg>
  );

  return (
    <div class="min-h-screen bg-gray-100 flex flex-col items-center py-10 font-sans">
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <header class="flex items-center justify-center mb-8">
          <PLogo />
          <h1 class="text-3xl font-bold text-gray-800 ml-3">Postly Status</h1>
        </header>

        <div class="space-y-4">
          <For each={services()}>
            {(service) => (
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div class="flex items-center">
                  <StatusDot status={service.status} />
                  <span class="ml-3 text-lg font-medium text-gray-700">{service.name}</span>
                </div>
                <div class="text-sm text-gray-500">
                  {service.status === 'checking' ? (
                    <span class="text-yellow-600">Checking...</span>
                  ) : service.status === 'up' ? (
                    <span class="text-green-600">Operational</span>
                  ) : (
                    <span class="text-red-600">Down</span>
                  )}
                  {service.lastChecked && <span class="ml-2">({service.lastChecked})</span>}
                </div>
              </div>
            )}
          </For>
        </div>

        <div class="mt-8 space-y-2">
          <For each={alerts()}>
            {(alert) => (
              <div
                class={`p-3 rounded-md flex items-center justify-between ${
                  alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
                role="alert"
              >
                <span>{alert.message}</span>
                <button onClick={() => removeAlert(alert.id)} class="ml-4 text-sm font-semibold" aria-label="Close alert">
                  &times;
                </button>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default Status;
