import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_TEST } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { MedicineDetailsService } from '@services/medicine-details.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { IMadicineDetails } from 'src/app/models/medicine-details.model';
import * as xml2js from 'xml2js';
@Component({
  selector: 'app-medicine-details',
  templateUrl: './medicine-details.component.html',
  styleUrls: ['./medicine-details.component.css']
})
export class MedicineDetailsComponent implements OnInit {
  @Input()
  medicineCode: string;
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_TEST;
  public medicineDetails: any = {};
  public safetyMeasuresList: Array<any>;
  public sideEffectList: Array<any>;
  public somthingWentWrong: boolean = false;
  public openMedicineEditPopupModal: boolean = false;
  public editMedicineCode: any = '';
  public IsEditButtonShow:boolean = false;
  public cartAddressDetails:any;
  private isMedAddtoCartFromDetails:boolean = false;
  public isItemAlreadyInCart:boolean = false;
  constructor(
    private medicineDetailsService: MedicineDetailsService,
    private toastr: ToastrService,
    private router: Router,
    public commonService: CommonService,
    private medicineSelectionService: MedicineSelectionService,
    private viewMyCartService: ViewMyCartService,
  ) {

   }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.IsEditButtonShow = this.requestKeyDetails.userRoleList.find((val: any) => val.roleCode === 'ADM' ||val.roleCode === 'ADU' ||val.roleCode === 'ADR' || val.roleCode === 'SAD'|| val.roleCode === 'PHR') ? true : false;
    })
    this.getMedicineDetails(this.medicineCode);
    this.getCartAddress();
  }

  getFile(data:any){
    return `${this.imageBaseUrl}${data.fileType}/${data.fileName}`
  }

  editeMedicine(medicineCode: any) {
    this.openMedicineEditPopupModal = true;
    this.editMedicineCode = medicineCode;
  }

  closeEditeMedicine(data: any) {
    this.openMedicineEditPopupModal = false;
    this.editMedicineCode = '';
    if (data) {
      this.getMedicineDetails(this.medicineCode);
    }
  }

  getMedicineDetails = async (medicineCode: string) => {
    const reqData: any = {
      apiRequest: { medicineCode }
    }
    await this.medicineDetailsService.getMedicineDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicineDetails = res.apiResponse;
          this.medicineCode = res.apiResponse.medicineCode;
          if(this.medicineDetails.safetyAdviceInformationList){
            this.safetyMeasuresList = this.medicineDetails.safetyAdviceInformationList
          }
          if(this.medicineDetails.sideEffects){
            this.sideEffectList = this.sideEffectsParseXml(this.medicineDetails.sideEffects)
          }
          this.checkItemInCart(medicineCode);
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
        this.somthingWentWrong = true;
        this.toastr.error("Medicine Details couldn't fetch due some error");
        }
      })
  }

  async checkItemInCart(medicineCode: string){
    const reqData: any = {
      apiRequest: { itemCode:medicineCode ,itemType:'MED'}
    }
    await this.viewMyCartService.checkItemInCart(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.isItemAlreadyInCart = res.apiResponse.itemAlreadyExists
          ;
        }
      })
      .catch((err: any) => {
        this.isItemAlreadyInCart = false;
        if(err.status !== 401){
          
        }
      })
  }

  closeMedicnePopup() {
    this.close.emit(this.isMedAddtoCartFromDetails);
  }

  private safetyMeasuresParseXml(xmlStr: any) {
    const safetyMeasures: Array<any> = []
    const parser = new xml2js.Parser({
      trim: true,
      explicitArray: true
    });
    parser.parseString(xmlStr, function (err, result) {
      if (result.SAFETYMEASURES !== '') {
        result.SAFETYMEASURES.EVENTDETAILS.forEach((val: any, index: number) => {
          const tempSafetyMeasure = {
            details: val.DETAILS[0],
            event: val.EVENT[0],
            icon: `img/icon/${val.EVENT[0]}.png`
          }
          safetyMeasures.push(tempSafetyMeasure)
        })
      }
    })
    return safetyMeasures
  }

  sideEffectsParseXml(xmlStr: any) {
    const sideEffects: Array<any> = []
    const parser = new xml2js.Parser({
      trim: true,
      explicitArray: true
    });
    parser.parseString(xmlStr, function (err, result) {
      if (result?.SIDEEFFECTS !== '') {
        result?.SIDEEFFECTS?.EFFECTS?.forEach((val: any, index: number) => {
          sideEffects.push(val)
        })
      }
    })
    return sideEffects
  }

  medicineAddToCart = async (data: any) => {
    if(this.isItemAlreadyInCart){
      setTimeout(() => {
        this.router.navigate(['home/view-my-cart'])
      }, 50);
      this.closeMedicnePopup();
    }else{
    const reqData: any = {
      apiRequest: []
    }
    const tempMedicine = {
      userID: this.requestKeyDetails.userID,
      cartItemSeqNo: '',
      itemType: 'MD',
      itemCode: data.medicineCode,
      packageID: '',
      quantity: 1,
      addressID: this.cartAddressDetails.addressID,
      couponCode: '',
      itemStatus:data.medicineStatus,
      actionIndicator: 'ADD',
      transactionResult: '',
      itemCategory: data.medicineCategory,
    }
    reqData.apiRequest.push(tempMedicine);
    await this.medicineSelectionService.addToCart(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.viewMyCartService.updateCartItemCount()
          this.toastr.success(`Medicine move to cart`);
          this.isMedAddtoCartFromDetails = true;
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if (err.status !== 401) {
          this.toastr.error(`Medicine couldn't move to cart due some error`);
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
