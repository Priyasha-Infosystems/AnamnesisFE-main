import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BASE_IMAGE_URL } from '@constant/constants';
import { AuthorisedSignatoryAddService } from '@services/authorised-signatory-add.service';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-authorised-signatory-addition',
  templateUrl: './authorised-signatory-addition.component.html',
  styleUrls: ['./authorised-signatory-addition.component.css']
})
export class AuthorisedSignatoryAdditionComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger }) matAutoComplete: MatAutocompleteTrigger;
  authorisedSignatoryAdditionForm: FormGroup;
  errorMessage: any = {};
  physicianList: Array<any> = [];
  showPhysicianDetails: boolean = false;
  selectedPhysicianDetails: any;
  oldPhysicianSearchValue: string;
  physicianErrorMsg: string = '';
  searchedPhysician: string;
  documentTypeDetailsList: any = [];
  fileError: string;
  previousAuthorisedSignstoryDocumentList: Array<any> = [];
  filteredDocTypeList: Array<any> = [];
  requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private fileUploadService: FileUploadService,
    private authorisedSignatoryAddService: AuthorisedSignatoryAddService,
  ) {
    this.intializingMessage()
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.intializingMedicineSeectionFormGroup();
    this.getUploadDocumentType();
    this.authorisedSignatoryAdditionForm.get('physicianName')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        if (response.length && this.authorisedSignatoryAdditionForm.get('physicianSearch')?.value) {
          this.searchPhysician(response)
        } else {
          // this.physicianList = [];
        }

      })
    this.authorisedSignatoryAdditionForm.get('documentList')?.valueChanges.subscribe(res => {
      this.filterDocTypeList()
    })
  }

  isSelectedPreviousDocType(documentType: string, selectedDocumentType: string) {
    const a = this.filteredDocTypeList.find(res => res === documentType)
    if (a) {
      if (a === selectedDocumentType) {
        return false
      } else {
        if (documentType === 'PDC') {
          return false
        } else {
          return true
        }
      }
    } else {
      return false
    }
  }

  filterDocTypeList() {
    this.filteredDocTypeList = [];
    this.previousAuthorisedSignstoryDocumentList.forEach((val: any) => {
      if (val.fileType) {
        this.filteredDocTypeList.push(val.fileType)
      }
    })
    this.authorisedSignatoryAdditionForm.value.documentList.forEach((document: any) => {
      this.filteredDocTypeList.push(document.fileType)
    })
  }

  saveAuthorisedSignarory = async () => {
    const data = this.authorisedSignatoryAdditionForm.getRawValue();
    let isContinue = true;
    const deuDocumentTypeList: any = [];
    this.documentTypeDetailsList.forEach((val: any) => {
      const foundDocument = this.previousAuthorisedSignstoryDocumentList.find((res: any) => res.fileType === val.documentType);
      if (!foundDocument && val.documentType !== 'SIG') {
        deuDocumentTypeList.push(val);
      }
    })

    if (deuDocumentTypeList.length < 1) {
      isContinue = true
    } else {
      this.fileError = 'Please upload all mandatory documents';
      setTimeout(() => this.fileError = '', 1500);
      this.formService.markFormGroupTouched(this.authorisedSignatoryAdditionForm);
      const isValid = this.authorisedSignatoryAdditionForm.valid;
      if (isValid) {
        isContinue = true
      } else {
        isContinue = false
      }
    }
    if (isContinue) {
      const reqData: any = {
        apiRequest: {
          userID: data.physicianUserID,
          fileDetailsList: [],
        },
      }
      data.documentList.forEach((document: any) => {
        if (document.dataSet) {
          reqData.apiRequest.fileDetailsList.push(document.response)
        }
      })
      await this.authorisedSignatoryAddService.saveAuthorisedSignatory(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            window.scrollTo(0, 0);
            this.toastr.success("Authorised Signatory Addition request submitted successfully")
            this.authorisedSignatoryAdditionFormReset();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Prescriptions couldn't fetch due some error");
          }
        })
    }
  }

  onChangeDocNoAndDocType(index: number) {
    var control = this.documentList().at(index);
    if (control.value.documentNumber.length && control.value.fileType.length) {
      control.get('fileSource')?.enable()
    } else {
      this.removeItem(index);
      control.get('fileSource')?.disable()
    }
  }

  getUploadDocumentType = async () => {
    await this.authorisedSignatoryAddService.GetUploadDocumentType()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.documentTypeDetailsList = res.apiResponse.documentTypeDetailsList;

        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Prescriptions couldn't fetch due some error");
        }
      })
  }

  selectPhysician(physician: any) {
    this.showPhysicianDetails = true;
    this.selectedPhysicianDetails = physician;
    this.authorisedSignatoryAdditionForm.get('physicianName')?.setValue(physician.physicianName);
    this.authorisedSignatoryAdditionForm.get('physicianSearch')?.setValue(false);
    this.authorisedSignatoryAdditionForm.get('physicianName')?.disable();
  }
  unSelectPhysician() {
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.authorisedSignatoryAdditionForm.get('physicianName')?.setValue(this.oldPhysicianSearchValue);
    this.authorisedSignatoryAdditionForm.get('physicianName')?.enable();
  }

  selectPhysicianForForm = async () => {
    const reqData: any = {
      apiRequest: {
        signatoryUserCode: this.selectedPhysicianDetails.physicianUserCode,
        signatoryUserID: this.selectedPhysicianDetails.physicianUserID,
        workRequestID: '',
      },
    }
    await this.authorisedSignatoryAddService.getAuthorisedSignatoryDetails(reqData, 'ASAD')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.previousAuthorisedSignstoryDocumentList = res.apiResponse.fileDetailsList ? res.apiResponse.fileDetailsList : [];
          this.filterDocTypeList();
          this.authorisedSignatoryAdditionForm.get('physicianUserID')?.setValue(res.apiResponse.signatoryUserID);
          this.authorisedSignatoryAdditionForm.get('physicianUserCode')?.setValue(res.apiResponse.signatoryUserCode);
          this.authorisedSignatoryAdditionForm.get('physicianQualification')?.setValue(res.apiResponse.physicianQualification);
          this.authorisedSignatoryAdditionForm.get('physicianSpecialisation')?.setValue(res.apiResponse.physicianSpecialisation);
          this.authorisedSignatoryAdditionForm.get('registrationNumber')?.setValue(res.apiResponse.physicianRegistrationNumber);
          this.authorisedSignatoryAdditionForm.get('registrationAuthority')?.setValue(res.apiResponse.physicianRegistrationAuthority);
          this.authorisedSignatoryAdditionForm.get('physicianName')?.setValue(res.apiResponse.physicianName);
          this.authorisedSignatoryAdditionForm.get('physicianName')?.disable();
          this.authorisedSignatoryAdditionForm.get('physicianSearch')?.setValue(false);
          this.showPhysicianDetails = false;
          this.selectedPhysicianDetails = {};
          this.physicianList = [];
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        this.showPhysicianDetails = false;
        this.selectedPhysicianDetails = {};
        this.physicianList = [];
        if(err.status !== 401){
        this.toastr.error('Authorised signatory details could not fetch deu to seme error')
        }
      })
  }

  searchPhysician = async (data: any) => {
    this.searchedPhysician = data;
    if (data.length > 2) {
      this.oldPhysicianSearchValue = data;

      const reqData: any = {
        apiRequest: {
          searchKeyword: data,
          commercialID: ''
        },
      }
      await this.authorisedSignatoryAddService.searchPhysician(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res) && res.apiResponse.physicianCount > 0) {
            this.physicianList = res.apiResponse.physicianInformationList;
            this.matAutoComplete.openPanel();
          } else {
            this.physicianList = [];
          }
        })
        .catch((err: any) => {
          this.physicianList = [];
        })
    } else {
      this.physicianErrorMsg = 'The minemum allowed number of characters is 3 for physician search';
      setTimeout(() => this.physicianErrorMsg = '', 500);
    }
  }

  authorisedSignatoryAdditionFormReset() {
    this.physicianList = [];
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.authorisedSignatoryAdditionForm.reset();
    this.documentList().clear();
    this.documentList().push(this.addDocumentGroup());
    this.authorisedSignatoryAdditionForm.get('physicianSearch')?.setValue(true);
    this.authorisedSignatoryAdditionForm.get('physicianName')?.setValue('');
    this.authorisedSignatoryAdditionForm.get('physicianName')?.enable();
    this.authorisedSignatoryAdditionForm.get('registrationAuthority')?.enable();
    this.authorisedSignatoryAdditionForm.get('registrationNumber')?.enable();
    this.authorisedSignatoryAdditionForm.get('physicianSpecialisation')?.enable();
    this.authorisedSignatoryAdditionForm.get('physicianQualification')?.enable();
  }

  async uploadDoc(data: any, control: any, target: any, index: any) {
    let progress: number = 0;
    const formData = new FormData();
    const param = {
      DocumentType: control.value.fileType,
      DocumentNumber: control.value.documentNumber || "",
      UserCode: this.requestKeyDetails.userCode || "",
      UserID: this.requestKeyDetails.userID || "",
      CustomerUserCode: this.authorisedSignatoryAdditionForm.value.physicianUserCode || "",
      APIKey: ""
    }
    formData.append('File', data);
    (await
      this.fileUploadService.uploadDoc(
        formData, control.value.fileType, control.value.documentNumber, param
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

    let controlArray = <FormArray>this.authorisedSignatoryAdditionForm.controls["documentList"];
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

  addAnotherDocument() {
    this.documentList().push(this.addDocumentGroup())
  }

  deleteDocument(index: number) {
    this.documentList().removeAt(index);
    if (this.documentList().length < 1) {
      this.addAnotherDocument()
    }
  }

  private addDocumentGroup() {
    return this.fb.group({
      fileType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      fileSource: [{ value: '', disabled: true }],
      document: [''],
      dataSet: [false],
      toSave: [false],
      fileName: [''],
      fileID: ['', [Validators.required]],
      progress: [''],
      response: [''],
      error: [''],
      fileError: ['']
    })
  }
  documentList() {
    return this.authorisedSignatoryAdditionForm.get('documentList') as FormArray
  }
  getDocumentController(index: any, controlName: any) {
    let controlArray = <any>this.authorisedSignatoryAdditionForm.controls["documentList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control;
  }

  getDocumentControllerValue(index: any, controlName: any) {
    let controlArray = <any>this.authorisedSignatoryAdditionForm.controls["documentList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control.value;
  }

  isDocumentSaved(index: any) {
    let controlArray = <any>this.authorisedSignatoryAdditionForm.controls["documentList"];
    const control: any = controlArray.controls[index].controls["dataSet"];
    return control.value
  }

  isDisabled(index: any) {
    let controlArray = <any>this.authorisedSignatoryAdditionForm.controls["documentList"];
    const control: any = controlArray.controls[index];
    return control.controls.fileSource.disabled;
  }

  removeItem = (index: any) => {
    let controlArray = <FormArray>this.authorisedSignatoryAdditionForm.controls["documentList"];
    const control: any = controlArray.controls[index];
    control.controls.document.setValue('');
    control.controls.fileSource.setValue('');
    control.controls.dataSet.setValue(false);
    control.controls.toSave.setValue(false);
    control.controls.fileSource.enable();
    control.controls.fileID.setValue('');
  }

  private intializingMedicineSeectionFormGroup() {
    this.authorisedSignatoryAdditionForm = this.fb.group({
      physicianUserID: [''],
      physicianUserCode: ['', [Validators.required]],
      physicianName: [''],
      physicianSearch: [true],
      physicianQualification: [''],
      physicianSpecialisation: [''],
      registrationNumber: [''],
      registrationAuthority: [''],
      documentList: this.fb.array([this.addDocumentGroup()]),
    })
  }

  private intializingMessage() {
    this.errorMessage.authorisedSignatoryForm = {
      fileID: {
        required: 'File is required',
      },
      fileType: {
        required: 'File type is required',
      },
      documentNumber: {
        required: 'Document number is required',
      },
    };
  }
}
