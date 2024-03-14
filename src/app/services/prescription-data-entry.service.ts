import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionDataEntryService {

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
    const reqData = await this.getReqObj('GPDE',data);
    return this.apiService.post('api/MyCart/GetMedicineList', reqData);
  }

  async getLabTestList(data: any) {
    const reqData = await this.getReqObj('GPDE', data);
    return this.apiService.post('api/MyCart/GetLaboratoryTestList ', reqData);
  }

  async searchPhysician(data: any) {
    const reqData = await this.getReqObj('GPDE',data);
    return this.apiService.post('api/Utility/SearchPhysician', reqData);
  }
  async searchHealthClinic(data: any) {
    const reqData = await this.getReqObj('GPDE',data);
    return this.apiService.post('api/Utility/SearchHealthClinic', reqData);
  }
  async searchPatient(data: any) {
    const reqData = await this.getReqObj('GPDE',data);
    return this.apiService.post('api/Utility/SearchPatientName', reqData);
  }
  async SavePrescription(data: any) {
    const reqData = await this.getReqObj('GPDE',data);
    return this.apiService.post('api/Physician/GeneratePrescriptions', reqData);
  }
  async PhysicianGeneratePrescription(data: any) {
    const reqData = await this.getReqObj('GPPH',data);
    return this.apiService.post('api/Physician/PhysicianGeneratePrescription', reqData);
  }
  async generatePrescription(data: any) {
    const reqData = await this.getReqObj('GPDE',data);
    return this.apiService.post('api/Physician/GeneratePrescription', reqData);
  }
  async GetPrescriptions(data: any) {
    const reqData = await this.getReqObj('GPPH',data);
    return this.apiService.post('api/Physician/GetSavedPrescriptions', reqData);
  }

}
