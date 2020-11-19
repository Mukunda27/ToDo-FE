import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + 'friends/';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(
    private httpClient: HttpClient) { }

  getAllFriends() {
    return this.httpClient.get<{ friends: any }>(BACKEND_URL + 'all-friends');
  }

  getAllRequests() {
    return this.httpClient.get<{ requests: any }>(BACKEND_URL + 'requests');
  }

  getAllSentRequests() {
    return this.httpClient.get<{ sentRequests: any }>(BACKEND_URL + 'sent-requests');
  }

  getAllUsers() {
    return this.httpClient.get<{ users: any[] }>(BACKEND_URL + 'discover');
  }

  sendRequest(requestedId: string) {
    const httpBody = { requestedId };

    return this.httpClient.post<{ message: string }>(BACKEND_URL + 'send-request', httpBody);
  }

  acceptRequest(requestedId: string) {
    const httpBody = { requestedId };

    return this.httpClient.post<{ message: string }>(BACKEND_URL + 'accept-request', httpBody);
  }

  rejectRequest(requestedId: string) {
    const httpBody = { requestedId };

    return this.httpClient.post<{ message: string }>(BACKEND_URL + 'reject-request', httpBody);
  }

  removeFriend(requestedId: string) {
    const httpBody = { requestedId };

    return this.httpClient.post<{ message: string }>(BACKEND_URL + 'remove-friend', httpBody);
  }
}
