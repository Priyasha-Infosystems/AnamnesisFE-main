import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class UserSetupService {

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

  async saveBulkUserSetupdetails(data: any) {
    const reqData = await this.getReqObj('BULK', data);
    return this.apiService.post('api/Authentication/BulkUserSetup', reqData);
  }
  async getCommercialIDList(data: any) {
    const reqData = await this.getReqObj('BULK', data);
    return this.apiService.post('api/UserProfile/GetCommercialIDList', reqData);
  }
  async getXlsxBlob() {
    return this.apiService.get('api/DiagnosticCentre/ExportExcel');
  }

}
