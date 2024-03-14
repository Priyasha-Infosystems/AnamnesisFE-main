import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-pickup',
  templateUrl: './order-pickup.component.html',
  styleUrls: ['./order-pickup.component.css']
})
export class OrderPickupComponent implements OnInit {
  medicineConfirmation: boolean = false;
  errorMessage: any = {};
  itemSupplierForm: FormGroup;
  currentRequisitionNoSelectForm: FormGroup;
  proceedData: any;
  pharmacyDetails: any;
  requisitionNoList: any = [];
  isPharmacyUser: boolean = false;
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
    this.getRequisitionNoList('')
    this.commonService.setRequestKeyDetails().then(res => {
      this.isPharmacyUser = res.userRoleList.find((val: any) => val.roleCode === 'PHH' || val.roleCode === 'PHU') ? true : false;
    })
  }

  /**
   * @todo RequisitionNoList api map
   */
  getRequisitionNoList = async (commercialID: any) => {
    const reqData: any = {
      apiRequest: {
        commercialID: ''
      }
    }
    await this.supplierRequisitionService.GetDiagnosticCentreDetails(reqData)
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

  selectRequisitionNo(data: any) {
    this.getDiagnosticCentreDetails(data.commercialID)
    this.getRequisitionDetails(data.requisitionNumber)
  }

  unselectRequisitionNo() {
    this.itemSupplierForm.get('currentRequisitionNo')?.setValue('');
    this.itemList().clear();
  }

  getRequisitionDetails = async (requisitionNo: any) => {
    const reqData: any = {
      apiRequest: {
        RequisitionNo: requisitionNo
      }
    }
    await this.supplierRequisitionService.GetDiagnosticCentreDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.createForm(res.apiResponse)
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

  createForm(data: any) {
    const data1 = [
      {
        itemName: 'Abcd',
        itemCode: 'ABCD1234',
        quantity: 10,
      },
      {
        itemName: 'Efgh',
        itemCode: 'EFGH1234',
        quantity: 12,
      },
      {
        itemName: 'Xyz',
        itemCode: 'XYZ01234',
        quantity: 8,
      },
      {
        itemName: 'Mnop',
        itemCode: 'MNOP1234',
        quantity: 5,
      },
      {
        itemName: 'Ijkl',
        itemCode: 'IJKL1234',
        quantity: 13,
      },
      {
        itemName: 'Ijkl',
        itemCode: 'IJKL1234',
        quantity: 13,
      },
      {
        itemName: 'Ijkl',
        itemCode: 'IJKL1234',
        quantity: 13,
      },
    ]
    data1.forEach((val: any, i: number) => {
      this.itemList().push(this.addItemGroup())
      let control = this.itemList().at(i)
      control.get('itemName')?.setValue(val.itemName)
      control.get('itemCode')?.setValue(val.itemCode)
      control.get('quantity')?.setValue(val.quantity)
      control.get('updatedQuantity')?.disable();
    })
  }

  updateQuantityChange(itemIndex: number, data: any) {
    if (data && data.length) {
      if (!this.commonService.checkUserNumber(data)) {
        this.itemList().at(itemIndex).get('updatedQuantity')?.setValue('')
      }
    }
  }

  itemList() {
    return this.itemSupplierForm.get('itemList') as FormArray;
  }

  getItemController(itemIndex: number, controlName: any) {
    const controlArray = <any>this.itemSupplierForm.controls['itemList']
    return controlArray.controls[itemIndex].controls[controlName];
  }

  addItemGroup() {
    return this.fb.group({
      itemName: [''],
      itemCode: [''],
      quantity: ['', [Validators.required]],
      batchNo: ['', [Validators.required]],
      expDate: ['', [Validators.required]],
      price: ['', [Validators.required]]
    });
  }

  private intializingFormGroup() {
    this.itemSupplierForm = this.fb.group({
      itemList: this.fb.array([]),
      currentRequisitionNo: ['']
    });
  }

  private intializingMsg() {
    this.errorMessage = {
    };
  }

  getOpeningDays(days: any) {
    if (days && days.length > 0) {
      const totalDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const openDays: any = [];
      days.split("").forEach((day: any, index: any) => {
        if (day == "Y") {
          openDays.push(totalDays[index]);
        }
      });
      return openDays.join(', ');
    }
    return "";
  }

}
