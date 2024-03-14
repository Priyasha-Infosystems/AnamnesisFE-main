import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalInformationApprovalService {

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

  async getPersonalInformation(data: any){
    const reqData = await this.getReqObj('PINA',data);
    return this.apiService.post('api/WorkRequest/PIADetails', reqData);
  }

  async authorisedSignatoryApproval(data: any){
    const reqData = await this.getReqObj('PINA',data);
    return this.apiService.post('api/UserProfile/WorkRequestApproval', reqData);
  }
  async authorisedSignatoryRejection(data: any){
    const reqData = await this.getReqObj('PINA',data);
    return this.apiService.post('api/AuthorisedSignatory/SignatoryReject', reqData);
  }
}
