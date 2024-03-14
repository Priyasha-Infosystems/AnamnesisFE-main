import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { INVENTORY_MANAGEMENT } from '@constant/constants';
import { Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.css']
})
export class ViewInvoiceComponent implements OnInit {
  errorMessage: any = {};
  itemSupplierForm: FormGroup;
  currentRequisitionNoSelectForm: FormGroup;
  proceedData: any;
  pharmacyDetails: any;
  requisitionNoList: any = [];
  gRNViewDetails: any;
  curentYear: any = '';
  curentMonth: any = '';
  medicineGroupOptions: any = []
  medicineList: any = [];
  requisitionComentsErrMsg: any = ''
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private store: Store<any>,
    public utilityService: UtilityService,
    private fileUploadService: FileUploadService,
    public supplierRequisitionService: SupplierRequisitionService,
    public datePipe: DatePipe,
    private medicineSelectionService: MedicineSelectionService,
    private healthEquipmentService: HealthEquipmentService
  ) {
    this.intializingFormGroup()
    this.intializingMsg()
    const date = new Date();
    this.curentYear = this.datePipe.transform(date, 'yy')
    this.curentMonth = this.datePipe.transform(date, 'MM')
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.getRequisitionNoList()
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.valueChanges.subscribe(res => {
      if (res) {
        if (!this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.disabled) {
          const finddata = this.requisitionNoList.find((val: any) => val.requisitionNumber === res)
          this.selectRequisitionNo(finddata)
        }
      }
    })
  }

  async save() {
    this.formService.markFormGroupTouched(this.itemSupplierForm)
    let IsValid = true;
    let comentRequird = false;
    // console.log(this.itemSupplierForm.get('invoiceReferenceNumber')?.value)
    const reqData: any = {
      apiRequest: {
        invoiceDate: this.itemSupplierForm.get('invoiceDate')?.value,
        invoiceID: this.itemSupplierForm.get('invoiceID')?.value,
        invoiceReferenceNumber: '',
        requisitionLineComments: '',
        requisitionNumber: this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.getRawValue(),
        requisitionItemCount: 0,
        requisitionLineEntryList: [],
        transactionResult: ''
      }
    }
    reqData.apiRequest.invoiceReferenceNumber = this.itemSupplierForm.get('invoiceReferenceNumber')?.value;
    if (!this.itemSupplierForm.valid) {
      IsValid = false;
    }
    this.requisitionLineEntryList().getRawValue().forEach((requisitionLineEntry: any, requisitionLineEntryIndex: number) => {
      requisitionLineEntry.totalPrice = this.getItemTotalMrp(requisitionLineEntryIndex)
      requisitionLineEntry.itemMRP = this.getItemMrp(requisitionLineEntryIndex)
      reqData.apiRequest.requisitionLineEntryList.push(requisitionLineEntry)
      reqData.apiRequest.requisitionLineEntryList[reqData.apiRequest.requisitionLineEntryList.length - 1].invoiceLineEntryList = [];
      if (this.invoiceLineEntryList(requisitionLineEntryIndex).length) {
        this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((invoiceLineEntry: any, invoiceLineEntryIndex: number) => {
          invoiceLineEntry.finalPrice = invoiceLineEntry.totalPrice;
          if (invoiceLineEntry.acceptRejectIndicator || invoiceLineEntry.invoiceLineComments) {
            if (invoiceLineEntry.invoiceLineComments && invoiceLineEntry.invoiceLineComments === 'Others') {
              comentRequird = true;
            }
            invoiceLineEntry.acceptRejectIndicator = invoiceLineEntry.acceptRejectIndicator ? 'A' : 'R';
          } else {
            IsValid = false;
            this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isOpen')?.setValue(true);
            this.invoiceLineEntryList(requisitionLineEntryIndex).at(invoiceLineEntryIndex).get('acceptRejectErrMsg')?.setValue('Accept this line or select rejection coment');
            setTimeout(() => this.invoiceLineEntryList(requisitionLineEntryIndex).at(invoiceLineEntryIndex).get('acceptRejectErrMsg')?.setValue(''), 2500);
          }
          reqData.apiRequest.requisitionLineEntryList[reqData.apiRequest.requisitionLineEntryList.length - 1].invoiceLineEntryList.push(invoiceLineEntry)
          // const foundSameBatchNoList = this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().filter(res => res.batchNo === invoiceLineEntry.batchNo)
          // if (foundSameBatchNoList.length > 1) {
          //   IsValid = false;
          // }
        })
      } else if (+requisitionLineEntry.itemQuantity > 0) {
        IsValid = false;
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue('Invoice line is requird');
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isOpen')?.setValue(true);
        setTimeout(() => {
          this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue('');
        }, 2500);
      }
    })
    reqData.apiRequest.requisitionItemCount = reqData.apiRequest.requisitionLineEntryList.length;
    if (comentRequird) {
      if (this.itemSupplierForm.get('requisitionComents')?.value) {
        reqData.apiRequest.requisitionLineComments = this.itemSupplierForm.get('requisitionComents')?.value;
      } else {
        IsValid = false;
        this.requisitionComentsErrMsg = 'Requisition coments is required';
        setTimeout(() => {
          this.requisitionComentsErrMsg = '';
        }, 1500);
      }
    } else {
      reqData.apiRequest.requisitionLineComments = '';
    }
    if (IsValid) {
      // console.log(reqData)
      await this.supplierRequisitionService.GRN(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.setValue('');
            this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.enable();
            this.getRequisitionNoList()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Inventory Details couldn't save due some error");
          }
        })
    }
  }

  getItemMrp(requisitionLineEntryIndex: number) {
    let itemCount: number = 0;
    let totalMrp: number = 0;
    this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((res: any) => {
      if (res.itemMRP && res.itemQuantity) {
        itemCount = itemCount + (+res.itemQuantity);
        totalMrp = totalMrp + (+res.itemMRP * +res.itemQuantity)
      }
    })
    const itemAvgMrp = totalMrp / itemCount
    return itemAvgMrp ? itemAvgMrp : 0;
  }

  getItemTotalMrp(requisitionLineEntryIndex: number) {
    let totalMrp: number = 0;
    this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((res: any) => {
      if (res.itemMRP && res.itemQuantity) {
        const temptotalMrpWithoutDiscount = +res.itemMRP * +res.itemQuantity
        let tempTotalMrp = temptotalMrpWithoutDiscount
        if (res.discountAmount) {
          tempTotalMrp = tempTotalMrp - (+res.discountAmount)
        }
        totalMrp = totalMrp + tempTotalMrp
      }
    })
    return totalMrp;
  }

  getRequisitionNoList = async () => {
    const reqData: any = {
      apiRequest: {
      }
    }
    await this.supplierRequisitionService.GetSupplierRequisitionListForGRN(reqData)
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

  getRequisitionDetails = async (requisitionNo: any) => {
    const reqData: any = {
      apiRequest: {
        commercialID: '',
        requisitionNumber: requisitionNo
      }
    }
    this.itemSupplierForm.get('requisitionComents')?.setValue('')
    this.requisitionLineEntryList().clear();
    await this.supplierRequisitionService.GetGRNViewDetails(reqData, 'INVN')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.gRNViewDetails = res.apiResponse;
          this.itemSupplierForm.get('requisitionNumber')?.setValue(res.apiResponse.requisitionNumber);
          this.itemSupplierForm.get('invoiceID')?.setValue(res.apiResponse.invoiceID);
          this.itemSupplierForm.get('invoiceDate')?.setValue(res.apiResponse.invoiceDate);
          this.itemSupplierForm.get('invoiceReferenceNumber')?.setValue(res.apiResponse.invoiceReferenceNumber);
          this.createForm(res.apiResponse.requisitionLineEntryList ? res.apiResponse.requisitionLineEntryList : [])
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Inventory Details couldn't fetch due some error");
        }
      })
  }

  createForm(data: any) {
    data.forEach((res: any) => {
      this.addAnotherRequisitionLineWithData(res);
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

  selectRequisitionNo(data: any) {
    this.getRequisitionDetails(data.requisitionNumber)
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.disable()
    this.getDiagnosticCentreDetails(data.commercialID)
  }

  unselectRequisitionNo() {
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.setValue('')
    this.pharmacyDetails = null;
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.enable()
  }

  requisitionLineEntryOpen(requisitionLineEntryIndex: number) {
    this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isOpen')?.setValue(!this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isOpen')?.value)
  }

  INVitemValueChange(requisitionLineEntryIndex: number, invoiceLineEntryInedex: number, controlName: any, value: any, event?: any) {
    switch (controlName) {
      case 'batchNo':
        // if (value) {
        //   const foundSameBatchNoList = this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().filter(res => res.batchNo === value);
        //   if (foundSameBatchNoList.length > 1) {
        //     this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'errMsg').setValue('Same batch number');
        //   } else {
        //     this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'errMsg').setValue('');
        //   }
        // }
        break;
      case 'expYear':
        this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
        if (value && !this.commonService.checkUserNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
        } else {
          if (value.length === 1) {
            const firstCharMin = +this.curentYear[0]
            if (+value < firstCharMin) {
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
            }
          }
          if (value.length > 2) {
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
          } else {
            if (value.length === 2) {
              if (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value === +this.curentYear) {
                if (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth')?.value < +this.curentMonth) {
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth')?.setValue('')
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear')?.setValue('')
                } else {
                  if (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear')?.value < +this.curentYear) {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear')?.setValue('')
                  } else {
                    if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value && this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value) {
                      this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue(
                        `${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value}/20${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value}`
                      )
                    } else {
                      this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                    }
                  }
                }
              } else {
                if (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear')?.value < +this.curentYear) {
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear')?.setValue('')
                } else {
                  if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value && this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value) {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue(
                      `${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value}/20${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value}`
                    )
                  } else {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                  }
                }
              }
            }
          }
        }
        break;
      case 'expMonth':
        this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear')?.setValue('')
        this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
        if (value && !this.commonService.checkUserNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
        } else {
          if (value.length === 1) {
            if (+value > 1) {
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue(`0${value}`)
              if (event.target.tagName.toLowerCase() == "input") {
                const next = event.target.nextElementSibling
                next.focus();
              }
            }
          }
          if (value.length > 2) {
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
          } else {
            if (value.length === 2) {
              if (+value[0] === 0) {
                if (+value[1] < 1 || +value[1] > 9) {
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                } else {
                  if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value && this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value) {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue(
                      `${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value}/20${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value}`
                    )
                  } else {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                  }
                }
              } else {
                if (+value[1] > 2) {
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                } else {
                  if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value && this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value) {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue(
                      `${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expMonth').value}/20${this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expYear').value}`
                    )
                  } else {
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'expiryDate')?.setValue('')
                  }
                }
              }
            }
          }
          if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).getRawValue().length === 2) {
            if (event.target.tagName.toLowerCase() == "input") {
              const next = event.target.nextElementSibling
              next.focus();
            }
          }
        }
        break;
      case 'itemQuantity':
        if (value) {
          if (value && !this.commonService.checkUserNumber(value)) {
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue('')
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
          } else {
            if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) {
              const totalPrice = (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value * +value) - (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value ? +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value : 0);
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)

              let parentTotalItem: number = 0;
              this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((invoiceLineEntry: any) => {
                if (invoiceLineEntry.itemQuantity) {
                  parentTotalItem = parentTotalItem + (+invoiceLineEntry.itemQuantity)
                }
              })
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('suppliedItemQuantity')?.setValue(parentTotalItem)
              if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value) {
                const taxAmount = (((+value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value)) /
                  (1 + (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value / 100))) * (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value / 100)
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
              } else {
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
              }
            }
          }
        } else {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
        }
        break;
      case 'itemMRP':
        if (value) {
          if (value && !this.commonService.checkDecimalNumber(value)) {
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue('')

          } else {
            if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value) {
              const totalPrice = (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +value) - (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value ? +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value : 0);
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)
              let parentTotalItem: number = 0;
              this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((invoiceLineEntry: any) => {
                if (invoiceLineEntry.itemQuantity) {
                  parentTotalItem = parentTotalItem + (+invoiceLineEntry.itemQuantity)
                }
              })
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('suppliedItemQuantity')?.setValue(parentTotalItem)
              if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value) {
                const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +value) - (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value)) /
                  (1 + (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value / 100))) * (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value / 100)
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
              } else {
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
              }
            }
          }
        } else {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
        }
        break;
      case 'taxAmount':
        if (value && !this.commonService.checkDecimalNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
        }
        break;
      case 'discountAmount':
        if (value && !this.commonService.checkDecimalNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')

        } else {
          if (value) {
            const totalPrice = (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value) - (+value);
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)
            if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value) {
              const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ value)) /
                (1 + (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value / 100))) * (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value / 100)
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
            } else {
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
            }
          } else {
            const totalPrice = +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value;
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
          }
        }
        break;
      case 'hsnCode':
        if (value && !this.commonService.checkUserNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
        }
        break;
      case 'gstPercentage':
        if (value) {
          if (!this.commonService.checkDecimalNumber(value)) {
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          } else {
            if (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).getRawValue() > 99.9) {
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
            } else {
              const dotIndex = value.indexOf('.')
              if (dotIndex) {
                if (value.split('.')[1] && value.split('.')[1].length > 2) {
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
                } else {
                  if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value &&
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value) {
                    const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value)) /
                      (1 + (+value / 100))) * (+value / 100)
                    this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
                  }
                }
              } else {
                if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value &&
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value) {
                  const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value)) /
                    (1 + (+value / 100))) * (+value / 100)
                  this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
                }
              }
            }
          }
        } else {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
        }
        break;
      case 'acceptRejectIndicator':
        if (value) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'invoiceLineComments').setValue('')
        }
        break;
      case 'invoiceLineComments':
        if (value) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'acceptRejectIndicator').setValue(false)
        }
        break;
      default:
        break;
    }
  }

  reqItemQuantity(requisitionLineEntryIndex: number, value: any) {
    if (value && !this.commonService.checkUserNumber(value)) {
      this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemQuantity')?.setValue('')
    }
  }

  requisitionLineEntryList() {
    return this.itemSupplierForm.get('requisitionLineEntryList') as FormArray;
  }

  requisitionLineEntrycontroll(requisitionLineEntryIndex: number, controlName: any) {
    let requisitionLineEntrycontrol = <any>this.requisitionLineEntryList().at(requisitionLineEntryIndex);
    return requisitionLineEntrycontrol.controls[controlName];
  }

  invoiceLineEntryList(requisitionLineEntryIndex: number) {
    return this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('invoiceLineEntryList') as FormArray;
  }

  invoiceLineEntrycontroll(requisitionLineEntryIndex: number, invoiceLineEntryInedex: number, controlName: any) {
    let invoiceLineEntrycontrol = <any>this.invoiceLineEntryList(requisitionLineEntryIndex).at(invoiceLineEntryInedex);
    return invoiceLineEntrycontrol.controls[controlName];
  }

  addRequisitionLineFormGroup() {
    return this.fb.group({
      itemCode: ['', [Validators.required]],
      itemName: [''],
      itemType: [''],
      itemCategory: [''],
      itemQuantity: ['', [Validators.required]],
      suppliedItemQuantity: [''],
      itemMRP: [''],
      totalPrice: [''],
      additionalEntryIndicator: ['Y'],
      invoiceLineEntryList: this.fb.array([]),
      isOpen: [false],
      isInvoiceEntry: [false],
      errMsg: [''],
      itemList: []
    })
  }

  addAnotherRequisitionLineWithData(data: any) {
    data.additionalEntryIndicator = 'N';
    this.requisitionLineEntryList().push(this.addRequisitionLineFormGroup());
    this.requisitionLineEntryList().at(this.requisitionLineEntryList().length - 1).patchValue(data);
    this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1).clear()
    data.invoiceLineEntryList?.forEach((res: any) => {
      const invoiceLineData = {
        batchNo: res.batchNo,
        expiryDate: res.expiryDate,
        expYear: res.expiryDate.split('/')[1].split('0')[1],
        expMonth: res.expiryDate.split('/')[0],
        hsnCode: res.hsnCode,
        gstPercentage: res.gstPercentage+res.cessPercentage,
        discountAmount: res.discountAmount,
        taxAmount: res.taxAmount,
        finalPrice: res.finalPrice,
        itemQuantity: res.itemQuantity,
        itemMRP: res.itemMRP,
        itemType: res.itemType,
        itemCategory: res.itemCategory,
        totalPrice: res.finalPrice,
        acceptRejectIndicator: false,
        invoiceLineComments: res.invoiceLineComments,
        errMsg: '',
        additionalEntryIndicator: 'N'
      }
      this.requisitionLineEntryList().at(this.requisitionLineEntryList().length - 1).get('isInvoiceEntry')?.setValue(true)
      this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1).push(this.addInvoiceLineEntryFormGroup())
      this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1)
        .at(this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1).length - 1)
        .patchValue(invoiceLineData)
    })
  }

  addAnotherRequisitionLine() {
    this.requisitionLineEntryList().push(this.addRequisitionLineFormGroup());
    this.requisitionLineEntryList().at(this.requisitionLineEntryList().length - 1).get('isOpen')?.setValue(true);
    this.addAnotherInvoiceLineEntry(this.requisitionLineEntryList().length - 1);
    this.requisitionLineEntryList().at(this.requisitionLineEntryList().length - 1).get('itemType')?.setValue(this.requisitionLineEntryList().at(0).get('itemType')?.value);
  }

  removeRequisitionLine(requisitionLineEntryIndex: number) {
    this.requisitionLineEntryList().removeAt(requisitionLineEntryIndex)
  }

  addInvoiceLineEntryFormGroup() {
    return this.fb.group({
      additionalEntryIndicator: ['Y'],
      batchNo: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      expYear: [''],
      expMonth: [''],
      hsnCode: ['', [Validators.required]],
      gstPercentage: ['', [Validators.required]],
      discountAmount: ['', [Validators.required]],
      taxAmount: ['', [Validators.required]],
      finalPrice: [''],
      itemQuantity: ['', [Validators.required]],
      itemMRP: ['', [Validators.required]],
      totalPrice: [''],
      acceptRejectIndicator: [true],
      invoiceLineComments: [''],
      errMsg: [''],
      acceptRejectErrMsg: [''],
      transactionResult: [''],
    })
  }

  addAnotherInvoiceLineEntry(requisitionLineEntryIndex: number) {
    if (this.invoiceLineEntryList(requisitionLineEntryIndex).valid) {
      this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isInvoiceEntry')?.setValue(true)
      this.invoiceLineEntryList(requisitionLineEntryIndex).push(this.addInvoiceLineEntryFormGroup())
    } else {
      this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue('Please fill the data first')
      setTimeout(() => this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue(''), 2000);
    }
  }

  clearInvoiceLineEntry(requisitionLineEntryIndex: number, invoiceLineEntryInedex: number) {
    this.invoiceLineEntryList(requisitionLineEntryIndex).removeAt(invoiceLineEntryInedex)
    if (this.invoiceLineEntryList(requisitionLineEntryIndex).length === 0) {
      this.invoiceLineEntryList(requisitionLineEntryIndex).push(this.addInvoiceLineEntryFormGroup())
    }
  }

  private intializingFormGroup() {
    this.itemSupplierForm = this.fb.group({
      requisitionNumber: [''],
      invoiceID: [''],
      invoiceDate: [''],
      invoiceReferenceNumber: [''],
      requisitionItemCount: [''],
      requisitionLineEntryList: this.fb.array([]),
      requisitionComents: [''],
    });
    this.currentRequisitionNoSelectForm = this.fb.group({
      currentRequisitionNo: ['']
    });
  }

  private intializingMsg() {
    this.errorMessage = {
      batchNo: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_batchNo
      },
      expiryDate: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_expiryDate,
        pattern: INVENTORY_MANAGEMENT.ERR_MSG_pattern_expiryDate
      },
      itemQuantity: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_itemQuantity
      },
      itemMRP: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_itemMRP
      },
      hsnCode: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_hsnCode,
        maxLength: ''
      },
      gstPercentage: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_gstPercentage,
        maxLength: ''
      },
      discountAmount: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_discountAmount
      },
      taxAmount: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_taxAmount
      },
      invoiceLineComments: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_itemMRP
      },
      itemCode: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_itemCode
      }
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

  truncPrice(data: number) {
    return (Math.round(data * 100) / 100).toFixed(2);
  }

  getMedicileList = async (searchString: string, requisitionLineEntryIndex: number, itemType: any) => {
    if (searchString.length > 2) {
      this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemList')?.setValue([])
      if (itemType === 'MD') {
        const reqData: any = {
          apiRequest: { medicineKeyword: searchString ,indicator: 'S' }
        }
        await this.medicineSelectionService.getMedicineList(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemList')?.setValue(res.apiResponse.medicineSearchList)
            } else {
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue(res.anamnesisErrorList.anErrorList[0].errorMessage)
              setTimeout(() => this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue(''), 1500);
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Medicine List couldn't fetch due some error");
            }
          })
      } else {
        const reqData: any = {
          apiRequest: { searchKeyword: searchString }
        }
        await this.healthEquipmentService.getHealthcareEquipmentleList(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemList')?.setValue(res.apiResponse.householdItemDetailsList)
            } else {
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue(res.anamnesisErrorList.anErrorList[0].errorMessage)
              setTimeout(() => this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('errMsg')?.setValue(''), 1500);
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Equipment List couldn't fetch due some error");
            }
          })
      }
    }
  }

  optionSelected(requisitionLineEntryIndex: number, itemType: any) {
    const itemList = this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemList')?.value
    if (itemType === 'MD') {
      const selectedItemDetails = itemList.find((res: any) => res.medicineName === this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemName')?.getRawValue());
      if (selectedItemDetails) {
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemName')?.setValue(selectedItemDetails.medicineName)
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemCode')?.setValue(selectedItemDetails.medicineCode)
      }
    } else {
      const selectedItemDetails = itemList.find((res: any) => res.householdItemName === this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemName')?.getRawValue());
      if (selectedItemDetails) {
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemName')?.setValue(selectedItemDetails.householdItemName)
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemCode')?.setValue(selectedItemDetails.householdItemCode)
      }
    }
  }

  clearItem(requisitionLineEntryIndex: number) {
    this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemList')?.setValue([])
    this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemName')?.setValue('')
    this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('itemCode')?.setValue('')
  }

}
