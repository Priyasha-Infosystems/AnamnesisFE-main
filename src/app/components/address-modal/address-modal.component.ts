import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ADDRESS_ERROR_MESSAGE } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { AddressService } from '@services/address.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';

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
  @Input() isApiCall: boolean;
  @Input() addressType: string;
  public addressParam: FormGroup;
  public stateList1: Array<any> = [];
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  addressResponseError: string = "";
  addressFormError: string = "";
  errorMessage: any = {};

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    public addressService: AddressService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private store: Store<any>,
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
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList1 = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  resetError() {
    this.addressFormError = "";
    this.addressResponseError = "";
  }

  onChanges(): void {
    this.addressParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.addressParam.get('addressType')?.setValue(this.addressType)
    if (!this.newAddress) {
      this.addressParam.patchValue(this.selectedAddress)
    }
    this.setValidators();
    this.intializingMessage();
    this.onChanges();
    this.addressParam.get('customerPinCode')?.valueChanges.subscribe(res => {
      if (res) {
        if (res.length) {
          if (!this.commonService.checkUserNumber(res)) {
            this.addressParam.get('customerPinCode')?.setValue('')
          }
        }
      }
    })
    this.addressParam.get('customerContactNo')?.valueChanges.subscribe(res => {
      if (res) {
        if (res.length) {
          if (!this.commonService.checkUserNumber(res)) {
            this.addressParam.get('customerContactNo')?.setValue('')
          }
        }
      }
    })
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
    reqObj.customerStateCode = this.stateList.find((state: any) => state.stateName === data.customerStateName)?.stateCode;
    this.formService.markFormGroupTouched(this.addressParam);
    this.resetError();
    if (isValid && !data.customerErrMsg) {
      const reqData = {
        apiRequest: reqObj,
      }
      this.close.emit(data)
    }
  }
}
