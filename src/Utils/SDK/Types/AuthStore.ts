export type authStore = {
  getBasicAuthToken: () => Promise<boolean>;
  model: {
    token: string;
    id: string;
    email: string;
    username: string;
    avatar: string;
    banner: string;
    bio: string;
    location: string;
    validVerified: boolean;
    postr_plus: boolean;
    followers: string[];
    following: string[];
    ActiveDevices: string[];
    smartDataCollection: boolean;
    deactivated: boolean;
    isDeveloper: boolean;
    social: string[];
    account_links: string[];
  };
  login: (
    emailOrUsername: string,
    password: string,
  ) => Promise<authStore["model"]>;
  deleteAccount: () => boolean;
  logout: (userNavigated?: boolean) => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string, token: string) => Promise<void>;
  isValid: () => boolean;
};
