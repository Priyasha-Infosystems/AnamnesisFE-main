import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class CaseAssignmentService {

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

  async getNewWorkRequestList(data: any) {
    const reqData = await this.getReqObj('CSAS', data);
    return this.apiService.post('api/WorkRequest/NewWorkRequestList', reqData);
  }

  async MyAssignments() {
    const reqData = await this.getReqObj('MYAS');
    return this.apiService.post('api/WorkRequest/MyAssignments', reqData);
  }

  async getUserList(data: any) {
    const reqData = await this.getReqObj('CSAS', data);
    return this.apiService.post('api/Utility/SearchHelpdeskUser', reqData);
  }

  async caseAssignment(data: any) {
    const reqData = await this.getReqObj('CSAS', data);
    return this.apiService.post('api/WorkRequest/CaseAssignment', reqData);
  }

  async getWrrequestStatusList(data: any) {
    const reqData = await this.getReqObj('WRSR', data);
    return this.apiService.post('api/WorkRequest/Search', reqData);
  }


}
