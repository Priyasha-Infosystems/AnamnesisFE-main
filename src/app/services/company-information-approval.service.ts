import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyInformationApprovalService {

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

  async getCompanyInformation(data: any){
    const reqData = await this.getReqObj('CINA',data);
    return this.apiService.post('api/WorkRequest/CIADetails', reqData);
  }
  async authorisedSignatoryApproval(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/UserProfile/WorkRequestApproval', reqData);
  }
  async authorisedSignatoryRejection(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/WorkRequest/SignatoryReject', reqData);
  }
  async getImg(data: any){
    return this.apiService.get(data);
  }

}
