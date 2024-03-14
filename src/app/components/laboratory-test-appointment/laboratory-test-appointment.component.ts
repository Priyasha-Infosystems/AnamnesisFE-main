import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { LocationSearchService } from '@services/location.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { Store } from 'redux';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-laboratory-test-appointment',
  templateUrl: './laboratory-test-appointment.component.html',
  styleUrls: ['./laboratory-test-appointment.component.css']
})
export class LaboratoryTestAppointmentComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  scheduleLabFormParam: FormGroup;
  LabTestList: Array<any> = [];
  filteredLabTestList: Array<any> = [];
  selectedLabTests: Array<any> = [];
  setTestError: boolean = false;
  labtestSelectionErrMSG: string = '';
  public currentDate: any;
  errorMessage: any = {};
  selectedLabTimeSlot: any = '';
  labTimeSlots: any = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
  public requestKeyDetails: any;
  slotOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' }
  ];
  displayData: any;
  //searchedDiagnosticCentre start---->
  searcDiagnosticCentre: any;
  diagnosticCentreList: Array<any> = [];
  showDiagnosticCentreDetails: boolean;
  selectedDiagnosticCentreDetails: any;
  oldDiagnosticCentreSearchValue: string;
  //searchedDiagnosticCentre <----end
  somthingWentWrong: boolean = false;
  caseLogdetails:any;
  constructor(
    private locationSearchService: LocationSearchService,
    private fb: FormBuilder,
    private formService: FormService,
    private commonService: CommonService,
    // private store: Store<any>,
    private physicianScheduleService: PhysicianScheduleService,
    private labtestReportUploadService: LabtestReportUploadService,
    private utilityService: UtilityService,
    private toastr: ToastrService,
    private caseLogService: CaseLogService,
  ) {
    this.intializingMessage()
  }
  getLocalTime() {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-US');
    const localTime = '00:00:01';
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    this.currentDate = timestamp;
  }

  formatDisplayData() {
    const data: string = this.WorkRequestDetails.wrDescription
    if (data.split('#').length === 7) {
      this.displayData = {
        customerUserCode: data.split('#')[1],
        customerName: data.split('#')[2],
        diagnosticCentreName: data.split('#')[3],
        appointmentDate: new Date(data.split('#')[4]),
        appointmentTime: this.utilityService.timeFormateInto12Hours(data.split('#')[5])
      }
    }
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.formatDisplayData()
    this.getLocalTime();
    this.scheduleLabFormParam = this.fb.group({
      patientUserID: [''],
      patientUserCode: [''],
      customerName: [''],
      diagnosticCentreID: [''],
      diagnosticCentreName: [''],
      diagnosticCentreSearch: [''],
      selectedSlot: ['morning'],
      appointmentDate: ['', [Validators.required, Validators.pattern(
        /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/
      )]],
      appointmentTime: ['', [Validators.required]],
      transactionResult: [''],
      test: ['']
    });
    if (this.displayData) {
      this.mapTimeSlotAndTime(this.displayData.appointmentTime)
    }
    this.getLabTestList();
    this.scheduleLabFormParam.get('diagnosticCentreName')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searcDiagnosticCentre = response;
        if (response && response.length > 2 && this.scheduleLabFormParam.get('diagnosticCentreSearch')?.value === true) {
          this.oldDiagnosticCentreSearchValue = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.labtestReportUploadService.searchDiagnosticCentre(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.diagnosticCentreCount > 0) {
                this.diagnosticCentreList = res.apiResponse.diagnosticCentreDetailsViewList;
              } else {
                this.diagnosticCentreList = [];
              }
            })
            .catch((err: any) => {
              this.diagnosticCentreList = [];
            })
        } else {
          this.diagnosticCentreList = [];
        }
      })
    this.GetLTADetails()
    this.getCaseLog();
  }

  dateFormat(data:any){
    return new Date(data)
  }
  getCaseLog= async()=>{
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode
      }
    };
    await this.caseLogService.GetCaseLOG(reqData)
    .then(async (res: any) => {
      if (!this.commonService.isApiError(res)) {
          this.caseLogdetails = res.apiResponse
      } else {
        if(res.anamnesisErrorList.dbModificationInd=== 'Y'){
          this.toastr.error('Please try again');
        }else{
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
        }
      }
    })
    .catch((err: any) => {
      if(err.status !== 401){
      this.toastr.error("Case logs couldn't fetch due some error");
      }
    })
  }

  mapTimeSlotAndTime(appointmentTime: string) {
    if (appointmentTime.length === 7) {
      appointmentTime = `0${appointmentTime}`
    }
    const morningSlot: Array<any> = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
    const afternoonSlot: Array<any> = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
    const eveningSlot: Array<any> = ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM']
    const ifMorningSlot = morningSlot.find(res => res == appointmentTime)
    const ifAfternoonSlot = afternoonSlot.find(res => res == appointmentTime)
    if (ifMorningSlot) {
      this.labTimeSlots = morningSlot;
      this.scheduleLabFormParam.get('selectedSlot')?.setValue('morning');
    } else {
      if (ifAfternoonSlot) {
        this.labTimeSlots = afternoonSlot;
        this.scheduleLabFormParam.get('selectedSlot')?.setValue('afternoon');
      } else {
        this.labTimeSlots = eveningSlot;
        this.scheduleLabFormParam.get('selectedSlot')?.setValue('evening');
      }
    }
    this.scheduleLabFormParam.get('appointmentTime')?.setValue(appointmentTime);
    this.selectedLabTimeSlot = appointmentTime;
  }

  // diagnosticCentreSearch start ---->
  selectDiagnosticCentre(diagnosticCentre: any) {
    this.showDiagnosticCentreDetails = true;
    this.selectedDiagnosticCentreDetails = diagnosticCentre;
    this.scheduleLabFormParam.get('diagnosticCentreName')?.setValue(diagnosticCentre.diagnosticCentreName);
    this.scheduleLabFormParam.get('diagnosticCentreErrMsg')?.setValue('');
    this.scheduleLabFormParam.get('diagnosticCentreSearch')?.setValue(false);
    if (this.scheduleLabFormParam.get('diagnosticCentreName')?.disabled) {
      this.scheduleLabFormParam.get('diagnosticCentreName')?.disable();
    }
  }
  unSelectDiagnosticCentre() {
    this.showDiagnosticCentreDetails = false;
    this.selectedDiagnosticCentreDetails = {};
    this.scheduleLabFormParam.get('diagnosticCentreName')?.setValue(this.oldDiagnosticCentreSearchValue);
    this.scheduleLabFormParam.get('diagnosticCentreSearch')?.setValue(false);
    this.scheduleLabFormParam.get('diagnosticCentreName')?.enable();
  }

  selectDiagnosticCentreSchedule() {
    this.scheduleLabFormParam.get('diagnosticCentreID')?.setValue(this.selectedDiagnosticCentreDetails.diagnosticCentreID);
    this.scheduleLabFormParam.get('diagnosticCentreName')?.setValue(this.selectedDiagnosticCentreDetails.diagnosticCentreName);
    if (this.scheduleLabFormParam.get('diagnosticCentreName')?.disabled) {
      this.scheduleLabFormParam.get('diagnosticCentreName')?.disable();
    }
    this.scheduleLabFormParam.get('diagnosticCentreSearch')?.setValue(false);
    this.showDiagnosticCentreDetails = false;
    this.selectedDiagnosticCentreDetails = {};
  }

  unSelectDiagnosticCentreSchedule() {
    this.scheduleLabFormParam.get('diagnosticCentreName')?.setValue(this.oldDiagnosticCentreSearchValue);
    this.scheduleLabFormParam.get('diagnosticCentreID')?.setValue('');
    this.scheduleLabFormParam.get('diagnosticCentreName')?.enable();
    this.scheduleLabFormParam.get('diagnosticCentreSearch')?.setValue(false);
  }

  onTypeDiagnosticCentreName() {
    this.scheduleLabFormParam.get('diagnosticCentreSearch')?.setValue(true);
  }
  // diagnosticCentreSearch start ---->
  GetLTADetails = async () => {
    const reqData: any = {
      apiRequest: {
        actionIndicator: '',
        transactionResult: '',
        workRequestID: this.WorkRequestDetails.caseCode
      }
    }
    this.physicianScheduleService.GetLTADetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.selectedLabTests = res.apiResponse.labtestAppoinmentCreationList;
          this.displayData = {
            customerUserCode: res.apiResponse.customeruserCode,
            customerName: res.apiResponse.customerName,
            diagnosticCentreName: res.apiResponse.diagnosticCentreName,
            appointmentDate: new Date(res.apiResponse.appointmentDate),
            appointmentTime: this.utilityService.timeFormateInto12Hours(res.apiResponse.appointmentTime)
          }
          this.scheduleLabFormParam.get('appointmentDate')?.setValue(res.apiResponse.appointmentDate);
          this.mapTimeSlotAndTime(this.displayData.appointmentTime)
        } else {
          this.somthingWentWrong = true
        }
      })
      .catch((err: any) => {
        this.somthingWentWrong = true
      })
  }

  getLabTestList = async () => {
    const reqData: any = {
      apiRequest: {
        resultType: 'V',
        searchKeyword: ''
      }
    }
    this.LabTestList = [];
    await this.labtestReportUploadService.getLabtestList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.LabTestList = res.apiResponse.laboratoryTestSearchList;
          this.filteredLabTestList = res.apiResponse.laboratoryTestSearchList;
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Lab test List couldn't fetch due some error");
        }
      })
  }

  filterLabtestList(searchKeyword: string) {
    const filterValue = searchKeyword.toLowerCase();
    this.filteredLabTestList = this.LabTestList.filter(option =>
      option.laboratoryTestName.toLowerCase().indexOf(filterValue) > -1);
  }

  selectLabtest(labtest: any) {
    this.setTestError = false;
    if (this.selectedLabTests.find((res: any) => res.laboratoryTestCode === labtest.laboratoryTestCode)) {
      this.labtestSelectionErrMSG = 'This laboratory test already selected';
      setTimeout(() => this.labtestSelectionErrMSG = '', 1500);
    } else {
      this.selectedLabTests.push(labtest)
      this.scheduleLabFormParam.get('test')?.setValue('');
      this.filteredLabTestList = this.LabTestList;
    }
  }

  removelabtest(selectedLabTestIndex: number) {
    this.selectedLabTests.splice(selectedLabTestIndex, 1)
  }

  checkValidLabDate() {
    const dateControl = this.scheduleLabFormParam.get('appointmentDate');
    if (dateControl!.value && new Date(dateControl!.value).getTime() > this.currentDate) {
      dateControl!.setValue('')
    }
  }

  getLabTestNames() {
    const tests: any = []
    this.selectedLabTests.forEach((test: any) => {
      tests.push(test.laboratoryTestName)
    })
    return tests
  }

  getLabReqObj(data: any) {
    const apiReq = {
      // patientUserID: this.requestKeyDetails.userID,
      // patientUserCode: this.requestKeyDetails.userCode,
      workRequestID:this.WorkRequestDetails.caseCode,
      diagnosticCentreName: data.diagnosticCentreName,
      diagnosticCentreID: data.diagnosticCentreID,
      customerName: this.displayData.customerName,
      customeruserCode: this.displayData.customerUserCode,
      labtestAppoinmentCreationList: this.selectedLabTests,
      appointmentDate: data.appointmentDate,
      appointmentTime: this.utilityService.timeFormateInto24Hours(data.appointmentTime),
      transactionResult: '',
      indicator: ''
    }
    return apiReq;
  }

  submitLabSchedule(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.scheduleLabFormParam);
    if (this.selectedLabTests.length === 0) {
      this.setTestError = true;
      return
    }
    if (isValid) {
      const reqData: any = {
        apiRequest: this.getLabReqObj(data),
      }
      this.physicianScheduleService.LTASubmission(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            window.scrollTo(0, 0);
            this.toastr.success("Schedule to booked successfully");
            this.close.emit(true);
          } else {
            this.toastr.error("Something went wrong");
          }
        })
        .catch((err: any) => {
        })
    }
  }

  setLabTimeSlots() {
    this.scheduleLabFormParam.get('appointmentTime')?.setValue('');
    this.selectedLabTimeSlot = "";
    const val = this.scheduleLabFormParam.get('selectedSlot')?.value;
    if (val == 'morning') {
      this.labTimeSlots = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
    }
    if (val == 'afternoon') {
      this.labTimeSlots = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
    }
    if (val == 'evening') {
      this.labTimeSlots = ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM']
    }
  }

  setSelectedLabTimeSlot(slot: any) {
    this.selectedLabTimeSlot = slot === this.selectedLabTimeSlot ? '' : slot;
    this.scheduleLabFormParam.get('appointmentTime')?.setValue(this.selectedLabTimeSlot);
  }

  checkIsLabSelected(slot: any) {
    if (slot === this.selectedLabTimeSlot) {
      return true;
    }
    return false;
  }

  intializingMessage() {
    this.errorMessage.appointmentDate = {
      required: "Appointment date is required",
      pattern: "Please enter a valid date",
    };
    this.errorMessage.appointmentTime = {
      required: "Appointment time is required",
    };
  }

  closePopup() {
    this.close.emit(false);
  }
}
