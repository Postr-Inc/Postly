import { api } from "@/src";
import {
  createSignal,
  onMount,
  onCleanup,
  Switch,
  Match,
  createEffect,
} from "solid-js";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import Page from "@/components/ui/Page";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
type Analytics = {
  postEngagements: {
    post_id: string;
    total_likes: number;
    total_comments: number;
    total_reposts: number;
  }[];
  dailyActiveUsers: { date: string; active_user_count: number }[]; // updated to match backend JSON
  recentResourceMetrics: {
    timestamp: string;
    cpu_percent: number;
    memory_used_mb: number;
    memory_total_mb: number;
    event_type: string;
    details: string;
  }[];
  recentRequestMetrics: {
    timestamp: string;
    path: string;
    method: string;
    duration_ms: number;
    status_code: number;
  }[];
};

export default function AnalyticsPanel() {
  const [data, setData] = createSignal<Analytics>();
  let dauChartRef: HTMLCanvasElement | undefined;
  let cpuChartRef: HTMLCanvasElement | undefined;
  let memoryChartRef: HTMLCanvasElement | undefined;

  let dauChartInstance: Chart | null = null;
  let cpuChartInstance: Chart | null = null;
  let memoryChartInstance: Chart | null = null;

  const { navigate, goBack, goForward, route } = useNavigation();
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    if (
      (await api.checkAuth()) &&
      (await JSON.parse(await api.send("/isDeveloper", { method: "GET" })))
    ) {
      setLoading(false);
    } else {
      window.location.href = "/";
      setLoading(false);
      return;
    }

    const res = await api.send("/analytics", {
      method: "GET",
    }); // Adjust to your real endpoint
    console.log(res);
    setData(res);

    // Wait for data to mount, then draw chart
    createEffect(() => {
      const analytics = data();
      if (!analytics) return;

      createEffect(() => {
        const analytics = data();
        if (!analytics) return;

        // Helper function to smooth data points
        const smoothData = (data, windowSize = 3) => {
          return data.map((val, i, arr) => {
            const start = Math.max(0, i - windowSize);
            const end = Math.min(arr.length - 1, i + windowSize);
            const subset = arr.slice(start, end + 1);
            return subset.reduce((a, b) => a + b, 0) / subset.length;
          });
        };

        // --- DAILY ACTIVE USERS CHART ---
        if (dauChartInstance) dauChartInstance.destroy();
        if (dauChartRef) {
          const ctx = dauChartRef.getContext("2d");
          if (ctx) {
            dauChartInstance = new Chart(ctx, {
              type: "line",
              data: {
                labels: analytics.dailyActiveUsers.map((d) => new Date(d.date)),
                datasets: [
                  {
                    label: "Daily Active Users",
                    data: analytics.dailyActiveUsers.map(
                      (d) => d.active_user_count,
                    ),
                    fill: true,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.1, // Reduced from 0.3
                    borderWidth: 2,
                    pointRadius: 0, // Hide points for cleaner look
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      boxWidth: 12,
                      padding: 20,
                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "nearest",
                },
                scales: {
                  x: {
                    type: "time",
                    time: {
                      unit: "day",
                      tooltipFormat: "MMM d, yyyy",
                    },
                    title: {
                      display: true,
                      text: "Date",
                      font: {
                        weight: "bold",
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Users",
                      font: {
                        weight: "bold",
                      },
                    },
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              },
            });
          }
        }

        // --- CPU USAGE CHART ---
        // --- CPU USAGE CHART ---
        if (cpuChartInstance) cpuChartInstance.destroy();
        if (cpuChartRef) {
          const ctx = cpuChartRef.getContext("2d");
          if (ctx) {
            // Sort metrics by time
            const sortedMetrics = analytics.resourceMetrics
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime(),
              );

            // Group data points by minute to reduce density
            const minuteGroups = {};
            sortedMetrics.forEach((metric) => {
              const date = new Date(metric.timestamp);
              // Round to nearest minute
              const minuteKey = new Date(date);
              minuteKey.setSeconds(0, 0);

              if (!minuteGroups[minuteKey]) {
                minuteGroups[minuteKey] = {
                  sum: 0,
                  count: 0,
                  max: 0,
                  min: 100,
                  timestamp: minuteKey,
                };
              }

              minuteGroups[minuteKey].sum += metric.cpu_percent;
              minuteGroups[minuteKey].count++;
              minuteGroups[minuteKey].max = Math.max(
                minuteGroups[minuteKey].max,
                metric.cpu_percent,
              );
              minuteGroups[minuteKey].min = Math.min(
                minuteGroups[minuteKey].min,
                metric.cpu_percent,
              );
            });

            // Create averaged data points
            const minuteData = Object.values(minuteGroups).map((group) => ({
              timestamp: group.timestamp,
              average: group.sum / group.count,
              max: group.max,
              min: group.min,
            }));

            cpuChartInstance = new Chart(ctx, {
              type: "line",
              data: {
                labels: minuteData.map((m) => m.timestamp),
                datasets: [
                  {
                    label: "Avg CPU Usage (%)",
                    data: minuteData.map((m) => m.average),
                    fill: false,
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    tension: 0, // Straight lines
                    borderWidth: 2,
                    pointRadius: 0,
                  },
                  {
                    label: "Max CPU Usage",
                    data: minuteData.map((m) => m.max),
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    fill: 1, // Fill to min
                  },
                  {
                    label: "Min CPU Usage",
                    data: minuteData.map((m) => m.min),
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [5, 5],
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      boxWidth: 12,
                      padding: 10,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        label += Math.round(context.raw * 10) / 10 + "%";
                        return label;
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "index",
                },
                scales: {
                  x: {
                    type: "time",
                    time: {
                      unit: "minute",
                      displayFormats: {
                        minute: "h:mm a",
                      },
                      tooltipFormat: "MMMM D, h:mm:ss a",
                    },
                    title: {
                      display: true,
                      text: "Time",
                      font: {
                        size: 14,
                        weight: "bold",
                      },
                      padding: { top: 10 },
                    },
                    grid: {
                      display: false,
                      drawBorder: true,
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                      autoSkip: true,
                      maxTicksLimit: 10,
                    },
                  },
                  y: {
                    beginAtZero: false,
                    min: 0,
                    max: 100,
                    title: {
                      display: true,
                      text: "CPU Usage (%)",
                      font: {
                        size: 14,
                        weight: "bold",
                      },
                      padding: { bottom: 10 },
                    },
                    ticks: {
                      stepSize: 10,
                      callback: function (value) {
                        return value + "%";
                      },
                    },
                    grid: {
                      color: function (context) {
                        return context.tick.value % 20 === 0
                          ? "rgba(0, 0, 0, 0.1)"
                          : "rgba(0, 0, 0, 0.05)";
                      },
                    },
                  },
                },
                elements: {
                  line: {
                    cubicInterpolationMode: "monotone",
                  },
                },
              },
            });
          }
        }

        // --- MEMORY USAGE CHART ---
        if (memoryChartInstance) memoryChartInstance.destroy();
        if (memoryChartRef) {
          const ctx = memoryChartRef.getContext("2d");
          if (ctx) {
            const sortedMetrics = analytics.resourceMetrics
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime(),
              );

            // Smooth memory data
            const memoryUsedData = smoothData(
              sortedMetrics.map((m) => m.memory_used_mb),
            );
            const memoryTotalData = sortedMetrics.map((m) => m.memory_total_mb);

            memoryChartInstance = new Chart(ctx, {
              type: "line",
              data: {
                labels: sortedMetrics.map((m) => new Date(m.timestamp)),
                datasets: [
                  {
                    label: "Memory Used (MB)",
                    data: memoryUsedData,
                    fill: true,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 0,
                  },
                  {
                    label: "Memory Total (MB)",
                    data: memoryTotalData,
                    fill: false,
                    borderColor: "#059669",
                    backgroundColor: "rgba(5, 150, 105, 0.1)",
                    borderDash: [5, 5],
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 0,
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      boxWidth: 12,
                      padding: 20,
                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "nearest",
                },
                scales: {
                  x: {
                    type: "time",
                    time: {
                      unit: "minute",
                      tooltipFormat: "h:mm a",
                    },
                    title: {
                      display: true,
                      text: "Time",
                      font: {
                        weight: "bold",
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Memory (MB)",
                      font: {
                        weight: "bold",
                      },
                    },
                    ticks: {
                      // Auto step size based on max value
                      callback: function (value) {
                        return Number.isInteger(value) ? value : "";
                      },
                    },
                  },
                },
              },
            });
          }
        }
      });
    });
  });

  onCleanup(() => {
    dauChartInstance?.destroy();
    cpuChartInstance?.destroy();
    memoryChartInstance?.destroy();
  });

  return (
    <Page {...{ navigate, goForward, goBack, route }}>
      <Switch>
        <Match when={loading()}>
          <span class="loading loading-spinner mt-[40vh] loading-lg flex justify-center mx-auto"></span>
        </Match>
        <Match when={!loading()}>
          <div class="p-6 space-y-8">
            <h1 class="text-3xl font-bold">📊 Deveoper Analytics Dashboard</h1>

            {/* Summary */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="stat bg-base-200 shadow-md">
                <div class="stat-title">Total Likes</div>
                <div class="stat-value text-primary">
                  {data()?.postEngagements.reduce(
                    (acc, p) => acc + p.total_likes,
                    0,
                  )}
                </div>
              </div>

              <div class="stat bg-base-200 shadow-md">
                <div class="stat-title">Total Comments</div>
                <div class="stat-value text-secondary">
                  {data()?.postEngagements.reduce(
                    (acc, p) => acc + p.total_comments,
                    0,
                  )}
                </div>
              </div>

              <div class="stat bg-base-200 shadow-md">
                <div class="stat-title">Total Reposts</div>
                <div class="stat-value text-accent">
                  {data()?.postEngagements.reduce(
                    (acc, p) => acc + p.total_reposts,
                    0,
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Post ID</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Reposts</th>
                  </tr>
                </thead>
                <tbody>
                  {data()?.postEngagements.map((post) => (
                    <tr>
                      <td class="font-mono text-sm">{post.post_id}</td>
                      <td>{post.total_likes}</td>
                      <td>{post.total_comments}</td>
                      <td>{post.total_reposts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chart Section */}
            <section class="bg-base-200 p-4 rounded-lg shadow-md">
              <h2 class="text-xl font-semibold mb-4">Daily Active Users</h2>
              <div class="w-full h-[300px]">
                <canvas
                  ref={(el) => (dauChartRef = el)}
                  class="w-full h-full"
                />
              </div>
            </section>

            {/* CPU Usage Chart */}
            <section class="bg-base-200 p-4 rounded-lg shadow-md">
              <h2 class="text-xl font-semibold mb-4">CPU Usage Over Time</h2>
              <div class="w-full h-[300px]">
                <canvas
                  ref={(el) => (cpuChartRef = el)}
                  class="w-full h-full"
                />
              </div>
            </section>

            {/* Memory Usage Chart */}
            <section class="bg-base-200 p-4 rounded-lg shadow-md">
              <h2 class="text-xl font-semibold mb-4">Memory Usage Over Time</h2>
              <div class="w-full h-[300px]">
                <canvas
                  ref={(el) => (memoryChartRef = el)}
                  class="w-full h-full"
                />
              </div>
            </section>
          </div>
        </Match>
      </Switch>
    </Page>
  );
}
