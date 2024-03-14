import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { OrderDetailsService } from '@services/order-details.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-order-list',
  templateUrl: './my-order-list.component.html',
  styleUrls: ['./my-order-list.component.css']
})
export class MyOrderListComponent implements OnInit {

  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  public showOrderDetails: boolean;
  public ShowOrderID: any;
  public ShowPackageID: any;
  public filterForm: FormGroup;
  public formDate: any;
  public toDate: any;
  public searchKeyword: any = '';
  public CustomDate: any = '';
  public filterArray: any = {
    date:{
      formDate:'',
      toDate:''
    },
    orderType:{
      appoinmentment:true,
      labTest:true,
      medicine:true,
      houseHoldItem:true,
    },
    searchKeyword:'',
    status:{
      pending:false,
      calceled:false
    }
  };
  public currentDate = new Date();
  public orderList:Array<any>=[];
  public packageList:Array<any>=[];
  public apiError:string ='';
  public expectedDeliveryDate: any = new Date().setDate(new Date().getDate() + 2)
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    public commonService: CommonService,
    private formService: FormService,
    private orderDetailsService: OrderDetailsService,
  ) {
    this.commonService.getUtilityService();

    this.intializingFormGroup();
    this.intializingMessage();
   }
   convertTimeStamp(date:string){
    return new Date(date);
   }

   getExpectedDeliveryDate(date:any) {
    return new Date(this.currentDate).setDate(new Date(date).getDate() + 2)
  }

   openOrderDetails(orderID:any,packageID:any){
    this.showOrderDetails = true;
    this.ShowOrderID = orderID?orderID:'';
    this.ShowPackageID = packageID?packageID:'';
   }
   closeOrderDetails(){
    this.showOrderDetails = false;
    this.ShowOrderID = '';
   }

   onfilterChange(key:string, val?:any){
    switch (key) {
      case 'coustomDate':
        this.CustomDate = val;
        this.formDate = undefined;
        this.toDate = undefined;
        switch (val) {
          case 'L30D':
            this.filterArray.date.formDate = new Date(new Date().setDate(new Date().getDate() - 30));
            this.filterArray.date.toDate = new Date();
            break;
          case 'L6M':
            this.filterArray.date.formDate = new Date(new Date().setMonth(new Date().getMonth() - 6));
            this.filterArray.date.toDate = new Date();
            break;
          case 'CY':
            this.filterArray.date.formDate = new Date(`01-01-${new Date().getFullYear()}`);
            this.filterArray.date.toDate = new Date();
            break;
          case 'LY':
            this.filterArray.date.formDate = new Date(`01-01-${new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1))).getFullYear()}`);
            this.filterArray.date.toDate = new Date();
            break;

          default:
            this.CustomDate = '';
            break;
        }
        break;
      case 'date':
        this.CustomDate = '';
        this.filterArray.date.formDate = '';
        this.filterArray.date.toDate = '';
        if(this.formDate){
          this.filterArray.date.formDate = this.formDate;
        }
        if(this.toDate){
          this.filterArray.date.toDate = this.toDate;
        }
        break;

      default:
        break;
    }
   }

   orderStatus(status:number){
    return status===0?'Initiated':status===3?'In progress':status===7?'Canceled':status===3?'Delivered':'Payment Pending'
   }

   truncPrice(data: number) {
    return (Math.round(data * 100) / 100).toFixed(2);
  }

   getOrderList = async ()=>{
    const reqData:any ={
      apiRequest:{
       customerID:this.requestKeyDetails.userID,
       customerUserCode:this.requestKeyDetails.userCode,
       selectionStartDate:'',
       selectionEndDate:'',
       pendingInclusionInd:this.filterArray.status.pending?'Y':'N',
       cancelledInclusionInd:this.filterArray.status.calceled?'Y':'N',
       consultationInclusionInd:this.filterArray.orderType.appoinmentment?'Y':'N',
       medicineInclusionInd:this.filterArray.orderType.medicine?'Y':'N',
       diagnosticInclusionInd:this.filterArray.orderType.labTest?'Y':'N',
       householdInclusionInd:this.filterArray.orderType.houseHoldItem?'Y':'N',
      }
    };
    if(this.filterArray.date.formDate && this.filterArray.date.toDate){
      reqData.apiRequest.selectionStartDate = this.filterArray.date.formDate
      reqData.apiRequest.selectionEndDate = this.filterArray.date.toDate
    }
    await this.orderDetailsService.getOrderList(reqData)
    .then(async (res: any) => {
      if (!this.commonService.isApiError(res)) {
        this.orderList = [];
        res.apiResponse.customerOrdersList.forEach((customerOrders:any)=>{
          const foundIndex = this.orderList.findIndex((res:any)=>res.orderID === customerOrders.orderID)
          if(foundIndex>-1){
            const packageData ={
              packageID:customerOrders.packageID,
              householdItemOrderCount:customerOrders.householdItemOrderCount,
              householdItemOrderList:customerOrders.householdItemOrderList,
              labtestOrderCount:customerOrders.labtestOrderCount,
              labtestOrderList:customerOrders.labtestOrderList,
              medicineOrderCount:customerOrders.medicineOrderCount,
              medicineOrderList:customerOrders.medicineOrderList,
              physicianOrderCount:customerOrders.physicianOrderCount,
              physicianOrderList:customerOrders.physicianOrderList,
              totalItemCount:customerOrders.householdItemOrderCount+customerOrders.labtestOrderCount+customerOrders.medicineOrderCount+customerOrders.physicianOrderCount,
              expDeliveryDate:customerOrders.expDeliveryDate
            }
            const Package:any={
              packageID:customerOrders.packageID,
              householdItemOrderCount:0,
              householdItemOrderList:[],
              labtestOrderCount:0,
              labtestOrderList:[],
              medicineOrderCount:0,
              medicineOrderList:[],
              physicianOrderCount:0,
              physicianOrderList:[],
            }
            let itemCount = 0;
            packageData.medicineOrderList.forEach((medicine:any)=>{
              itemCount = itemCount+1
              if(itemCount<4){
                Package.medicineOrderList.push(medicine)
              }
            })
            packageData.labtestOrderList.forEach((labtestOrder:any)=>{
              itemCount = itemCount+1
              if(itemCount<4){
                Package.labtestOrderList.push(labtestOrder)
              }
            })
            packageData.physicianOrderList.forEach((physicianOrder:any)=>{
              itemCount = itemCount+1
              if(itemCount<4){
                Package.physicianOrderList.push(physicianOrder)
              }
            })
            packageData.householdItemOrderList.forEach((householdItemOrder:any)=>{
              itemCount = itemCount+1
              if(itemCount<4){
                Package.householdItemOrderList.push(householdItemOrder)
              }
            })
            this.packageList.push(Package);
            this.orderList[foundIndex].packageList.push(packageData)
            this.orderList[foundIndex].totalPrice+customerOrders.totalPrice;
          }else{
              const orderData ={
                orderID:customerOrders.orderID,
                orderDate:customerOrders.orderDate,
                orderStatus:customerOrders.orderStatus,
                orderStatusDescription:customerOrders.orderStatusDescription,
                totalPrice:customerOrders.totalPrice,
                expDeliveryDate:customerOrders.expDeliveryDate,
                packageList:[{
                  packageID:customerOrders.packageID,
                  householdItemOrderCount:customerOrders.householdItemOrderCount,
                  householdItemOrderList:customerOrders.householdItemOrderList,
                  labtestOrderCount:customerOrders.labtestOrderCount,
                  labtestOrderList:customerOrders.labtestOrderList,
                  medicineOrderCount:customerOrders.medicineOrderCount,
                  medicineOrderList:customerOrders.medicineOrderList,
                  physicianOrderCount:customerOrders.physicianOrderCount,
                  physicianOrderList:customerOrders.physicianOrderList,
                  totalItemCount:customerOrders.householdItemOrderCount+customerOrders.labtestOrderCount+customerOrders.medicineOrderCount+customerOrders.physicianOrderCount,
                }]
              }
              const Package:any={
                packageID:customerOrders.packageID,
                householdItemOrderCount:0,
                householdItemOrderList:[],
                labtestOrderCount:0,
                labtestOrderList:[],
                medicineOrderCount:0,
                medicineOrderList:[],
                physicianOrderCount:0,
                physicianOrderList:[],
              }
              let itemCount = 0;
              orderData.packageList[0].medicineOrderList.forEach((medicine:any)=>{
                itemCount = itemCount+1
                if(itemCount<4){
                  Package.medicineOrderList.push(medicine)
                }
              })
              orderData.packageList[0].labtestOrderList.forEach((labtestOrder:any)=>{
                itemCount = itemCount+1
                if(itemCount<4){
                  Package.labtestOrderList.push(labtestOrder)
                }
              })
              orderData.packageList[0].physicianOrderList.forEach((physicianOrder:any)=>{
                itemCount = itemCount+1
                if(itemCount<4){
                  Package.physicianOrderList.push(physicianOrder)
                }
              })
              orderData.packageList[0].householdItemOrderList.forEach((householdItemOrder:any)=>{
                itemCount = itemCount+1
                if(itemCount<4){
                  Package.householdItemOrderList.push(householdItemOrder)
                }
              })
              this.packageList.push(Package);
              this.orderList.push(orderData)
          }
        });
        this.apiError = '';
      } else {
        this.apiError = res.anamnesisErrorList.anErrorList[0].errorMessage
        // this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
      }
    })
    .catch((err: any) => {
      if(err.status !== 401){
      this.toastr.error("Order list couldn't fetch due some error");
      }
    })
   }

   async orderCancel(orderId:any,packageID:any ){
    const reqData:any ={
      apiRequest:{
        customerID:this.requestKeyDetails.userID,
        orderID:orderId,
        packageID:packageID,
        transactionResult:''
      }
    };
    await this.orderDetailsService.cancel(reqData)
    .then(async (res: any) => {
      if (!this.commonService.isApiError(res)) {
        this.getOrderList();
      } else {
        // this.apiError = res.anamnesisErrorList.anErrorList[0].errorMessage
        this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
      }
    })
    .catch((err: any) => {
      if(err.status !== 401){
      this.toastr.error("Order  couldn't cancel due some error");
      }
    })
   }

   getPackage(packageID:any){
    return this.packageList.find(res=>res.packageID ===packageID);
   }

   formatData(data:any){}


  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.getOrderList();
    });

  }


  intializingFormGroup(){
    this.filterForm = this.fb.group({
      last30Days:[false],
      last6Months:[false],
      lastYear:[false],
      secondLastYear:[false],
      formDate:[''],
      toDate:[''],
      appoinmentment:[false],
      labTest:[false],
      medicine:[false],
      houseHoldItem:[false],
      searchKeyWord:[''],
      pending:[false],
      calceled:[false]
    })
  }

  intializingMessage(){

  }

}
