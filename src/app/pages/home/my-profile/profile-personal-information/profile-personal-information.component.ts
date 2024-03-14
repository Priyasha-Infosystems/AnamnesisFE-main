import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { setProfileDetails } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-profile-personal-information',
  templateUrl: './profile-personal-information.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfilePersonalInformationComponent implements OnInit {

  public personalInformationParam: FormGroup;
  public currentDate: any;
  personalInformationError: any = "";
  errorMessage: any = {};
  showProfileAddress: boolean = false;
  stateList: any = [];
  requestKeyDetails:any;
  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private store: Store<any>,
  ) {
    this.getLocalTime();
    this.store.pipe(select('commonUtility')).subscribe(val => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
    this.personalInformationParam = this.fb.group({
      addressCompliant: [''],
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: ['', [Validators.required]],
      displayName: ['', [Validators.required]],
      maritialStatus: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required, Validators.pattern(
        /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/
      )]],
      emailID: [''],
      addressDetails: this.fb.group({
        addressID: [''],
        addressIdentifier: [''],
        customerAddress: ['', [Validators.required]],
        customerCity: ['', [Validators.required]],
        customerContactNo: [''],
        customerCountry: ['India'],
        customerDefault: [''],
        customerLandmark: [''],
        customerName: [''],
        customerPincode: ['', [Validators.required]],
        customerStateCode: [''],
        customerStateName: ['', [Validators.required]],
        addressType: ['HOME'],
      })
    });
  }

  getLocalTime() {
    const now = new Date(new Date().setFullYear(new Date().getFullYear()-18));
    const localDate = now.toLocaleDateString('en-US');
    const localTime = now.toLocaleTimeString();
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    this.currentDate = timestamp;
  }

  checkValidDate() {
    const dateControl = this.personalInformationParam.get('dateOfBirth');
    if (dateControl!.value && new Date(dateControl!.value).getTime() > this.currentDate) {
      dateControl!.setValue('')
    }
  }

  resetError() {
    this.personalInformationError = "";
  }

  onChanges(): void {
    this.personalInformationParam.valueChanges.subscribe(val => {
      this.resetError();
      this.checkValidDate();
    });
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getPersonalInformation();
    this.onChanges()
    this.intializingMessage();
  }

  intializingMessage() {
    this.errorMessage.firstName = {
      required: "First name is required"
    };
    this.errorMessage.middleName = {
      required: "Middle name is required"
    };
    this.errorMessage.lastName = {
      required: "Last name is required"
    };
    this.errorMessage.displayName = {
      required: "Display name is required"
    };
    this.errorMessage.emailID = {
      required: "Email ID is required"
    };
    this.errorMessage.maritialStatus = {
      required: "Maritial status is required"
    };
    this.errorMessage.gender = {
      required: "Gender is required"
    };
    this.errorMessage.dateOfBirth = {
      required: "Date of birth is required",
      pattern: "Please enter a valid date",
    };
    this.errorMessage.customerAddress = {
      required: "Address is required"
    };
    this.errorMessage.customerCity = {
      required: "City is required"
    };
    this.errorMessage.customerLandmark = {
      required: "Landmark is required"
    };
    this.errorMessage.customerPincode = {
      required: "Pin code is required"
    };
    this.errorMessage.customerStateName = {
      required: "State is required"
    };
  }

  getPersonalInformation = async () => {
    await this.profileService.getPersonalInformation()
      .then(async (res: any) => {
        const personalData = { ...res.apiResponse };
        personalData.gender = res.apiResponse.gender ? res.apiResponse.gender : "";
        personalData.maritialStatus = res.apiResponse.maritialStatus ? res.apiResponse.maritialStatus : "";
        this.personalInformationParam.patchValue(personalData);
        this.store.dispatch(new setProfileDetails(personalData));
        this.showProfileAddress = !personalData.addressCompliant ? true : false;
      })
      .catch((err: any) => {
      })
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.personalInformationParam);
    this.resetError();
    if (isValid) {
      const reqObjData = { ...data }
      reqObjData.addressDetails.customerStateCode = this.stateList.find((state: any) => state.stateName === data.addressDetails.customerStateName)?.stateCode;
      reqObjData.addressDetails.customerCountry = 'India';
      reqObjData.addressDetails.addressIdentifier = 'Home'
      reqObjData.addressDetails.customerName = data.displayName
      reqObjData.addressDetails.customerContactNo = this.requestKeyDetails.userID;
      const reqData = {
        apiRequest: reqObjData,
      }
      await this.profileService.updatePersonalInformation(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
            this.store.dispatch(new setProfileDetails(data));
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.personalInformationError = err.error.message;
        })
    }
  }

  getControl(controlName: string) {
    const addressControl: any = this.personalInformationParam.controls['addressDetails']
    return addressControl.controls[controlName]
  }

}
