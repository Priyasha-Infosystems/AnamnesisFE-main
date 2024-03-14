import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class HealthEquipmentService {

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

  async getHealthcareEquipmentleList(data: any) {
    const reqData = await this.getReqObj('ADNA', data);
    return this.apiService.post('api/Utility/SearchHouseholdItem', reqData);
  }

  async addToCart(data: any) {
    const reqData = await this.getReqObj('ADNA', data);
    return this.apiService.post('api/MyCart/AddHouseholdItemOrderToCart', reqData);
  }
}
