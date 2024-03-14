import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AUTHORISE_SIGNATORY_ERROR_MSG, BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { GetFile } from '@pipes/all-pipes/all-pipes';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { CompanyInformationApprovalService } from '@services/company-information-approval.service';
import { DocumentApprovalService } from '@services/document-approval.service';
import { PersonalInformationApprovalService } from '@services/personal-information-approval.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-personal-information-approval',
  templateUrl: './personal-information-approval.component.html',
  styleUrls: ['./personal-information-approval.component.css']
})
export class PersonalInformationApprovalComponent implements OnInit {

  constructor(
    private toastr: ToastrService,
    private commonService: CommonService,
    private documentApprovalService: DocumentApprovalService,
    private personalInformationApprovalService: PersonalInformationApprovalService,
    private caseLogService: CaseLogService,
    private filePipe: GetFile
  ) {
    this.intializingMessage()
  }
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  personalInformation: any = {};
  showFile: boolean = false;
  wrAttachmentDetails: any;
  rejectionReason: string = '';
  rejectionReasonError: string;
  errorMessage: any;
  allFileStatusCheanedIndicatorErrMSG: string;
  requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  public somthingWentWrong: boolean = false;
  caseLogdetails:any;
  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getCaseLog();
    this.getPersonalInInformation()
    
  }

  dateFormat(data:any){
    return new Date(data)
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
          this.caseLogdetails = res.apiResponse
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

  getPersonalInInformation = async () => {
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode,
      }
    };
    await this.personalInformationApprovalService.getPersonalInformation(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.personalInformation = res.apiResponse;
          this.personalInformation.fileDetailsList.forEach((v: any, i: number) => {
            this.personalInformation.fileDetailsList[i].errorMsg = '';
          })
          if (this.personalInformation.middleName.length) {
            this.personalInformation.fullName = `${this.personalInformation.firstName} ${this.personalInformation.middleName} ${this.personalInformation.lastName}`
          } else {
            this.personalInformation.fullName = `${this.personalInformation.firstName} ${this.personalInformation.lastName}`
          }
          this.personalInformation.dateOfBirth = new Date(this.personalInformation.dateOfBirth)
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
          this.somthingWentWrong = true;
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.somthingWentWrong = true;
        this.toastr.error("Personal information couldn't fetch due some error");
        }
      })
  }

  attachmenStatusChange = async (wrAttachmentDetails: any, status: string, index: number, customerUserID: string) => {
    const reqData: any = {
      apiRequest: {
        customerID: customerUserID,
        fileDetails: wrAttachmentDetails,
        approvalCode: status,
        transactionResult: ''
      }
    };
    await this.documentApprovalService.attachmenStatusChange(reqData, 'PINA')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.personalInformation.fileDetailsList[index].documentStatus = status === 'A' ? 0 : 3;
          this.personalInformation.fileDetailsList[index].errorMsg = '';
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Attachmen status couldn't change due some error");
        }
      })
  }

  authorisedSignatoryApproval = async (status: string) => {
    let contineu = true;
    if (status === 'R') {
      if (this.rejectionReason.length) {
        contineu = true;
      } else {
        contineu = false;
        this.rejectionReasonError = this.errorMessage.rejectionReason.required;
        setTimeout(() => this.rejectionReasonError = '', 1500);
      }
    }
    if (contineu) {
      if (status === 'A') {
        let allFileStatusCheanedIndicator = true;
        this.personalInformation.fileDetailsList.forEach((val: any, i: number) => {
          if (val.documentStatus === 2 || val.documentStatus === 3) {
            this.personalInformation.fileDetailsList[i].errorMsg = val.documentStatus === 2 ? this.errorMessage.allFileStatusCheanedIndicator : this.errorMessage.allFileStatusRejectIndicator
            if (val.documentStatus === 3) {
              setTimeout(() => this.personalInformation.fileDetailsList[i].errorMsg = '', 1500);
            }
            allFileStatusCheanedIndicator = false;
          }
        });
        if (allFileStatusCheanedIndicator) {
          contineu = true
        } else {
          contineu = false
        }
      } else {
        contineu = true;
      }
    }
    if (contineu) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          workRequestType: 'PIA',
          customerID: this.personalInformation.userID,
          approvalRejectInd: status,
          rejectReason: status === 'R' ? this.rejectionReason : '',
        }
      };
      await this.personalInformationApprovalService.authorisedSignatoryApproval(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.closePopUp(true)
          } else {
            if (res.anamnesisErrorList.dbModificationInd === 'Y') {
              this.toastr.error('Please try again');
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            }
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Authorised signatory couldn't Approve due some error");
          }
        })
    }
  }

  authorisedSignatoryRejection = async () => {
    if (this.rejectionReason.length) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          caseLogTimestamp: new Date().getTime(),
          rejectReason: this.rejectionReason
        }
      };
      await this.personalInformationApprovalService.authorisedSignatoryRejection(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.closePopUp(true)
          } else {
            if (res.anamnesisErrorList.dbModificationInd === 'Y') {
              this.toastr.error('Please try again');
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            }
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Authorised signatory couldn't Reject due some error");
          }
        })
    } else {
      this.rejectionReasonError = this.errorMessage.rejectionReason.required;
      setTimeout(() => this.rejectionReasonError = '', 1500);
    }
  }

  openFile = (wrAttachmentDetails: any) => {
    // this.wrAttachmentDetails = wrAttachmentDetails;
    // this.showFile = true;
    const url = this.filePipe.transform(wrAttachmentDetails.fileName,wrAttachmentDetails.fileType);
    window.open(url, '_blank','location=yes,height=570,width=520,scrollbars=yes,status=yes');
  }

  closeFile = () => {
    this.wrAttachmentDetails = {};
    this.showFile = false;
  }

  closePopUp = (data: boolean) => {
    this.close.emit(data);
  }

  private intializingMessage() {
    this.errorMessage = {
      rejectionReason: {
        required: AUTHORISE_SIGNATORY_ERROR_MSG.ERR_MSG_REQUIERD_rejectionReason
      },
      allFileStatusCheanedIndicator: AUTHORISE_SIGNATORY_ERROR_MSG.ALL_DOCUMENT_STATUS_CHANGE_INDICATOR_ERR_MSG
    }
  }
}
