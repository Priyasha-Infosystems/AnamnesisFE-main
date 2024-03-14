import { Component, OnInit } from '@angular/core';
import { AddressService } from '@services/address.service';
import { LOCAL_STORAGE, stateList } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '@services/localService/localStorage.service';

@Component({
  selector: 'app-manage-address',
  templateUrl: './manage-address.component.html',
  styleUrls: ['./manage-address.component.css']
})
export class ManageAddressComponent implements OnInit {

  addressError: boolean = false;
  addressDetails: any = [];
  openModal: boolean = false;
  selectedAddress: any = null;
  addNewAddress: boolean = false;
  blankAddress: boolean = false;
  stateList: any = [];

  constructor(
    public addressService: AddressService,
    private commonService: CommonService,
    private store: Store<any>,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.getAddressDetails();
    this.getStateDetails();
  }

  getStateDetails = async () => {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  getAddressDetails = async () => {
    await this.addressService.getAddress()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (res.apiResponse.allAddressCount > 0) {
            this.addressDetails = res.apiResponse.allAddressList;
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
        this.blankAddress = res.apiResponse.allAddressCount === 0;
      })
      .catch((err: any) => {
        this.addressError = true;
        this.blankAddress = this.addressDetails.length === 0;
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

  openPopup = (isNewAddress: boolean, address?: any) => {
    if (isNewAddress) {
      this.addNewAddress = true;
    }
    if (address) {
      this.selectedAddress = address;
    }
    this.openModal = true;
  }

  closePopup = () => {
    this.getAddressDetails();
    this.addNewAddress = false;
    this.selectedAddress = null;
    this.openModal = false;
  }

  manageAddress = async (id: any) => {
    const userId = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID);
    const reqObj = { addressID: id, userID: userId };
    const reqData = {
      apiRequest: reqObj,
    }
    await this.addressService.setDefaultAddress(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.getAddressDetails();
          this.toastr.success("Address updated successfully");
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Address couldn't be updated due some error")
        }
      })
  }

  deleteAddress = async (id: any) => {
    const userId = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID);
    const reqObj = { addressID: id, userID: userId };
    const reqData = {
      apiRequest: reqObj,
    }
    await this.addressService.deleteAddress(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.getAddressDetails();
          this.toastr.success("Address deleted successfully");
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Address couldn't be deleted due some error")
        }
      })
  }
}
