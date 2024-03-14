import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { LOCAL_STORAGE } from '@constant/constants';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { LocalStorageService } from './localService/localStorage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuard implements CanActivate {
  constructor(
    // private auth: AuthService,
    private localStorage: LocalStorageService,
    private router: Router,
  ) { }

  async canActivate() {
    const token = await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN);
    if (token == null) {
      return true;
    } else {
      this.router.navigate(['/home'], { skipLocationChange: true });
      return false;
    }
  }
}
