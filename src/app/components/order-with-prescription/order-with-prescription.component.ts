import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { OrderWithPrescriptionService } from '@services/order-with-prescription.service';
import { ToastrService } from 'ngx-toastr';
import { IAddCartRequest } from 'src/app/models/addToCart.model';

@Component({
  selector: 'app-order-with-prescription',
  templateUrl: './order-with-prescription.component.html',
  styleUrls: ['./order-with-prescription.component.css']
})
export class OrderWithPrescriptionComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  addressID:string;
  @Input()
  couponCode:any;
  public prescriptionFormGroup: FormGroup;
  public prescriptionList: Array<any> = [];
  public showPrescriptionIndex: number = 0;
  public showPrescription: boolean = false;
  public showPrescriptionID: string = '';
  public childDisplayNo: number = 50;
  public requestKeyDetails:any;
  public isAddToCart:boolean = false;
  public somthingWentWrong:boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private orderWithPrescriptionService: OrderWithPrescriptionService
  ) {
    this.intializingMedicineSeectionFormGroup()
  }
  intializingMedicineSeectionFormGroup() {
    this.prescriptionFormGroup = this.fb.group({
      prescriptionDetailsList: this.fb.array([]),
    })
  }

  prescriptionview(prescriptionID:string){
    if(prescriptionID.length){
      this.showPrescription= true;
      this.showPrescriptionID= prescriptionID;
    }
  }

  formatDate(date:string){
    return new Date(date);
  }

  viewPrescriptionClose(data:any){
    this.showPrescription= false;
    this.showPrescriptionID= '';
    if(data){
      this.isAddToCart = true;
    }
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getPrescriptions();

  }

  creatFormGroup(){
    this.prescriptionList.forEach((prescriptionDetails:any, prescriptionDetailsIndex:number)=>{
      var parentData: FormGroup = this.addPrescriptionGroup();
      this.prescriptionDetailsList().push(parentData)
      prescriptionDetails.prescriptionMedicineDetailsList.forEach((medicationDetails: any,medicationDetailsIndex: number)=>{
        var medicationDetailsData: FormGroup = this.addMedicineGroup();
        this.medicineList(prescriptionDetailsIndex).push(medicationDetailsData)
      });
      prescriptionDetails.prescriptionLabtestPckageDetailsList.forEach((labTestDetails: any,labTestDetailsIndex: number)=>{
        var labTestDetailsData: FormGroup = this.addLabtestGroup();
        this.labtestList(prescriptionDetailsIndex).push(labTestDetailsData)
      })
      prescriptionDetails.prescriptionHouseholdItemDetailsList.forEach((HouseholdItemDetails: any,HouseholdItemDetailsIndex: number)=>{
        var HouseHoldItemData: FormGroup = this.addHouseHoldItemGroup();
        this.HouseHoldItemList(prescriptionDetailsIndex).push(HouseHoldItemData)
      })
    });
  }

  prescriptionSelect(prescriptionIndex: number){
   this.showPrescriptionIndex = prescriptionIndex;
  }

  getPrescriptions= async () =>{
    const reqData: any = {
      apiRequest: { userCode: '' }
    }
    await this.orderWithPrescriptionService.getPrescriptionList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.prescriptionList = res.apiResponse.prescriptionDetailsResponseList;
          this.prescriptionList?.forEach((prescriptionDetails: any,prescriptionDetailsIndex: number)=>{
            this.prescriptionList[prescriptionDetailsIndex] = {...prescriptionDetails,selected:false}
            this.prescriptionList[prescriptionDetailsIndex].prescriptionDate = new Date(prescriptionDetails.prescriptionDate);
            this.prescriptionList[prescriptionDetailsIndex].prescriptionMedicineDetailsList.forEach((medicationDetails: any,medicationDetailsIndex: number)=>{
              this.prescriptionList[prescriptionDetailsIndex].prescriptionMedicineDetailsList[medicationDetailsIndex] = {...medicationDetails,check:false}
            });
            this.prescriptionList[prescriptionDetailsIndex].prescriptionLabtestPckageDetailsList.forEach((labTestDetails: any,labTestDetailsIndex: number)=>{
              this.prescriptionList[prescriptionDetailsIndex].prescriptionLabtestPckageDetailsList[labTestDetailsIndex] = {...labTestDetails,check:false}
            })
            this.prescriptionList[prescriptionDetailsIndex].prescriptionHouseholdItemDetailsList.forEach((householdItemDetails: any,householdItemDetailsIndex: number)=>{
              this.prescriptionList[prescriptionDetailsIndex].prescriptionHouseholdItemDetailsList[householdItemDetailsIndex] = {...householdItemDetails,check:false}
            })
          })
          this.creatFormGroup();
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
        this.toastr.error("Prescriptions couldn't fetch due some error");
        }
      })
  }

  addPrescriptionGroup(){
    return this.fb.group({
      medicationDetailsList: this.fb.array([]),
      labTestDetailsList: this.fb.array([]),
      HouseHoldItemList: this.fb.array([]),
    })
  }

  prescriptionDetailsList(){
    return this.prescriptionFormGroup.get('prescriptionDetailsList') as FormArray;
  }

  addMedicineGroup() {
    return this.fb.group({
      check: [false]
    })
  }

  addLabtestGroup() {
    return this.fb.group({
      check: [false]
    })
  }
  addHouseHoldItemGroup() {
    return this.fb.group({
      check: [false]
    })
  }

  medicineList(index: number) {
    return this.prescriptionDetailsList().at(index).get('medicationDetailsList') as FormArray;
  }

  labtestList(index: number) {
    return this.prescriptionDetailsList().at(index).get('labTestDetailsList') as FormArray;
  }

  HouseHoldItemList(index: number) {
    return this.prescriptionDetailsList().at(index).get('HouseHoldItemList') as FormArray;
  }

  closeOrderWithPrescriptionPopup() {
    if(this.isAddToCart){
      this.close.emit(true);
    }else{
      this.close.emit();
    }
  }

  save = async() =>{
    const reqData: any = {
      apiRequest: []
    }
    const addToCartItemList: Array<any> =[];
    let seqNo: number = 0;
    this.prescriptionFormGroup.value.prescriptionDetailsList.forEach((prescriptionDetails: any, index: number)=>{
      prescriptionDetails.labTestDetailsList.forEach((labTestDetails: any, i: number)=>{       
        if(labTestDetails.check === true){
          if(this.prescriptionList[index].prescriptionLabtestPckageDetailsList[i]?.laboratoryTestList?.length){
            const templabTestDetails = this.prescriptionList[index].prescriptionLabtestPckageDetailsList[i];
            templabTestDetails.laboratoryTestList.forEach((labtest:any)=>{
              seqNo = seqNo+1;
              const tempAddToCartItem: any ={
                userID:this.requestKeyDetails.userID,
                cartItemSeqNo:'',
                prescriptionID:this.prescriptionList[index].prescriptionID,
                itemType:'PK',
                itemCode:labtest.laboratoryTestCode,
                packageID:templabTestDetails.labtestPackageCode,
                quantity:1,
                addressID:this.addressID,
                couponCode: this.couponCode,
                itemStatus:templabTestDetails.laboratoryTestPackageStatus,
                actionIndicator:'ADD',
                transactionResult:'',
              }
              addToCartItemList.push(tempAddToCartItem);
            })
          }else{
            const templabTestDetails = this.prescriptionList[index].prescriptionLabtestPckageDetailsList[i];
            seqNo = seqNo+1;
            const tempAddToCartItem: any ={
              userID:this.requestKeyDetails.userID,
              cartItemSeqNo:'',
              prescriptionID:this.prescriptionList[index].prescriptionID,
              itemType:'LT',
              itemCode:templabTestDetails.labtestPackageCode,
              packageID:'',
              quantity:1,
              addressID:'',
              couponCode: this.couponCode,
              itemStatus:templabTestDetails.laboratoryTestPackageStatus,
              actionIndicator:'ADD',
              transactionResult:'',
            }
            addToCartItemList.push(tempAddToCartItem);
          }
        }
      });
      prescriptionDetails.medicationDetailsList.forEach((medicationDetails: any,i: number)=>{
        if(medicationDetails.check === true){
          const tempmedicationDetails = this.prescriptionList[index].prescriptionMedicineDetailsList[i];
          seqNo = seqNo+1;
          const tempAddToCartItem: any ={
            userID:this.requestKeyDetails.userID,
            cartItemSeqNo:'',
            prescriptionID:this.prescriptionList[index].prescriptionID,
            itemType:'MD',
            itemCode:tempmedicationDetails.medicineCode,
            itemCategory:tempmedicationDetails.medicineCategory,
            packageID:'',
            quantity:1,
            addressID:this.addressID,
            couponCode: this.couponCode,
            itemStatus:tempmedicationDetails.medicineStatus,
            actionIndicator:'ADD',
            transactionResult:'',
          }
          addToCartItemList.push(tempAddToCartItem);
        }
      })
      prescriptionDetails.HouseHoldItemList.forEach((HouseHoldItem: any,i: number)=>{
        if(HouseHoldItem.check === true){
          const tempHouseHoldItem = this.prescriptionList[index].prescriptionHouseholdItemDetailsList[i];
          seqNo = seqNo+1;
          const tempAddToCartItem: any ={
            userID:this.requestKeyDetails.userID,
            cartItemSeqNo:'',
            prescriptionID:this.prescriptionList[index].prescriptionID,
            itemType:'HI',
            itemCode:tempHouseHoldItem.householdItemCode,
            itemCategory:tempHouseHoldItem.householdItemCategory,
            packageID:'',
            quantity:1,
            addressID:this.addressID,
            couponCode: this.couponCode,
            itemStatus:tempHouseHoldItem.householdItemStatus,
            actionIndicator:'ADD',
            transactionResult:'',
          }
          addToCartItemList.push(tempAddToCartItem);
        }
      })
    })
    if(addToCartItemList.length>0){
      reqData.apiRequest = addToCartItemList;
       await this.orderWithPrescriptionService.addToCart(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.close.emit(true);
            this.toastr.success('Item has been placed to cart successfully');
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
          this.toastr.error("Items couldn't move to cart due some error");
          }
        })
    }else{
      this.toastr.info('No selected item for cart');
    }
  }

  viewAllChild(prescriptionIndex: number,labtestIndex: number) {
    this.prescriptionList[prescriptionIndex].prescriptionLabTestDetailsList.forEach((val: any, i: number) => {
      this.prescriptionList[prescriptionIndex].prescriptionLabTestDetailsList[i].labtest.openViewMoreTextPopup =false;
    })
    this.prescriptionList[prescriptionIndex].prescriptionLabTestDetailsList[labtestIndex].labtest.openViewMoreTextPopup =true;
  }

  viewMorTextPopupClose(prescriptionIndex: number,labtestIndex: number) {
    this.prescriptionList[prescriptionIndex].prescriptionLabTestDetailsList[labtestIndex].labtest.openViewMoreTextPopup =false;
  }
}
