import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ANAMNESIS_SETUP_ERROR_MESSAGE } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { AnamnesisSetupServiceService } from '@services/anamnesis-setup-service.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-physician-edition',
  templateUrl: './physician-edition.component.html',
  styleUrls: ['./physician-edition.component.css']
})
export class PhysicianEditionComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  PhysicianFormGroup:FormGroup;
  public physicianOpenAddressModal: boolean = false;
  public stateList: any = [];
  public physicianAddNewAddress: boolean = true;
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
  public physicianErrMSG: any = '';
  public addressError:string = ''
  public errorMessage: any = {};
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private anamnesisSetupServiceService: AnamnesisSetupServiceService,
    private store: Store<any>
  ) {
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
   }

  ngOnInit(): void {
    this.getStateDetails();
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
  }

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

  closePopup(){
    this.close.emit()
  }

}
