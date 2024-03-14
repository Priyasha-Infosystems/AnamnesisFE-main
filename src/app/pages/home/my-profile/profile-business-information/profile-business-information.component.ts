import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { UtilityService } from '@services/utility.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-business-information',
  templateUrl: './profile-business-information.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileBusinessInformationComponent implements OnInit {

  public profileBusinessInformationParam: FormGroup;
  profileBusinessInformationError: any = "";
  dataSet: boolean = false;
  errorMessage: any = {};
  commercialTypes: any = [];
  stateList: any = [];
  openDays: any = ["N", "N", "N", "N", "N", "N", "N"];
  commercialTypeSet: boolean = false;
  minTime: any = null

  public timePickerTheme: NgxMaterialTimepickerTheme;

  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
    private store: Store<any>,
    private utilityService: UtilityService,
  ) {
    this.timePickerTheme = this.utilityService.timePickerTheme;
    this.profileBusinessInformationParam = this.fb.group({
      addressCompliant: [''],
      commercialID: [''],
      companyID: [''],
      businessName: ['', [Validators.required]],
      commercialType: ['', [Validators.required]],
      openHourStart: ['', [Validators.required]],
      openHourEnd: ['', [Validators.required]],
      openDays: ['', [Validators.required]],
      businessPrimaryContactNo: ['', [Validators.required, Validators.pattern('[0-9]{10,10}')]],
      businessSecondaryContactNo: ['', [Validators.pattern('[0-9]{10,10}')]],
      actionIndicator: [''],
      businessAddress: this.fb.group({
        addressID: [''],
        addressIdentifier: ['My Work'],
        customerAddress: ['', [Validators.required]],
        customerCity: ['', [Validators.required]],
        customerContactNo: [''],
        customerCountry: ['India'],
        customerDefault: [''],
        customerLandmark: [''],
        customerName: [''],
        customerPincode: ['', [Validators.required, Validators.pattern('[0-9]{6,6}')]],
        customerStateCode: [''],
        customerStateName: ['', [Validators.required]],
        addressType: ['WORK'],
      })
    });
  }

  resetError() {
    this.profileBusinessInformationError = "";
  }

  onChanges(): void {
    this.profileBusinessInformationParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.getProfileBusinessInformation();
    this.onChanges()
    this.intializingMessage();
    this.getStateDetails();
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val?.executedUtility && val?.commercialDetailsList.length > 0 && !this.commercialTypeSet) {
        val?.commercialDetailsList.forEach((data: any) => {
          this.commercialTypes.push(data);
        });
        this.commercialTypeSet = true;
      }
    })
    // this.profileBusinessInformationParam.get('openHourStart')!.valueChanges.subscribe((res=>{
    //   this.profileBusinessInformationParam.get('openHourEnd')?.setValue('')
    // }))
  }

  setOpenHourStart(){
    this.profileBusinessInformationParam.get('openHourEnd')?.setValue('')
  }

  getStateDetails = async () => {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  intializingMessage() {
    this.errorMessage.businessName = {
      required: "Business name is required"
    };
    this.errorMessage.commercialType = {
      required: "Commercial type is required"
    };
    this.errorMessage.openHourStart = {
      required: "Start hour is required"
    };
    this.errorMessage.businessPrimaryContactNo = {
      required: "Phone number is required",
      pattern: "Please enter a valid number"
    };
    this.errorMessage.openHourEnd = {
      required: "End hour is required"
    };
    this.errorMessage.openDays = {
      required: "Open days is required"
    };
    this.errorMessage.customerAddress = {
      required: "Address is required"
    };
    this.errorMessage.customerCity = {
      required: "City is required"
    };
    this.errorMessage.customerStateName = {
      required: "State is required"
    };
    this.errorMessage.customerPincode = {
      required: "Pincode is required",
      pattern: "Please enter a valid PIN"
    };
    this.errorMessage.customerLandmark = {
      required: "Landmark is required"
    };
  }

  getProfileBusinessInformation = async () => {
    await this.profileService.getBusinessInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const businessData = { ...res.apiResponse };
          businessData.openHourStart =this.utilityService.timeFormateInto12Hours(businessData.openHourStart)
          businessData.openHourEnd = this.utilityService.timeFormateInto12Hours(businessData.openHourEnd)
          this.minTime = businessData.openHourStart
          // this.profileBusinessInformationParam.get('openHourEnd')?.setValue(businessData.openHourEnd)
          this.profileBusinessInformationParam.patchValue(businessData);
          if (businessData.openDays && businessData.openDays.length > 0) {
            this.openDays = businessData.openDays
          } else {
            this.dataSet = true;
          }
        } else {
          this.dataSet = true;
        }
      })
      .catch((err: any) => {
      })
  }

  getTwentyFourHourTime(amPmString: string) {
    var d = new Date("1/1/2013 " + amPmString);
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.profileBusinessInformationParam);
    this.resetError();
    if (isValid) {
      const reqData = {
        apiRequest: { ...data },
      }
      reqData.apiRequest.openHourStart = this.utilityService.timeFormateInto24Hours(reqData.apiRequest.openHourStart);
      reqData.apiRequest.openHourEnd = this.utilityService.timeFormateInto24Hours(reqData.apiRequest.openHourEnd);
      reqData.apiRequest.actionIndicator = data.businessAddress.addressID ? "UPD" : "ADD";
      reqData.apiRequest.businessAddress.customerStateCode = this.stateList.find((state: any) => state.stateName === data.businessAddress.customerStateName)?.stateCode;
      reqData.apiRequest.businessAddress.customerCountry = 'India';
      reqData.apiRequest.businessAddress.addressType = 'WORK';
      reqData.apiRequest.businessAddress.addressIdentifier = 'My Work'
      reqData.apiRequest.businessAddress.customerContactNo = data.businessPrimaryContactNo
      reqData.apiRequest.businessAddress.customerSecondaryContactNo = data.businessSecondaryContactNo
      await this.profileService.updateBusinessInformation(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
            this.ngOnInit();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.profileBusinessInformationError = err.error.message;
        })
    }
  }

  isDaysSelected(index: any) {
    if (this.openDays[index] === "Y") {
      return true;
    }
    return false
  }

  setSelectedDay(index: any) {
    if (this.openDays[index] === "N") {
      this.openDays[index] = "Y";
    } else {
      this.openDays[index] = "N";
    }
    this.profileBusinessInformationParam.controls["openDays"].setValue(this.openDays);
  }

  getControl(controlName: string) {
    const addressControl: any = this.profileBusinessInformationParam.controls['businessAddress']
    return addressControl.controls[controlName]
  }

  validateTime(time: any, isStart?: boolean) {
    const selectedTime = this.utilityService.get12FormatTimeIntoMinute(time)
    const endHour = this.profileBusinessInformationParam.get('openHourEnd')?.value !== "" ? this.utilityService.get12FormatTimeIntoMinute(this.profileBusinessInformationParam.get('openHourEnd')?.value) : 0
    if (isStart && selectedTime > endHour) {
      this.profileBusinessInformationParam.get('openHourEnd')?.setValue('')
    }
    if (isStart) {
      this.minTime = time
    }
  }

  resetTime(isStart?: boolean) {
    if (isStart) {
      this.profileBusinessInformationParam.get('openHourStart')?.setValue('')
    } else {
      this.profileBusinessInformationParam.get('openHourEnd')?.setValue('')
    }
  }

}
