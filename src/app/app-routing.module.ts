import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserModule } from './user/user.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TaskModule } from './task/task.module';
import { FriendsModule } from './friends/friends.module';


const routes: Routes = [
  { path: 'user', loadChildren: () => UserModule },
  { path: 'task', loadChildren: () => TaskModule },
  { path: 'friends', loadChildren: () => FriendsModule },

  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
