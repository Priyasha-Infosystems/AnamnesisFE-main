import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, NEW_CASEREGISTRATION } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { GetFile } from '@pipes/all-pipes/all-pipes';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { NewCaseRegistrationService } from '@services/new-case-registration.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-work-request-popup',
  templateUrl: './work-request-popup.component.html',
  styleUrls: ['./work-request-popup.component.css']
})
export class WorkRequestPopupComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL;
  errorMessage:any ={};
  caseRegistrationForm:FormGroup;
  documentTypeDetailsList:Array<any> = [];
  displayName:string;
  customerList:Array<any> = [];
  searchCustomer:any;
  showCustomerDetails:boolean;
  customerDetails:any;
  userIsAdminHelpDesk:boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private store: Store<any>,
    private fileUploadService: FileUploadService,
    private newCaseRegistrationService: NewCaseRegistrationService,
    private caseLogService: CaseLogService,
    private filePipe: GetFile
  ) {
    this.intializingMessage();
    this.store.pipe(select('profileState')).subscribe(async val => {
      this.displayName = val.profileDetails.displayName ?? ""
    })

  }
  ngOnInit(): void {
    window.scrollTo(0, 0);
    // this.getUploadDocumentType();
    this.intializingFormGroup();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.userIsAdminHelpDesk = res.userRoleList.find((val:any)=>val.roleCode ==='ADR' || val.roleCode ==='ADM' || val.roleCode ==='ADU'|| val.roleCode ==='SAD')?true:false;
      this.caseRegistrationForm.get('workRequestID')?.setValue(this.WorkRequestDetails.caseCode);
      this.caseRegistrationForm.get('wrCustomerSearch')?.setValue(false);
      this.caseRegistrationForm.get('wrCustomerName')?.setValue('');
      this.caseRegistrationForm.get('wrCustomerID')?.setValue(this.WorkRequestDetails.wrCustomerID);
      this.caseRegistrationForm.get('wrCloseTimestamp')?.setValue(this.WorkRequestDetails.caseCode);
      this.caseRegistrationForm.get('wrOpenTimestamp')?.setValue(this.WorkRequestDetails.OpenDate);
      this.caseRegistrationForm.get('wrOpenBy')?.setValue(this.WorkRequestDetails.wrOpenBy);
      this.caseRegistrationForm.get('wrAssignedTo')?.setValue(this.WorkRequestDetails.wrAssignedTo);
      this.caseRegistrationForm.get('wrReviewedBy')?.setValue(this.WorkRequestDetails.wrReviewedBy);
      this.caseRegistrationForm.get('wrSummary')?.setValue(this.WorkRequestDetails.summary);
      this.caseRegistrationForm.get('workRequestStatus')?.setValue(this.WorkRequestDetails.wrStatus);
      this.caseRegistrationForm.get('wrDescription')?.setValue(this.WorkRequestDetails.wrDescription);
      this.caseRegistrationForm.get('wrResolutionNotes')?.setValue(this.WorkRequestDetails.wrResolutionNotes);
      this.caseRegistrationForm.get('wrSatisfactionScore')?.setValue(this.WorkRequestDetails.wrSatisfactionScore);
      this.getUserName(this.WorkRequestDetails.wrCustomerID)
      this.WorkRequestDetails?.wrAttachmentDetailsList?.forEach((res:any)=>{
        this.addAnotherWRDocumentAttachment()
        const data = {
          fileType: 'MSC',
          documentNumber: '',
          fileSource: '',
          document: true,
          dataSet: true,
          toSave: true,
          fileName: res.fileName,
          fileID: res.documentID,
          progress: 100,
          response: res,
          error: false,
          fileError:'',
          preData:true
        }
        this.wrDocumentAttachmentList().at(this.wrDocumentAttachmentList().length-1).patchValue(data)
      })
    })
    this.getCaseLog()
    this.caseRegistrationForm.get('wrCustomerName')?.valueChanges
    .pipe(debounceTime(500))
    .subscribe(async (res:any)=>{
      if(res && res.length>2 && this.caseRegistrationForm.get('wrCustomerSearch')?.value){
        const reqData: any = {
          apiRequest: {
            searchKeyword: res,
          },
        }
        await this.newCaseRegistrationService.searchPatient(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res) && res.apiResponse.patientCount > 0) {
              this.customerList = res.apiResponse.patientDetailsList;
            } else {
              this.customerList = [];
            }
          })
          .catch((err: any) => {
            this.customerList = [];
          })
      }else{
        this.customerList = [];
      }
    })
  }

  getUserName = async (userID: number) => {
    const stringUserID: string = userID.toString()
    if (stringUserID.length === 10) {
      const reqData: any = {
        apiRequest: {
          userID: userID
        }
      }
      await this.newCaseRegistrationService.getUserName(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.caseRegistrationForm.get('wrCustomerName')?.setValue(res.apiResponse.transactionResult);
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("User name couldn't fetch due some error");
          }
        })
    }
  }

  getCaseLog= async()=>{
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode
      }
    };
    await this.caseLogService.GetCaseLOG(reqData)
    .then(async (res: any) => {
      if (!this.commonService.isApiError(res)) {
        if(res.apiResponse.caseLogCount){
          res.apiResponse.caseLogInformationList.forEach((caseLogInformation:any)=>{
            this.addAnotherCaseLog(caseLogInformation.caseLogText,caseLogInformation)
          })
        }
      } else {
        if(res.anamnesisErrorList.dbModificationInd=== 'Y'){
          this.toastr.error('Please try again');
        }else{
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
        }
      }
    })
    .catch((err: any) => {
      if(err.status !== 401){
      this.toastr.error("Case logs couldn't fetch due some error");
      }
    })
  }
  private intializingFormGroup(){
    this.caseRegistrationForm = this.fb.group({
      workRequestID:[''],
      workRequestType:[{value:'CSR',disabled:true}],
      workRequestStatus:[1],
      wrOpenTimestamp:[''],
      wrCloseTimestamp:[''],
      wrOpenBy:[''],
      wrAssignedTo:[''],
      wrReviewedBy:[''],
      wrCustomerID:['',Validators.required],
      wrCustomerName:[{value:'',disabled:true}],
      wrCustomerSearch:[false],
      wrSummary:[{value:'',disabled:true},[Validators.required]],
      wrDescription:[{value:'',disabled:true}],
      wrResolutionNotes:[''],
      wrSatisfactionScore:[''],
      wrAttachmentCount:[''],
      wrDocumentAttachmentList:this.fb.array([]),
      wrCaseLogEntryList:this.fb.array([]),
      wrCaseLog:['']
    })
  }

  saveNewCase= async()=>{
    this.formService.markFormGroupTouched(this.caseRegistrationForm)
    if(this.caseRegistrationForm.valid){
      const data = this.caseRegistrationForm.getRawValue()
      const reqData: any = {
        apiRequest: {
        workRequestID:data.workRequestID,
        workRequestType:data.workRequestType,
        wrOpenTimestamp:data.wrOpenTimestamp,
        wrCloseTimestamp:data.wrCloseTimestamp,
        wrOpenBy:data.wrOpenBy,
        wrAssignedTo:data.wrAssignedTo,
        wrReviewedBy:data.wrReviewedBy,
        wrCustomerID:data.wrCustomerID,
        wrCustomerName:data.wrCustomerName,
        wrSummary:data.wrSummary,
        wrDescription:data.wrDescription,
        wrResolutionNotes:data.wrResolutionNotes,
        wrSatisfactionScore:data.wrSatisfactionScore,
        wrAttachmentCount:data.wrAttachmentCount,
        wrDocumentAttachmentList:data.wrDocumentAttachmentList,
        wrCaseLogEntryList:[],
        }
      }
      data.wrCaseLogEntryList.forEach((v:any)=>{
        reqData.apiRequest.wrCaseLogEntryList.push(v.wrCaseLog)
      })
      await this.newCaseRegistrationService.saveRequest(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success("Request registered successfully");
            this.ngOnInit()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Request could not add due some error");
          }
        })
    }
  }

  selectCoustomer = (response:any)=>{
    this.showCustomerDetails = true;
    this.customerDetails = response;
  }

  selectCoustomerForForm=()=>{
    this.showCustomerDetails = false;
    this.caseRegistrationForm.get('wrCustomerSearch')?.setValue(false);
    this.caseRegistrationForm.get('wrCustomerName')?.setValue(this.customerDetails.displayName);
    this.caseRegistrationForm.get('wrCustomerName')?.disable();
    this.caseRegistrationForm.get('wrCustomerID')?.setValue(this.customerDetails.userID);
    this.customerList = [];
  }

  unSelectCoustomer=()=>{
    this.showCustomerDetails = false;
    this.customerDetails = {};
    this.customerList = [];
  }

  unSelectCoustomerForForm=()=>{
    this.caseRegistrationForm.get('wrCustomerSearch')?.setValue(true);
    this.caseRegistrationForm.get('wrCustomerName')?.setValue('');
    this.caseRegistrationForm.get('wrCustomerName')?.enable();
    this.caseRegistrationForm.get('wrCustomerID')?.setValue('');
  }

  wrDocumentAttachmentList(){
   return this.caseRegistrationForm.get('wrDocumentAttachmentList') as FormArray
  }

  isDocumentSaved(index: any) {
    let controlArray = <any> this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[index].controls["dataSet"];
    return control.value
  }

  isDisabled(index: any) {
    let controlArray = <any> this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[index];
    return control.controls.fileSource.disabled;
  }

  removeItem = (index: any) => {
    let controlArray = <any> this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[index];
    control.controls.document.setValue('');
    control.controls.fileSource.setValue('');
    control.controls.dataSet.setValue(false);
    control.controls.toSave.setValue(false);
    control.controls.fileSource.enable();
    control.controls.fileID.setValue('');
  }

  getwrDocumentAttachmentControllerValue(wrDocumentAttachmentIndex:number,controllName:any){
    var controllArray = <any> this.wrDocumentAttachmentList()
    return controllArray.controls[wrDocumentAttachmentIndex].controls[controllName].value;
  }
  wrDocumentAttachmentController(wrDocumentAttachmentIndex:number,controllName:any){
    var controllArray = <any> this.wrDocumentAttachmentList()
    return controllArray.controls[wrDocumentAttachmentIndex].controls[controllName];
  }

  addAnotherWRDocumentAttachment(){
    this.wrDocumentAttachmentList().push(this.addWRDocumentAttachmentGoup())
  }

  async uploadDoc(data: any, control: any, target: any, index: any) {
    let progress: number = 0;
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadDoc(
        formData, control.value.fileType, control.value.documentNumber
      )).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            progress = Math.round(event.loaded / event.total! * 100);
            target.progress = progress;
            control.controls.document.setValue(target);
            control.controls.progress.setValue(progress);
            break;
          case HttpEventType.Response:
            if (!this.fileUploadService.isDocUploadApiError(event.body)) {
              const responseFiles = { ...event.body.apiResponse }
              target.response.push(responseFiles);
              control.controls.document.setValue(target);
              control.get('response').setValue(responseFiles);
              control.get('fileName').setValue(responseFiles.fileName);
              control.get('fileID').setValue(responseFiles.fileID);
              control.get('toSave').setValue(true);
              control.get('dataSet').setValue(true);
            } else {
              target.error = true;
              control.controls.error.setValue(true);
              control.controls.fileName.setValue(target.name);
              control.controls.document.setValue(target);
            }
            setTimeout(() => {
              // progress = 0;
            }, 1500);
        }
      },
        (error) => {
          target.error = true;
          control.controls.document.setValue(target);
          this.toastr.error(error ? error : '');
        })
  }

  async onFileUpload(event: any, index: any) {
    let controlArray = <FormArray>this.caseRegistrationForm.controls["wrDocumentAttachmentList"];
    const control: any = controlArray.controls[index];
    control.controls.fileError.setValue("")
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true };
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      control.controls.fileError.setValue("File is too large. Allowed maximum size is 2 MB");
      // this.fileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      return;
    }
    if (extensionAllowed) {
      var nam = event.target.files[0].name.split('.').pop();
      if (!extensionAllowed[nam]) {
        control.controls.fileError.setValue("Please upload " + Object.keys(extensionAllowed) + " file.")
        event.target.value = '';
        return;
      }
    }
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    control.controls.document.setValue(target);
    await this.uploadDoc(event.target.files[0], control, target, index)
    event.target.value = '';
  }

  deleteWRDocumentAttachment(wrDocumentAttachmentIndex:number){
    this.wrDocumentAttachmentList().removeAt(wrDocumentAttachmentIndex)
  }

  private addWRDocumentAttachmentGoup(){
    return this.fb.group({
      fileType: ['MSC'],
      documentNumber: [''],
      fileSource: [{ value: '', disabled: false }],
      document: [''],
      dataSet: [false],
      toSave: [false],
      fileName: [''],
      fileID: ['',[Validators.required]],
      progress: [''],
      response: [''],
      error: [''],
      fileError:[''],
      preData:[false]
    })
  }

  wrCaseLogEntryList(){
    return this.caseRegistrationForm.get('wrCaseLogEntryList') as FormArray
  }

  addAnotherCaseLog(wrCaselog:string ,data?:any){
    if(wrCaselog.length){
      this.wrCaseLogEntryList().push(this.addCaseLogGroup());
      this.wrCaseLogEntryList().at(this.wrCaseLogEntryList().length-1).get('wrCaseLog')?.setValue(wrCaselog)
      if(data){
        this.wrCaseLogEntryList().at(this.wrCaseLogEntryList().length-1).get('currentDate')?.setValue(this.getTimeStamp(data.caseLogTimestamp))
        this.wrCaseLogEntryList().at(this.wrCaseLogEntryList().length-1).get('caseLogUserName')?.setValue(data.caseLogUserName)
        this.wrCaseLogEntryList().at(this.wrCaseLogEntryList().length-1).get('isAdd')?.setValue(false)
      }
    }
    this.caseRegistrationForm.get('wrCaseLog')?.setValue('');
  }

  getTimeStamp(time:number){
    return new Date(time);
  }

  private addCaseLogGroup(){
   return this.fb.group({
      wrCaseLog:[''],
      currentDate:[new Date()],
      caseLogUserName:[this.displayName],
      isAdd:[true],
    })
  }

  private intializingMessage() {
    this.errorMessage.caseRegistrationForm = {
      workRequestType:{
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_workRequestType,
      },
      wrCustomerID:{
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrCustomerID,
      },
      wrSummary:{
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrSummary,
      },
      wrDescription:{
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrDescription,
      },
      wrResolutionNotes:{
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrResolutionNotes,
      },
      wrDocumentAttachmentList:{
        fileType:{
          required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_fileType,
        },
        documentNumber:{
          required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_documentNumber,
        },
        fileID:{
          required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_fileID,
        }
      }
    };
  }

  closePopup() {
    this.close.emit(false);
  }
  openFile = (wrDocumentAttachmentIndex: any) => {
    // this.wrAttachmentDetails = wrAttachmentDetails;
    // this.showFile = true;
    const url =  this.filePipe.transform(this.getwrDocumentAttachmentControllerValue(wrDocumentAttachmentIndex, 'fileName')
    ,this.getwrDocumentAttachmentControllerValue(wrDocumentAttachmentIndex, 'fileType')) ;
    window.open(url, '_blank', 'width=900,height=900,left=200,top=200');
  }
}
