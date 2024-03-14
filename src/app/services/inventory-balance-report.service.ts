import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryBalanceReportService {

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

  async getInventoryReportData(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/Report/Inventory', reqData);
  }
  async getSalesReportData(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/Report/Sales', reqData);
  }
}
