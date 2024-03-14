import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@services/common.service';
import { UserSetupService } from '@services/user-setup.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bulk-user-setup',
  templateUrl: './bulk-user-setup.component.html',
  styleUrls: ['./bulk-user-setup.component.css']
})
export class BulkUserSetupComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  userSetupForm: any = {};
  totalUserListCount: number = 0;
  currentView: number = 9;
  selectView:number = 3;
  viewItem:any = {
    startIndex: 0,
    lastIndex: 0
  };
  currentPage:number;
  paginationList:Array<number> = [];
  pageLastIndex: number = 0;
  constructor(
    private userSetupService: UserSetupService,
    private toastr: ToastrService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.totalUserListCount = this.userSetupForm.bulkUserSetupdetailsList.length;
    this.pageChange(1);
    this.paginationList = [];
    for (let index = 0; index < this.totalUserListCount / this.currentView; index++) {
      this.paginationList.push(index + 1);
    }
  }

  saveBulkUserSetupdetails= async()=>{
      const reqData: any = {
        apiRequest: {...this.userSetupForm}
      }
      await this.userSetupService.saveBulkUserSetupdetails(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success(`User setup completed successfully`);
            this.close.emit(false)
          } else {
            res.anamnesisErrorList.anErrorList.forEach((err:any,i:number)=>{
              this.userSetupForm.bulkUserSetupdetailsList[i].errMsg = err.errorMessage
            })
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error('User setup could not complet deu to some error');
          }
        })
  }

  closePopup(){
    this.userSetupForm.bulkUserSetupdetailsList.forEach((v:any,i:number)=>{
      this.userSetupForm.bulkUserSetupdetailsList[i].errMsg = '';
    })
    this.close.emit(this.userSetupForm)
  }

  pageChange(page: number){
    this.currentPage = page;
    this.viewItem.startIndex = 0+(this.currentView*(this.currentPage-1))+1;
    this.viewItem.lastIndex = (this.currentView+(this.currentView*(this.currentPage-1)));
  }

  currentViewChange(data: any){
    const preCurrentPage = this.currentPage;
    const firstCaseIndexOfPage = this.currentView*(this.currentPage-1);
    const preCurrentView = this.currentView ;
    this.currentView = data*3;
    this.paginationList = [];
    for (let index = 0; index < this.totalUserListCount/this.currentView; index++) {
      this.paginationList.push(index+1);
    }
      const tempCurrentPage = Math.round(((preCurrentPage-1)*preCurrentView+1)/this.currentView);
      if(tempCurrentPage>0){
        this.currentPage = tempCurrentPage
      }else{
        this.currentPage = tempCurrentPage+1;
      }

    this.pageChange(this.currentPage)
  }

  isPageIndexVisible(currentPage: any, pageIndex: any) {
    if (currentPage + 2 >= pageIndex && currentPage - 3 <= pageIndex) {
      this.pageLastIndex = pageIndex + 4
      return true
    }
    return false
  }


}
