import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { PaymentService } from '@services/payment.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-approval',
  templateUrl: './payment-approval.component.html',
  styleUrls: ['./payment-approval.component.css']
})
export class PaymentApprovalComponent implements OnInit {
  paymentTrasactionList:Array<any> = [];
  constructor(
    private toastr: ToastrService,
    public commonService: CommonService,
    private store: Store<any>,
    public utilityService: UtilityService,
    public paymentService: PaymentService,
  ) { }

  ngOnInit(): void {
    this.getPaymentDisplayList();
  }

  async getPaymentDisplayList(){
    const reqData: any = {
      apiRequest: {}
    }
    await this.paymentService.getPaymentDisplayList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.paymentTrasactionList=[]
          res.apiResponse.paymentTransactionDetailsList?.forEach((val:any)=>{
            this.paymentTrasactionList.push({...val,checked:false})
          });
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Payment list couldn't fetch due some error");
        }
      }) 
  }

  selectPaymentTrasactions(paymentTrasactionsIndex:number){
    this.paymentTrasactionList[paymentTrasactionsIndex].checked = !this.paymentTrasactionList[paymentTrasactionsIndex].checked
  }

  getselectedPaymentTrasactionList(){
    let data = []
     data = this.paymentTrasactionList.filter((res:any)=>res.checked === true)
    return data 
  }

  async submit(){
    if(this.getselectedPaymentTrasactionList().length){
    const reqData: any = {
      apiRequest: {
        paymentTransactionCount: this.getselectedPaymentTrasactionList().length,
        paymentTransactionDetailsList: this.getselectedPaymentTrasactionList()
      }
    }
    await this.paymentService.PaymentApproval(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.toastr.success("Payment approved successfully");
         this.ngOnInit()
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Payment couldn't approve due some error");
        }
      }) 
    }
  }

  
  dateFormat(date:any){
    if(date){
      return new Date(date)
    }
    return 0;
  }

}
