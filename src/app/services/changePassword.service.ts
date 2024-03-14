import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
@Injectable({
    providedIn: 'root'
})
export class ChangePasswordService {

    constructor(
        public helper: UtilityService,
        private apiService: ApiService,
        private commonService: CommonService,
    ) { }

    screenCode = "RSTP";

    async getReqObj(data: any, isLogin?: boolean) {
        const datas: any = {
            requestKeyDetails: await this.commonService.setRequestKeyDetails(this.screenCode, isLogin),
            apiRequest: data.apiRequest
        }
        if (data?.keyRequest?.userID) {
            datas.requestKeyDetails.userID = data.keyRequest.userID;
        }
        if (data?.keyRequest?.alternateUserID) {
            datas.requestKeyDetails.alternateUserID = data.keyRequest.alternateUserID;
        }
        return datas;
    }

    async changePassword(reqObj: any) {
        const reqData = await this.getReqObj(reqObj);
        reqData.apiRequest.userID = reqData.requestKeyDetails.userID;
        return this.apiService.post('api/Authentication/ChangePassword', reqData);
    }

    async resetPassword(reqObj: any) {
        const reqData = await this.getReqObj(reqObj, true);
        return this.apiService.post('api/Authentication/ResetPassword', reqData);
    }
}
