import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { UserService } from '../../user.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  matcher = new MyErrorStateMatcher();

  constructor(private userService: UserService) { }

  ngOnInit(): void {
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.userService.loginUser(form.value.email, form.value.password);
  }

}
