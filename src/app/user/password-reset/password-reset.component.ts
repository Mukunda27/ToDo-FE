import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
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
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  resetMail: string;
  isLoading = false;
  matcher = new MyErrorStateMatcher();

  constructor(private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
  }

  onReset(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.userService.passwordResetRequest(form.value.email).subscribe(response => {
      if (response.resetEmail) {
        this.isLoading = false;
        this.resetMail = response.resetEmail;
      }
    }, () => {
      this.isLoading = false;
      const errorMessage = 'Something went wrong. Please try again';
      this.notificationService.showErrorNotification(errorMessage);
    });
  }
}
