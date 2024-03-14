import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BASE_IMAGE_URL } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { MedicineDetailsService } from '@services/medicine-details.service';
import { MedicineEntryService } from '@services/medicine-entry.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { UtilityService } from '@services/utility.service';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-healthcare-equipment-details',
  templateUrl: './healthcare-equipment-details.component.html',
  styleUrls: ['./healthcare-equipment-details.component.css']
})
export class HealthcareEquipmentDetailsComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  HouseholdItemCode: string;
  imageBaseUrl: string = BASE_IMAGE_URL;
  public requestKeyDetails: any;
  houseHoldItemDetails: any;
  somthingWentWrong: boolean = false;
  public cartAddressDetails:any;
  private isHHIAddtoCartFromDetails:boolean = false;
  public isItemAlreadyInCart:boolean = false;
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private commonService: CommonService,
    private medicineDetailsService: MedicineDetailsService,
    private medicineSelectionService: MedicineSelectionService,
    private healthEquipmentService: HealthEquipmentService,
    private viewMyCartService: ViewMyCartService,
  ) { }

  ngOnInit(): void {
    this.getCartAddress()
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    if (this.HouseholdItemCode) {
      this.getHouseHoldItemDetails(this.HouseholdItemCode)
    }
  }

  closePopup() {
    this.close.emit(this.isHHIAddtoCartFromDetails)
  }

  getHouseHoldItemDetails = async (data: any) => {
    const reqData: any = {
      apiRequest: { houseHoldItemCode: data }
    }
    await this.medicineDetailsService.getHouseHoldItemDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          
          this.houseHoldItemDetails = res.apiResponse;
          this.checkItemInCart(data)
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
          this.somthingWentWrong = true;
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine Details couldn't fetch due some error");
        }
      })
  }
  async checkItemInCart(houseHoldItemCode: string){
    const reqData: any = {
      apiRequest: { itemCode:houseHoldItemCode,itemType:'HHI' }
    }
    await this.viewMyCartService.checkItemInCart(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.isItemAlreadyInCart = res.apiResponse.itemAlreadyExists;
        }
      })
      .catch((err: any) => {
        this.isItemAlreadyInCart = false;
        if(err.status !== 401){
          
        }
      })
  }

  addToCart = async () => {
    if(this.isItemAlreadyInCart){
      setTimeout(() => {
        this.router.navigate(['home/view-my-cart'])
      }, 50);
      this.closePopup();
    }else{
    const reqData: any = {
      apiRequest: [
        {
          userID: this.requestKeyDetails.userID,
          cartItemSeqNo: '',
          prescriptionID: '',
          itemType: 'HI',
          itemCode: this.houseHoldItemDetails.householdItemCode,
          itemCategory:'',
          packageID: '',
          quantity: 1,
          addressID: this.cartAddressDetails.addressID,
          couponCode: '',
          itemStatus:this.houseHoldItemDetails.householdItemStatus,
          actionIndicator: 'ADD',
        }
      ]
    }
      await this.healthEquipmentService.addToCart(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Household Item move to cart');
            this.isHHIAddtoCartFromDetails = true;
            this.viewMyCartService.updateCartItemCount()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Household Item couldn't move to cart due some error");
          }
        })
      }
  }

  async getCartAddress(){
    await this.medicineSelectionService.getCartAddress()
      .then(async (res: any) => {
          this.cartAddressDetails  = res.apiResponse;
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          // this.toastr.error(`Medicine couldn't move to cart due some error`);
        }
      })
  }
}
