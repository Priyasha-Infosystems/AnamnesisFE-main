import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class CaseLogService {
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

  /**
    * @author Baidurja
    * @todo Api Url
    */
  async Coment(data: any){
    const reqData = await this.getReqObj('MYAS', data);
    return this.apiService.post('api/WorkRequest/AddCaseLog', reqData);
  }

  /**
   * @author Baidurja
   * @todo Api Url
   */
  async GetCaseLOG(data: any){
    const reqData = await this.getReqObj('MYAS', data);
    return this.apiService.post('api/WorkRequest/GetAllCaseLogHistory', reqData);
  }
}
