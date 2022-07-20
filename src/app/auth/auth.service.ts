import { Injectable } from '@angular/core';

import { UserManager, UserManagerSettings, User } from 'oidc-client';

@Injectable()
export class AuthService {
  private manager: UserManager = new UserManager(getClientSettings());
  private user: User = null;

  constructor() {
    this.manager.getUser().then(user => {
      this.user = user;
    });
  }

  isLoggedIn(): boolean {
    return this.user != null && !this.user.expired;
  }

  getClaims(): any {
    return this.user.profile;
  }

  getAuthorizationHeaderValue(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then(user => {
      this.user = user;
      console.log("signed in", user);

      // Tokens are stored in User Manager.
      // You can access them elsewhere in code using mgr.getUser() to fetch the user object

      document.getElementById("loginResult").innerHTML = '<h3>Success</h3><pre><code>' + JSON.stringify(user, null, 2) + '</code></pre>'
    });
  }
}

export function getClientSettings(): UserManagerSettings {
  return {
    // authority: 'https://trigentdev.onelogin.com/oidc/2',
    // client_id: '37aa20b0-e41d-013a-0a5b-028e191b97d9212369',
    // redirect_uri: 'http://localhost:3000/auth-callback',
    // post_logout_redirect_uri: 'http://localhost:3000/login',
    // response_type: 'id_token token',
    // scope: 'openid profile',
    // filterProtocolClaims: true,
    // loadUserInfo: true,
    // automaticSilentRenew: true,
    // silent_redirect_uri: 'http://localhost:3000/silent-refresh.html'

    authority: 'https://trigentdev.onelogin.com/oidc/2',    
    client_id: '37aa20b0-e41d-013a-0a5b-028e191b97d9212369',
    redirect_uri: 'http://localhost:3000/dashboard',
    response_type: 'code',
    scope: 'openid profile',
    filterProtocolClaims: true,
    loadUserInfo: true
  };
}
