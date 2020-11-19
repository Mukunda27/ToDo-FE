import { Component, OnInit } from '@angular/core';
import { User } from '../../user.model';
import { FriendsService } from '../friends.service';
import { map } from 'rxjs/operators';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {

  users: User[];
  friends: User[];
  sentRequests: User[];
  fetching = false;
  onlineUsers: any[];

  constructor(private friendsService: FriendsService, private socketService: SocketService) {
    this.users = [];
  }

  ngOnInit(): void {
    this.fetching = true;
    this.getAllUserInfo();
    this.socketService.onlineUsers.subscribe(users => {
      this.onlineUsers = users;
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

  isFriend(userID: string) {
    const index = this.friends.findIndex(
      (x: any) => x.userID === userID
    );
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }

  isRequestSent(userID: string) {
    const index = this.sentRequests.findIndex(
      (x) => x.userID === userID
    );
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }

  sendRequest(userID: string) {
    if (!userID) {
      return;
    }
    this.friendsService.sendRequest(userID)
      .subscribe(response => {
        this.getAllUserInfo();
      }, error => {
        console.log(error);
      });
  }


  private async getAllUserInfo() {
    try {
      this.users = (await this.getAllusers()).users;
      this.friends = (await this.getAllFriends()).friends;
      this.sentRequests = (await this.getAllSentRequests()).sentRequests;
      this.fetching = false;
    }
    catch (err) {
      this.fetching = false;
      // request failed
      console.error(err);
    }
  }

  private getAllusers() {
    return this.friendsService.getAllUsers().pipe(
      map(response => {
        return {
          users: response.users.map(user => {
            const transformedUser: User = {
              userID: user._id,
              name: user.name,
              email: user.email
            };
            return transformedUser;
          })
        };
      })
    ).toPromise();

  }

  private getAllFriends() {
    return this.friendsService.getAllFriends().pipe(
      map(response => {
        return {
          friends: response.friends.map(friend => {
            const transformedFriend: User = {
              userID: friend._id,
              name: friend.name,
              email: friend.email
            };
            return transformedFriend;
          })
        };
      })
    ).toPromise();

  }

  private getAllSentRequests() {
    return this.friendsService.getAllSentRequests().pipe(
      map(response => {
        return {
          sentRequests: response.sentRequests.map(friend => {
            const transformedFriend: User = {
              userID: friend._id,
              name: friend.name,
              email: friend.email
            };
            return transformedFriend;
          })
        };
      })
    ).toPromise();
  }
}
