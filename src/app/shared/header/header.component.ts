import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faBell, faUsers } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../user.service';
import { User } from '../../user.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  faUser = faUser;
  faBell = faBell;
  faUsers = faUsers;
  authenticatedUser: User;
  private authenticationStatusSubscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.authenticationStatusSubscription = this.userService.observeAuthenticationStatus()
      .subscribe(user => {
        this.authenticatedUser = user;
      });
  }

  logOut() {
    this.userService.logout(this.authenticatedUser);
  }

  ngOnDestroy() {
    this.authenticationStatusSubscription.unsubscribe();
  }

}
