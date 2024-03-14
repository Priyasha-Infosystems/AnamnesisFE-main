import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { ERROR_CODE, LOCAL_STORAGE, PROD, REDIRECT_AFTER_ERROR_CODE } from 'src/app/constants/constants';
import { LocalStorageService } from 'src/app/services/localService/localStorage.service';
import { environment } from '../../environments/environment';
import { HttpErrorHandler } from 'src/app/services/error-handler/http-error-handler.service';
import { constants, USER_ROUTES } from 'src/app/constants/constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { UtilityService } from './utility.service';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    modalRef: BsModalRef;
    fingerJsToken: any;
    prod:any = PROD
    BASE_URL = window.location.href === "http://localhost:4200/" ? "https://www.myhealthbook.co.in/" : window.location.href;
    constructor(
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private httpErrorHandler: HttpErrorHandler,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public helper: UtilityService,
    ) {
        if(this.prod){
            this.BASE_URL =  window.location.href === "http://localhost:4200/" ? "https://www.anamnesis.in/" : window.location.href;
        }
     }
    private data = new BehaviorSubject('default data');
    data$ = this.data.asObservable();

    async getHeaders() {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return headers;
    }
   
    async post(path: string, obj: any, isToaster?: boolean, noLoder?: any, isDoc?: any) {
        path = this.BASE_URL + path;
        return new Promise(async (resolve, reject) => {
            if (!noLoder) {
                this.spinner.show();
            }
            const success = (res: any) => {
                if (isToaster) {
                    this.toastr.success(res.message ? res.message : res.msg ? res.msg : res.responseMessage, '');
                }
                if (!noLoder) {
                    this.spinner.hide();
                }
                resolve(res);
            };
            const error = (err: any) => {
                if (isToaster) {
                    this.toastr.error(err.error.message ? err.error.message : err.error.msg ? err.msg : err.error.responseMessage, '');
                }
                this.helper.hideLoading();
                reject(err);
                return this.httpErrorHandler.handleError(err, true);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                const params = new HttpParams();
                const options = {
                    params,
                    reportProgress: true,
                };
                const headers = await this.getHeaders();
                return this.http.post<any>(`${path}`, obj, isDoc ? options : { headers })
                    .subscribe(success, error);
            } else {
                if (!noLoder) {
                    this.spinner.hide();
                }
            }
            return;
        });
    }

    async put(path: string, obj: any, isToaster?: boolean, noLoder?: any) {
        path = this.BASE_URL + path;
        return new Promise(async (resolve, reject) => {
            if (!noLoder) {
                this.spinner.show();
            }
            const success = (res: any) => {
                if (isToaster) {
                    this.toastr.success(res.message ? res.message : res.msg ? res.msg : res.responseMessage, '');
                }
                if (!noLoder) {
                    this.spinner.hide();
                }
                resolve(res);
            };
            const error = (err: any) => {
                if (isToaster) {
                    this.toastr.error(err.error.message ? err.error.message : err.error.msg ? err.msg : err.error.responseMessage, '');
                }
                this.helper.hideLoading();
                reject(err);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                const headers = await this.getHeaders();
                return this.http.put<any>(`${path}`, obj, { headers })
                    .subscribe(success, error);
            } else {
                if (!noLoder) {
                    this.spinner.hide();
                }
            }
            return;
        });
    }

    async delete(path: string, isToaster?: boolean, noLoder?: any) {
        path = this.BASE_URL + path;
        return new Promise(async (resolve, reject) => {
            if (!noLoder) {
                this.spinner.show();
            }
            const success = (res: any) => {
                if (isToaster) {
                    this.toastr.success(res.message ? res.message : res.msg ? res.msg : res.responseMessage, '');
                }
                if (!noLoder) {
                    this.spinner.hide();
                }
                resolve(res);
            };
            const error = (err: any) => {
                if (isToaster) {
                    this.toastr.error(err.error.message ? err.error.message : err.error.msg ? err.msg : err.error.responseMessage, '');
                }
                this.helper.hideLoading();
                reject(err);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                const headers = await this.getHeaders();
                return this.http.delete<any>(`${path}`, { headers })
                    .subscribe(success, error);
            } else {
                if (!noLoder) {
                    this.spinner.hide();
                }
            }
            return;
        });
    }

    async get(path: string, isToaster?: boolean, noLoder?: any,anotherPath?:any) {
        if(!anotherPath){
            path = this.BASE_URL + path;
        }
        return new Promise(async (resolve, reject) => {
            if (!noLoder) {
                this.spinner.show();
            }
            const success = (res: any) => {
                if (isToaster) {
                    this.toastr.success(res.message ? res.message : res.msg ? res.msg : res.responseMessage, '');
                }
                if (!noLoder) {
                    this.spinner.hide();
                }
                resolve(res);
            };
            const error = (err: any) => {
                if (isToaster) {
                    this.toastr.error(err.error.message ? err.error.message : err.error.msg ? err.msg : err.error.responseMessage, '');
                }
                this.helper.hideLoading();
                reject(err);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                const headers = await this.getHeaders();
                if(!anotherPath){
                    return this.http.get<any>(`${path}`, { headers })
                    .subscribe(success, error);
                }else{
                    return this.http.get<any>(`${path}`)
                    .subscribe(success, error);
                }
               
            } else {
                if (!noLoder) {
                    this.spinner.hide();
                }
            }
            return;
        });
    }

    getNetworkConnection() {
        const isOnline: boolean = navigator.onLine;
        if (isOnline) {
            return true;
        }
        return false;
    }

    async GetIP(path:string){
       return this.http.get<any>(path).subscribe();
    }
}
