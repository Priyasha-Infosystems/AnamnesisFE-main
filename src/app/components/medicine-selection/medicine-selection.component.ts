import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MEDICINE_SELECTION_ERROR_MESSAGE } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, Observable, of, startWith } from 'rxjs';
import { IMedicine, ISelectedMedicine } from 'src/app/models/medicineSelectin.model';

@Component({
  selector: 'app-medicine-selection',
  templateUrl: './medicine-selection.component.html',
  styleUrls: ['./medicine-selection.component.css']
})
export class MedicineSelectionComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  addressID:string;
  @Input()
  couponCode:any;
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger }) matAutoComplete: MatAutocompleteTrigger;
  public medicineSeectionFormGroup: FormGroup;
  public selectedMedicineList: Array<any> = [];
  public medicineList: Array<any>;
  public medicineGroupOptions: any[];
  public errorMessage: any = {};
  public customErrorFormMsg: string;
  public customErrorAddToCartMsg: string;
  public preSearchvalue: string = '';
  public medicineDetailsModal: boolean = false;
  public showMedicineCode: string = '';
  public requestKeyDetails: any;
  public medicineSearchErrMsg: string = '';
  private isMedAddtoCartFromDetails:boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private medicineSelectionService: MedicineSelectionService
  ) {
    this.intializingMedicineSeectionFormGroup()
  }

  intializingMedicineSeectionFormGroup() {
    this.medicineSeectionFormGroup = this.fb.group({
      medicine: ['', [Validators.required]],
      searchMode: [true],
      count: [null, [Validators.required]],
      medicineQuantityLimit:[0]
    })
  }

  setValidators() {
    this.medicineSeectionFormGroup.controls["medicine"].setValidators([
      Validators.required
    ]);
    this.medicineSeectionFormGroup.controls["medicine"].updateValueAndValidity();
    this.medicineSeectionFormGroup.controls["count"].setValidators([
      Validators.required, Validators.min(1)
    ]);
    this.medicineSeectionFormGroup.controls["count"].updateValueAndValidity();
  }

  ngOnInit(): void {
    this.medicineList = [];
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.setValidators()
    this.intializingMessage();
    this.medicineSeectionFormGroup.get('medicine')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.medicineSeectionFormGroup.get('searchMode')?.value === true) {
          this.getMedicileList(response);
        }
      })
  }

  addToCart = async () => {
    const reqData: any = {
      apiRequest: []
    }
    if (this.selectedMedicineList.length) {
      let seqNo: number = 0;
      this.selectedMedicineList.forEach((val, index) => {
        seqNo = seqNo + 1;
        const tempMedicine = {
          userID: this.requestKeyDetails.userID,
          cartItemSeqNo: '',
          itemType: 'MD',
          itemCode: val.medicineCode,
          itemCategory:val.medicineCategory,
          quantity: val.count,
          addressID: this.addressID,
          couponCode: this.couponCode,
          itemStatus:val.medicineStatus,
          actionIndicator: 'ADD',
          transactionResult: '',
        }
        reqData.apiRequest.push(tempMedicine);
      })
      await this.medicineSelectionService.addToCart(reqData)
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
          this.toastr.error("Medicines couldn't move to cart due some error");
          }
        })
    } else {
      this.customErrorAddToCartMsg = 'No medicine for cart';
      setTimeout(() => { this.customErrorAddToCartMsg = '' }, 1500);
    }
  }

  getMedicileList = async (searchString: string) => {
    this.medicineGroupOptions = [];
    const reqData: any = {
      apiRequest: { medicineKeyword: searchString,indicator: 'S' }
    }
    await this.medicineSelectionService.getMedicineList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicineList = [...res.apiResponse.medicineSearchList];
          this.medicineGroupOptions = this.filter('');
          this.matAutoComplete.openPanel();
        } else {
          this.medicineSearchErrMsg = res.anamnesisErrorList.anErrorList[0].errorMessage
          setTimeout(() => this.medicineSearchErrMsg = '', 1500);
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine List couldn't fetch due some error");
        }
      })
  }

  addOneMedicine(index: number) {
    const limit = this.selectedMedicineList[index].medicineQuantityLimit?this.selectedMedicineList[index].medicineQuantityLimit:10;
      if (this.selectedMedicineList[index].count < limit) {
        this.selectedMedicineList[index].count = this.selectedMedicineList[index].count + 1
      } else {
        this.selectedMedicineList[index].errorMsg = `Limit is ${limit} for this item`
        setTimeout(() => { this.selectedMedicineList[index].errorMsg = '' }, 1500);
      }
  }

  selectMedicine(data: any, isVAlid: boolean) {
    let Continue = true;
    this.formService.markFormGroupTouched(this.medicineSeectionFormGroup);
    if (isVAlid) {
      if(data.medicineQuantityLimit){
        if(+data.count>data.medicineQuantityLimit){
          Continue = false;
          this.customErrorFormMsg = `Limit is ${data.medicineQuantityLimit} for this item`;
          setTimeout(() => { this.customErrorFormMsg = '' }, 1500);
        }
      }else{
        if(+data.count>10){
          Continue = false;
          this.customErrorFormMsg = `Limit is 10 for this item`;
          setTimeout(() => { this.customErrorFormMsg = '' }, 1500);
        }
      }
      if(Continue){
        const selectedMedicineDetails = this.medicineList.find(res => res.medicineName === data.medicine);
        if (selectedMedicineDetails) {
          const selectedMedicine: any = {
            medicineCode: selectedMedicineDetails.medicineCode,
            medicineName: selectedMedicineDetails.medicineName,
            composition: selectedMedicineDetails.medicineComposition,
            medicineStatus:selectedMedicineDetails.medicineStatus,
            count: data.count,
            medicineQuantityLimit: selectedMedicineDetails.medicineQuantityLimit,
            medicineCategory:selectedMedicineDetails.medicineCategory
          }
          if (!this.selectedMedicineList.find(res => res.medicineCode === selectedMedicine.medicineCode)) {
            this.selectedMedicineList.push(selectedMedicine);
            this.medicineSeectionFormGroup.reset()
              this.medicineList = [];
             this.medicineGroupOptions = [];
          } else {
            this.customErrorFormMsg = 'this medicine you already chosen';
            setTimeout(() => { this.customErrorFormMsg = '' }, 1500);
          }
        }
      }
    }
  }

  optionSelected() {
    this.formService.markFormGroupUnTouched(this.medicineSeectionFormGroup);
    const selectedMedicineDetails = this.medicineList.find(res => res.medicineName === this.medicineSeectionFormGroup.get('medicine')?.value);
    if (selectedMedicineDetails) {
      if (selectedMedicineDetails.medicineQuantityLimit !== 0) {
        this.medicineSeectionFormGroup.controls["count"].setValidators([
          Validators.required, Validators.min(1), Validators.max(selectedMedicineDetails.medicineQuantityLimit)
        ]);
        this.medicineSeectionFormGroup.controls["count"].updateValueAndValidity();
        this.errorMessage.quantity.max = MEDICINE_SELECTION_ERROR_MESSAGE.ERR_MSG_MAX_VALUE_MEDICINE_COUNT + selectedMedicineDetails.medicineQuantityLimit;
      }
      this.medicineSeectionFormGroup.get('searchMode')?.setValue(false);
      this.medicineSeectionFormGroup.get('medicineQuantityLimit')?.setValue(selectedMedicineDetails.medicineQuantityLimit?selectedMedicineDetails.medicineQuantityLimit:0);
    }
  }

  subtractOneMedicine(index: number) {
    if (this.selectedMedicineList[index].count !== 1) {
      this.selectedMedicineList[index].count = this.selectedMedicineList[index].count - 1
    }
  }

  removeMedicine(index: number) {
    this.selectedMedicineList.splice(index, 1);
  }

  filter = (value: any): any[] => {
    const filterValue = value.toLowerCase();
    return this.medicineList.filter(item => item.medicineName.toLowerCase().includes(filterValue));
  };

  medicineListfetch(searchString: string) {
    this.medicineSeectionFormGroup.controls["medicine"].setValidators([
      Validators.required, Validators.minLength(3)
    ]);
    this.medicineSeectionFormGroup.controls["medicine"].updateValueAndValidity();
    this.medicineSeectionFormGroup.controls["count"].clearValidators();
    this.medicineSeectionFormGroup.controls["count"].updateValueAndValidity();
    this.formService.markFormGroupTouched(this.medicineSeectionFormGroup);
    if (this.medicineSeectionFormGroup.get('medicine')?.valid && this.preSearchvalue !== searchString) {
      this.getMedicileList(searchString);
      this.preSearchvalue = searchString;
    }
    this.matAutoComplete.openPanel()
  }

  changeValidator() {
    this.formService.markFormGroupUnTouched(this.medicineSeectionFormGroup);
    this.medicineSeectionFormGroup.controls["medicine"].setValidators([
      Validators.required, Validators.minLength(0)
    ]);
    this.medicineSeectionFormGroup.controls["medicine"].updateValueAndValidity();
    this.medicineSeectionFormGroup.controls["count"].setValidators([
      Validators.required, Validators.min(1)
    ]);
    this.medicineSeectionFormGroup.controls["count"].updateValueAndValidity();
    this.medicineSeectionFormGroup.get('searchMode')?.setValue(true);
  }

  closeMedicnePopup() {
    if(this.isMedAddtoCartFromDetails === true){
      this.close.emit(true);
    }else{
      this.close.emit(false);
    }
  }

  openMedicineDetailsModal(medicineCode: string) {
    this.showMedicineCode = medicineCode;
    this.medicineDetailsModal = true;
  }

  closePopupMedicineDetails(data:any) {
    this.showMedicineCode = '';
    this.medicineDetailsModal = false;
    if(data){
      this.isMedAddtoCartFromDetails = true;
    }
  }

  private intializingMessage() {
    this.errorMessage.medicine = {
      required: MEDICINE_SELECTION_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINE,
      minLength: MEDICINE_SELECTION_ERROR_MESSAGE.ERR_MSG__MINLENGTH_MEDICINE
    };
    this.errorMessage.quantity = {
      required: MEDICINE_SELECTION_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINE_COUNT,
      min: MEDICINE_SELECTION_ERROR_MESSAGE.ERR_MSG_MIN_VALUE_MEDICINE_COUNT,
      max: MEDICINE_SELECTION_ERROR_MESSAGE.ERR_MSG_MAX_VALUE_MEDICINE_COUNT
    };
  }
}
