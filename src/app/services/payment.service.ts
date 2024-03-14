import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

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

  async getPaymentDisplayList(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/Payment/Display', reqData);
  }
  async PaymentApproval(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/Payment/Approval', reqData);
  }
}
