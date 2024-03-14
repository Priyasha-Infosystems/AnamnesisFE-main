import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class AnamnesisSetupServiceService {

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

  async getRoleTypeList(data: any) {
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Utility/GetAllRoleCode', reqData);
  }
  async getDeliveryZoneList(data: any) {
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Utility/DeliveryZones', reqData);
  }

  async getUserName(data: any) {
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Utility/GetUserName', reqData);
  }

  async SaveRoleType(data: any) {
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/ChangeUserRole', reqData);
  }
  async SaveRoleTypeAsPharmacist(data: any) {
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/AssignPharmacist', reqData);
  }
  async SaveRoleTypeAsDeliveryAgent(data: any) {
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/AssignDeliveryAgent', reqData);
  }

  async getLabtestList(data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Utility/GetAllLaboraotyTestName', reqData);
  }

  async getInitialData(data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/GetInitialData', reqData);
  }
  async getAllDapertmentCode(data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Utility/GetAllDepartmentCode', reqData);
  }

  async saveLabTest(data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/AddLaboratoryTest', reqData);
  }
  async saveLabTestPackage(data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/AddLaboratoryTestPackage', reqData);
  }
  async saveDiagnisctiCenter(data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/AddDiagnosticCenter', reqData);
  }
  async savePhysician (data:any){
    const reqData = await this.getReqObj('ANSU', data);
    return this.apiService.post('api/Setup/PhysicianDataEntry', reqData);
  }

  async searchHealthClinic(data: any) {
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Utility/SearchHealthClinic', reqData);
  }
  async AuthorisedSignatoryDataEntry(data: any) {
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Setup/AuthorisedSignatoryDataEntry', reqData);
  }
  async PhysicianAppointment(data: any) {
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/MyCart/AddPhysicianOrderToCart', reqData);
  }
  async CommercialEntityDataEntry(data: any) {
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Setup/CommercialEntityDataEntry', reqData);
  }
  async SaveGST(data: any) {
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Setup/GSTSetup', reqData);
  }
  async getItemList(data: any){
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Utility/MerchandiseSearch', reqData);
  }
  async saveDiscount12(data: any){
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Discount/Setup12', reqData);
  }
  async saveDiscount3(data: any){
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Discount/Setup3', reqData);
  }
  async getDiscount(){
    const reqData = await this.getReqObj('ANSU');
    return this.apiService.post('api/Discount/Initial', reqData);
  }
  async getDiscountList3(){
    const reqData = await this.getReqObj('ANSU');
    return this.apiService.post('api/Discount/CouponList', reqData);
  }
  async getDiscount12(data:any){
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Discount/DiscountList', reqData);
  }
  async DeleteDiscount3(data:any){
    const reqData = await this.getReqObj('ANSU',data);
    return this.apiService.post('api/Discount/Delete', reqData);
  }
  async UploadMed(data:any){
    return this.apiService.post('api/Medicine/Build', data);
  }
  async UploadHHI(data:any){
    return this.apiService.post('api/HouseholdItem/Build', data);
  }
}
