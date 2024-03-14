import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, CASE_ASSIGNMENT_ERROR_MSG } from '@constant/constants';
import { CaseAssignmentService } from '@services/case-assignment.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-case-assignment',
  templateUrl: './case-assignment.component.html',
  styleUrls: ['./case-assignment.component.css']
})
export class CaseAssignmentComponent implements OnInit {
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL;
  searchFormGroup: FormGroup;
  errorMessage: any = {};
  userList: Array<any> = [];
  selectedUser: any;
  showUserDetails: boolean;
  tempSelectedUserDetails: any;
  selectedUserError: string = '';
  totalCaseListCount: number = 0;
  currentView: number = 9;
  selectView: number = 3;
  viewItem: any = {
    startIndex: 0,
    lastIndex: 0
  };
  currentPage: number;
  allCaseList: Array<any> = [];
  caseList: Array<any> = [];
  paginationList: Array<number> = [];
  categoryList: Array<any> = [
    { Key: 'All', number: 0 },
    { Key: 'PIA', number: 0 },
    { Key: 'CIA', number: 0 },
    { Key: 'PCA', number: 0 },
    { Key: 'ASA', number: 0 },
    { Key: 'LRU', number: 0 },
    { Key: 'PCU', number: 0 },
    { Key: 'CSR', number: 0 },
    { Key: 'LTA', number: 0 },
    { Key: 'PHC', number: 0 },
  ];
  activeFilterKey: string = 'All'
  pageLastIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private caseAssignmentService: CaseAssignmentService
  ) {
    this.intializingMedicineSeectionFormGroups();
    this.intializingMessage();
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getCaseList();
    this.searchFormGroup.get('searchKey')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(res => {
        if (res && res.length > 2 && !this.tempSelectedUserDetails && !this.selectedUser) {
          this.getUserList(res)
        } else {
          this.userList = []
        }
      })
  }

  assignCase = async () => {
    if (this.selectedUser) {
      const reqData: any = {
        apiRequest: {
          caseAssignmentUserID: this.selectedUser.helpdeskUserID,
          newAssignmentCount: 0,
          caseAssignmentRecordList: []
        }
      }
      const selectedCaseList: Array<any> = [];
      this.caseList.forEach((val: any, index: number) => {
        if (val.isSelected) {
          const tempCase = {
            workRequestID: val.caseCode,
            actionIndicator: 'ADD',
            transactionResult: ''
          }
          selectedCaseList.push(tempCase)
        }
      })
      reqData.apiRequest.newAssignmentCount = selectedCaseList.length;
      reqData.apiRequest.caseAssignmentRecordList = selectedCaseList;
      if (selectedCaseList.length) {
        await this.caseAssignmentService.caseAssignment(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.caseList = [];
              this.getCaseList()
              this.toastr.success(`Request assigned to ${this.selectedUser.displayName}`)
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Cases couldn't assign due some error");
            }
          })
      } else {
        this.toastr.error('No selected case for assignment')
      }
    } else {
      this.selectedUserError = this.errorMessage.selectedUser.required;
      setTimeout(() => { this.selectedUserError = '' }, 1500);
    }
  }

  getCaseList = async () => {
    this.caseList = [];
    this.allCaseList = [];
    this.categoryList = [
      { Key: 'All', number: 0 },
      { Key: 'PIA', number: 0 },
      { Key: 'CIA', number: 0 },
      { Key: 'PCA', number: 0 },
      { Key: 'ASA', number: 0 },
      { Key: 'LRU', number: 0 },
      { Key: 'PCU', number: 0 },
      { Key: 'CSR', number: 0 },
      { Key: 'LTA', number: 0 },
      { Key: 'PHC', number: 0 },
    ];
    const reqData = {
    }
    await this.caseAssignmentService.getNewWorkRequestList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.caseList = [];
          res.apiResponse.workRequestDetailsList.forEach((val: any, index: number) => {
            const tempCase: any = {
              seqNo: index + 1,
              caseCode: val.workRequestID,
              summary: val.wrSummary,
              type: val.workRequestType,
              OpenDate: val.wrOpenTimestamp,
              targetCompletionDate: new Date(val.wrTargetCompletionDate),
              wrAttachmentDetailsList: val.wrAttachmentDetailsList,
              wrStatus: val.wrStatus,
              isSelected: false
            }
            const foundIndex = this.categoryList.findIndex((res: any) => res.Key === tempCase.type)
            if (foundIndex > -1) {
              this.categoryList[foundIndex].number = this.categoryList[foundIndex].number + 1;
            }
            this.caseList.push(tempCase);
            this.allCaseList.push(tempCase);
          })
          this.categoryList[0].number = this.allCaseList.length;
          this.totalCaseListCount = this.caseList.length;
          this.activeFilterKey = 'All';
          this.pageChange(1);
          this.paginationList = [];
          for (let index = 0; index < this.totalCaseListCount / this.currentView; index++) {
            this.paginationList.push(index + 1);
          }
        } else {
          this.caseList = [];
          this.allCaseList = [];
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("New work request list couldn't fetch due some error");
        }
      })
  }

  filterCaseList(type: string) {
    this.caseList = [];
    this.activeFilterKey = type;
    if (type === 'All') {
      let seqNo = 0
      this.allCaseList.forEach((res: any) => {
        seqNo = seqNo + 1
        res.seqNo = seqNo;
        this.caseList.push(res)
      })
      this.totalCaseListCount = this.caseList.length;
      this.pageChange(1);
      this.paginationList = [];
      for (let index = 0; index < this.totalCaseListCount / this.currentView; index++) {
        this.paginationList.push(index + 1);
      }
    } else {
      let seqNo = 0
      this.allCaseList.forEach((res: any) => {
        if (res.type === type) {
          seqNo = seqNo + 1
          res.seqNo = seqNo;
          this.caseList.push(res)
        }
      })
      this.totalCaseListCount = this.caseList.length;
      this.pageChange(1);
      this.paginationList = [];
      for (let index = 0; index < this.totalCaseListCount / this.currentView; index++) {
        this.paginationList.push(index + 1);
      }
    }
  }

  optionSelected(user: any) {
    this.tempSelectedUserDetails = user;
  }

  confirmUser() {
    this.selectedUser = this.tempSelectedUserDetails;
    this.tempSelectedUserDetails = undefined;
  }
  cancleUser() {
    this.tempSelectedUserDetails = undefined;
  }

  pageChange(page: number) {
    this.currentPage = page;
    this.viewItem.startIndex = 0 + (this.currentView * (this.currentPage - 1)) + 1;
    this.viewItem.lastIndex = (this.currentView + (this.currentView * (this.currentPage - 1)));
  }

  currentViewChange(data: any) {
    const preCurrentPage = this.currentPage;
    const preCurrentView = this.currentView;
    this.currentView = data * 3;
    this.paginationList = [];
    for (let index = 0; index < this.totalCaseListCount / this.currentView; index++) {
      this.paginationList.push(index + 1);
    }
    const tempCurrentPage = Math.round(((preCurrentPage - 1) * preCurrentView + 1) / this.currentView);
    if (tempCurrentPage > 0) {
      this.currentPage = tempCurrentPage
    } else {
      this.currentPage = tempCurrentPage + 1;
    }
    this.pageChange(this.currentPage)
  }

  selectCase(index: number) {
    this.caseList[index].isSelected = !this.caseList[index].isSelected;
  }

  unSelectUser() {
    this.selectedUser = undefined;
  }

  getUserList = async (searchKey: any) => {
    const reqData = {
      apiRequest: {
        searchKeyword: searchKey
      },
    }
    await this.caseAssignmentService.getUserList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.userList = res.apiResponse.helpdeskUserInformationList
        } else {
          this.userList = []
          // this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        this.userList = []
      })
  }

  private intializingMedicineSeectionFormGroups() {
    this.searchFormGroup = this.fb.group({
      searchKey: ['']
    })
  }

  private intializingMessage() {
    this.errorMessage.searchKey = {
      required: CASE_ASSIGNMENT_ERROR_MSG.ERR_MSG_REQUIERD_searchKey,
      minLength: CASE_ASSIGNMENT_ERROR_MSG.ERR_MSG_MINLENGTH_searchKey
    };
    this.errorMessage.selectedUser = {
      required: CASE_ASSIGNMENT_ERROR_MSG.ERR_MSG_REQUIERD_selectedUser
    }
  }

  isPageIndexVisible(currentPage: any, pageIndex: any) {
    if (currentPage + 2 >= pageIndex && currentPage - 3 <= pageIndex) {
      this.pageLastIndex = pageIndex + 4
      return true
    }
    return false
  }
}
