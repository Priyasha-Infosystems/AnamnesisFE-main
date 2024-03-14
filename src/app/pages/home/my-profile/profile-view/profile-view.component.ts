import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LOCAL_STORAGE } from '@constant/constants';
import { select, Store } from '@ngrx/store';
import { AddressService } from '@services/address.service';
import { CommonService } from '@services/common.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { ProfileService } from '@services/profile.service';
import { UtilityService } from '@services/utility.service';
import { setCompanyDetails, setProfileDetails } from 'src/store/actions/profile.actions';
import { relationTypeDetails } from 'src/store/actions/utility.actions';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {

  @Input() enabledPages: any;
  @Output()
  setEditProfile: EventEmitter<{}> = new EventEmitter<{}>();

  profileDocumentList: any = [];
  businessData: any;
  companyData: any;
  generalData: any;
  hospitalisationDetails: any;
  medicalHistoryDetails: any;
  personalData: any;
  physicanCredentials: any;
  documentTypeDetailsList: any = [];
  homeAddress: any;
  companyAddress: any;
  blankAddress: boolean = false;
  openModal: boolean = false;
  selectedAddress: any = null;
  stateList: any = [];

  alternateUserId: string = "";
  userId: any = "";

  public editEnabled = true;
  public picurl: string;
  commercialTypeSet: boolean = false;
  commercialTypes: any = [];

  relationshipData: any = {
    FH: "Father",
    MH: "Mother",
    BH: "Brother",
    ST: "Sister",
    UC: "Uncle",
    GM: "Grand Mother",
    GF: "Grand Father",
  };
  relationOptionList:any = [];

  genderData: any = {
    M: "Male",
    F: "Female",
    O: "Others",
  };

  maritialStatusData: any = {
    S: "Single",
    M: "Married",
    O: "Others",
  };

  generalSelection: any = {
    Y: "Yes",
    N: "No"
  }

  thyroidData: any = {
    N: "Normal",
    H: "Hypo",
    R: "Hyper"
  }

  bpData: any = {
    H: "High",
    N: "Normal",
    L: "Low"
  }

  constructor(
    private profileService: ProfileService,
    private commonService: CommonService,
    private store: Store<any>,
    public addressService: AddressService,
    private router: Router,
    private localStorageService: LocalStorageService,
    public datePipe: DatePipe,
    private utilityService: UtilityService,
  ) { 
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      this.relationOptionList = val.relationList;
    })
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getrelationOptionList()
    this.setAlternateId();
  }

  async getrelationOptionList(){
    if(!this.relationOptionList.length){
      await this.profileService.getFamilyRelationList()
      .then(async (res: any) => {
        this.relationOptionList = res.apiResponse
        await this.store.dispatch(new relationTypeDetails(res.apiResponse));
        await this.store.pipe(select('commonUtility')).subscribe(async val => {
          this.relationOptionList = val.relationList;
        })
      })
      .catch((err: any) => {
      })
    }
  }

  async getLastUpdateInformation() {
    await this.profileService.getLastUpdateInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const profileScreenDataList = res.apiResponse.userProfileSectionList;
          this.enabledPages = [];
          profileScreenDataList.forEach((profile: any) => {
            if (profile.screenCode !== "MPFL") {
              if (profile.screenAvailability === "Y") {
                this.enabledPages.push(profile.screenCode);
              }
            }
          });
          this.getProfileViewData();
        }
      })
      .catch((err: any) => {
      })
  }

  async setAlternateId() {
    const id: any = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.ALTERNATE_USER_ID) || "";
    this.userId = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    if (id) {
      this.alternateUserId = id;
    }
    this.getLastUpdateInformation();
  };

  getProfileViewData() {
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val?.executedUtility && val?.commercialDetailsList.length > 0 && !this.commercialTypeSet) {
        val?.commercialDetailsList.forEach((data: any) => {
          this.commercialTypes.push(data);
        });
        this.commercialTypeSet = true;
      }
    })
    if (this.getProfileIndex('BUSI') > 0) {
      this.getProfileBusinessInformation();
    }
    if (this.getProfileIndex('CINF') > 0) {
      this.getCompanyInformation();
    }
    if (this.getProfileIndex('DOCU') > 0) {
      this.getProfileDocInformation();
    }
    if (this.getProfileIndex('GMED') > 0) {
      this.getGeneralInformation();
    }
    if (this.getProfileIndex('HOSP') > 0) {
      this.getHospitilizationDetails();
    }
    if (this.getProfileIndex('FMMD') > 0) {
      this.getMedicalHistory();
    }
    if (this.getProfileIndex('PINF') > 0) {
      this.getPersonalInformation();
    }
    if (this.getProfileIndex('PCRD') > 0) {
      this.getPhysicianCredentialDetails();
    }
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.documentDetailsFetched) {
        this.documentTypeDetailsList = val.documentTypeDetailsList;
      }
    });
    this.getStateDetails();
  }

  getStateDetails = async () => {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility && val?.utility?.stateCodeList?.stateCodeCount > 0) {
        this.stateList = val.utility.stateCodeList.stateCodeList;
      }
    })
  }

  getProfileIndex(id: any) {
    return this.enabledPages.indexOf(id) + 1;
  }

  getProfileBusinessInformation = async () => {
    await this.profileService.getBusinessInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.businessData = { ...res.apiResponse };
          const index = this.commercialTypes.findIndex((com: any) => com.commercialTypeCode === this.businessData.commercialType)
          const comTypeDescription = this.commercialTypes[index].commercialTypeDescription
          this.businessData.commercialTypeDescription = comTypeDescription
        }
      })
      .catch((err: any) => {
      })
  }

  getCompanyInformation = async () => {
    await this.profileService.getCompanyInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.companyData = { ...res.apiResponse };
          this.store.dispatch(new setCompanyDetails(this.companyData));
          this.companyAddress = this.companyData.addressDetails;
        }
      })
      .catch((err: any) => {
      })
  }

  getProfileDocInformation = async () => {
    await this.profileService.GetDocumentList()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.profileDocumentList = [...res.apiResponse];
        }
      })
      .catch((err: any) => {
      })
  }

  getGeneralInformation = async () => {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        laboratoryTestID:'',
        transactionResult:''
      }
    };
    await this.profileService.getGeneralMedicalInfo(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.generalData = this.buildObject({ ...res.apiResponse.anUpdateGeneralMedicalInfoRequest });
        }
      })
      .catch((err: any) => {
      })
  }

  buildObject = (arr: any) => {
    // const userIndicator = arr.userOtherIndicator.split("");
    const obj: any = {
      HT: arr.userHeight ? arr.userHeight + ' ' + 'cms' : '',
      WT: arr.userWeight ? arr.userWeight + ' ' + 'kgs' : '',
      BG: arr.userBloodGroup,
      DB: this.generalSelection[arr.diabeticInd],
      TH: this.thyroidData[arr.thyroidInd],
      SM: this.generalSelection[arr.smokingInd],
      AL: this.generalSelection[arr.alcoholInd],
      BP: this.bpData[arr.pressureInd],
      userTemperature: arr.userTemperature,
      userPulse: arr.userPulse,
      userPressure: arr.userPressure
    };
    return obj;
  };

  getHospitilizationDetails = async () => {
    await this.profileService.getPreviousHospitalisationInfo()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.hospitalisationDetails = [...res.apiResponse];
        }
      })
      .catch((err: any) => {
      })
  }

  getMedicalHistory = async () => {
    await this.profileService.getFamilyMedicalHistory()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicalHistoryDetails = [...res.apiResponse];
        }
      })
      .catch((err: any) => {
      })
  }

  getPersonalInformation = async () => {
    await this.profileService.getPersonalInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.personalData = { ...res.apiResponse };
          this.homeAddress = this.personalData.addressDetails;
          this.store.dispatch(new setProfileDetails(this.personalData));
        }
      })
      .catch((err: any) => {
      })
  }

  getPhysicianCredentialDetails = async () => {
    await this.profileService.getPhysicianCredentialsDetails()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.physicanCredentials = { ...res.apiResponse };
        }
      })
      .catch((err: any) => {
      })
  }

  getDocumentName(fileName: any) {
    if (this.documentTypeDetailsList.length > 0) {
      const selectedDoc = this.documentTypeDetailsList.find((doc: any) => doc.documentType === fileName);
      return selectedDoc?.documentTypeDescription || "";
    }
    return ""
  }

  getFullName(firstName?: any, middleName?: any, lastName?: any) {
    if (!middleName) {
      middleName = '';
    };
    let nameArray = [firstName, middleName, lastName];
    nameArray = nameArray.filter(Boolean);
    return nameArray.join(' ');
  }

  getOpeningDays(days: any) {
    if (days && days.length > 0) {
      const totalDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const openDays: any = [];
      days.forEach((day: any, index: any) => {
        if (day == "Y") {
          openDays.push(totalDays[index]);
        }
      });
      return openDays.join(', ');
    }
    return "";
  }

  openAddress(address: any) {
    if (address) {
      this.selectedAddress = address;
      this.openModal = true;
    }
  }

  closePopup() {
    this.getProfileViewData();
    this.selectedAddress = null;
    this.openModal = false;
  }

  navigateAddress() {
    this.router.navigate(['/home/manage-address'], { skipLocationChange: true });
  }

  setEdit() {
    this.setEditProfile.emit();
  }

  isDataFetched(arr: any) {
    if (arr?.length > 0) {
      return true;
    }
    return false;
  }

  formatDate(date: any) {
    return date && date.length > 0 ? this.datePipe.transform(date, 'dd-MM-y') : '';
  }

  getTime(time: any) {
    return time ? this.utilityService.timeFormateInto12Hours(time) : ''
  }

  getRelation(data:any){
    const relationship = this.relationOptionList.find((res:any)=>res.relationshipCode === data)
    if(relationship){
      return relationship.relationshipDescription
    }
    return ''
  }

}
