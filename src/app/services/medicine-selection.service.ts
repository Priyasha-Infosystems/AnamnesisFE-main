import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class MedicineSelectionService {

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

  async getMedicineList(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/MyCart/GetMedicineList', reqData);
  }
  async getMedicineTypeList(){
    const reqData = await this.getReqObj('ADNA');
    return this.apiService.post('api/MyCart/GetMedicineType', reqData);
  }

  async addToCart(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/MyCart/AddMedicineOrderToCart', reqData);
  }
  async addToCartPrescriptionItem(data: any){
    const reqData = await this.getReqObj('ADNA',data);
    return this.apiService.post('api/MyCart/AddPrescriptionOrderToCart', reqData);
  }
  async getCartAddress(){
    const reqData = await this.getReqObj('ADNA');
    return this.apiService.post('api/MyCart/GetCartAddress', reqData);
  }
}
