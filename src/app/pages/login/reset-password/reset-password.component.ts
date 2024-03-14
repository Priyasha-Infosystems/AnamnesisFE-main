import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LOCAL_STORAGE, STATIC_DATA } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { CustomValidators } from '@services/custom-validators';
import { FormService } from '@services/form.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { LoginService } from '@services/login.service';
import { SecurityQuestionService } from '@services/securityQuestions.service';
import { UtilityService } from '@services/utility.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../login.component.css']
})
export class ResetPasswordComponent implements OnInit {
  @Input() userId: any;
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  public resetPasswordParam: FormGroup;
  resetPassError: string = "";
  errorMessage: any = {};
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showSecAns: boolean = false;
  passwordMismatch: boolean = false;
  setOtpScreen: boolean = false;
  setQuestionsList: any = [];
  selectedSecurityQuestion: any = {};
  resetPassFormData: any = {};
  screenCode: any = "FGTP";
  isShowPasswordPolicy: boolean = false;
  secQuestionsFetched: boolean = false;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    public loginService: LoginService,
    public helper: UtilityService,
    public secQuestionService: SecurityQuestionService,
    private commonService: CommonService,
    private localStorage: LocalStorageService,
  ) {
    this.resetPasswordParam = this.fb.group({
      securityQestionAnswer: ['', [Validators.required]],
      password: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        CustomValidators.patternValidator(/[!@#$\^%&]/, { hasSpecialCharacters: true }),
        Validators.minLength(8)])
      ],
      confirmPassword: ['', [Validators.required]]
    });
  }

  resetError() {
    this.resetPassError = "";
    this.passwordMismatch = false;
  }

  onChanges(): void {
    this.resetPasswordParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  getUserReqObj() {
    if (this.userId.length === 10 && !isNaN(this.userId)) {
      const reqObjData = {
        apiRequest:
        {
          userID: this.userId
        },
        keyRequest:
        {
          userID: this.userId,
          screenCode: "LOGN",
        }
      }
      return reqObjData;
    } else {
      const reqObjData = {
        apiRequest:
        {
          alternateUserID: this.userId
        },
        keyRequest:
        {
          alternateUserID: this.userId,
          screenCode: "LOGN",
        }
      }
      return reqObjData;
    }
  }

  async GetUserSecQuestions() {
    const reqData = this.getUserReqObj()
    await this.secQuestionService.GetUserSecQuestions(reqData, true)
      .then(async (res: any) => {
        this.secQuestionsFetched = true
        if (!this.commonService.isApiError(res) && res.apiResponse.userSecQuestionsList.length > 0) {
          this.setQuestionsList = res.apiResponse.userSecQuestionsList;
          const random = Math.floor(Math.random() * this.setQuestionsList.length);
          this.selectedSecurityQuestion = this.setQuestionsList[random];
        } else {
          this.setQuestionsList = [];
          this.resetPasswordParam.disable()
        }
      })
      .catch((err: any) => {
      })
  }

  ngOnInit(): void {
    this.setValidators();
    this.intializingMessage();
    this.onChanges();
    this.GetUserSecQuestions();
  }

  intializingMessage() {
    // call api to set the error messages per block
    this.errorMessage.securityQestionAnswer = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_SECURITY_QUESTION
    };
    this.errorMessage.confirmPassword = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_PASSWORD
    };
    this.errorMessage.password = {
      required: "Password is required",
      hasNumber: "Password policy does not matched",
      hasCapitalCase: "Password policy does not matched",
      hasSmallCase: "Password policy does not matched",
      maxlength: "Password policy does not matched",
      minlength: "Password policy does not matched",
      hasSpecialCharacters: "Password policy does not matched"
    };
  }

  // This method will be use for any post extra validation added
  setValidators() {
    this.resetPasswordParam.controls["securityQestionAnswer"].setValidators([
      Validators.required
    ]);
    this.resetPasswordParam.controls["securityQestionAnswer"].updateValueAndValidity();
    this.resetPasswordParam.controls["confirmPassword"].setValidators([
      Validators.required,
    ]);
    this.resetPasswordParam.controls["confirmPassword"].updateValueAndValidity();
  }

  async resetPassword(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.resetPasswordParam);
    this.resetError();
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      this.passwordMismatch = true;
    }
    if (isValid && !this.passwordMismatch) {
      this.resetPassFormData = {
        secAnswer: data.securityQestionAnswer,
        confirmPassword: data.confirmPassword,
        newPassword: data.password,
        secQuestionID: this.selectedSecurityQuestion.secQuestionID,
        contactNo: this.userId
      }
      this.setOtpScreen = true;
    }
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  showHideConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  showHideSecAns() {
    this.showSecAns = !this.showSecAns;
  }

  closePasswordPopup() {
    this.close.emit();
    localStorage.clear();
  }

  showPasswordPolicies() {
    this.isShowPasswordPolicy = this.resetPasswordParam.controls['password'].status === 'INVALID'
  }

  hidePasswordPolicies() {
    this.isShowPasswordPolicy = false;
  }

  isAnyError() {
    if (!this.isShowPasswordPolicy && (this.resetPasswordParam.controls['password'].hasError('hasNumber') ||
      this.resetPasswordParam.controls['password'].hasError('hasCapitalCase') ||
      this.resetPasswordParam.controls['password'].hasError('hasSmallCase') ||
      this.resetPasswordParam.controls['password'].hasError('maxLength') ||
      this.resetPasswordParam.controls['password'].hasError('minlength') ||
      this.resetPasswordParam.controls['password'].hasError('hasSpecialCharacters'))) {
      return true
    }
    return false
  }

  isRequiredError() {
    if (!this.isShowPasswordPolicy && this.resetPasswordParam.controls['password'].hasError('required') && this.resetPasswordParam.controls['password'].touched) {
      return true
    }
    return false
  }
}
