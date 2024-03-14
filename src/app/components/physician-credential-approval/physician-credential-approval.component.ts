import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AUTHORISE_SIGNATORY_ERROR_MSG, BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { GetFile } from '@pipes/all-pipes/all-pipes';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { CompanyInformationApprovalService } from '@services/company-information-approval.service';
import { DocumentApprovalService } from '@services/document-approval.service';
import { PhysicianCredentialApprovalService } from '@services/physician-credential-approval.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-physician-credential-approval',
  templateUrl: './physician-credential-approval.component.html',
  styleUrls: ['./physician-credential-approval.component.css']
})
export class PhysicianCredentialApprovalComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    private commonService: CommonService,
    private documentApprovalService: DocumentApprovalService,
    private physicianCredentialApprovalService: PhysicianCredentialApprovalService,
    private caseLogService: CaseLogService,
    private filePipe: GetFile
  ) {
    this.intializingMessage()
  }
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  physicianInformation: any = {};
  showFile: boolean = false;
  wrAttachmentDetails: any;
  rejectionReason: string = '';
  rejectionReasonError: string;
  errorMessage: any;
  requestKeyDetails: any;
  allFileStatusCheanedIndicatorErrMSG: string = '';
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  public somthingWentWrong: boolean = false;
  caseLogdetails:any;
  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getCompanyInformation()
    this.getCaseLog();
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

  getCompanyInformation = async () => {
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode,
      }
    };
    await this.physicianCredentialApprovalService.getPhysicianInformation(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.physicianInformation = res.apiResponse;
          this.physicianInformation.fileDetailsList.forEach((v: any, i: number) => {
            this.physicianInformation.fileDetailsList[i].errorMsg = '';
          })
          if (res.apiResponse.middleName) {
            this.physicianInformation.physicianName = `${res.apiResponse.firstName} ${res.apiResponse.middleName} ${res.apiResponse.lastName}`;
          } else {
            this.physicianInformation.physicianName = `${res.apiResponse.firstName} ${res.apiResponse.lastName}`;
          }
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
        this.toastr.error("Physician information couldn't fetch due some error");
        this.somthingWentWrong = true;
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
    await this.documentApprovalService.attachmenStatusChange(reqData, 'PCRA')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.physicianInformation.fileDetailsList[index].documentStatus = status === 'A' ? 0 : 3;
          this.physicianInformation.fileDetailsList[index].errorMsg = '';
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
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
        this.physicianInformation.fileDetailsList.forEach((val: any, i: number) => {
          if (val.documentStatus === 2 || val.documentStatus === 3) {
            this.physicianInformation.fileDetailsList[i].errorMsg = val.documentStatus === 2 ? this.errorMessage.allFileStatusCheanedIndicator : this.errorMessage.allFileStatusRejectIndicator
            if (val.documentStatus === 3) {
              setTimeout(() => this.physicianInformation.fileDetailsList[i].errorMsg = '', 1500);
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
        contineu = true
      }
    }
    if (contineu) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          workRequestType: 'PCA',
          customerID: this.physicianInformation.physicianUserID,
          approvalRejectInd: status,
          rejectReason: status === 'R' ? this.rejectionReason : '',
        }
      };
      await this.physicianCredentialApprovalService.authorisedSignatoryApproval(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success(`Physician credential ${status === 'A' ? 'Approved' : 'Rejected'} successfully`);
            this.closePopUp(true)
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error(`Physician credential couldn't ${status === 'A' ? 'Approve' : 'Reject'} due some error`);
          }
        })
    }
  }

  openFile = (wrAttachmentDetails: any) => {
    // this.wrAttachmentDetails = wrAttachmentDetails;
    // this.showFile = true;
    const url = this.filePipe.transform(wrAttachmentDetails.fileName,wrAttachmentDetails.fileType) ;
    window.open(url, '_blank', 'width=900,height=900,left=200,top=200');
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
      allFileStatusCheanedIndicator: AUTHORISE_SIGNATORY_ERROR_MSG.ALL_DOCUMENT_STATUS_CHANGE_INDICATOR_ERR_MSG,
      allFileStatusRejectIndicator: AUTHORISE_SIGNATORY_ERROR_MSG.ALL_DOCUMENT_STATUS_REJECT_INDICATOR_ERR_MSG
    }
  }
}
