import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewMyCartService {
  public cartChangeInd = new BehaviorSubject<boolean>(false)
  public cartRefetchInd = new BehaviorSubject<boolean>(false)
  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  updateCartItemCount(){
    this.cartChangeInd.next(true);
  }
  updateCartRefetch(){
    this.updateCartItemCount();
    this.cartRefetchInd.next(true);
  }

  async getReqObj(screenCode?: string, data?: any) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(screenCode),
      apiRequest: data ? data.apiRequest : {}
    }
    return datas;
  }

  async getViewMyCatrDetails(){
    const reqData = await this.getReqObj("");
    return this.apiService.post('api/MyCart/ViewMyCart', reqData);
  }
  async getPricingDetails(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/RecalculateCartPrice', reqData);
  }
  async ViewMyCart(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/ViewMyCart', reqData);
  }
  async ItemQuantity(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/ItemQuantity', reqData);
  }
  async ItemDelete(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/DeleteCartItem', reqData);
  }
  async getCartAddress(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/GetCartAddress', reqData);
  }
  async PaymentGateway(){
    const reqData = await this.getReqObj("VMCT");
    return this.apiService.post('api/Order/PaymentGateway', reqData);
  }
  async PlaceOrder(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/Order/PlaceOrder', reqData);
  }
  async AddCoupon(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/AddCoupon', reqData);
  }
  async RemoveCoupon(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/RemoveCoupon', reqData);
  }

  async checkItemInCart(data:any){
    const reqData = await this.getReqObj("VMCT",data);
    return this.apiService.post('api/MyCart/CheckItem', reqData);
  }

}
