import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { LOCAL_STORAGE } from '@constant/constants';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { LocalStorageService } from './localService/localStorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    // private auth: AuthService,
    private localStorage: LocalStorageService,
    private router: Router,
  ) { }

  async canActivate() {
    const token = await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN);
    if (token == null) {
      this.router.navigate(['/'], { skipLocationChange: true });
      setTimeout(() => {
        let currentUrl = this.router.url;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl], { skipLocationChange: true });
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl], { skipLocationChange: true });
        });
      });
      return false;
    } else {
      return true;
    }
  }

  async canActivateChild() {
    // if (!this.auth.isAuthenticated()) {
    // const token = await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN);
    // if (token) {
    // this.router.navigate(['/'], { skipLocationChange: true });
    // return false;
    // }
    // }
    return true;
  }
}
