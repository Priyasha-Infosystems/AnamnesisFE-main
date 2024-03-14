import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { setCompanyDetails } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-profile-company-information',
  templateUrl: './profile-company-information.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileCompanyInformationComponent implements OnInit {

  public companyInformationParam: FormGroup;
  companyInformationError: any = "";
  errorMessage: any = {};
  commercialEntityOptionList:any = [];
  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
    private store: Store<any>,
  ) {
    this.companyInformationParam = this.fb.group({
      legalBusinessName: ['', [Validators.required]],
      companyCINno: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]{21,21}')]],
      companyGSTNNo: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]{15,15}')]],
      companyPAN: ['', [Validators.required, Validators.pattern('([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}')]],
      companyTAN: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]{10,10}')]],
      commercialEntityDetailsList: this.fb.array([this.commercialEntityDetailsGroup()]),
    });
  }

  commercialEntityDetailsGroup() {
    return this.fb.group({
      actionIndicator: ['ADD'],
      commercialEntityName: ['', [Validators.required]],
      commercialID: [''],
      commercialType: ['', [Validators.required]],
      transactionResults: [''],
      dataSet: [''],
      commercialEntityOptionList:[],
      tempCommercialEntityDetails:[]
    })
  }

  commercialEntityDetailsLists() {
    return this.companyInformationParam.get('commercialEntityDetailsList') as FormArray
  }

  getCommercialController(index: number, controlName: string) {
    let ControlArray = <any>this.commercialEntityDetailsLists();
    return ControlArray.controls[index].controls[controlName];
  }

  resetError() {
    this.formService.markFormGroupUnTouched(this.companyInformationParam)
    this.companyInformationError = "";
  }

  onChanges(): void {
    this.companyInformationParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.getCompanyInformation();
    this.onChanges()
    this.intializingMessage();
    this.companyInformationParam.get('commercialEntityDetailsList')?.valueChanges.subscribe(res => {
    })
  }

  onChangeData(index: any) {
    if (this.commercialEntityDetailsLists().at(index).get('actionIndicator')?.getRawValue() === '') {
      this.commercialEntityDetailsLists().at(index).get('actionIndicator')?.setValue('UPD');
    } 
  }

  intializingMessage() {
    this.errorMessage.legalBusinessName = {
      required: "Legal business name is required"
    };
    this.errorMessage.companyCINno = {
      required: "Company CIN is required",
      pattern: "CIN should be of valid 21 characters"
    };
    this.errorMessage.companyGSTNNo = {
      required: "Company GSTN is required",
      pattern: "GSTN should be of valid 15 characters"
    };
    this.errorMessage.companyPAN = {
      required: "Company PAN is required",
      pattern: "Please enter a valid PAN"
    };
    this.errorMessage.companyTAN = {
      required: "Company TAN is required",
      pattern: "TAN should be of valid 10 characters"
    };
    this.errorMessage.commercialEntityName = {
      required: "Commercial Entity Name is required",
    };
    this.errorMessage.commercialID = {
      required: "Commercial ID is required",
    };
    this.errorMessage.commercialType = {
      required: "Commercial Type is required",
    };
  }

  getCompanyInformation = async () => {
    await this.profileService.getCompanyInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const companyData = { ...res.apiResponse };
          if (companyData.commercialEntityDetailsList.length > 0) {
            companyData.commercialEntityDetailsList.forEach((list: any, index: any) => {
              list.actionIndicator = '',
              list.dataSet = true;
              if (companyData.commercialEntityDetailsList.length - 1 !== index) {
                this.addCommercial();
              }
            })
          }
          this.companyInformationParam.patchValue(companyData);
          this.store.dispatch(new setCompanyDetails(companyData));
          this.commercialEntityDetailsLists().value.forEach((res:any,index:number)=>{
            this.commercialEntityDetailsLists().at(index).get('commercialEntityName')?.disable()
            this.commercialEntityDetailsLists().at(index).get('commercialID')?.disable()
            this.commercialEntityDetailsLists().at(index).get('commercialType')?.disable()
          })
        }
      })
      .catch((err: any) => {
      })
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.companyInformationParam);
    this.resetError();
    if (isValid) {
      const requestData = { ...data };
      requestData.commercialEntityDetailsList.forEach((list: any) => {
        delete list.dataSet
      })
      const reqData = {
        apiRequest: { ...data },
      }
      await this.profileService.updateCompanyInformation(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
            this.getCompanyInformation();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.companyInformationError = err.error.message;
        })
    }
  }

  addCommercial() {
    this.commercialEntityDetailsLists().push(this.commercialEntityDetailsGroup())
  }

  deleteCommercial(index: number) {
    if (this.commercialEntityDetailsLists().at(index).get('actionIndicator')?.getRawValue() === 'ADD' ) {
      this.commercialEntityDetailsLists().removeAt(index);
    } else {
      this.commercialEntityDetailsLists().at(index).get('actionIndicator')?.setValue('DEL');
    }
    const comList = this.commercialEntityDetailsLists().value.filter((data: any) => data.actionIndicator !== "DEL");
    if (comList.length === 0) {
      this.commercialEntityDetailsLists().push(this.commercialEntityDetailsGroup())
    }
  }

  isDisabled(index: any) {
    if (this.commercialEntityDetailsLists().at(index).get('dataSet')?.value) {
      return true
    }
    return false;
  }

  isAddButtonVisible(index: any) {
    const filteredArr: any = [];
    this.commercialEntityDetailsLists().value?.forEach((val: any, index: any) => {
      if (val.actionIndicator !== "DEL") {
        const ob = {...val}
        val.index = index
        filteredArr.push(val)
      } else {
        filteredArr.push(null)
      }
    })
    const filterObj = filteredArr.filter((obj: any) => obj !== null);
    return filterObj[filterObj.length - 1].index === index ? true : false;
  }

  async searchCommercialEntity(name:any,index: number){
    if(name && name.length>2){
      const reqData = {
        apiRequest: {searchKeyword:name},
      }
      await this.profileService.searchCommercialEntity(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.commercialEntityDetailsLists().at(index).get('commercialEntityOptionList')?.setValue(res.apiResponse.commercialEntityTableList?res.apiResponse.commercialEntityTableList:[]);
          } else {
            this.commercialEntityDetailsLists().at(index).get('commercialEntityOptionList')?.setValue([])
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.commercialEntityDetailsLists().at(index).get('commercialEntityOptionList')?.setValue([])
        })
    }
  }

  selectCommercialEntity(data:any,index: number){
    const foundCommercialEntity = this.commercialEntityDetailsLists().getRawValue().filter((val:any)=>val.actionIndicator !== "DEL").find(res=>res.commercialID === data.commercialID);
    if(foundCommercialEntity){
      this.toastr.error('This entity already selected')
    }else{
      this.commercialEntityDetailsLists().at(index).get('tempCommercialEntityDetails')?.setValue(data)
    }
  }

  confirmCommercialEntity(index: number){
    const data = this.commercialEntityDetailsLists().at(index).get('tempCommercialEntityDetails')?.getRawValue()
    this.commercialEntityDetailsLists().at(index).get('commercialEntityName')?.setValue(data.displayName)
    this.commercialEntityDetailsLists().at(index).get('commercialEntityName')?.disable()
    this.commercialEntityDetailsLists().at(index).get('commercialID')?.setValue(data.commercialID)
    this.commercialEntityDetailsLists().at(index).get('commercialID')?.disable()
    this.commercialEntityDetailsLists().at(index).get('commercialType')?.setValue(data.commercialType)
    this.commercialEntityDetailsLists().at(index).get('commercialType')?.disable()
    this.commercialEntityDetailsLists().at(index).get('commercialEntityOptionList')?.setValue([])
    this.commercialEntityDetailsLists().at(index).get('tempCommercialEntityDetails')?.setValue('')
  }

  cancleCommercialEntity(index: number){
    this.commercialEntityDetailsLists().at(index).get('tempCommercialEntityDetails')?.setValue('')
  }
}
