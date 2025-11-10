/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import SDK from "./Utils/SDK";
import { Router, Route, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onMount } from "solid-js";

// Pages
import Login from "./Pages/auth/login";
import View from "./Pages/view";
import User from "./Pages/u";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import Settings from "./Pages/settings";
import profileSettings from "./Pages/settings/profile-settings";
import AccountManagement from "./Pages/settings/account-management/index";
import deviceManagement from "./Pages/settings/device-management";
import applicationUpdates from "./Pages/settings/application-updates";
import Account from "./Pages/settings/account-management/account";
import Password from "./Pages/settings/account-management/password";
import myFeed from "./Pages/settings/my-feed";
import Snippets from "./Pages/snippets";
import bookmarks from "./Pages/bookmarks";
import notifications from "./Pages/settings/notifications";
import remove from "./Pages/settings/account-management/account/remove";
import SafetyCenter from "./Pages/safety";
import Status from "./Pages/status";
import ExplorePage from "./Pages/explore";
import Search from "./Pages/search";
import Main from "./Pages/index";
import AnalyticsPanel from "./Pages/analytics";

import logo from "@/src/assets/icon.jpg";
const root = document.getElementById("root");
export const api = new SDK({ serverURL: "http://localhost:8080" });

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}
function App() {
  const [ready, setReady] = createSignal(false);

  onMount(async () => {
    try {
      const yes = await api.checkAuth();

      console.log(yes);
      if (!yes) {
        const token = await api.authStore.getBasicAuthToken();

        // If no token returned -> go to login
        if (!token) {
          return;
        }
      }

      setReady(true);
    } catch (err) {
      console.error("Auth bootstrap failed:", err);
    }
  });

  return (
    <>
      {ready() || window.location.pathname == "/auth/login" ? (
        <Router>
          <Route path="/" component={Main} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/reset-password" component={ForgotPassword} />
          <Route path="/view/:collection/:id" component={View} />
          <Route path="/u/:id" component={User} />
          <Route path="/settings" component={Settings} />
          <Route
            path="/settings/profile-settings"
            component={profileSettings}
          />
          <Route
            path="/settings/account-management"
            component={AccountManagement}
          />
          <Route
            path="/settings/account-management/account"
            component={Account}
          />
          <Route
            path="/settings/account-management/password"
            component={Password}
          />
          <Route
            path="/settings/device-management"
            component={deviceManagement}
          />
          <Route path="/settings/notifications" component={notifications} />
          <Route
            path="/settings/application-updates"
            component={applicationUpdates}
          />
          <Route path="/settings/account/remove" component={remove} />
          <Route path="/settings/my-feed" component={myFeed} />
          <Route path="/snippets" component={Snippets} />
          <Route path="/bookmarks" component={bookmarks} />
          <Route path="/safety" component={SafetyCenter} />
          <Route path="/status" component={Status} />
          <Route path="/explore" component={ExplorePage} />
          <Route path="/search" component={Search} />
          <Route path="/analytics" component={AnalyticsPanel} />
        </Router>
      ) : (
        <div class="flex items-center justify-center h-screen bg-base-200">
          <img src={logo} class="w-24 h-24 rounded"></img>
        </div>
      )}
    </>
  );
}

render(() => <App />, root);
