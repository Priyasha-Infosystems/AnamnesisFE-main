import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { HOUSE_HOLD_SELECTION_ERROR_MESSAGE, MEDICINE_SELECTION_ERROR_MESSAGE } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, startWith } from 'rxjs';
import { IHealthEquipment, ISelectedHealthEquipment } from 'src/app/models/healthEquipmwntSelection.model';

@Component({
  selector: 'app-healthcare-equipment-selection',
  templateUrl: './healthcare-equipment-selection.component.html',
  styleUrls: ['./healthcare-equipment-selection.component.css']
})
export class HealthcareEquipmentSelectionComponent implements OnInit {
  @Input()
  addressID:string;
  @Input()
  couponCode:any;
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger }) matAutoComplete: MatAutocompleteTrigger;
  public hcEquipmentSeectionFormGroup: FormGroup;
  public errorMessage: any = {};
  public customErrorFormMsg: string;
  public customErrorAddToCartMsg: string;
  public selectedHealthcareEquipmentList: Array<any> = [];
  public healthEquipmentList: Array<any>;
  public healthEquipmentGroupOptions: any[];
  public preSearchvalue: string = '';
  public requestKeyDetails: any;
  showhouseHoldItemDetails: boolean = false;
  showHouseholdItemCode: string;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private healthEquipmentService: HealthEquipmentService
  ) {
    this.intializingMedicineSeectionFormGroup()
  }
  intializingMedicineSeectionFormGroup() {
    this.hcEquipmentSeectionFormGroup = this.fb.group({
      householdItemName: ['', [Validators.required]],
      householdItemCode: ['', [Validators.required]],
      householdItemDescription: [''],
      householdItemUnitPrice: ['',],
      householdItemStatus: ['',],
      searchMode: [true],
      count: [null, [Validators.required]],
      householdItemCategory:['']
    })
  }

  ngOnInit(): void {
    this.healthEquipmentList = [];
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.intializingMessage();
    this.hcEquipmentSeectionFormGroup.get('householdItemName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.hcEquipmentSeectionFormGroup.get('searchMode')?.value === true) {
          this.getHealthcareEquipmentleList(response);
        }
      })
    this.hcEquipmentSeectionFormGroup.get('count')!.valueChanges.subscribe(res => {
      if (!this.commonService.checkUserNumber(res)) {
        const oldVal: string = res
        this.hcEquipmentSeectionFormGroup.get('count')!.setValue(oldVal.substring(0, oldVal.length - 1))
      }
    })
  }

  addToCart = async () => {
    const reqData: any = {
      apiRequest: []
    }
    if (this.selectedHealthcareEquipmentList.length) {
      let seqNo: number = 0;
      this.selectedHealthcareEquipmentList.forEach((val, index) => {
        seqNo = seqNo + 1;
        const tempMedicine = {
          userID: this.requestKeyDetails.userID,
          cartItemSeqNo: '',
          prescriptionID: '',
          itemType: 'HI',
          itemCode: val.householdItemCode,
          itemCategory:'',
          packageID: '',
          quantity: +val.count,
          addressID: this.addressID,
          couponCode: this.couponCode,
          itemStatus:val.householdItemStatus,
          actionIndicator: 'ADD',
        }
        reqData.apiRequest.push(tempMedicine);
      })
      await this.healthEquipmentService.addToCart(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Item has been placed to cart successfully');
            this.close.emit(true);
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Equipment couldn't move to cart due some error");
          }
        })
    } else {
      this.customErrorAddToCartMsg = 'No epuipment for cart';
      setTimeout(() => { this.customErrorAddToCartMsg = '' }, 1500);
    }
  }

  addOneHealthcareEquipment(index: number) {
    if(this.selectedHealthcareEquipmentList[index].count<=9){
      this.selectedHealthcareEquipmentList[index].count = +this.selectedHealthcareEquipmentList[index].count + 1
    }else{
      this.selectedHealthcareEquipmentList[index].errorMsg = `Limit is 10 for this item`;
      setTimeout(() => {
        this.selectedHealthcareEquipmentList[index].errorMsg = '';
      }, 1500);
    }
    
  }

  subtractOneHealthcareEquipment(index: number) {
    if (+this.selectedHealthcareEquipmentList[index].count !== 1) {
      this.selectedHealthcareEquipmentList[index].count = +this.selectedHealthcareEquipmentList[index].count - 1
    }
  }

  removeHealthcareEquipment(index: number) {
    this.selectedHealthcareEquipmentList.splice(index, 1);
  }

  saveHouseHoldItem(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.hcEquipmentSeectionFormGroup);
    if (isValid) {
      if(+data.count <=10){
        const foundItem = this.selectedHealthcareEquipmentList.find((res: any) => res.householdItemName === data.householdItemName)
        if (foundItem) {
          this.customErrorFormMsg = 'This item is already selected';
          setTimeout(() => this.customErrorFormMsg = '', 1500);
        } else {
          this.selectedHealthcareEquipmentList.push(data)
          this.hcEquipmentSeectionFormGroup.reset()
          this.hcEquipmentSeectionFormGroup.get('searchMode')?.setValue(true)
          this.healthEquipmentList = [];
          this.healthEquipmentGroupOptions = [];
        }
      }else{
        this.customErrorFormMsg = 'Limit is 10 for this item';
          setTimeout(() => this.customErrorFormMsg = '', 1500);
      }
      
    }
  }

  optionSelected(healthEquipment: any) {
    this.hcEquipmentSeectionFormGroup.get('householdItemName')?.setValue(healthEquipment.householdItemName);
    this.hcEquipmentSeectionFormGroup.get('householdItemCode')?.setValue(healthEquipment.householdItemCode);
    this.hcEquipmentSeectionFormGroup.get('householdItemDescription')?.setValue(healthEquipment.householdItemDescription);
    this.hcEquipmentSeectionFormGroup.get('householdItemUnitPrice')?.setValue(healthEquipment.householdItemUnitPrice);
    this.hcEquipmentSeectionFormGroup.get('householdItemCategory')?.setValue(healthEquipment.householdItemCategory);
    this.hcEquipmentSeectionFormGroup.get('householdItemStatus')?.setValue(healthEquipment.householdItemStatus);
    this.hcEquipmentSeectionFormGroup.get('count')?.setValue(null);
    this.hcEquipmentSeectionFormGroup.get('searchMode')?.setValue(false);
  }

  getHealthcareEquipmentleList = async (searchString: string) => {
    const reqData: any = {
      apiRequest: { searchKeyword: searchString ,indicator: 'S' }
    }
    await this.healthEquipmentService.getHealthcareEquipmentleList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.healthEquipmentList = [...res.apiResponse.householdItemDetailsList];
          this.healthEquipmentGroupOptions = this.filter('');
          this.matAutoComplete.openPanel();
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Equipment List couldn't fetch due some error");
        }
      })
  }

  filter = (value: any): any[] => {
    const filterValue = value.toLowerCase();
    return this.healthEquipmentList.filter(item => item.householdItemName.toLowerCase().includes(filterValue));
  };

  closeHealthcareEquipmentPopup() {
    this.close.emit(false);
  }

  private intializingMessage() {
    this.errorMessage.householdItemName = {
      required: HOUSE_HOLD_SELECTION_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOUSE_HOLD,
      minLength: HOUSE_HOLD_SELECTION_ERROR_MESSAGE.ERR_MSG__MINLENGTH_HOUSE_HOLD
    };
    this.errorMessage.quantity = {
      required: HOUSE_HOLD_SELECTION_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOUSE_HOLD_COUNT,
      min: HOUSE_HOLD_SELECTION_ERROR_MESSAGE.ERR_MSG_MIN_VALUE_HOUSE_HOLD_COUNT,
      max: HOUSE_HOLD_SELECTION_ERROR_MESSAGE.ERR_MSG_MAX_VALUE_HOUSE_HOLD_COUNT
    };
  }

  openHouseItemDetails(houseHoldItemCode: string) {
    if (houseHoldItemCode) {
      this.showhouseHoldItemDetails = true;
      this.showHouseholdItemCode = houseHoldItemCode;
    }
  }
  closeHouseItemDetails() {
    this.showhouseHoldItemDetails = false;
    this.showHouseholdItemCode = '';
  }
}
