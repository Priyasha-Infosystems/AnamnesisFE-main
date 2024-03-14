import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LOCAL_STORAGE } from '@constant/constants';
import { ApiService } from '@services/api.service';
import { UtilityService } from '@services/utility.service';
import { LocalStorageService } from './localService/localStorage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private jwtHelper: JwtHelperService,
    private apiService: ApiService,
    private localStorageService: LocalStorageService
  ) { }

  public async isAuthenticated() {
    const token: any = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN);
    return !this.jwtHelper.isTokenExpired(token);
  }
}

