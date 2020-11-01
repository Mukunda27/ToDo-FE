import { Component, OnInit, OnDestroy } from '@angular/core';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user.model';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  faCalendarCheck = faCalendarCheck;
  authenticatedUser: User;
  private authenticationStatusSubscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.authenticationStatusSubscription = this.userService.observeAuthenticationStatus()
      .subscribe(user => {
        this.authenticatedUser = user;
      });
  }

  ngOnDestroy() {
    this.authenticationStatusSubscription.unsubscribe();
  }
}
