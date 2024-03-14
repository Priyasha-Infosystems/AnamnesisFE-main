import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ADDRESS_ERROR_MESSAGE } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { AddressService } from '@services/address.service';
import { CommonService } from '@services/common.service';
import { ToastrService } from 'ngx-toastr';
import { FormService } from 'src/app/services/form.service';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.css']
})

export class AddressModalComponent implements OnInit {
  @Input() newAddress: boolean;
  @Input() selectedAddress: any;
  @Input() stateList: any;
  @Input() isProfile: boolean;

  public addressParam: FormGroup;

  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();

  addressResponseError: string = "";
  addressFormError: string = "";
  errorMessage: any = {};

  freshAddress = {
    customerAddress: "",
    customerCity: "",
    customerContactNo: "",
    customerName: "",
    customerLandmark: "",
    customerPinCode: "",
    customerStateName: "",
    addressType: "",
    isDefault: false,
    addressIdentifier: ""
  }

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    public addressService: AddressService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef
  ) {
    this.addressParam = this.fb.group({
      customerName: ['', [Validators.required]],
      customerAddress: ['', [Validators.required]],
      customerErrMsg: [''],
      customerLandmark: [''],
      customerContactNo: ['', [Validators.required]],
      customerCity: ['', [Validators.required]],
      customerStateName: ['', [Validators.required]],
      customerPinCode: ['', [Validators.required]],
      addressType: ['', [Validators.required]],
      addressIdentifier: ['', [Validators.required]],
      customerCountry: ["India"]
    });
  }

  resetError() {
    this.addressFormError = "";
    this.addressResponseError = "";
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  selectAddressType(type: string){
    this.addressParam.get('addressType')?.setValue(type)
  }

  getAddressType(){
    return this.addressParam.get('addressType')?.getRawValue()
  }

  onChanges(): void {
    if(!this.newAddress && this.selectedAddress){
      this.addressParam.patchValue(this.selectedAddress )
      this.addressParam.get('customerPinCode')?.setValue(this.selectedAddress.customerPincode)
    }
    this.addressParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
    if (this.newAddress) {
      this.selectedAddress = this.freshAddress;
    }
    this.setValidators();
    this.intializingMessage();
    this.onChanges()
    this.addressParam.get('customerAddress')?.valueChanges.subscribe((res:string)=>{
      let count:any|null = []
      count = res.split('\n')
      if(count.length>2){
        this.addressParam.get('customerErrMsg')?.setValue('Maximum two address line are allowed')
      }else{
        this.addressParam.get('customerErrMsg')?.setValue('')
      }
    })
  }

  intializingMessage() {
    // call api to set the error messages per block
    this.errorMessage.customerName = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_NAME
    };
    this.errorMessage.customerAddress = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_ADDRESS
    };
    this.errorMessage.customerLandmark = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_LANDMARK
    };
    this.errorMessage.customerContactNo = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_CONTACT,
      pattern: "Please enter a valid number"
    };
    this.errorMessage.customerCity = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_CITY
    };
    this.errorMessage.customerStateName = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_STATE
    };
    this.errorMessage.customerPinCode = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_PIN,
      pattern: "Please enter a valid PIN"
    };
    this.errorMessage.addressType = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_TYPE
    };
    this.errorMessage.addressIdentifier = {
      required: ADDRESS_ERROR_MESSAGE.ERR_MSG_REQUIERD_IDENTIFIER
    };
  }

  setValidators() {
    this.addressParam.controls["customerContactNo"].setValidators([
      Validators.required, Validators.pattern('[0-9]{10,10}')
    ]);
    this.addressParam.controls["customerContactNo"].updateValueAndValidity();
    this.addressParam.controls["customerPinCode"].setValidators([
      Validators.required, Validators.pattern('[0-9]{6,6}')
    ]);
    this.addressParam.controls["customerPinCode"].updateValueAndValidity();
  }

  closeAddressPopup() {
    this.close.emit();
  }

  manageAddress = async (data: any, isValid: boolean) => {
    const reqObj = { ...data };
    if (!this.newAddress) {
      reqObj.addressID = this.selectedAddress.addressID;
      reqObj.customerDefault = this.selectedAddress.customerDefault;
    } else {
      reqObj.customerDefault = false;
    }
    reqObj.lattitude = "";
    reqObj.longitude = "";
    this.formService.markFormGroupTouched(this.addressParam);
    this.resetError();
    if (isValid && !data.customerErrMsg) {
      reqObj.customerStateCode = this.stateList.find((state: any) => state.stateName === data.customerStateName)?.stateCode;
      const reqData = {
        apiRequest: reqObj,
      }
      if (this.newAddress) {
        await this.addressService.addAddress(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.close.emit(true);
              this.toastr.success("Address updated successfully");
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Address couldn't be updated due some error");
            }
          })
      } else {
        await this.addressService.changeAddress(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.close.emit(true);
              this.toastr.success("Address updated successfully");
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Address couldn't be updated due some error");
            }
          })
      }
    }
  }
}
