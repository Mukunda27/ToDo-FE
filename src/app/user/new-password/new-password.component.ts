import { Component, OnInit } from '@angular/core';
import { FormGroupDirective, FormControl, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserService } from '../../user.service';
import { NotificationService } from '../../notification.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (isSubmitted));
  }
}

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
  resetToken: string;
  isLoading = false;
  passwordChangeSuccess = false;
  matcher = new MyErrorStateMatcher();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService) {
    this.route.params.subscribe(params => {
      this.resetToken = params.token;
    });
  }

  ngOnInit() { }

  changePassword(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const newPassword = form.value.newPassword;
    const confirmPassword = form.value.confirmPassword;

    if (confirmPassword !== newPassword) {
      const errorMessage = 'Passwords entered is not identical. Try again';
      this.notificationService.showErrorNotification(errorMessage);
      form.reset();
      return;
    }

    this.isLoading = true;
    this.userService.resetPassword(this.resetToken, newPassword, confirmPassword).subscribe(response => {
      this.isLoading = false;
      if (response.resetSuccess) {
        this.passwordChangeSuccess = response.resetSuccess;
        console.log('reset success');
      }
    }, error => {
      this.isLoading = false;
      let errorMessage = 'Something went wrong. Please try again';
      if (error.message) {
        errorMessage = error.message;
      }
      this.notificationService.showErrorNotification(errorMessage);
    });
  }
}
