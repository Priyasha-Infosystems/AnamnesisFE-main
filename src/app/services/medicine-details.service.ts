import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class MedicineDetailsService {

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

  async getMedicineDetails(data: any) {
    const reqData = await this.getReqObj('ADNA', data);
    return this.apiService.post('api/MyCart/GetMedicineDetails', reqData);
  }
  async getHouseHoldItemDetails(data: any) {
    const reqData = await this.getReqObj('ADNA', data);
    return this.apiService.post('api/HouseholdItem/GetHouseHoldItemDetails', reqData);
  }
  async getFile(data: any) {
    return this.apiService.get(data);
  }


}

