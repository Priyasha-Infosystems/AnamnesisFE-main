import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { OrderDetailsService } from '@services/order-details.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
 @Output()close:EventEmitter<{}> = new EventEmitter<{}>();
 @Input()
 orderID:''
 @Input()
 packageID:''
 requestKeyDetails:any;
 somthingWentWrong:boolean = false;
 somthingWentWrongErrMSG:boolean = false;
 orderDetails:any;
 pricingDetails:any;
 currentDate:any = new Date();
  constructor(
    private utilityService: UtilityService,
    public commonService: CommonService,
    private formService: FormService,
    private orderDetailsService: OrderDetailsService,
    private toastr: ToastrService,
  ) {
    this.commonService.getUtilityService();
    
   }

  ngOnInit(): void {
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.getOrderDetails();
    });
   
  }
  dateFormat(date:string){
    return new Date(date);
  }

  orderStatus(status:number){
    return status===0?'Initiated':status===3?'In progress':status===7?'Canceled':status===3?'Delivered':'Payment Pending'
  }

  getOrderDetails = async ()=>{
    const reqData: any = {
      apiRequest: { orderID: this.orderID,packageID:this.packageID,customerUserCode:this.requestKeyDetails.userCode }
    }
    await this.orderDetailsService.getOrderDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.orderDetails = res.apiResponse;
          this.pricingDetails = res.apiResponse.cartItemPricingInformation;
        } else {
          if(res.anamnesisErrorList.dbModificationInd=== 'Y'){
            this.toastr.error('Please try again');
          }else{
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
          this.somthingWentWrong = true;
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
          this.somthingWentWrong = true;
          this.toastr.error("Oredr Details couldn't fetch due some error");
        }
      })
  }

  closePopup(){
    this.close.emit()
  }

  truncPrice(data: number) {
    return (Math.round(data * 100) / 100).toFixed(2);
  }
  checkPriceIsNegative(data:number){
    if(data<0){
      return false;
    }
    return true;
  }

  getExpectedDeliveryDate(date:any) {
    return new Date(this.currentDate).setDate(new Date(date).getDate() + 2)
  }

  GenerateInvoice = async()=>{
    const reqData: any = {
      apiRequest: { orderID: this.orderID,packageID:this.packageID,customerUserCode:this.requestKeyDetails.userCode }
    }
    await this.orderDetailsService.DownloadInvoice(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.orderDetails.fileName = res.apiResponse.fileName;
          this.orderDetails.fileType = res.apiResponse.fileType;
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
        this.toastr.error("Invoice couldn't generate due some error");
        }
      })
  }
}
