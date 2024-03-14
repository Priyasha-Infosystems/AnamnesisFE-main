import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { USER_SETUP_ERROR_MSG } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { UserSetupService } from '@services/user-setup.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-single-user-setup',
  templateUrl: './single-user-setup.component.html',
  styleUrls: ['./single-user-setup.component.css']
})
export class SingleUserSetupComponent implements OnInit ,OnChanges{
  @Output()
  finalData: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  xlData:any
  userSetupForm:FormGroup;
  errorMsg:any = {};
  commercialIDList:Array<any> = [];
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private userSetupService: UserSetupService,
  ) {
    this.intializingMessage();
    this.intializingFormGroup();
  }

  ngOnChanges(changes: any): void {
    this.getCommercialIDList();
  }

  getCommercialIDList = async()=>{
    const reqData: any = {
      apiRequest: {}
    }
    await this.userSetupService.getCommercialIDList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
         this.commercialIDList = res.apiResponse.commercialIDDetailsList;
         this.createForm();
        } else {
          res.anamnesisErrorList.anErrorList.forEach((err:any)=>{
            this.commercialIDList = [];
            this.createForm();
          })
        }
      })
      .catch((err: any) => {
        this.commercialIDList = [];
        this.createForm();
      })
  }

  createForm(){
    this.xlData.forEach((val:any,index:number)=>{
      if(!this.commercialIDList.find((res:any)=>res.commercialID === val.commercialID)){
        this.xlData[index].commercialID = '';
      }
   })
    if(this.xlData.length){
      const notEmptyRowIndexList:Array<number> = [];
      this.bulkUserSetupdetailsList().value.forEach((val:any,index:number)=>{
        if(val.firstName.length|| val.middleName.length|| val.lastName.length|| val.emailID.length || val.contactNo.length || val.commercialID.length){
          notEmptyRowIndexList.push(index);
        }
      })
      if(notEmptyRowIndexList.length){
        const lastNotEmptyIndex = Math.max(...notEmptyRowIndexList);
        if(this.bulkUserSetupdetailsList().length>=lastNotEmptyIndex+1){
          const lastEmptyRowNo = this.bulkUserSetupdetailsList().length - (lastNotEmptyIndex+1);
          let number = 0;
          this.xlData.forEach((user:any,userIndex:number)=>{
            number = number +1;
            if(userIndex+1<=lastEmptyRowNo){
              this.bulkUserSetupdetailsList().at(lastNotEmptyIndex+number).patchValue(user);
            }else{
              this.addAnotherBulkUserSetupdetails();
              this.bulkUserSetupdetailsList().at(this.bulkUserSetupdetailsList().length-1).patchValue(user);
            }
          })
        }else{
          this.xlData.forEach((user:any,userIndex:number)=>{
            this.addAnotherBulkUserSetupdetails();
            this.bulkUserSetupdetailsList().at(userIndex).patchValue(user);
          })
        }
      }else{
        this.bulkUserSetupdetailsList().clear()
        this.xlData.forEach((user:any,userIndex:number)=>{
          this.addAnotherBulkUserSetupdetails();
          this.bulkUserSetupdetailsList().at(userIndex).patchValue(user);
        })
      }
    }
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  onContactNoChange(data:string,bulkUserSetupdetailsIndex:number){
    if(data){
      if(!this.commonService.checkUserNumber(data)){
        const oldVal:string = data
        this.bulkUserSetupdetailsList().at(bulkUserSetupdetailsIndex).get('contactNo')?.setValue(oldVal.substring(0, oldVal.length - 1))
      }
    }
    this.userSetupForm.value.bulkUserSetupdetailsList.forEach((val: any, i: number) => {
      const foundData = this.userSetupForm.value.bulkUserSetupdetailsList.filter((res: any) => res.contactNo === val.contactNo)
      if (foundData.length>1) {
        this.bulkUserSetupdetailsList().at(i).get('errMsg')?.setValue('Duplicate contact no');
      }else{
        this.bulkUserSetupdetailsList().at(i).get('errMsg')?.setValue('');
      }
    })
  }

  saveBulkUserSetupdetails= async(data:any,isVAlid:boolean)=>{
    this.formService.markFormGroupTouched(this.userSetupForm);
    if(isVAlid){
      let duplicateContactNoValid = true;
      data.bulkUserSetupdetailsList.forEach((val: any, i: number) => {
        const foundData = data.bulkUserSetupdetailsList.filter((res: any) => res.contactNo === val.contactNo)
        if (foundData.length>1) {
          duplicateContactNoValid = false;
          this.bulkUserSetupdetailsList().at(i).get('errMsg')?.setValue('Duplicate contact no');
        }else{
          this.bulkUserSetupdetailsList().at(i).get('errMsg')?.setValue('');
        }
      })
      if(duplicateContactNoValid){
        const saveData = {...data};
        saveData.bulkUserCount = saveData.bulkUserSetupdetailsList.length;
        this.resetUserSetupForm()
        this.finalData.emit(saveData);
      }
    }
  }

  resetUserSetupForm(){
    this.userSetupForm.reset();
    this.userSetupForm.get('bulkUserCount')?.setValue(0);
    this.bulkUserSetupdetailsList().clear();
    this.addAnotherBulkUserSetupdetails();
  }

  bulkUserSetupdetailsList(){
   return this.userSetupForm.get('bulkUserSetupdetailsList') as FormArray;
  }

  bulkUserSetupdetailsControll(bulkUserSetupdetailsIndex:number,controlName:string){
    const controlArray =<any> this.bulkUserSetupdetailsList();
    return controlArray.controls[bulkUserSetupdetailsIndex].controls[controlName]
  }

  addAnotherBulkUserSetupdetails(){
    this.userSetupForm.get('bulkUserCount')?.setValue(this.bulkUserSetupdetailsList().length+1);
    this.bulkUserSetupdetailsList().push(this.addBulkUserSetupdetailsGroup())
  }

  removeBulkUserSetupdetails(bulkUserSetupdetailsIndex:number){
    if(this.bulkUserSetupdetailsList().length>1){
      this.bulkUserSetupdetailsList().removeAt(bulkUserSetupdetailsIndex);
      this.userSetupForm.get('bulkUserCount')?.setValue(this.bulkUserSetupdetailsList().length);
    }
  }

  private addBulkUserSetupdetailsGroup(){
    return this.fb.group({
      firstName         : ['',[Validators.required,Validators.maxLength(100)]],
      middleName        : [''],
      lastName          : ['',[Validators.required,Validators.maxLength(100)]],
      emailID           : ['',[Validators.required,Validators.email]],
      contactNo         : ['',[Validators.required,Validators.minLength(10),Validators.maxLength(10)]],
      commercialID      : ['',[Validators.required]],
      isXlData          : [false],
      errMsg            : [''],
      actionIndicator   : ['ADD']
    })
  }

  private intializingFormGroup(){
    this.userSetupForm = this.fb.group({
      bulkUserCount:[0],
      bulkUserSetupdetailsList:this.fb.array([this.addBulkUserSetupdetailsGroup()])
    })
  }

  private intializingMessage(){
    this.errorMsg.userSetupForm ={
      firstName:{
        required:USER_SETUP_ERROR_MSG.ERR_MSG_REQUIERD_firstName,
        maxLength:USER_SETUP_ERROR_MSG.ERR_MSG_Max_LENGTH_firstName
      },
      lastName:{
        required:USER_SETUP_ERROR_MSG.ERR_MSG_REQUIERD_lastName,
        maxLength:USER_SETUP_ERROR_MSG.ERR_MSG_Max_LENGTH_lastName
      },
      emailID:{
        required:USER_SETUP_ERROR_MSG.ERR_MSG_REQUIERD_emailID,
        email:USER_SETUP_ERROR_MSG.ERR_MSG_VALID_emailID
      },
      contactNo:{
        required:USER_SETUP_ERROR_MSG.ERR_MSG_REQUIERD_contactNo,
        minLength:USER_SETUP_ERROR_MSG.ERR_MSG_MIN_LENGTH_contactNo,
        maxLength:USER_SETUP_ERROR_MSG.ERR_MSG_Max_LENGTH_contactNo,
      },
      commercialID:{
        required:USER_SETUP_ERROR_MSG.ERR_MSG_REQUIERD_commercialID,
      },
    }
  }

}
