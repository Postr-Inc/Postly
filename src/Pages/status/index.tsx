import { createSignal, onMount, For, Show } from 'solid-js';

// A more polished status indicator component
const StatusIndicator = (props) => {
  const colorClasses = {
    up: 'bg-green-500',
    down: 'bg-red-500',
    checking: 'bg-yellow-500',
  };

  return (
    <div class="relative flex h-3 w-3">
      <Show when={props.status === 'checking'}>
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
      </Show>
      <span
        class={`relative inline-flex rounded-full h-3 w-3 ${
          colorClasses[props.status] || 'bg-gray-400'
        }`}
      ></span>
    </div>
  );
};

// A cleaner logo component
const PLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="w-8 h-8 text-slate-800"
    aria-label="Postly Logo"
  >
    <path
      fill-rule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 3.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM10.5 7.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-4.5zm0 6a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-2.25z"
      clip-rule="evenodd"
    />
  </svg>
);

function Status() {
  const [services, setServices] = createSignal([
    { name: 'Hapta Backend', url: 'https://api.postlyapp.com/health', status: 'checking', reason: null },
  ]);
  const [alerts, setAlerts] = createSignal([]);
  const [lastChecked, setLastChecked] = createSignal(null);

  // *** PING LOGIC WITH DOWNTIME REASONS ***
  const pingService = async (service) => {
    const previousStatus = service.status;
    let newStatusInfo = { status: 'down', reason: 'An unknown error occurred.' };

    try {
      const response = await fetch(service.url, { method: 'HEAD', signal: AbortSignal.timeout(10000) }); // 10s timeout

      if (response.ok) {
        newStatusInfo = { status: 'up', reason: null };
      } else {
        // Server responded with an HTTP error code (4xx, 5xx)
        newStatusInfo = { status: 'down', reason: `Server responded with an error (${response.status}).` };
      }
    } catch (error) {
      // This catches network errors (server unreachable, DNS issues, timeout)
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        newStatusInfo = { status: 'down', reason: 'Server is unreachable, possibly for maintenance.' };
      }
      console.error(`Ping failed for ${service.name}:`, error.name);
    }

    // Create an alert only if the status has changed from a known state.
    if (previousStatus !== newStatusInfo.status && previousStatus !== 'checking') {
      const message = `${service.name} is now ${newStatusInfo.status === 'up' ? 'Operational' : `Down: ${newStatusInfo.reason}`}`;
      setAlerts((prev) => [...prev, { id: Date.now(), message, type: newStatusInfo.status === 'up' ? 'success' : 'error' }]);
    }
    return newStatusInfo;
  };

  const checkAllServices = async () => {
    const updatedServices = await Promise.all(
      services().map(async (service) => {
        const { status, reason } = await pingService(service);
        return { ...service, status, reason };
      })
    );
    setServices(updatedServices);
    setLastChecked(new Date().toLocaleTimeString());
  };

  onMount(() => {
    checkAllServices();
    // *** REFRESH INTERVAL UPDATED TO 1 MINUTE ***
    const interval = setInterval(checkAllServices, 60000); 
    return () => clearInterval(interval);
  });

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const statusInfo = {
    up: { text: 'Operational', class: 'bg-green-100 text-green-800' },
    down: { text: 'Down', class: 'bg-red-100 text-red-800' },
    checking: { text: 'Checking...', class: 'bg-yellow-100 text-yellow-800' },
  };

  return (
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div class="container mx-auto max-w-3xl px-4 py-12">
        <header class="text-center mb-10">
          <div class="flex items-center justify-center gap-3">
            <PLogo />
            <h1 class="text-4xl font-bold">Postly Status</h1>
          </div>
          <p class="text-slate-500 mt-2">Real-time status of our services.</p>
        </header>

        <main class="bg-white shadow-md rounded-lg p-6">
          <div class="flow-root">
             <div class="-my-4 divide-y divide-slate-200">
              <For each={services()}>
                {(service) => (
                  <div class="flex items-center justify-between py-4">
                    <div class="flex items-center gap-4">
                      <StatusIndicator status={service.status} />
                      <span class="text-lg font-medium">{service.name}</span>
                    </div>
                    <div class="text-right">
                       <div
                        class={`inline-block text-sm font-semibold px-2.5 py-1 rounded-full ${
                          statusInfo[service.status]?.class
                        }`}
                      >
                        {statusInfo[service.status]?.text}
                      </div>
                      <Show when={service.status === 'down' && service.reason}>
                        <p class="text-sm text-slate-500 mt-1">{service.reason}</p>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
             </div>
          </div>
        </main>

        <Show when={alerts().length > 0}>
          <div class="mt-8 space-y-3">
            <For each={alerts()}>
              {(alert) => (
                <div
                  class={`p-4 rounded-lg flex items-center justify-between shadow-sm ${
                    alert.type === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                  }`}
                  role="alert"
                >
                  <span>{alert.message}</span>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    class="font-mono text-xl leading-none hover:opacity-75"
                    aria-label="Close alert"
                  >
                    &times;
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>

        <footer class="text-center mt-10 text-sm text-slate-500">
          <p>
            Last updated at: <Show when={lastChecked()} fallback={<span>Checking...</span>}>
              {(time) => <span class="font-medium">{time}</span>}
            </Show>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Status;
