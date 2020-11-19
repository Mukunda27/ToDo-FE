import { Component, OnInit } from '@angular/core';
import { User } from '../../user.model';
import { FriendsService } from '../friends.service';
import { map } from 'rxjs/operators';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  requests: User[];
  onlineUsers: any[];
  fetching = false;

  constructor(private friendsService: FriendsService, private socketService: SocketService) {
    this.requests = [];
  }

  ngOnInit(): void {
    this.fetching = true;
    this.getAllRequests();
    this.socketService.onlineUsers.subscribe(users => {
      this.onlineUsers = users;
    });
  }

  acceptRequest(userID: string) {
    if (!userID) {
      return;
    }
    console.log('accept');
    this.friendsService.acceptRequest(userID)
      .subscribe(response => {
        this.getAllRequests();
      }, error => {
        console.log(error);
      });
  }

  rejectRequest(userID: string) {
    if (!userID) {
      return;
    }
    this.friendsService.rejectRequest(userID)
      .subscribe(response => {
        this.getAllRequests();
      }, error => {
        console.log(error);
      });
  }

  isOnline(userID: string) {
    const index = this.onlineUsers.findIndex(
      (x) => x.userID === userID
    );
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }


  private getAllRequests() {
    this.friendsService.getAllRequests().pipe(
      map(response => {
        return {
          requests: response.requests.map(friend => {
            const transformedRequest: User = {
              userID: friend._id,
              name: friend.name,
              email: friend.email
            };
            return transformedRequest;
          })
        };
      })
    ).
      subscribe(transformedResponse => {
        this.fetching = false;
        this.requests = transformedResponse.requests;
      }, error => {
        this.fetching = false;
        console.log(error);
      });
  }

}
