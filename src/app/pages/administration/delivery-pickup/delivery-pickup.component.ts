import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DELIVERY_PICKUP } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delivery-pickup',
  templateUrl: './delivery-pickup.component.html',
  styleUrls: ['./delivery-pickup.component.css']
})
export class DeliveryPickupComponent implements OnInit {
  orderPickupForm:FormGroup;
  errorMessage:any;
  apiErrorMsg:any;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    public supplierRequisitionService: SupplierRequisitionService,
  ) { 
    this.intializingFormGroup()
    this.intializingMsg()
  }

  ngOnInit(): void {
    this.deliveryDetails()
  }

  async save(){
    this.formService.markFormGroupTouched(this.orderPickupForm);
    if(this.orderPickupForm.valid){
      let invalid = false;
      const reqData: any = {
        apiRequest: {
          orderID:this.orderPickupForm.getRawValue().orderID,
          packageID:this.orderPickupForm.getRawValue().packageID,
          orderDate:this.orderPickupForm.getRawValue().orderDate,
          customerUserCode:this.orderPickupForm.getRawValue().customerUserCode,
          customerDeliveryAddressDetails:this.orderPickupForm.getRawValue().customerDeliveryAddressDetails,
          customerOrderItemList:[],
          inventoryLocation:this.orderPickupForm.getRawValue().inventoryLocation,
          transactionResult:'',
        }
          
      }
      this.orderPickupForm.getRawValue().orderLineEntryList.forEach((res:any,index:number)=>{
        res.customerOrderItemBatchList = []
        if(res.totalQuantity === res.temptotalQuantity){
          const customerOrderItemBatchList:any = []
          this.customerOrderItemBatchList(index).value.forEach((val:any)=>{
            if(val.check && val.itemQuantity){
              customerOrderItemBatchList.push(val)
            }
          })
          res.customerOrderItemBatchList = customerOrderItemBatchList;
          reqData.apiRequest.customerOrderItemList.push(res);
        }else{
          invalid = true;
          this.orderLineEntryList().at(index).get('errMsg')?.setValue('Quantity mismatch')
        }
      })
      if(!invalid){
        await this.supplierRequisitionService.PackageOrderPickupDetails(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Order pickup complete sucessfully')
            this.nextOrderDetails();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Delivery Details couldn't fetch due some error");
          }
        })
      }
    }
  }

  selectBatchNo(itemIndex:number,customerOrderItemBatchIndex:number,batchNumberDetails:any){
    this.orderLineEntryList().at(itemIndex).get('errMsg')?.setValue('')
    if(batchNumberDetails.check){
      if(+this.orderLineEntryList().at(itemIndex).get('temptotalQuantity')?.value <+this.orderLineEntryList().at(itemIndex).get('totalQuantity')?.value){
        if((+this.orderLineEntryList().at(itemIndex).get('temptotalQuantity')?.value)+(+batchNumberDetails.availableItemQuantity) <= +this.orderLineEntryList().at(itemIndex).get('totalQuantity')?.value){
          this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex).get('itemQuantity')?.setValue(batchNumberDetails.availableItemQuantity)
        }else if((+this.orderLineEntryList().at(itemIndex).get('temptotalQuantity')?.value)+(+batchNumberDetails.availableItemQuantity)>+this.orderLineEntryList().at(itemIndex).get('totalQuantity')?.value){
          this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex).get('itemQuantity')?.setValue((+this.orderLineEntryList().at(itemIndex).get('totalQuantity')?.value)-(+this.orderLineEntryList().at(itemIndex).get('temptotalQuantity')?.value))
        }
        const totalPrice =((+batchNumberDetails.finalPrice)/(+batchNumberDetails.availableItemQuantity)) * (+this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex).get('itemQuantity')?.value)
        this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex).get('totalPrice')?.setValue(totalPrice)
      }
    }else{
      this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex).get('itemQuantity')?.setValue(0)
      this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex).get('totalPrice')?.setValue(0)
    }
    let tempTotalQuantity = 0;
    this.customerOrderItemBatchList(itemIndex).getRawValue().forEach((res:any,index:any)=>{
      if(res.check && res.itemQuantity){
        tempTotalQuantity = tempTotalQuantity+(+res.itemQuantity);
       }
      //  else if(res.check && !res.itemQuantity){
      //   this.customerOrderItemBatchList(itemIndex).at(index).get('check')?.setValue(false)
      // }
    })
    this.orderLineEntryList().at(itemIndex).get('temptotalQuantity')?.setValue(tempTotalQuantity)
  }

  async nextOrderDetails(){
    const reqData: any = {
      apiRequest:{
        orderID:this.orderPickupForm.getRawValue().orderID,
        packageID:this.orderPickupForm.getRawValue().packageID,
        orderDate:this.orderPickupForm.getRawValue().orderDate,
        customerUserCode:this.orderPickupForm.getRawValue().customerUserCode,
        inventoryLocation:this.orderPickupForm.getRawValue().inventoryLocation      
      },
    }
    this.orderLineEntryList().clear();
    this.orderPickupForm.get('orderID')?.setValue(''),
    this.orderPickupForm.get('packageID')?.setValue(''),
    this.orderPickupForm.get('orderDate')?.setValue(''),
    this.orderPickupForm.get('customerUserCode')?.setValue(''),
    this.orderPickupForm.get('inventoryLocation')?.setValue(''),
    await this.supplierRequisitionService.GetDeliveryPickupDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.orderPickupForm.patchValue(res.apiResponse)
          res.apiResponse.orderLineEntryList.forEach((item:any,index:number)=>{
            this.addAnotheritemGroup(item,index,res.apiResponse.itemDetailsList);
          })
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Delivery Details couldn't fetch due some error");
        }
      })
  }

  async deliveryDetails(){
    const reqData: any = {
      apiRequest: {
        orderID:'',
        packageID:'',
        orderDate:'',
        customerUserCode:'',
        inventoryLocation:''
      }
    }
    await this.supplierRequisitionService.GetDeliveryPickupDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.orderPickupForm.patchValue(res.apiResponse)
          this.orderLineEntryList().clear();
          console.log(this.orderPickupForm.get('customerDeliveryAddressDetails')?.value);
          res.apiResponse.orderLineEntryList.forEach((item:any,index:number)=>{
            this.addAnotheritemGroup(item,index,res.apiResponse.itemDetailsList);
          })
          this.apiErrorMsg =''
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          this.apiErrorMsg = res.anamnesisErrorList.anErrorList[0].errorMessage;
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Delivery Details couldn't fetch due some error");
        }
      })
  }

  customerOrderItemBatchList(itemIndex:number){
    return this.orderLineEntryList().at(itemIndex).get('customerOrderItemBatchList') as FormArray;
  }

  orderLineEntryList(){
    return this.orderPickupForm.get('orderLineEntryList') as FormArray;
  }

  addAnotheritemGroup(item:any,index:number,itemDetailsList:any){
    const tempItem = {
      sequenceNo:index+1,
      itemCode:item.itemCode,
      itemType:item.itemType,
      itemCategory:item.itemCategory,
      totalQuantity:item.itemQuantity,
      itemName:item.itemName,
      batchNoOptionList:itemDetailsList.find((res:any)=>res.itemCode ===item.itemCode).itemBatchDetailsList?itemDetailsList.find((res:any)=>res.itemCode ===item.itemCode).itemBatchDetailsList:[],
      customerOrderItemBatchList:[],
    }
    const batchNoOptionList = itemDetailsList.find((res:any)=>res.itemCode ===item.itemCode).itemBatchDetailsList?itemDetailsList.find((res:any)=>res.itemCode ===item.itemCode).itemBatchDetailsList:[];
    this.orderLineEntryList().push(this.addItemGroup())
    this.orderLineEntryList().at(this.orderLineEntryList().length-1).patchValue(tempItem);
    batchNoOptionList.forEach((res:any)=>{
      this.addAnotherCustomerOrderItemBatch(this.orderLineEntryList().length-1,res)
    })
  }

  customerOrderItemBatchListController(itemIndex:number,customerOrderItemBatchIndex:number,controlName:any){
    const controls:any = this.customerOrderItemBatchList(itemIndex).at(customerOrderItemBatchIndex);
    return controls.controls[controlName];
  }

  private intializingFormGroup() {
    this.orderPickupForm = this.fb.group({
      orderID:[''],
      packageID:[''],
      customerUserCode:[''],
      orderDate:[''],
      customerDeliveryAddressDetails:[''],
      orderLineEntryList:this.fb.array([]),
      pendingOrderCount:[''],
      inventoryLocation:[''],
    });
  }

  private addItemGroup(){
    return this.fb.group({
      sequenceNo:[''],
      itemCode:[''],
      itemType:[''],
      itemCategory:[''],
      totalQuantity:[''],
      temptotalQuantity:[0],
      itemName:[''],
      customerOrderItemBatchList:this.fb.array([]),
      errMsg:['']
    })
  }

  private customerOrderItemBatchFormGroup(){
    return this.fb.group({
      check:[false],
      batchNo:[''],
      expiryDate:[''],
      itemMRP:[''],
      itemQuantity:[''],
      availableItemQuantity:[''],
      hsnCode:[''],
      discountAmount:[''],
      taxAmount:[''],
      finalPrice:[''],
      totalPrice:['']
    })
  }

  addAnotherCustomerOrderItemBatch(itemIndex:number,batchNoOption:any){
    this.customerOrderItemBatchList(itemIndex).push(this.customerOrderItemBatchFormGroup())
      const tempBatchNodetails ={
        check:false,
        batchNo:batchNoOption.batchNumber,
        expiryDate:batchNoOption.expiryDate,
        itemMRP:batchNoOption.itemMRP,
        itemQuantity:0,
        availableItemQuantity:batchNoOption.itemQuantity,
        hsnCode:batchNoOption.hsnCode,
        discountAmount:batchNoOption.discountAmount,
        taxAmount:batchNoOption.taxAmount,
        finalPrice:batchNoOption.finalPrice,
      }
    this.customerOrderItemBatchList(itemIndex).at(this.customerOrderItemBatchList(itemIndex).length -1).patchValue(tempBatchNodetails)
  }

  private intializingMsg(){
    this.errorMessage = {
      batchNo:{
        required:DELIVERY_PICKUP.ERR_MSG_REQUIERD_batchNo
      }
    };
  }

  dateFormat(date:any){
    if(date){
      return new Date(date)
    }
    return 0;
  }

}
