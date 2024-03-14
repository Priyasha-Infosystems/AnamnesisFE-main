import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_REQ, LOCAL_STORAGE } from '@constant/constants';
import { AuthorizePrescriptionService } from '@services/authorizePrescription.service';
import { CommonService } from '@services/common.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-authorize-prescription',
  templateUrl: './authorize-prescription.component.html',
  styleUrls: ['./authorize-prescription.component.css']
})
export class AuthorizePrescriptionComponent implements OnInit {
  defaultPrescriptionFiles: any = [];
  defaultLabReportsFiles: any = [];
  prescriptionFiles: any = [];
  labReportsFiles: any = [];
  physicianList: any = [];
  filteredOptions: any;
  formGroup: FormGroup;
  searchedPhysician: any;
  showPhysicianDetails: boolean = false;
  selectedPhysicianDetails: any;
  showAuthorizedPhysician: boolean = false;
  authorizedList: any = [];
  defaultAuthorizedList: any = [];
  showPrescription: boolean = false;
  showPrescriptionID: string;
  requestKeyDetails: any;
  imageBaseUrlForWorkReq: string = BASE_IMAGE_URL_FOR_REQ;
  imageBaseUrl: string = BASE_IMAGE_URL;
  userCode: any = "";
  userId: any = "";
  authRecordLists: any = [];

  constructor(
    public authorizePrescriptionService: AuthorizePrescriptionService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
  ) {
    this.setUserId();
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.initForm();
  }

  async setUserId() {
    this.userCode = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "";
    this.userId = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    this.getPrescriptionFiles();
    this.getLabReports();
  }

  prescriptionclick(prescriptionID: string) {
    this.showPrescription = true;
    this.showPrescriptionID = prescriptionID;
  }

  prescriptionClose() {
    this.showPrescription = false;
    this.showPrescriptionID = '';
  }

  async getPrescriptionFiles() {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        listStartDate: "",
        listEndDate: "",
      }
    };
    await this.authorizePrescriptionService.getPrescriptionList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (res.apiResponse.prescriptionCount > 0) {
            this.defaultPrescriptionFiles = [...res.apiResponse.prescriptionSummaryList];
            this.prescriptionFiles = res.apiResponse.prescriptionSummaryList;
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  async getLabReports() {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        listStartDate: "",
        listEndDate: "",
      }
    };
    await this.authorizePrescriptionService.getLabTestReportList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (res.apiResponse.laboratoryTestReportCount > 0) {
            this.defaultLabReportsFiles = [...res.apiResponse.laboratoryTestReportSummaryList];
            this.labReportsFiles = res.apiResponse.laboratoryTestReportSummaryList;
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  initForm() {
    this.formGroup = this.fb.group({
      'physician': ['']
    })
    this.formGroup.get('physician')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searchedPhysician = response;
        if (response && response.length) {
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.authorizePrescriptionService.searchPhysician(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.physicianCount > 0) {
                this.physicianList = res.apiResponse.physicianInformationList;
              } else {
                this.physicianList = [];
              }
            })
            .catch((err: any) => {
              this.physicianList = [];
            })
        } else {
          this.physicianList = [];
        }
      })
  }

  removedKey(arr: any) {
    arr.forEach((ar: any) => {
      delete ar.actionIndicator;
      delete ar.isPrescription;
      delete ar.dataSet;
    });
    return arr;
  }

  tempSelectPhysician(physician: any) {
    this.showPhysicianDetails = true;
    this.selectedPhysicianDetails = physician;
    this.showAuthorizedPhysician = false;
    this.authorizedList = [];
    this.prescriptionFiles = this.removedKey([...this.defaultPrescriptionFiles]);
    this.labReportsFiles = this.removedKey([...this.defaultLabReportsFiles]);
  }

  selectPhysician() {
    this.showPhysicianDetails = false;
    this.showAuthorizedPhysician = true;
    this.authorizedList = [];
    this.prescriptionFiles = this.removedKey([...this.defaultPrescriptionFiles]);
    this.labReportsFiles = this.removedKey([...this.defaultLabReportsFiles]);
    this.fetchedAuthorizedList();
  }

  cancelPhysician() {
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.showAuthorizedPhysician = false;
    this.authorizedList = [];
    this.prescriptionFiles = this.removedKey([...this.defaultPrescriptionFiles]);
    this.labReportsFiles = this.removedKey([...this.defaultLabReportsFiles]);
  }

  async fetchedAuthorizedList() {
    this.authRecordLists = [];
    this.authorizedList = [];
    const reqData: any = {
      apiRequest: {
        physicianCode: this.selectedPhysicianDetails.physicianUserCode ?? '',
      },
    }
    await this.authorizePrescriptionService.fetchedAuthorizedList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res) && res.apiResponse.recordCount > 0) {
          this.showAuthorizedPhysician = true;
          this.showPhysicianDetails = false;
          const authRes = [...res.apiResponse.authorisationRecordList];
          authRes.forEach((auth: any) => {
            this.authRecordLists.push(auth.recordID)
          })
          const combinedDocs = [...this.prescriptionFiles.concat(this.labReportsFiles)];
          this.authRecordLists.forEach((recList: any) => {
            const authorizedLabDoc = combinedDocs.find((doc: any) => doc.laboratoryTestReportID === recList);
            if (authorizedLabDoc) {
              const authorizedLabDocIndex = this.labReportsFiles.findIndex((lab: any) => lab.laboratoryTestReportID === recList);
              if (authorizedLabDocIndex > -1) {
                this.labReportsFiles.splice(authorizedLabDocIndex, 1);
              }
              authorizedLabDoc.dataSet = true
              this.authorizedList.push(authorizedLabDoc)
            }
            const authorizedPresDoc = combinedDocs.find((doc: any) => doc.prescriptionID === recList);
            if (authorizedPresDoc) {
              const authorizedPrescDocIndex = this.prescriptionFiles.findIndex((lab: any) => lab.prescriptionID === recList);
              if (authorizedPrescDocIndex > -1) {
                this.prescriptionFiles.splice(authorizedPrescDocIndex, 1);
              }
              authorizedPresDoc.isPrescription = true;
              authorizedPresDoc.dataSet = true
              this.authorizedList.push(authorizedPresDoc)
            }
          })
          this.defaultAuthorizedList = [...this.authorizedList];
        } else {
          this.authorizedList = [];
        }
      })
      .catch((err: any) => {
        this.authorizedList = [];
      })
  }

  addPrescToAuthorizedList(data: any, index: any) {
    data.isPrescription = true;
    data.actionIndicator = "ADD";
    this.authorizedList.push(data);
    this.prescriptionFiles.splice(index, 1);
  }

  openPrescriptionFile(data: any) {
    this.showPrescription = true;
    this.showPrescriptionID = data.prescriptionID
  }

  addLabrToAuthorizedList(data: any, index: any) {
    data.actionIndicator = "ADD";
    this.authorizedList.push(data);
    this.labReportsFiles.splice(index, 1);
  }

  removeAuthorizedList(data: any, index: any) {
    if (data.dataSet) {
      data.actionIndicator = "DEL";
    } else {
      this.authorizedList.splice(index, 1);
    }
    if (data.isPrescription) {
      this.prescriptionFiles.push(data);
    } else {
      this.labReportsFiles.push(data);
    }
  }

  getAuthorizedObj() {
    const reqObj: any = [];
    const changedAuthList = this.authorizedList.filter((authl: any) => authl.actionIndicator === 'ADD' || authl.actionIndicator === 'DEL')
    changedAuthList.forEach((authList: any, index: any) => {
      const req = {
        recordSeqNo: index,
        recordID: authList.isPrescription ? authList.prescriptionID : authList.laboratoryTestReportID,
        userCode: this.userCode,
        physicianCode: this.selectedPhysicianDetails.physicianUserCode,
        documentTypeCode: '',
        authorisationCode: 'AUTHR',
        actionIndicator: authList.actionIndicator,
        transactionResult: ''
      }
      reqObj.push(req)
    })
    const apiReq = {
      authorisationRecordList: reqObj,
      recordCount: reqObj.length
    }
    return apiReq;
  }

  async submitAuthorization() {
    const reqData: any = {
      apiRequest: this.getAuthorizedObj(),
    }
    await this.authorizePrescriptionService.authorisePrescription(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res) && res.apiResponse.recordCount > 0) {
          this.toastr.success('Authorised successfully')
          this.selectPhysician();
        }else{
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

}
