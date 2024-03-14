import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierRequisitionService {
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

  async GetDiagnosticCentreDetails(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Utility/GetDiagnosticCentreDetailsForInternalUser', reqData);
  }
  async GetSupplierRequisitionList(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/SupplierRequisition/List', reqData);
  }
  async GetSupplierRequisitionListForInvoice(data: any) {
    const reqData = await this.getReqObj("INVN",data);
    return this.apiService.post('api/Inventory/InvoiceEntryList', reqData);
  }
  async GetSupplierRequisitionListForGRN(data: any) {
    const reqData = await this.getReqObj("INVN",data);
    return this.apiService.post('api/Inventory/GRNList', reqData);
  }
  async GetSupplierRequisitionListForDeliveryPickup(data: any) {
    const reqData = await this.getReqObj("INVN",data);
    return this.apiService.post('api/Inventory/List', reqData);
  }

  async GetDeliveryPickupDetails(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Delivery/OrderDetails', reqData);
  } 
  async GetNextOrderPickupDetails(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Delivery/NextOrder', reqData);
  } 
  async PackageOrderPickupDetails(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Delivery/Package', reqData);
  } 
  async generateInvoice(data: any) {
    const reqData = await this.getReqObj("INVC",data);
    return this.apiService.post('api/Inventory/Invoice', reqData);
  }
  async GRN(data: any) {
    const reqData = await this.getReqObj("INVC",data);
    return this.apiService.post('api/Inventory/GRN', reqData);
  }

  async getInvoice(data: any) {
    const reqData = await this.getReqObj("INVC",data);
    return this.apiService.post('api/Inventory/Details', reqData);
  }

  async GetSupplierRequisitionDetails(data: any,screenCode:string) {
    const reqData = await this.getReqObj(screenCode,data);
    return this.apiService.post('api/SupplierRequisition/Details', reqData);
  }
  async SaveSupplierRequisitionDetails(data: any,screenCode:string) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/SupplierRequisition/Confirmation', reqData);
  }
  async GetGRNViewDetails(data: any,screenCode:string) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Inventory/GRNView', reqData);
  }
  async SaveGRNViewDetails(data: any,screenCode:string) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Inventory/GRN', reqData);
  }
  async getDeliveryAssignment(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Assignment/List', reqData);
  }
  async DeliveryAssignment(data: any) {
    const reqData = await this.getReqObj("SPRQ",data);
    return this.apiService.post('api/Assignment/Submit', reqData);
  }

}
