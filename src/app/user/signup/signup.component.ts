import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserService } from '../..//user.service';

interface Country {
  value: string;
  viewValue: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (isSubmitted));
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  matcher = new MyErrorStateMatcher();
  signupForm: FormGroup;
  isLoading = false;
  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.userCreationFailed.subscribe(() => {
      console.log('creation failed');
      this.isLoading = false;
    });

    this.signupForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required])
    });
  }

  signUp() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.userService.createUser(this.signupForm.value.name, this.signupForm.value.phone,
      this.signupForm.value.email, this.signupForm.value.password);
  }
}
