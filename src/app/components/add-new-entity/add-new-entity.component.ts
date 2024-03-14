import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ANAMNESIS_SETUP_ERROR_MESSAGE } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { AnamnesisSetupServiceService } from '@services/anamnesis-setup-service.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { UtilityService } from '@services/utility.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-new-entity',
  templateUrl: './add-new-entity.component.html',
  styleUrls: ['./add-new-entity.component.css']
})
export class AddNewEntityComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  public showHealthClinicDetails: boolean = false;
  public selectedHealthClinicDetails: any;
  public healthClinicList: Array<any> = [];
  public searcedhealthClinic: any;
  public oldHealthClinicSearchValue: any;
  public timePickerTheme: NgxMaterialTimepickerTheme;
  public DiagnosticCenterFormGroup: FormGroup;
  public stateList: any = [];
  public addNewEntityMSG: any = '';
  public errorMessage: any = {};
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private utilityService: UtilityService,
    private anamnesisSetupServiceService: AnamnesisSetupServiceService,
    private store: Store<any>,
    private date: DatePipe,
  ) {
    this.timePickerTheme = this.utilityService.timePickerTheme;
    const opensDayArr = ["N", "N", "N", "N", "N", "N", "N"]
    this.DiagnosticCenterFormGroup = this.fb.group({
      commercialEntityName: ['', [Validators.required, Validators.minLength(3)]],
      commercialType: ['HLCLN'],
      commercialEntityAddressLine: ['', [Validators.required]],
      commercialEntityLandmark: [''],
      commercialEntityCity: ['', [Validators.required]],
      commercialEntityStateCode: ['', [Validators.required]],
      commercialEntityStateName: [''],
      commercialEntityPincode: ['', [Validators.required]],
      commercialEntityCountry: ['IND', [Validators.required]],
      commercialEntityContactNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      commercialEntityEmailID: ['', [Validators.required]],
      commercialEntityOpenTime: ['', [Validators.required]],
      commercialEntityCloseTime: ['', [Validators.required]],
      commercialEntityOpenDays: [opensDayArr],
      transactionResults: [''],
    })
    this.DiagnosticCenterFormGroup.get('commercialType')?.disable()
    this.getStateDetails();
    this.errorMessage.diagnosticCenterForm = {
      commercialEntityName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_dignosticCenterName,
        minlength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MINLENGTH_dignosticCenterName,
      },
      commercialEntityLandmark: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_location,
      },
      commercialEntityAddressLine: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_adsressLine,
      },
      commercialEntityCity: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_city,
      },
      commercialEntityStateCode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_stateCode,
      },
      commercialEntityPincode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_pinCode,
      },
      commercialEntityOpenTime: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_openingTime,
      },
      commercialEntityCloseTime: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_closingTime,
      },
      commercialType: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_commercialType,
      },
      commercialEntityContactNo: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_contactNo,
        maxLength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_contactNo,
        minLength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_contactNo,
      },
      commercialEntityEmailID: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_emailID,
      },
    }
  }

  getStateDetails = async () => {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  ngOnInit(): void {
    this.DiagnosticCenterFormGroup.get('commercialEntityContactNo')?.valueChanges.subscribe(res => {
      if (res) {
        if (res.length) {
          if (!this.commonService.checkUserNumber(res)) {
            this.DiagnosticCenterFormGroup.get('commercialEntityContactNo')?.setValue('')
          }
        }
      }
    })
  }

  isDaysSelected(index: any) {
    const openDays = this.DiagnosticCenterFormGroup.get('commercialEntityOpenDays')?.value
    if (openDays[index] === "Y") {
      return true;
    }
    return false
  }

  setSelectedDay(index: any) {
    const openDays = this.DiagnosticCenterFormGroup.get('commercialEntityOpenDays')?.value
    if (openDays[index] === "N") {
      openDays[index] = "Y";
    } else {
      openDays[index] = "N";
    }
    this.DiagnosticCenterFormGroup.controls["commercialEntityOpenDays"].setValue(openDays);
  }

  saveCommercialEntity = async () => {
    this.formService.markFormGroupTouched(this.DiagnosticCenterFormGroup)
    if (this.DiagnosticCenterFormGroup.valid) {
      const reqData: any = {
        apiRequest: this.DiagnosticCenterFormGroup.getRawValue()
      };
      let commercialEntityOpenDays = ''
      reqData.apiRequest.commercialEntityOpenDays.forEach((val: any) => {
        commercialEntityOpenDays = commercialEntityOpenDays + val
      })
      reqData.apiRequest.commercialEntityOpenDays = commercialEntityOpenDays;
      reqData.apiRequest.commercialEntityOpenTime = this.utilityService.timeFormateInto24Hours(reqData.apiRequest.commercialEntityOpenTime);
      reqData.apiRequest.commercialEntityCloseTime = this.utilityService.timeFormateInto24Hours(reqData.apiRequest.commercialEntityCloseTime);
      await this.anamnesisSetupServiceService.CommercialEntityDataEntry(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Health clinic has been added successfully')
            this.closePopup()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
        })
    }
  }

  clearDiagnosticCentreForm() {
    const opensDayArr = ["N", "N", "N", "N", "N", "N", "N"]
    this.DiagnosticCenterFormGroup.reset()
    this.DiagnosticCenterFormGroup.get('commercialEntityName')?.setValue('')
    // this.DiagnosticCenterFormGroup.get('commercialType')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityAddressLine')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityLandmark')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityStateCode')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityStateName')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityPincode')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityCountry')?.setValue('IND')
    this.DiagnosticCenterFormGroup.get('commercialEntityContactNo')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityEmailID')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityOpenTime')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityCloseTime')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialEntityOpenDays')?.setValue(opensDayArr)
    this.DiagnosticCenterFormGroup.get('transactionResults')?.setValue('')
  }

  selectStaeForDiagnosticCenter() {
    const state = this.stateList.find((res: any) => res.stateCode === this.DiagnosticCenterFormGroup.get('commercialEntityStateCode')?.value);
    this.DiagnosticCenterFormGroup.get('commercialEntityStateName')?.setValue(state.stateName);
  }

  closePopup(){
    this.close.emit()
  }

}
