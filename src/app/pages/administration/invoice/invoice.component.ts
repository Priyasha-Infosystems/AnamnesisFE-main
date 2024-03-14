import { DatePipe } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { INVENTORY_MANAGEMENT } from '@constant/constants';
import { Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  errorMessage: any = {};
  itemSupplierForm: FormGroup;
  currentRequisitionNoSelectForm: FormGroup;
  documentForm: FormGroup;
  proceedData: any;
  pharmacyDetails: any;
  requisitionNoList: any = [];
  isPharmacyUser: boolean = false;
  curentYear: any = '';
  curentMonth: any = '';
  invoiceStatus: boolean = false;
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
    private profileService: ProfileService,
  ) {
    this.intializingFormGroup()
    this.intializingMsg()
    const date = new Date();
    this.curentYear = this.datePipe.transform(date, 'yy')
    this.curentMonth = this.datePipe.transform(date, 'MM')
  }

  clickEvent() {
    this.invoiceStatus = !this.invoiceStatus;
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

  getRequisitionNoList = async () => {
    const reqData: any = {
      apiRequest: {
      }
    }
    await this.supplierRequisitionService.GetSupplierRequisitionListForInvoice(reqData)
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
        requisitionNumber: requisitionNo,
        requisitionItemCount: 0,
        requisitionLineEntryList: [],
      }
    }
    this.requisitionLineEntryList().clear();
    this.documentForm.get('fileID')?.reset();
    this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.reset()
    await this.supplierRequisitionService.getInvoice(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.itemSupplierForm.get('invoiceDate')?.setValue(res.apiResponse.invoiceDate)
          this.itemSupplierForm.get('invoiceID')?.setValue(res.apiResponse.invoiceID)
          if (res.apiResponse.invoiceID) {
            this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.setValue(res.apiResponse.invoiceReferenceNumber)
            this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.disable()
          }else{
            this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.setValue('')
            this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.enable()
          }
          this.createForm(res.apiResponse.requisitionLineEntryList ? res.apiResponse.requisitionLineEntryList : [])
          if (res.apiResponse.invoiceID) {
            this.documentForm.get('document')?.setValue(true);
            this.documentForm.get('fileSource')?.setValue('');
            this.documentForm.get('dataSet')?.setValue(false);
            this.documentForm.get('toSave')?.setValue(false);
            this.documentForm.get('fileSource')?.enable();
            this.documentForm.get('fileID')?.setValue(res.apiResponse.supplierInvoiceFile.fileID);
            this.documentForm.get('fileName')?.setValue(res.apiResponse.supplierInvoiceFile.fileName);
            this.documentForm.get('error')?.setValue(false);
            this.documentForm.get('preSaveInd')?.setValue(true);
            this.removeItem(true)
          } else {
            this.documentForm.get('document')?.setValue('');
            this.documentForm.get('fileSource')?.setValue('');
            this.documentForm.get('dataSet')?.setValue(false);
            this.documentForm.get('toSave')?.setValue(false);
            this.documentForm.get('fileSource')?.enable();
            this.documentForm.get('fileID')?.setValue('');
            this.documentForm.get('error')?.setValue(false);
            this.documentForm.get('preSaveInd')?.setValue(false);
            this.removeItem(false)
          }
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
      this.addAnotherRequisitionLine(res);
    })
  }

  async save() {
    this.formService.markFormGroupTouched(this.itemSupplierForm)
    this.formService.markFormGroupTouched(this.documentForm)
    let IsValid = true;
    const reqData: any = {
      apiRequest: {
        invoiceReferenceNumber: '',
        supplierInvoiceFileID: '',
        requisitionNumber: this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.getRawValue(),
        requisitionItemCount: 0,
        requisitionLineEntryList: []
      }
    }
    if (!this.itemSupplierForm.valid) {
      IsValid = false;
    }
    this.requisitionLineEntryList().getRawValue().forEach((requisitionLineEntry: any, requisitionLineEntryIndex: number) => {
      requisitionLineEntry.totalPrice = this.truncPrice(this.getItemTotalMrp(requisitionLineEntryIndex))
      requisitionLineEntry.itemMRP = this.truncPrice(this.getItemMrp(requisitionLineEntryIndex))
      reqData.apiRequest.requisitionLineEntryList.push(requisitionLineEntry)
      reqData.apiRequest.requisitionLineEntryList[reqData.apiRequest.requisitionLineEntryList.length - 1].invoiceLineEntryList = [];
      if (this.invoiceLineEntryList(requisitionLineEntryIndex).length) {
        this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((invoiceLineEntry: any, invoiceLineEntryIndex: number) => {
          invoiceLineEntry.finalPrice = this.truncPrice(+invoiceLineEntry.totalPrice);
          invoiceLineEntry.totalPrice = this.truncPrice(+invoiceLineEntry.totalPrice);
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
    reqData.apiRequest.invoiceReferenceNumber = this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.value
    if (this.documentForm.valid && !this.documentForm.value.error) {
      reqData.apiRequest.supplierInvoiceFileID = this.documentForm.value.fileID
    } else {
      IsValid = false;
    }
    if (IsValid) {
      await this.supplierRequisitionService.generateInvoice(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.setValue('');
            this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.enable();
            this.documentForm.get('document')?.setValue('');
            this.documentForm.get('fileSource')?.setValue('');
            this.documentForm.get('dataSet')?.setValue(false);
            this.documentForm.get('toSave')?.setValue(false);
            this.documentForm.get('fileSource')?.enable();
            this.documentForm.get('fileID')?.setValue('');
            this.documentForm.get('error')?.setValue(false);
            this.getRequisitionNoList()
            this.toastr.success('Inventory Details saved')
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

  selectRequisitionNo(data: any) {
    this.getRequisitionDetails(data.requisitionNumber)
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.disable()
    this.getDiagnosticCentreDetails(data.commercialID)
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

  unselectRequisitionNo() {
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.setValue('')
    this.pharmacyDetails = null;
    this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.enable();
  }

  requisitionLineEntryOpen(requisitionLineEntryIndex: number) {
    this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isOpen')?.setValue(!this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isOpen')?.value)
  }

  requisitionLineEntryList() {
    return this.itemSupplierForm.get('requisitionLineEntryList') as FormArray;
  }

  invoiceLineEntryList(requisitionLineEntryIndex: number) {
    return this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('invoiceLineEntryList') as FormArray;
  }

  invoiceLineEntrycontroll(requisitionLineEntryIndex: number, invoiceLineEntryInedex: number, controlName: any) {
    let invoiceLineEntrycontrol = <any>this.invoiceLineEntryList(requisitionLineEntryIndex).at(invoiceLineEntryInedex);
    return invoiceLineEntrycontrol.controls[controlName];
  }

  itemValueChange(requisitionLineEntryIndex: number, invoiceLineEntryInedex: number, controlName: any, value: any, event?: any) {
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
              const lastCharMin = +this.curentYear[1]
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
        if(value){
        if (value && !this.commonService.checkUserNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue('')
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
        } else {
          if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) {
            const totalPrice = (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value * +value)-(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value?+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value:0);
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)

            let parentTotalItem: number = 0;
            this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((invoiceLineEntry: any) => {
              if (invoiceLineEntry.itemQuantity) {
                parentTotalItem = parentTotalItem + (+invoiceLineEntry.itemQuantity)
              }
            })
            this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('suppliedItemQuantity')?.setValue(parentTotalItem)
            if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value && 
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value &&
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value){
               const taxAmount = (((+value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value))/
               (1+(((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)))*(((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)
               this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
            }else{
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
            }
          }
        }
      }else{
        this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
      }
        break;
      case 'itemMRP':
        if(value){
          if (value && !this.commonService.checkDecimalNumber(value)) {
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue('')
            
          } else {
            if (this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value) {
              const totalPrice = (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +value) -(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value?+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value:0);
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)
              let parentTotalItem: number = 0;
              this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((invoiceLineEntry: any) => {
                if (invoiceLineEntry.itemQuantity) {
                  parentTotalItem = parentTotalItem + (+invoiceLineEntry.itemQuantity)
                }
              })
              this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('suppliedItemQuantity')?.setValue(parentTotalItem)
              if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value && 
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value){
                 const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +value) - (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value))/
                 (1+(((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)))*(((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)
                 this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
              }else{
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
              }
            }
          }
        }else{
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
          if(value && value>+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').getRawValue()){
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          }
          if (value) {
            const totalPrice = (+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value) - (+value);
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'totalPrice').setValue(totalPrice)
            if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value && 
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value &&
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value){
               const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ value))/
               (1+(((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)))*(((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)
               this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
            }else{
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
        if(value){
        if (!this.commonService.checkDecimalNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
        }else{
          if(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).getRawValue()>99.9){
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          }else{
            const dotIndex = value.indexOf('.')
            if(dotIndex){
              if(value.split('.')[1] && value.split('.')[1].length>2){
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
              }else{
                if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value && 
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value){
                   const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value))/
                   (1+(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)))*(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)
                   this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
                }
              }
            }else{
              if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value && 
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value){
                 const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value))/
                 (1+(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)))*(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'cessPercentage').value))/100)
                 this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
              }
            }
          }
        }
      }else{
        this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
      }
        break;
      case 'cessPercentage':
        if(value){
        if (!this.commonService.checkDecimalNumber(value)) {
          this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
        }else{
          if(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).getRawValue()>99.9){
            this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
          }else{
            const dotIndex = value.indexOf('.')
            if(dotIndex){
              if(value.split('.')[1] && value.split('.')[1].length>2){
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, controlName).setValue('')
              }else{
                if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value && 
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
                this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value){
                   const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value))/
                   (1+(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value))/100)))*(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value))/100)
                   this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
                }
              }
            }else{
              if(this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value && 
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value &&
              this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value){
                 const taxAmount = (((+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemQuantity').value * +this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'itemMRP').value) - (+ this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'discountAmount').value))/
                 (1+(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value))/100)))*(((+value)+(+this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'gstPercentage').value))/100)
                 this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue(this.truncPrice(taxAmount))
              }
            }
          }
        }
      }else{
        this.invoiceLineEntrycontroll(requisitionLineEntryIndex, invoiceLineEntryInedex, 'taxAmount').setValue('')
      }
        break;
      default:
        break;
    }
  }

  addRequisitionLineFormGroup() {
    return this.fb.group({
      itemCode: [''],
      itemName: [''],
      itemQuantity: [''],
      itemType: [''],
      itemCategory: [''],
      suppliedItemQuantity: [''],
      itemMRP: [''],
      totalPrice: [''],
      additionalEntryIndicator: [''],
      invoiceLineEntryList: this.fb.array([]),
      isOpen: [false],
      isInvoiceEntry: [false],
      errMsg: ['']
    })
  }

  addAnotherRequisitionLine(data: any) {
    this.requisitionLineEntryList().push(this.addRequisitionLineFormGroup());
    if (data.invoiceLineEntryList?.length) {
      data.isInvoiceEntry = true;
      data.isOpen = true;
      data.invoiceLineEntryList.forEach((res: any) => {
        const invoiceLineData = {
          batchNo: res.batchNo,
          expiryDate: res.expiryDate,
          expYear: res.expiryDate.split('/')[1],
          expMonth: res.expiryDate.split('/')[0].split('0')[1],
          hsnCode: res.hsnCode,
          gstPercentage: res.gstPercentage,
          cessPercentage: res.cessPercentage,
          discountAmount: res.discountAmount,
          taxAmount: res.taxAmount,
          finalPrice: res.finalPrice,
          itemQuantity: res.itemQuantity,
          itemMRP: res.itemMRP,
          itemType: res.itemType,
          itemCategory: res.itemCategory,
          totalPrice: res.finalPrice,
          acceptRejectIndicator: res.acceptRejectIndicator,
          invoiceLineComments: res.invoiceLineComments,
          errMsg: ''
        }
        this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1).push(this.addInvoiceLineEntryFormGroup())
        this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1)
          .at(this.invoiceLineEntryList(this.requisitionLineEntryList().length - 1).length - 1)
          .patchValue(invoiceLineData)
      })
    }
    this.requisitionLineEntryList().at(this.requisitionLineEntryList().length - 1).patchValue(data);
  }

  addInvoiceLineEntryFormGroup() {
    return this.fb.group({
      batchNo: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      expYear: [''],
      expMonth: [''],
      hsnCode: ['', [Validators.required, Validators.maxLength(8)]],
      gstPercentage: ['', [Validators.required]],
      cessPercentage: ['', [Validators.required]],
      discountAmount: ['', [Validators.required]],
      taxAmount: ['', [Validators.required]],
      finalPrice: [''],
      itemQuantity: ['', [Validators.required]],
      itemMRP: ['', [Validators.required]],
      totalPrice: [''],
      acceptRejectIndicator: [''],
      invoiceLineComments: [''],
      errMsg: [''],
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
    const data = this.invoiceLineEntryList(requisitionLineEntryIndex).at(invoiceLineEntryInedex).getRawValue()
    if (data.batchNo || data.expYear || data.expMonth || data.hsnCode || data.discountAmount || data.taxAmount || data.itemQuantity || data.itemMRP) {
      this.invoiceLineEntryList(requisitionLineEntryIndex).at(invoiceLineEntryInedex).reset()
    } else {
      this.invoiceLineEntryList(requisitionLineEntryIndex).removeAt(invoiceLineEntryInedex)
      if (this.invoiceLineEntryList(requisitionLineEntryIndex).length === 0) {
        this.requisitionLineEntryList().at(requisitionLineEntryIndex).get('isInvoiceEntry')?.setValue(false);
      }
    }
  }

  getItemMrp(requisitionLineEntryIndex: number) {
    let itemCount: number = 0;
    let totalMrp: number = 0;
    this.invoiceLineEntryList(requisitionLineEntryIndex).getRawValue().forEach((res: any) => {
      if (res.itemMRP && res.itemQuantity) {
        itemCount = itemCount +(+res.itemQuantity);
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

  getAllItemCount() {
    let itemCount = 0
    this.requisitionLineEntryList().getRawValue().forEach((res: any, i: number) => {
      this.invoiceLineEntryList(i).getRawValue().forEach((invoiceLine: any) => {
        if (invoiceLine.itemQuantity) {
          itemCount = itemCount + (+invoiceLine.itemQuantity);
        }
      })
    })
    return itemCount;
  }

  getAllitemPrice() {
    let totalMrp: number = 0;
    this.requisitionLineEntryList().getRawValue().forEach((res: any, i: number) => {
      if (this.getItemTotalMrp(i)) {
        totalMrp = totalMrp + this.getItemTotalMrp(i)
      }
    })
    return totalMrp;
  }

  async uploadDoc(data: any, control: any, target: any) {
    let progress: number = 0;
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadInvoiceFile(
        formData, control.value.fileType, control.value.documentNumber, this.currentRequisitionNoSelectForm.get('currentRequisitionNo')?.getRawValue()
      )).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            progress = Math.round(event.loaded / event.total! * 100);
            target.progress = progress;
            this.documentForm.get('document')?.setValue(target);
            this.documentForm.get('progress')?.setValue(progress);
            break;
          case HttpEventType.Response:
            if (!this.fileUploadService.isDocUploadApiError(event.body)) {
              const responseFiles = { ...event.body.apiResponse }
              target.response.push(responseFiles);
              this.documentForm.get('document')?.setValue(target);
              this.documentForm.get('response')?.setValue(responseFiles);
              // this.documentForm.get('fileName')?.setValue(responseFiles.fileName);
              this.documentForm.get('fileID')?.setValue(responseFiles.fileID);
              this.documentForm.get('toSave')?.setValue(true);
              this.documentForm.get('dataSet')?.setValue(true);
              this.documentForm.get('error')?.setValue(false);
              this.documentForm.get('preSaveInd')?.setValue(false);
              this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.disable();
            } else {
              target.error = true;
              this.documentForm.get('error')?.setValue(true);
              this.documentForm.get('fileName')?.setValue(target.name);
              this.documentForm.get('document')?.setValue(target);
            }
            setTimeout(() => {
              // progress = 0;
            }, 1500);
        }
      },
        (error) => {
          target.error = true;
          control.get('document').setValue(target);
          this.toastr.error(error ? error : '');
          control.get('error').setValue(true);
          control.get('fileName').setValue(target.name);
        })

  }

  getDocumentControllerValue(controlName: string) {
    return this.documentForm?.get(controlName)?.getRawValue()
  }

  getDocumentController(controlName: any) {
    const formControll = this.documentForm;
    return formControll.controls[controlName]
  }

  async removeItem(isSaved: boolean) {
    if (this.documentForm.value.error === false && !isSaved && this.documentForm.value.fileID) {
      const reqData: any = {
        apiRequest: { ...this.documentForm?.getRawValue().response, indicator: 'INV' }
      }
      await this.fileUploadService.singleFileDeleteMED(reqData, 'INVN')
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res) && res.apiResponse.transactionResult === 'Success') {
            this.documentForm.get('document')?.setValue('');
            this.documentForm.get('fileSource')?.setValue('');
            this.documentForm.get('dataSet')?.setValue(false);
            this.documentForm.get('toSave')?.setValue(false);
            this.documentForm.get('fileSource')?.enable();
            this.documentForm.get('fileID')?.setValue('');
            this.documentForm.get('error')?.setValue(false);
            this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.enable();
            this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.setValue('');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("File couldn't delete due some error");
          }
        })
    } else if (this.documentForm.value.error === true && !isSaved) {
      const control: any = this.documentForm;
      this.documentForm.get('document')?.setValue('');
      this.documentForm.get('fileSource')?.setValue('');
      this.documentForm.get('dataSet')?.setValue(false);
      this.documentForm.get('toSave')?.setValue(false);
      this.documentForm.get('fileSource')?.enable();
      this.documentForm.get('fileID')?.setValue('');
      this.documentForm.get('error')?.setValue(false);
    } else {
      const control: any = this.documentForm;
      // this.documentForm.get('document')?.setValue('');
      this.documentForm.get('fileSource')?.setValue('');
      this.documentForm.get('dataSet')?.setValue(false);
      this.documentForm.get('toSave')?.setValue(false);
      this.documentForm.get('fileSource')?.enable();
      // this.documentForm.get('fileID')?.setValue('');
      this.documentForm.get('error')?.setValue(false);
    }

  }

  async onFileUpload(event: any) {
    const control: any = this.documentForm
    this.documentForm.get('fileError')?.setValue("")
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true };
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      this.documentForm.get('fileError')?.setValue("File is too large. Allowed maximum size is 2 MB");
      // this.fileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      return;
    }
    if (extensionAllowed) {
      const nam = event.target.files[0].name.split('.').pop();
      if (!extensionAllowed[nam]) {
        this.documentForm.get('fileError')?.setValue("Please upload " + Object.keys(extensionAllowed) + " file.")
        event.target.value = '';
        return;
      }
    }
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    this.documentForm.get('document')?.setValue(target);
    this.documentForm.get('fileName')?.setValue(target.name);
    this.documentForm.get('documentNumber')?.setValue(this.currentRequisitionNoSelectForm.get('invoiceReferenceNumber')?.getRawValue())
    await this.uploadDoc(event.target.files[0], control, target)
    event.target.value = '';
  }

  fileErrorShow() {
    this.formService.markFormGroupTouched(this.currentRequisitionNoSelectForm)
  }

  private intializingFormGroup() {
    this.itemSupplierForm = this.fb.group({
      requisitionLineEntryList: this.fb.array([]),
      invoiceDate: [''],
      invoiceID: [''],
    });
    this.currentRequisitionNoSelectForm = this.fb.group({
      currentRequisitionNo: [''],
      invoiceReferenceNumber: ['', [Validators.required]],
    });
    this.documentForm = this.fb.group({
      fileType: ['INV'],
      documentNumber: [''],
      fileSource: [{ value: '', disabled: false }],
      document: [''],
      dataSet: [false],
      toSave: [false],
      fileName: [''],
      fileID: ['', [Validators.required]],
      progress: [''],
      response: [''],
      error: [''],
      fileError: [''],
      preSaveInd: [false]
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
      cessPercentage: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_cessPercentage,
        maxLength: ''
      },
      discountAmount: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_discountAmount
      },
      taxAmount: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_taxAmount
      },
      invoiceReferenceNumber: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_invoiceReferenceNumber
      },
      fileID: {
        required: INVENTORY_MANAGEMENT.ERR_MSG_REQUIERD_fileID
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

  async StayLogin() {
    await this.profileService.getLastUpdateInformation()
  }

}
