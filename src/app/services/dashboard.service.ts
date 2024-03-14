import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

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

  async GetAdminDashboard(){
    const reqData = await this.getReqObj('ADDB');
    return this.apiService.post('api/Dashboard/Admin', reqData);
  }
  async GetSalesDashboard(){
    const reqData = await this.getReqObj('SLDB');
    return this.apiService.post('api/Dashboard/Sales', reqData);
  }
}
