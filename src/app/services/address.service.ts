import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  screenCode = "MNAD";

  async getReqObj(data?: any) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(this.screenCode),
      apiRequest: data ? data.apiRequest : {}
    }
    return datas;
  }

  async getAddress() {
    const reqData = await this.getReqObj();
    return this.apiService.post('api/ManageAddress/GetAllAddress', reqData);
  }

  async addAddress(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/ManageAddress/AddNewAddress', reqData);
  }

  async changeAddress(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/ManageAddress/ChangeAddress', reqData);
  }

  async setDefaultAddress(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/ManageAddress/SetDefaultAddress', reqData);
  }

  async deleteAddress(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/ManageAddress/DeleteAddress', reqData);
  }
  async saveCartAddress(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/MyCart/SaveCartAddress', reqData);
  }
}
