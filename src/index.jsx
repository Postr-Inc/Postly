/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import SDK from './Utils/SDK';
import { Router, Route } from '@solidjs/router';
import Login from './Pages/auth/login';
import View from './Pages/view';
import User from './Pages/u';
import ForgotPassword from './Pages/auth/ForgotPassword';
import Registration from './Pages/auth/Registration';
import Settings from './Pages/settings';
import profileSettings from './Pages/settings/profile-settings';
import AccountManagement from './Pages/settings/account-management/index';
import deviceManagement from './Pages/settings/device-management';
import applicationUpdates from './Pages/settings/application-updates';
import Account from './Pages/settings/account-management/account';
import Password from './Pages/settings/account-management/password';
import myFeed from './Pages/settings/my-feed';
import Snippets from './Pages/snippets';
import bookmarks from './Pages/bookmarks';
import notifications from "./Pages/settings/notifications"
import remove from './Pages/settings/account-management/account/remove';
import SafetyCenter from './Pages/safety';
import Privacy from './Pages/settings/privacy';
import Status from './Pages/status'; 
import ExplorePage from './Pages/explore';
const root = document.getElementById('root'); 
export const api = new SDK({serverURL:"https://api.postlyapp.com"}); 
 
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
} 
render(() =>  (
  <Router>
    <Route path="/auth/login" component={Login} />
    <Route path="/auth/ForgotPassword" component={ForgotPassword} />
    <Route path="/auth/reset-password/:token" component={ForgotPassword} />
    <Route path="/auth/register" component={Registration} />
    <Route path="/" component={App} />
    <Route path="/view/:collection/:id" component={View} />
    <Route path="/u/:id" component={User} />
    <Route path="/settings" component={Settings} />
    <Route path="/settings/profile-settings" component={profileSettings} />
    <Route path={"/settings/account-management"} component={AccountManagement} />
    <Route path={"/settings/account-management/account"} component={Account} />
    <Route path={"/settings/account-management/password"}component={Password}/>
    <Route path={"/settings/device-management"} component={deviceManagement} />
    <Route path={"/settings/notifications"} component={notifications} />
    <Route path={"/settings/application-updates"} component={applicationUpdates} />
    <Route path={"/settings/account/remove"} component={remove} />
    <Route path={"/settings/my-feed"} component={myFeed} />
    <Route path={"/settings/privacy"} component={Privacy} />
    <Route path={"/snippets"} component={Snippets}/>
    <Route path="/bookmarks" component={bookmarks} /> 
    <Route path={"/safety"}  component={SafetyCenter} />
    <Route path={"/status"} component={Status} /> 
    <Route path={"/explore"} component={ExplorePage} />
  </Router>
), root);
