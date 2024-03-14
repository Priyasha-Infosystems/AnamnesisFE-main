import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class MedicineEntryService {

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

  async saveMedicineDetails(data: any) {
    const reqData = await this.getReqObj('MDDE', data);
    return this.apiService.post('api/DataEntry/Medicine', reqData);
  }

  async saveHouseHoldItem(data: any) {
    const reqData = await this.getReqObj('HHDE', data);
    return this.apiService.post('api/HouseholdItem/DataEntry', reqData);
  }
  async getHouseholdItemCategoryAndSubcategoryList() {
    const reqData = await this.getReqObj('HHDE');
    return this.apiService.post('api/HouseholdItem/GetHouseHoldItemCategoryCode', reqData);
  }

  async getMedicineList(data: any){
    const reqData = await this.getReqObj('MDDE',data);
    return this.apiService.post('api/MyCart/GetMedicineList', reqData);
  }


}
