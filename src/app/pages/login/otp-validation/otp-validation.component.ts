import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { STATIC_DATA } from '@constant/constants';
import { ChangePasswordService } from '@services/changePassword.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LoginService } from '@services/login.service';
import { UtilityService } from '@services/utility.service';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otp-validation',
  templateUrl: './otp-validation.component.html',
  styleUrls: ['./otp-validation.component.css']
})
export class OtpValidationComponent implements OnInit {

  public otpParam: FormGroup;

  otpEye: boolean = true;
  otpError: string = "";
  errorMessage: any = {};
  showSuccess: boolean = false;
  otpResponseError: string = "";
  // transactionID: string = "";
  interval: any;
  resendOtpTime: number;
  resendOtp: boolean = false;
  @Input() formData: any;
  @Input() screenCode: string;
  @Input() transactionID: string;
  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: NgOtpInputComponent;
  @Output()
  closeOTP: EventEmitter<{}> = new EventEmitter<{}>();
  @Output()
  resetLogin: EventEmitter<{}> = new EventEmitter<{}>();
  config: NgOtpInputConfig = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    containerClass: 'otpInput',
    inputClass: 'otpInput',
    inputStyles: {
      background: '#F2ECFF',
      border: '1px solid rgba(113, 59, 219, 0.18)',
      'box-shadow': '0px 11px 34px -5px rgb(113 59 219 / 21%)',
      'border-radius': '10px',
      outline: 'none',
      padding: '10px',
      'font-family': 'Poppins',
      'font-style': 'normal',
      'font-weight': '500',
      'font-size': '20px',
      color: '#713BDB'
    }
  };

  termsAndConditionsForm: FormGroup;
  termsAndConditions: boolean = false;
  userIp: any;

  // DropDown Action---->
  isOpenTermsCon: boolean = true;
  isOpenDataPrivacy: boolean = false;
  isOpenRefundCancellation: boolean = false;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    public loginService: LoginService,
    public helper: UtilityService,
    private commonService: CommonService,
    private router: Router,
    private toastr: ToastrService,
    private chPassService: ChangePasswordService,
  ) {
    this.otpParam = this.fb.group({
      otp: ['', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]]
    });
    this.termsAndConditionsForm = this.fb.group({
      place: ['', Validators.required],
      date: [new Date()],
      termsAndConditionsInd: [false]
    })
    this.userIp = this.commonService.getIP()
      .then(async (res: any) => {
        this.userIp = res;
      })
      .catch((err: any) => {
      });
    this.resendOtpTime = 60;
  }

  ngOnInit(): void {
    this.setValidators();
    this.intializingMessage();
    this.onChanges();
    if (this.screenCode === "FGTP") {
      this.generateOTP();
    }
    this.startTimer();
  }

  async generateOTP() {
    const reqData = {
      apiRequest:
      {
        userID: this.formData.contactNo.length === 10 && !isNaN(this.formData.contactNo) ? this.formData.contactNo : '',
        alternateUserID: this.formData.contactNo.length === 10 && !isNaN(this.formData.contactNo) ? '' : this.formData.contactNo,
        functionName: this.screenCode === "FGTP" ? "ResetPassword" : this.screenCode === "SGCU" ? "CommercialUserSignup" : "RegularUserSignup"
      },
      keyRequest:
      {
        userID: this.formData.contactNo.length === 10 && !isNaN(this.formData.contactNo) ? this.formData.contactNo : '',
        alternateUserID: this.formData.contactNo.length === 10 && !isNaN(this.formData.contactNo) ? '' : this.formData.contactNo,
        screenCode: this.screenCode,
      }
    }
    await this.loginService.generateOtp(reqData)
      .then(async (res: any) => {
        if (res?.apiResponse?.transactionID) {
          this.transactionID = res.apiResponse.transactionID;
        }
      })
      .catch((err: any) => {
      })
  }

  reserError() {
    this.otpError = "";
  }

  onChanges(): void {
    this.otpParam.valueChanges.subscribe(val => {
      this.reserError();
    });
  }

  intializingMessage() {
    // call api to set the error messages per block
    this.errorMessage.otp = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_OTP
    };
    this.errorMessage.place = {
      required: "Place is required"
    };
  }

  // This method will be use for any post extra validation added
  setValidators() {
    this.otpParam.controls["otp"].setValidators([
      Validators.required, Validators.maxLength(6), Validators.minLength(6)
    ]);
    this.otpParam.controls["otp"].updateValueAndValidity();
  }

  async handleOtp(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.otpParam);
    this.reserError();
    if (isValid) {
      const reqFormData = { ...this.formData };
      const reqData = {
        apiRequest: reqFormData,
        keyRequest:
        {
          userID: reqFormData.contactNo.length === 10 && !isNaN(reqFormData.contactNo) ? reqFormData.contactNo : '',
          alternateUserID: reqFormData.contactNo.length === 10 && !isNaN(reqFormData.contactNo) ? '' : reqFormData.contactNo,
          screenCode: this.screenCode,
        }
      }
      reqData.apiRequest.otpTransactionID = this.transactionID
      reqData.apiRequest.userOTP = data.otp
      if (this.screenCode === "FGTP") {
        delete reqData.apiRequest.contactNo;
        await this.chPassService.resetPassword(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              localStorage.clear();
              this.showSuccess = true;
              this.toastr.success("Password updated successfully, please login to continue");
              this.closePasswordPopup();
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
              this.navigate();
            }
          })
          .catch((err: any) => {
            this.otpResponseError = err.error.message;
          })
      } else {
        this.openTermsAndConditions()
      }
    }
  }

  openTermsAndConditions() {
    this.termsAndConditions = true;
  }
  closeTermsAndConditions() {
    this.termsAndConditions = false;
  }

  async signUp(data: any) {
    if (data === 'S' && this.termsAndConditionsForm.getRawValue().termsAndConditionsInd || data === 'D' && !this.termsAndConditionsForm.getRawValue().termsAndConditionsInd) {
      this.formService.markFormGroupTouched(this.termsAndConditionsForm)
      if (this.termsAndConditionsForm.valid) {
        const data = this.otpParam.value;
        const reqFormData = {
          ...this.formData,
          termsConditionsAcceptanceDetails: {
            customerName: `${this.formData.firstName}${this.formData.middleName ? ' ' + this.formData.middleName : ''} ${this.formData.lastName}`,
            acceptanceIndicator: this.termsAndConditionsForm.getRawValue().termsAndConditionsInd ? 'Y' : 'N',
            customerLocation: this.termsAndConditionsForm.getRawValue().place,
            customerIPAddress: this.userIp.ip,
            acceptanceDate: this.termsAndConditionsForm.getRawValue().date,
            acceptanceTimestamp: this.termsAndConditionsForm.getRawValue().date.toISOString(),
            termsConditionsFileID: '',
          },
        };
        const reqData = {
          apiRequest: reqFormData,
          keyRequest:
          {
            userID: reqFormData.contactNo.length === 10 && !isNaN(reqFormData.contactNo) ? reqFormData.contactNo : '',
            alternateUserID: reqFormData.contactNo.length === 10 && !isNaN(reqFormData.contactNo) ? '' : reqFormData.contactNo,
            screenCode: this.screenCode,
          }
        }
        reqData.apiRequest.otpTransactionID = this.transactionID
        reqData.apiRequest.userOTP = data.otp
        reqData.apiRequest.currentLattitude = ""
        reqData.apiRequest.currentLongitude = ""
        await this.loginService.userSignUp(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              localStorage.clear();
              if (res.apiResponse.transactionResult === 'TERMS DECLINED') {
                this.showSuccess = true;
                this.toastr.warning("Terms & Conditions acceptance is mandatory to use Anamnesis platform.");
                this.closePasswordPopup();
              } else {
                this.showSuccess = true;
                this.toastr.success("User registered successfully, please login to continue");
                this.closePasswordPopup();
              }
            } else {
              this.closeTermsAndConditions()
              this.otpResponseError = res.anamnesisErrorList.anErrorList[0].errorMessage
            }
          })
          .catch((err: any) => {
            this.otpResponseError = err.error.message;
          })
      }
    }
  }

  navigate() {
    this.resetLogin.emit();
  }

  async resendOTP() {
    this.ngOtpInput.setValue('');
    this.otpParam.reset()
    this.generateOTP();
    this.resendOtpTime = 60;
    this.resendOtp = false;
    this.startTimer();
  }

  onOtpChange(val: any) {
    const { otp } = this.otpParam.controls;
    otp.patchValue(val);
    this.otpResponseError = "";
  }

  closePasswordPopup() {
    this.closeOTP.emit();
    localStorage.clear();
    if (this.showSuccess) {
      this.resetLogin.emit();
    }
  }

  startTimer() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.resendOtpTime > 1) {
        this.resendOtpTime--;
      } else {
        this.resendOtp = true;
      }
    }, 1000);
  }

  eyeChange() {
    this.otpEye = !this.otpEye;
    this.config.isPasswordInput = !this.config.isPasswordInput;
  }

  ToggleTermsAndConditions (type: String) {
    switch (type) {
      case 'T':
        this.isOpenTermsCon = !this.isOpenTermsCon
        if (this.isOpenTermsCon) {
          this.isOpenDataPrivacy = false
          this.isOpenRefundCancellation = false
        }
        break;
      case 'D':
        this.isOpenDataPrivacy = !this.isOpenDataPrivacy
        if (this.isOpenDataPrivacy) {
          this.isOpenTermsCon = false
          this.isOpenRefundCancellation = false
        }
        break;
      case 'R':
        this.isOpenRefundCancellation = !this.isOpenRefundCancellation
        if (this.isOpenRefundCancellation) {
          this.isOpenTermsCon = false
          this.isOpenDataPrivacy = false
        }
        break;

      default:
        break;
    }
    if(!this.isOpenTermsCon && 
      !this.isOpenDataPrivacy &&
      !this.isOpenRefundCancellation){
        if(type === 'T'){
          this.isOpenDataPrivacy = true;
        }else if(type === 'D'){
          this.isOpenRefundCancellation =true;
        }
        else{
          this.isOpenTermsCon = true
        }
      }
  }
}
