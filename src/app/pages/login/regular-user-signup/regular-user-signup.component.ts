import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BASE_IMAGE_URL_FOR_CampaignPhotosDownlod } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { CustomValidators } from '@services/custom-validators';
import { FormService } from '@services/form.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { LoginService } from '@services/login.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import Swiper from 'swiper';

@Component({
  selector: 'app-regular-user-signup',
  templateUrl: './regular-user-signup.component.html',
  styleUrls: ['./regular-user-signup.component.css']
})
export class RegularUserSignupComponent implements OnInit {

  setOTPModal: boolean = false;
  public regSignUpParam: FormGroup;
  regFormError: string = "";
  errorMessage: any = {};
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  formData: any = {}
  passwordMissmatchError: boolean = false;
  stateList: any = [];
  screenCode: string = "SGRU";
  isShowPasswordPolicy: boolean = false;
  campaignMessagesList: any = [];
  imageList: any = [];
  transactionID: string = "";
  slides = [
    '../../../assets/images/silder-1.png',
    '../../../assets/images/silder-2.png',
  ];
  mySwiper: Swiper;
  idError: boolean = false;
  @Output()
  resetLogin: EventEmitter<{}> = new EventEmitter<{}>();
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formService: FormService,
    public loginService: LoginService,
    private localStorage: LocalStorageService,
    public helper: UtilityService,
    private commonService: CommonService,
    private store: Store<any>,
    private toastr: ToastrService,
  ) {
    this.getCampaignMessage();
    this.regSignUpParam = this.fb.group({
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: ['', [Validators.required]],
      physicianInd: [false],
      contactNo: ['', [Validators.required]],
      emailID: [''],
      addressLine: ['', [Validators.required]],
      landmark: [''],
      city: ['', [Validators.required]],
      stateName: ['', [Validators.required]],
      pinCode: ['', [Validators.required]],
      userPassword: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        CustomValidators.patternValidator(/[!@#$\^%&]/, { hasSpecialCharacters: true }),
        Validators.minLength(8)])
      ],
      confirmPassword: ['', [Validators.required]],
    });
  }

  resetError() {
    this.regFormError = "";
    this.passwordMissmatchError = false;
  }

  onChanges(): void {
    this.regSignUpParam.valueChanges.subscribe(val => {
      this.idError = false;
      this.resetError();
    });
  }

  setValidators() {
    this.regSignUpParam.controls["firstName"].setValidators([
      Validators.required, Validators.maxLength(50)
    ]);
    this.regSignUpParam.controls["middleName"].setValidators([
      Validators.maxLength(50)
    ]);
    this.regSignUpParam.controls["lastName"].setValidators([
      Validators.required, Validators.maxLength(50)
    ]);
    this.regSignUpParam.controls["addressLine"].setValidators([
      Validators.required, Validators.maxLength(200)
    ]);
    this.regSignUpParam.controls["city"].setValidators([
      Validators.required, Validators.maxLength(50)
    ]);
    this.regSignUpParam.controls["landmark"].setValidators([
      Validators.maxLength(50)
    ]);
    this.regSignUpParam.controls["emailID"].setValidators([
      Validators.maxLength(255), Validators.email
    ]);
    this.regSignUpParam.controls["contactNo"].setValidators([
      Validators.required, Validators.pattern('[0-9]{10,10}')
    ]);
    this.regSignUpParam.controls["contactNo"].updateValueAndValidity();
    this.regSignUpParam.controls["pinCode"].setValidators([
      Validators.required, Validators.pattern('[0-9]{6,6}')
    ]);
    this.regSignUpParam.controls["pinCode"].updateValueAndValidity();
    // this.regSignUpParam.controls["userPassword"].setValidators([
    //   Validators.required,
    //   Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
    // ]);
    // this.regSignUpParam.controls["userPassword"].updateValueAndValidity();
  }

  intializingMessage() {
    this.errorMessage.firstName = {
      required: "First name is required",
      maxLength: "First Name cannot be more than 50 characters"
    };
    this.errorMessage.middleName = {
      required: "Middle name is required",
      maxLength: "Middle Name cannot be more than 50 characters"
    };
    this.errorMessage.lastName = {
      required: "Last name is required",
      maxLength: "Last Name cannot be more than 50 characters"
    };
    this.errorMessage.emailID = {
      required: "Email Id is required",
      maxLength: "Email cannot be more than 255 characters",
      email: 'Please enter a valid email'
    };
    this.errorMessage.contactNo = {
      required: "Contact Number is required",
      pattern: "Please enter a valid number"
    };
    this.errorMessage.addressLine = {
      required: "Address is required",
      maxLength: "Address cannot be more than 200 characters"
    };
    this.errorMessage.city = {
      required: "City is required",
      maxLength: "City cannot be more than 200 characters"
    };
    this.errorMessage.stateName = {
      required: "State name is required"
    };
    this.errorMessage.landmark = {
      required: "Landmark is required"
    };
    this.errorMessage.pinCode = {
      required: "Pin code is required",
      pattern: "Please enter a valid PIN Code"
    };
    this.errorMessage.userPassword = {
      required: "Password is required",
      hasNumber: "Password policy does not matched",
      hasCapitalCase: "Password policy does not matched",
      hasSmallCase: "Password policy does not matched",
      maxlength: "Password policy does not matched",
      minlength: "Password policy does not matched",
      hasSpecialCharacters: "Password policy does not matched"
    };
    this.errorMessage.confirmPassword = {
      required: "Password is required"
    };
    this.errorMessage.landmark = {
      maxLength: "Landmark cannot be more than 50 characters"
    };
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService('LOGN', true);
    this.mySwiper = new Swiper('.swiper-container', {
      pagination: true,
      // paginationClickable: true,
      // nextButton: '.swiper-button-next',
      // prevButton: '.swiper-button-prev',
      autoplay: true,
      spaceBetween: 30
    });
    this.store.pipe(select('commonUtility')).subscribe(val => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
    this.setValidators();
    this.intializingMessage();
    this.onChanges()
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

  getUrl(fileName: any) {
    return BASE_IMAGE_URL_FOR_CampaignPhotosDownlod + fileName;
  }

  async generateOTP(data: any) {
    const reqData = {
      apiRequest:
      {
        userID: data.contactNo.length === 10 && !isNaN(data.contactNo) ? data.contactNo : '',
        alternateUserID: data.contactNo.length === 10 && !isNaN(data.contactNo) ? '' : data.contactNo,
        functionName: "RegularUserSignup"
      },
      keyRequest:
      {
        userID: data.contactNo.length === 10 && !isNaN(data.contactNo) ? data.contactNo : '',
        alternateUserID: data.contactNo.length === 10 && !isNaN(data.contactNo) ? '' : data.contactNo,
        screenCode: this.screenCode,
      }
    }
    await this.loginService.generateOtp(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res) && res?.apiResponse?.transactionID) {
          this.transactionID = res.apiResponse.transactionID;
          this.formData = { 
            ...data
           };
          this.formData.physicianInd = this.formData.physicianInd ? 1 : 0;
          this.formData.country = "India";
          this.formData.stateCode = this.stateList.find((state: any) => state.stateName === data.stateName)?.stateCode;
          this.setOTPModal = !this.setOTPModal;
        } else {
          if (res.anamnesisErrorList?.anErrorList[0]?.errorCode === "SGNP006E") {
            this.idError = true;
          } else {
            this.toastr.error("Something went wrong, Please try after sometime");
          }
        }
      })
      .catch((err: any) => {
      })
  }

  sendOTP(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.regSignUpParam);
    this.resetError();
    if (data.confirmPassword) {
      if (data.confirmPassword !== data.userPassword) {
        this.passwordMissmatchError = true;
        return;
      }
    }
    if (isValid) {
      this.generateOTP(data);
    }
  }

  closeOTP() {
    this.setOTPModal = !this.setOTPModal;
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  showHideConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigate() {
    this.resetLogin.emit();
  }

  showPasswordPolicies() {
    this.isShowPasswordPolicy = this.regSignUpParam.controls['userPassword'].status === 'INVALID'
  }

  hidePasswordPolicies() {
    this.isShowPasswordPolicy = false;
  }

  isAnyError() {
    if (!this.isShowPasswordPolicy && (this.regSignUpParam.controls['userPassword'].hasError('hasNumber') ||
      this.regSignUpParam.controls['userPassword'].hasError('hasCapitalCase') ||
      this.regSignUpParam.controls['userPassword'].hasError('hasSmallCase') ||
      this.regSignUpParam.controls['userPassword'].hasError('maxLength') ||
      this.regSignUpParam.controls['userPassword'].hasError('minlength') ||
      this.regSignUpParam.controls['userPassword'].hasError('hasSpecialCharacters'))) {
      return true
    }
    return false
  }

  isRequiredError() {
    if (!this.isShowPasswordPolicy && this.regSignUpParam.controls['userPassword'].hasError('required') && this.regSignUpParam.controls['userPassword'].touched) {
      return true
    }
    return false
  }
}