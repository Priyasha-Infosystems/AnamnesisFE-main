import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizePrescriptionService {

  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  screenCode = "ATPR";

  async getReqObj(data?: any) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(this.screenCode),
      apiRequest: data ? data.apiRequest : {}
    }
    return datas;
  }

  async getPrescriptionList(data?: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Patient/GetPrescriptionList', reqData);
  }

  async getLabTestReportList(data?: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Patient/GetLaboratoryTestReportList', reqData);
  }

  async getPhyLabTestReportList(data?: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Physician/PatientLaboratoryTestReportList', reqData);
  }

  async searchPhysician(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Utility/SearchPhysician', reqData);
  }

  async authorisePrescription(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Patient/AuthorisePhysician', reqData);
  }

  async fetchedAuthorizedList(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Patient/GetAuthorisedRecords', reqData);
  }

  async patientPrescriptionList(data?: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Physician/PatientPrescriptionList', reqData);
  }

}
