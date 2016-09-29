/*
 *  Class to handle token and login/logout actions
 *
 *  Notes:
 *    - We don't need to retrieve tokens as this is
 *      handled by https://narrative.kbase.us/#login
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { KBaseIntegration } from './kbase-integration.service';

@Injectable()
export class KBaseAuth {
    user: string;
    username: string;
    token: string;

    constructor(private router: Router,
                private integration: KBaseIntegration) {
        
        //let token = TOKEN;
        //let user = USERNAME;

        // console.log('TOKENISH?', token, USERNAME);

        //let shouldUseCookie = config.productionMode;
        //console.log('Production mode:', shouldUseCookie)

        //if (shouldUseCookie) {
        //    token = this.getToken()
        //} else {
        //    token = this.getToken();
        //}

        //if (!token) {
            //window.location.href = config.loginUrl +
            //'?nextrequest={"path":"https://narrative-ci.kbase.us/#login","external":true}'

       //     console.log('no token', 'attempting to redirect')

        //    return
            //throw ('User token was not found in cookie "kbase_session"');
        // }
        this.token = integration.getToken();
        this.user = integration.getUsername();
        this.username = integration.getUsername();

        //this.user = token.split('|')[0].replace('un=', '');
        //this.token = token;
        //console.log('token', String(this.token))

        // redirect '/browse/' to 'browse/<user>' on app start
        //let path = window.location.pathname;
        //if (path === '/' || path.split('/')[1] === 'browse')
        //    this.router.navigate( ['Selector/FileTable', { path: '/'+this.user }]);
    }

    // method to get and parse the token from "kbase_session" cookie
    // into the correct, usable format.
    // see https://atlassian.kbase.us/browse/NAR-855?jql=text%20~%20%22cookie%22
    // getToken() {
    //     let token;
    //     let cookies = document.cookie.split('; ');

    //     cookies.some(cookie => {
    //         let key = cookie.split('=')[0];
    //         if (key === 'kbase_session') {
    //             token = this.decodeToken(cookie);
    //             return true;
    //         }
    //     })

    //     return token;
    // }

    // decodeToken(sessionString: string) {
    //     let s = sessionString,
    //     encodedToken = s.slice(s.indexOf('token'), s.length);

    //     let token = decodeURIComponent(encodedToken).split('=')[1]
    //         .replace(/EQUALSSIGN/g, '=').replace(/PIPESIGN/g, '|');

    //     return token;
    // }

    getToken() {
        return this.token;
    }

    getUsername() {
        return this.username;
    }

    logout() {}

    isLoggedIn() {
        if (this.token) return true;
        else return false
    }


}