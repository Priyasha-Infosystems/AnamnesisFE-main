import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { ApiService } from './api.service';
import { LocalStorageService } from './localService/localStorage.service';
import { BASE_IMAGE_URL_FOR_TEST, LOCAL_STORAGE } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { commercialTypeDetails, isCommercialDetailsFetched, isUserMenuListFetched, isUtilityExecuted, restrictedDrugDetails, userMenuLists, utility } from 'src/store/actions/utility.actions';
import { DeviceUUID } from "device-uuid";
import { Router } from '@angular/router';
import { setUserID } from 'src/store/actions/profile.actions';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private apiRequestKeyDetails: any = {}
  isUtilityExecuted: boolean = false;
  uuid: any
  stateUserId: string = ""
  isReload: boolean = false
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_TEST;
  constructor(
    public helper: UtilityService,
    private apiService: ApiService,
    private localStorageService: LocalStorageService,
    private store: Store<any>,
    private router: Router,
    private date: DatePipe,
  ) {
    this.store.subscribe(store => {
      this.apiRequestKeyDetails = store.loginState.userProfile
      this.stateUserId = store.profileState.userId
    })
    this.uuid = new DeviceUUID().get() || "";
    var du = new DeviceUUID().parse();
    var dua = [
      du.language,
      du.platform,
      du.os,
      du.cpuCores,
      du.isAuthoritative,
      du.silkAccelerated,
      du.isKindleFire,
      du.isDesktop,
      du.isMobile,
      du.isTablet,
      du.isWindows,
      du.isLinux,
      du.isLinux64,
      du.isMac,
      du.isiPad,
      du.isiPhone,
      du.isiPod,
      du.isSmartTV,
      du.pixelDepth,
      du.isTouchScreen
    ];
    var uuid = du.hashMD5(dua.join(':'));
  }


  async setRequestKeyDetails(scrnCode?: string, isLoginModule?: boolean) {
    const keyDetails: any = {
      applicationID: "A",
      userType: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_TYPE) || "",
      userID: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "",
      apiKey: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN) || "",
      alternateUserID: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.ALTERNATE_USER_ID) || "",
      enrolmentStatus: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.ENROLMENT_STATUS) || "",
      currentRole: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.CURRENT_ROLE) || "",
      userCode: isLoginModule ? "" : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "",
      userRoleCount: isLoginModule ? 0 : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ROLE_COUNT) || 0,
      userRoleList: isLoginModule ? [] : await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.ROLE_DETAILS_LIST) || [],
      screenCode: scrnCode ? scrnCode : "",
      transactionID: `TRN${new Date().getTime()}${scrnCode ? scrnCode : ''}`,
      senescenceCareUserID: '',
      senescenceCareUserCode: '',
      senescenceCareUserType: 'N',
      deviceID: this.uuid
    }
    if (this.stateUserId === "" && !isLoginModule) {
      this.store.dispatch(new setUserID(keyDetails.userID));
    }
    if (!isLoginModule && keyDetails.apiKey === "") {
      this.router.navigate(['/un-authorised-pages'], { skipLocationChange: true });
      this.helper.handleClearStore();
      return
    }
    if (this.stateUserId !== keyDetails.userID && !isLoginModule) {
      if (!this.isReload) {
        location.reload();
        this.isReload = true
      }
    }
    return keyDetails;
  }

  isApiError(response: any) {
    if (!response.anamnesisErrorList || (response.anamnesisErrorList.anErrorCount > 0 && response.anamnesisErrorList.anErrorList.length > 0)) {
      return true;
    }
    return false;
  }

  async getUtilityService(scrnCode?: string, isLoginModule?: boolean) {
    const reqData = {
      requestKeyDetails: await this.setRequestKeyDetails(scrnCode, isLoginModule),
      apiRequest:
      {
        downloadIndicator: "YYYYYY"
      }
    }
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (!this.isUtilityExecuted && !val.executedUtility) {
        this.isUtilityExecuted = true;
        await this.apiService.post('api/Utility/GetAllStaticData', reqData)
          .then(async (res: any) => {
            if (res.apiResponse) {
              this.store.dispatch(new utility(res.apiResponse));
              this.store.dispatch(new isUtilityExecuted(true));
            }
          })
          .catch((err: any) => {
          })
      }
    })
  }

  checkUserNumber(input: string) {
    let response = true;
    const checkerValue = '0123456789';
    if (input) {
      for (let index = 0; index < input.length; index++) {
        if (checkerValue.indexOf(input.substring(index, index + 1)) < 0) {
          response = false;
        }
      }
    }
    return response;
  }

  checkDecimalNumber(input: string) {
    let response = true;
    const checkerValue = '0123456789.';
    if (input) {
      for (let index = 0; index < input.length; index++) {
        if (checkerValue.indexOf(input.substring(index, index + 1)) < 0) {
          response = false;
        }
      }
    }
    if(response){
      let dotCount = 0
      for (let index = 0; index < input.length; index++) {
        if (input[index]=== '.') {
          dotCount = dotCount+1;
        }
      }
      if(dotCount>1){
        response = false;
      }
    }
    return response;
  }
  checkDecimalNumberwithSlash(input: string) {
    let response = true;
    const checkerValue = '0123456789./';
    if (input) {
      for (let index = 0; index < input.length; index++) {
        if (checkerValue.indexOf(input.substring(index, index + 1)) < 0) {
          response = false;
        }
      }
    }
    return response;
  }

  async getCommercialTypes() {
    const reqData = {
      requestKeyDetails: await this.setRequestKeyDetails('MPFL', true)
    }
    await this.apiService.post('api/Utility/GetAllCommercialType', reqData)
      .then(async (res: any) => {
        if (res.apiResponse) {
          this.store.dispatch(new commercialTypeDetails(res.apiResponse.commercialTypeList));
          this.store.dispatch(new isCommercialDetailsFetched(true));
        }
      })
      .catch((err: any) => {
      })
  }

  calculateAge(data: any) {
    if (data) {
      const date = new Date(data)
      let timeDiff = Math.abs(Date.now() - date.getTime());
      const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25)
      return `${age} ${age > 1 ? 'Years' : 'Year'}`;
    } else {
      return 'Not Specified'
    }

  }

  calculateGender(data: any) {
    switch (data) {
      case 'M':
        return 'Male'
        break;
      case 'F':
        return 'Female'
        break;
      case 'O':
        return 'Others'
        break;

      default:
        return 'Not Specified'
        break;
    }
  }

  async updateUserMenuList() {
    const reqData = {
      requestKeyDetails: await this.setRequestKeyDetails()
    }
    await this.apiService.post('api/Utility/GetUserMenuList', reqData)
      .then(async (res: any) => {
        if (res.apiResponse) {
          this.store.dispatch(new userMenuLists(res.apiResponse));
          this.store.dispatch(new isUserMenuListFetched(true));
        }
      })
      .catch((err: any) => {
      })
  }

  async singleFileDelete(data: any) {
    const reqData = {
      requestKeyDetails: await this.setRequestKeyDetails('MPFL'),
      apiRequest: data.apiRequest
    }
    return this.apiService.post('api/Utility/SingleFileDelete', reqData)
  }

  async getIP(){
    return this.apiService.get('https://ipinfo.io/json?token=487aee9687d8fe',false,false,true);
  }

  getDateList(startDate:any, endDate:any) {
    var retVal = [];
    var current = new Date(startDate);
    var lastDate = new Date(endDate)
    retVal.push(current);
    while (current < lastDate) {
    const newDate = new Date(current.setDate(current.getDate()+1))
     retVal.push(newDate);
     current = newDate;
    }
    return retVal;
  }

  async getRestrictedDrugsList(){
    let restrictedDrugList:any = []
    await this.store.pipe(select('commonUtility')).subscribe(async val => {
      if(val?.restrictedDrugDetailsList){
        restrictedDrugList = val?.restrictedDrugDetailsList
      }
    })
    if(!restrictedDrugList.length){
      const reqData: any = {
        apiRequest: {  }
      }
      await this.getRestrictedDrugsListApi(reqData)
        .then(async (res: any) => {
          if (!this.isApiError(res)) {
            await this.store.dispatch(new restrictedDrugDetails(res.apiResponse));
            await this.store.pipe(select('commonUtility')).subscribe(async val => {
              if(val?.restrictedDrugDetailsList){
                restrictedDrugList = val?.restrictedDrugDetailsList
              }
            })
          } 
        })
        .catch((err: any) => {
          if(err.status !== 401){
          // this.toastr.error("Medicine Details couldn't fetch due some error");
          }
        })
    }
       return restrictedDrugList;
    
  }

  async getRestrictedDrugsListApi(data: any) {
    const reqData = await this.getReqObj('ADNA', data);
    return this.apiService.post('api/DataEntry/RestrictedDrugList', reqData);
  }

  async getReqObj(screenCode?: string, data?: any) {
    const datas: any = {
      requestKeyDetails: await this.setRequestKeyDetails(screenCode),
      apiRequest: data ? data.apiRequest : {}
    }
    return datas;
  }
}
