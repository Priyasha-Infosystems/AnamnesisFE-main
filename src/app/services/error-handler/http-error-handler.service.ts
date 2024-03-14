import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, BehaviorSubject } from 'rxjs';
import { NotificationAlertService } from '../notification.service';
import { LocalStorageService } from '../localService/localStorage.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '@services/utility.service';

@Injectable({
  providedIn: 'root'
})

export class HttpErrorHandler {

  public mobileNotverified = new BehaviorSubject<any>(null);
  public emailNotverified = new BehaviorSubject<any>(null);

  constructor(
    private notificationService: NotificationAlertService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private store: Store<any>,
    private toastr: ToastrService,
    private utilityService: UtilityService,
  ) { }

  async handleError(error: HttpErrorResponse, isErrorDisplay?: any) {
    const errorMessage = error.error.error || error.error.message;
    if (errorMessage && !isErrorDisplay) {
      this.notificationService.showError(errorMessage);
    }
    this.spinner.hide();
    switch (error.status) {
      case 400:
        // this.toastr.error(error.message ? error.message : error.error ? error.error : 'Something went wrong, Please try again', '');
        return;
      case 401:
        this.router.navigate(['/un-authorised-pages'], { skipLocationChange: true });
        this.utilityService.handleClearStore();
        return;
      case 403:
        // this.toastr.error(error.message ? error.message : error.error ? error.error : 'Something went wrong, Please try again', '');
        return;
      case 404:
        // this.toastr.error(error.message ? error.message : error.error ? error.error : 'Something went wrong, Please try again', '');
        return;
      case 500:
        // this.toastr.error(error.message ? error.message : error.error ? error.error : 'Something went wrong, Please try again', '');
        return;
      default:
    }

    return throwError(error);
  }
}
