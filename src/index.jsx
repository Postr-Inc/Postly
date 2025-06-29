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
import AccountManagement from './Pages/settings/account-management';

import Notifications from './Pages/settings/notification';

import Privacy from './Pages/settings/privacy';
import PrivacyPolicy from './Pages/settings/privacy/privacy-policy';
import RequestData from './Pages/settings/privacy/request-data';

import Premium from './Pages/settings/premium';
import Subscription from './Pages/settings/premium/subscription';
import Credits from './Pages/settings/premium/credits';
import Billing from './Pages/settings/premium/billing';
import PremiumFeatures from './Pages/settings/premium/features';

import AccountSecurity from './Pages/settings/account-security';

import deviceManagement from './Pages/settings/device-management';
import applicationUpdates from './Pages/settings/application-updates'; 
import Snippets from './Pages/snippets';
import Account from './Pages/settings/account-management/account';
import Password from './Pages/settings/account-management/password'; 
import bookmarks from './Pages/bookmarks';
import myFeed from './Pages/settings/my-feed';
const root = document.getElementById('root');
export const api = new SDK({serverURL:'https://api.postlyapp.com'});  
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
    <Route path={"/settings/application-updates"} component={applicationUpdates} />
    <Route path={"/settings/my-feed"} component={myFeed} /> 
    <Route path={"/settings/notifications"} component={Notifications} />
    <Route path={"/settings/privacy"} component={Privacy} />
    <Route path={"/settings/privacy/privacy-policy"} component={PrivacyPolicy} />
    <Route path={"/settings/privacy/request-data"} component={RequestData} />
    <Route path={"/settings/premium"} component={Premium} />
    <Route path={"/settings/premium/subscription"} component={Subscription} />
    <Route path={"/settings/premium/credits"} component={Credits} />
    <Route path={"/settings/premium/billing"} component={Billing} />
    <Route path={"/settings/premium/features"} component={PremiumFeatures} />
    <Route path={"/settings/security"} component={AccountSecurity} />
    <Route path={"/snippets"} component={Snippets}/> 
    <Route path="/bookmarks" component={bookmarks} />
  </Router>
), root);
