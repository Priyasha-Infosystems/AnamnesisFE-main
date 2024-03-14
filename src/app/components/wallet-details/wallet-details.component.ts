import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import { ProfileService } from '@services/profile.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wallet-details',
  templateUrl: './wallet-details.component.html',
  styleUrls: ['./wallet-details.component.css']
})
export class WalletDetailsComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  walletBalance:any = 0;
  walletDetails:any;
  requestKeyDetails:any;
  currentMonthYear:any;
  currentDate:any = new Date();
  monthOptionList:any = [
    {
      monthValue:'01',
      monthName:'Jan'
    },
    {
      monthValue:'02',
      monthName:'Feb'
    },
    {
      monthValue:'03',
      monthName:'Mar'
    },
    {
      monthValue:'04',
      monthName:'Apr'
    },
    {
      monthValue:'05',
      monthName:'May'
    },
    {
      monthValue:'06',
      monthName:'Jun'
    },
    {
      monthValue:'07',
      monthName:'Jul'
    },
    {
      monthValue:'08',
      monthName:'Aug'
    },
    {
      monthValue:'09',
      monthName:'Sep'
    },
    {
      monthValue:'10',
      monthName:'Oct'
    },
    {
      monthValue:'11',
      monthName:'Nov'
    },
    {
      monthValue:'12',
      monthName:'Dec'
    },
  ];
  filtermonthOptionList:any = [];
  TransactionDetailsOpen:boolean = false;
  constructor(
    private router: Router,
    private store: Store<any>,
    private loginService: LoginService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private profileService: ProfileService,
    private datepipe: DatePipe,
  ) { 
    this.currentMonthYear = this.datepipe.transform(this.currentDate,'MM-yyyy');
    const monthValue = this.datepipe.transform(this.currentDate,'MM')?this.datepipe.transform(this.currentDate,'MM'):'01';
    const currentYear = this.datepipe.transform(this.currentDate,'MM')?this.datepipe.transform(this.currentDate,'yyyy'):'2023';
    this.monthOptionList.forEach((res:any)=>{
      if(currentYear && monthValue && +res.monthValue <= +monthValue){
        const tempMonthOption ={
          monthValue :`${res.monthValue}-${currentYear}`,
          monthName:res.monthName
        }
        this.filtermonthOptionList.push(tempMonthOption)
      }
    })
  }

  ngOnInit(): void {
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.getWalletBalance (this.currentMonthYear)
    })
  }

  changeCurrentMonthYear(){
    const event:any =  document.getElementById('CurrentMonthYear');
    if(event && event.value){
      this.getWalletBalance(event.value)
    }
  }

  async getWalletBalance(currentMonthYear:string){
    const reqData: any = {
      apiRequest: {
        customerUserCode: this.requestKeyDetails.userCode,
        customerWalletBalance: 0,
        transactionMonthYear: currentMonthYear,
        walletTransactionCount: 0,
        walletTransactionList: []
      }
    };
    await this.profileService.GetWalletBalance(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.walletDetails = res.apiResponse;
          this.walletDetails.customerWalletBalance = this.truncatePrice(res.apiResponse.customerWalletBalance);
          this.TransactionDetailsOpen = true;
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        
      })
  }


  truncatePrice(data:number){
    return (Math.round(data * 100) / 100).toFixed(2);
  }

  dateFormat(data:any){
    return this.datepipe.transform(data,'dd-MMM-yyyy')
  }

  closePopUp(){
    this.close.emit(false)
  }
  openTransactionDetails(){
    this.TransactionDetailsOpen = !this.TransactionDetailsOpen
  }

}
