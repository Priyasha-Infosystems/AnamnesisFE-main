import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LOCAL_STORAGE } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-general-information',
  templateUrl: './profile-general-information.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileGeneralInformationComponent implements OnInit {

  public generalInformationParam: FormGroup;
  generalInformationError: any = "";
  errorMessage: any = {};
  userID: any;
  defaultUserOtherIndicator: string = 'XXXXX'

  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  reqArray: any = ['DB', 'TH', 'SM', 'AL', 'BP']

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
  ) {
    this.generalInformationParam = this.fb.group({
      HT: ['', [Validators.required, Validators.pattern('[0-9]{1,3}')]],
      isHTChange:[false],
      WT: ['', [Validators.required, Validators.pattern('[0-9]{1,3}')]],
      isWTChange:[false],
      BG: [''],
      isBGChange:[false],
      DB: [''],
      isDBChange:[false],
      TH: [''],
      isTHChange:[false],
      SM: [''],
      isSMChange:[false],
      AL: [''],
      isALChange:[false],
      BP: [''],
      isBPChange:[false],
      userTemperature: [''],
      isuserTemperatureChange:[false],
      userPulse: [''],
      isuserPulseChange:[false],
      userPressure: [''],
      isuserPressureChange:[false],
    });
  }

  resetError() {
    this.generalInformationError = "";
  }

  onValueChanges(key:string){
    const formControllName = `is${key}Change`;
    this.generalInformationParam.get(formControllName)?.setValue(true)
  }

  onChanges(): void {
    this.generalInformationParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.onChanges()
    this.intializingMessage();
    this.getUserId();
  }

  async getUserId() {
    this.userID = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    this.getGeneralInformation();
  }

  intializingMessage() {
    this.errorMessage.HT = {
      required: "Height is required",
      pattern: "Please enter a valid Height"
    };
    this.errorMessage.WT = {
      required: "Weight is required",
      pattern: "Please enter a valid Weight"
    };
    this.errorMessage.BP = {
      required: "Blood Pressure is required"
    };
    this.errorMessage.BG = {
      required: "Blood Group is required"
    };
    this.errorMessage.SF = {
      required: "Sugar (Fasting) is required"
    };
    this.errorMessage.SP = {
      required: "Suger (PP) is required"
    };
    this.errorMessage.TH = {
      required: "Thyroid is required"
    };
    this.errorMessage.PL = {
      required: "Pulse is required"
    };
  }

  getGeneralInformation = async () => {
    const reqData: any = {
      apiRequest: {
        customerID: this.userID,
        laboratoryTestID:'',
        transactionResult:''
      }
    };
    await this.profileService.getGeneralMedicalInfo(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const generalData = { ...res.apiResponse };
          const responseArr: any = this.buildObject(generalData.anUpdateGeneralMedicalInfoRequest)
          this.generalInformationParam.patchValue(responseArr);
        }
      })
      .catch((err: any) => {
      })
  }

  buildObject = (arr: any) => {
    // const userIndicator = arr.userOtherIndicator.split("");
    const obj: any = {
      HT: arr.userHeight,
      WT: arr.userWeight,
      BG: arr.userBloodGroup,
      DB: arr.diabeticInd,
      TH: arr.thyroidInd,
      SM: arr.smokingInd,
      AL: arr.alcoholInd,
      BP: arr.pressureInd,
      userTemperature: arr.userTemperature,
      userPulse: arr.userPulse,
      userPressure: arr.userPressure
    };
    return obj;
  };

  postReqObj(data: any) {
    const reqData = { ...data }
    for (const key in reqData) {
      switch (key) {
        case 'DB':
            if (reqData[key] && reqData[`is${key}Change`]) {
              this.defaultUserOtherIndicator = this.defaultUserOtherIndicator.substring(0, 0) + reqData[key] + this.defaultUserOtherIndicator.substring(0 + 1);
            }
            break;
          case 'TH':
            if (reqData[key] && reqData[`is${key}Change`]) {
              this.defaultUserOtherIndicator = this.defaultUserOtherIndicator.substring(0, 1) + reqData[key] + this.defaultUserOtherIndicator.substring(1 + 1);
            }
            break;
          case 'SM':
            if (reqData[key] && reqData[`is${key}Change`]) {
              this.defaultUserOtherIndicator = this.defaultUserOtherIndicator.substring(0, 2) + reqData[key] + this.defaultUserOtherIndicator.substring(2 + 1);
            }
            break;
          case 'AL':
            if (reqData[key] && reqData[`is${key}Change`]) {
              this.defaultUserOtherIndicator = this.defaultUserOtherIndicator.substring(0, 3) + reqData[key] + this.defaultUserOtherIndicator.substring(3 + 1);
            }
            break;
          case 'BP':
            if (reqData[key] && reqData[`is${key}Change`]) {
              this.defaultUserOtherIndicator = this.defaultUserOtherIndicator.substring(0, 4) + reqData[key] + this.defaultUserOtherIndicator.substring(4 + 1);
            }
            break;
      
        default:
          break;
      }
    }
    const apiReqObj = {
      userID: this.userID,
      commercialID: '',
      userHeight: reqData.isHTChange?reqData.HT?reqData.HT:'':'',
      userWeight: reqData.isWTChange?reqData.WT?reqData.WT:'':'',
      userBloodGroup: reqData.isBGChange?reqData.BG?reqData.BG:'':'',
      userTemperature: '',
      userPulse: '',
      userPressure: '',
      diabeticInd: '',
      thyroidInd: '',
      smokingInd: '',
      alcoholInd: '',
      pressureInd: '',
      userOtherIndicator: this.defaultUserOtherIndicator,
      // laboratoryTestResultList: [],
      generalLabtestDiabeticInfomrationList:[],
      generalLabtestThyroidInfomrationList:[],
      recorddate: new Date()
    }
    return apiReqObj;
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.generalInformationParam);
    this.resetError();
    if (isValid) {
      this.postReqObj(data)
      const reqData = {
        apiRequest: this.postReqObj(data)
      }
      await this.profileService.insertGeneralMedicalInformation(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.generalInformationError = err.error.message;
        })
    }
  }

  isDataSelected(key: string) {
    let control = <any>this.generalInformationParam.value[key];
    if (control !== "" && control !== "X") {
      return true;
    }
    return false;
  }

}
