import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../user.service';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class NewPasswordGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    boolean | Observable<boolean> | Promise<boolean> {
    const resettoken = route.params.token;

    return this.userService.validatePasswordResetToken(resettoken).pipe(map((response: { validToken: boolean }) => {
      if (response.validToken) {
        return true;
      }
      this.router.navigate(['/page-not-found']);
      return false;
    }), catchError((error) => {
      this.router.navigate(['/page-not-found']);
      return of(false);
    }));
  }
}
