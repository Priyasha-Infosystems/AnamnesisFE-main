import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  async getReqObj(data?: any) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(data.keyRequest.screenCode, true),
      apiRequest: data.apiRequest
    }
    if (data.keyRequest.userID) {
      datas.requestKeyDetails.userID = data.keyRequest.userID;
    }
    if (data.keyRequest.alternateUserID) {
      datas.requestKeyDetails.alternateUserID = data.keyRequest.alternateUserID;
    }
    return datas;
  }

  async login(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Authentication/Login', reqData);
  }

  async checkUser(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Utility/CheckUser', reqData);
  }

  async userSignUp(data: any) {
    const reqData = await this.getReqObj(data);
    if (data.keyRequest.screenCode === "SGRU") {
      return this.apiService.post('api/Authentication/REGSignup', reqData);
    } else {
      return this.apiService.post('api/Authentication/COMSignup', reqData);
    }
  }

  async generateOtp(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/Authentication/GenerateOTP', reqData);
  }

  resetPassword(data: any) {
    return this.apiService.post('api/users/resetPassword/', data);
  }

  getSecurityQuestion(data: any) {
    // return this.get(this.BASE_URL + '/users/resetPassword/', data, false);
  }

  async getAllCommercialType() {
    const datas: any = {
      requestKeyDetails: {},
    }
    return this.apiService.post('api/Utility/GetAllCommercialType', datas);
  }
  async logOut() {
    const reqData: any = {
      requestKeyDetails: {},
      apiRequest: {}
    }
    reqData.requestKeyDetails = await this.commonService.setRequestKeyDetails('', true)
    return this.apiService.post('api/Authentication/Logoff', reqData);
  }

  async getCampaignMessage() {
    const reqData: any = {
      requestKeyDetails: {},
      apiRequest: {}
    }
    reqData.requestKeyDetails = await this.commonService.setRequestKeyDetails('LGNP', true)
    return this.apiService.post('api/CampaignMesaage/GetCampaignMessage', reqData);
  }
}
