import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { LOCAL_STORAGE } from '@constant/constants';
import { LocalStorageService } from './localService/localStorage.service';
import { CommonService } from './common.service';
import { ApiService } from './api.service';
import { DeviceUUID } from "device-uuid";

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {

  uuid: any

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
  ) {
    this.uuid = new DeviceUUID().get() || "";
  }

  BASE_URL = window.location.href === "http://localhost:4200/" ? "https://www.myhealthbook.co.in/" : window.location.href;

  async getHeaders() {
    const token: any = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "";
    const userid: any = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    const userCode: any = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "";
    const headers = new HttpHeaders()
      .set('apikey', token)
      .set('userid', userid)
      .set('Accept', 'application/json');
    return headers;
  }

  async getReqObj(screenCode?: string, data?: any) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(screenCode),
      apiRequest: data ? data.apiRequest : {}
    }
    return datas;
  }


  async uploadDoc(data: any, docType: string, documentNumber: string,param?: any,): Promise<Observable<any>> {
    const path = this.BASE_URL + "api/Utility/SingleFileUpload";
    const headers = await this.getHeaders();
    const options: any = {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      params: {
        DocumentType: docType,
        DocumentNumber: documentNumber || "",
        UserCode: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        UserID: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "",
        CustomerUserCode:await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        APIKey: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "",
        DeviceID: this.uuid
      }
    };
    if (param) {
      options.params = {...param,DeviceID: this.uuid};
    }
    options.params.APIKey = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || ""
    return this.http
      .post(path, data, options)
      .pipe(catchError(this.errorMgmt));
  }
  async uploadSCRDoc(data: any, docType: string, DocumentNumber:any,existingFileID:any,CustomerUserCode?:any,): Promise<Observable<any>> {
    const path = this.BASE_URL + "api/Utility/UploadScratchPad";
    const headers = await this.getHeaders();
    const options: any = {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      params: {
        DocumentType: docType,
        DocumentNumber: DocumentNumber||'',
        UserCode: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        UserID: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "",
        CustomerUserCode:CustomerUserCode?CustomerUserCode:await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        APIKey: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "",
        DeviceID: this.uuid,
        FileID:existingFileID||''
      }
    };
    options.params.APIKey = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || ""
    return this.http
      .post(path, data, options)
      .pipe(catchError(this.errorMgmt));
  }
  async uploadDocMEDorHHI(data: any, docType: string, documentNumber: string,): Promise<Observable<any>> {
    const path = this.BASE_URL + "api/DataEntry/UploadPicture";
    const headers = await this.getHeaders();
    const options: any = {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      params: {
        DocumentType: docType,
        DocumentNumber: documentNumber || "",
        UserCode: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        UserID: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "",
        APIKey: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "",
        DeviceID: this.uuid
      }
    };
    options.params.APIKey = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || ""
    return this.http
      .post(path, data, options)
      .pipe(catchError(this.errorMgmt));
  }
  async uploadInvoiceFile(data: any, docType: string, documentNumber: string,RequisitionNumber:any): Promise<Observable<any>> {
    const path = this.BASE_URL + "api/Inventory/UploadSupplierInvoice";
    const headers = await this.getHeaders();
    const options: any = {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      params: {
        DocumentType: docType,
        DocumentNumber: documentNumber || "",
        UserCode: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        UserID: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "",
        APIKey: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "",
        DeviceID: this.uuid,
        RequisitionNumber:RequisitionNumber
      }
    };
    options.params.APIKey = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || ""
    return this.http
      .post(path, data, options)
      .pipe(catchError(this.errorMgmt));
  }
  async uploadProfileImage(data: any, docType: string, documentNumber: string, param?: any): Promise<Observable<any>> {
    const path = this.BASE_URL + "api/UserProfile/SavePicture";
    const headers = await this.getHeaders();
    const options: any = {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      params: {
        DocumentNumber: documentNumber || "",
        UserCode: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
        UserID: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "",
        APIKey: await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "",
        DeviceID: this.uuid
      }
    };
    if (param) {
      options.params = param;
    }
    options.params.APIKey = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || ""
    return this.http
      .post(path, data, options)
      .pipe(catchError(this.errorMgmt));
  }

  errorMgmt(error: HttpErrorResponse) {
    return throwError(() => {
      return error.error.message;
    });
  }
  async singleFileDelete(data: any, screenCode: any) {
    const reqData = await this.getReqObj(screenCode, data);
    return this.apiService.post('api/Utility/SingleFileDelete', reqData);
  }
  async singleFileDeleteMED(data: any, screenCode: any) {
    const reqData = await this.getReqObj(screenCode, data);
    return this.apiService.post('api/Utility/MerchandisePictureDelete', reqData);
  }

  async multyFileDelete(data: any, screenCode: any) {
    const reqData = await this.getReqObj(screenCode, data);
    return this.apiService.post('api/Utility/MultiFileDelete', reqData);
  }

  isDocUploadApiError(response: any) {
    if (response.anamnesisErrorList.anErrorCount > 0 && response.anamnesisErrorList.anErrorList.length > 0) {
      return true;
    }
    return false;
  }

}
