import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PhysicianCalendarService {

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

  async getPhysicianAppointmentList(data: any) {
    const reqData = await this.getReqObj('PHYC', data);
    return this.apiService.post('api/Physician/GetPhysicianAppointmentList', reqData);
  }

  async getHolidayList(data: any) {
    const reqData = await this.getReqObj('PHYC', data);
    return this.apiService.post('api/Calendar/Holiday', reqData);
  }

  async getDailySchedule(data: any) {
    const reqData = await this.getReqObj('PHYC', data);
    return this.apiService.post('api/Calendar/DailySchedule', reqData);
  }
}
