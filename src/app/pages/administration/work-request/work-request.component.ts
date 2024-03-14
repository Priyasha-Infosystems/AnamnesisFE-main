import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseAssignmentService } from '@services/case-assignment.service';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-work-request',
  templateUrl: './work-request.component.html',
  styleUrls: ['./work-request.component.css']
})
export class WorkRequestComponent implements OnInit {
  requestKeyDetails: any
  workRequestList: Array<any> = [];
  currentDate: any = new Date();
  public workReqParam: FormGroup;
  errorMessage: any = {};
  activeModal: string = '';
  passData: any;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fileUploadService: FileUploadService,
    private caseAssignmentService: CaseAssignmentService,
    private utilityService: UtilityService,
    private datePipe: DatePipe,

  ) {
    this.workReqParam = this.fb.group({
      searchStartDate: ['', [Validators.required]],
      searchEndDate: ['', [Validators.required]],
      statusSelection: [0]
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      const currentDate= new Date();
      const sixMonthAgoDate = currentDate.setMonth(currentDate.getMonth() - 6);
      const data ={
        searchEndDate:this.datePipe.transform(new Date(),'yyyy-MM-dd'),
        searchStartDate:this.datePipe.transform(sixMonthAgoDate,'yyyy-MM-dd'),
        statusSelection:0
      }
      this.workReqParam.patchValue(data);
      this.getWrRequestList(data,true)
    });
    this.intializingMessage();
   
  }

  intializingMessage() {
    this.errorMessage.searchStartDate = {
      required: 'Start date is required'
    };
    this.errorMessage.searchEndDate = {
      required: 'End date is required'
    };
  }

  getLocalTime() {
    let now = new Date();
    const localDate = now.toLocaleDateString('en-US');
    const localTime = now.toLocaleTimeString();
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    return timestamp;
  }

  getWrRequestList = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.workReqParam);
    console.log(data)
    if (isValid) {
      const endDateTime = `${data.searchEndDate} ${'23:59:59'}`;
      const startDateTime = `${data.searchStartDate} ${'00:00:01'}`;
      const reqData: any = {
        apiRequest: {
          customerID: this.requestKeyDetails.userID,
          searchStartDate: new Date(startDateTime),
          searchEndDate: new Date(endDateTime),
          statusSelection: data.statusSelection
        }
      }
      await this.caseAssignmentService.getWrrequestStatusList(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.workRequestList = res.apiResponse.workRequestDetailsList
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error(" Work request could not fetch due to some error");
          }
        })
    }
  }

  openModal = (data: any) => {
    if (data.workRequestType !== 'PCU' && data.workRequestType !== 'LRU') {
      this.activeModal = data.workRequestType;
      this.passData = {
        caseCode: data.workRequestID,
        wrStatus: data.wrStatus,
        wrAssignedTo: data.wrAssignedTo,
        wrCustomerID: data.wrCustomerID,
        wrDescription: data.wrDescription,
        wrOpenBy: data.wrOpenBy,
        wrOpenTimestamp: data.wrOpenTimestamp,
        wrResolutionNotes: data.wrResolutionNotes,
        wrReviewedBy: data.wrReviewedBy,
        wrSatisfactionScore: data.wrSatisfactionScore,
        summary: data.wrSummary,
        type: data.workRequestType,
        OpenDate: data.wrOpenTimestamp,
        targetCompletionDate: new Date(data.wrTargetCompletionDate),
        wrAttachmentDetailsList: data.wrAttachmentDetailsList,
        isSelected: false,
        isDisabled: true
      }
    }
  }
  
  closeModal = (data: any) => {
    this.activeModal = '';
    this.passData = {};
  }
}
