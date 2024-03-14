import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PhysicianScheduleService {
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
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Physician/GetPhysicianAppointmentList', reqData);
  }

  async addHolidaySchedules(data: any) {
    const reqData = await this.getReqObj("PHYS", data);
    return this.apiService.post('api/Physician/AddHoliday', reqData);
  }

  async searchPhysician(data: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Utility/SearchPhysician', reqData);
  }

  async searchHealthClinic(data: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Utility/SearchHealthClinic', reqData);
  }

  async GetDiagnosticCentreDetails(data: any) {
    const reqData = await this.getReqObj("PHYS", data);
    return this.apiService.post('api/Utility/GetDiagnosticCentreDetails', reqData);
  }

  async PhysicianScheduleSetup(data: any) {
    const reqData = await this.getReqObj("PHYS", data);
    return this.apiService.post('api/ManageUserSchedule/PhysicianScheduleSetup', reqData);
  }
  async GetPhysicianScheduleSetup(data: any) {
    const reqData = await this.getReqObj("PHYS", data);
    return this.apiService.post('api/ManageUserSchedule/GetPhysicianSchedule', reqData);
  }
  async GetDaliBusyHours(data: any) {
    const reqData = await this.getReqObj("PHYS", data);
    return this.apiService.post('api/ManageUserSchedule/GetPhysicianBusyHours', reqData);
  }
  async DaliBusyHoursSetup(data: any) {
    const reqData = await this.getReqObj("PHYS", data);
    return this.apiService.post('api/ManageUserSchedule/ProcessPhysicianBusyHours', reqData);
  }

  async confirmAppointmentCompletion(data: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Physician/ConfirmAppointmentCompletion', reqData);
  }

  async getUserSchedule(data?: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Patient/GetUserSchedule', reqData);
  }

  async addPhysicianOrderToCart(data?: any) {
    const reqData = await this.getReqObj('PHYS',data);
    return this.apiService.post('api/MyCart/AddPhysicianOrderToCart', reqData);
  }

  async generateAppointmentRequest(data?: any) {
    const reqData = await this.getReqObj('PHYS',data);
    return this.apiService.post('api/ManageUserSchedule/GenerateAppointmentRequest', reqData);
  }

  async LTASubmission(data?: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/ManageUserSchedule/LTASubmission', reqData);
  }

  async generateDiagnosticCentreSchedule(data?: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/ManageUserSchedule/GenerateDiagnosticCentreSchedule', reqData);
  }

  async GetLTADetails(data?: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/ManageUserSchedule/GetLTADetails', reqData);
  }

  async missedAppointment(data: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Patient/MissedAppointment', reqData);
  }

  async completionAppointment(data: any) {
    const reqData = await this.getReqObj('PHYS', data);
    return this.apiService.post('api/Patient/AppointmentCompletion', reqData);
  }

}
