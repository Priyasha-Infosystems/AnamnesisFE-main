import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorisedSignatoryAddService {

  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  async getReqObj(screenCode?: string, data?: any) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(screenCode),
      apiRequest: data ? data.apiRequest : {}
    }
    return datas;
  }

  async searchPhysician(data: any) {
    const reqData = await this.getReqObj('ASAD',data);
    return this.apiService.post('api/Utility/SearchPhysician', reqData);
  }
  async GetUploadDocumentType() {
    const reqData = await this.getReqObj('ASAD');
    return this.apiService.post('api/Utility/GetUploadDocumentType', reqData);
  }
  async saveAuthorisedSignatory(data:any) {
    const reqData = await this.getReqObj('ASAD',data);
    return this.apiService.post('api/AuthorisedSignatory/Add', reqData);
  }
  async getAuthorisedSignatoryDocument(data:any) {
    const reqData = await this.getReqObj('ASAD',data);
    return this.apiService.post('api/AuthorisedSignatory/GetAuthoriseSignatoryDocument', reqData);
  }
  async getAuthorisedSignatoryDetails(data:any,screenCode:string) {
    const reqData = await this.getReqObj(screenCode,data);
    return this.apiService.post('api/AuthorisedSignatory/GetDetails', reqData);
  }
  async authorisedSignatoryApproval(data: any){
    const reqData = await this.getReqObj('ASAD',data);
    return this.apiService.post('api/AuthorisedSignatory/Approval', reqData);
  }

}
