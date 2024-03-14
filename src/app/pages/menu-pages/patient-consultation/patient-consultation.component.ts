import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { ProfileService } from '@services/profile.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-patient-consultation',
  templateUrl: './patient-consultation.component.html',
  styleUrls: ['./patient-consultation.component.css']
})
export class PatientConsultationComponent implements OnInit {
  showPatientInformation: boolean = false;
  showGeneratePrescriptionModal: boolean = false;
  generatePrescriptionDetails: any;
  oldGeneratePrescriptionDetails: any;
  DrDisplayName: string;
  searchPatientFormGroup: FormGroup;
  showPatientDetails: boolean = false;
  selectedPatientDetails: any = {};
  imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  requestKeyDetails: any;
  patientList: any = [];
  searchPatient: any;

  patientSchedulelist: any = [];
  selectedSchedule: any = {};

  showPrescription: boolean = false;
  showPrescriptionID: string;


  userId: any = ""

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

  genMedInfo: any = {};
  age: string = "";
  showConfirmationPopup: boolean = false;
  currentDate:any = 0;
  constructor(
    private fb: FormBuilder,
    private labtestReportUploadService: LabtestReportUploadService,
    public commonService: CommonService,
    private profileService: ProfileService,
    private store: Store<any>,
    private physicianScheduleService: PhysicianScheduleService,
    private toastr: ToastrService,
    public datePipe: DatePipe,
    public utility: UtilityService,
  ) {
    this.getLocalTime()
   }

  getLocalTime() {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-US');
    const localTime = '23:59:59';
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    this.currentDate = timestamp;
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    });

    this.store.pipe(select('profileState')).subscribe(async val => {
      this.DrDisplayName = val.profileDetails.displayName;
    })
    this.initForm();
    this.getPhysicianAppointmentList();
  }

  getPhysicianAppointmentList = async () => {
    const reqData: any = {
      apiRequest: {
      }
    };
    await this.physicianScheduleService.getPhysicianAppointmentList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.patientSchedulelist = [];
          if (res.apiResponse.appointmentCount > 0) {
            const dateList: any = [];
            res.apiResponse.healthClinicScheduleList.forEach((scheduleList: any) => {
              if (dateList.indexOf(scheduleList.scheduleDate) < 0) {
                dateList.push(scheduleList.scheduleDate);
              }
            })
            dateList.forEach((date: any) => {
              const selectedDateSchedule = res.apiResponse.healthClinicScheduleList.filter((list: any) => list.scheduleDate === date);
              this.patientSchedulelist.push(selectedDateSchedule);
            })
          }
        }
      })
      .catch((err: any) => {
      })
  }

  getTime(time: any) {
    const [hours, minutes, seconds] = time.split(":");
    const date = new Date();
    date.setHours(+hours);
    date.setMinutes(+minutes);
    date.setSeconds(+seconds);

    const options: any = { hour: 'numeric', minute: 'numeric', hour12: true };
    const time12 = date.toLocaleTimeString('en-US', options);

    return time12;
  }

  openConfirmation(event?: any, schedule?: any) {
    if (event) {
      event.preventDefault();
    }
    this.selectedSchedule = {};
    if (schedule) {
      this.selectedSchedule = schedule;
    }
    this.showConfirmationPopup = !this.showConfirmationPopup;
  }

  confirmSchedule = async () => {
    const reqData: any = {
      apiRequest: {
        physicianCode: this.requestKeyDetails.userCode,
        patientCode: this.selectedSchedule.userCode,
        appointmentDate: this.selectedSchedule.appointmentDate,
        appointmentTime: this.selectedSchedule.appointmentTime,
        appointmentStatus: '',
      }
    };
    await this.physicianScheduleService.confirmAppointmentCompletion(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.toastr.success("The scheduled appointment is completed successfully");
          this.getPhysicianAppointmentList();
        } else {
          this.toastr.error("Something went wrong");
        }
        this.selectedSchedule = {};
        this.showConfirmationPopup = !this.showConfirmationPopup;

      })
      .catch((err: any) => {
      })
  }

  getGeneralInformation = async (id: any,healthClinicID?:string,visitDate?:any) => {
    const reqData: any = {
      apiRequest: {
        customerID: id,
        laboratoryTestID:'',
        transactionResult:''
      }
    };
    await this.profileService.getGeneralMedicalInfo(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const generalData = { ...res.apiResponse };
          this.genMedInfo = this.buildObject(generalData.anUpdateGeneralMedicalInfoRequest);
          this.generatePrescriptionDetails = {
            patientName: this.selectedPatientDetails.displayName,
            patientUserCode: this.selectedPatientDetails.userCode,
            patientID: this.selectedPatientDetails.userID,
            dateOfBirth: this.selectedPatientDetails.dateOfBirth,
            gender: this.selectedPatientDetails.gender,
            physicianName: this.DrDisplayName,
            physicianUserID: this.requestKeyDetails.userID,
            physicianUserCode: this.requestKeyDetails.userCode,
            healthClinicName: '',
            healthClinicID: healthClinicID?healthClinicID:'',
            genMedInfo: generalData.anUpdateGeneralMedicalInfoRequest,
            visitDate:visitDate?visitDate:'',

          };
          if(healthClinicID){
            this.generatePrescriptionModal(false)
          }
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
      userPressure: arr.userPressure
    };
    return obj;
  };

  initForm() {
    this.searchPatientFormGroup = this.fb.group({
      'searchKey': ['']
    })
    this.searchPatientFormGroup.get('searchKey')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searchPatient = response;
        if (this.searchPatient && this.searchPatient.length > 2) {
          const reqData: any = {
            apiRequest: {
              searchKeyword: this.searchPatient,
            },
          }
          await this.labtestReportUploadService.searchPatient(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.patientCount > 0) {
                this.patientList = res.apiResponse.patientDetailsViewList;
              } else {
                this.patientList = [];
              }
            })
            .catch((err: any) => {
              this.patientList = [];
            })
        } else {
          this.patientList = [];
        }
      })
  }

  selectPatientForDetails(healthClinicID?:string,visitDate?:any) {
    if(healthClinicID){
      this.getGeneralInformation(this.selectedPatientDetails.userID,healthClinicID,visitDate);
    }else{
      this.getGeneralInformation(this.selectedPatientDetails.userID);
    }

    this.age = this.commonService.calculateAge(this.selectedPatientDetails.dateOfBirth);
    this.showPatientDetails = false;
    this.showPatientInformation = true;
  }

 async OpenPrescriptionWithHealthClinic(healthClinicID:any,patientUserID:any,visitDate:any){
  const dt = this.utility.getTimeStamp(visitDate, '00:00:01 AM');
  if (dt < this.currentDate) {
    this.clearSearch()
    const reqData: any = {
      apiRequest: {
        searchKeyword: patientUserID,
      },
    }
    await this.labtestReportUploadService.searchPatient(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res) && res.apiResponse.patientCount > 0) {
          this.selectedPatientDetails = res.apiResponse.patientDetailsViewList[0];
          this.selectPatientForDetails(healthClinicID,visitDate);
        } else {
          this.toastr.error('Somthisg went Wrong, Please try after sometime');
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error('Somthisg went Wrong, Please try after sometime');
        }
      })
  }
   
  }

  unSelectPatient() {
    this.showPatientDetails = false;
    this.oldGeneratePrescriptionDetails = this.selectedPatientDetails;
    this.selectedPatientDetails = {};
  }

  selectPatient(Patient: any) {
    this.searchPatientFormGroup.get('searchKey')?.setValue(this.searchPatient);
    this.showPatientDetails = true;
    this.selectedPatientDetails = Patient;
  }

  clearSearch() {
    this.showPatientInformation = false;
    this.selectedPatientDetails = {};
    this.oldGeneratePrescriptionDetails = {};
  }

  generatePrescriptionModal(withOutHealthClinic:boolean) {
    if(!this.generatePrescriptionDetails?.patientID){
      this.generatePrescriptionDetails=this.oldGeneratePrescriptionDetails
    }
    if(withOutHealthClinic){
      this.generatePrescriptionDetails.healthClinicID = '';
    }
    this.showGeneratePrescriptionModal = true;
  }

  closePrescriptionModal(data:any){
    this.showGeneratePrescriptionModal = false;
    this.oldGeneratePrescriptionDetails = {...this.generatePrescriptionDetails};
    this.generatePrescriptionDetails= {};
    if(data){
      this.showPatientDetails = false;
      this.showPatientInformation = false;
      setTimeout(() => {
        this.showPatientInformation = true;
      }, 10);
    }
  }

  getCompletionStatus(status: any) {
    if (status !== 'N') {
      return true
    }
    return false
  }

  prescriptionView(prescriptionID: any) {
    this.showPrescription = true;
    this.showPrescriptionID = prescriptionID;
  }
  closePrescription() {
    this.showPrescription = false;
    this.showPrescriptionID = '';
  }

  dateFormat(date: string) {
    return new Date(date);
  }

  isToday(date: string) {
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? "";
    if (date === today) {
      return ' (Today)'
    }
    return ''
  }

  isLastIndex(length: any, index: any) {
    if (length > 1 && index !== length - 1) {
      return true
    }
    return false
  }

  isOlderDate(date: any) {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const otherDate = new Date(date);
    const otherDateOnly = new Date(otherDate.getFullYear(), otherDate.getMonth(), otherDate.getDate());
    if (otherDateOnly >= todayDate) {
      return true;
    }
    return false;
  }

  getArrivalStatus(data: any) {
    if(data.arrivalStatus === 'Y'){
      if(data.gmiStatus === 'Y'){
        return 'bi-check-square-fill'
      }else{
        return 'bi-exclamation-square-fill'
      }
    }else{
      return 'bi-question-square-fill'
    }
  }

  getTooltipText(data: any) {

    if(data.arrivalStatus === 'Y'){
      if(data.gmiStatus === 'Y'){
        return 'Arrived and health info updated'
      }else{
        return 'Arrived'
      }
    }else{
      return 'Not arrived yet'
    }
  }

}
