import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { CommonService } from './common.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    public notificationChangeInd = new BehaviorSubject<boolean>(false)
    constructor(
        public helper: UtilityService,
        private apiService: ApiService,
        private commonService: CommonService,
    ) { }

    screenCode = "MPFL";
    updateNotificationCount() {
        this.notificationChangeInd.next(true);
    }
    async getReqObj(data?: any) {
        const datas: any = {
            requestKeyDetails: await this.commonService.setRequestKeyDetails(this.screenCode),
            apiRequest: data ? data.apiRequest : {}
        }
        return datas;
    }

    async getLastUpdateInformation() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/Utility/GetUserMenuList', reqData);
    }

    async getUploadDocumentType() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/Utility/GetUploadDocumentType', reqData);
    }

    async getPersonalInformation() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetPersonalInformation', reqData);
    }

    async getCompanyInformation() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetCompanyInformation', reqData);
    }

    async getPhysicianCredentialsDetails() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetPhysicianCredentialDetails', reqData);
    }

    async getPreviousHospitalisationInfo() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetPreviousHospitalisationInfo', reqData);
    }

    async getBusinessInformation() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetBusinessInformation', reqData);
    }

    async GetDocumentList() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetDocumentList', reqData);
    }

    async getFamilyMedicalHistory() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/UserProfile/GetFamilyMedicalHistory', reqData);
    }

    async getGeneralMedicalInfo(data?: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/GetGeneralMedicalInfo', reqData);
    }

    async updatePersonalInformation(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdatePersonalInformation', reqData);
    }

    async updateCompanyInformation(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdateCompanyInformation', reqData);
    }
    async searchCommercialEntity(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/Utility/SearchCommercialEntity', reqData);
    }

    async updatePhysicianCredentials(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdatePhysicianCredentials', reqData);
    }

    async updatePreviousHospitalisationInfo(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdatePreviousHospitalisationInfo', reqData);
    }

    async updateDocument(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UploadUserDocument', reqData);
    }

    async updateBusinessInformation(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdateBusinessInformation', reqData);
    }

    async updateFamilyMedicalHistory(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdateFamilyMedicalHistory', reqData);
    }

    async insertGeneralMedicalInformation(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/InsertGeneralMedicalInformation', reqData);
    }

    async updateAlternateUserID(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/UserProfile/UpdateAlternateUserID', reqData);
    }

    async GetWalletBalance(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/Wallet/Balance', reqData);
    }
    
    async GetCartItemCount(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/Order/CartItemCount', reqData);
    }

    async getFamilyRelationList() {
        const reqData = await this.getReqObj();
        return this.apiService.post('api/Value/Relationship', reqData);
    }

    async GetNotification(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/AppNotification/Get', reqData);
    }
    async NotificationRead(data: any) {
        const reqData = await this.getReqObj(data);
        return this.apiService.post('api/AppNotification/Read', reqData,false,true);
    }
}
