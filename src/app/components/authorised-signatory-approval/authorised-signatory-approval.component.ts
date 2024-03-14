import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { GetFile } from '@pipes/all-pipes/all-pipes';
import { AuthorisedSignatoryAddService } from '@services/authorised-signatory-add.service';
import { CommonService } from '@services/common.service';
import { DocumentApprovalService } from '@services/document-approval.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { PhysicianCredentialApprovalService } from '@services/physician-credential-approval.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-authorised-signatory-approval',
  templateUrl: './authorised-signatory-approval.component.html',
  styleUrls: ['./authorised-signatory-approval.component.css']
})
export class AuthorisedSignatoryApprovalComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  imageBaseUrl: string = BASE_IMAGE_URL;
  documentForm:FormGroup;
  rejectionReasonForm:FormGroup;
  errorMessage:any={};
  authorisedSignatoryDetails:any;
  requestKeyDetails:any;
  signatureFileID:string;
  signatureFile:any;
  fileError:any = '';
  rejectionReasonError:string = '';
  somthingWentWrong:boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private fileUploadService: FileUploadService,
    private authorisedSignatoryAddService: AuthorisedSignatoryAddService,
    private documentApprovalService: DocumentApprovalService,
    private AuthorisedSignatoryAddService: AuthorisedSignatoryAddService,
    private GetFile: GetFile,
  ) {

    this.intializingFormGroup();
    this.intializingMessage();
   }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.getAuthorisedSignatoryDetails()
    })
  }


  getAuthorisedSignatoryDetails = async ()=>{
    const reqData:any = {
      apiRequest:{
        signatoryUserCode: this.requestKeyDetails.userCode,
        signatoryUserID: this.requestKeyDetails.userID,
        workRequestID: this.WorkRequestDetails.caseCode,
      }
    };
    await this.authorisedSignatoryAddService.getAuthorisedSignatoryDetails(reqData,'ASAP')
    .then(async (res: any) => {
      if (!this.commonService.isApiError(res)) {
        this.authorisedSignatoryDetails = res.apiResponse;
        const signatureFile = res.apiResponse.fileDetailsList?.find((res:any)=>res.fileType === 'SIG')
        if(signatureFile){
          this.signatureFileID = signatureFile.fileID;
          this.signatureFile = signatureFile;
        }

      } else {
        if (res.anamnesisErrorList.dbModificationInd === 'Y') {
          this.toastr.error('Please try again');
          this.somthingWentWrong = true;
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          this.somthingWentWrong = true;
        }

      }
    })
    .catch((err: any) => {
      if(err.status !== 401){
      this.somthingWentWrong = true;
      this.toastr.error("Physician information couldn't fetch due some error");
      }
    })
  }

  authorisedSignatoryStatuschange = async (status: string) => {
    let contineu = true;
    if (status === 'R') {
      if (!this.rejectionReasonForm.value.reason.length) {
        contineu = false;
        this.fileError = ''
        this.rejectionReasonError = 'Rejection reason is required';
      }
    }
    if (contineu) {
      if(status === 'A'){
        if (this.signatureFileID) {
          contineu = true;
        } else {
          contineu = false;
          this.fileError = 'please upload a signature';
          this.rejectionReasonError = '';
        }
      }

    }
    if(contineu){
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          approvalRejectionInd: status,
          rejectReason: status === 'R'?this.rejectionReasonForm.value.reason:'',
          signatureFileID: this.signatureFileID?this.signatureFileID:'',
        }
      };
      await this.AuthorisedSignatoryAddService.authorisedSignatoryApproval(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.close.emit(true)
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Authorised signatory couldn't Approve due some error");
          }
        })
    }
  }

  rejectionReasonValuChange(){
    this.rejectionReasonError = '';
  }


  async uploadDoc(data: any, control: any, target: any) {
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
              control.get('error').setValue(false);
              this.signatureFileID = responseFiles.fileID;
              this.signatureFile = responseFiles;
            } else {
              target.error = true;
              control.controls.error.setValue(true);
              control.controls.fileName.setValue(target.name);
              control.controls.document.setValue(target);
            }
            setTimeout(() => {
            }, 1500);
        }
      },
        (error) => {
          target.error = true;
          control.controls.document.setValue(target);
          this.toastr.error(error ? error : '');
        })

  }

  async onFileUpload(event: any) {
    const control: any = this.documentForm;
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


    await this.uploadDoc(event.target.files[0], control, target)
    event.target.value = '';
  }

  closePopup(data?:boolean){
    if(data){
      this.close.emit(true)
    }else{
      this.close.emit()
    }
  }

  intializingFormGroup(){
   this.documentForm = this.fb.group({
      fileType: ['SIG'],
      documentNumber: [''],
      fileSource: [{ value: '', disabled: false }],
      document: [''],
      dataSet: [false],
      toSave: [false],
      fileName: [''],
      fileID: ['',Validators.required],
      progress: [''],
      response: [''],
      error: [''],
      fileError:[''],
    })
    this.rejectionReasonForm = this.fb.group({
      reason:['']
    })
  }

  getDocumentController(controlName: any) {
    const control: any = this.documentForm;
    return control[controlName];
  }
  getDocumentControllerValue(controlName: any) {
    return this.documentForm.value[controlName]
  }

  isDisabled() {
    const control: any = this.documentForm;
    return control.controls.fileSource.disabled;
  }

  async removeItem(){
    if(this.documentForm.getRawValue().error === false){
        const reqData: any = {
          apiRequest: this.documentForm.getRawValue().response
        }
        await this.fileUploadService.singleFileDelete(reqData,'SIG')
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res)) {
                const control: any = this.documentForm;
                control.controls.document.setValue('');
                control.controls.fileSource.setValue('');
                control.controls.dataSet.setValue(false);
                control.controls.toSave.setValue(false);
                control.controls.fileSource.enable();
                control.controls.fileID.setValue('');
                control.controls.error.setValue(false);
                this.signatureFileID = '';
                this.signatureFile = '';
              } else {
                this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
              }
            })
            .catch((err: any) => {
              if(err.status !== 401){
              this.toastr.error("File couldn't delete due some error");
              }
            })
    }else{
      const control: any = this.documentForm;
      control.controls.document.setValue('');
      control.controls.fileSource.setValue('');
      control.controls.dataSet.setValue(false);
      control.controls.toSave.setValue(false);
      control.controls.fileSource.enable();
      control.controls.fileID.setValue('');
      control.controls.error.setValue(false);
      this.signatureFileID = '';
      this.signatureFile = '';
    }

  }

  private intializingMessage() {
    this.errorMessage = {
      fileID:{
        required: 'File is required',
      },
      fileType:{
        required: 'File type is required',
      },
      documentNumber:{
        required: 'Document number is required',
      },
    };

  }

  openFile = (wrAttachmentDetails: any) => {
    // this.wrAttachmentDetails = wrAttachmentDetails;
    // this.showFile = true;
    const url = this.GetFile.transform(wrAttachmentDetails.fileName,wrAttachmentDetails.fileType);
    window.open(url, '_blank', 'width=900,height=900,left=200,top=200');
  }
}
