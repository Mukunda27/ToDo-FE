import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './user.service';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'to-do-fe';

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.autoLogin();
  }

  ngOnDestroy() {
    console.log('app destroyed');
  }
}
