import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-supplier-requisition',
  templateUrl: './supplier-requisition.component.html',
  styleUrls: ['./supplier-requisition.component.css']
})
export class SupplierRequisitionComponent implements OnInit {

  medicineConfirmation: boolean = false;
  errorMessage: any = {};
  itemSupplierForm: FormGroup;
  currentRequisitionNoSelectForm: FormGroup;
  proceedData: any;
  pharmacyDetails: any;
  requisitionNoList: any = [];
  isPharmacyUser: boolean = false;
  isRequisitionViewOnly: boolean = true;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    public supplierRequisitionService: SupplierRequisitionService,
  ) {
    this.intializingFormGroup()
    this.intializingMsg()
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.getRequisitionNoList()
    this.commonService.setRequestKeyDetails().then(res => {
      this.isPharmacyUser = res.userRoleList.find((val: any) => val.roleCode === 'PHH' || val.roleCode === 'PHU') ? true : false;
    })
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.valueChanges.subscribe(res => {
      if (res) {
        if (!this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.disabled) {
          const finddata = this.requisitionNoList.find((val: any) => val.requisitionNumber === res)
          this.selectRequisitionNo(finddata)
        }
      }
    })
  }

  selectRequisitionNo(data: any) {
    this.getDiagnosticCentreDetails(data.commercialID)
    this.getRequisitionDetails(data.requisitionNumber)
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.disable()
  }

  unselectRequisitionNo() {
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.setValue('')
    this.pharmacyDetails = null;
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.enable()
  }

  getDiagnosticCentreDetails = async (commercialID?: any) => {
    const reqData: any = {
      apiRequest: {
        commercialID: ''
      }
    }
    if (commercialID) {
      reqData.apiRequest.commercialID = commercialID
    }
    await this.supplierRequisitionService.GetDiagnosticCentreDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.pharmacyDetails = res.apiResponse;
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Diagnostic Centre Details couldn't fetch due some error");
        }
      })
  }

  getRequisitionNoList = async () => {
    const reqData: any = {
      apiRequest: {
      }
    }
    await this.supplierRequisitionService.GetSupplierRequisitionList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.requisitionNoList = res.apiResponse;
        } else {
          this.requisitionNoList = []
        }
      })
      .catch((err: any) => {
        this.requisitionNoList = []
      })
  }

  editRequisition() {
    this.isRequisitionViewOnly = false;
  }

  getRequisitionDetails = async (requisitionNo: any) => {
    const reqData: any = {
      apiRequest: {
        requisitionNumber: requisitionNo
      }
    }
    this.itemList().clear();
    await this.supplierRequisitionService.GetSupplierRequisitionDetails(reqData, 'SPRQ')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.isRequisitionViewOnly = true;
          this.createForm(res.apiResponse.requisitionLineEntryList ? res.apiResponse.requisitionLineEntryList : [])
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Diagnostic Centre Details couldn't fetch due some error");
        }
      })
  }

  createForm(data: any) {
    data.forEach((val: any, i: number) => {
      this.itemList().push(this.addItemGroup())
      let control = this.itemList().at(i)
      control.get('itemName')?.setValue(val.itemName)
      control.get('itemCode')?.setValue(val.itemCode)
      control.get('quantity')?.setValue(val.itemQuantity)
      control.get('updatedQuantity')?.disable();
    })
  }

  itemSelect(itemIndex: number) {
    this.itemList().at(itemIndex).get('isEdit')?.setValue(false);
    this.itemList().at(itemIndex).get('updatedQuantity')?.setValue('');
    this.itemList().at(itemIndex).get('updatedQuantity')?.disable()
    this.itemList().at(itemIndex).get('errMsg')?.setValue('');
    this.itemList().at(itemIndex).get('err')?.setValue(false);
  }

  updatequantity(itemIndex: number) {
    this.itemList().at(itemIndex).get('isEdit')?.setValue(true);
    this.itemList().at(itemIndex).get('updatedQuantity')?.enable();
  }

  updateQuantityChange(itemIndex: number, data: any) {
    if (data && data.length) {
      if (!this.commonService.checkUserNumber(data)) {
        this.itemList().at(itemIndex).get('updatedQuantity')?.setValue('')
      } else {
        const updatedQuantity = this.itemList().at(itemIndex).get('updatedQuantity')?.value
        const quantity = this.itemList().at(itemIndex).get('quantity')?.value
        if (+quantity < +updatedQuantity) {
          this.itemList().at(itemIndex).get('errMsg')?.setValue('More than ordered item')
          this.itemList().at(itemIndex).get('err')?.setValue(true)
          this.itemList().at(itemIndex).get('war')?.setValue(false)
        } else if (+quantity > +updatedQuantity) {
          this.itemList().at(itemIndex).get('errMsg')?.setValue('Less than ordered item')
          this.itemList().at(itemIndex).get('war')?.setValue(true)
          this.itemList().at(itemIndex).get('err')?.setValue(false)
        } else {
          this.itemList().at(itemIndex).get('errMsg')?.setValue('')
          this.itemList().at(itemIndex).get('war')?.setValue(false)
          this.itemList().at(itemIndex).get('err')?.setValue(false)
        }
      }
    }
  }

  itemList() {
    return this.itemSupplierForm.get('itemList') as FormArray;
  }

  addItemGroup() {
    return this.fb.group({
      itemName: [''],
      itemCode: [''],
      quantity: [{ value: '', disabled: true }],
      updatedQuantity: [''],
      isEdit: [false],
      isSelect: [false],
      errMsg: [''],
      err: [false],
      war: [false]
    });
  }

  selectedItemQuantity() {
    const data = this.itemList()?.getRawValue()
    const activeList = data.filter((res: any) => res.isSelect === true);
    return activeList ? activeList.length : 0
  }

  private intializingFormGroup() {
    this.itemSupplierForm = this.fb.group({
      itemList: this.fb.array([])
    });
    this.currentRequisitionNoSelectForm = this.fb.group({
      currentRequisitionNo: ['']
    });
  }

  private intializingMsg() {
    this.errorMessage = {
    };
  }

  medicineProceed() {
    this.proceedData = {
      itemList: this.itemList().getRawValue().filter((res: any) => res.isSelect === true),
      requisitionNumber: this.currentRequisitionNoSelectForm.getRawValue().currentRequisitionNo,
      totalItemCount:this.itemList().length
    }
    if (this.proceedData.itemList.length) {
      this.medicineConfirmation = true
    }
  }

  isDisabledproceed() {
    if (this.itemList().getRawValue().filter((res: any) => res.isSelect === true).length) {
      return true
    } else {
      return false
    }
  }

  cllosePopup(event: any) {
    if (event) {
      this.unselectRequisitionNo();
      this.getRequisitionNoList()
    }
    this.medicineConfirmation = false
  }

  getOpeningDays(days: any) {
    if (days && days.length > 0) {
      const totalDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const openDays: any = [];
      days.split("").forEach((day: any, index: any) => {
        if (day === "Y") {
          openDays.push(totalDays[index]);
        }
      });
      return openDays.join(', ');
    }
    return "";
  }

}
