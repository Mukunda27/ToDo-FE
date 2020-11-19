import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsComponent } from './friends/friends.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AllFriendsComponent } from './all-friends/all-friends.component';

// Angular Material
import { MatPaginatorModule } from '@angular/material/paginator';
import { DiscoverComponent } from './discover/discover.component';
import { RequestsComponent } from './requests/requests.component';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '', component: FriendsComponent, children: [
      {
        path: '',
        redirectTo: 'all-friends',
        pathMatch: 'full'
      },
      {
        path: 'all-friends',
        component: AllFriendsComponent
      },
      {
        path: 'discover',
        component: DiscoverComponent
      },
      {
        path: 'requests',
        component: RequestsComponent
      }
    ]
  }
];

@NgModule({
  declarations: [FriendsComponent, AllFriendsComponent, DiscoverComponent, RequestsComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatPaginatorModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]

})
export class FriendsModule { }
