import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class NewCaseRegistrationService {

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

  async GetUploadDocumentType() {
    const reqData = await this.getReqObj('NCSR');
    return this.apiService.post('api/Utility/GetUploadDocumentType', reqData);
  }

  async searchPatient(data: any) {
    const reqData = await this.getReqObj('NCSR',data);
    return this.apiService.post('api/Utility/SearchPatientName', reqData);
  }

  async saveRequest(data: any) {
    const reqData = await this.getReqObj('NCSR',data);
    return this.apiService.post('api/WorkRequest/NewCaseRegistration', reqData);
  }

  async getUserName(data: any) {
    const reqData = await this.getReqObj('NCSR', data);
    return this.apiService.post('api/Utility/GetUserName', reqData);
  }


}
