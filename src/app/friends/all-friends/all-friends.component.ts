import { Component, OnInit } from '@angular/core';
import { FriendsService } from '../friends.service';
import { map } from 'rxjs/operators';
import { User } from '../../user.model';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-all-friends',
  templateUrl: './all-friends.component.html',
  styleUrls: ['./all-friends.component.scss']
})
export class AllFriendsComponent implements OnInit {
  friends: User[];
  onlineUsers: any[];
  fetching = false;

  constructor(private friendsService: FriendsService, private socketService: SocketService) {
    this.friends = [];
  }

  ngOnInit(): void {
    this.fetching = true;
    this.getAllFriends();

    this.socketService.onlineUsers.subscribe(users => {
      this.onlineUsers = users;
    });
  }

  removeFriend(userID: string) {
    if (!userID) {
      return;
    }
    this.friendsService.removeFriend(userID)
      .subscribe(response => {
        this.getAllFriends();
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

  private getAllFriends() {
    this.friendsService.getAllFriends().pipe(
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
    ).
      subscribe(transformedResponse => {
        this.fetching = false;
        this.friends = transformedResponse.friends;
      }, error => {
        this.fetching = false;
        console.log(error);
      });
  }
}
