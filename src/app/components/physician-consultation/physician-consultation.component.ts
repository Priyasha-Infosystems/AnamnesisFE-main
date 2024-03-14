import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, GENERATE_PRESCRIPTION_ERROR_MSG } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { CaseLogService } from '@services/case-log.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { PrescriptionDataEntryService } from '@services/prescription-data-entry.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, timeInterval } from 'rxjs';

@Component({
  selector: 'app-physician-consultation',
  templateUrl: './physician-consultation.component.html',
  styleUrls: ['./physician-consultation.component.css']
})
export class PhysicianConsultationComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  public requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL;
  scheduleFormParam: FormGroup;
  errorMessage:any = {};
  selectedTimeSlot: any = '';
  timeSlots: any = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  public currentDate: any;
  public displayName: string;
  displayData:any;
  slotOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' }
  ];
  apiErr:any='';
  //searchedPhysician start---->
  searchedPhysician: any;
  physicianList: Array<any> = [];
  showPhysicianDetails: boolean;
  selectedPhysicianDetails: any;
  oldPhysicianSearchValue: string;
  //searchedPhysician <----end
   //searchedHedhealthClinic start---->
   searcHedhealthClinic: any;
   healthClinicList: Array<any> = [];
   showHealthClinicDetails: boolean;
   selectedHealthClinicDetails: any;
   oldHealthClinicSearchValue: string;
   //searchedHedhealthClinic <----end
   somthingWentWrong:boolean = false;
   caseLogdetails:any;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private commonService: CommonService,
    private store: Store<any>,
    private physicianScheduleService: PhysicianScheduleService,
    private labtestReportUploadService: LabtestReportUploadService,
    private utilityService: UtilityService,
    private toastr: ToastrService,
    private prescriptionDataEntryService: PrescriptionDataEntryService,
    private caseLogService: CaseLogService,
  ) {
    this.getLocalTime();
    this.store.pipe(select('profileState')).subscribe(async val => {
      this.displayName = val.profileDetails.displayName ?? val.companyDetails.legalBusinessName ?? ""
    })
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

  formatDisplayData(){
    const data:string=this.WorkRequestDetails.wrDescription
    if(data.split('#').length ===8){
      this.displayData = {
        customerUserCode:data.split('#')[1],
        customerUserID:this.WorkRequestDetails.wrCustomerID,
        customerName:data.split('#')[2],
        physicianName:data.split('#')[3],
        healthClinicName:data.split('#')[4],
        appointmentDate:data.split('#')[5],
        appointmentTime:this.utilityService.timeFormateInto12Hours(data.split('#')[6])
      }
    }else{
      this.somthingWentWrong= true;
    }
  }

  formatDate(date:any){
    return new Date(date);
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.formatDisplayData();
    this.scheduleFormParam = this.fb.group({
      patientUserID: [''],
      patientUserCode: [this.displayData?.customerUserCode?this.displayData?.customerUserCode:''],
      customerName: [this.displayData?.customerName?this.displayData?.customerName:''],
      healthClinicID: ['',Validators.required],
      healthClinicName: [''],
      healthClinicSearch:[true],
      physicianUserCode: ['',Validators.required],
      physicianName: [''],
      physicianSearch:[true],
      selectedSlot: ['morning'],
      appointmentDate: [this.displayData.appointmentDate?this.displayData.appointmentDate:'', [Validators.required, Validators.pattern(
        /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/
      )]],
      appointmentTime: ['', [Validators.required]],
      transactionResult: [''],
    });
    if(this.displayData){
      this.mapTimeSlotAndTime(this.displayData.appointmentTime)
    }
    this.intializingMessage();
    this.scheduleFormParam.get('physicianName')?.valueChanges
    .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searchedPhysician = response;
        if (response && response.length > 2 && this.scheduleFormParam.get('physicianSearch')?.value === true) {
          this.oldPhysicianSearchValue = response;
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.prescriptionDataEntryService.searchPhysician(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.physicianCount > 0) {
                this.physicianList = res.apiResponse.physicianInformationList;
              } else {
                this.physicianList = [];
              }
            })
            .catch((err: any) => {
              this.physicianList = [];
            })
        }
      })

    this.scheduleFormParam.get('healthClinicName')?.valueChanges
    .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searcHedhealthClinic = response;
        if (response && response.length > 2 && this.scheduleFormParam.get('healthClinicSearch')?.value === true) {
          this.oldHealthClinicSearchValue = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.prescriptionDataEntryService.searchHealthClinic(reqData)
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res) && res.apiResponse.healthClinicCount > 0) {
                this.healthClinicList = res.apiResponse.healthClinicDetailsViewList;
              } else {
                this.healthClinicList = [];
              }
            })
            .catch((err: any) => {
              this.healthClinicList = [];
            })
        }
      })
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

  mapTimeSlotAndTime(appointmentTime:string){
    if(appointmentTime.length === 7){
      appointmentTime = `0${appointmentTime}`
    }
    const morningSlot: Array<any> = ['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
    const afternoonSlot: Array<any> = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
    const eveningSlot: Array<any> = ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM']
    const ifMorningSlot = morningSlot.find(res=>res == appointmentTime)
    const ifAfternoonSlot = afternoonSlot.find(res=>res == appointmentTime)
    if(ifMorningSlot){
      this.timeSlots = morningSlot;
      this.scheduleFormParam.get('selectedSlot')?.setValue('morning');
    }else{
      if(ifAfternoonSlot){
        this.timeSlots = afternoonSlot;
        this.scheduleFormParam.get('selectedSlot')?.setValue('afternoon');
      }else{
        this.timeSlots = eveningSlot;
        this.scheduleFormParam.get('selectedSlot')?.setValue('evening');
      }
    }
    this.setSelectedTimeSlot(appointmentTime);
  }

  //searchedPhysician start ---->
  selectPhysician( physician: any) {
    this.showPhysicianDetails = true;
    this.unSelectHealthClinic('Y');
    this.selectedPhysicianDetails = physician;
    this.scheduleFormParam.get('physicianName')?.setValue(physician.physicianName);
    this.scheduleFormParam.get('physicianSearch')?.setValue(false);
    this.scheduleFormParam.get('physicianName')?.disable();
  }
  unSelectPhysician(ForPopupClose?:string) {
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    if(ForPopupClose !== 'Y'){
    this.scheduleFormParam.get('physicianName')?.setValue(this.oldPhysicianSearchValue);
    this.scheduleFormParam.get('physicianSearch')?.setValue(false);
    }
    this.scheduleFormParam.get('physicianName')?.enable();
  }

  selectPhysicianForPrescription() {
    this.scheduleFormParam.get('physicianUserID')?.setValue(this.selectedPhysicianDetails.physicianUserID);
    this.scheduleFormParam.get('physicianUserCode')?.setValue(this.selectedPhysicianDetails.physicianUserCode);
    this.scheduleFormParam.get('physicianName')?.setValue(this.selectedPhysicianDetails.physicianName);
    this.scheduleFormParam.get('physicianName')?.disable();
    this.scheduleFormParam.get('physicianSearch')?.setValue(false);
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
  }

  unSelectPhysicianForPrescription() {
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.scheduleFormParam.get('physicianName')?.setValue(this.oldPhysicianSearchValue);
    this.scheduleFormParam.get('physicianUserID')?.setValue('');
    this.scheduleFormParam.get('physicianUserCode')?.setValue('');
    this.scheduleFormParam.get('physicianName')?.enable();
    this.scheduleFormParam.get('physicianSearch')?.setValue(false);
  }

  onTypephysicianName() {
    this.scheduleFormParam.get('physicianSearch')?.setValue(true);
  }
  //searchedPhysician <----end
  //searchedHealthClinic start---->
  selectHealthClinic( healthClinic: any) {
    this.showHealthClinicDetails = true;
    this.unSelectPhysician('Y');
    this.selectedHealthClinicDetails = healthClinic;
    this.scheduleFormParam.get('healthClinicName')?.setValue(healthClinic.healthClinicName);
    this.scheduleFormParam.get('healthClinicSearch')?.setValue(false);
    this.scheduleFormParam.get('healthClinicName')?.disable();
  }
  unSelectHealthClinic(ForPopupClose?:string) {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    if(ForPopupClose !== 'Y'){
      this.scheduleFormParam.get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
      this.scheduleFormParam.get('healthClinicSearch')?.setValue(false);
    }
    this.scheduleFormParam.get('healthClinicName')?.enable();
    
  }

  selectHealthClinicForPrescription() {
    this.scheduleFormParam.get('healthClinicID')?.setValue(this.selectedHealthClinicDetails.healthClinicID);
    this.scheduleFormParam.get('healthClinicName')?.setValue(this.selectedHealthClinicDetails.healthClinicName);
    this.scheduleFormParam.get('healthClinicName')?.disable();
    this.scheduleFormParam.get('healthClinicSearch')?.setValue(false);
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
  }

  unSelectHealthClinicForPrescription() {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.scheduleFormParam.get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.scheduleFormParam.get('healthClinicID')?.setValue('');
    this.scheduleFormParam.get('healthClinicName')?.enable();
    this.scheduleFormParam.get('healthClinicSearch')?.setValue(false);
  }

  onTypeHealthClinicName() {
    this.scheduleFormParam.get('healthClinicSearch')?.setValue(true);
  }
  //searchedHealthClinic <----end

  getReqObj(data: any) {
    const apiReq = [{
          workRequestID:this.WorkRequestDetails.caseCode,
          commercialID:data.healthClinicID,
          physicianUserCode:data.physicianUserCode,
          appointmentType:'PHC',
          appointmentDate:data.appointmentDate,
          appointmentTime:this.utilityService.timeFormateInto24Hours(data.appointmentTime),
          patientUserID:this.displayData.customerUserID,
          cartItemSeqNo:'',
          prescriptionID:'',
          itemType:'PC',
          itemCode:data.physicianUserCode,
          packageID:'',
          quantity:1,
          addressID:'',
          couponID:'',
          actionIndicator: 'ADD',
          transactionResult: '',
    }]
    return apiReq;
  }

  submitSchedule(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.scheduleFormParam);
    if (isValid) {
      const reqData: any = {
        apiRequest: this.getReqObj(data),
      }
      this.physicianScheduleService.addPhysicianOrderToCart(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success("Schedule to booked successfully");
            this.close.emit(true);
          } else {
            this.apiErr = res.anamnesisErrorList.anErrorList[0].errorMessage;
            setTimeout(() => this.apiErr = '', 2000);
          }
        })
        .catch((err: any) => {
        })
    }
  }

  checkIsSelected(slot: any) {
    if (slot === this.selectedTimeSlot) {
      return true;
    }
    return false;
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

  checkValidDate() {
    const dateControl = this.scheduleFormParam.get('appointmentDate');
    const data =this.utilityService.getTimeStamp(dateControl!.value,'00:00:01 AM')
    if (dateControl!.value &&  data <  this.currentDate) {
      dateControl!.setValue('')
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
    this.errorMessage.physicianUserCode = {
      required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_physicianUserID,
    };
    this.errorMessage.healthClinicID = {
      required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_healthClinicID,
    };
  }

  closePopup() {
    this.close.emit(false);
  }
}
