import auth0 from 'auth0-js';

export default class Auth {
    auth0 = new auth0.WebAuth({
        domain: 'foxtagram.eu.auth0.com',
        clientID: 'dRJlIdyaV5WBLjjFm7kjFF7Ai_BcqwCC',
        redirectUri: 'https://localhost:3000/callback',
        audience: 'https://foxtagram.eu.auth0.com/userinfo',
        responseType: 'token id_token',
        scope: 'openid'
    });

    constructor() {
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
    }

    handleAuthentication( history ) {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult, history);
                history.replace('/Dashboard');
            } else if (err) {
                history.replace('/Dashboard');
            }
        });
    }

    setSession(authResult, history) {
        let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        history.replace('/Dashboard');
    }

    logout( history ) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        history.replace('/Dashboard');
    }

    isAuthenticated() {
        let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

    login() {
        this.auth0.authorize();
    }

    getApiToken(){
        return  localStorage.getItem('id_token');
    }
}
