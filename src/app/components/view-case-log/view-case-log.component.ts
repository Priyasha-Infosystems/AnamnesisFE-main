import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CASE_LOG_ERROR_MSG } from '@constant/constants';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-case-log',
  templateUrl: './view-case-log.component.html',
  styleUrls: ['./view-case-log.component.css']
})
export class ViewCaseLogComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  caseLogForm: FormGroup;
  errorMessage: any = {};
  comentsError: string
  caseLogInformationList: Array<any> = [];
  requestKeyDetails: any;
  caseLogDescriptionDisllayNo: number = 10;
  public somthingWentWrong: boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private caseLogService: CaseLogService,
  ) {
    this.intializingMessage()
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getCaseLog()
    this.caseLogForm = this.fb.group({
      comments: ['']
    })
  }

  /**
   * @author Baidurja
   * @todo api strcture
   */
  commentsSend = async () => {
    if (this.caseLogForm.get('comments')?.value.length) {
      const date: Date = new Date();
      const reqData: any = {
        apiRequest: {
          caseLogText: this.caseLogForm.get('comments')?.value,
          caseLogUserName: '',
          caseLogTimestamp: new Date().getTime(),
          caseLogUserID: this.requestKeyDetails.userID,
          sequenceNo: 0,
          workRequestID: this.WorkRequestDetails
        }
      };
      await this.caseLogService.Coment(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            if (res.apiResponse.transactionResult === "Success") {
              this.caseLogForm.reset();
              this.getCaseLog();
            }
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Coment couldn't send due some error");
          this.getCaseLog();
          }
        })
    } else {
      this.comentsError = this.errorMessage.comments.required;
      setTimeout(() => { this.comentsError = '' }, 1500);
      this.getCaseLog();
    }
  }

  getCaseLog = async () => {
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails
      }
    };
    await this.caseLogService.GetCaseLOG(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (res.apiResponse.caseLogCount) {
            this.caseLogInformationList = res.apiResponse.caseLogInformationList;
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
        this.somthingWentWrong = true;
        this.toastr.error("Case logs couldn't fetch due some error");
        }
      })
  }

  closeCaseLog() {
    this.close.emit();
  }

  getTimeStamp(time: number) {
    return new Date(time);
  }

  private intializingMessage() {
    this.errorMessage = {
      comments: {
        required: CASE_LOG_ERROR_MSG.ERR_MSG_REQUIERD_comments
      }
    }
  }
}
