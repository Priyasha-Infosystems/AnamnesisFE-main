import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delivery-agent-assignment',
  templateUrl: './delivery-agent-assignment.component.html',
  styleUrls: ['./delivery-agent-assignment.component.css']
})
export class DeliveryAgentAssignmentComponent implements OnInit {
  orderAssignmentForm:FormGroup;
  errorMessage:any = {};
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
    this.getDeliveryAssignmentDetails()
  }

  async save() {
    const reqData: any = {
      apiRequest: {
        deliveryAssigmentCount: 0,
        orderDeliveryInformationList: [],
        transactionResult: '',
      }
    };
    if (this.orderAssignmentForm.get('activeDeliveryZoneWorkLoadIndex')) {
      let selectedDeliveryAgentDetails: any = {};
      this.deliveryAgentAssignmentList(this.orderAssignmentForm.get('activeDeliveryZoneWorkLoadIndex')?.getRawValue()).getRawValue().forEach((res: any) => {
        if (res.assigne) {
          selectedDeliveryAgentDetails.deliveryAgentUserCode = res.deliveryAgentUserCode;
          selectedDeliveryAgentDetails.deliveryAgentUserName = res.deliveryAgentUserName;
        }
      })
      if (selectedDeliveryAgentDetails.deliveryAgentUserCode) {
        const orderDeliveryInformationList: any = [];
        this.orderDeliveryInformationList(this.orderAssignmentForm.get('activeDeliveryZoneWorkLoadIndex')?.getRawValue()).getRawValue().forEach((res: any) => {
          if (res.check) {
            res.deliveryAgentUserCode = selectedDeliveryAgentDetails.deliveryAgentUserCode;
            res.deliveryAgentUserName = selectedDeliveryAgentDetails.deliveryAgentUserName;
            orderDeliveryInformationList.push(res);
          }
        })
        if (!orderDeliveryInformationList.length) {
          this.orderAssignmentForm.get('orderDeliveryInformationErrMsg')?.setValue('Please select a order');
          setTimeout(() => {
            this.orderAssignmentForm.get('orderDeliveryInformationErrMsg')?.setValue('');
          }, 1500);
        } else {
          reqData.apiRequest.orderDeliveryInformationList = orderDeliveryInformationList;
          reqData.apiRequest.deliveryAssigmentCount = orderDeliveryInformationList.length;
        }
      } else {
        this.orderAssignmentForm.get('deliveryAgentAssignmentErrMsg')?.setValue('Please select a delivery agent');
        setTimeout(() => {
          this.orderAssignmentForm.get('deliveryAgentAssignmentErrMsg')?.setValue('');
        }, 1500);
      }
    }
    await this.supplierRequisitionService.DeliveryAssignment(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.getDeliveryAssignmentDetails();
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

  async getDeliveryAssignmentDetails(){
      const reqData: any = {
        apiRequest: {}
      }
      await this.supplierRequisitionService.getDeliveryAssignment(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.deliveryZoneWorkLoadList().clear(),
            this.orderAssignmentForm.get('activeDeliveryZoneWorkLoadIndex')?.setValue('')
            this.orderAssignmentForm.patchValue(res.apiResponse)
            if(res.apiResponse.deliveryZoneWorkLoadList.length){
              this.orderAssignmentForm.get('activeDeliveryZoneWorkLoadIndex')?.setValue(0);
              res.apiResponse.deliveryZoneWorkLoadList.forEach((res:any)=>{
                this.addAnotherdeliveryZoneWorkLoadFormGroup(res);
              })
            }
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

  chooseDeliveryZone(deliveryZoneWorkLoadIndex:number){
    this.deliveryZoneWorkLoadList().controls.forEach((val:any,i:number)=>{
      this.deliveryAgentAssignmentList(i).controls.forEach((res:any,index:number)=>{
        this.deliveryAgentAssignmentList(i).at(index).get('assigne')?.setValue(false);
      });
    })
    this.orderAssignmentForm.get('activeDeliveryZoneWorkLoadIndex')?.setValue(deliveryZoneWorkLoadIndex);
  }

  chooseDeleveryPerson(deliveryZoneWorkLoadIndex:number,deliveryAgentAssignmenIndex:number){
    this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).controls.forEach((res:any,index:number)=>{
      if(index !==deliveryAgentAssignmenIndex){
        this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).at(index).get('assigne')?.setValue(false);
      }
    });
    this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).at(deliveryAgentAssignmenIndex).get('assigne')?.setValue(!this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).at(deliveryAgentAssignmenIndex).get('assigne')?.value);
    console.log(this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).at(deliveryAgentAssignmenIndex).get('assigne')?.value)
  }

  getCustomerAddress(orderDeliveryAddress:any){
    if(orderDeliveryAddress){
      return `${orderDeliveryAddress.customerCity}, ${orderDeliveryAddress.customerStateName} - ${orderDeliveryAddress.customerPincode}`;
    }
    return 'Undefined';
  }

  orderDeliveryInformationList(deliveryZoneWorkLoadIndex:number){
    return this.deliveryZoneWorkLoadList().at(deliveryZoneWorkLoadIndex).get('orderDeliveryInformationList') as FormArray;
  }

  orderDeliveryInformationController(deliveryZoneWorkLoadIndex:number,orderDeliveryInformationIndex:number,controlName:any){
    const control:any = this.orderDeliveryInformationList(deliveryZoneWorkLoadIndex).at(orderDeliveryInformationIndex);
    return control.controls[controlName];
  }

  addAnotherOrderDeliveryInformation(deliveryZoneWorkLoadIndex:number,data:any){
    this.orderDeliveryInformationList(deliveryZoneWorkLoadIndex).push(this.orderDeliveryInformationFormGroup())
    this.orderDeliveryInformationList(deliveryZoneWorkLoadIndex).at(this.orderDeliveryInformationList(deliveryZoneWorkLoadIndex).length -1).patchValue(data)
    if(data.deliveryAgentUserCode){
      this.orderDeliveryInformationList(deliveryZoneWorkLoadIndex).at(this.orderDeliveryInformationList(deliveryZoneWorkLoadIndex).length -1).get('check')?.disable() 
    }
  }

  getDeliveryAgentUserName(deliveryAgentUserCode:any,deliveryZoneWorkLoadIndex:number){
    if(deliveryAgentUserCode){
      return  this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).getRawValue()
      .find((res:any)=>res.deliveryAgentUserCode === deliveryAgentUserCode)
      .deliveryAgentName
    }
    return ''
  }

  orderDeliveryInformationFormGroup(){
   return this.fb.group({
      orderID:[''],
      packageID:[''],
      orderDate:[''],
      orderDeliveryAddress:[''],
      deliveryAgentUserCode:[''],
      deliveryAgentUserName:[''],
      check:[false]
   })
  }

  deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex:number){
    return this.deliveryZoneWorkLoadList().at(deliveryZoneWorkLoadIndex).get('deliveryAgentAssignmentList') as FormArray;
  }

  deliveryAgentAssignmenController(deliveryZoneWorkLoadIndex:number,deliveryAgentAssignmenIndex:number,controlName:any){
    const control:any = this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).at(deliveryAgentAssignmenIndex);
    return control.controls[controlName];
  }

  addAnotherDeliveryAgentAssignment(deliveryZoneWorkLoadIndex:number,data:any){
    this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).push(this.deliveryAgentAssignmentFormGroup());
    this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).at(this.deliveryAgentAssignmentList(deliveryZoneWorkLoadIndex).length-1).patchValue(data);
  }

  deliveryAgentAssignmentFormGroup(){
   return this.fb.group({
      deliveryAgentName: [''],
      deliveryAgentUserCode: [''],
      orderAssignmentCount: [''],
      orderAssignmentType: [''],
      assigne:[false]
    })
  }

  deliveryZoneWorkLoadList(){
    return this.orderAssignmentForm.get('deliveryZoneWorkLoadList') as FormArray;
  }

  deliveryZoneWorkLoadControl(deliveryZoneWorkLoadIndex:number,controlName:any){
    const control:any = this.deliveryZoneWorkLoadList().at(deliveryZoneWorkLoadIndex);
    return control.controls[controlName];
  }

  addAnotherdeliveryZoneWorkLoadFormGroup(data:any){
    this.deliveryZoneWorkLoadList().push(this.deliveryZoneWorkLoadFormGroup())
    this.deliveryZoneWorkLoadList().at(this.deliveryZoneWorkLoadList().length-1).patchValue(data);
    this.deliveryAgentAssignmentList(this.deliveryZoneWorkLoadList().length-1).clear();
    this.orderDeliveryInformationList(this.deliveryZoneWorkLoadList().length-1).clear();
    data.orderDeliveryInformationList?.forEach((res:any)=>{
      this.addAnotherOrderDeliveryInformation(this.deliveryZoneWorkLoadList().length-1,res);
    });
    data.deliveryAgentAssignmentList?.forEach((res:any)=>{
      this.addAnotherDeliveryAgentAssignment(this.deliveryZoneWorkLoadList().length-1,res);
    });
  }

  deliveryZoneWorkLoadFormGroup(){
    return this.fb.group({
      deliveryAgentAssignmentList: this.fb.array([]),
      deliveryAgentAssignmentErrMsg:'',
      deliveryAgentCount: [''],
      deliveryOrderCount: [''],
      deliveryRegion: [''],
      deliveryZone: [''],
      distributionZone: [''],
      orderDeliveryInformationList: this.fb.array([]),
      orderDeliveryInformationErrMsg:'',
      stateCode: ['']
    })
  }

  private intializingFormGroup() {
    this.orderAssignmentForm = this.fb.group({
      deliveryZoneCount: [''],
      deliveryZoneWorkLoadList:this.fb.array([]),
      activeDeliveryZoneWorkLoadIndex:[''],
      inventoryLocation:[''],
      processDate:['']
    });
  }

  private intializingMsg(){
    this.errorMessage = {
      batchNo:{
        // required:DELIVERY_PICKUP.ERR_MSG_REQUIERD_batchNo
      }
    };
  }

  dateFormat(data:any){
    return new Date(data)
  }

}
