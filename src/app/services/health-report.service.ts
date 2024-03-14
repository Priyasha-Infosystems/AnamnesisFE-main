import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class HealthReportService {

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

  async patientTimeDuration(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/Patient/PatientTimeDuration', reqData);
  }

  async getLaboratoryTestReportDetails(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/Patient/GetLaboratoryTestReportDetails', reqData);
  }

  async getPhyLaboratoryTestReportDetails(data: any) {
    const reqData = await this.getReqObj('VMCT', data);
    return this.apiService.post('api/Physician/PatientLaboratoryTestDetails', reqData);
  }
}


