import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class LabtestReportUploadService {

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
    const reqData = await this.getReqObj("LTRC",data);
    return this.apiService.post('api/Utility/GetDiagnosticCentreDetails', reqData);
  }

  async searchPhysician(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/Utility/SearchPhysician', reqData);
  }
  async searchDiagnosticCentre(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/Utility/SearchDiagnosticCentre', reqData);
  }
  async searchPatient(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/Utility/SearchPatientName', reqData);
  }
  async searchAuthorisedSignatory(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/AuthorisedSignatory/Search', reqData);
  }
  async getLabtestList(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/MyCart/GetLaboratoryTestList', reqData);
  }
  async SearchLaboratoryTest(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/DataEntry/SearchLaboratoryTest', reqData);
  }
  async getSavedLabtest(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/DataEntry/GetLaboratoryTest', reqData);
  }
  async labtestSave(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/DataEntry/LaboratoryTest', reqData);
  }
  async labtestSubmit(data: any) {
    const reqData = await this.getReqObj('LTRA', data);
    return this.apiService.post('api/DataEntry/SubmitLaboratoryTest', reqData);
  }
}
