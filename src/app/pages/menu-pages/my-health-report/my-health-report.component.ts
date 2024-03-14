import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LOCAL_STORAGE } from '@constant/constants';
import { Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { ProfileService } from '@services/profile.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { setProfileDetails } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-my-health-report',
  templateUrl: './my-health-report.component.html',
  styleUrls: ['./my-health-report.component.css']
})
export class MyHealthReportComponent implements OnInit {

  genMedInfo: any = {};
  personalInfo: any = {};
  age: string = "";
  userId: any = ""
  mySchedule: any = [];
  accordionArray: any = [];
  currentDate: any = new Date();
  isCompletedSchedule: boolean = false;
  isConfirmedSchedule: boolean = false;
  selectedSchedule: any = {};
  showPrescription: boolean = false;
  showPrescriptionID: any = '';
  showHealthReportUpdatePopup: boolean;
  showHideOne: boolean = false;
  showHideTwo: boolean = false;
  showHideThree: boolean = false;
  genderData: any = {
    M: "Male",
    F: "Female",
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
  patientConsultainComponentRefresh: boolean = false;
  constructor(
    private profileService: ProfileService,
    private commonService: CommonService,
    private store: Store<any>,
    private localStorage: LocalStorageService,
    private physicianScheduleService: PhysicianScheduleService,
    private utilityService: UtilityService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.getUserDetails();
    this.getPersonalInformation();
    this.getSchedule();
  }

  async getUserDetails() {
    this.userId = await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    this.getGeneralInformation();
  }

  getSchedule = async () => {
    await this.physicianScheduleService.getUserSchedule()
      .then(async (res: any) => {
        this.mySchedule = []
        if (!this.commonService.isApiError(res) && res.apiResponse.appoinmentCount > 0) {
          this.mySchedule = res.apiResponse.userAppointmentList;
          this.accordionArray.push(this.mySchedule[0].uniqueID);
        }
      })
      .catch((err: any) => {
      })
  }

  getPersonalInformation = async () => {
    await this.profileService.getPersonalInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const personalData = { ...res.apiResponse };
          personalData.gender = res.apiResponse.gender ? res.apiResponse.gender : "";
          personalData.maritialStatus = res.apiResponse.maritialStatus ? res.apiResponse.maritialStatus : "";
          this.personalInfo = personalData;
          this.store.dispatch(new setProfileDetails(personalData));
          this.age = this.commonService.calculateAge(personalData.dateOfBirth);
        }
      })
      .catch((err: any) => {
      })
  }

  getGeneralInformation = async () => {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        laboratoryTestID: '',
        transactionResult: ''
      }
    };
    await this.profileService.getGeneralMedicalInfo(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const generalData = { ...res.apiResponse };
          this.genMedInfo = this.buildObject(generalData.anUpdateGeneralMedicalInfoRequest);
        }
      })
      .catch((err: any) => {
      })
  }

  buildObject = (arr: any) => {
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
      userPressure: arr.userPressure,
      GM23019910: '',
      GM23019920: '',
      GM23019930: '',
      GM23019940: '',
      GM23019950: '',
      GM23019960: '',
    };
    arr.generalLabtestDiabeticInfomrationList.forEach((res: any) => {
      obj[res.laboratoryTestCode] = res.laboratoryTestValue
    })
    arr.generalLabtestThyroidInfomrationList.forEach((res: any) => {
      obj[res.laboratoryTestCode] = res.laboratoryTestValue
    })
    console.log(obj)
    return obj;
  }

  isAccordionVisible(date: any) {
    const index = this.accordionArray.indexOf(date);
    if (index >= 0) {
      return true;
    }
    return false;
  }

  setAccordion(date: any) {
    const index = this.accordionArray.indexOf(date);
    if (index >= 0) {
      this.accordionArray.splice(index, 1);
    } else {
      this.accordionArray.push(date);
    }
  }

  dateFormat(date: string) {
    return new Date(date);
  }

  formatTime(timeStr: any) {
    const [hours, minutes] = timeStr.split(':');
    let hoursNum = parseInt(hours);
    const amPm = hoursNum >= 12 ? 'PM' : 'AM';
    if (hoursNum > 12) {
      hoursNum -= 12;
    } else if (hoursNum === 0) {
      hoursNum = 12;
    }
    return `${hoursNum}:${minutes} ${amPm}`;
  }

  isPastSchedule(date: string) {
    const dt = this.utilityService.getTimeStamp(date, '11:59:59 PM');
    if (dt < this.currentDate.getTime()) {
      return true;
    }
    return false;
  }

  scheduleEvent(schedule: any, isConfirm?: boolean) {
    this.selectedSchedule = schedule;
    if (isConfirm) {
      this.isCompletedSchedule = true;
    } else {
      this.isConfirmedSchedule = true;
    }
  }

  missedAppointment = () => {
    const reqData: any = {
      apiRequest: { ...this.selectedSchedule },
    }
    const refSchedule = { ...this.selectedSchedule }
    this.physicianScheduleService.missedAppointment(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const state = {
            page: '/menu-pages/my-health-report',
            isLabtest: false,
            addLabtestScheduleData: {},
            addPhisicianScheduleData: refSchedule,
          }
          const extras = { skipLocationChange: true, state };
          this.router.navigate(['/home/add-schedule'], extras)
        } else {
          this.toastr.error("Something went wrong");
        }
      })
      .catch((err: any) => {
      })
  }

  completionAppointment = () => {
    const reqData: any = {
      apiRequest: { ...this.selectedSchedule },
    }
    const refSchedule = { ...this.selectedSchedule }
    this.physicianScheduleService.completionAppointment(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.toastr.success("Request completed successfully");
          this.ngOnInit();
        } else {
          this.toastr.error("Something went wrong");
        }
      })
      .catch((err: any) => {
      })
  }

  confirmSubmission() {
    if (this.isCompletedSchedule) {
      this.completionAppointment()
    } else {
      this.missedAppointment()
    }
    this.resetPopup();
  }

  prescriptionView(prescriptionID: any) {
    this.showPrescription = true;
    this.showPrescriptionID = prescriptionID;
  }
  closePrescription() {
    this.showPrescription = false;
    this.showPrescriptionID = '';
  }

  resetPopup() {
    this.isCompletedSchedule = false;
    this.isConfirmedSchedule = false;
    this.selectedSchedule = {};
  }

  openHealthReportUpdatePopup() {
    this.showHealthReportUpdatePopup = true;
  }

  closeHealthReportUpdatePopup(data: any) {
    this.showHealthReportUpdatePopup = false;
    if (data) {
      this.getUserDetails()
      if (data === 'Y') {
        this.patientConsultainComponentRefresh = true;
        setTimeout(() => {
          this.patientConsultainComponentRefresh = false;
        }, 500);
      }
    }
  }
  boxshowHide(key: string) {
    if (key == "One") {
      this.showHideOne = !this.showHideOne
      this.showHideTwo = false
      this.showHideThree = false
    }
    else if (key == "Two") {
      this.showHideTwo = !this.showHideTwo
      this.showHideOne = false
      this.showHideThree = false
    }
    else if (key == "Three") {
      this.showHideThree = !this.showHideThree
      this.showHideOne = false
      this.showHideTwo = false
    }
  }
}
