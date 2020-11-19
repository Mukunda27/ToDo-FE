import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';

const BACKEND_URL = environment.apiUrl + 'list/';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  public listUpdated = new Subject<{ lists: string[] }>();

  listUpdatedListener() {
    return this.listUpdated.asObservable();
  }

  constructor(
    private httpClient: HttpClient) { }

  addList(listName: string) {
    const httpBody = { listName };
    return this.httpClient.post<{ message: string }>(BACKEND_URL + 'add', httpBody);
  }

  getAllLists() {
    return this.httpClient.get<{ lists: Array<{ name: string }> }>(BACKEND_URL + 'all');
  }
}
