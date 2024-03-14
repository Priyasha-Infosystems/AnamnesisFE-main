import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/exel.service';
import { FormService } from '@services/form.service';
import { InventoryBalanceReportService } from '@services/inventory-balance-report.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventory-balance-report',
  templateUrl: './inventory-balance-report.component.html',
  styleUrls: ['./inventory-balance-report.component.css']
})
export class InventoryBalanceReportComponent implements OnInit {
  refreshForm:FormGroup;
  errMsg:any = {};
  inventoryBalanceReportList:any = [];
  paginationList:any = [];
  viewItem: any = {
    startIndex: 0,
    lastIndex: 0
  };
  currentPage:number;
  pageLastIndex: number = 0;
  currentDate: Date = new Date(new Date().setDate(new Date().getDate()-1))
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
    if( this.inventoryBalanceReportList.length){
      const exelData:any ={
        headerList : ['Medicine Name','Medicine Code','Open Balance','Purchase','Selling','Closing Balance'],
        rowList:[]
      }
      this.inventoryBalanceReportList.forEach((res:any)=>{
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
          this.inventoryBalanceReportList = res.apiResponse.inventoryReportDataList;
          this.paginationList = [];
          for (let index = 0; index < this.inventoryBalanceReportList.length / 19; index++) {
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

}
