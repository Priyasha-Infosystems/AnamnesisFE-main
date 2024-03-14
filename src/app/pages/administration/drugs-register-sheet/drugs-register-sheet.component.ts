import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/exel.service';
import { FormService } from '@services/form.service';
import { InventoryBalanceReportService } from '@services/inventory-balance-report.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-drugs-register-sheet',
  templateUrl: './drugs-register-sheet.component.html',
  styleUrls: ['./drugs-register-sheet.component.css']
})
export class DrugsRegisterSheetComponent implements OnInit {
  refreshForm:FormGroup;
  errMsg:any = {};
  drugRegisterReportList:any = [];
  defaultDrugRegisterReportList:any = [];
  paginationList:any = [];
  viewItem: any = {
    startIndex: 0,
    lastIndex: 0
  };
  currentPage:number;
  pageLastIndex: number = 0;
  currentDate: Date = new Date(new Date().setDate(new Date().getDate()-1))
  dateList:Array<any> = [];
  filterDate: any = ''
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public inventoryBalanceReportService: InventoryBalanceReportService,
    public utilityService: UtilityService,
    public exel: ExcelService,
  ) {
    this.refreshForm = this.fb.group({
      startDate:['',Validators.required],
      endDate:['',Validators.required]
    })
    this.errMsg ={
      startDate:{
        required:'Start date is required'
      },
      endDate:{
        required:'End date is required'
      } 
    }
   }

  ngOnInit(): void {

  }

  downLoadExel(){
    if( this.drugRegisterReportList.length){
      const exelData:any ={
        headerList : ['Medicine Name','Medicine Code','Open Balance','Purchase','Selling','Closing Balance'],
        rowList:[]
      }
      this.drugRegisterReportList.forEach((res:any)=>{
        const row = []
        for (const key in res) {
          row.push(res[key])
        }
        exelData.rowList.push(row)
      })
      this.exel.generateExcel(exelData)
    }
  }

  async getReportList(data:any,isValid:boolean){
    this.formService.markFormGroupTouched(this.refreshForm)
    if(isValid){
      const reqData: any = {
        apiRequest: this.refreshForm.value
      }
      await this.inventoryBalanceReportService.getInventoryReportData(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.dateList = [];
          res.apiResponse.inventoryReportDataList.forEach((val:any)=>{
           const foundItem = this.dateList.find((v:any)=>v === val.deliveryDate)
           if(!foundItem){
            this.dateList.push(val.deliveryDate);
           }
          })
          if(this.dateList.length){
            this.filterDate = this.dateList[0]
          }
          this.defaultDrugRegisterReportList = res.apiResponse.inventoryReportDataList;
          this.drugRegisterReportList = res.apiResponse.inventoryReportDataList.filter((v1:any)=>v1.deliveryDate === this.filterDate);
          this.paginationList = [];
          for (let index = 0; index < this.drugRegisterReportList.length / 19; index++) {
            this.paginationList.push(index + 1);
          }
          this.pageChange(1)
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
          this.toastr.error("Inventory balance report could not fetch due some error");
        }
      })
    }  
  }

  buttonShow(isPrev:any){
    const currentIndex = this.dateList.findIndex(res=>res === this.filterDate)
    if(currentIndex>-1){
      if(isPrev && currentIndex>0){
        return true;
      }else if(!isPrev && currentIndex<this.dateList.length-1){
        return true;
      }
    }
    return false;
  }

  changeDate(isPrev:any){
      const currentIndex = this.dateList.findIndex(res=>res === this.filterDate)
      if(currentIndex>-1){
        if(isPrev && currentIndex>0){
          this.filterDate = this.dateList[currentIndex-1]
        }else if(!isPrev && currentIndex<this.dateList.length-1){
          this.filterDate = this.dateList[currentIndex+1]
        }
      }
    this.drugRegisterReportList = this.defaultDrugRegisterReportList.filter((res:any)=>res.deliveryDate === this.filterDate);
    this.paginationList = [];
    for (let index = 0; index < this.drugRegisterReportList.length / 19; index++) {
      this.paginationList.push(index + 1);
    }
    this.pageChange(1)
  }

  pageChange(page: number) {
    this.currentPage = page;
    this.viewItem.startIndex = 0 + (19 * (this.currentPage - 1));
    this.viewItem.lastIndex = (19 + (19 * (this.currentPage - 1)));
  }

  isPageIndexVisible(currentPage: any, pageIndex: any) {
    if (currentPage + 2 >= pageIndex && currentPage - 3 <= pageIndex) {
      this.pageLastIndex = pageIndex + 4
      return true
    }
    return false
  }

  checkValidDate(controllName:string) {
    const dateControl = this.refreshForm.get(controllName);
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '00:00:01 AM') > this.currentDate.getTime()) {
      dateControl!.setValue('')
    }
  }

  formatDate(date:any){
    return new Date(date)
  }

}
