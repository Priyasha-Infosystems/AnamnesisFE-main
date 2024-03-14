import { Component, OnInit } from '@angular/core';
import { CommonService } from '@services/common.service';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { ToastrService } from 'ngx-toastr';
import { IAddressDetails, IPricingDetails } from '../models/viewMyCart.model';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { NotificationAlertService } from '@services/notification.service';
import { ProfileService } from '@services/profile.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-view-my-cart',
  templateUrl: './view-my-cart.component.html',
  styleUrls: ['./view-my-cart.component.css']
})
export class ViewMyCartComponent implements OnInit {
  public showCartAddress: boolean = false;
  public addressDetails: any;
  public pricingDetails: any;
  public catrDetails: any;
  public openMedicineSelectionModal: boolean = false;
  public openLabTestSelectionModal: boolean = false;
  public openHealthcareEquipmentSelectionModal: boolean = false;
  public openOrderWithPrescriptinSelectionModal: boolean = false;
  public openmedicineDetailsModal: boolean = false;
  public openHouseHoldItemDetailsModal: boolean = false;
  public showMedicineCode: any;
  public showHouseHoldItemCode: any;
  public paymentIndicator: string = '';
  public requestKeyDetails: any;
  public somthingWentWrong: boolean = false;
  public expectedDeliveryDate: any = new Date().setDate(new Date().getDate() + 2)
  displayName: string = '';
  cartAddressID: string = '';
  cartError: boolean = false;
  cuponCode: string = '';
  cuponcodeIsApplied: boolean = false;
  UpiBox: boolean = false;
  WalletsBox: boolean = false;
  CardBox: boolean = false;
  NetBox: boolean = false;
  constructor(
    private viewMyCartService: ViewMyCartService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private router: Router,
    private store: Store<any>,
    private profile: ProfileService,
  ) {
    this.store.pipe(select('profileState')).subscribe(async val => {
      this.displayName = val.profileDetails.displayName ?? val.companyDetails.legalBusinessName ?? ""
    })
  }

  ngOnInit(): void {
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    window.scrollTo(0, 0);
    this.getCartDetails()
    // this.viewMyCartService.cartRefetchInd
    // .pipe(debounceTime(1000))
    // .subscribe(res => {
    //   if (res) {
    //     this.getCartDetails()
    //   }
    // })
  }

  PaymentCart(type: String) {
    switch (type) {
      case 'Upi':
        this.UpiBox = !this.UpiBox
        if (this.UpiBox) {
          this.WalletsBox = false
          this.CardBox = false
          this.NetBox = false
        }
        break;
      case 'Wallets':
        this.WalletsBox = !this.WalletsBox
        if (this.WalletsBox) {
          this.UpiBox = false
          this.CardBox = false
          this.NetBox = false
        }
        break;
      case 'Card':
        this.CardBox = !this.CardBox
        if (this.CardBox) {
          this.UpiBox = false
          this.WalletsBox = false
          this.NetBox = false
        }
        break;
      case 'Net':
        this.NetBox = !this.NetBox
        if (this.NetBox) {
          this.UpiBox = false
          this.WalletsBox = false
          this.CardBox = false
        }
        break;

      default:
        break;
    }
    if (!this.UpiBox && !this.WalletsBox && !this.CardBox && !this.NetBox) {
      if (type === 'Wallets') {
        this.WalletsBox = true;
      }
      else if (type === 'Card') {
        this.CardBox = true;
      }
      else if (type === 'Net') {
        this.NetBox = true;
      }
      else if (type === 'Upi') {
        this.UpiBox = true;
      }
    }
  }

  openCartAddress() {
    this.openHealthcareEquipmentSelectionModal = false;
    this.openLabTestSelectionModal = false;
    this.openOrderWithPrescriptinSelectionModal = false;
    this.openMedicineSelectionModal = false;
    this.showCartAddress = true;
  }

  closeCartAddress(data: any) {
    this.showCartAddress = false;
    if (data) {
      this.getCartDetails();
    }
  }

  showPhysicianConsultationScheduleButton() {

  }

  openPhysicianSchedule() {
    const addPhysicianScheduleData = {
      patientUserID: '',
      patientUserCode: '',
      customerName: this.displayName,
      healthClinicID: '',
      healthClinicName: '',
      physicianUserCode: '',
      physicianName: '',
      selectedSlot: 'morning',
      appointmentDate: '',
      appointmentTime: '',
      transactionResult: '',
    }
    const state = {
      page: '/home/view-my-cart',
      isLabtest: false,
      addLabtestScheduleData: {},
      addPhisicianScheduleData: addPhysicianScheduleData,
      indicator: 'Y'
    }
    const extras = { skipLocationChange: true, state };
    this.router.navigate(['/home/add-schedule'], extras)
  }

  showLabtestScheduleButton() {
    return this.catrDetails.laboratoryTestOrderDetailsList.find((laboratoryTestOrderDetails: any) => laboratoryTestOrderDetails.scheduleIndicator === 'N') ? true : false
  }

  showOrderWithPrescriptionLabtestScheduleButton(orderWithPrescriptionDetailsIndex: number) {
    return this.catrDetails?.orderWithPrescriptionDetailsList[orderWithPrescriptionDetailsIndex].laboratoryTestOrderDetailsList.find((laboratoryTestOrderDetails: any) => laboratoryTestOrderDetails.scheduleIndicator === 'N') ? true : false
  }

  openlabtestSchedule(isOrderWithPrescription: boolean, orderWithPrescriptionDetailsIndex?: number) {
    const addLabtestScheduleData: any = {
      customerName: '',
      selectedLabTests: []
    }
    if (!isOrderWithPrescription) {
      this.catrDetails.laboratoryTestOrderDetailsList.forEach((laboratoryTestOrderDetails: any) => {
        if (laboratoryTestOrderDetails.scheduleIndicator === 'N') {
          const labtest = {
            laboratoryTestPackageCode: laboratoryTestOrderDetails.cartItemCode,
            laboratoryTestPackageDescription: laboratoryTestOrderDetails.laboratoryTestName,
            laboratoryTestSummaryList: laboratoryTestOrderDetails.laboratoryTestList,
            scheduleStatus: "",
            testCount: 0
          }
          addLabtestScheduleData.selectedLabTests.push(labtest)
        }
      })
    } else {
      if (orderWithPrescriptionDetailsIndex) {
        this.catrDetails?.orderWithPrescriptionDetailsList[orderWithPrescriptionDetailsIndex].laboratoryTestOrderDetailsList.forEach((laboratoryTestOrderDetails: any) => {
          if (laboratoryTestOrderDetails.scheduleIndicator === 'N') {
            const labtest = {
              laboratoryTestPackageCode: laboratoryTestOrderDetails.cartItemCode,
              laboratoryTestPackageDescription: laboratoryTestOrderDetails.laboratoryTestName,
              laboratoryTestSummaryList: laboratoryTestOrderDetails.laboratoryTestList,
              scheduleStatus: "",
              testCount: 0
            }
            addLabtestScheduleData.selectedLabTests.push(labtest)
          }
        })
      }
    }
    const state = {
      page: 'home/view-my-cart',
      isLabtest: true,
      addLabtestScheduleData: addLabtestScheduleData,
      addPhisicianScheduleData: {},
      indicator: 'Y'
    }
    const extras = { skipLocationChange: true, state };
    this.router.navigate(['/home/add-schedule'], extras)
  }



  placeOrder = async () => {
    const reqData: any = {
      apiRequest: {
        paymentIndicator: this.paymentIndicator === 'Success' ? 'Y' : this.paymentIndicator === 'Failure' ? 'N' : 'I',
        orderDate: new Date(),
      }
    }
    await this.viewMyCartService.PlaceOrder(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.toastr.success('Order placed successfully');
          this.viewMyCartService.updateCartItemCount()
          this.profile.updateNotificationCount()
          this.ngOnInit();
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Order couldn't place due some error");
        }
      })
  }

  ItemQuantityChange = async (data: any, option: string, quantity: any, ItemType: any, itemIndex: number, ItemQuantity?: number, isOrderWithPrescription?: boolean, orderWithPresIndex?: number) => {
    let Continue = true
    if (option === 'D') {
      if (quantity <= 1) {
        Continue = false
      }
    } else {
      if (ItemType === 'MD') {
        if (ItemQuantity) {
          if (quantity === ItemQuantity) {
            Continue = false;
            if (isOrderWithPrescription && orderWithPresIndex) {
              this.catrDetails.orderWithPrescriptionDetailsList[orderWithPresIndex].medicineOrderDetailsList[itemIndex].quantityErrMsg = `Medicine Quantity cannot be more than ${ItemQuantity}`
            } else {
              this.catrDetails.medicineOrderDetailsList[itemIndex].quantityErrMsg = `Medicine Quantity cannot be more than ${ItemQuantity}`
            }
          }
        } else {
          if (quantity >= 10) {
            Continue = false;
            if (isOrderWithPrescription && orderWithPresIndex) {
              this.catrDetails.orderWithPrescriptionDetailsList[orderWithPresIndex].medicineOrderDetailsList[itemIndex].quantityErrMsg = `Medicine Quantity cannot be more than 10`;
              setTimeout(() => {
                this.catrDetails.orderWithPrescriptionDetailsList[orderWithPresIndex].medicineOrderDetailsList[itemIndex].quantityErrMsg = '';
              }, 2000);
            } else {
              this.catrDetails.medicineOrderDetailsList[itemIndex].quantityErrMsg = `Medicine Quantity cannot be more than 10`
              setTimeout(() => {
                this.catrDetails.medicineOrderDetailsList[itemIndex].quantityErrMsg = '';
              }, 2000);
            }
          }
        }
      } else {
        if (quantity >= 15) {
          Continue = false;
          this.catrDetails.householdItemOrderDetailsList[itemIndex].quantityErrMsg = `Household Item Quantity cannot be more than 15`
          setTimeout(() => {
            this.catrDetails.householdItemOrderDetailsList[itemIndex].quantityErrMsg = '';
          }, 2000);
        }
      }
    }
    if (Continue) {
      const reqData: any = {
        apiRequest: {
          cartItemSeqNo: data,
          indicator: option,
          couponCode: this.cuponCode
        }
      }
      await this.viewMyCartService.ItemQuantity(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.ngOnInit()
            // this.viewMyCartService.updateCartItemCount()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Item quantity could not change due some error");
          }
        })
    }


  }

  ItemDelete = async (data: any) => {
    const reqData: any = {
      apiRequest: {
        userID: this.requestKeyDetails.userID,
        cartItemSeqNo: data,
        actionIndicator: "DEL",
        transactionResults: ""
      }
    }
    await this.viewMyCartService.ItemDelete(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.ngOnInit()
          this.viewMyCartService.updateCartItemCount()
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Item quantity could not change due some error");
        }
      })
  }

  async applycuponCode(couponCode: any) {
    if (couponCode && couponCode.length === 10) {
      const reqData: any = {
        apiRequest: {
          couponCode: couponCode,
          transactionResult: ""
        }
      }
      await this.viewMyCartService.AddCoupon(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.ngOnInit()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error("Item quantity could not change due some error");
          }
        })
    }
  }
  async deleteCouponCode() {
    const reqData: any = {
      apiRequest: {
      }
    }
    await this.viewMyCartService.RemoveCoupon(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.ngOnInit()
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error("Item quantity could not change due some error");
        }
      })
  }

  dateFormat(date: string) {
    return new Date(date);
  }

  checkPriceIsNegative(data: number) {
    if (data < 0) {
      return false;
    }
    return true;
  }

  getExpectedDeliveryDate() {
    return this.expectedDeliveryDate;
  }

  getCartDetails = async () => {
    const reqData: any = {
    }
    await this.viewMyCartService.ViewMyCart(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.cartError = false;
          this.catrDetails = res.apiResponse;
          this.addressDetails = res.apiResponse.addressDetails;
          this.addressDetails.deliveryServiceErrMsg = ''
          this.cartAddressID = res.apiResponse.addressDetails?.addressID ? res.apiResponse.addressDetails?.addressID : ''
          this.pricingDetails = res.apiResponse.cartItemPricingInformation;
          this.cuponCode = res.apiResponse.cartItemPricingInformation.couponCode ? res.apiResponse.cartItemPricingInformation.couponCode : '';
          this.cuponcodeIsApplied = res.apiResponse.cartItemPricingInformation.couponCode ? true : false;
          let medicinesTotalPrice = 0.00;
          let medicinesTotalCount = 0;
          this.catrDetails?.medicineOrderDetailsList?.forEach((medicineOrderDetails: any) => {
            medicinesTotalPrice = medicinesTotalPrice + medicineOrderDetails.medicineTotalPrice
            medicinesTotalCount = medicinesTotalCount + medicineOrderDetails.medicineQuantity
          })
          this.catrDetails.medicinesTotalPrice = medicinesTotalPrice
          this.catrDetails.medicinesTotalCount = medicinesTotalCount

          let labtestsTotalPrice = 0.00;
          let labtestsTotalCount = 0;
          this.catrDetails?.laboratoryTestOrderDetailsList?.forEach((laboratoryTestOrderDetails: any) => {
            if (laboratoryTestOrderDetails.scheduleIndicator === 'Y') {
              labtestsTotalPrice = labtestsTotalPrice + laboratoryTestOrderDetails.laboratoryTestTotalPrice
            }
            labtestsTotalCount = labtestsTotalCount + 1;
          })
          this.catrDetails.labtestsTotalPrice = labtestsTotalPrice
          this.catrDetails.labtestsTotalCount = labtestsTotalCount

          let physiciansTotalPrice = 0.00;
          this.catrDetails?.physicianConsultationOrderDetailsList?.forEach((physicianConsultationOrderDetails: any) => {
            physiciansTotalPrice = physiciansTotalPrice + physicianConsultationOrderDetails.consultationFee
          })
          this.catrDetails.physiciansTotalPrice = physiciansTotalPrice

          let houseHoldItemsTotalPrice = 0.00;
          let houseHoldItemsCount = 0;
          this.catrDetails?.householdItemOrderDetailsList?.forEach((householdItemOrderDetails: any) => {
            houseHoldItemsTotalPrice = houseHoldItemsTotalPrice + householdItemOrderDetails.householdItemTotalPrice
            houseHoldItemsCount = houseHoldItemsCount + householdItemOrderDetails.householdItemQuantity
          })
          this.catrDetails.houseHoldItemsTotalPrice = houseHoldItemsTotalPrice
          this.catrDetails.houseHoldItemsCount = houseHoldItemsCount
          let orderWithPrescriptionsTotalPrice = 0.00;
          let orderWithPrescriptionsTotalCount = 0;
          this.catrDetails?.orderWithPrescriptionDetailsList?.forEach((orderWithPrescriptionDetails: any) => {
            orderWithPrescriptionDetails?.medicineOrderDetailsList?.forEach((medicineOrderDetails: any) => {
              orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice + medicineOrderDetails.medicineTotalPrice
              orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount + medicineOrderDetails.medicineQuantity
            })
            orderWithPrescriptionDetails?.laboratoryTestOrderDetailsList?.forEach((laboratoryTestOrderDetails: any) => {
              if (laboratoryTestOrderDetails.scheduleIndicator === 'Y') {
                orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice + laboratoryTestOrderDetails.laboratoryTestTotalPrice
              }
              orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount + 1
            })
            orderWithPrescriptionDetails?.householdItemOrderDetailsList?.forEach((householdItemOrderDetails: any) => {
              orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice + householdItemOrderDetails.householdItemTotalPrice
              orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount + householdItemOrderDetails.householdItemQuantity
            })
          })
          this.catrDetails.orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice
          this.catrDetails.orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount
        } else {
          this.cartError = true;
          this.catrDetails = res.apiResponse;
          this.addressDetails = res.apiResponse.addressDetails;
          if (res.anamnesisErrorList.anErrorList[0].fieldName === 'searchkeyword') {
            this.addressDetails.deliveryServiceErrMsg = res.anamnesisErrorList.anErrorList[0].errorMessage
          }
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          this.cartAddressID = res.apiResponse.addressDetails?.addressID ? res.apiResponse.addressDetails?.addressID : ''
          this.pricingDetails = res.apiResponse.cartItemPricingInformation;
          this.cuponCode = res.apiResponse.cartItemPricingInformation.couponCode ? res.apiResponse.cartItemPricingInformation.couponCode : '';
          this.cuponcodeIsApplied = res.apiResponse.cartItemPricingInformation.couponCode ? true : false;
          let medicinesTotalPrice = 0.00;
          let medicinesTotalCount = 0;
          this.catrDetails?.medicineOrderDetailsList?.forEach((medicineOrderDetails: any) => {
            medicinesTotalPrice = medicinesTotalPrice + medicineOrderDetails.medicineTotalPrice
            medicinesTotalCount = medicinesTotalCount + medicineOrderDetails.medicineQuantity
          })
          this.catrDetails.medicinesTotalPrice = medicinesTotalPrice
          this.catrDetails.medicinesTotalCount = medicinesTotalCount

          let labtestsTotalPrice = 0.00;
          let labtestsTotalCount = 0;
          this.catrDetails?.laboratoryTestOrderDetailsList?.forEach((laboratoryTestOrderDetails: any) => {
            if (laboratoryTestOrderDetails.scheduleIndicator === 'Y') {
              labtestsTotalPrice = labtestsTotalPrice + laboratoryTestOrderDetails.laboratoryTestTotalPrice
            }
            labtestsTotalCount = labtestsTotalCount + 1;
          })
          this.catrDetails.labtestsTotalPrice = labtestsTotalPrice
          this.catrDetails.labtestsTotalCount = labtestsTotalCount

          let physiciansTotalPrice = 0.00;
          this.catrDetails?.physicianConsultationOrderDetailsList?.forEach((physicianConsultationOrderDetails: any) => {
            physiciansTotalPrice = physiciansTotalPrice + physicianConsultationOrderDetails.consultationFee
          })
          this.catrDetails.physiciansTotalPrice = physiciansTotalPrice

          let houseHoldItemsTotalPrice = 0.00;
          let houseHoldItemsCount = 0;
          this.catrDetails?.householdItemOrderDetailsList?.forEach((householdItemOrderDetails: any) => {
            houseHoldItemsTotalPrice = houseHoldItemsTotalPrice + householdItemOrderDetails.householdItemTotalPrice
            houseHoldItemsCount = houseHoldItemsCount + householdItemOrderDetails.householdItemQuantity
          })
          this.catrDetails.houseHoldItemsTotalPrice = houseHoldItemsTotalPrice
          this.catrDetails.houseHoldItemsCount = houseHoldItemsCount
          let orderWithPrescriptionsTotalPrice = 0.00;
          let orderWithPrescriptionsTotalCount = 0;
          this.catrDetails?.orderWithPrescriptionDetailsList?.forEach((orderWithPrescriptionDetails: any) => {
            orderWithPrescriptionDetails?.medicineOrderDetailsList?.forEach((medicineOrderDetails: any) => {
              orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice + medicineOrderDetails.medicineTotalPrice
              orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount + medicineOrderDetails.medicineQuantity
            })
            orderWithPrescriptionDetails?.laboratoryTestOrderDetailsList?.forEach((laboratoryTestOrderDetails: any) => {
              if (laboratoryTestOrderDetails.scheduleIndicator === 'Y') {
                orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice + laboratoryTestOrderDetails.laboratoryTestTotalPrice
              }
              orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount + 1
            })
            orderWithPrescriptionDetails?.householdItemOrderDetailsList?.forEach((householdItemOrderDetails: any) => {
              orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice + householdItemOrderDetails.householdItemTotalPrice
              orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount + householdItemOrderDetails.householdItemQuantity
            })
          })
          this.catrDetails.orderWithPrescriptionsTotalPrice = orderWithPrescriptionsTotalPrice
          this.catrDetails.orderWithPrescriptionsTotalCount = orderWithPrescriptionsTotalCount
        }
      })
      .catch((err: any) => {
        this.cuponCode = '';
        this.somthingWentWrong = true;
      })
  }

  onclickMedicineSelection() {
    this.showCartAddress = false;
    this.openHealthcareEquipmentSelectionModal = false;
    this.openLabTestSelectionModal = false;
    this.openOrderWithPrescriptinSelectionModal = false;
    this.openMedicineSelectionModal = true;
  }

  closePopupMedicineSelection = (data: any) => {
    this.openMedicineSelectionModal = false;
    if (data) {
      this.ngOnInit()
      this.viewMyCartService.updateCartItemCount()
    }
  }

  onclickLabTestSelection() {
    this.showCartAddress = false;
    this.openHealthcareEquipmentSelectionModal = false;
    this.openMedicineSelectionModal = false;
    this.openOrderWithPrescriptinSelectionModal = false;
    this.openLabTestSelectionModal = true;
  }

  closePopupLabTestSelection = (data: any) => {
    this.openLabTestSelectionModal = false;
    if (data) {
      this.ngOnInit()
      this.viewMyCartService.updateCartItemCount()
    }
  }

  onClickPopupHealthcareEquipmentSelection() {
    this.showCartAddress = false;
    this.openMedicineSelectionModal = false;
    this.openLabTestSelectionModal = false;
    this.openOrderWithPrescriptinSelectionModal = false;
    this.openHealthcareEquipmentSelectionModal = true;
  }

  closePopupHealthcareEquipmentSelection = (data: any) => {
    this.openHealthcareEquipmentSelectionModal = false;
    if (data) {
      this.ngOnInit()
      this.viewMyCartService.updateCartItemCount()
    }
  }

  onClickPopupOrderWithPrescriptionSelection() {
    this.showCartAddress = false;
    this.openMedicineSelectionModal = false;
    this.openLabTestSelectionModal = false;
    this.openHealthcareEquipmentSelectionModal = false;
    this.openOrderWithPrescriptinSelectionModal = true;
  }

  closePopupOrderWithPrescriptionSelection = (data: any) => {
    this.openOrderWithPrescriptinSelectionModal = false;
    if (data) {
      this.ngOnInit()
      this.viewMyCartService.updateCartItemCount()
    }
  }

  showMedicineDetails(medicineCode: any) {
    this.showMedicineCode = medicineCode;
    this.openmedicineDetailsModal = true;
  }

  closePopupMedicineDetails(data: any) {
    this.showMedicineCode = '';
    this.openmedicineDetailsModal = false;
    if (data) {
      this.getCartDetails()
    }
  }

  showHouseHoldItemDetails(houseHoldItemCode: any) {
    if (houseHoldItemCode) {
      this.showHouseHoldItemCode = houseHoldItemCode;
      this.openHouseHoldItemDetailsModal = true;
    }
  }

  closeHouseHoldItemDetails(data: any) {
    this.showHouseHoldItemCode = '';
    this.openHouseHoldItemDetailsModal = false;
    if (data) {
      this.getCartDetails()
    }
  }

  truncPrice(data: number) {
    return (Math.round(data * 100) / 100).toFixed(2);
  }

}
