import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationSearchService {

  private client_id = '33OkryzDZsINYwnD2fP94_rviQPrJqQycM6BfIwuJBUJr_e9YsrGUI0o6PyHsUVFqoW2Qff1SXvswrkiUQ9p2jCXWbVNVutp';
  private client_secret = 'lrFxI-iSEg-BUSU94p8AlsGPjaDjGE2gws8hWEsFGLrAMVbZrF639rmzASzIZ7l08qqukYZsSWJDZdsDNA4-1CnAyIAMgKAy8x9WIx44eY0=';
  private tokenUrl = `/api/security/oauth/token?grant_type=client_credentials&client_id=${this.client_id}&client_secret=${this.client_secret}`;

  private addressUrl = '/api/places/geocode?itemCount=10&address=';

  private tokenResponse: any;

  constructor(private http: HttpClient) {
    this.generateToken();
  }

  generateToken() {
    this.http.post(this.tokenUrl, {}).subscribe((tokenData) => {
      this.tokenResponse = <any>tokenData;
    });
  }

  getAddresses(address: String) {
    return this.http
      .get(this.addressUrl + address, {
        headers: {
          Authorization: this.tokenResponse.token_type +
            ' ' +
            this.tokenResponse.access_token,
        },
      })
      .pipe(map((results: any) => results.copResults));
  }
}
