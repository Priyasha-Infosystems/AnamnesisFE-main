import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralMedicalInfoService {

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

  async PatientArrival(data: any){
    const reqData = await this.getReqObj('GMIU',data);
    return this.apiService.post('api/HealthClinic/PatientArrival', reqData);
  }
  async medicalGeneralInfoSave(data: any){
    const reqData = await this.getReqObj('GMIU',data);
    return this.apiService.post('api/UserProfile/InsertGeneralMedicalInformation', reqData);
  }
  async GMIStatusUpdate(data: any){
    const reqData = await this.getReqObj('GMIU',data);
    return this.apiService.post('api/HealthClinic/GMIStatusUpdate', reqData);
  }

  async GetDiagnosticCentreDetails(data: any) {
    const reqData = await this.getReqObj("GMIU",data);
    return this.apiService.post('api/Utility/GetDiagnosticCentreDetails', reqData);
  }
  async getAppointmentList(data: any) {
    const reqData = await this.getReqObj("GMIU",data);
    return this.apiService.post('api/HealthClinic/AppointmentList', reqData);
  }
}
