import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from './user.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';
import { NotificationService } from './notification.service';
import { environment } from '../environments/environment';

const BACKEND_URL = environment.apiUrl + 'user/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isAuthenticated = false;
  private authenticatedUser = new BehaviorSubject<User>(null);
  userCreationFailed = new Subject<void>();
  userLoginFailed = new Subject<void>();
  private tokenTimer: NodeJS.Timer;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private notificationService: NotificationService) { }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  observeAuthenticationStatus() {
    return this.authenticatedUser.asObservable();
  }

  autoLogin() {
    const authenticationInformation = this.fetchAuthenticationToken();
    if (!authenticationInformation.token || !authenticationInformation.expirationDate
      || !authenticationInformation.name || !authenticationInformation.userID || !authenticationInformation.email) {
      return;
    }

    const expiresIn = authenticationInformation.expirationDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.handleUserAuthentication(authenticationInformation.name, authenticationInformation.userID,
        authenticationInformation.email, authenticationInformation.token, expiresIn / 1000);
    }
  }

  createUser(name: string, phone: string, email: string, password: string) {
    const signupData = { name, phone, email, password };
    this.httpClient.post(BACKEND_URL + 'create', signupData)
      .subscribe(response => {
        this.loginUser(email, password);
      }, error => {
        console.log('notify failed');
        this.userCreationFailed.next();
        if (this.isEmailNotUnique(error)) {
          this.notificationService.showErrorNotification('Account with this email already exists');
        } else {
          this.notificationService.showErrorNotification('Something is broken. Try again after some time');
        }
      });
  }

  loginUser(email: string, password: string) {
    const loginDetails = { email, password };

    this.httpClient.post<{ name: string, userID: string, email: string, friends: any[], requests: any[], token: string, expiresIn: number }>
      (BACKEND_URL + 'login', loginDetails)
      .subscribe(response => {
        if (response.token) {
          this.handleUserAuthentication(response.name, response.userID, response.email, response.token, response.expiresIn);
        }
      }, error => {
        this.userLoginFailed.next();
        let errorMessage = 'Something is broken. Try again after some time';
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.notificationService.showErrorNotification(errorMessage);
      });
  }

  passwordResetRequest(email: string) {
    const resetDetails = { email };
    return this.httpClient.post<{ message: string, resetEmail: string }>
      (BACKEND_URL + 'password-reset-request', resetDetails);
  }

  getAllUsers(): Observable<any> {
    return this.httpClient.get<{ users: Array<{ name: string, userID: string }> }>
      (BACKEND_URL + 'all');
  }

  logout(user: User): void {
    localStorage.clear();
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.authenticatedUser.next(null);
    this.socketService.disconnectSocket();
    this.goToSignIn();
  }

  validatePasswordResetToken(resettoken: string) {
    const resetPasswordToken = { resettoken };

    return this.httpClient.post<{ validToken: boolean }>
      (BACKEND_URL + 'valid-password-reset-token', resetPasswordToken);
  }

  resetPassword(resettoken: string, newPassword: string, confirmedPassword: string) {
    const resetDetails = { resettoken, newPassword, confirmedPassword };

    return this.httpClient.post<{ resetSuccess: boolean }>
      (BACKEND_URL + 'reset-password', resetDetails);
  }

  private handleUserAuthentication(name: string, userID: string, email: string, token: string, expiresIn: number) {
    this.isAuthenticated = true;
    const authenticatedUser: User = { name, email, userID, };

    this.socketService.setupSocketConnection(token);
    this.storeAuthenticationToken(name, userID, email, token, expiresIn);

    this.tokenTimer = setTimeout(() => {
      this.logout(authenticatedUser);
    }, expiresIn * 1000);

    this.router.navigate(['/task'], { queryParams: { day: 'today' } });
    this.authenticatedUser.next(authenticatedUser);
  }

  private goToSignIn() {
    this.router.navigate(['/']);
  }

  private isEmailNotUnique(error: HttpErrorResponse): boolean {
    if (error.error.error.errors.email.kind) {
      return error.error.error.errors.email.kind === 'unique';
    }

    return false;
  }

  private storeAuthenticationToken(name: string, userID: string, email: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    console.log('storeAuthenticationToken');

    localStorage.setItem('authenticatedUserName', name);
    localStorage.setItem('authenticatedUserID', userID);
    localStorage.setItem('authenticatedUserEmail', email);
    localStorage.setItem('authenticationToken', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }

  fetchAuthenticationToken(): { name: string, userID: string, email: string, token: string, expirationDate: Date } {
    const name = localStorage.getItem('authenticatedUserName');
    const userID = localStorage.getItem('authenticatedUserID');
    const email = localStorage.getItem('authenticatedUserEmail');
    const token = localStorage.getItem('authenticationToken');
    const expirationDate = localStorage.getItem('expirationDate');

    return { name, userID, email, token, expirationDate: new Date(expirationDate) };
  }
}

