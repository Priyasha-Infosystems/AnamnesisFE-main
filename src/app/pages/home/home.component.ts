import { Component, OnInit } from '@angular/core';
import { CommonService } from '@services/common.service';
import { SecurityQuestionService } from '@services/securityQuestions.service';
import { Store } from '@ngrx/store';
import { isSecQuestionSet } from 'src/store/actions/profile.actions';
import { ProfileService } from '@services/profile.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { LOCAL_STORAGE } from '@constant/constants';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isCustomizeUserEdit: boolean = false;
  alternateUserId: string = "";
  defaultAlternateUserId: string = "";
  userId: any = "";
  activeMenu: string = "";

  constructor(
    private commonService: CommonService,
    public secQuestionService: SecurityQuestionService,
    private store: Store<any>,
    private profileService: ProfileService,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.commonService.updateUserMenuList();
    this.getUserSecQuestionList();
  }

  async getUserSecQuestionList() {
    await this.secQuestionService.GetUserSecQuestions()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const questionsList = res.apiResponse.userSecQuestionsList;
          if (questionsList && questionsList.length > 0) {
            this.store.dispatch(new isSecQuestionSet(true));
          }
        }
      })
      .catch((err: any) => {
      })
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.setAlternateId();
    this.router.events.subscribe(() => {
      this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
    });
    this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
  }

  async setAlternateId() {
    const id: any = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.ALTERNATE_USER_ID) || "";
    this.userId = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    if (id) {
      this.alternateUserId = id;
      this.defaultAlternateUserId = id;
    }
  };

  showCustomizeUserId() {
    this.isCustomizeUserEdit = !this.isCustomizeUserEdit;
  }

  cancelCustomizeUserId() {
    this.alternateUserId = this.defaultAlternateUserId;
    this.showCustomizeUserId();
  }

  async setAlternateUserId() {
    if ((this.alternateUserId === this.defaultAlternateUserId) || (this.alternateUserId === "" && this.defaultAlternateUserId === "")) {
      this.showCustomizeUserId();
      return
    }
    if (this.alternateUserId !== this.userId) {
      const reqData: any = {
        apiRequest: {
          alternateUserID: this.alternateUserId,
          actionIndicator: ""
        }
      }
      if (this.alternateUserId !== "" && this.defaultAlternateUserId === "") {
        reqData.apiRequest.actionIndicator = "ADD"
      } else if (this.alternateUserId === "" && this.defaultAlternateUserId !== "") {
        reqData.apiRequest.actionIndicator = "DEL"
        reqData.apiRequest.alternateUserID = this.defaultAlternateUserId
      } else if (this.alternateUserId !== this.defaultAlternateUserId) {
        reqData.apiRequest.actionIndicator = "UPD"
      }
      await this.profileService.updateAlternateUserID(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            await this.localStorageService.setDataInIndexedDB(
              LOCAL_STORAGE.ALTERNATE_USER_ID,
              this.alternateUserId
            );
            this.defaultAlternateUserId = this.alternateUserId;
            this.showCustomizeUserId();
          } else {
            if (res.anamnesisErrorList.anErrorCount > 0) {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            } else {
              this.toastr.error("Couldn't update the Alternate User Id");
            }
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Couldn't update the Alternate User Id");
          }
        })
    } else {
      this.toastr.error("Alternate User Id can't be same as User Id");
    }
  }

  getHeader() {
    let label = ''
    switch (this.activeMenu) {
      case 'my-profile':
        label = 'My Profile';
        break;
      case 'upload-health-document':
        label = 'Upload Health Document';
        break;
      case 'manage-address':
        label = 'Manage Address';
        break;
      case 'authorize-prescription':
        label = 'Authorize Prescription';
        break;
      case 'user-setup':
        label = 'Bulk User Setup';
        break;
      case 'add-schedule':
        label = 'Add Schedule';
        break;
      case 'physician-schedule':
        label = 'Physician Schedule';
        break;
      case 'diagnostic-center-schedule':
        label = 'Diagnostic Center Schedule';
        break;
      case 'auth-signatory-addition':
        label = 'Authorised Signatory Addition';
        break;
      case 'physician-calendar':
        label = 'Physician Calendar';
        break;
      case 'general-medical-information-update':
        label = 'General Medical Information';
        break;
      case 'security-question':
        label = 'Security Question';
        break;
      case 'change-password':
        label = 'Change Password';
        break;
      case 'my-order-list':
        label = 'My order list';
        break;
      case 'order-details':
        label = 'Order details';
        break;
      case 'view-my-cart':
        label = 'view my cart';
        break;
      case 'order-pick-up':
        label = 'Order Pickup';
        break;
      case 'labtest-report-creat':
        label = 'Create Laboratory Test Report';
        break;
      case 'price-setup':
        label = 'Price Setup';
        break;
      case 'welcome':
        label = 'Welcome';
        break;
      default:
        break;
    }
    return label;
  }

  alternateUserIdLowerCase(data:string){
    if(data && data.length){
      this.alternateUserId = data.toLowerCase();
    }
  }

}