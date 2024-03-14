import { Component, OnInit } from '@angular/core';
import { CaseAssignmentService } from '@services/case-assignment.service';
import { CommonService } from '@services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-assignment',
  templateUrl: './my-assignment.component.html',
  styleUrls: ['./my-assignment.component.css']
})
export class MyAssignmentComponent implements OnInit {
  activeModal: string = '';
  //pagination
  totalCaseListCount: number = 0;
  currentView: number = 9;
  selectView: number = 3;
  viewItem: any = {
    startIndex: 0,
    lastIndex: 0
  };
  currentPage: number;
  pageLastIndex: number = 0;
  caseList: Array<any> = [];
  paginationList: Array<number> = [];
  passData: any;
  allCaseList: Array<any> = [];
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
  //pagination
  constructor(
    private toastr: ToastrService,
    private commonService: CommonService,
    private caseAssignmentService: CaseAssignmentService
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getCaseList()
  }

  getCaseList = async () => {
    this.caseList = [];
    this.allCaseList = [];
    this.categoryList =  [
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
    await this.caseAssignmentService.MyAssignments()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          res.apiResponse.workRequestDetailsList.forEach((val: any, index: number) => {
            const tempCase: any = {
              seqNo: index + 1,
              caseCode: val.workRequestID,
              wrStatus: val.wrStatus,
              wrAssignedTo: val.wrAssignedTo,
              wrCustomerID: val.wrCustomerID,
              wrDescription: val.wrDescription,
              wrOpenBy: val.wrOpenBy,
              wrResolutionNotes: val.wrResolutionNotes,
              wrReviewedBy: val.wrReviewedBy,
              wrSatisfactionScore: val.wrSatisfactionScore,
              summary: val.wrSummary,
              type: val.workRequestType,
              OpenDate: val.wrOpenTimestamp,
              targetCompletionDate: new Date(val.wrTargetCompletionDate),
              wrAttachmentDetailsList: val.wrAttachmentDetailsList,
              isSelected: false,
              isDisabled: false,
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

  //pagination start --->
  currentViewChange(data: any) {
    const preCurrentPage = this.currentPage;
    const firstCaseIndexOfPage = this.currentView * (this.currentPage - 1);
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

  pageChange(page: number) {
    this.currentPage = page;
    this.viewItem.startIndex = 0 + (this.currentView * (this.currentPage - 1)) + 1;
    this.viewItem.lastIndex = (this.currentView + (this.currentView * (this.currentPage - 1)));
  }
  //<---  pagination end

  openCaseLog(data: any) {
    this.activeModal = 'CASE_LOG';
    this.passData = data;
  }

  openModal = (data: any) => {
    this.activeModal = data.type;
    this.passData = data;
  }
  closeModal = (data: any) => {
    this.activeModal = '';
    this.passData = {};
    if (data) {
      this.ngOnInit();
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
