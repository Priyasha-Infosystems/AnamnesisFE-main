import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsService {

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

  async getOrderList(data: any){
    const reqData = await this.getReqObj('MOLS',data);
    return this.apiService.post('api/Order/OrderListRetrieval', reqData);
  }
  async getOrderDetails(data: any){
    const reqData = await this.getReqObj('ORDT',data);
    return this.apiService.post('api/Order/GetOrderDetails', reqData);
  }
  async DownloadInvoice(data: any){
    const reqData = await this.getReqObj('ORDT',data);
    return this.apiService.post('api/Order/DownloadInvoice', reqData);
  }
  async cancel(data: any){
    const reqData = await this.getReqObj('MOLS',data);
    return this.apiService.post('api/Order/Cancel', reqData);
  }
}
