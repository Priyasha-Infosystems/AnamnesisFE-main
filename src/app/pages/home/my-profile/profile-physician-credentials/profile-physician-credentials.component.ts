import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-physician-credentials',
  templateUrl: './profile-physician-credentials.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfilePhysicianCredentialsComponent implements OnInit {

  public physicianCredentialsParam: FormGroup;
  physicianCredentialsError: any = "";
  errorMessage: any = {};

  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
  ) {
    this.physicianCredentialsParam = this.fb.group({
      physicianQualification: ['', [Validators.required]],
      physicianSpecialisation: ['', [Validators.required]],
      registrationNumber: ['', [Validators.required]],
      registrationAuthority: ['', [Validators.required]],
    });
  }

  resetError() {
    this.physicianCredentialsError = "";
  }

  onChanges(): void {
    this.physicianCredentialsParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.getPhysicianCredentialDetails();
    this.onChanges()
    this.intializingMessage();
  }

  intializingMessage() {
    this.errorMessage.physicianQualification = {
      required: "Medical degree is required"
    };
    this.errorMessage.registrationAuthority = {
      required: "Registration authority is required"
    };
    this.errorMessage.registrationNumber = {
      required: "Registration number is required"
    };
    this.errorMessage.physicianSpecialisation = {
      required: "Specialization is required"
    };
  }

  getPhysicianCredentialDetails = async () => {
    await this.profileService.getPhysicianCredentialsDetails()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const physicanCredentials = { ...res.apiResponse };
          this.physicianCredentialsParam.patchValue(physicanCredentials)
        }
      })
      .catch((err: any) => {
      })
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.physicianCredentialsParam);
    this.resetError();
    if (isValid) {
      const reqData = {
        apiRequest: { ...data },
      }
      await this.profileService.updatePhysicianCredentials(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.physicianCredentialsError = err.error.message;
        })
    }
  }

}
