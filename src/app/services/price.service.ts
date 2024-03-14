import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PriceSetupService {

  constructor(
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

  async labtestPriceSetup(data: any) {
    const reqData = await this.getReqObj('PRCS', data);
    return this.apiService.post('api/PriceSetup/LabtestPrice', reqData);
  }


}
