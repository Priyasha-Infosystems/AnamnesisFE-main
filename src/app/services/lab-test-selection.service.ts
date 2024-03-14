import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class LabTestSelectionService {

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

  async getLabTestList(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/MyCart/GetLaboratoryTestList', reqData);
  }

  async addToCart(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/MyCart/AddLabtestOrderToCart', reqData);
  }
}


