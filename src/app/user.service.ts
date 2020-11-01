import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from './user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from './custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isAuthenticated = false;
  private authenticatedUser = new BehaviorSubject<User>(null);
  private tokenTimer: NodeJS.Timer;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar) { }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  observeAuthenticationStatus() {
    return this.authenticatedUser.asObservable();
  }

  autoLogin() {
    const authenticationInformation = this.fetchAuthenticationToken();
    if (!authenticationInformation.token || !authenticationInformation.expirationDate
      || !authenticationInformation.name || !authenticationInformation.userID) {
      return;
    }

    const expiresIn =
      authenticationInformation.expirationDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.handleUserAuthentication(authenticationInformation.name, authenticationInformation.userID, authenticationInformation.token,
        expiresIn / 1000);
    }
  }

  createUser(name: string, phone: string, email: string, password: string) {
    const signupData = { name, phone, email, password };
    this.httpClient.post('http://localhost:3000/api/user/create', signupData)
      .subscribe(response => {
        this.loginUser(email, password);
      }, error => {
        if (this.isEmailNotUnique(error)) {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: 'Account with this Email already exists', duration: 5000
          });
        } else {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: 'Something went wrong. Please try again', duration: 5000
          });
        }
      });
  }

  loginUser(email: string, password: string) {
    const loginDetails = { email, password };

    this.httpClient.post<{ name: string, userID: string, token: string, expiresIn: number }>
      ('http://localhost:3000/api/user/login', loginDetails)
      .subscribe(response => {
        if (response.token) {
          console.log(response.token);
          this.handleUserAuthentication(response.name, response.userID, response.token, response.expiresIn);
        }
      }, error => {
        let errorMessage = 'Something went wrong. Please try again';
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          data: errorMessage, duration: 5000
        });
      });
  }

  getAllUsers(): Observable<any> {
    return this.httpClient.get<{ users: Array<{ name: string, userID: string }> }>
      ('http://localhost:3000/api/user/all');
  }

  logout(user: User): void {
    localStorage.clear();
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.authenticatedUser.next(null);
    this.goToSignIn();
  }

  private handleUserAuthentication(name: string, userID: string, token: string, expiresIn: number) {
    this.isAuthenticated = true;
    const authenticatedUser: User = { name, userID };

    this.storeAuthenticationToken(name, userID, token, expiresIn);

    this.tokenTimer = setTimeout(() => {
      this.logout(authenticatedUser);
    }, expiresIn * 1000);

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

  private storeAuthenticationToken(name: string, userID: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    console.log('storeAuthenticationToken');

    localStorage.setItem('authenticatedUserName', name);
    localStorage.setItem('authenticatedUserID', userID);
    localStorage.setItem('authenticationToken', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }

  fetchAuthenticationToken(): { name: string, userID: string, token: string, expirationDate: Date } {
    const name = localStorage.getItem('authenticatedUserName');
    const userID = localStorage.getItem('authenticatedUserID');

    const token = localStorage.getItem('authenticationToken');
    const expirationDate = localStorage.getItem('expirationDate');

    return { name, userID, token, expirationDate: new Date(expirationDate) };
  }
}

