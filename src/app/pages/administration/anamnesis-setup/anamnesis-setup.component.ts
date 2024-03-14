import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ANAMNESIS_SETUP_ERROR_MESSAGE, BASE_IMAGE_URL, GENERATE_PRESCRIPTION_ERROR_MSG } from '@constant/constants';
import { AnamnesisSetupServiceService } from '@services/anamnesis-setup-service.service';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { IFile } from 'src/app/models/utility.models';
import { debounceTime } from 'rxjs';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { UtilityService } from '@services/utility.service';
import { PrescriptionDataEntryService } from '@services/prescription-data-entry.service';
import { LabelType, Options } from "@angular-slider/ngx-slider";
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-anamnesis-setup',
  templateUrl: './anamnesis-setup.component.html',
  styleUrls: ['./anamnesis-setup.component.css']
})
export class AnamnesisSetupComponent implements OnInit {
  public DetailsView: boolean = true;
  public activeMenue: string = '';
  public errorMessage: any = {};
  public RoleFormGroup: FormGroup;
  public LaboratoryFormGroup: FormGroup;
  public LabTestFormGroup: FormGroup;
  public DiagnosticCenterFormGroup: FormGroup;
  public PhysicianFormGroup: FormGroup;
  public AuthorisedSignatoryFormGroup: FormGroup;
  public roleList: Array<any> = [];
  public allDeliveryZoneList: Array<any> = [];
  public stateListForDelivery: Array<any> = [];
  public deliveryRegionList: Array<any> = [];
  public distributionZoneList: Array<any> = [];
  public deliveryZoneList: Array<any> = [];
  public labTestList: Array<any> = [];
  public specimenTypeList: Array<any> = [];
  public trendChartList: Array<any> = [];
  public departmentList: Array<any> = [];
  public measurementUnitNameList: Array<any> = [];
  public filteredLabTestCodeList: Array<any> = [];
  public diagnisticCenterFile: any = [];
  public fileError: any;
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL;
  public physicianOpenAddressModal: boolean = false;
  public stateList: any = [];
  public physicianAddNewAddress: boolean = true;
  public addressError:string = ''
  public physicianSelectedAddress: any = null;
  public physicianAddressTypeError: string = '';
  public physicianWorkAddressDetails: any;
  public physicianHomeAddressDetails: any;
  public physicianAddressType: string;
  public showHealthClinicDetails: boolean = false;
  public selectedHealthClinicDetails: any;
  public healthClinicList: Array<any> = [];
  public searcedhealthClinic: any;
  public oldHealthClinicSearchValue: any;
  public timePickerTheme: NgxMaterialTimepickerTheme;
  public PhysicianAppointmentForm: FormGroup;
  public HealthClinicListForAppointment: Array<any> = [];
  public searcHedhealthClinicForAppointment: any;
  public showHealthClinicDetailsForAppointment: boolean;
  public selectedHealthClinicDetailsForAppointment: any;
  public searcHealthClinicForAppointment: any;
  public PhysicianListForAppointment: Array<any> = [];
  public physicianSearchValueForAppointment: any;
  public showPhysicianDetailsForAppointment: boolean;
  public selectedPhysicianDetailsForAppointment: any;
  public searchedPhysicianForAppointment: any;
  public PatientListForAppointment: Array<any> = [];
  public PatientSearchValueForAppointment: any;
  public showPatientDetailsForAppointment: boolean;
  public selectedPatientDetailsForAppointment: any;
  public searcPatientForAppointment: any;
  public currentDate: any = new Date();
  public appointmentBookErrMSG: any = '';
  public roleChangeErrMSG: any = '';
  public addNewEntityMSG: any = '';
  public physicianErrMSG: any = '';
  public authorisedSignatoryErrMSG: any = '';
  public labTestPackagesErrMSG: any = '';
  public addLabtestErrMSG: any = '';
  public physicianedition: boolean = false
  // GST Start ---->
  public GSTErrMSG: any = '';
  public GstForm: FormGroup;
  // <-----  GST End
  // AnamnesisDiscount start--->
  public anamnesisDiscountForm: FormGroup;
  public couponCodeOptionListOfCouponCategory: any = [];
  public CouponCategory3DiscountList: any = [];
  public anamnesisDiscountDetails: any;
  public anamnesisDiscountList: any = [];
  public specialDiscountDetails: any;
  public specialDiscountList: any = [];

  CouponCategory1DateOptions: any = {};
  CouponCategory1DateValue: any;
  CouponCategory1HighValue: any;
  CouponCategory1HighValueLast: any;

  CouponCategory2DateOptions: any = {};
  CouponCategory2DateValue: any;
  CouponCategory2HighValue: any;
  CouponCategory2HighValueLast: any;

  CouponCategory3DateOptions: any = {};
  CouponCategory3DateValue: any;
  CouponCategory3HighValue: any;
  CouponCategory3HighValueLast: any;

  CouponCategory3DeletePopup: boolean = false;
  CouponCategory3DeleteObj: any;
  // <-----AnamnesisDiscount End

  // Data upload start -->
  dataUploadForm: FormGroup;
  medLastProcessedID: string = '';
  hhiLastProcessedID: string = '';
  // Data upload end -->
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private utilityService: UtilityService,
    private anamnesisSetupServiceService: AnamnesisSetupServiceService,
    private fileUploadService: FileUploadService,
    private store: Store<any>,
    private prescriptionDataEntryService: PrescriptionDataEntryService,
    private date: DatePipe,
    private spinner: NgxSpinnerService,
  ) {
    this.timePickerTheme = this.utilityService.timePickerTheme;
    this.intializingMedicineSeectionFormGroups();
    this.intializingMessage();
    let startDate = new Date();
    const monthFirstDate = new Date(`${this.date.transform(new Date(), 'yyyy-MM-dd')?.split('-')[0]}-${this.date.transform(new Date(), 'yyyy-MM-dd')?.split('-')[1]}-01`);
    const currentdate = new Date();
    if (currentdate > monthFirstDate) {
      startDate = new Date(monthFirstDate.setMonth(monthFirstDate.getMonth() + 1))
    }
    this.setTimeRenge(1, this.date.transform(startDate, 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
    this.setTimeRenge(2, this.date.transform(startDate, 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
    this.setTimeRenge(3, this.date.transform(startDate, 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.dataUploadForm.get('MED')?.get('userID')?.setValue(this.requestKeyDetails.userID)
      this.dataUploadForm.get('MED')?.get('userCode')?.setValue(this.requestKeyDetails.userCode)
      this.dataUploadForm.get('HHI')?.get('userID')?.setValue(this.requestKeyDetails.userID)
      this.dataUploadForm.get('HHI')?.get('userCode')?.setValue(this.requestKeyDetails.userCode)
    })
    this.RoleFormGroup.valueChanges.subscribe(res => {
      this.formService.markFormGroupUnTouched(this.RoleFormGroup)
    })
    this.RoleFormGroup.controls['userID'].valueChanges.subscribe(res => {
      if (res) {
        this.getUserName(res);
      }
    })
    this.LaboratoryFormGroup.valueChanges.subscribe(res => {
      this.filterLabTestCodeList();
    })
    this.getStateDetails();
    this.LabTestFormGroup.get('labTestComponentCheck')?.valueChanges.subscribe(res => {
      const length = this.labTestComponentList().length
      for (let index = 0; index < length; index++) {
        this.labTestComponentList().removeAt(index);
      }
      this.labTestComponentList()
      if (res === true) {
        this.LabTestFormGroup.get('normalRangeLow')?.setValue('');
        this.LabTestFormGroup.get('normalRangeLow')?.clearValidators();
        this.LabTestFormGroup.get('normalRangeLow')?.updateValueAndValidity();
        this.LabTestFormGroup.get('normalRangeHigh')?.setValue('');
        this.LabTestFormGroup.get('normalRangeHigh')?.clearValidators();
        this.LabTestFormGroup.get('normalRangeHigh')?.updateValueAndValidity();
        this.LabTestFormGroup.get('unit')?.setValue('');
        this.LabTestFormGroup.get('unit')?.clearValidators();
        this.LabTestFormGroup.get('unit')?.updateValueAndValidity();
        this.LabTestFormGroup.get('departmentCode')?.setValue('');
        this.LabTestFormGroup.get('departmentCode')?.clearValidators();
        this.LabTestFormGroup.get('departmentCode')?.updateValueAndValidity();
        this.LabTestFormGroup.get('banchMark')?.setValue('');
        this.LabTestFormGroup.get('banchMark')?.clearValidators();
        this.LabTestFormGroup.get('banchMark')?.updateValueAndValidity();
        this.LabTestFormGroup.get('nonNumeric')?.reset();
        this.addLabTestComponent();
      } else {
        this.labTestComponentList().clear()
        this.LabTestFormGroup.get('normalRangeLow')?.reset();
        this.LabTestFormGroup.get('normalRangeLow')?.setValidators([Validators.required]);
        this.LabTestFormGroup.get('normalRangeLow')?.updateValueAndValidity();
        this.LabTestFormGroup.get('normalRangeHigh')?.reset();
        this.LabTestFormGroup.get('normalRangeHigh')?.setValidators([Validators.required]);
        this.LabTestFormGroup.get('normalRangeHigh')?.updateValueAndValidity();
        this.LabTestFormGroup.get('unit')?.reset();
        this.LabTestFormGroup.get('unit')?.updateValueAndValidity();
        this.LabTestFormGroup.get('departmentCode')?.reset();
        this.LabTestFormGroup.get('departmentCode')?.setValidators([Validators.required]);
        this.LabTestFormGroup.get('departmentCode')?.updateValueAndValidity();
        this.LabTestFormGroup.get('banchMark')?.reset();
        this.LabTestFormGroup.get('banchMark')?.setValidators([Validators.required]);
        this.LabTestFormGroup.get('banchMark')?.updateValueAndValidity();
        this.LabTestFormGroup.get('nonNumeric')?.reset();
      }
    })

    this.LabTestFormGroup.get('resultType')?.valueChanges.subscribe(res => {
      if (res === 'V') {
        this.LabTestFormGroup.get('banchMark')?.reset();
        this.LabTestFormGroup.get('banchMark')?.setValidators([Validators.required]);
        this.LabTestFormGroup.get('banchMark')?.updateValueAndValidity();
        if (!this.LabTestFormGroup.get('labTestComponentCheck')?.enabled) {
          this.LabTestFormGroup.get('labTestComponentCheck')?.enable()
        }
        this.LabTestFormGroup.get('trendChartType')?.reset();
        this.LabTestFormGroup.get('trendChartType')?.setValidators([Validators.required]);
        this.LabTestFormGroup.get('trendChartType')?.updateValueAndValidity();
      } else {
        this.LabTestFormGroup.get('banchMark')?.setValue('');
        this.LabTestFormGroup.get('banchMark')?.clearValidators();
        this.LabTestFormGroup.get('banchMark')?.updateValueAndValidity();
        this.LabTestFormGroup.get('labTestComponentCheck')?.setValue(false);
        if (!this.LabTestFormGroup.get('labTestComponentCheck')?.disabled) {
          this.LabTestFormGroup.get('labTestComponentCheck')?.disable();
        }
        this.LabTestFormGroup.get('trendChartType')?.setValue('');
        this.LabTestFormGroup.get('trendChartType')?.clearValidators();
        this.LabTestFormGroup.get('trendChartType')?.updateValueAndValidity();
      }
    })

    this.PhysicianFormGroup.get('addressType')?.valueChanges.subscribe(res => {
      this.physicianAddressType = res;
    })
    this.PhysicianFormGroup.get('primaryContactNumber')?.valueChanges.subscribe(res => {
      if (res) {
        if (res.length) {
          if (!this.commonService.checkUserNumber(res)) {
            this.PhysicianFormGroup.get('primaryContactNumber')?.setValue('')
          }
        }
      }
    })
    this.PhysicianFormGroup.get('secondaryContactNumber')?.valueChanges.subscribe(res => {
      if (res) {
        if (res.length) {
          if (!this.commonService.checkUserNumber(res)) {
            this.PhysicianFormGroup.get('secondaryContactNumber')?.setValue('')
          }
        }
      }
    })

    this.PhysicianAppointmentForm.get('healthClinicName')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        if (response && response.length > 2 && this.PhysicianAppointmentForm.get('healthClinicSearch')?.value) {
          this.searcHedhealthClinicForAppointment = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.prescriptionDataEntryService.searchHealthClinic(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.healthClinicCount > 0) {
                this.HealthClinicListForAppointment = res.apiResponse.healthClinicDetailsViewList;
              } else {
                this.HealthClinicListForAppointment = [];
              }
            })
            .catch((err: any) => {
              this.HealthClinicListForAppointment = [];
            })
        }
      })
    this.PhysicianAppointmentForm.get('patientName')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        if (response && response.length > 2 && this.PhysicianAppointmentForm.get('patientSearch')?.value) {
          this.PatientSearchValueForAppointment = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.prescriptionDataEntryService.searchPatient(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.patientCount > 0) {
                this.PatientListForAppointment = res.apiResponse.patientDetailsViewList;
              } else {
                this.PatientListForAppointment = [];
              }
            })
            .catch((err: any) => {
              this.PatientListForAppointment = [];
            })
        }
      })
    this.PhysicianAppointmentForm.get('physicianName')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        if (response && response.length > 2 && this.PhysicianAppointmentForm.get('physicianSearch')?.value) {
          this.physicianSearchValueForAppointment = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.prescriptionDataEntryService.searchPhysician(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.physicianCount > 0) {
                this.PhysicianListForAppointment = res.apiResponse.physicianInformationList;
              } else {
                this.PhysicianListForAppointment = [];
              }
            })
            .catch((err: any) => {
              this.PhysicianListForAppointment = [];
            })
        }
      })
    this.DiagnosticCenterFormGroup.get('commercialEntityContactNo')?.valueChanges.subscribe(res => {
      if (res) {
        if (res.length) {
          if (!this.commonService.checkUserNumber(res)) {
            this.DiagnosticCenterFormGroup.get('commercialEntityContactNo')?.setValue('')
          }
        }
      }
    })
    this.RoleFormGroup.get('roleCode')?.valueChanges.subscribe(res => {
      if (res && (res === 'PHR' || res === 'DLA')) {
        if (!this.deliveryZoneList.length) {
          this.getDeliveryZoneList()
        }
        this.RoleFormGroup.get('deliveryRegion')?.setValue('')
        this.RoleFormGroup.get('deliveryRegion')?.setValidators([Validators.required])
        this.RoleFormGroup.get('deliveryRegion')?.updateValueAndValidity()
        this.RoleFormGroup.get('deliveryRegion')?.enable()
        this.RoleFormGroup.get('stateCode')?.setValue('')
        this.RoleFormGroup.get('stateCode')?.setValidators([Validators.required])
        this.RoleFormGroup.get('stateCode')?.updateValueAndValidity()
        this.RoleFormGroup.get('stateCode')?.disable()
        this.RoleFormGroup.get('distributionZone')?.setValue('')
        this.RoleFormGroup.get('distributionZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('distributionZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('distributionZone')?.disable()
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('deliveryZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('deliveryZone')?.disable()
      } else {
        this.RoleFormGroup.get('deliveryRegion')?.setValue('')
        this.RoleFormGroup.get('deliveryRegion')?.clearValidators()
        this.RoleFormGroup.get('deliveryRegion')?.updateValueAndValidity()
        this.RoleFormGroup.get('stateCode')?.setValue('')
        this.RoleFormGroup.get('stateCode')?.clearValidators()
        this.RoleFormGroup.get('stateCode')?.updateValueAndValidity()
        this.RoleFormGroup.get('distributionZone')?.setValue('')
        this.RoleFormGroup.get('distributionZone')?.clearValidators()
        this.RoleFormGroup.get('distributionZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.clearValidators()
        this.RoleFormGroup.get('deliveryZone')?.updateValueAndValidity()
      }
      this.roleChangeErrMSG = "";
    })
    this.RoleFormGroup.get('deliveryRegion')?.valueChanges.subscribe(res => {
      if (res) {
        this.RoleFormGroup.get('stateCode')?.setValue('')
        this.RoleFormGroup.get('stateCode')?.setValidators([Validators.required])
        this.RoleFormGroup.get('stateCode')?.updateValueAndValidity()
        this.RoleFormGroup.get('stateCode')?.enable()
        this.RoleFormGroup.get('distributionZone')?.setValue('')
        this.RoleFormGroup.get('distributionZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('distributionZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('distributionZone')?.disable()
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('deliveryZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('deliveryZone')?.disable()
        this.stateListForDelivery = []
        const deliveryRegion = this.allDeliveryZoneList.filter((value: any) => value.deliveryRegion === res)
        deliveryRegion.forEach((value: any) => {
          const tempState = {
            stateCode: value.stateCode,
            stateName: value.stateName
          }
          const find = this.stateListForDelivery.find((val: any) => val.stateCode === tempState.stateCode)
          if (!find) {
            this.stateListForDelivery.push(tempState)
          }
        })
      }else{
        this.RoleFormGroup.get('stateCode')?.setValue('')
        this.RoleFormGroup.get('distributionZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('stateCode')?.disable()
      }
    })
    this.RoleFormGroup.get('stateCode')?.valueChanges.subscribe(res => {
      if (res) {
        this.RoleFormGroup.get('distributionZone')?.setValue('')
        this.RoleFormGroup.get('distributionZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('distributionZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('distributionZone')?.enable()
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('deliveryZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('deliveryZone')?.disable()
        this.distributionZoneList = []
        const deliveryRegion = this.allDeliveryZoneList.filter((value: any) => value.stateCode === res && value.deliveryRegion === this.RoleFormGroup.getRawValue().deliveryRegion)
        deliveryRegion.forEach((value: any) => {
          const tempdistributionZone = {
            distributionZone: value.distributionZone,
            distributionZoneDescription: value.distributionZoneDescription
          }
          const find = this.distributionZoneList.find((val: any) => val.distributionZone === tempdistributionZone.distributionZone)
          if (!find) {
            this.distributionZoneList.push(tempdistributionZone)
          }
        })
      }else{
        this.RoleFormGroup.get('distributionZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('distributionZone')?.disable()
      }
    })
    this.RoleFormGroup.get('distributionZone')?.valueChanges.subscribe(res => {
      if (res) {
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.setValidators([Validators.required])
        this.RoleFormGroup.get('deliveryZone')?.updateValueAndValidity()
        this.RoleFormGroup.get('deliveryZone')?.enable()
        this.deliveryZoneList = []
        const deliveryRegion = this.allDeliveryZoneList.filter((value: any) => value.distributionZone === res && value.deliveryRegion === this.RoleFormGroup.getRawValue().deliveryRegion && value.stateCode === this.RoleFormGroup.getRawValue().stateCode)
        deliveryRegion.forEach((value: any) => {
          const tempdeliveryZone = {
            deliveryZone: value.deliveryZone,
            deliveryZoneDescription: value.deliveryZoneDescription
          }
          const find = this.deliveryZoneList.find((val: any) => val.deliveryZone === tempdeliveryZone.deliveryZone)
          if (!find) {
            this.deliveryZoneList.push(tempdeliveryZone)
          }
        })
      }else{
        this.RoleFormGroup.get('deliveryZone')?.setValue('')
        this.RoleFormGroup.get('deliveryZone')?.disable()
      }
    })
  }

  async getDeliveryZoneList() {
    if (!this.deliveryRegionList.length) {
      const reqData: any = {
        apiRequest: {}
      }
      await this.anamnesisSetupServiceService.getDeliveryZoneList(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.allDeliveryZoneList = res.apiResponse;
            this.allDeliveryZoneList.forEach((value: any) => {
              const deliveryRegionOption = {
                deliveryRegion: value.deliveryRegion,
                deliveryRegionDescription: value.deliveryRegionDescription
              }
              const find = this.deliveryRegionList.find((val: any) => val.deliveryRegion === deliveryRegionOption.deliveryRegion)
              if (!find) {
                this.deliveryRegionList.push(deliveryRegionOption)
              }
            })
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Delivery zone List couldn't fetch due some error");
          }
        })
    }

  }
  //Physician Start --->
  getStateDetails = async () => {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  manageAddress() {
    this.addressError = '';
    if (this.physicianAddressType === 'WORK') {
      this.physicianSelectedAddress = this.physicianWorkAddressDetails;
      if (this.physicianSelectedAddress) {
        this.physicianAddNewAddress = false;
      }
      this.physicianOpenAddressModal = true;
    } else if (this.physicianAddressType === 'HOME') {
      this.physicianSelectedAddress = this.physicianHomeAddressDetails;
      if (this.physicianSelectedAddress) {
        this.physicianAddNewAddress = false;
      }
      this.physicianOpenAddressModal = true;
    } else {
      this.physicianAddressTypeError = this.errorMessage.physicianForm.addressType.required;
      setTimeout(() => { this.physicianAddressTypeError = '' }, 1500);
    }
  }

  closeAddressPopup(data: any) {
    if (data) {
      if (data.addressType === 'WORK') {
        this.physicianWorkAddressDetails = data
      } else {
        this.physicianHomeAddressDetails = data
      }
    }
    this.physicianOpenAddressModal = false;
  }

  selectHealthClinic(healthClinic: any) {
    this.showHealthClinicDetails = true;
    this.selectedHealthClinicDetails = healthClinic;
    this.PhysicianFormGroup.get('healthClinicName')?.setValue(healthClinic.healthClinicName);
    this.PhysicianFormGroup.get('healthClinicSearch')?.setValue(false);
    this.PhysicianFormGroup.get('healthClinicName')?.disable();
  }

  unSelectHealthClinic = () => {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.PhysicianFormGroup.get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.PhysicianFormGroup.get('healthClinicSearch')?.setValue(false);
    this.PhysicianFormGroup.get('healthClinicName')?.enable();
  }

  selectHealthClinicForPrescription = () => {
    this.PhysicianFormGroup.get('healthClinicID')?.setValue(this.selectedHealthClinicDetails.healthClinicID);
    this.PhysicianFormGroup.get('healthClinicName')?.setValue(this.selectedHealthClinicDetails.healthClinicName);
    this.PhysicianFormGroup.get('healthClinicName')?.disable();
    this.PhysicianFormGroup.get('healthClinicSearch')?.setValue(false);
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
  }

  unSelectHealthClinicForPrescription = () => {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.PhysicianFormGroup.get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.PhysicianFormGroup.get('healthClinicID')?.setValue('');
    this.PhysicianFormGroup.get('healthClinicName')?.enable();
    this.PhysicianFormGroup.get('healthClinicSearch')?.setValue(false);
  }

  onTypeHealthClinicName = () => {
    this.PhysicianFormGroup.get('healthClinicSearch')?.setValue(true);
  }

  healthClinicSearch = async (searchKeyword: string) => {
    this.searcedhealthClinic = searchKeyword;
    if (searchKeyword && searchKeyword.length > 2 && this.PhysicianFormGroup.get('healthClinicSearch')?.value === true) {
      this.oldHealthClinicSearchValue = searchKeyword
      const reqData: any = {
        apiRequest: {
          searchKeyword: searchKeyword,
        },
      }
      await this.anamnesisSetupServiceService.searchHealthClinic(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res) && res.apiResponse.healthClinicCount > 0) {
            this.healthClinicList = res.apiResponse.healthClinicDetailsViewList;
          } else {
            this.healthClinicList = [];
          }
        })
        .catch((err: any) => {
          this.healthClinicList = [];
        })
    } else {
      this.healthClinicList = [];
    }
  }

  physicianSave = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.PhysicianFormGroup);
    const reqData: any = {
      apiRequest: {}
    }
    if (isValid) {
      if(this.physicianWorkAddressDetails ||this.physicianHomeAddressDetails){
      reqData.apiRequest = {
        ...data
      };
      reqData.apiRequest.physicianUserCode = '';
      reqData.apiRequest.workAddressIndicator = 'N';
      reqData.apiRequest.healthClinicAddressDetails = {
        "addressIdentifier": "",
        "addressType": "",
        "customerName": "",
        "customerAddress": "",
        "customerLandmark": "",
        "customerCity": "",
        "customerPincode": "",
        "customerCountry": "",
        "customerContactNo": "",
        "customerSecondaryContactNo": "",
        "customerStateCode": "",
        "customerStateName": "",
        "customerDefault": false
      };
      reqData.apiRequest.homeAddressIndicator = 'N';
      reqData.apiRequest.homeAddressDetails = {
        "addressIdentifier": "",
        "addressType": "",
        "customerName": "",
        "customerAddress": "",
        "customerLandmark": "",
        "customerCity": "",
        "customerPincode": "",
        "customerCountry": "",
        "customerContactNo": "",
        "customerSecondaryContactNo": "",
        "customerStateCode": "",
        "customerStateName": "",
        "customerDefault": false
      };
      if (this.physicianWorkAddressDetails) {
        reqData.apiRequest.workAddressIndicator = 'Y';
        const tempHealthClinicAddressDetails = {
          addressIdentifier: this.physicianWorkAddressDetails.addressIdentifier,
          addressType: this.physicianWorkAddressDetails.addressType,
          customerName: this.physicianWorkAddressDetails.customerName,
          customerAddress: this.physicianWorkAddressDetails.customerAddress,
          customerLandmark: this.physicianWorkAddressDetails.customerLandmark,
          customerCity: this.physicianWorkAddressDetails.customerCity,
          customerPincode: this.physicianWorkAddressDetails.customerPinCode,
          customerCountry: this.physicianWorkAddressDetails.customerCountry,
          customerContactNo: this.physicianWorkAddressDetails.customerContactNo,
          customerSecondaryContactNo: '',
          customerStateCode: this.stateList.find((res: any) => res.stateName === this.physicianWorkAddressDetails.customerStateName).stateCode,
          customerStateName: this.physicianWorkAddressDetails.customerStateName,
          customerDefault: data.healthClinicID.length ? true : false,
        }
        reqData.apiRequest.healthClinicAddressDetails = tempHealthClinicAddressDetails
      }
      if (this.physicianHomeAddressDetails) {
        reqData.apiRequest.homeAddressIndicator = 'Y';
        const tempHomeAddressDetails = {
          addressIdentifier: this.physicianHomeAddressDetails.addressIdentifier,
          addressType: this.physicianHomeAddressDetails.addressType,
          customerName: this.physicianHomeAddressDetails.customerName,
          customerAddress: this.physicianHomeAddressDetails.customerAddress,
          customerLandmark: this.physicianHomeAddressDetails.customerLandmark,
          customerCity: this.physicianHomeAddressDetails.customerCity,
          customerPincode: this.physicianHomeAddressDetails.customerPinCode,
          customerCountry: this.physicianHomeAddressDetails.customerCountry,
          customerContactNo: this.physicianHomeAddressDetails.customerContactNo,
          customerSecondaryContactNo: '',
          customerStateCode: this.stateList.find((res: any) => res.stateName === this.physicianHomeAddressDetails.customerStateName).stateCode,
          customerStateName: this.physicianHomeAddressDetails.customerStateName,
          customerDefault: true,
        }
        reqData.apiRequest.homeAddressDetails = tempHomeAddressDetails;
      }
      await this.anamnesisSetupServiceService.savePhysician(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.physicianFormGroupReset()
            this.toastr.success('Physician add Succesfully');
          } else {
            this.physicianErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.physicianErrMSG = '', 1500);
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Physician  couldn't add due some error");
          }
        })
      }else{
        this.addressError = 'Please add address';
      }
    } else {
      this.toastr.error('Physician from is nor correct, please fill the form with proper data.')
    }
  }

  physicianFormGroupReset() {
    this.PhysicianFormGroup.reset();
    this.PhysicianFormGroup.get('displayName')?.setValue('');
    this.PhysicianFormGroup.get('firstName')?.setValue('');
    this.PhysicianFormGroup.get('middleName')?.setValue('');
    this.PhysicianFormGroup.get('lastName')?.setValue('');
    this.PhysicianFormGroup.get('physicianSpecialisation')?.setValue('');
    this.PhysicianFormGroup.get('physicianQualification')?.setValue('');
    this.PhysicianFormGroup.get('registrationNumber')?.setValue('');
    this.PhysicianFormGroup.get('registrationAuthority')?.setValue('');
    this.PhysicianFormGroup.get('primaryContactNumber')?.setValue('');
    this.PhysicianFormGroup.get('secondaryContactNumber')?.setValue('');
    this.PhysicianFormGroup.get('emailID')?.setValue('');
    this.PhysicianFormGroup.get('healthClinicID')?.setValue('');
    this.PhysicianFormGroup.get('healthClinicName')?.setValue('');
    this.PhysicianFormGroup.get('healthClinicSearch')?.setValue('');
    this.PhysicianFormGroup.get('addressType')?.setValue('');
    this.physicianAddNewAddress = true;
    this.physicianSelectedAddress = null;
    this.physicianAddressTypeError = '';
    this.physicianWorkAddressDetails = null;
    this.physicianHomeAddressDetails = null;
    this.physicianAddressType = '';
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = null;
    this.healthClinicList = [];
    this.searcedhealthClinic = '';
    this.oldHealthClinicSearchValue = '';
  }
  //<----- Physician End
  //labtest start ---->

  labtestSave = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.LabTestFormGroup);
    const reqData: any = {
      apiRequest: {}
    }
    if (isValid) {
      reqData.apiRequest = {
        laboratoryTestCode: '',
        laboratoryTestName: data.labtestName,
        specimenType: data.specimenType,
        componentIndicator: data.labTestComponentCheck ? 'Y' : 'N',
        resultType: data.resultType,
        laboratoryTestComponentList: [],
      };
      if (data.labTestComponentCheck) {
        data.labTestComponentList.forEach((val: any) => {
          const tempComponent = {
            laboratoryTestComponentCode: '',
            laboratoryTestComponentName: val.componentName,
            chartType: val.trendChartType,
            isNumeric: data.nonNumeric,
            departmentCode: val.departmentCode,
            benchmark: val.banchMark,
            measurementUnit: val.unit ? val.unit : '',
            actionIndicator: "ADD",
            transactionResult: "",
          }
          reqData.apiRequest.laboratoryTestComponentList.push(tempComponent);
        })
      } else {
        const tempComponent = {
          laboratoryTestComponentCode: '',
          laboratoryTestComponentName: '',
          chartType: data.trendChartType,
          isNumeric: data.nonNumeric,
          departmentCode: data.departmentCode,
          benchmark: data.banchMark,
          measurementUnit: data.unit ? data.unit : '',
          actionIndicator: "ADD",
          transactionResult: '',
        }
        reqData.apiRequest.laboratoryTestComponentList.push(tempComponent);
      }
      await this.anamnesisSetupServiceService.saveLabTest(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.labTestFormReset();
            this.toastr.success('Lab Test add Succesfully');
          } else {
            this.addLabtestErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.addLabtestErrMSG = '', 1500);
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Lab Test couldn't add due some error");
          }
        })
    }
  }

  labTestFormReset() {
    this.LabTestFormGroup.reset();
    const labTestComponentListControlArray = <FormArray>this.LabTestFormGroup.get('labTestComponentList')
    labTestComponentListControlArray.clear();
  }

  getInitialData = async () => {
    if (!this.specimenTypeList.length) {
      const reqData: any = {
        apiRequest: {}
      }
      await this.anamnesisSetupServiceService.getInitialData(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.specimenTypeList = res.apiResponse.specimenTypeList;
            this.trendChartList = res.apiResponse.trendChartTypeList;
            this.departmentList = res.apiResponse.departmentCodeDetailsList;
            this.measurementUnitNameList = res.apiResponse.measurementUnitNameList;
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Specimen Type List and Trend Chart list couldn't fetch due some error");
          }
        })
    }
  }

  addLabTestComponentGroup = () => {
    return this.fb.group({
      componentName: ['', [Validators.required]],
      trendChartType: ['', [Validators.required]],
      nonNumeric: [false],
      departmentCode: ['', [Validators.required]],
      banchMark: ['', [Validators.required]],
      unit: [''],
      customErrMsg: ['']
    })
  }

  labTestComponentList = () => {
    return this.LabTestFormGroup.get('labTestComponentList') as FormArray
  }

  getComponentController = (index: number, controlName: string) => {
    let componentControlArray = <any>this.LabTestFormGroup.controls["labTestComponentList"];
    return componentControlArray.controls[index].controls[controlName];
  }

  addLabTestComponent = () => {
    if (this.labTestComponentList().valid) {
      this.labTestComponentList().push(this.addLabTestComponentGroup());
    } else {
      this.labTestComponentList().at(this.labTestComponentList().length - 1).get('customErrMsg')?.setValue('Please fill the details first')
      setTimeout(() => {
        this.labTestComponentList().at(this.labTestComponentList().length - 1).get('customErrMsg')?.setValue('')
      }, 1500);
    }
  }

  removeLabtestComponent = (index: number) => {
    this.labTestComponentList().removeAt(index);
    if (this.labTestComponentList().length < 1) {
      this.addLabTestComponent();
    }
  }
  //labtest end ---->

  //laboratoryTest start packeg --------->
  saveLabtest = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.LaboratoryFormGroup);
    const reqData: any = {
      apiRequest: {}
    }
    if (isValid) {
      reqData.apiRequest = {
        laboratoryTestPackageName: data.laboratoryPackageName,
        laboratoryTestCodeCount: data.laboratoryTestList.length,
        laboratoryTestCodeList: [],
        actionIndicator: 'ADD',
        transactionResult: ''
      };
      data.laboratoryTestList.forEach((val: any) => {
        reqData.apiRequest.laboratoryTestCodeList.push(val.laboratoryTestCode);
      })
      await this.anamnesisSetupServiceService.saveLabTestPackage(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.LaboratoryFormReset();
            this.toastr.success('Lab Test Package add Succesfully');
          } else {
            this.labTestPackagesErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.labTestPackagesErrMSG = '', 1500);
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Lab Test Package couldn't add due some error");
          }
        })
    }
  }

  LaboratoryFormReset() {
    this.LaboratoryFormGroup.reset();
    const ControlArray = <FormArray>this.LaboratoryFormGroup.get('laboratoryTestList');
    ControlArray.clear()
    if (!ControlArray.length) {
      this.addLabTest()
    }
  }

  isSelectedPreviousLabTest(laboratoryTestCode: string, selectedLaboratoryTestCode: string) {
    const a = this.filteredLabTestCodeList.find(res => res === laboratoryTestCode)
    if (a) {
      if (a === selectedLaboratoryTestCode) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  filterLabTestCodeList = () => {
    this.filteredLabTestCodeList = []
    this.LaboratoryFormGroup.value.laboratoryTestList.forEach((laboratoryTest: any) => {
      this.filteredLabTestCodeList.push(laboratoryTest.laboratoryTestCode)
    })
  }

  getLabTestList = async () => {
    const reqData: any = {
      apiRequest: {}
    }
    this.labTestList = [];
    await this.anamnesisSetupServiceService.getLabtestList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          res.apiResponse.laboratoryTestList.forEach((val: any) => {
            const tempLaboratoryTest = {
              labTestCode: val.laboratoryTestCode,
              labTestName: val.laboratoryTestName
            }
            this.labTestList.push(tempLaboratoryTest);
          });
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Lab test List couldn't fetch due some error");
        }
      })
  }

  addLaboratorytestGrop = () => {
    return this.fb.group({
      laboratoryTestCode: ['', [Validators.required]],
      customErrMsg: ['']
    })
  }

  removeLabtest = (index: number) => {
    this.laboratoryTestList().removeAt(index);
    if (this.laboratoryTestList().length < 1) {
      this.addLabTest()
    }
  }

  addLabTest = () => {
    if (this.laboratoryTestList().valid) {
      this.laboratoryTestList().push(this.addLaboratorytestGrop());
    } else {
      this.laboratoryTestList().at(this.laboratoryTestList().length - 1).get('customErrMsg')?.setValue('Please fill the details first')
      setTimeout(() => {
        this.laboratoryTestList().at(this.laboratoryTestList().length - 1).get('customErrMsg')?.setValue('')
      }, 1500);
    }
  }

  laboratoryTestList = () => {
    return this.LaboratoryFormGroup.get('laboratoryTestList') as FormArray;
  }

  getLaboratoryTestController = (index: number, controlName: any) => {
    let laboratoryTestControlArray = <any>this.LaboratoryFormGroup.controls["laboratoryTestList"];
    return laboratoryTestControlArray.controls[index].controls[controlName];
  }
  //laboratoryTest packeg  end <---------

  // role update start ----------->
  getRoleList = async () => {
    if (!this.roleList.length) {
      const reqData: any = {
        apiRequest: {}
      }
      await this.anamnesisSetupServiceService.getRoleTypeList(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.roleList = res.apiResponse;
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Role List couldn't fetch due some error");
          }
        })
    }
  }

  roleTypeSave = async (data: any, isVAlid: boolean) => {
    this.formService.markFormGroupTouched(this.RoleFormGroup);
    const reqData: any = {
      apiRequest: {}
    }
    if (isVAlid) {
      if (data.roleCode === 'PHR') {
        reqData.apiRequest = {
          candidateUserID: data.userID.toString(),
          candidateNewRoleCode: data.roleCode,
          deliveryRegion: data.deliveryRegion,
          deliveryZone: data.deliveryZone,
          distributionZone: data.distributionZone,
          stateCode: data.stateCode
        };
        await this.anamnesisSetupServiceService.SaveRoleTypeAsPharmacist(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.roleFormReset();
              this.toastr.success('Role updated Succesfully');
            } else {
              this.roleChangeErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
              setTimeout(() => this.roleChangeErrMSG = '', 1500);
            }
          })
          .catch((err: any) => {
            if (err.status !== 401) {
              this.toastr.error("Role couldn't update due some error");
            }
          })
      } else if (data.roleCode === 'DLA') {
        reqData.apiRequest = {
          candidateUserID: data.userID.toString(),
          candidateNewRoleCode: data.roleCode,
          deliveryRegion: data.deliveryRegion,
          deliveryZone: data.deliveryZone,
          distributionZone: data.distributionZone,
          stateCode: data.stateCode
        };
        await this.anamnesisSetupServiceService.SaveRoleTypeAsDeliveryAgent(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.roleFormReset();
              this.toastr.success('Role updated Succesfully');
            } else {
              this.roleChangeErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage

            }
          })
          .catch((err: any) => {
            if (err.status !== 401) {
              this.toastr.error("Role couldn't update due some error");
            }
          })
      }
      else {
        reqData.apiRequest = { candidateUserID: data.userID.toString(), candidateNewRoleCode: data.roleCode };
        await this.anamnesisSetupServiceService.SaveRoleType(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.roleFormReset();
              this.toastr.success('Role updated Succesfully');
            } else {
              this.roleChangeErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
              setTimeout(() => this.roleChangeErrMSG = '', 1500);
            }
          })
          .catch((err: any) => {
            if (err.status !== 401) {
              this.toastr.error("Role couldn't update due some error");
            }
          })
      }
    }
  }

  roleFormReset = () => {
    this.RoleFormGroup.reset()
    this.roleChangeErrMSG = '';
  }

  getUserName = async (userID: number) => {
    this.formService.markFormGroupTouched(this.RoleFormGroup);
    const stringUserID: string = userID.toString()
    if (stringUserID.length === 10) {
      const reqData: any = {
        apiRequest: {
          userID: userID
        }
      }
      await this.anamnesisSetupServiceService.getUserName(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.RoleFormGroup.controls['name'].setValue(res.apiResponse.transactionResult);
            this.roleChangeErrMSG = "";
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("User name couldn't fetch due some error");
          }
        })
    } else {
      this.RoleFormGroup.controls['name'].setValue('');
    }
  }


  // role update end <-----------

  //------->AythorisedSigratory start
  authoriserSignatoryFormReset() {
    this.AuthorisedSignatoryFormGroup = this.fb.group({
      physicianDisplayName: ['', Validators.required],
      physicianFirstName: [''],
      physicianMiddleName: [''],
      physicianLastName: [''],
      stateCode: ['', Validators.required],
      stateName: [''],
      physicianQualification: [''],
      physicianSpecialisation: [''],
      registrationNumber: [''],
      registrationAuthority: [''],
      actionIndicator: ['ADD'],
      transactionResult: [''],
    })
  }

  selectStaeForAuthorisedSignatory() {
    const state = this.stateList.find((res: any) => res.stateCode === this.AuthorisedSignatoryFormGroup.get('stateCode')?.value);
    this.AuthorisedSignatoryFormGroup.get('stateName')?.setValue(state.stateName);
  }

  authorisedSignatorySave = async () => {
    this.formService.markFormGroupTouched(this.AuthorisedSignatoryFormGroup)
    if (this.AuthorisedSignatoryFormGroup.valid) {
      const reqData: any = {
        apiRequest: this.AuthorisedSignatoryFormGroup.value,
      }
      reqData.apiRequest.authorisedSignatoryInd = 'Y';
      await this.anamnesisSetupServiceService.AuthorisedSignatoryDataEntry(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.authoriserSignatoryFormReset();
          } else {
            this.authorisedSignatoryErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.authorisedSignatoryErrMSG = '', 1500);
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Authorised signatory could not save due some error");
          }
        })
    }
  }
  //<-------AythorisedSigratory end

  //Physician Appointment Book start--------->

  // physician search--->
  selectPhysicianForAppointment(physician: any) {
    this.showPhysicianDetailsForAppointment = true;
    this.selectedPhysicianDetailsForAppointment = physician;
    this.PhysicianAppointmentForm.get('physicianName')?.setValue(physician.physicianName);
    this.PhysicianAppointmentForm.get('physicianSearch')?.setValue(false);
    this.PhysicianAppointmentForm.get('physicianName')?.disable();
  }

  unSelectPhysicianForAppointment() {
    this.showPhysicianDetailsForAppointment = false;
    this.selectedPhysicianDetailsForAppointment = {};
    this.PhysicianAppointmentForm.get('physicianName')?.setValue(this.physicianSearchValueForAppointment);
    this.PhysicianAppointmentForm.get('physicianSearch')?.setValue(false);
    this.PhysicianAppointmentForm.get('physicianName')?.enable();
  }

  selectPhysicianForPrescriptionForAppointment() {
    this.PhysicianAppointmentForm.get('physicianUserID')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianUserID);
    this.PhysicianAppointmentForm.get('physicianUserCode')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianUserCode);
    this.PhysicianAppointmentForm.get('physicianProfilePictureID')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianProfilePictureID);
    this.PhysicianAppointmentForm.get('physicianPrimaryContactNo')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianPrimaryContactNo);
    this.PhysicianAppointmentForm.get('physicianQualification')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianQualification);
    this.PhysicianAppointmentForm.get('physicianSpecialisation')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianSpecialisation);
    this.PhysicianAppointmentForm.get('physicianName')?.setValue(this.selectedPhysicianDetailsForAppointment.physicianName);
    this.PhysicianAppointmentForm.get('physicianName')?.disable();
    this.PhysicianAppointmentForm.get('physicianSearch')?.setValue(false);
    this.showPhysicianDetailsForAppointment = false;
    this.selectedPhysicianDetailsForAppointment = {};
  }

  unSelectPhysicianForPrescriptionForAppointment() {
    this.showPhysicianDetailsForAppointment = false;
    this.selectedPhysicianDetailsForAppointment = {};
    this.PhysicianAppointmentForm.get('physicianName')?.setValue(this.physicianSearchValueForAppointment);
    this.PhysicianAppointmentForm.get('physicianUserID')?.setValue('');
    this.PhysicianAppointmentForm.get('physicianUserCode')?.setValue('');
    this.PhysicianAppointmentForm.get('physicianName')?.enable();
    this.PhysicianAppointmentForm.get('physicianSearch')?.setValue(false);
  }

  onTypephysicianNameForAppointment() {
    this.PhysicianAppointmentForm.get('physicianSearch')?.setValue(true);
  }
  // physician search ---->

  // patient search --->
  selectPatientForAppointment(Patient: any) {
    this.showPatientDetailsForAppointment = true;
    this.selectedPatientDetailsForAppointment = Patient;
    this.PhysicianAppointmentForm.get('patientName')?.setValue(Patient.displayName);
    this.PhysicianAppointmentForm.get('patientSearch')?.setValue(false);
    this.PhysicianAppointmentForm.get('patientName')?.disable();
  }

  unSelectPatientForAppointment() {
    this.showPatientDetailsForAppointment = false;
    this.selectedPatientDetailsForAppointment = {};
    this.PhysicianAppointmentForm.get('patientName')?.setValue(this.PatientSearchValueForAppointment);
    this.PhysicianAppointmentForm.get('patientSearch')?.setValue(false);
    this.PhysicianAppointmentForm.get('patientName')?.enable();
  }

  selectPatientForPrescriptionForAppointment() {
    this.PhysicianAppointmentForm.get('patientUserCode')?.setValue(this.selectedPatientDetailsForAppointment.userCode);
    this.PhysicianAppointmentForm.get('patientID')?.setValue(this.selectedPatientDetailsForAppointment.userID);
    this.PhysicianAppointmentForm.get('patientName')?.setValue(this.selectedPatientDetailsForAppointment.displayName);
    this.PhysicianAppointmentForm.get('patientName')?.disable();
    this.PhysicianAppointmentForm.get('patientSearch')?.setValue(false);
    this.showPatientDetailsForAppointment = false;
    this.selectedPatientDetailsForAppointment = {};
  }

  unSelectPatientForPrescriptionForAppointment() {
    this.showPatientDetailsForAppointment = false;
    this.selectedPatientDetailsForAppointment = {};
    this.PhysicianAppointmentForm.get('patientName')?.setValue(this.PatientSearchValueForAppointment);
    this.PhysicianAppointmentForm.get('patientUserCode')?.setValue('');
    this.PhysicianAppointmentForm.get('patientName')?.enable();
    this.PhysicianAppointmentForm.get('patientSearch')?.setValue(false);
  }

  onTypePatientNameForAppointment() {
    this.PhysicianAppointmentForm.get('patientSearch')?.setValue(true);
  }
  // patient search --->

  // HealthClinicsearch ---->
  selectHealthClinicForAppointment(healthClinic: any) {
    this.showHealthClinicDetailsForAppointment = true;
    this.selectedHealthClinicDetailsForAppointment = healthClinic;
    this.PhysicianAppointmentForm.get('healthClinicName')?.setValue(healthClinic.healthClinicName);
    this.PhysicianAppointmentForm.get('healthClinicSearch')?.setValue(false);
    this.PhysicianAppointmentForm.get('healthClinicName')?.disable();
  }

  unSelectHealthClinicForAppointment() {
    this.showHealthClinicDetailsForAppointment = false;
    this.selectedHealthClinicDetailsForAppointment = {};
    this.PhysicianAppointmentForm.get('healthClinicName')?.setValue(this.searcHedhealthClinicForAppointment);
    this.PhysicianAppointmentForm.get('healthClinicSearch')?.setValue(false);
    this.PhysicianAppointmentForm.get('healthClinicName')?.enable();
  }

  selectHealthClinicForPrescriptionForAppointment() {
    this.PhysicianAppointmentForm.get('healthClinicID')?.setValue(this.selectedHealthClinicDetailsForAppointment.healthClinicID);
    this.PhysicianAppointmentForm.get('healthClinicName')?.setValue(this.selectedHealthClinicDetailsForAppointment.healthClinicName);
    this.PhysicianAppointmentForm.get('healthClinicName')?.disable();
    this.PhysicianAppointmentForm.get('healthClinicSearch')?.setValue(false);
    const address = `${this.selectedHealthClinicDetailsForAppointment.addressLine},
    ${this.selectedHealthClinicDetailsForAppointment.landmark}
    ${this.selectedHealthClinicDetailsForAppointment.landmark ? ',' : ''}
    ${this.selectedHealthClinicDetailsForAppointment.city},
    ${this.selectedHealthClinicDetailsForAppointment.pincode},
    ${this.selectedHealthClinicDetailsForAppointment.stateName},`
    this.PhysicianAppointmentForm.get('healthClinicAddress')?.setValue(address);
    this.showHealthClinicDetailsForAppointment = false;
    this.selectedHealthClinicDetailsForAppointment = {};
  }

  unSelectHealthClinicForPrescriptionForAppointment() {
    this.showHealthClinicDetailsForAppointment = false;
    this.selectedHealthClinicDetailsForAppointment = {};
    this.PhysicianAppointmentForm.get('healthClinicName')?.setValue(this.searcHedhealthClinicForAppointment);
    this.PhysicianAppointmentForm.get('healthClinicID')?.setValue('');
    this.PhysicianAppointmentForm.get('healthClinicName')?.enable();
    this.PhysicianAppointmentForm.get('healthClinicSearch')?.setValue(false);
  }

  onTypeHealthClinicNameForAppointment() {
    this.PhysicianAppointmentForm.get('healthClinicSearch')?.setValue(true);
  }
  // HealthClinicsearch ---->

  bookAppointment = async () => {
    this.formService.markFormGroupTouched(this.PhysicianAppointmentForm)
    const data = this.PhysicianAppointmentForm.getRawValue()
    if (this.PhysicianAppointmentForm.valid) {
      const reqData: any = {
        apiRequest: [{
          workRequestID: '',
          commercialID: data.healthClinicID,
          physicianUserCode: data.physicianUserCode,
          appointmentType: 'PHC',
          appointmentDate: new Date(data.appointmentDate),
          appointmentTime: this.utilityService.timeFormateInto24Hours(data.appointmentTime),
          patientUserID: data.patientID,
          cartItemSeqNo: '',
          prescriptionID: '',
          itemType: 'PC',
          itemCode: data.physicianUserCode,
          packageID: '',
          quantity: 1,
          addressID: '',
          couponID: '',
          actionIndicator: 'ADD',
          transactionResult: '',
        }]
      };
      await this.anamnesisSetupServiceService.PhysicianAppointment(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.clearPhysicianAppointmentForm()
          } else {
            this.appointmentBookErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.appointmentBookErrMSG = '', 1500);
          }
        })
        .catch((err: any) => {
        })
    }
  }

  clearPhysicianAppointmentForm() {
    this.PhysicianAppointmentForm.reset();
    this.PhysicianAppointmentForm.get('healthClinicID')?.setValue('');
    this.PhysicianAppointmentForm.get('patientID')?.setValue('');
    this.PhysicianAppointmentForm.get('patientUserCode')?.setValue('');
    this.PhysicianAppointmentForm.get('physicianUserID')?.setValue('');
    this.PhysicianAppointmentForm.get('physicianUserCode')?.setValue('');
    this.PhysicianAppointmentForm.get('healthClinicSearch')?.setValue(true);
    this.PhysicianAppointmentForm.get('patientSearch')?.setValue(true);
    this.PhysicianAppointmentForm.get('physicianSearch')?.setValue(true);
    this.PhysicianAppointmentForm.get('healthClinicName')?.enable();
    this.PhysicianAppointmentForm.get('patientName')?.enable();
    this.PhysicianAppointmentForm.get('physicianName')?.enable();
    this.HealthClinicListForAppointment = [];
    this.PhysicianListForAppointment = [];
    this.PatientListForAppointment = [];
  }

  checkValidDate() {
    const dateControl = this.PhysicianAppointmentForm.get('appointmentDate');
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '11:59:59 PM') < this.currentDate.getTime()) {
      dateControl!.setValue('')
    }
  }
  //Physician Appointment Book end--------->

  // Commercial Entity Add start ---->
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
        apiRequest: this.DiagnosticCenterFormGroup.value
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
            this.cleaDiagnosticCentreForm()
          } else {
            this.addNewEntityMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.addNewEntityMSG = '', 1500);
          }
        })
        .catch((err: any) => {
        })
    }
  }

  cleaDiagnosticCentreForm() {
    const opensDayArr = ["N", "N", "N", "N", "N", "N", "N"]
    this.DiagnosticCenterFormGroup.reset()
    this.DiagnosticCenterFormGroup.get('commercialEntityName')?.setValue('')
    this.DiagnosticCenterFormGroup.get('commercialType')?.setValue('')
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
  // Commercial Entity Add end ----->
  // GST Start------->
  private addGstFormGroup() {
    return this.fb.group({
      itemName: [''],
      itemCode: ['', [Validators.required]],
      itemType: [''],
      isSearch: [true],
      searchedItem: [''],
      hsnSbaCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(8)]],
      gstRateVariation: ['',],
      ishsnMatch: [false],
      cessRate: [''],
      gstRate: [''],
      tempMedicineList: [[]],
      tempHouseHoldList: [[]],
      dataSet: [false],
      isAddGstRate: [true],
      isAddHsnSbaCode: [true],
      isMedicine: [''],
      customErrMsg: ['']
    })
  }

  addAnotherGstGroup() {
    if (this.gstItemList().valid) {
      this.gstItemList().push(this.addGstFormGroup())
    } else {
      this.gstItemList().at(this.gstItemList().length - 1).get('customErrMsg')?.setValue('Please fill the details first')
      setTimeout(() => {
        this.gstItemList().at(this.gstItemList().length - 1).get('customErrMsg')?.setValue('')
      }, 1500);
    }
  }

  gstItemList() {
    return this.GstForm.get('gstItemList') as FormArray;
  }

  getGstItemController(gstIndex: number, controlName: any) {
    const controlArray = <any>this.GstForm.controls['gstItemList']
    return controlArray.controls[gstIndex].controls[controlName];
  }

  deleteGstItem(gstIndex: number) {
    this.gstItemList().removeAt(gstIndex);
    if (this.gstItemList().length < 1) {
      this.addAnotherGstGroup()
    }
  }

  selectItem(gstIndex: number, data: any, isMedicine: boolean) {
    const gstItemListValue = this.gstItemList().getRawValue();
    let gstControll = this.gstItemList().at(gstIndex);
    gstControll.get('itemName')?.setValue('')
    gstControll.get('itemCode')?.setValue('')
    gstControll.get('itemType')?.setValue('')
    gstControll.get('hsnSbaCode')?.setValue('')
    gstControll.get('ishsnMatch')?.setValue(false)
    gstControll.get('cessRate')?.setValue('')
    gstControll.get('gstRate')?.setValue('')
    gstControll.get('gstRateVariation')?.setValue('')
    gstControll.get('dataSet')?.setValue(false)
    gstControll.get('isAddGstRate')?.setValue(true)
    gstControll.get('isAddHsnSbaCode')?.setValue(true)
    gstControll.get('isMedicine')?.setValue('')
    gstControll.get('customErrMsg')?.setValue('')
    const itemCode = isMedicine ? data.medicineCode : data.householdItemCode;
    const foundItem = gstItemListValue.find((res: any) => res.itemCode === itemCode)
    if (foundItem) {
      gstControll.get('customErrMsg')?.setValue('This item already choosen')
    } else {
      if (data.hsnsacCode) {
        const sameHsnSabList = gstItemListValue.filter((res: any) => res.hsnSbaCode === data.hsnsacCode)
        sameHsnSabList.forEach((value: any) => {
          const foundIndex = gstItemListValue.findIndex((val: any) => val.itemCode === value.itemCode)
          if (foundIndex > -1) {
            if (!isNaN(+data.cessRate) && !isNaN(+data.gstRate)) {
              this.gstItemList().at(foundIndex).get('cessRate')?.setValue(data.cessRate)

              this.gstItemList().at(foundIndex).get('gstRate')?.setValue(data.gstRate)
              this.gstItemList().at(foundIndex).get('itemType')?.setValue(data.itemType)

              this.gstItemList().at(foundIndex).get('gstRateVariation')?.setValue(data.gstRateVariation)

              this.gstItemList().at(foundIndex).get('isAddGstRate')?.setValue(false)
            } else {
              this.gstItemList().at(foundIndex).get('cessRate')?.setValue(sameHsnSabList[0].cessRate)
              this.gstItemList().at(foundIndex).get('gstRate')?.setValue(sameHsnSabList[0].gstRate)
              this.gstItemList().at(foundIndex).get('isAddGstRate')?.setValue(sameHsnSabList[0].isAddGstRate)
            }
          }
        })
        if (!isNaN(+data.cessRate) && !isNaN(+data.gstRate)) {
          this.gstItemList().at(gstIndex).get('cessRate')?.setValue(data.cessRate)

          this.gstItemList().at(gstIndex).get('gstRate')?.setValue(data.gstRate)
          this.gstItemList().at(gstIndex).get('itemType')?.setValue(data.itemType)
          this.gstItemList().at(gstIndex).get('isAddGstRate')?.setValue(false)
        }
        this.gstItemList().at(gstIndex).get('isAddHsnSbaCode')?.setValue(false)
        this.gstItemList().at(gstIndex).get('hsnSbaCode')?.setValue(data.hsnsacCode)
        this.gstItemList().at(gstIndex).get('hsnSbaCode')?.disable()
      }
      gstControll.get('itemName')?.setValue(isMedicine ? data.medicineName : data.householdItemName)
      gstControll.get('itemCode')?.setValue(isMedicine ? data.medicineCode : data.householdItemCode)
      gstControll.get('itemType')?.setValue(data.itemType)
      gstControll.get('isMedicine')?.setValue(isMedicine ? "Y" : "N")
      gstControll.get('isSearch')?.setValue(false)
      gstControll.get('customErrMsg')?.setValue('')
      gstControll.get('dataSet')?.setValue(true)
    }
  }

  itemSearch = async (gstIndex: number, searchKeyword: string) => {
    this.gstItemList().at(gstIndex).get('customErrMsg')?.setValue('')
    const reqData: any = {
      apiRequest: { searchKeyword: searchKeyword }
    }
    if (searchKeyword && searchKeyword.length > 2) {
      await this.anamnesisSetupServiceService.getItemList(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            const medicineList = [...res.apiResponse.medicineGSTDetailsList];
            this.gstItemList().at(gstIndex).get('tempMedicineList')?.setValue(medicineList)
            const householdItemGSTDetailsList = [...res.apiResponse.householdItemGSTDetailsList];
            this.gstItemList().at(gstIndex).get('tempHouseHoldList')?.setValue(householdItemGSTDetailsList)
          } else {
            this.gstItemList().at(gstIndex).get('customErrMsg')?.setValue(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Medicine List couldn't fetch due some error");
          }
        })
    }
  }

  saveGstForm = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.GstForm)
    if (isValid) {
      const reqData: any = {
        apiRequest: this.getGSTreqObj(),
      }
      await this.anamnesisSetupServiceService.SaveGST(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.gstItemList().clear();
            this.addAnotherGstGroup();
          } else {
            this.GSTErrMSG = res.anamnesisErrorList.anErrorList[0].errorMessage
            setTimeout(() => this.GSTErrMSG = '', 1500);
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("GST could not save due some error");
          }
        })
    }
  }

  getGSTreqObj() {
    const data = this.GstForm.getRawValue();
    const itemListList: any = []
    data.gstItemList.forEach((res: any) => {
      const tempItem = {
        itemCode: res.itemCode,
        itemType: res.itemType,
        hsnsacCode: res.hsnSbaCode,
        gstVariation: res.gstRateVariation,
        gstRate: res.gstRate,
        cessRate: res.cessRate,
        transactionResult: '',
      }
      itemListList.push(tempItem)
    })
    const apiRequest = {
      recordCount: itemListList.length,
      productGSTInformationList: itemListList
    }
    return apiRequest;
  }

  gstFormReset() {
    this.gstItemList().clear();
    this.addAnotherGstGroup();
    this.GstForm.get('ifErr')?.setValue(false);
  }
  MenuView() {
    this.DetailsView = !this.DetailsView;
  }
  changeGstPescentage(gstIndex: number, data: string, key: any) {
    if (data && data.length && !this.commonService.checkDecimalNumber(data)) {
      this.gstItemList().at(gstIndex).get(key)?.setValue('')
    }
    this.changeGst(gstIndex)
  }

  gstRateValidationChange(gstIndex: number, data: string) {
    const gstItem = this.gstItemList().at(gstIndex).getRawValue()
    if (data && data.length) {
      this.gstItemList().at(gstIndex).get('cessRate')?.setValidators([Validators.required])
      this.gstItemList().at(gstIndex).get('gstRate')?.setValidators([Validators.required])
      this.gstItemList().at(gstIndex).get('cessRate')?.updateValueAndValidity()
      this.gstItemList().at(gstIndex).get('gstRate')?.updateValueAndValidity()
    } else if (!gstItem.cessRate && !gstItem.cgstRate && !gstItem.igstRate && !gstItem.igstRate) {
      this.gstItemList().at(gstIndex).get('cessRate')?.clearValidators()
      this.gstItemList().at(gstIndex).get('cessRate')?.updateValueAndValidity()
      this.gstItemList().at(gstIndex).get('gstRate')?.clearValidators()
      this.gstItemList().at(gstIndex).get('gstRate')?.updateValueAndValidity()
    }
  }

  hsnSbaCodeChange(gstIndex: number, hsnSbaCode: string) {
    if (this.gstItemList().at(gstIndex).get('itemCode')?.getRawValue()) {
      if (hsnSbaCode) {
        const gstItemListValue = this.gstItemList().getRawValue();
        const foundItem = gstItemListValue.find((res: any) => res.hsnSbaCode === hsnSbaCode);
        const foundItemIndex = gstItemListValue.findIndex((res: any) => res.hsnSbaCode === hsnSbaCode);
        if (foundItem && foundItemIndex !== gstIndex) {
          this.gstItemList().at(gstIndex).get('cessRate')?.setValue(foundItem.cessRate)
          this.gstItemList().at(gstIndex).get('gstRate')?.setValue(foundItem.gstRate)
          this.gstItemList().at(gstIndex).get('isAddGstRate')?.setValue(foundItem.isAddGstRate)
          this.gstItemList().at(gstIndex).get('ishsnMatch')?.setValue(true)
        } else if (this.gstItemList().at(gstIndex).get('ishsnMatch')?.value) {
          this.gstItemList().at(gstIndex).get('cessRate')?.setValue('')
          this.gstItemList().at(gstIndex).get('cessRate')?.enable()
          this.gstItemList().at(gstIndex).get('gstRate')?.setValue('')
          this.gstItemList().at(gstIndex).get('gstRate')?.enable()
          this.gstItemList().at(gstIndex).get('isAddGstRate')?.setValue(true)
          this.gstItemList().at(gstIndex).get('ishsnMatch')?.setValue(false)
        }
        this.changeGst(gstIndex)
      }
    }
  }

  changeGst(gstIndex: number) {
    this.gstItemList().at(gstIndex).get('dataSet')?.setValue(true)
  }
  // <-------- GST End

  // AnamnesisDiscount start--->
  couponTypeChange(CouponCategory: any, couponType: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    switch (couponType) {
      case 'FLTAL':
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.setValidators([Validators.required])
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.clearValidators()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.setValue('')
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.clearValidators()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.setValue('')
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.updateValueAndValidity()
        break;
      case 'FLTFL':
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.setValidators([Validators.required])
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.clearValidators()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.setValue('')
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.setValidators([Validators.required])
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.updateValueAndValidity()
        break;
      case 'PCTAL':
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.clearValidators()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.setValue('')
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.setValidators([Validators.required])
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.clearValidators()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.setValue('')
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.updateValueAndValidity()
        break;
      case 'PCTFL':
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.clearValidators()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.setValue('')
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.setValidators([Validators.required])
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.updateValueAndValidity()
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.setValidators([Validators.required])
        this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.updateValueAndValidity()
        break;

      default:
        break;
    }

  }

  couponCodeChange(CouponCategory: any, value: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('couponCode')?.setValue(value.toUpperCase())
    if (CouponCategory === 3) {
      this.changeCouponCodeCategory3(this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('couponCode')?.value)
    }
  }

  changeNumber(CouponCategory: any, controllName: any, value: any) {
    if (!this.commonService.checkUserNumber(value)) {
      const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
      this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get(controllName)?.setValue('')
    }
  }
  changeDecNumber(CouponCategory: any, controllName: any, value: any) {
    if (!this.commonService.checkDecimalNumber(value)) {
      const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
      this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get(controllName)?.setValue('')
    }
  }


  onHighValueChange(CouponCategory: any, event: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('expiryDate')?.setValue(new Date(event))
  }

  onLowValueChange(CouponCategory: any, event: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('commencementDate')?.setValue(new Date(event))
  }

  setTimeRenge(CouponCategory: any, startDate: any, enddate: any) {
    // let startDate = this.dateRangeObj.laboratoryTestReportStartDate
    // let endDate = this.dateRangeObj.laboratoryTestReportEndDate
    let dates: any = [];

    let d0: any = startDate.split('-');
    let d1: any = enddate.split('-');

    for (
      let y = d0[0];
      y <= d1[0];
      y++
    ) {
      for (
        var m = d0[1];
        m <= 12;
        m++
      ) {
        dates.push(y + "-" + m + "-1");
        if (y >= d1[0] && m >= d1[1]) break;
      };
      d0[1] = 1;
    };

    const dateRange: any = []
    dates.forEach((ddd: any, index: number) => {
      if (index !== dates.length - 1) {
        dateRange.push(new Date(ddd));
      }
    })

    dateRange.push(this.getLastDay(dates[dates.length - 1]))

    const option = {
      stepsArray: dateRange.map((date: any) => {
        return { value: date.getTime() };
      }),
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return this.date.transform(new Date(value), 'MMM yy') || '';
          case LabelType.High:
            return this.date.transform(new Date(value), 'MMM yy') || '';
          default:
            return this.date.transform(new Date(value), 'MMM yy') || '';
        }
      }
    };
    switch (CouponCategory) {
      case 1:
        this.CouponCategory1DateOptions = option;
        this.CouponCategory1DateValue = dateRange[0].getTime();
        this.CouponCategory1HighValue = dateRange[5].getTime();
        break;
      case 2:
        this.CouponCategory2DateOptions = option;
        this.CouponCategory2DateValue = dateRange[0].getTime();
        this.CouponCategory2HighValue = dateRange[5].getTime();
        break;
      case 3:
        this.CouponCategory3DateOptions = option;
        this.CouponCategory3DateValue = dateRange[0].getTime();
        this.CouponCategory3HighValue = dateRange[5].getTime();
        this.anamnesisDiscountForm.get('CouponCategory3')?.get('commencementDate')?.setValue(dateRange[0].getTime());
        this.anamnesisDiscountForm.get('CouponCategory3')?.get('expiryDate')?.setValue(dateRange[5].getTime());
        break;

      default:
        break;
    }
  }

  getLastDay(day: any) {
    const selectedDate = new Date(day);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    return lastDayOfMonth
  }

  isShowInputCouponCategory1(couponType: any, controllName: any) {
    let isShow = false;
    switch (couponType) {
      case 'FLTAL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = true;
            break;
          case 'discountPercent':
            isShow = false;
            break;
          case 'orderFloorLimit':
            isShow = false;
            break;

          default:
            break;
        }
        break;
      case 'FLTFL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = true;
            break;
          case 'discountPercent':
            isShow = false;
            break;
          case 'orderFloorLimit':
            isShow = true;
            break;

          default:
            break;
        }
        break;
      case 'PCTAL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = false;
            break;
          case 'discountPercent':
            isShow = true;
            break;
          case 'orderFloorLimit':
            isShow = false;
            break;

          default:
            break;
        }
        break;
      case 'PCTFL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = false;
            break;
          case 'discountPercent':
            isShow = true;
            break;
          case 'orderFloorLimit':
            isShow = true;
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
    return isShow;
  }

  isShowInputCouponCategory2(couponType: any, controllName: any) {
    let isShow = false;
    switch (couponType) {
      case 'FLTAL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = true;
            break;
          case 'discountPercent':
            isShow = false;
            break;
          case 'orderFloorLimit':
            isShow = false;
            break;

          default:
            break;
        }
        break;
      case 'FLTFL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = true;
            break;
          case 'discountPercent':
            isShow = false;
            break;
          case 'orderFloorLimit':
            isShow = true;
            break;

          default:
            break;
        }
        break;
      case 'PCTAL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = false;
            break;
          case 'discountPercent':
            isShow = true;
            break;
          case 'orderFloorLimit':
            isShow = false;
            break;

          default:
            break;
        }
        break;
      case 'PCTFL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = false;
            break;
          case 'discountPercent':
            isShow = true;
            break;
          case 'orderFloorLimit':
            isShow = true;
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
    return isShow;
  }

  isShowInputCouponCategory3(couponType: any, controllName: any) {
    let isShow = false;
    switch (couponType) {
      case 'FLTAL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = true;
            break;
          case 'discountPercent':
            isShow = false;
            break;
          case 'orderFloorLimit':
            isShow = false;
            break;

          default:
            break;
        }
        break;
      case 'FLTFL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = true;
            break;
          case 'discountPercent':
            isShow = false;
            break;
          case 'orderFloorLimit':
            isShow = true;
            break;

          default:
            break;
        }
        break;
      case 'PCTAL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = false;
            break;
          case 'discountPercent':
            isShow = true;
            break;
          case 'orderFloorLimit':
            isShow = false;
            break;

          default:
            break;
        }
        break;
      case 'PCTFL':
        switch (controllName) {
          case 'discountFlatAmount':
            isShow = false;
            break;
          case 'discountPercent':
            isShow = true;
            break;
          case 'orderFloorLimit':
            isShow = true;
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
    return isShow;
  }

  getControll(CouponCategory: any, controllName: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    var control = <any>this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get(controllName)
    return control
  }

  resetAnamnesisDiscountForm(CouponCategory: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.reset()
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('couponCategory')?.setValue(1)
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('couponCode')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('couponCodeDescription')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('couponType')?.setValue('PCTAL')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('commencementDate')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('expiryDate')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('orderFloorLimit')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountPercent')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('discountFlatAmount')?.setValue('')
    this.anamnesisDiscountForm.get(CouponCategoryGroupName)?.get('transactionResult')?.setValue('')
    if (CouponCategory === 3) {
      this.anamnesisDiscountForm.get('CouponCategory3')?.get('editInd')?.setValue(false)
    }
    let startDate = new Date();
    const monthFirstDate = new Date(`${this.date.transform(new Date(), 'yyyy-MM-dd')?.split('-')[0]}-${this.date.transform(new Date(), 'yyyy-MM-dd')?.split('-')[1]}-01`);
    const currentdate = new Date();
    if (currentdate > monthFirstDate) {
      startDate = new Date(monthFirstDate.setMonth(monthFirstDate.getMonth() + 1))
    }
    this.setTimeRenge(CouponCategory, this.date.transform(startDate, 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
  }

  async saveCouponCategory(CouponCategory: any) {
    const CouponCategoryGroupName = `CouponCategory${CouponCategory}`;
    const control = <any>this.anamnesisDiscountForm.get(CouponCategoryGroupName)
    const data = control?.value
    this.formService.markFormGroupTouched(control)
    if (control.valid) {
      const reqData: any = {
        apiRequest: this.getDiscountReqObj(data, CouponCategory),
      }
      if (CouponCategory === 1 || CouponCategory === 2) {
        await this.anamnesisSetupServiceService.saveDiscount12(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              // this.resetAnamnesisDiscountForm(CouponCategory);
              this.toastr.success('Discount Add successfully')
              this.getDiscoulnList12(CouponCategory)
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if (err.status !== 401) {
              this.toastr.error("Discount could not add due some error");
            }
          })
      } else {
        await this.anamnesisSetupServiceService.saveDiscount3(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.resetAnamnesisDiscountForm(CouponCategory);
              this.toastr.success('Discount Add successfully')
              this.getDiscoulnList3()
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if (err.status !== 401) {
              this.toastr.error("Discount could not add due some error");
            }
          })
      }
    }
  }
  editCouponCategory3(data: any) {
    this.anamnesisDiscountForm.get('CouponCategory3')?.reset()
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('couponCategory')?.setValue(3)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('couponCode')?.setValue(data.couponCode)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('couponCodeDescription')?.setValue(data.couponCodeDescription)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('couponType')?.setValue(data.couponType)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('commencementDate')?.setValue('')
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('expiryDate')?.setValue('')
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('orderFloorLimit')?.setValue(data.orderFloorLimit)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('discountPercent')?.setValue(data.discountPercent)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('discountFlatAmount')?.setValue(data.discountFlatAmount)
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('transactionResult')?.setValue('')
    this.anamnesisDiscountForm.get('CouponCategory3')?.get('editInd')?.setValue(true)
    const commencementDate = new Date(data.commencementDate);
    if (commencementDate < new Date()) {
      this.setTimeRenge(3, this.date.transform(new Date(), 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
      // this.anamnesisDiscountForm.get('CouponCategory3')?.get('commencementDate')?.setValue(new Date().getTime())
      // this.CouponCategory3DateValue = new Date().getTime()
    } else {
      this.anamnesisDiscountForm.get('CouponCategory3')?.get('commencementDate')?.setValue(
        data.commencementDate ?
          new Date(
            `${data.commencementDate.split('-')[0]}-${data.commencementDate.split('-')[1]}-01`
          ).getTime() :
          new Date().getTime())
      this.CouponCategory3DateValue = (
        data.commencementDate ?
          new Date(
            `${data.commencementDate.split('-')[0]}-${data.commencementDate.split('-')[1]}-01`
          ).getTime() :
          new Date().getTime())
    }

    this.anamnesisDiscountForm.get('CouponCategory3')?.get('expiryDate')?.setValue(
      data.expiryDate ?
        new Date(
          `${data.expiryDate.split('-')[0]}-${data.expiryDate.split('-')[1]}-01`
        ).getTime() :
        new Date(new Date().setMonth(new Date().getMonth() + 5)).getTime()
    )
    this.CouponCategory3HighValue = (
      data.expiryDate ?
        new Date(
          `${data.expiryDate.split('-')[0]}-${data.expiryDate.split('-')[1]}-01`
        ).getTime() :
        new Date(new Date().setMonth(new Date().getMonth() + 5)).getTime()
    )
    this.couponTypeChange(3, data.couponType)
  }

  changeCouponCodeCategory3(couponCode: string) {
    const foundCouponCode = this.CouponCategory3DiscountList.find((res: any) => res.couponCode === couponCode)
    if (!foundCouponCode) {
      let startDate = new Date();
      const monthFirstDate = new Date(`${this.date.transform(new Date(), 'yyyy-MM-dd')?.split('-')[0]}-${this.date.transform(new Date(), 'yyyy-MM-dd')?.split('-')[1]}-01`);
      const currentdate = new Date();
      if (currentdate > monthFirstDate) {
        startDate = new Date(monthFirstDate.setMonth(monthFirstDate.getMonth() + 1))
      }
      this.setTimeRenge(3, this.date.transform(startDate, 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
    }
  }

  deleteCouponCodeCategory3(data: any) {
    this.CouponCategory3DeletePopup = true;
    this.CouponCategory3DeleteObj = data;
  }
  cancelDelete() {
    this.CouponCategory3DeletePopup = false;
    this.CouponCategory3DeleteObj = {};
  }

  async confirmDelete() {
    const reqData: any = {
      apiRequest: this.CouponCategory3DeleteObj,
    }
    await this.anamnesisSetupServiceService.DeleteDiscount3(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.toastr.success(`${this.CouponCategory3DeleteObj.couponCode} deleted successfully`)
          this.cancelDelete()
          this.getDiscoulnList3()
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error(`${this.CouponCategory3DeleteObj.couponCode} could not delete due some error`);
        }
      })
  }

  getDiscountReqObj(data: any, CouponCategory: number) {
    let commencementDateSplit = this.date.transform(data.commencementDate ? data.commencementDate : new Date(), 'yyyy-MM-dd')?.split('-')
    let commencementDate = new Date()
    switch (CouponCategory) {
      case 1:
        commencementDate = this.anamnesisDiscountList.length === 0 ? new Date(data.commencementDate) : commencementDateSplit ? new Date(`${commencementDateSplit[0]}-${commencementDateSplit[1]}-01`) : new Date()
        break;
      case 2:
        commencementDate = this.specialDiscountList.length === 0 ? new Date(data.commencementDate) : commencementDateSplit ? new Date(`${commencementDateSplit[0]}-${commencementDateSplit[1]}-01`) : new Date()
        break;
      case 3:
        commencementDate = commencementDateSplit ? new Date(`${commencementDateSplit[0]}-${commencementDateSplit[1]}-01`) : new Date()
        if (data.editInd) {
          const val = new Date(data.commencementDate)
          if (val < new Date()) {
            commencementDate = new Date()
          }
        }

        break;

      default:
        break;
    }
    return {
      couponCategory: data.couponCategory,
      couponCode: data.couponCode ? data.couponCode : '',
      couponCodeDescription: data.couponCodeDescription,
      couponType: data.couponType,
      commencementDate: commencementDate,
      expiryDate: new Date(this.utilityService.getTimeStamp(this.getLastDay(data.expiryDate), '23:59:59')),
      orderFloorLimit: data.orderFloorLimit ? +data.orderFloorLimit : 0,
      discountPercent: data.discountPercent ? +data.discountPercent : 0,
      discountFlatAmount: data.discountFlatAmount ? +data.discountFlatAmount : 0,
      maxDiscountAmount: data.maxDiscountAmount ? +data.maxDiscountAmount : 99999,
      transactionResult: data.transactionResult,
    }
  }

  async getDiscounts(menu?: any) {
    await this.anamnesisSetupServiceService.getDiscount()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (!this.couponCodeOptionListOfCouponCategory.length) {
            this.couponCodeOptionListOfCouponCategory = res.apiResponse.couponTypeList;
          }
          this.CouponCategory3DiscountList = res.apiResponse.couponDiscountDetailsList;
          this.anamnesisDiscountDetails = res.apiResponse.anamnesisDiscountDetails;
          this.anamnesisDiscountList = res.apiResponse.anamnesisCouponCodeDetailsList;
          this.specialDiscountDetails = res.apiResponse.specialDiscountDetails;
          this.specialDiscountList = res.apiResponse.specialCouponCodeDetailsList;
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('couponCategory')?.setValue(1)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('couponCode')?.setValue(this.anamnesisDiscountDetails.couponCode)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('couponCodeDescription')?.setValue(this.anamnesisDiscountDetails.couponCodeDescription)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('couponType')?.setValue(
            this.anamnesisDiscountDetails.couponType ?
              this.anamnesisDiscountDetails.couponType :
              'PCTAL'
          )
          this.couponTypeChange(1, this.anamnesisDiscountDetails.couponType ?
            this.anamnesisDiscountDetails.couponType :
            'PCTAL')
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('commencementDate')?.setValue(
            this.anamnesisDiscountDetails.commencementDate ?
              new Date(
                `${this.anamnesisDiscountDetails.commencementDate.split('-')[0]}-${this.anamnesisDiscountDetails.commencementDate.split('-')[1]}-01`
              ).getTime() :
              new Date().getTime())
          this.CouponCategory1DateValue = (
            this.anamnesisDiscountDetails.commencementDate ?
              new Date(
                `${this.anamnesisDiscountDetails.commencementDate.split('-')[0]}-${this.anamnesisDiscountDetails.commencementDate.split('-')[1]}-01`
              ).getTime() :
              new Date().getTime())
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('expiryDate')?.setValue(
            this.anamnesisDiscountDetails.expiryDate ?
              new Date(
                `${this.anamnesisDiscountDetails.expiryDate.split('-')[0]}-${this.anamnesisDiscountDetails.expiryDate.split('-')[1]}-01`
              ).getTime() :
              new Date(new Date().setMonth(new Date().getMonth() + 5)).getTime()
          )
          this.CouponCategory1HighValue = (
            this.anamnesisDiscountDetails.expiryDate ?
              new Date(
                `${this.anamnesisDiscountDetails.expiryDate.split('-')[0]}-${this.anamnesisDiscountDetails.expiryDate.split('-')[1]}-01`
              ).getTime() :
              new Date(new Date().setMonth(new Date().getMonth() + 5)).getTime()
          )
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('orderFloorLimit')?.setValue(this.anamnesisDiscountDetails.orderFloorLimit)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('discountPercent')?.setValue(this.anamnesisDiscountDetails.discountPercent)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('maxDiscountAmount')?.setValue(this.anamnesisDiscountDetails.maxDiscountAmount)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('discountFlatAmount')?.setValue(this.anamnesisDiscountDetails.discountFlatAmount)
          this.anamnesisDiscountForm.get('CouponCategory1')?.get('transactionResult')?.setValue('')
          if (!this.anamnesisDiscountList.length) {
            this.setTimeRenge(1, this.date.transform(new Date(), 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
          }
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('couponCategory')?.setValue(2)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('couponCode')?.setValue(this.specialDiscountDetails.couponCode)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('couponCodeDescription')?.setValue(this.specialDiscountDetails.couponCodeDescription)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('couponType')?.setValue(
            this.specialDiscountDetails.couponType ?
              this.specialDiscountDetails.couponType :
              'PCTAL'
          )
          this.couponTypeChange(2, this.specialDiscountDetails.couponType ?
            this.specialDiscountDetails.couponType :
            'PCTAL')
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('commencementDate')?.setValue(
            this.specialDiscountDetails.commencementDate ?
              new Date(
                `${this.specialDiscountDetails.commencementDate.split('-')[0]}-${this.specialDiscountDetails.commencementDate.split('-')[1]}-01`
              ).getTime() :
              new Date().getTime())
          this.CouponCategory2DateValue = (
            this.specialDiscountDetails.commencementDate ?
              new Date(
                `${this.specialDiscountDetails.commencementDate.split('-')[0]}-${this.specialDiscountDetails.commencementDate.split('-')[1]}-01`
              ).getTime() :
              new Date().getTime())
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('expiryDate')?.setValue(
            this.specialDiscountDetails.expiryDate ?
              new Date(
                `${this.specialDiscountDetails.expiryDate.split('-')[0]}-${this.specialDiscountDetails.expiryDate.split('-')[1]}-01`
              ).getTime() :
              new Date(new Date().setMonth(new Date().getMonth() + 5)).getTime()
          )
          this.CouponCategory2HighValue = (
            this.specialDiscountDetails.expiryDate ?
              new Date(
                `${this.specialDiscountDetails.expiryDate.split('-')[0]}-${this.specialDiscountDetails.expiryDate.split('-')[1]}-01`
              ).getTime() :
              new Date(new Date().setMonth(new Date().getMonth() + 5)).getTime()
          )
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('orderFloorLimit')?.setValue(this.specialDiscountDetails.orderFloorLimit)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('discountPercent')?.setValue(this.specialDiscountDetails.discountPercent)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('discountFlatAmount')?.setValue(this.specialDiscountDetails.discountFlatAmount)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('maxDiscountAmount')?.setValue(this.specialDiscountDetails.maxDiscountAmount)
          this.anamnesisDiscountForm.get('CouponCategory2')?.get('transactionResult')?.setValue('')
          if (!this.specialDiscountList.length) {
            this.setTimeRenge(2, this.date.transform(new Date(), 'yyyy-MM-dd'), this.date.transform(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'yyyy-MM-dd'))
          }
          if (menu) {
            this.activeMenue = menu;
          }
        } else {
          const unAuthorisedError = res.anamnesisErrorList.anErrorList.find((res: any) => res.errorCode === 'PRFL005E')
          if (unAuthorisedError) {
            this.toastr.error(unAuthorisedError.errorMessage)
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            if (menu) {
              this.activeMenue = menu;
            }
          }

        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Discount could not add due some error");
        }
      })
  }

  async getDiscoulnList3() {
    await this.anamnesisSetupServiceService.getDiscountList3()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.CouponCategory3DiscountList = res.apiResponse
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Discount list could not fetch due some error");
        }
      })
  }
  async getDiscoulnList12(data: any) {
    const reqData: any = {
      apiRequest: {
        couponCategory: data
      },
    }
    await this.anamnesisSetupServiceService.getDiscount12(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (data === 1) {
            // this.anamnesisDiscountDetails = res.apiResponse.anamnesisDiscountDetails;
            this.anamnesisDiscountList = res.apiResponse;
          } else {
            // this.specialDiscountDetails = res.apiResponse.specialDiscountDetails;
            this.specialDiscountList = res.apiResponse;
          }
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Discount could not fetch due some error");
        }
      })
  }

  getCouponTypeDescripion(couponType: any) {
    return this.couponCodeOptionListOfCouponCategory.find((res: any) => res.couponType === couponType) ?
      this.couponCodeOptionListOfCouponCategory.find((res: any) => res.couponType === couponType).couponTypeDescription : ''
  }
  // <-----AnamnesisDiscount End
  // Data upload start -->
  async uploadData(type: string){
    const delay = (ms:any) => new Promise(res => setTimeout(res, ms));
    const Data = this.dataUploadForm.get(type)?.getRawValue()
    let lastProcessedID = Data.lastProcessedID;
    let stop = false
    let loopCount = Math.round(Data.recordCount/500)
    if(Data.recordCount%500>0){
      loopCount++;
    }
    let remeningRecordCount = Data.recordCount;
    for (let index = 0; index < loopCount && !stop; index++) {
       if(remeningRecordCount<500){
        if(remeningRecordCount <Data.recordCount){
          await this.spinner.show()
          await delay(60000)
          await this.spinner.hide()
        }
         const reqData = {
          userID: Data.userID,
          userCode: Data.userCode,
          authenticationKey: Data.authenticationKey,
          lastProcessedID: lastProcessedID,
          recordCount: Data.recordCount%500,
          transactionResult: ''
        }
        await this.anamnesisSetupServiceService.UploadMed(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            lastProcessedID = res.apiResponse.lastProcessedID;
            remeningRecordCount = 0;
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            stop = true;
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error(`${type === 'MED' ? 'Medicine' : 'Household Item'} could not upload due some error`);
            stop = true;
          }
        }) 
       }else{
        if(remeningRecordCount <Data.recordCount){
          await this.spinner.show()
          await delay(60000)
          await this.spinner.hide()
        }
        const reqData = {
          userID: Data.userID,
          userCode: Data.userCode,
          authenticationKey: Data.authenticationKey,
          lastProcessedID: lastProcessedID,
          recordCount: 500,
          transactionResult: ''
        }
        await this.anamnesisSetupServiceService.UploadMed(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            lastProcessedID = res.apiResponse.lastProcessedID;
            remeningRecordCount = remeningRecordCount -500;
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            stop = true;
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error(`${type === 'MED' ? 'Medicine' : 'Household Item'} could not upload due some error`);
            stop = true;
          }
        }) 
       }
       if(remeningRecordCount === 0){
            this.toastr.success(`Medicine uploaded successfully`)
            this.resetForm(type)
            this.dataUploadForm.get(type)?.get('lastProcessedID')?.setValue(lastProcessedID)
            this.dataUploadForm.get(type)?.get('recordCount')?.setValue(500)
            if(type === 'MED'){
              this.medLastProcessedID = lastProcessedID;
            }else{
              this.hhiLastProcessedID = lastProcessedID;
            }
            
       } 
    }
  }
  
  resetForm(type: any) {
    this.dataUploadForm.get(type)?.get('authenticationKey')?.setValue('')
    this.dataUploadForm.get(type)?.get('lastProcessedID')?.setValue('')
    this.dataUploadForm.get(type)?.get('recordCount')?.setValue('')
  }

  getDataPuloadFormControl(type:any,controlName:any){
    let componentControlGroup = <any>this.dataUploadForm.get(type);
    return componentControlGroup.controls[controlName];
  }
  // Data upload end -->


  activeMenueChange = (menue: string) => {
    if (menue === 'LaboratoryTestPackages') {
      this.getLabTestList();
      this.activeMenue = menue;
    } else if (menue === 'AnamnesisDiscount') {
      this.getDiscounts('AnamnesisDiscount')
    } else if (menue === 'RoleTypeChange') {
      this.getRoleList();
      this.activeMenue = menue;
    } else if (menue === 'LaboratoryTest') {
      this.getInitialData();
      this.activeMenue = menue;
    }
    else if(menue === 'DataUpload'){
     const IsDataUploadShow = this.requestKeyDetails.userRoleList.find((val: any) => val.roleCode === 'EXC' || val.roleCode === 'SAD') ? true : false;
      if(IsDataUploadShow){
        this.activeMenue = menue;
      } else {
        this.toastr.error('You are not authorised for this action')
      }
    }
    else {
      this.activeMenue = menue;
    }
  }

  getPageName() {
    switch (this.activeMenue) {
      case 'RoleTypeChange':
        return 'Role Type Change';
      case 'LaboratoryTestPackages':
        return 'Laboratory Test Packages';
      case 'LaboratoryTest':
        return 'Laboratory Test';
      case 'AddNewEntity':
        return 'Add New Entity';
      case 'Physician':
        return 'Physician';
      case 'AuthoritySignatureAddition':
        return 'Authority Signature Addition';
      case 'PhysicianAppointmentBook':
        return 'Physician Appointment Book';
      case 'GSTSetup':
        return 'GST Setup';
      case 'AnamnesisDiscount':
        return 'Anamnesis Discount';
      case 'DataUpload':
        return 'Data Upload';
      default:
        return '';
    }
  }

  private intializingMedicineSeectionFormGroups = () => {
    this.RoleFormGroup = this.fb.group({
      userID: ['', [Validators.required, Validators.max(9999999999)]],
      name: [{ value: '', disabled: false }, [Validators.required]],
      roleCode: ['', [Validators.required]],
      deliveryRegion: [''],
      stateCode: [''],
      distributionZone: [''],
      deliveryZone: [''],
    });
    this.LaboratoryFormGroup = this.fb.group({
      laboratoryPackageName: ['', [Validators.required, Validators.minLength(2)]],
      laboratoryTestList: this.fb.array([this.addLaboratorytestGrop()])
    });
    this.LabTestFormGroup = this.fb.group({
      labtestName: ['', [Validators.required, Validators.minLength(2)]],
      specimenType: ['', [Validators.required]],
      trendChartType: [''],
      nonNumeric: [false],
      departmentCode: ['', [Validators.required]],
      banchMark: ['', [Validators.required]],
      resultType: ['V', [Validators.required]],
      unit: [''],
      labTestComponentCheck: [false],
      labTestComponentList: this.fb.array([])
    })
    const opensDayArr = ["N", "N", "N", "N", "N", "N", "N"]
    this.DiagnosticCenterFormGroup = this.fb.group({
      commercialEntityName: ['', [Validators.required, Validators.minLength(3)]],
      commercialType: ['', [Validators.required]],
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
    this.PhysicianFormGroup = this.fb.group({
      displayName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: ['', [Validators.required]],
      physicianSpecialisation: [''],
      physicianQualification: ['',],
      registrationNumber: [''],
      registrationAuthority: [''],
      primaryContactNumber: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      secondaryContactNumber: [''],
      emailID: ['', [Validators.required]],
      healthClinicID: [''],
      healthClinicName: [''],
      healthClinicSearch: [true],
      addressType: ['', [Validators.required]]
    })
    this.AuthorisedSignatoryFormGroup = this.fb.group({
      physicianDisplayName: ['', Validators.required],
      physicianFirstName: [''],
      physicianMiddleName: [''],
      physicianLastName: [''],
      stateCode: ['', Validators.required],
      stateName: [''],
      physicianQualification: [''],
      physicianSpecialisation: [''],
      registrationNumber: [''],
      registrationAuthority: [''],
      actionIndicator: ['ADD'],
      transactionResult: [''],

    })
    this.PhysicianAppointmentForm = this.fb.group({
      healthClinicID: ['', Validators.required],
      healthClinicName: [''],
      healthClinicSearch: [true],
      healthClinicAddress: [''],
      patientName: [''],
      patientSearch: [true],
      patientUserCode: ['', Validators.required],
      patientID: [''],
      physicianName: [''],
      physicianSearch: [true],
      physicianUserID: ['', Validators.required],
      physicianUserCode: [''],
      physicianProfilePictureID: [''],
      physicianPrimaryContactNo: [''],
      physicianQualification: [''],
      physicianSpecialisation: [''],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required]
    })
    this.GstForm = this.fb.group({
      gstItemList: this.fb.array([this.addGstFormGroup()]),
      ifErr: [false]
    })
    this.anamnesisDiscountForm = this.fb.group({
      CouponCategory1: this.fb.group({
        couponCategory: [1],
        couponCode: ['',],
        couponCodeDescription: ['', [Validators.required]],
        couponType: ['FLTAL'],
        commencementDate: [''],
        expiryDate: [''],
        orderFloorLimit: ['', [Validators.required]],
        discountPercent: ['', [Validators.required]],
        discountFlatAmount: ['', [Validators.required]],
        maxDiscountAmount: [''],
        transactionResult: ['']
      }),
      CouponCategory2: this.fb.group({
        couponCategory: [2],
        couponCode: [''],
        couponCodeDescription: [''],
        couponType: ['FLTAL'],
        commencementDate: [''],
        expiryDate: [''],
        orderFloorLimit: ['', [Validators.required]],
        discountPercent: ['', [Validators.required]],
        discountFlatAmount: ['', [Validators.required]],
        maxDiscountAmount: [''],
        transactionResult: ['']
      }),
      CouponCategory3: this.fb.group({
        couponCategory: [3],
        couponCode: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
        couponCodeDescription: [''],
        couponType: ['FLTAL'],
        commencementDate: [''],
        expiryDate: [''],
        orderFloorLimit: [''],
        discountPercent: [''],
        discountFlatAmount: [''],
        maxDiscountAmount: [''],
        transactionResult: [''],
        editInd: [false]
      }),
    })
    this.dataUploadForm = this.fb.group({
      MED: this.fb.group({
        userID: [''],
        userCode: [''],
        authenticationKey: ['', Validators.required],
        lastProcessedID: ['', Validators.required],
        recordCount: ['', Validators.required],
        transactionResult: ['']
      }),
      HHI: this.fb.group({
        userID: [''],
        userCode: [''],
        authenticationKey: ['', Validators.required],
        lastProcessedID: ['', Validators.required],
        recordCount: ['', Validators.required],
        transactionResult: ['']
      })

    })
  }

  private intializingMessage = () => {
    this.errorMessage.role = {
      userID: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_USERID,
        min: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MIN_LENGTH_USERID,
        max: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MAX_LENGTH_USERID
      },
      name: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_name,
      },
      roleCode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_ROLE_TYPE,
      },
      deliveryRegion: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_deliveryRegion,
      },
      stateCode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_stateCode,
      },
      distributionZone: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_distributionZone,
      },
      deliveryZone: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_deliveryZone,
      }
    };
    this.errorMessage.laboratoryTestPackage = {
      laboratoryPackageName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_laboratoryPackageName,
        minlength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MINLENGTH_laboratoryPackageName
      },
      laboratoryTestCode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_laboratoryTestCode,
        minlength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MINLENGTH_laboratoryTestName
      }
    };
    this.errorMessage.labTest = {
      labtestName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_laboratoryTestName,
        minLength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MINLENGTH_laboratoryTestName
      },
      specimenType: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_specimenType
      },
      trendChartType: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_trendChartType
      },
      normalRangeLow: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_normalRangeLow
      },
      normalRangeHigh: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_normalRangeHigh
      },
      banchMark: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_banchMark
      },
      resultType: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_resultType
      },
      componentName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_componentName
      },
      unit: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_unit
      },
      departmentCode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_departmentCode
      },
    };
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
    this.errorMessage.physicianForm = {
      displayName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianDisplayName,
      },
      firstName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianfirstName,
      },
      lastName: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianlastName,
      },
      physicianSpecialisation: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianSpecialisation,
      },
      physicianQualification: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianQualification,
      },
      registrationNumber: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianRegistrationNumber,
      },
      registrationAuthority: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianRegistrationAuthority,
      },
      primaryContactNumber: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianPrimaryContactNumber
      },
      emailID: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianEmailID,
      },
      healthClinicID: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianHealthClinicID
      },
      addressType: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_physicianAddressType
      }
    }
    this.errorMessage.AuthorisedSignatoryForm = {
      physicianDisplayName: {
        required: 'Authorised signatory name is required',
      },
      stateCode: {
        required: 'State is required',
      },
    }
    this.errorMessage.PhysicianAppointment = {
      physicianUserID: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_physicianUserID,
      },
      healthClinicID: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_healthClinicID,
      },
      patientUserCode: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_patientUserCode,
      },
      appointmentDate: {
        required: 'Appointment date is required',
      },
      appointmentTime: {
        required: 'Appointment time is required',
      },
    }
    this.errorMessage.GstForm = {
      itemCode: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_GST_itemCode,
      hsnSbaCode: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_GST_hsnSbaCode,
      cessRate: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_GST_cessRate,
      gstRateVariation: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_GST_gstRateVariation,
      gstRate: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_GST_gstRate,
    }
    this.errorMessage.anamnesisDiscountForm = {
      couponCode: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_couponCode,
        maxLength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MAXLENGTH_DISCOUNT_couponCode,
        minLength: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_MINLENGTH_DISCOUNT_couponCode,
      },
      couponCodeDescription: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_CouponCodeDescription,
      },
      couponType: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_couponType,
      },
      orderFloorLimit: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_OrderFloorLimit,
      },
      discountPercent: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_discountPercent,
      },
      discountFlatAmount: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_discountFlatAmount,
      },
      maxDiscountAmount: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_maxDiscountAmount,
      }
    }
    this.errorMessage.dataUploadForm = {
      lastProcessedID: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_lastProcessedID,
      },
      recordCount: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_recordCount,
      },
      authenticationKey: {
        required: ANAMNESIS_SETUP_ERROR_MESSAGE.ERR_MSG_REQUIERD_DISCOUNT_authenticationKey,
      }
    }
  }
  dateFormat(data: any) {
    return new Date(data)
  }
  phyedition() {
    this.physicianedition = !this.physicianedition;
  }
}
