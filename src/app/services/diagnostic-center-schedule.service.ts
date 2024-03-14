import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticCenterScheduleService {

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

  async getAllDepartmentCodeList() {
    const reqData = await this.getReqObj("DCSS");
    return this.apiService.post('api/Utility/GetAllDepartmentCode', reqData);
  }

  async addHolidaySchedules(data: any) {
    const reqData = await this.getReqObj("DCSS", data);
    return this.apiService.post('api/DiagnosticCentre/AddHoliday', reqData);
  }

  async addDignosticCenterSchedule(data: any) {
    const reqData = await this.getReqObj("DCSS", data);
    return this.apiService.post('api/DiagnosticCentre/AddSchedule', reqData);
  }

  async GetDiagnosticCentreDetails(data: any) {
    const reqData = await this.getReqObj("DCSS",data);
    return this.apiService.post('api/Utility/GetDiagnosticCentreDetails', reqData);
  }
  async GetDiagnosticCentreScheduleDetails(data: any) {
    const reqData = await this.getReqObj("DCSS",data);
    return this.apiService.post('api/DiagnosticCentre/GetSchedule', reqData);
  }

  async getCommercialIDList(data: any) {
    const reqData = await this.getReqObj('DCSS', data);
    return this.apiService.post('api/UserProfile/GetCommercialIDList', reqData);
  }
}
