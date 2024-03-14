import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LOCAL_STORAGE } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-profile-document-upload',
  templateUrl: './profile-document-upload.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileDocumentUploadComponent implements OnInit {

  public profileDcUploadParam: FormGroup;
  profileDocUploadError: any = "";
  errorMessage: any = {};

  defaultProfileDocumentList: any = [];
  documentTypeDetailsList: any = [];

  userRoles: any = [];

  companyData: any;

  filteredDocTypes: any = [];

  unsavedToDelete: any = [];
  removedControl: any = [];

  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any
  @Input() isCompanyIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
    private fileUploadService: FileUploadService,
    private store: Store<any>,
    private localStorageService: LocalStorageService,
  ) {
    this.profileDcUploadParam = this.fb.group({
      documentList: this.fb.array([]),
    })
  }

  setForm() {
    var parentData: FormGroup = this.fb.group({
      fileType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      fileSource: [{ value: '', disabled: true }],
      deleteSource: [''],
      document: [''],
      dataSet: [false],
      toSave: [false],
      fileName: [''],
      fileID: ['', [Validators.required]],
      fileSeqNo: [''],
      progress: [''],
      response: [''],
      error: [''],
      docError: [''],
      actionIndicator: [''],
      isDisableControl: [''],
      contentType: [''],
      documentStatus: [''],
      deletedUnsavedDoc: [''],
      isDeletedSource: [false],
      fileError: [''],
    })
    this.getProfileDocumentList().push(parentData);
  }

  async setData(data: any) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        this.setForm();
      }
      let i = 0;
      data.forEach((val: any) => {
        let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
        controlArray.controls[i].patchValue(val);
        const control: any = controlArray.controls[i];
        control.controls.dataSet.setValue(true);
        control.controls.isDisableControl.setValue(true);
        i++;
      })
    } else {
      this.setForm();
    }
  }

  getProfileDocumentList() {
    return this.profileDcUploadParam.get('documentList') as FormArray
  }

  resetError() {
    this.profileDocUploadError = "";
  }

  onChanges(): void {
    this.profileDcUploadParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  onValueChange = (index: any, isCheck?: boolean) => {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    control.controls.docError.setValue('');
    if (isCheck) {
      if (this.companyData && this.companyData[control.value.fileType]) {
        control.controls.documentNumber.setValue(this.companyData[control.value.fileType]);
      } else {
        control.controls.documentNumber.setValue('');
      }
    }

    if (control.value.documentNumber !== "" && control.value.fileType !== "") {
      control.controls.fileSource.enable();
      control.controls.toSave.setValue(true);
      control.controls.isDisableControl.setValue(false);
    } else {
      control.controls.fileSource.disable();
    }
    if (isCheck) {
      this.onFocusOutEvent(index)
    }
  }

  async setUserRoles() {
    this.userRoles = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.ROLE_DETAILS_LIST) || [];
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.documentDetailsFetched && this.userRoles && this.documentTypeDetailsList.length === 0) {
        this.userRoles.forEach((role: any) => {
          const filteredDoc = val.documentTypeDetailsList.filter((doc: any) => doc.roleCode === role.roleCode)
          this.documentTypeDetailsList = [...this.documentTypeDetailsList, ...filteredDoc]
          const key = 'documentType';
          this.documentTypeDetailsList = [...new Map(this.documentTypeDetailsList.map((item: any) => [item[key], item])).values()]
        })
      }
    })
  }

  ngOnInit(): void {
    this.profileDcUploadParam.valueChanges.subscribe(val => {
      this.filterDocList()
    });
    this.getProfileDocInformation();
    this.onChanges()
    this.intializingMessage();
    this.setUserRoles();
    if (this.isCompanyIndex) {
      this.getCompanyInformation();
    }
    this.getPhysicianCredentialDetails();
  }

  getPhysicianCredentialDetails = async () => {
    await this.profileService.getPhysicianCredentialsDetails()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const physicanCredentials = { ...res.apiResponse };
          this.companyData = {
            MRC: physicanCredentials.registrationNumber ?? '',
          }
        }
      })
      .catch((err: any) => {
      })
  }

  getCompanyInformation = async () => {
    await this.profileService.getCompanyInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const companyResponseData = { ...res.apiResponse };
          this.companyData = {
            CIN: companyResponseData.companyCINno ?? '',
            GST: companyResponseData.companyGSTNNo ?? '',
            CPN: companyResponseData.companyPAN ?? '',
            TAN: companyResponseData.companyTAN ?? '',
          }
        }
      })
      .catch((err: any) => {
      })
  }

  intializingMessage() {
    this.errorMessage.fileType = {
      required: "Document type is required"
    };
    this.errorMessage.documentNumber = {
      required: "Document number is required"
    };
    this.errorMessage.fileID = {
      required: "Document is required"
    };
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
              control.controls.response.setValue(responseFiles);
              control.controls.fileName.setValue(responseFiles.fileName);
              control.controls.fileID.setValue(responseFiles.fileID);
              control.controls.toSave.setValue(true);
              control.controls.fileSeqNo.setValue(index + 1);
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

  enableDocUpdate = (index: any) => {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    control.controls.isDisableControl.setValue(false);
  }

  removeSavedItem = (index: any) => {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    if (control.controls.dataSet.value) {
      const deleteDocData = {
        fileSeqNo: control.controls.fileSeqNo.value,
        fileID: control.controls.fileID.value,
        fileType: control.controls.fileType.value,
        documentNumber: control.controls.documentNumber.value,
        fileName: control.controls.fileName.value,
        contentType: control.controls.contentType.value,
        documentStatus: control.controls.documentStatus.value
      }
      control.controls.deleteSource.setValue([deleteDocData]);
      control.controls.toSave.setValue(true);
      control.controls.fileID.setValue('');
      control.controls.fileSource.enable();
      control.controls.fileSource.setValue('');
    }
  }

  removeItem = (index: any) => {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    control.controls.deletedUnsavedDoc.setValue([{ ...control.controls.document.value.response[0] }]);
    control.controls.document.setValue('');
    control.controls.fileSource.setValue('');
    control.controls.toSave.setValue(false);
    control.controls.fileSource.enable();
    control.controls.fileID.setValue('');
  }

  async onFileUpload(event: any, index: any) {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true };
    let isFileError = ''
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      isFileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      control.controls.fileError.setValue(isFileError);
      return;
    }
    if (extensionAllowed) {
      var nam = event.target.files[0].type.split('/').pop();
      if (!extensionAllowed[nam]) {
        isFileError = "Please upload " + Object.keys(extensionAllowed) + " file."
        event.target.value = '';
        control.controls.fileError.setValue(isFileError);
        return;
      }
    }
    control.controls.fileError.setValue(isFileError);
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];

    control.controls.document.setValue(target);
    if (control.controls.deleteSource.value.length > 0 && !control.controls.isDeletedSource.value) {
      const reqData = {
        apiRequest: control.controls.deleteSource.value[0],
      }
      await this.commonService.singleFileDelete(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            control.controls.isDeletedSource.setValue(true);
            await this.uploadDoc(event.target.files[0], control, target, index);
            event.target.value = '';
          } else {
            this.setForm()
          }
        })
        .catch((err: any) => {
        })
      return
    }
    if (control.controls.deletedUnsavedDoc.value.length > 0) {
      const reqData = {
        apiRequest: control.controls.deletedUnsavedDoc.value[0],
      }
      await this.commonService.singleFileDelete(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            control.controls.deletedUnsavedDoc.setValue('');
            await this.uploadDoc(event.target.files[0], control, target, index);
            event.target.value = '';
          } else {
            this.setForm()
          }
        })
        .catch((err: any) => {
        })
      return
    }
    await this.uploadDoc(event.target.files[0], control, target, index);
    event.target.value = '';
  }

  getProfileDocInformation = async () => {
    await this.profileService.GetDocumentList()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultProfileDocumentList = [...res.apiResponse];
          this.setData(this.defaultProfileDocumentList);
          this.removedControl = [];
        } else {
          this.setForm()
        }
      })
      .catch((err: any) => {
      })
  }

  addDocument() {
    this.setForm()
  }

  getReqObj(data: any) {
    const reqData = { ...data }
    const editedData = reqData.documentList.filter((doc: any) => doc.toSave === true);
    const editedDataArr: any = [];
    if (editedData.length > 0) {
      editedData.forEach((data: any) => {
        const docData = {
          fileSeqNo: data.fileSeqNo,
          fileID: data.fileID,
          fileType: data.fileType,
          documentNumber: data.documentNumber,
          fileName: data.fileName,
          contentType: data.response.contentType,
          documentStatus: data.response.documentStatus,
          actionIndicator: data.actionIndicator ? data.actionIndicator : data.dataSet && data.deleteSource.length === 0 ? 'UPD' : 'ADD',
          transactionStatus: ''
        }
        editedDataArr.push(docData);
      })
    }
    if (this.removedControl.length > 0) {
      this.removedControl.forEach((rmvCtr: any) => {
        if (rmvCtr.deleteSource.value.length > 0) {
          const deletedSrc = rmvCtr.deleteSource.value[0];
          deletedSrc.actionIndicator = 'DEL';
          deletedSrc.transactionStatus = '';
          editedDataArr.push(deletedSrc);
        }
        if (rmvCtr.document.value.response) {
          const deleteDoc = rmvCtr.document.value.response[0];
          deleteDoc.actionIndicator = 'DEL';
          deleteDoc.transactionStatus = '';
          editedDataArr.push(deleteDoc);
        }
        if (rmvCtr.deletedUnsavedDoc.value.length > 0) {
          const deletedUnsaved = rmvCtr.deletedUnsavedDoc.value[0];
          deletedUnsaved.actionIndicator = 'DEL';
          deletedUnsaved.transactionStatus = '';
          editedDataArr.push(deletedUnsaved);
        }
        if (rmvCtr.deleteSource.value.length === 0 && !rmvCtr.document.value.response && rmvCtr.deletedUnsavedDoc.value.length === 0 && rmvCtr.fileID.value) {
          const deletedDocData = {
            fileSeqNo: rmvCtr.fileSeqNo.value,
            fileID: rmvCtr.fileID.value,
            fileType: rmvCtr.fileType.value,
            documentNumber: rmvCtr.documentNumber.value,
            fileName: rmvCtr.fileName.value,
            contentType: rmvCtr.contentType.value,
            documentStatus: rmvCtr.documentStatus.value,
            actionIndicator: 'DEL',
            transactionStatus: ''
          }
          editedDataArr.push(deletedDocData);
        }
      })
    }

    const unsavedDocs = reqData.documentList.filter((doc: any) => doc.documentStatus === 1);
    if (unsavedDocs.length > 0) {
      unsavedDocs.forEach((ddd: any) => {
        const docData = {
          fileSeqNo: ddd.fileSeqNo,
          fileID: ddd.fileID,
          fileType: ddd.fileType,
          documentNumber: ddd.documentNumber,
          fileName: ddd.fileName,
          contentType: ddd.contentType,
          documentStatus: ddd.documentStatus,
          actionIndicator: 'ADD',
          transactionStatus: ''
        }
        editedDataArr.push(docData);
      });
    }

    if (editedDataArr.length === 0) {
      this.toastr.error("Nothing to update");
    }
    return editedDataArr
  }

  clearAll() {
    this.profileDcUploadParam.reset()
    this.getProfileDocumentList().clear()
  }

  isValidForm(data: any) {
    let isValid: boolean = true
    data.documentList.forEach((doc: any) => {
      if (doc.docError) {
        isValid = false;
      }
    });
    return isValid;
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.profileDcUploadParam);
    this.resetError();
    if (isValid && this.isValidForm(data)) {
      const reqObj = this.getReqObj(data)
      if (reqObj) {
        const reqData = {
          apiRequest: reqObj,
        }
        await this.profileService.updateDocument(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.updateSave.emit();
              if (reqObj.length > 0) {
                this.toastr.success("Data updated successfully");
              }
              this.clearAll();
              this.getProfileDocInformation();
              this.removedControl = [];
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            }
          })
          .catch((err: any) => {
            this.profileDocUploadError = err.error.message;
          })
      }
    }
  }

  isDisabled(index: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    return control.controls.isDisableControl.value;
  }

  isDocTypeDisabled(index: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    return control.controls.dataSet.value;
  }

  isDocDisabled(index: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    return control.controls.fileSource.disabled;
  }

  getController(index: any, controlName: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control;
  }

  getControllerValue(index: any, controlName: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control.value;
  }

  isDataSaved(index: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const dataSet: any = controlArray.controls[index].controls["dataSet"].value;
    const deleteSource: any = controlArray.controls[index].controls["deleteSource"].value;
    return dataSet && deleteSource.length === 0
  }

  deleteDocRow(index: any) {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    this.removedControl.push(control.controls)
    controlArray.removeAt(index);
    if (controlArray.controls.length === 0) {
      this.addDocument();
    }
  }

  isValidDocument(control: any) {
    const regPan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
    const regVotar = /^[a-zA-Z]{3}[0-9]{7}$/
    switch (control.value.fileType) {
      case 'CIN':
        if (control.value.documentNumber.length !== 21) {
          control.controls.docError.setValue('CIN should be of valid 21 characters');
        } else {
          control.controls.docError.setValue('');
        }
        break;
      case 'GST':
        if (control.value.documentNumber.length !== 15) {
          control.controls.docError.setValue('GST should be of valid 15 characters');
        } else {
          control.controls.docError.setValue('');
        }
        break;
      case 'PDC':
        break;
      case 'PAN':
        if (control.value.documentNumber.length !== 10 || !regPan.test(control.value.documentNumber)) {
          control.controls.docError.setValue('Please enter a valid PAN');
        } else {
          control.controls.docError.setValue('');
        }
        break;
      case 'CPN':
        break;
      case 'ADH':
        if (control.value.documentNumber.length !== 12 || isNaN(control.value.documentNumber)) {
          control.controls.docError.setValue('Please enter a valid Adhar number');
        } else {
          control.controls.docError.setValue('');
        }
        break;
      case 'VOT':
        if (control.value.documentNumber.length !== 10 || !regVotar.test(control.value.documentNumber)) {
          control.controls.docError.setValue('Please enter a valid Votar ID');
        } else {
          control.controls.docError.setValue('');
        }
        break;
      case 'MRC':
        break;
      case 'TAN':
        if (control.value.documentNumber.length !== 10) {
          control.controls.docError.setValue('TAN should be of valid 10 characters');
        } else {
          control.controls.docError.setValue('');
        }
        break;
      default:
        break;
    }
    if (control.value.documentNumber !== "" && control.value.fileType !== "" && control.value.docError === "") {
      control.controls.fileSource.enable();
      control.controls.toSave.setValue(true);
      control.controls.isDisableControl.setValue(false);
    } else {
      control.controls.fileSource.disable();
    }
  }

  onFocusOutEvent(index: any) {
    let controlArray = <any>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    if (control.value.documentNumber !== "") {
      this.isValidDocument(control)
    } else {
      control.controls.docError.setValue('');
    }
  }

  filterDocList() {
    this.filteredDocTypes = []
    this.profileDcUploadParam.value.documentList.forEach((docList: any) => {
      if (docList.fileType !== 'PDC' && docList.fileType !== '') {
        this.filteredDocTypes.push(docList.fileType)
      }
    })
  }

  isSelectedDocType(departmentType: string, selectedDepartmentType: string) {
    const a = this.filteredDocTypes.find((docType: any) => docType === departmentType)
    if (a) {
      if (a === selectedDepartmentType) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  isAddDocAvailable() {
    if (this.filteredDocTypes.length < this.documentTypeDetailsList.length) {
      return true;
    }
    return false;
  }

  isdeleted(index: any) {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    if (control.controls.actionIndicator.value === "DEL") {
      return false;
    }
    return true;
  }

  isFileError(index: any) {
    let controlArray = <FormArray>this.profileDcUploadParam.controls["documentList"];
    const control: any = controlArray.controls[index];
    return control.controls.fileError.value;
  }

}
