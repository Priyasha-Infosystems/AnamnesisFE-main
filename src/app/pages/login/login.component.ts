import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from 'src/app/services/form.service';
import { BASE_IMAGE_URL_FOR_CampaignPhotosDownlod, LOCAL_STORAGE, STATIC_DATA } from '@constant/constants';
import { LoginService } from '@services/login.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { UtilityService } from '@services/utility.service';
import { Login } from 'src/store/models/login';
import { Store } from '@ngrx/store';
import { isLoginClicked, userProfile } from 'src/store/actions/login.actions';
import Swiper from 'swiper';
import { CommonService } from '@services/common.service';
import { isProfileCompleted, setUserID } from 'src/store/actions/profile.actions';
import { isUserMenuListFetched, userMenuLists } from 'src/store/actions/utility.actions';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('carousel') carousel: ElementRef;
  errorMessage: any = {};
  loginError: string = "";
  passError: string = "";
  userError: string = "";
  showPassword: boolean = false;
  openModal: boolean = false;
  userLoginId: string = "";
  campaignMessagesList: any = [];
  imageList: any = [];
  isLogin: boolean = true
  isRegReg: boolean = false
  isComReg: boolean = false
  public loginParam: FormGroup;
  slides = [
    '../../../assets/images/silder-1.png',
    '../../../assets/images/silder-2.png',
  ];
  mySwiper: Swiper;
  imageObject: Array<object>;
  imageSize = {
    width: 200,
    height: 200
  }
  isClicked: boolean = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formService: FormService,
    public loginService: LoginService,
    private localStorage: LocalStorageService,
    public helper: UtilityService,
    private store: Store<{ login: Login }>,
    private commonService: CommonService,
    private apiService: ApiService,
  ) {
    this.getCampaignMessage();
    this.loginParam = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.store.dispatch(new isLoginClicked(true));
  }

  ngAfterViewInit(): void {
    setInterval(() => {
      if (this.imageList.length > 0 && !this.isClicked) {
        this.carousel.nativeElement.click();
        this.isClicked = true
      }
    }, 3000)
  }

  resetError() {
    this.loginError = "";
    this.passError = "";
    this.userError = "";
  }

  onChanges(): void {
    this.loginParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  userIdToLowerCase(data:string){
    if(data && data.length){
      this.loginParam.controls["userId"].setValue(data.toLowerCase())
    }
  }

  public async ngOnInit() {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService('LOGN', true);
    const token = await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN);
    if (token !== null) {
      this.router.navigate(['/home'], { skipLocationChange: true });
    } else {
      localStorage.clear();
      await this.localStorage.clearStorage();
      await this.localStorage.clearDataFromIndexedDB();
    }
    this.setValidators();
    this.intializingMessage();
    this.onChanges()

    this.mySwiper = new Swiper('.swiper-container', {
      pagination: true,
      // paginationClickable: true,
      // nextButton: '.swiper-button-next',
      // prevButton: '.swiper-button-prev',
      autoplay: true,
      spaceBetween: 30
    });
    this.imageObject = [{
      image: '../../../assets/images/silder-1.png',
      thumbImage: '../../../assets/images/silder-1.png',
      order: 1 //Optional: if you pass this key then slider images will be arrange according @input: slideOrderType
    }, {
      image: '../../../assets/images/silder-2.png', // Support base64 image
      thumbImage: '../../../assets/images/silder-2.png', // Support base64 image
    }
    ];
  }

  getCampaignMessage = async () => {
    this.loginService.getCampaignMessage()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.campaignMessagesList = res.apiResponse.campaignMessagesList;
          this.imageList = res.apiResponse.fileNameList;
        }
      })
      .catch((err: any) => {
      })
  }

  intializingMessage() {
    // call api to set the error messages per block
    this.errorMessage.userId = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_EMAIL
    };
    this.errorMessage.password = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_PASSWORD
    };
  }

  // This method will be use for any post extra validation added
  setValidators() {
    this.loginParam.controls["userId"].setValidators([
      Validators.required
    ]);
    this.loginParam.controls["userId"].updateValueAndValidity();
    this.loginParam.controls["password"].setValidators([
      Validators.required,
    ]);
    this.loginParam.controls["password"].updateValueAndValidity();
  }

  getReqObj(data: any) {
    if (data.userId.length === 10 && !isNaN(data.userId)) {
      const reqObjData = {
        apiRequest:
        {
          userPassword: data.password
        },
        keyRequest:
        {
          userID: data.userId,
          screenCode: "LOGN",
        }
      }
      return reqObjData;
    } else {
      const reqObjData = {
        apiRequest:
        {
          userPassword: data.password
        },
        keyRequest:
        {
          alternateUserID: data.userId,
          screenCode: "LOGN",
        }
      }
      return reqObjData;
    }
  }

  getUserReqObj(data: any) {
    if (data.userId.length === 10 && !isNaN(data.userId)) {
      const reqObjData = {
        apiRequest:
        {
          userID: data.userId
        },
        keyRequest:
        {
          userID: data.userId,
          screenCode: "LOGN",
        }
      }
      return reqObjData;
    } else {
      const reqObjData = {
        apiRequest:
        {
          alternateUserID: data.userId
        },
        keyRequest:
        {
          alternateUserID: data.userId,
          screenCode: "LOGN",
        }
      }
      return reqObjData;
    }
  }

  

  async updateUserMenuList() {
    const reqData = {
      requestKeyDetails:  await this.commonService.setRequestKeyDetails()
    }
    await this.apiService.post('api/Utility/GetUserMenuList', reqData)
      .then(async (res: any) => {
        if (res.apiResponse) {
          this.store.dispatch(new userMenuLists(res.apiResponse));
          this.store.dispatch(new isUserMenuListFetched(true));
          const profileScreenDataList = res.apiResponse.userProfileSectionList
          let profileCompleted = 'Y';
          profileScreenDataList && profileScreenDataList.forEach((profile: any) => {
            if (profile.screenCode !== "MPFL") {
              if (profile.screenAvailability === "N") {
                profileCompleted = 'N';
              }
            }
          });
          if (profileCompleted === 'N') { 
            this.router.navigate(['/home/my-profile'], { skipLocationChange: true });
          } else {
            this.store.dispatch(new isProfileCompleted(true))
              this.router.navigate(['/home/welcome'], { skipLocationChange: true });
          }
        }
      })
      .catch((err: any) => {
      })
  }

  async login(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.loginParam);
    this.resetError();
    if (isValid) {
      const reqData = this.getReqObj(data);
      await this.loginService.login(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            localStorage.clear();
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.TOKEN,
              res.apiResponse.apiKey
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.USER_ID,
              res.apiResponse.userID
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.USER_CODE,
              res.apiResponse.userCode
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.ROLE_DETAILS_LIST,
              res.apiResponse.roleDetailsList
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.ALTERNATE_USER_ID,
              res.apiResponse.alternateUserID
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.CURRENT_ROLE,
              res.apiResponse.currentRole
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.ENROLMENT_STATUS,
              res.apiResponse.enrolmentStatus
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.USER_ROLE_COUNT,
              res.apiResponse.userRoleCount
            );
            await this.localStorage.setDataInIndexedDB(
              LOCAL_STORAGE.USER_TYPE,
              res.apiResponse.userType
            );
            this.store.dispatch(new userProfile(res.apiResponse));
            this.store.dispatch(new setUserID(res.apiResponse.userID));
            await this.updateUserMenuList()
          } else {
            this.loginError = res.anamnesisErrorList.anErrorList[0].errorMessage
          }
        })
        .catch((err: any) => {
          this.loginError = err.error.message;
        })
    }
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  openPopup = async (val: any) => {
    const param = this.loginParam.controls;
    const { userId } = param;
    if (userId?.status === "VALID") {
      const reqData = this.getUserReqObj(val)
      await this.loginService.checkUser(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res) && res.apiResponse.transactionResult === "Success") {
            this.openModal = true;
            this.userLoginId = userId.value;
          } else {
            this.userError = res.anamnesisErrorList.anErrorList.length > 0 ? res.anamnesisErrorList.anErrorList[0].errorMessage : "User ID could not found"
          }
        })
        .catch((err: any) => {
          this.loginError = err.error.message;
        })
    } else if (userId.value === "") {
      this.passError = "Please enter Contact Number or Alternate User ID before proceeding"
    } else {
      this.passError = "Please enter a valid Contact Number or Alternate User ID"
    }
  }

  closePopup() {
    this.openModal = false;
  }

  navigate(isRegular?: boolean) {
    if (isRegular) {
      this.isLogin = false
      this.isComReg = false
      this.isRegReg = true
    } else {
      this.isLogin = false
      this.isComReg = true
      this.isRegReg = false
    }
    this.ngOnInit()
  }

  resetLoginPage() {
    this.loginParam.reset();
    this.isLogin = true
    this.isComReg = false
    this.isRegReg = false
    this.ngOnInit()
  }

  getUrl(fileName: any) {
    return BASE_IMAGE_URL_FOR_CampaignPhotosDownlod + fileName;
  }
}
