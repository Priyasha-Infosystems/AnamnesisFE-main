import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STATIC_DATA } from '@constant/constants';
import { ChangePasswordService } from '@services/changePassword.service';
import { CommonService } from '@services/common.service';
import { CustomValidators } from '@services/custom-validators';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  public changePasswordParam: FormGroup;
  changePasswordError: string = "";
  errorMessage: any = {};
  showOldPassword: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordMissmatchError: boolean = false;
  isShowPasswordPolicy: boolean = false;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private chPassService: ChangePasswordService,
    private commonService: CommonService,
    private toastr: ToastrService,
  ) {
    this.changePasswordParam = this.fb.group({
      oldPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      newPassword: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        CustomValidators.patternValidator(/[!@#$\^%&]/, { hasSpecialCharacters: true }),
        Validators.minLength(8)])
      ],
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.setValidators();
    this.intializingMessage();
    this.onChanges()
  }

  setValidators() {
  }

  intializingMessage() {
    this.errorMessage.oldPassword = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_PASSWORD
    };
    this.errorMessage.confirmPassword = {
      required: STATIC_DATA.ERR_MSG_REQUIERD_PASSWORD
    };
    this.errorMessage.newPassword = {
      required: "Password is required",
      hasNumber: "Password policy does not matched",
      hasCapitalCase: "Password policy does not matched",
      hasSmallCase: "Password policy does not matched",
      maxlength: "Password policy does not matched",
      minlength: "Password policy does not matched",
      hasSpecialCharacters: "Password policy does not matched"
    };
  }

  resetError() {
    this.changePasswordError = "";
    this.passwordMissmatchError = false;
  }

  onChanges(): void {
    this.changePasswordParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  showHideConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  showHideOldPassword() {
    this.showOldPassword = !this.showOldPassword;
  }

  async handlePassword(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.changePasswordParam);
    this.resetError();
    if (data.confirmPassword) {
      if (data.confirmPassword !== data.newPassword) {
        this.passwordMissmatchError = true;
        return;
      }
    }
    if (isValid) {
      const reqData = {
        apiRequest: data,
      }
      await this.chPassService.changePassword(reqData)
        .then(async (res: any) => {
          window.scrollTo(0, 0);
          if (!this.commonService.isApiError(res)) {
            this.toastr.success("Password updated successfully");
            this.changePasswordParam.reset();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            this.changePasswordError = res.anamnesisErrorList.anErrorList[0].errorMessage;
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.changePasswordError = err.error.message;
          }
        })
    }
  }

  showPasswordPolicies() {
    this.isShowPasswordPolicy = this.changePasswordParam.controls['newPassword'].status === 'INVALID'
  }

  hidePasswordPolicies() {
    this.isShowPasswordPolicy = false;
  }

  isAnyError() {
    if (!this.isShowPasswordPolicy && (this.changePasswordParam.controls['newPassword'].hasError('hasNumber') ||
      this.changePasswordParam.controls['newPassword'].hasError('hasCapitalCase') ||
      this.changePasswordParam.controls['newPassword'].hasError('hasSmallCase') ||
      this.changePasswordParam.controls['newPassword'].hasError('maxLength') ||
      this.changePasswordParam.controls['newPassword'].hasError('minlength') ||
      this.changePasswordParam.controls['newPassword'].hasError('hasSpecialCharacters'))) {
      return true
    }
    return false
  }

  isRequiredError() {
    if (!this.isShowPasswordPolicy && this.changePasswordParam.controls['newPassword'].hasError('required') && this.changePasswordParam.controls['newPassword'].touched) {
      return true
    }
    return false
  }

}
