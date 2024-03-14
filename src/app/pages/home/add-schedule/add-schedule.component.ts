import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { LocationSearchService } from '@services/location.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-schedule',
  templateUrl: './add-schedule.component.html',
  styleUrls: ['./add-schedule.component.css']
})
export class AddScheduleComponent implements OnInit {

  consultationView: boolean = true;
  labTestView: boolean = false;
  showDiagnosticCentre: boolean = false;
  showPhysicianSchedule: boolean = false;
  searchResults: any[];
  consultationFormGroup: FormGroup;
  scheduleFormParam: FormGroup;
  scheduleLabFormParam: FormGroup;
  selectedTimeSlot: any = '';
  selectedLabTimeSlot: any = '';
  selectedLabTests: Array<any> = [];
  errorMessage: any = {};
  labtestSelectionErrMSG: string = '';
  slotOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' }
  ];
  timeSlots: any = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
  labTimeSlots: any = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
  public requestKeyDetails: any;
  displayName: string = "";
  public currentDate: any;
  public LabTestList: Array<any> = [];
  public filteredLabTestList: Array<any> = [];
  setTestError: boolean = false;
  routeData: any;
  setClientError: boolean = false;

  constructor(
    private locationSearchService: LocationSearchService,
    private fb: FormBuilder,
    private formService: FormService,
    private commonService: CommonService,
    private store: Store<any>,
    private physicianScheduleService: PhysicianScheduleService,
    private labtestReportUploadService: LabtestReportUploadService,
    private utilityService: UtilityService,
    private toastr: ToastrService,
    private location: Location,
    private router: Router,
  ) {
    this.getLocalTime();
    this.store.pipe(select('profileState')).subscribe(async val => {
      this.displayName = val.profileDetails.displayName ?? val.companyDetails.legalBusinessName ?? ""
    })
    this.routeData = this.router.getCurrentNavigation()!.extras.state
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

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })

    this.initForm();
    this.scheduleFormParam = this.fb.group({
      patientUserID: [''],
      patientUserCode: [''],
      customerName: [''],
      healthClinicID: [''],
      healthClinicName: [''],
      physicianUserCode: [''],
      physicianName: [''],
      selectedSlot: ['morning'],
      appointmentDate: ['', [Validators.required, Validators.pattern(
        /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/
      )]],
      appointmentTime: ['', [Validators.required]],
      transactionResult: [''],
    });
    this.scheduleLabFormParam = this.fb.group({
      patientUserID: [''],
      patientUserCode: [''],
      customerName: [''],
      diagnosticCentreID: [''],
      diagnosticCentreName: [''],
      selectedSlot: ['morning'],
      appointmentDate: ['', [Validators.required, Validators.pattern(
        /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/
      )]],
      appointmentTime: ['', [Validators.required]],
      transactionResult: [''],
      test: ['']
    });
    if (this.routeData) {
      if (this.routeData.isLabtest) {
        this.setConsultationView(false)
        this.selectedLabTests = this.routeData.addLabtestScheduleData.selectedLabTests;
        this.scheduleLabFormParam.get('customerName')?.setValue(this.routeData.addLabtestScheduleData.customerName)
        this.scheduleLabFormParam.get('test')?.disable();
      } else {
        this.setConsultationView(true)
        const phyScheduleData = { ...this.routeData.addPhisicianScheduleData }
        phyScheduleData.appointmentTime = this.utilityService.timeFormateInto12Hours(phyScheduleData.appointmentTime)
        phyScheduleData.healthClinicName = phyScheduleData.displayName
        this.mapTimeSlotAndTime(phyScheduleData.appointmentTime)
        this.scheduleFormParam.patchValue(phyScheduleData)
        this.checkValidDate()
      }
    }
    this.intializingMessage();
    this.onChanges();
    this.getLabTestList();
  }

  getLabTestList = async () => {
    const reqData: any = {
      apiRequest: { medicineKeyword: '' }
    }
    this.LabTestList = [];
    await this.labtestReportUploadService.getLabtestList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.LabTestList = res.apiResponse.laboratoryTestPackageList;
          this.filteredLabTestList = res.apiResponse.laboratoryTestPackageList;
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
      option.laboratoryTestPackageDescription.toLowerCase().indexOf(filterValue) > -1);
  }

  selectLabtest(labtest: any) {
    this.setTestError = false;
    if (this.selectedLabTests.find((res: any) => res.laboratoryTestPackageCode === labtest.laboratoryTestPackageCode)) {
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

  onChanges(): void {
    // this.scheduleFormParam.valueChanges.subscribe(val => {
    //   this.setClientError = false
    //   this.checkValidDate();
    // });
    // this.scheduleLabFormParam.valueChanges.subscribe(val => {
    //   this.checkValidLabDate();
    // });
  }

  checkValidDate() {
    const dateControl = this.scheduleFormParam.get('appointmentDate');
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '11:59:59 PM') < this.currentDate) {
      dateControl!.setValue('')
      this.scheduleFormParam.get('selectedSlot')?.setValue('morning')
      this.scheduleFormParam.get('appointmentTime')?.setValue('')
      this.selectedTimeSlot = "";
    }
  }
  checkLabValidDate() {
    const dateControl = this.scheduleLabFormParam.get('appointmentDate');
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '11:59:59 PM') < this.currentDate) {
      dateControl!.setValue('')
      this.scheduleLabFormParam.get('selectedSlot')?.setValue('morning')
      this.scheduleLabFormParam.get('appointmentTime')?.setValue('')
      this.selectedLabTimeSlot = "";
    }
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

  initForm() {
    this.consultationFormGroup = this.fb.group({
      searchQuery: ['']
    })
    this.consultationFormGroup.get('searchQuery')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        if (response) {
          this.search(response);
        }
      })
  }

  search(response: any) {
    this.locationSearchService.getAddresses(response).subscribe((addressResponse) => {
      this.searchResults = addressResponse;
    });
  }

  setConsultationView(flag: boolean) {
    this.consultationView = flag;
    this.labTestView = !flag;
    // this.showDiagnosticCentre = false;
    // this.showPhysicianSchedule = false;
  }

  // selectDiagnosticCentreSchedule() {
  //   // set selected DiagnosticCentre first
  //   this.showDiagnosticCentre = true;
  //   this.consultationView = false;
  //   this.labTestView = false;
  // }

  // selectPhysicianSchedule() {
  //   // set selected DiagnosticCentre first
  //   this.showPhysicianSchedule = true;
  //   this.consultationView = false;
  //   this.labTestView = false;
  // }

  setConsultAddress(address: any) {
    this.consultationFormGroup.get('searchQuery')?.setValue(address);
  }

  getReqObj(data: any) {
    const apiReq = {
      patientUserID: this.requestKeyDetails.userID,
      patientUserCode: this.requestKeyDetails.userCode,
      customerName: this.displayName,
      healthClinicID: '',
      healthClinicName: data.healthClinicName,
      physicianUserCode: '',
      physicianName: data.physicianName,
      appointmentDate: data.appointmentDate,
      appointmentTime: this.utilityService.timeFormateInto24Hours(data.appointmentTime),
      transactionResult: '',
    }
    return apiReq;
  }

  generateAppointmentRequest = (data: any) => {
    const reqData: any = {
      apiRequest: this.getReqObj(data),
    }
    this.physicianScheduleService.generateAppointmentRequest(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          window.scrollTo(0, 0);
          this.toastr.success("Your request to book Physician's Appointment is registered successfully");
          this.scheduleFormParam.reset()
          this.scheduleFormParam.get('selectedSlot')?.setValue('morning')
          this.selectedTimeSlot = "";
          this.timeSlots = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
          if (this.routeData) {
            this.router.navigate([this.routeData.page], { skipLocationChange: true })
          }
        } else {
          this.toastr.error("Something went wrong");
        }
      })
      .catch((err: any) => {
      })
  }

  submitSchedule(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.scheduleFormParam);
    if (data.healthClinicName === "" && data.physicianName === "") {
      this.setClientError = true
    } else if (isValid) {
      this.generateAppointmentRequest(data)
    }
  }

  setTimeSlots() {
    this.scheduleFormParam.get('appointmentTime')?.setValue('');
    this.selectedTimeSlot = "";
    const val = this.scheduleFormParam.get('selectedSlot')?.value;
    if (val == 'morning') {
      this.timeSlots = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
    }
    if (val == 'afternoon') {
      this.timeSlots = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
    }
    if (val == 'evening') {
      this.timeSlots = ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM']
    }
  }

  setSelectedTimeSlot(slot: any) {
    this.selectedTimeSlot = slot === this.selectedTimeSlot ? '' : slot;
    this.scheduleFormParam.get('appointmentTime')?.setValue(this.selectedTimeSlot);
  }

  checkIsSelected(slot: any) {
    if (slot === this.selectedTimeSlot) {
      return true;
    }
    return false;
  }

  getLabTests() {
    const tests: any = []
    this.selectedLabTests.forEach((test: any) => {
      const tempLabtest: any = {
        labtestCode: test.laboratoryTestPackageCode,
        recordType: test.laboratoryTestSummaryList?(test.laboratoryTestSummaryList.length ? 'PK' : 'LT'):'LT',
        laboratoryTestList: [],
      }
      test.laboratoryTestSummaryList?.forEach((laboratoryTestSummary: any) => {
        const obj = {
          laboratoryTestCode: laboratoryTestSummary.laboratoryTestCode,
          laboratoryTestName: laboratoryTestSummary.laboratoryTestName
        }
        tempLabtest.laboratoryTestList.push(obj)
      })
      tests.push(tempLabtest)
    })
    return tests
  }

  getLabReqObj(data: any) {
    const apiReq = {
      diagnosticCentreName: data.diagnosticCentreName,
      diagnosticCentreID: '',
      customerName: this.displayName,
      customeruserCode: this.requestKeyDetails.userCode,
      labtestAppoinmentCreationList: this.getLabTests(),
      appointmentDate: data.appointmentDate,
      appointmentTime: this.utilityService.timeFormateInto24Hours(data.appointmentTime),
      transactionResult: '',
      indicator: this.routeData?.indicator ? 'Y' : 'N'
    }
    return apiReq;
  }

  cancelLabSchedule() {
    this.router.navigate([this.routeData.page], { skipLocationChange: true })
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
      this.physicianScheduleService.generateDiagnosticCentreSchedule(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            window.scrollTo(0, 0);
            this.toastr.success("Your request to book Laboratory test's Appointment is registered successfully");
            this.scheduleLabFormParam.reset()
            this.scheduleLabFormParam.get('selectedSlot')?.setValue('morning')
            this.selectedLabTimeSlot = "";
            this.labTimeSlots = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
            this.selectedLabTests = []
            if (this.routeData) {
              this.router.navigate([this.routeData.page], { skipLocationChange: true })
            }
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
      this.timeSlots = morningSlot;
      this.scheduleFormParam.get('selectedSlot')?.setValue('morning');
    } else {
      if (ifAfternoonSlot) {
        this.timeSlots = afternoonSlot;
        this.scheduleFormParam.get('selectedSlot')?.setValue('afternoon');
      } else {
        this.timeSlots = eveningSlot;
        this.scheduleFormParam.get('selectedSlot')?.setValue('evening');
      }
    }
    this.setSelectedTimeSlot(appointmentTime);
  }

}
