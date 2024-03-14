import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { MedicineDetailsService } from '@services/medicine-details.service';
import { MedicineEntryService } from '@services/medicine-entry.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { householdItemCategoryAndSubcategoryDetailsList, medicineTypeDetails } from 'src/store/actions/utility.actions';

@Component({
  selector: 'app-household-item',
  templateUrl: './household-item.component.html',
  styleUrls: ['./household-item.component.css']
})
export class HouseholdItemComponent implements OnInit {
  houseHoldItemEntryForm: FormGroup;
  houseHoldItemList: Array<any> = [];
  errorMessage: any = {};
  myFiles: any = [];
  fileError: string = "";
  imageBaseUrl: string = BASE_IMAGE_URL;
  isSearch: boolean = true;
  displayImgIndex: number = 0
  householdItemCategoryAndSubcategoryList:any = [];
  categoryList:any = [];
  subCategoryList:any = [];
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private commonService: CommonService,
    private medicineEntryService: MedicineEntryService,
    private fileUploadService: FileUploadService,
    private medicineSelectionService: MedicineSelectionService,
    private medicineDetailsService: MedicineDetailsService,
    private healthEquipmentService: HealthEquipmentService,
    private store: Store<any>,
  ) {
    this.intializingMessage()
    this.intializingMedicineSeectionFormGroup()
  }

  async ngOnInit() {
    await this.store.pipe(select('commonUtility')).subscribe(async val => {
      if(val?.houseHoldItemCategoryAndSubCategoryList){
        this.householdItemCategoryAndSubcategoryList = val?.houseHoldItemCategoryAndSubCategoryList;
        this.householdItemCategoryAndSubcategoryList.forEach((res:any)=>{
          this.categoryList.push(res.category);
        })
      }
    })
    await this.getHouseholdItemCategoryAndSubcategoryList()
    this.houseHoldItemEntryForm.get('householdItemUnitPrice')?.valueChanges.subscribe(res => {
      if (res && !this.commonService.checkDecimalNumber(res)) {
        this.houseHoldItemEntryForm.get('householdItemUnitPrice')?.setValue('')
      }
    })
    this.houseHoldItemEntryForm.get('householdItemCategory')?.valueChanges.subscribe(res => {
      if (!res) {
        this.houseHoldItemEntryForm.get('householdItemSubCategory')?.disable()
      }else{
        this.houseHoldItemEntryForm.get('householdItemSubCategory')?.enable()
      }
    })
    this.houseHoldItemEntryForm.valueChanges.subscribe(res => {
      this.formService.markFormGroupUnTouched(this.houseHoldItemEntryForm)
    })
  }

  changeCategory(data:any){
    this.subCategoryList = []
    this.houseHoldItemEntryForm.get('householdItemSubCategory')?.setValue('')
    const categoryDetails = this.householdItemCategoryAndSubcategoryList.find((res:any)=>res.category === data);
    if(categoryDetails){
      categoryDetails.subCategoryDataList.forEach((res:any)=>{
        this.subCategoryList.push(res.subCategory)
      })
    }
    this.changeHouseItemDetails()
  }

  async getHouseholdItemCategoryAndSubcategoryList(){
    if(!this.householdItemCategoryAndSubcategoryList?.length){
      await this.medicineEntryService.getHouseholdItemCategoryAndSubcategoryList()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.householdItemCategoryAndSubcategoryList = res.apiResponse;
          this.householdItemCategoryAndSubcategoryList.forEach((res:any)=>{
            this.categoryList.push(res.category);
          })
          this.store.dispatch(new householdItemCategoryAndSubcategoryDetailsList(res.apiResponse));
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine List couldn't fetch due some error");
        }
      })
    }
  }

  changeHouseItemDetails() {
    if (!this.houseHoldItemEntryForm.get('isAdd')?.value) {
      this.houseHoldItemEntryForm.get('isChange')?.setValue(true)
    }
  }

  changeDisplayImg(index: number) {
    this.displayImgIndex = index;
  }

  async householdItemListFetch(searchString: any) {
    const reqData: any = {
      apiRequest: { searchKeyword: searchString ,indicator: 'E' }
    }
    if (this.isSearch && searchString.length) {
      await this.healthEquipmentService.getHealthcareEquipmentleList(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.houseHoldItemList = [...res.apiResponse.householdItemDetailsList];
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Household item List couldn't fetch due some error");
          }
        })
    }
  }

  optionSelected = async (data: any) => {
    const reqData: any = {
      apiRequest: { houseHoldItemCode: data.householdItemCode }
    }
    await this.medicineDetailsService.getHouseHoldItemDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.subCategoryList = []
          // console.log(this.householdItemCategoryAndSubcategoryList)
          const categoryDetails = this.householdItemCategoryAndSubcategoryList?.find((val:any)=>val.category === res.apiResponse.householdItemCategory);
          if(categoryDetails){
            categoryDetails.subCategoryDataList?.forEach((res:any)=>{
              this.subCategoryList.push(res.subCategory)
            })
          }
          this.houseHoldItemEntryForm.patchValue(res.apiResponse)
          this.houseHoldItemEntryForm.get('householdItemName')?.disable()
          this.houseHoldItemEntryForm.get('isAdd')?.setValue(false)
          this.houseHoldItemList = [];
          res.apiResponse.householdItemFileDetailsList.forEach((val: any) => {
            const tempFile = {
              progress: 100,
              response: [val],
              error: false,
              isAdd: false,
              isDelete: false
            }
            this.myFiles.push(tempFile);
            this.isSearch = false;
          })
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("House hold item Details couldn't fetch due some error");
        }
      })
  }

  save = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.houseHoldItemEntryForm)
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          referenceNumber:data.referenceNumber,
          householdItemCode: data.householdItemCode,
          householdItemName: data.householdItemName,
          householdItemStatus: data.householdItemStatus,
          householdItemShortName: data.householdItemShortName,
          householdItemManufacturer: data.householdItemManufacturer,
          householdItemMaufacturerAddress: data.householdItemMaufacturerAddress,
          householdItemDescription: data.householdItemDescription,
          householdItemIntroduction: data.householdItemIntroduction,
          householdItemIngredients: data.householdItemIngredients,
          householdItemUnitPrice: +data.householdItemUnitPrice,
          householdItemCategory: data.householdItemCategory,
          householdItemSubCategory: data.householdItemSubCategory,
          actionIndicator: data.isAdd ? 'ADD' : data.isChange ? 'UPD' : '',
          transactionResult: '',
          householdItemFileDetails: [],
        }
      }
      this.medicineEntryService.saveHouseHoldItem(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('House hold item added')
            if (!data.isAdd) {
              this.resetForm()
            } else {
              this.houseHoldItemEntryForm.get('householdItemCode')?.setValue(res.apiResponse.householdItemCode)
              this.houseHoldItemEntryForm.get('householdItemName')?.disable()
            }
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("House hold item couldn't add due some error");
          }
        })
    }
  }

  resetForm() {
    this.subCategoryList = []
    this.houseHoldItemEntryForm.reset()
    this.houseHoldItemEntryForm.get('isAdd')?.setValue(true)
    this.houseHoldItemEntryForm.get('isChange')?.setValue(false)
    this.houseHoldItemEntryForm.get('householdItemName')?.enable()
    this.myFiles = []
    this.isSearch = true;
  }

  async uploadDoc(data: any) {
    let progress: number = 0;
    const index = this.myFiles.indexOf(data);
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadDocMEDorHHI(
        formData, 'HHI', this.houseHoldItemEntryForm.getRawValue().householdItemCode
      )).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            progress = Math.round(event.loaded / event.total! * 100);
            this.myFiles[index].progress = progress;
            break;
          case HttpEventType.Response:
            if (!this.fileUploadService.isDocUploadApiError(event.body)) {
              const responseFiles = { ...event.body.apiResponse }
              this.myFiles[index].response.push(responseFiles);
              this.myFiles[index].error = false;
              this.myFiles[index].isAdd = false;
              this.myFiles[index].isDelete = false;
            } else {
              this.myFiles[index].error = true;
            }
            setTimeout(() => {
            }, 1500);
        }
      },
        (error) => {
          this.myFiles[index].error = true;
          this.toastr.error(error ? error : '');
        })
  }

  async onPfFileChange(event: any) {
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true, "tif": true, "tiff": true };
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      this.fileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      return;
    }
    if (extensionAllowed) {
      const nam = event.target.files[0].name.split('.').pop();
      if (!extensionAllowed[nam]) {
        this.fileError = "Please upload " + Object.keys(extensionAllowed) + " file."
        event.target.value = '';
        return;
      }
    }
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    this.myFiles.push(target);
    this.houseHoldItemEntryForm.controls["file"].setValue(this.myFiles);
    await this.uploadDoc(event.target.files[0])
    event.target.value = '';
  }

  async removeFile(index: number) {
    if (this.myFiles[index].error === false) {
      const reqData: any = {
        apiRequest: {
          fileSeqNo: this.myFiles[index].response[0].fileSeqNo,
          fileID: this.myFiles[index].response[0].fileID,
          fileType: this.myFiles[index].response[0].fileType,
          documentNumber: this.myFiles[index].response[0].documentNumber ? this.myFiles[index].response[0].documentNumber : '',
          fileName: this.myFiles[index].response[0].fileName,
          contentType: this.myFiles[index].response[0].contentType,
          documentStatus: this.myFiles[index].response[0].documentStatus,
        }
      }
      reqData.apiRequest.actionIndicator = '';
      await this.fileUploadService.singleFileDeleteMED(reqData, 'HIDE')
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.myFiles.splice(index, 1);
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("File couldn't delete due some error");
          }
        })
    } else {
      this.myFiles.splice(index, 1);
    }
  }

  private intializingMedicineSeectionFormGroup() {
    this.houseHoldItemEntryForm = this.fb.group({
      referenceNumber:[''],
      householdItemCode: [''],
      householdItemName: ['', [Validators.required]],
      householdItemStatus: ['', [Validators.required]],
      householdItemShortName: ['', [Validators.required]],
      householdItemDescription: ['', [Validators.required]],
      householdItemIntroduction: ['', [Validators.required]],
      householdItemIngredients: ['', [Validators.required]],
      householdItemManufacturer: ['', [Validators.required]],
      householdItemMaufacturerAddress: ['', [Validators.required]],
      householdItemUnitPrice: [null, [Validators.required]],
      householdItemCategory: ['', [Validators.required]],
      householdItemSubCategory: ['', [Validators.required]],
      file: [''],
      isAdd: [true],
      isChange: [false]
    })
    this.houseHoldItemEntryForm.get('householdItemSubCategory')?.disable()
  }

  private intializingMessage() {
    this.errorMessage.householdItemName = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOUSEHOLDENAME,
    };
    this.errorMessage.householdItemShortName = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOUSEHOLDESHORTNAME,
    };
    this.errorMessage.householdItemDescription = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOUSEHOLDDESCRIPTION,
    };
    this.errorMessage.householdItemIntroduction = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_householdItemIntroduction,
    };
    this.errorMessage.householdItemIngredients = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_householdItemIntroduction,
    };
    this.errorMessage.householdItemManufacturer = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MANUFACTURER,
    };
    this.errorMessage.householdItemMaufacturerAddress = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MANUFACTURER_ADDRESS,
    };
    this.errorMessage.householdItemCategory = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_householdItemCategory,
    };
    this.errorMessage.householdItemSubCategory = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_householdItemSubCategory,
    };
    this.errorMessage.householdItemUnitPrice = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_PRICE,
    };
    this.errorMessage.householdItemStatus = {
      required: HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_STATUS,
    };
  }
}
