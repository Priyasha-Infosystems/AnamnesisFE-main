import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionService {

  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  screenCode = "SCQS";

  async getReqObj(data?: any, isLogin?: boolean) {
    const datas: any = {
      requestKeyDetails: await this.commonService.setRequestKeyDetails(this.screenCode, isLogin),
      apiRequest: data ? data.apiRequest : {}
    }
    if (data?.keyRequest?.userID) {
      datas.requestKeyDetails.userID = data.keyRequest.userID;
    }
    if (data?.keyRequest?.alternateUserID) {
      datas.requestKeyDetails.alternateUserID = data.keyRequest.alternateUserID;
    }
    return datas;
  }

  async GetAllSecQuestions() {
    const reqData = await this.getReqObj();
    return this.apiService.post('api/SecurityQuestions/GetAllSecQuestions', reqData);
  }

  async GetUserSecQuestions(data?: any, isLogin?: boolean) {
    const reqData = await this.getReqObj(data, isLogin);
    return this.apiService.post('api/SecurityQuestions/GetAllUserSecQuestions', reqData);
  }

  async SecQuestionSetup(data: any) {
    const reqData = await this.getReqObj(data);
    return this.apiService.post('api/SecurityQuestions/SecQuestionSetup', reqData);
  }
}
