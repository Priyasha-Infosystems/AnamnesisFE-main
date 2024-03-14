import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_REQ, NEW_CASEREGISTRATION } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { NewCaseRegistrationService } from '@services/new-case-registration.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, pipe } from 'rxjs';

@Component({
  selector: 'app-new-case-regitration',
  templateUrl: './new-case-regitration.component.html',
  styleUrls: ['./new-case-regitration.component.css']
})
export class NewCaseRegitrationComponent implements OnInit {
  requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL;
  errorMessage: any = {};
  caseRegistrationForm: FormGroup;
  documentTypeDetailsList: Array<any> = [];
  displayName: string;
  customerList: Array<any> = [];
  searchCustomer: any;
  showCustomerDetails: boolean;
  customerDetails: any;
  userIsAdminHelpDesk: boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private store: Store<any>,
    private fileUploadService: FileUploadService,
    private newCaseRegistrationService: NewCaseRegistrationService,
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
      this.userIsAdminHelpDesk = res.userRoleList.find((val: any) => val.roleCode === 'ADR' || val.roleCode === 'ADM' || val.roleCode === 'ADU' || val.roleCode === 'SAD') ? true : false;
      if (!this.userIsAdminHelpDesk) {
        this.caseRegistrationForm.get('wrCustomerSearch')?.setValue(false);
        this.caseRegistrationForm.get('wrCustomerName')?.setValue(this.displayName);
        this.caseRegistrationForm.get('wrCustomerID')?.setValue(this.requestKeyDetails.userID);
        this.caseRegistrationForm.get('wrCustomerName')?.disable();
      } else {
        this.caseRegistrationForm.get('wrCustomerName')?.enable();
      }
    })
    this.caseRegistrationForm.get('wrCustomerName')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async res => {
        if (res && res.length > 2 && this.caseRegistrationForm.get('wrCustomerSearch')?.value) {
          const reqData: any = {
            apiRequest: {
              searchKeyword: res,
            },
          }
          await this.newCaseRegistrationService.searchPatient(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.patientCount > 0) {
                this.customerList = res.apiResponse.patientDetailsViewList;
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

  saveNewCase = async () => {
    this.formService.markFormGroupTouched(this.caseRegistrationForm)
    if (this.caseRegistrationForm.valid) {
      const data = this.caseRegistrationForm.getRawValue()
      const reqData: any = {
        apiRequest: {
          workRequestID: data.workRequestID,
          workRequestType: data.workRequestType,
          wrOpenTimestamp: data.wrOpenTimestamp,
          wrCloseTimestamp: data.wrCloseTimestamp,
          wrOpenBy: data.wrOpenBy,
          wrAssignedTo: data.wrAssignedTo,
          wrReviewedBy: data.wrReviewedBy,
          wrCustomerID: data.wrCustomerID,
          wrCustomerName: data.wrCustomerName,
          wrSummary: data.wrSummary,
          wrDescription: data.wrDescription,
          wrResolutionNotes: data.wrResolutionNotes,
          wrSatisfactionScore: data.wrSatisfactionScore,
          wrAttachmentCount: data.wrAttachmentCount,
          wrDocumentAttachmentList: data.wrDocumentAttachmentList,
          wrCaseLogEntryList: [],
        }
      }
      data.wrCaseLogEntryList.forEach((v: any) => {
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

  selectCoustomer = (response: any) => {
    this.showCustomerDetails = true;
    this.customerDetails = response;
  }

  selectCoustomerForForm = () => {
    this.showCustomerDetails = false;
    this.caseRegistrationForm.get('wrCustomerSearch')?.setValue(false);
    this.caseRegistrationForm.get('wrCustomerName')?.setValue(this.customerDetails.displayName);
    this.caseRegistrationForm.get('wrCustomerName')?.disable();
    this.caseRegistrationForm.get('wrCustomerID')?.setValue(this.customerDetails.userID);
    this.customerList = [];
  }

  unSelectCoustomer = () => {
    this.showCustomerDetails = false;
    this.customerDetails = {};
    this.customerList = [];
  }

  unSelectCoustomerForForm = () => {
    this.caseRegistrationForm.get('wrCustomerSearch')?.setValue(true);
    this.caseRegistrationForm.get('wrCustomerName')?.setValue('');
    this.caseRegistrationForm.get('wrCustomerName')?.enable();
    this.caseRegistrationForm.get('wrCustomerID')?.setValue('');
  }

  wrDocumentAttachmentList() {
    return this.caseRegistrationForm.get('wrDocumentAttachmentList') as FormArray
  }

  isDocumentSaved(index: any) {
    let controlArray = <any>this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[index].controls["dataSet"];
    return control.value
  }

  isDisabled(index: any) {
    let controlArray = <any>this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[index];
    return control.controls.fileSource.disabled;
  }

  removeItem = async (index: any) => {
    let controlArray = <any>this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[index];
    if (control.value.error) {
      control.controls.document.setValue('');
      control.controls.fileSource.setValue('');
      control.controls.dataSet.setValue(false);
      control.controls.toSave.setValue(false);
      control.controls.fileSource.enable();
      control.controls.fileID.setValue('');
    } else {
      const reqData: any = {
        apiRequest: {
          fileSeqNo: control.value.response.fileSeqNo,
          fileID: control.value.response.fileID,
          fileType: control.value.response.fileType,
          documentNumber: control.value.response.documentNumber ? control.value.response.documentNumber : '',
          fileName: control.value.response.fileName,
          contentType: control.value.response.contentType,
          documentStatus: control.value.response.documentStatus,
        }
      }
      reqData.apiRequest.actionIndicator = '';
      await this.fileUploadService.singleFileDelete(reqData,'NCSR')
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            control.controls.document.setValue('');
            control.controls.fileSource.setValue('');
            control.controls.dataSet.setValue(false);
            control.controls.toSave.setValue(false);
            control.controls.fileSource.enable();
            control.controls.fileID.setValue('');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("File couldn't delete due some error");
          }
        })
    }
  }

  getwrDocumentAttachmentControllerValue(wrDocumentAttachmentIndex: number, controllName: any) {
    var controllArray = <any>this.wrDocumentAttachmentList()
    return controllArray.controls[wrDocumentAttachmentIndex].controls[controllName].value;
  }

  wrDocumentAttachmentController(wrDocumentAttachmentIndex: number, controllName: any) {
    var controllArray = <any>this.wrDocumentAttachmentList()
    return controllArray.controls[wrDocumentAttachmentIndex].controls[controllName];
  }

  addAnotherWRDocumentAttachment() {
    if (this.wrDocumentAttachmentList().valid) {
      this.wrDocumentAttachmentList().push(this.addWRDocumentAttachmentGoup())
    } else {
      this.wrDocumentAttachmentList()?.at(this.wrDocumentAttachmentList()?.length - 1)?.get('customErrMsg')?.setValue('Please upload the document first')
      setTimeout(() => this.wrDocumentAttachmentList()?.at(this.wrDocumentAttachmentList()?.length - 1)?.get('customErrMsg')?.setValue(''), 2500);
    }
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

  deleteWRDocumentAttachment = async (wrDocumentAttachmentIndex: number) => {
    let controlArray = <any>this.wrDocumentAttachmentList();
    const control: any = controlArray.controls[wrDocumentAttachmentIndex];
    if (!control.value.error && control.value.response.fileID) {
      const reqData: any = {
        apiRequest: {
          fileSeqNo: control.value.response.fileSeqNo,
          fileID: control.value.response.fileID,
          fileType: control.value.response.fileType,
          documentNumber: control.value.response.documentNumber ? control.value.response.documentNumber : '',
          fileName: control.value.response.fileName,
          contentType: control.value.response.contentType,
          documentStatus: control.value.response.documentStatus,
        }
      }
      reqData.apiRequest.actionIndicator = '';
      await this.fileUploadService.singleFileDelete(reqData, 'HIDE')
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.wrDocumentAttachmentList().removeAt(wrDocumentAttachmentIndex)
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
      this.wrDocumentAttachmentList().removeAt(wrDocumentAttachmentIndex)
    }
  }

  private addWRDocumentAttachmentGoup() {
    return this.fb.group({
      fileType: ['MSC'],
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
      customErrMsg: [''],
      preData:[false]
    })
  }

  wrCaseLogEntryList() {
    return this.caseRegistrationForm.get('wrCaseLogEntryList') as FormArray
  }

  addAnotherCaseLog(wrCaselog: string) {
    if (wrCaselog.length) {
      this.wrCaseLogEntryList().push(this.addCaseLogGroup());
      this.wrCaseLogEntryList().at(this.wrCaseLogEntryList().length - 1).get('wrCaseLog')?.setValue(wrCaselog)
    }
    this.caseRegistrationForm.get('wrCaseLog')?.setValue('');
  }

  private addCaseLogGroup() {
    return this.fb.group({
      wrCaseLog: [''],
      currentDate: [new Date()],
    })
  }

  private intializingFormGroup() {
    this.caseRegistrationForm = this.fb.group({
      workRequestID: [''],
      workRequestType: ['CSR'],
      workRequestStatus: [1],
      wrOpenTimestamp: [''],
      wrCloseTimestamp: [''],
      wrOpenBy: [''],
      wrAssignedTo: [''],
      wrReviewedBy: [''],
      wrCustomerID: ['', Validators.required],
      wrCustomerName: [''],
      wrCustomerSearch: [true],
      wrSummary: ['', Validators.required],
      wrDescription: ['', Validators.required],
      wrResolutionNotes: [''],
      wrSatisfactionScore: [''],
      wrAttachmentCount: [''],
      wrDocumentAttachmentList: this.fb.array([]),
      wrCaseLogEntryList: this.fb.array([]),
      wrCaseLog: ['']
    })
  }

  private intializingMessage() {
    this.errorMessage.caseRegistrationForm = {
      workRequestType: {
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_workRequestType,
      },
      wrCustomerID: {
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrCustomerID,
      },
      wrSummary: {
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrSummary,
      },
      wrDescription: {
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrDescription,
      },
      wrResolutionNotes: {
        required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_wrResolutionNotes,
      },
      wrDocumentAttachmentList: {
        fileType: {
          required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_fileType,
        },
        documentNumber: {
          required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_documentNumber,
        },
        fileID: {
          required: NEW_CASEREGISTRATION.ERR_MSG_REQUIERD_fileID,
        }
      }
    };
  }
}
