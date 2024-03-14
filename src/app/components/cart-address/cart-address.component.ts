import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AddressService } from '@services/address.service';
import { CommonService } from '@services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart-address',
  templateUrl: './cart-address.component.html',
  styleUrls: ['./cart-address.component.css']
})
export class CartAddressComponent implements OnInit {
  @Output() close: EventEmitter<{}> = new EventEmitter<{}>();
  addresList: Array<any> = [];
  selectedAddress: any = {};
  editAddressDetails: any = {};
  selectedAddessIndex: number = 0;
  requestKeyDetails: any;
  stateList: Array<any> = [];
  addNewAddress: boolean = true;
  openModal: boolean = false;
  constructor(
    private toastr: ToastrService,
    private commonService: CommonService,
    private addressService: AddressService,
    private store: Store<any>,
  ) {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getAddressDetails();
  }
  selectAddress(address: any, addressInex: any) {
    this.selectedAddress = address;
    this.selectedAddessIndex = addressInex;
  }

  editAddress() {
    this.openModal = true;
    this.addNewAddress = false;
    this.editAddressDetails = { ...this.selectedAddress }
  }

  addAddress() {
    this.openModal = true;
    this.addNewAddress = true;
  }

  closeAddressPopUp(data: any) {
    this.openModal = false;
    this.addNewAddress = true;
    if (data) {
     this.getAddressDetails(true,this.selectedAddessIndex)
    }
  }

  getAddressDetails = async (IsAfterSave?:boolean,index?:number) => {
    await this.addressService.getAddress()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (res.apiResponse.allAddressCount > 0) {
            this.addresList = res.apiResponse.allAddressList;
            if(IsAfterSave && index){
              this.selectedAddress = this.addresList[index];
            }else{
              this.selectedAddress = this.addresList[0];
            }
            
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        this.addresList = [];
      })
  }

  saveAddressAsCartAddress = async () => {
    const reqData: any = {
      apiRequest: {
        customerAddressID: this.selectedAddress.addressID,
        userID: this.requestKeyDetails.userID
      }
    }
    await this.addressService.saveCartAddress(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.close.emit(true)
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  setAddressImg = (type: string) => {
    let url = "../../../assets/images/Other.png";
    if (type === "HOME") {
      url = "../../../assets/images/home.png";
    } else if (type === "WORK") {
      url = "../../../assets/images/office.png";
    }
    return url;
  }

  closePopup() {
    this.close.emit()
  }
}
