import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { LoginService } from '@services/login.service';
import { CommonService } from '@services/common.service';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '@services/utility.service';
import { BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { ProfileService } from '@services/profile.service';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { debounceTime } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  activeProfileMenuList: any = [];
  isProfileCompleted: boolean;
  isSecQuestionesSet: boolean;
  isAddressSet: boolean;
  userName: string = "";
  displayName: string = "";
  isShowProfileModal: boolean = false;
  profilePicUrl: string = "../../../assets/images/profile-pic-dummy.png";
  profilePicDetails: any ;
  isProfilePicFetched: boolean
  public requestKeyDetails: any;
  public IsCartNotShow: boolean = false;
  public showSenescenceCare: boolean = false;
  walletBalance: any = 0;
  cartItemCount: any = 0;
  notificationCount: any = 0;
  notifications: Array<any>;
  WalletDetailsPopup: boolean = false;
  notificationOpen: boolean = false;
  DownNotification: boolean = false
  constructor(
    private router: Router,
    private store: Store<any>,
    private loginService: LoginService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private profileService: ProfileService,
    private viewMyCartService: ViewMyCartService,

  ) {
    
  }

  openWalletDetailsPopup() {
    this.WalletDetailsPopup = true;
  }
  closeWalletDetailsPopup(data: any) {
    if (data === false) {
      this.WalletDetailsPopup = false;
    }
  }

  openMenue() {
    this.showSenescenceCare = false;
  }

  getFormattedName(name: string) {
    let formattedName = ''
    if (name) {
      if (name.length < 15) {
        formattedName = name;
      } else {
        formattedName = `${name.substring(0, 15)}...`
      }
    }
    return formattedName
  }

  async ngOnInit() {
    await this.store.pipe(select('profileState')).subscribe(async val => {
      this.isSecQuestionesSet = val.isSecQuestionesSet;
      this.isProfileCompleted = val.isProfileCompleted;
      this.isAddressSet = val.profileDetails?.addressDetails?.addressID || val.companyDetails?.addressDetails?.addressID ? true : false;
      this.userName = val.profileDetails.firstName ?? val.companyDetails.legalBusinessName ?? ""
      this.displayName = val.profileDetails.displayName ?? val.companyDetails.legalBusinessName ?? ""
    })
    this.commonService.getUtilityService();
    this.getProfileMenu();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.IsCartNotShow = res.userRoleList.find((val: any) => val.roleCode === 'PHH' || val.roleCode === 'DCH' || val.roleCode === 'HCH') ? true : false;
    })
    this.getCartItemCount()
    this.getNotification()
    this.viewMyCartService.cartChangeInd
    .pipe(debounceTime(1000))
      .subscribe(res => {
        if (res) {
          this.getCartItemCount()
        }
      })
    this.profileService.notificationChangeInd
    .pipe(debounceTime(1000))
      .subscribe(res => {
        if (res) {
          this.getNotification()
        }
      })
  }
  checkAndNavigate(){
    if(this.isSecQuestionesSet && this.isProfileCompleted && this.isAddressSet){
      this.router.navigate(['menu-pages/my-health-report'], { skipLocationChange: true });
    }
  }

  async notificationRead(notificationID:any,notificationReadIndicator:any){
    if(notificationReadIndicator === 'N'){
    const reqData: any = {
      apiRequest: {
        notificationID:notificationID
      }
    };
    await this.profileService.NotificationRead(reqData)
    .then(async (res: any) => {
      if (!this.commonService.isApiError(res)) {
        if(res.apiResponse.transactionResult==='Success'){
          const index = this.notifications.findIndex((res:any)=>res.notificationID === notificationID)
          if(index>-1){
            this.notifications[index].notificationReadIndicator = 'Y'
          }
        }
      } 
    })
    }
  }

  dateFormat(date:any){
    return new Date(date);
  }

  timeFormat(time:string){
    const formatedTimeArr = time.split(':');
    return `${formatedTimeArr[0]}:${formatedTimeArr[1]}`
  }

  async getCartItemCount() {
    const reqData: any = {
      apiRequest: {
      }
    };
    await this.profileService.GetCartItemCount(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.cartItemCount = res.apiResponse;
        } else {
          this.cartItemCount = 0
        }
      })
      .catch((err: any) => {
        this.cartItemCount = 0
      })
  }

  async getNotification() {
    const reqData: any = {
      apiRequest: {
      }
    };
    await this.profileService.GetNotification(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.notificationCount = res.apiResponse.notificationCount;
          this.notifications = res.apiResponse.appNotificationDetailsList;
        } else {
          this.notificationCount = 0;
          this.notifications = []
        }
      })
      .catch((err: any) => {
        this.notificationCount = 0
        this.notifications = []
      })
  }

  truncPrice(data: number) {
    if (data < 10000) {
      return (Math.round(data * 100) / 100).toFixed(2);
    } else {
      return '9999+'
    }
  }

  async getProfileMenu() {
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.userMenuListsFetched && val.userMenuLists.userMenuCount > 0) {
        const setMenuList: any = [];
        val.userMenuLists.userMenuScreenList.forEach((menuList: any) => {
          if (menuList.screenAvailability === "Y") {
            setMenuList.push(menuList.screenCode);
          }
        })
        this.activeProfileMenuList = [...setMenuList];
        this.profilePicDetails =val.userMenuLists.profilePictureDetails;
        this.isProfilePicFetched = val.userMenuLists.profilePictureDetails.fileName ? true : false;
      }
    })
  }

  async logOut() {
    await this.loginService.logOut()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
        }
      })
      .catch((err: any) => {
      })
    this.router.navigate(['/login'], { skipLocationChange: true });
    this.utilityService.handleClearStore();
  }

  navigateTo(key: string) {
    window.scrollTo(0, 0);
    if (key === 'home/my-profile') {
      this.router.navigate([`/${key}`], { skipLocationChange: true });
    } else if (this.isProfileCompleted && !this.isAddressSet) {
      this.router.navigate([`/home/manage-address`], { skipLocationChange: true });
      this.toastr.error('Please add the address first');
    } else if (this.isProfileCompleted && this.isSecQuestionesSet) {
      this.router.navigate([`/${key}`], { skipLocationChange: true });
    } else if (this.isProfileCompleted && !this.isSecQuestionesSet) {
      this.toastr.error('Please complete the Security Question setup first');
      this.router.navigate([`/home/security-question`], { skipLocationChange: true });
    } else {
      window.scrollTo(0, 0);
      this.toastr.error('Please complete the Profile setup first');
      this.router.navigate([`/home/my-profile`], { skipLocationChange: true });
    }
    // this.router.navigate([`/${key}`], { skipLocationChange: true });
  }

  openSenescenceCare() {
    this.showSenescenceCare = true;
  }

  closeSenescenceCare(data: any) {
    this.showSenescenceCare = false;
    if (data) {
      this.router.navigate([`/home/my-profile`], { skipLocationChange: true });
    }
  }

  setClasses() {
    let className = "";
    if (document.body.className.indexOf('modal-open') !== -1) {
      className = "headerPadding";
    }
    return className;
  }

  isAvailableMenu(key: string) {
    if (this.activeProfileMenuList.indexOf(key) > -1) {
      return true;
    }
    return false;
  }

  setProfileModal() {
    this.isShowProfileModal = !this.isShowProfileModal
  }

  OpenNotification() {
    if(this.notifications.length){
      this.notificationOpen = !this.notificationOpen;
      setTimeout(() => {
        this.DownNotification = !this.DownNotification
      }, 100);
      if(!this.notificationOpen){
        this.notifications = this.notifications.filter((res:any)=>res.notificationReadIndicator === 'N');
        this.notificationCount = this.notifications.length;
      }
    }
  }

}
