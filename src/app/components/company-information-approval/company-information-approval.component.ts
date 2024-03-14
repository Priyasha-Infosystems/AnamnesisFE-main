import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AUTHORISE_SIGNATORY_ERROR_MSG, BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { GetFile } from '@pipes/all-pipes/all-pipes';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { CompanyInformationApprovalService } from '@services/company-information-approval.service';
import { DocumentApprovalService } from '@services/document-approval.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-company-information-approval',
  templateUrl: './company-information-approval.component.html',
  styleUrls: ['./company-information-approval.component.css']
})
export class CompanyInformationApprovalComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  errorMessage: any;
  companyInformation: any = {};
  showFile: boolean = false;
  wrAttachmentDetails: any;
  allFileStatusCheanedIndicatorErrMSG: string;
  rejectionReason: string = '';
  rejectionReasonError: string;
  requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  somthingWentWrong: boolean = false;
  caseLogdetails:any;
  constructor(
    private toastr: ToastrService,
    private commonService: CommonService,
    private companyInformationApprovalService: CompanyInformationApprovalService,
    private documentApprovalService: DocumentApprovalService,
    private caseLogService: CaseLogService,
    private filePipe: GetFile
  ) {
    this.intializingMessage()
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getCompanyInformation(); 
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
    await this.companyInformationApprovalService.getCompanyInformation(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.companyInformation = res.apiResponse;
          this.companyInformation.fileDetailsList.forEach((v: any, i: number) => {
            this.companyInformation.fileDetailsList[i].errorMsg = '';
          })
          this.companyInformation.address = `${this.companyInformation.addressLine}, ${this.companyInformation.landmark ? this.companyInformation.landmark + ',' : ''} ${this.companyInformation.city}, ${this.companyInformation.stateName}, ${this.companyInformation.country}, ${this.companyInformation.pincode}`
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
        this.toastr.error("Company information couldn't fetch due some error");
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
    await this.documentApprovalService.attachmenStatusChange(reqData, 'CINA')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.companyInformation.fileDetailsList[index].documentStatus = status === 'A' ? 0 : 3;
          this.companyInformation.fileDetailsList[index].errorMsg = '';
          this.toastr.success("Attachmen status changed");
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Attachment status couldn't change due some error");
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
        this.companyInformation.fileDetailsList.forEach((val: any, i: number) => {
          if (val.documentStatus === 2 || val.documentStatus === 3) {
            this.companyInformation.fileDetailsList[i].errorMsg = val.documentStatus === 2 ? this.errorMessage.allFileStatusCheanedIndicator : this.errorMessage.allFileStatusRejectIndicator
            if (val.documentStatus === 3) {
              setTimeout(() => this.companyInformation.fileDetailsList[i].errorMsg = '', 1500);
            }
            allFileStatusCheanedIndicator = false;
          }
        });
        if (allFileStatusCheanedIndicator) {
          contineu = true;
        } else {
          contineu = false;
        }
      } else {
        contineu = true;
      }
    }
    if (contineu) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          workRequestType: 'CIA',
          customerID: this.companyInformation.userID,
          approvalRejectInd: status,
          rejectReason: status === 'R' ? this.rejectionReason : '',
        }
      };
      await this.companyInformationApprovalService.authorisedSignatoryApproval(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success("Status changed successfully");
            this.closePopUp(true)
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

  authorisedSignatoryRejection = async () => {
    if (this.rejectionReason.length) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          caseLogTimestamp: new Date().getTime(),
          rejectReason: this.rejectionReason
        }
      };
      await this.companyInformationApprovalService.authorisedSignatoryRejection(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.closePopUp(true)
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
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
    const url =  this.filePipe.transform(wrAttachmentDetails.fileName,wrAttachmentDetails.fileType) ;
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
      allFileStatusCheanedIndicator: AUTHORISE_SIGNATORY_ERROR_MSG.ALL_DOCUMENT_STATUS_CHANGE_INDICATOR_ERR_MSG
    }
  }
}
