import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { BASE_IMAGE_URL_FOR_REQ, BUSYHOURS_ERROR_MSG, DIAGONOSTIC_ERROR_MESSAGE, PHYSICIAN_SCHEDULE_ERR_MSG } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MiniCalendarViewComponent } from 'src/app/components/mini-calendar-view/mini-calendar-view.component';
import { IWeakDay } from 'src/app/models/utility.models';

@Component({
  selector: 'app-physician-schedule',
  templateUrl: './physician-schedule.component.html',
  styleUrls: ['./physician-schedule.component.css']
})
export class PhysicianScheduleComponent implements OnInit {
  @ViewChild(MatDatepicker) private HoliDaystartPicker: MatDatepicker<Date>;
  @ViewChild(MiniCalendarViewComponent) miniCalComponent: MiniCalendarViewComponent;
  public weekDays$: Observable<IWeakDay[]>;
  public timeOf24Hours$: Observable<string[]>;
  public holidayForm: FormGroup;
  public physicianScheduleForm: FormGroup;
  public errorMessage: any = {};
  public currentDate: any;
  public userIsPhysician: boolean = false;
  public userIsHCU: boolean = false;
  public timePickerTheme: any;
  public showPhysicianDetails: boolean = false;
  public physicianDetails: any;
  public selectedPhysicianDetails: any;
  public physicianList: Array<any> = [];
  public searchedPhysician: any;
  public searchPhysicianForm: FormGroup;
  public physicianErrMsg: string;
  public consulttationTimingErrMsg: string;
  public healthClinicList: Array<any> = [];
  public filteredHealthClinicCodeList: Array<any> = [];
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  public healthClinicDetails: any;
  public busyHoursform: FormGroup;
  public selectedDateRangeList: Array<any> = [];
  public preHoliDayList: Array<any> = [];
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private commonService: CommonService,
    private physicianScheduleService: PhysicianScheduleService,
    private formService: FormService,
  ) {
    this.timePickerTheme = this.utilityService.timePickerTheme;
    this.intializingFormGroup();
    this.intializingMessage();
    this.getLocalTime()
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.userIsPhysician = res.userRoleList.find((val: any) => val.roleCode === 'PHY') ? true : false;
      this.userIsHCU = res.userRoleList.find((val: any) => val.roleCode === 'HCU') ? true : false;
      if (this.userIsPhysician) {
        this.searchPhysicianForm.get('physicianName')?.disable();
        this.getDoctorDetails(res)
      } else {
        this.getHealthClinicDetails();
      }
    })
    this.weekDays$ = this.utilityService.getWeekDays();
    this.timeOf24Hours$ = this.utilityService.get24TimeOf30MinGap();
    this.physicianScheduleForm.get('physicianScheduleHealthClinicList')?.valueChanges.subscribe(res => {
      this.filterHealthclinicIDList()
    })
  }



  getHealthClinicList(searchData: string) {
    if (searchData.length > 2) {
      const reqData: any = {
        apiRequest: {
          searchKeyword: searchData,
        },
      }
      this.physicianScheduleService.searchHealthClinic(reqData)
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
    } else if (searchData.length === 0) {
      this.healthClinicList = [];
    }

  }
  getHealthClinicDetails() {
    const reqData: any = {
      apiRequest: {
        commercialID: ''
      }
    }
    this.physicianScheduleService.GetDiagnosticCentreDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.healthClinicList = [{
            healthClinicID: res.apiResponse.diagnosticCentreID,
            healthClinicName: res.apiResponse.diagnosticCentreName,
          }];
          this.healthClinicDetails = {
            healthClinicID: res.apiResponse.diagnosticCentreID,
            healthClinicName: res.apiResponse.diagnosticCentreName,
          }
        } else {
          this.healthClinicList = [];
        }
      })
      .catch((err: any) => {
        this.healthClinicList = [];
      })
  }

  getDoctorDetails(requestKeyDetails: any) {
    const reqData: any = {
      apiRequest: {
        searchKeyword: requestKeyDetails.userCode,
      },
    }
    this.physicianScheduleService.searchPhysician(reqData)
      .then(async (response: any) => {
        if (!this.commonService.isApiError(response) && response.apiResponse.physicianCount > 0) {
          this.selectedPhysicianDetails = response.apiResponse.physicianInformationList[0];
          this.searchPhysicianForm.get('physicianName')?.setValue(this.selectedPhysicianDetails.physicianName)
          this.physicianDetails = {};
          this.showPhysicianDetails = false;
          this.getPhysicianSchedule();
          this.getDaliBusyHours();
        } else {
          this.physicianDetails = {};
          this.showPhysicianDetails = false;
        }
      })
      .catch((err: any) => {
        this.physicianDetails = {};
        this.showPhysicianDetails = false;
      })
  }
  // physician start ------>
  searchPhysician = async (response: any) => {
    this.searchedPhysician = response;
    if (response && response.length > 2) {
      const reqData: any = {
        apiRequest: {
          searchKeyword: response,
        },
      }
      await this.physicianScheduleService.searchPhysician(reqData)
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
    } else {
      this.physicianList = [];
    }
  }

  selectPhysicianForSchedule() {
    this.selectedPhysicianDetails = this.physicianDetails;
    this.physicianDetails = {};
    this.showPhysicianDetails = false;
    // this.searchPhysicianForm.get('physicianName')?.disable();
    if (this.selectedPhysicianDetails.physicianUserCode === this.requestKeyDetails.userCode) {
      this.userIsPhysician = true;
      this.getPhysicianSchedule();
      this.getDaliBusyHours();
    } else {
      if (this.healthClinicDetails) {
        this.getHealthClinicDetails();
        this.getPhysicianSchedule(this.healthClinicDetails.healthClinicID);
        this.getDaliBusyHours();
      }
    }
  }
  selectPhysician(physician: any) {
    this.physicianDetails = physician;
    this.showPhysicianDetails = true;
    this.selectedPhysicianDetails = undefined;
    // this.searchPhysicianForm.get('physicianName')?.setValue(physician.physicianName)
  }

  unSelectPhysician() {
    this.physicianDetails = {};
    this.showPhysicianDetails = false;
  }

  clearPhysician() {
    this.physicianDetails = {};
    this.selectedPhysicianDetails = undefined;
    this.showPhysicianDetails = false;
    this.searchPhysicianForm.get('physicianName')?.enable();
    this.searchPhysicianForm = this.fb.group({
      physicianName: [''],
      consultationTime: [''],
      consultationTimeIsAdd: [true],
      consultationTimeIsChange: [false],
      consultationTimeIsDelete: [false],
    })
    if (this.userIsPhysician) {
      this.getHealthClinicDetails();
    }
    this.userIsPhysician = false;
  }


  // physician end ------>

  // holiDay start ---->

  getLocalTime() {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-US');
    const localTime = '23:59:01';
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    this.currentDate = timestamp;
  }

  checkValidDate(holidayIndex: number, isStartDate: boolean) {
    let dateControl;
    if (isStartDate) {
      this.holidayDetailsList().at(holidayIndex).get('holidayEndDate')?.setValue('')
      dateControl = this.holidayDetailsList().at(holidayIndex).get('holidayStartDate');
      if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '11:59:59 PM') < this.currentDate) {
        dateControl!.setValue('')
      } else {
        this.dateSelect(holidayIndex, dateControl!.value, isStartDate)
      }
    } else {
      dateControl = this.holidayDetailsList().at(holidayIndex).get('holidayEndDate');
      if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '11:59:59 PM') < (this.holidayDetailsList().at(holidayIndex).get('holidayStartDate')?.value ? this.utilityService.getTimeStamp(this.holidayDetailsList().at(holidayIndex).get('holidayStartDate')?.value, '00:00:01 AM') : this.currentDate)) {
        dateControl!.setValue('')
      } else {
        this.dateSelect(holidayIndex, dateControl!.value, isStartDate)
      }
    }

  }

  getTimeStamp(date: any) {
    const mDate = new Date(date);
    return date ? mDate.getTime() : 0;
  }

  getPreHoliDayList(holidayList: any) {
    this.preHoliDayList = []
    if (holidayList.length) {
      this.preHoliDayList = holidayList;
    }
  }

  dateSelect(holidayIndex: number, date: any, isStartDate: boolean) {
    let startdate = 0
    startdate = this.utilityService.getTimeStamp(this.holidayDetailsList().at(holidayIndex).get('holidayStartDate')?.getRawValue(), '00:00:01 AM')
    const selectedDate = this.getTimeStamp(date);
    const refDateArray: Array<any> = [];
    this.holidayDetailsList().controls.forEach((val: any, index: number) => {
      const obj = {
        holidayStartDate: this.utilityService.getTimeStamp(val.value.holidayStartDate, '00:00:01 AM'),
        holidayEndDate: this.utilityService.getTimeStamp(val.value.holidayEndDate, '00:00:01 AM')
      }
      refDateArray.push(obj)
    })

    let isErr = false;
    if (this.preHoliDayList.length) {
      this.preHoliDayList.forEach((val: any, index: number) => {
        if (!isErr) {
          if ((val.holidayStartDate && val.holidayEndDate && !isStartDate && startdate && startdate <= val.holidayStartDate && selectedDate >= val.holidayStartDate && selectedDate >=val.holidayEndDate) || (val.holidayStartDate && selectedDate >= val.holidayStartDate)&&(val.holidayEndDate && selectedDate <= val.holidayEndDate)) {
            if (isStartDate) {
              this.holidayDetailsList().at(holidayIndex).get('startDateErrMsg')?.setValue('Already holiday scheduled in this date range')
              setTimeout(() => this.holidayDetailsList().at(holidayIndex).get('startDateErrMsg')?.setValue(''), 3500);
              this.toastr.error('Already holiday scheduled in this date range')
            } else {
              this.holidayDetailsList().at(holidayIndex).get('startDateErrMsg')?.setValue('Already holiday scheduled in this date range')
              setTimeout(() => this.holidayDetailsList().at(holidayIndex).get('startDateErrMsg')?.setValue(''), 3500);
              this.toastr.error('Already holiday scheduled in this date range')
            }
            isErr = true;
          } 
        }
      })
    }
    if (isErr) {
      if (isStartDate) {
        setTimeout(() => this.holidayDetailsList().at(holidayIndex).get('holidayStartDate')?.setValue(''), 10);
      } else {
        setTimeout(() => this.holidayDetailsList().at(holidayIndex).get('holidayEndDate')?.setValue(''), 10);
      }
    }
  }


  holidayFormSubmit(holidayList: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.holidayForm);
    if (isValid === true) {
      const reqData: any = {
        apiRequest: {
          holidayCount: holidayList.holidayDetailsList.length,
          physicianUserID: this.requestKeyDetails.userID,
          holidayDetailsList: []
        },
      }
      // for (let i = 0; i < holidayList.holidayDetailsList.length; i++) {
      //   for (let j = 0; j < holidayList.holidayDetailsList.length; j++) {
      //     if (this.areOverlapping(holidayList.holidayDetailsList[i], holidayList.holidayDetailsList[j])) {
      //       this.toastr.error("overlaping");
      //       break;
      //     }
      //   }
      // }
      holidayList.holidayDetailsList.forEach((holiday: any, index: number) => {
        const holidayDetails = {
          actionIndicator: 'ADD',
          holidayDescription: holiday.holidayDescription,
          holidayEndDate: this.utilityService.getLocalDate(holiday.holidayEndDate),
          holidaySeqNo: index + 1,
          holidayStartDate: this.utilityService.getLocalDate(holiday.holidayStartDate),
          transactionResult: ''
        }
        reqData.apiRequest.holidayDetailsList.push(holidayDetails)
      })
      this.physicianScheduleService.addHolidaySchedules(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.holidayForm.reset()
            this.toastr.success('Holidays added')
            this.miniCalComponent.refreshCalendar();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Holidays couldn't add due some error");
          }
        })
    }
  }

  getHolidayController(holidayIndex: number, controlName: any) {
    let holidayArray = <any>this.holidayForm.controls['holidayDetailsList']
    return holidayArray.controls[holidayIndex].controls[controlName]
  }

  holidayDetailsList() {
    return this.holidayForm.get('holidayDetailsList') as FormArray
  }

  addAnotherholidayDetails() {
    this.holidayDetailsList().push(this.addHolidayDetailsGroup());
  }

  holidayDetailsDelete(holidayDetailsIndex: number) {
    this.holidayDetailsList().removeAt(holidayDetailsIndex);
    if (this.holidayDetailsList().length < 1) {
      this.addAnotherholidayDetails()
    }
  }

  holiDayChange(index: number) {
    this.holidayDetailsList().at(index).get('isdataFill')?.setValue(true);
  }

  private addHolidayDetailsGroup() {
    return this.fb.group({
      holidayStartDate: ['', [Validators.required]],
      holidayEndDate: ['', [Validators.required]],
      holidayDescription: ['', [Validators.maxLength(100)]],
      startDateErrMsg: [''],
      endDateErrMsg: [''],
      isdataFill: [false]
    })
  }

  // holiDayEnd ---->

  // schedule start --->
  unselectHealthClinic(physicianScheduleHealthClinicIndex: number) {
    const control = this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex);
    if (!control?.value.isAdd) {
      const deletedData = control.getRawValue()
      deletedData.isDelete = true;
      this.addAnotherPhysicianScheduleHealthClinic()

      const NewIndex = this.physicianScheduleHealthClinicList().length - 1
      this.physicianScheduleDetailsList(NewIndex).clear();
      this.physicianScheduleHealthClinicList().at(NewIndex).patchValue(deletedData)
      deletedData.physicianScheduleDetailsList.forEach((res: any) => {
        res.isDelete = true
        this.addAnotherPhysicianScheduleDetails(NewIndex)
        const newPhysicianScheduleDetailsIndex = this.physicianScheduleDetailsList(NewIndex).length - 1;
        this.physicianScheduleDetailsList(NewIndex).at(newPhysicianScheduleDetailsIndex).patchValue(res)
      })
    }
    control.reset()
    this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).clear();
    control.get('isAdd')?.setValue(true)
    control.get('isChange')?.setValue(false)
    control.get('isDelete')?.setValue(false)
    control.get('isSave')?.setValue(false)
    control.get('healthClinicName')?.enable();
    this.addAnotherPhysicianScheduleDetails(physicianScheduleHealthClinicIndex)
  }

  editphysicianSchedule(physicianScheduleHealthClinicIndex: number) {
    const isSaveController = this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('isSave')
    if (isSaveController?.value) {
      isSaveController?.setValue(false);
    }
  }

  savePhysicianSchedule(physicianScheduleHealthClinicIndex: number) {
    const scheduleFormGroup = this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex) as FormGroup
    this.formService.markFormGroupTouched(scheduleFormGroup)
    if (this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).valid) {
      const isSaveController = this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('isSave')
      if (!isSaveController?.value) {
        isSaveController?.setValue(true);
        this.formService.markFormGroupUnTouched(scheduleFormGroup)
      }
    }
  }

  getWeakDayNameFormCode(WeakDay: any) {
    let weekDays: any = [];
    this.weekDays$.subscribe(res => {
      weekDays = res;
    })
    const foundWeekDay = weekDays.find((res: any) => res.dayCode === +WeakDay)
    return foundWeekDay ? foundWeekDay.dayName : ''
  }

  selectHealthClinic(healthClinic: any, physicianScheduleHealthClinicIndex: number) {
    const foundHealtclinic = this.physicianScheduleForm.value.physicianScheduleHealthClinicList.find((res: any) => res.healthClinicID === healthClinic.healthClinicID && !res.isDelete);
    if (foundHealtclinic) {
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicErrMsg')?.setValue('This heath clinic Already chosen');
    } else {
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicID')?.setValue(healthClinic.healthClinicID)
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicName')?.setValue(healthClinic.healthClinicName)
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicErrMsg')?.setValue('');
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicName')?.disable();
    }
  }

  getPhysicianSchedule = async (healthClinicID?: string) => {
    const reqData: any = {
      apiRequest: {
        healthClinicID: healthClinicID ? healthClinicID : '',
        physicianUserCode: this.selectedPhysicianDetails.physicianUserCode,
      },
    }
    this.physicianScheduleService.GetPhysicianScheduleSetup(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const data: Array<any> = res.apiResponse.physicianScheduleList ? res.apiResponse.physicianScheduleList : []
          this.physicianScheduleHealthClinicList().clear();
          this.creatPhysicianScheduleForm(data);
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error('Schedule could not get due to some error')
        }
      })
  }

  physicianScheduleFormSubmit = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.physicianScheduleForm)
    if (this.selectedPhysicianDetails) {
      if (isValid) {
        const reqData: any = {
          apiRequest: {
            physicianScheduleCount: 0,
            physicianScheduleList: []
          }
        }
        data.physicianScheduleHealthClinicList.forEach((physicianScheduleHealthClinic: any, physicianScheduleHealthClinicIndex: number) => {
          physicianScheduleHealthClinic.physicianScheduleDetailsList.forEach((physicianScheduleDetails: any, index: number) => {
            const tempPhysicianSchedule: any = {
              scheduleIdentifier: physicianScheduleDetails.scheduleIdentifier,
              healthClinicID: physicianScheduleHealthClinic.healthClinicID,
              healthClinicName: physicianScheduleHealthClinic.healthClinicName,
              physicianUserCode: this.selectedPhysicianDetails.physicianUserCode,
              physicianID: this.selectedPhysicianDetails.physicianUserID,
              scheduleSeqNo: index + 1,
              weekDay: +physicianScheduleDetails.weekDay,
              eventDescription: physicianScheduleDetails.eventDescription,
              startTime: this.utilityService.timeFormateInto24Hours(physicianScheduleDetails.startTime),
              endTime: this.utilityService.timeFormateInto24Hours(physicianScheduleDetails.endTime),
              consultationFee: +physicianScheduleHealthClinic.consultationFee,
              consultationTime: +physicianScheduleHealthClinic.consultationTime,
              actionIndicator: '',
              transactionResult: '',
            }
            if (physicianScheduleHealthClinic.isAdd) {
              tempPhysicianSchedule.actionIndicator = 'ADD'
            } else {
              if (physicianScheduleHealthClinic.isDelete) {
                tempPhysicianSchedule.actionIndicator = 'DEL'
              } else {
                if (physicianScheduleHealthClinic.isChange) {
                  tempPhysicianSchedule.actionIndicator = 'UPD'
                } else {
                  if (physicianScheduleDetails.isAdd) {
                    tempPhysicianSchedule.actionIndicator = 'ADD'
                  } else {
                    if (physicianScheduleDetails.isDelete) {
                      tempPhysicianSchedule.actionIndicator = 'DEL'
                    } else {
                      if (physicianScheduleDetails.isChange) {
                        tempPhysicianSchedule.actionIndicator = 'UPD'
                      } else {
                        tempPhysicianSchedule.actionIndicator = ''
                      }
                    }
                  }
                }
              }

            }
            reqData.apiRequest.physicianScheduleList.push(tempPhysicianSchedule);
          })
        })
        reqData.apiRequest.physicianScheduleCount = reqData.apiRequest.physicianScheduleList.length;
        this.physicianScheduleService.PhysicianScheduleSetup(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              if (this.userIsPhysician) {
                this.getPhysicianSchedule()
              } else {
                this.getPhysicianSchedule(this.healthClinicDetails.healthClinicID);
              }
              this.toastr.success('Physician Schedule Saved')
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error('Schedule could not save due some error ')
            }
          })
      }
    } else {
      this.physicianErrMsg = this.errorMessage.ScheduleError.physician.required;
      setTimeout(() => this.physicianErrMsg = '', 1500);
    }
  }

  creatPhysicianScheduleForm(data: any) {
    if (data.length) {
      const physicianScheduleHealthClinicList: Array<any> = [];
      data.forEach((physicianSchedule: any, physicianScheduleIndex: number) => {
        const foundPhysicianScheduleHealthClinicIndex = physicianScheduleHealthClinicList.findIndex((res: any) => res.healthClinicID === physicianSchedule.healthClinicID);
        if (foundPhysicianScheduleHealthClinicIndex > -1) {
          const physicianScheduleDetails: any = {
            scheduleIdentifier: physicianSchedule.scheduleIdentifier,
            weekDay: physicianSchedule.weekDay,
            startTime: this.utilityService.timeFormateInto12Hours(physicianSchedule.startTime),
            endTime: this.utilityService.timeFormateInto12Hours(physicianSchedule.endTime),
            eventDescription: physicianSchedule.eventDescription,
            isAdd: false,
            isChange: false,
            isDelete: false,
          }
          physicianScheduleHealthClinicList[foundPhysicianScheduleHealthClinicIndex].physicianScheduleDetailsList.push(physicianScheduleDetails);

        } else {
          const physicianScheduleHealthClinic: any = {
            healthClinicID: physicianSchedule.healthClinicID,
            healthClinicName: physicianSchedule.healthClinicName,
            physicianUserCode: physicianSchedule.physicianUserCode,
            physicianID: physicianSchedule.physicianID,
            scheduleSeqNo: '',
            physicianScheduleDetailsList: [],
            consultationFee: physicianSchedule.consultationFee,
            consultationTime: physicianSchedule.consultationTime,
            actionIndicator: '',
            transactionResult: '',
            isAdd: false,
            isChange: false,
            isDelete: false,
            isSave: true
          }
          const physicianScheduleDetails: any = {
            scheduleIdentifier: physicianSchedule.scheduleIdentifier,
            weekDay: physicianSchedule.weekDay,
            startTime: this.utilityService.timeFormateInto12Hours(physicianSchedule.startTime),
            endTime: this.utilityService.timeFormateInto12Hours(physicianSchedule.endTime),
            eventDescription: physicianSchedule.eventDescription,
            isAdd: false,
            isChange: false,
            isDelete: false,
          }
          // physicianScheduleHealthClinic.physicianScheduleDetailsList.push(physicianScheduleDetails);
          physicianScheduleHealthClinicList.push(physicianScheduleHealthClinic)
          physicianScheduleHealthClinicList[physicianScheduleHealthClinicList.length - 1].physicianScheduleDetailsList.push(physicianScheduleDetails);

        }
      })
      physicianScheduleHealthClinicList.forEach((physicianScheduleHealthClinic: any, physicianScheduleHealthClinicIndex: number) => {
        this.physicianScheduleHealthClinicList().push(this.addPhysicianScheduleHealthClinicGroup());
        this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).patchValue(physicianScheduleHealthClinic);
        this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicName')?.disable();
        physicianScheduleHealthClinic.physicianScheduleDetailsList.forEach((physicianScheduleDetails: any, physicianScheduleDetailsIndex: number) => {
          this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).push(this.addPhysicianScheduleDetailsgroup());
          this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).patchValue(physicianScheduleDetails);
          this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTime')?.enable()
          this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTime')?.enable()
        })
      })
    } else {
      this.physicianScheduleHealthClinicList().push(this.addPhysicianScheduleHealthClinicGroup());
      if (!this.userIsPhysician) {
        this.physicianScheduleHealthClinicList().at(0).get('healthClinicName')?.setValue(this.healthClinicList[0].healthClinicName)
        this.physicianScheduleHealthClinicList().at(0).get('healthClinicName')?.disable();
        this.physicianScheduleHealthClinicList().at(0).get('healthClinicID')?.setValue(this.healthClinicList[0].healthClinicID)
      }
      this.physicianScheduleDetailsList(0).push(this.addPhysicianScheduleDetailsgroup());
      this.searchPhysicianForm.get('consultationTime')?.setValue('')
      this.searchPhysicianForm.get('consultationTimeIsAdd')?.setValue(false)
      this.searchPhysicianForm.get('consultationTimeIsChange')?.setValue(false)
      this.searchPhysicianForm.get('consultationTimeIsDelete')?.setValue(false)
    }

  }

  changeHealtClinic(healthClinicID: any, physicianScheduleHealthClinicIndex: number, physicianScheduleHealthClinicIsAdd: boolean) {
    const healthClinicName = this.healthClinicList.find((res: any) => res.healthClinicID === healthClinicID).healthClinicName;
    this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicName')?.setValue(healthClinicName);
    this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('healthClinicID')?.setValue(healthClinicID);
    if (!physicianScheduleHealthClinicIsAdd) {
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('isChange')?.setValue(true);
    }
  }

  changeConsultationFee(consultationFee: string, physicianScheduleHealthClinicIndex: number, physicianScheduleHealthClinicIsAdd: boolean) {
    if (!this.commonService.checkUserNumber(consultationFee)) {
      const oldVal = consultationFee;
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('consultationFee')?.setValue(oldVal.substring(0, oldVal.length - 1))
    }
    if (!physicianScheduleHealthClinicIsAdd) {
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('isChange')?.setValue(true);
    }
  }

  changeConsutingTime(consultationtime: string, physicianScheduleHealthClinicIndex: number, physicianScheduleHealthClinicIsAdd: boolean) {
    if (!this.commonService.checkUserNumber(consultationtime)) {
      const oldVal = consultationtime;
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex)?.setValue(oldVal.substring(0, oldVal.length - 1))
    }
    if (!physicianScheduleHealthClinicIsAdd) {
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('isChange')?.setValue(true);
    }
  }

  isSelectedPreviousHealthClinic(healthClinicID: string, selectedhealthClinicID: string) {
    const a = this.filteredHealthClinicCodeList.find(res => res === healthClinicID)
    if (a) {
      if (a === selectedhealthClinicID) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  filterHealthclinicIDList = () => {
    this.filteredHealthClinicCodeList = []
    this.physicianScheduleForm.value.physicianScheduleHealthClinicList.forEach((healthClinic: any) => {
      this.filteredHealthClinicCodeList.push(healthClinic.healthClinicID)
    })
  }

  private addPhysicianScheduleHealthClinicGroup() {
    return this.fb.group({
      healthClinicID: ['', Validators.required],
      healthClinicName: [''],
      healthClinicErrMsg: [''],
      physicianUserCode: [''],
      physicianID: [''],
      scheduleSeqNo: [''],
      physicianScheduleDetailsList: this.fb.array([]),
      consultationFee: ['', Validators.required],
      consultationTime: ['', Validators.required],
      actionIndicator: [''],
      transactionResult: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      isSave: [false],
      customErrMSG:['']
    })
  }

  physicianScheduleHealthClinicList() {
    return this.physicianScheduleForm.get('physicianScheduleHealthClinicList') as FormArray;
  }

  addAnotherPhysicianScheduleHealthClinic() {
    if(this.physicianScheduleHealthClinicList().valid){
      this.physicianScheduleHealthClinicList().push(this.addPhysicianScheduleHealthClinicGroup());
      this.physicianScheduleDetailsList(this.physicianScheduleHealthClinicList().length - 1).push(this.addPhysicianScheduleDetailsgroup());
    }else{
      this.physicianScheduleHealthClinicList().at(this.physicianScheduleHealthClinicList().length-1).get('customErrMSG')?.setValue('Please fill the details first');
      setTimeout(() => {
        this.physicianScheduleHealthClinicList().at(this.physicianScheduleHealthClinicList().length-1).get('customErrMSG')?.setValue('');
      }, 1500);
    }
  }

  deletePhysicianScheduleHealthClinic(physicianScheduleHealthClinicIndex: number, physicianScheduleHealthClinicissAdd: boolean) {
    if (!physicianScheduleHealthClinicissAdd) {
      this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('isDelete')?.setValue(true)
    } else {
      this.physicianScheduleHealthClinicList().removeAt(physicianScheduleHealthClinicIndex);
    }
    const activeList = this.physicianScheduleHealthClinicList().value.filter((res: any) => res.isDelete === false);
    if (!activeList.length) {
      const deletedPhysicianScheduleHealthClinicList: any = []
      this.physicianScheduleHealthClinicList().getRawValue().forEach((res: any) => {
        const deleteData = res;
        deleteData.isDelete = true;
        deletedPhysicianScheduleHealthClinicList.push(deleteData)
      })
      if (deletedPhysicianScheduleHealthClinicList.length) {
        this.physicianScheduleFormSubmit({ physicianScheduleHealthClinicList: deletedPhysicianScheduleHealthClinicList }, true)

      } else {
        this.addAnotherPhysicianScheduleHealthClinic();
      }
    }


  }

  physicianScheduleDetailsList(physicianScheduleHealthClinicIndex: number) {
    return this.physicianScheduleHealthClinicList().at(physicianScheduleHealthClinicIndex).get('physicianScheduleDetailsList') as FormArray
  }

  physicianscheduleDetailsController(physicianScheduleHealthClinicIndex: number, physicianScheduleDetailsIndex: number, controlName: any) {
    const controllArray = <any>this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex);
    return controllArray.controls[physicianScheduleDetailsIndex].controls[controlName];
  }

  physicianScheduleHealthCliniccontroller(physicianScheduleHealthClinicIndex: number, controlName: any) {
    const controllArray = <any>this.physicianScheduleHealthClinicList();
    return controllArray.controls[physicianScheduleHealthClinicIndex].controls[controlName];
  }

  addAnotherPhysicianScheduleDetails(physicianScheduleHealthClinicIndex: number, physicianScheduleHealthClinicissAdd?: boolean) {
    if(this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).valid){
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).push(this.addPhysicianScheduleDetailsgroup())
    }else{
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).length-1).get('customErrMSG')?.setValue('Please fill the details first');
      setTimeout(() => {
        this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).length-1).get('customErrMSG')?.setValue('');
      }, 1500);
    }
    
  }

  deletePhysicianScheduleDetails(physicianScheduleHealthClinicIndex: number, physicianScheduleDetailsIndex: number, physicianScheduleHealthClinicisAdd: boolean, physicianScheduleDetailsisAdd: boolean) {
    const physicianScheduleDetailsList: Array<any> = this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).value;
    if (!physicianScheduleDetailsisAdd) {
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('isDelete')?.setValue(true);
    } else {
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).removeAt(physicianScheduleDetailsIndex)
    }
    if (physicianScheduleDetailsList.filter((res: any) => res.isDelete !== true).length === 1) {
      this.addAnotherPhysicianScheduleDetails(physicianScheduleHealthClinicIndex, physicianScheduleHealthClinicisAdd)
    }
  }

  private addPhysicianScheduleDetailsgroup() {
    return this.fb.group({
      scheduleIdentifier: [''],
      weekDay: ['', Validators.required],
      startTime: [{ value: '', disabled: true }, Validators.required],
      endTime: [{ value: '', disabled: true }, Validators.required],
      eventDescription: [''],
      startTimeErrMsg: [''],
      endTimeErrMsg: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      customErrMSG:['']
    })
  }

  physicianScheduleDetailsWeakDayChange(physicianScheduleHealthClinicIndex: number, physicianScheduleDetailsIndex: number, physicianScheduleDetailsIssAdd: boolean, weakDay: any) {
    if (!physicianScheduleDetailsIssAdd) {
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('isChange')?.setValue(true);
    }
    if (weakDay) {
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTime')?.enable();
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTime')?.enable();
    }
    this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTime')?.setValue('');
    this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTime')?.setValue('');
  }


  physicianScheduleDetailsTimeChange(physicianScheduleHealthClinicIndex: number, physicianScheduleDetailsIndex: number, physicianScheduleDetailsIssAdd: boolean, time?: any, weakDay?: any, isStartTime?: boolean) {
    if (!physicianScheduleDetailsIssAdd) {
      this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('isChange')?.setValue(true);
    }
    let startTimeValue = 0
    startTimeValue = this.utilityService.get12FormatTimeIntoMinute(this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTime')?.value)
    if (time && weakDay) {
      const selectedTime = this.utilityService.get12FormatTimeIntoMinute(time);
      const refTimeArray: Array<any> = [];
      this.physicianScheduleHealthClinicList().controls.forEach((parentVal: any, parentIndex: number) => {
        if (!parentVal.value.isDelete) {
          this.physicianScheduleDetailsList(parentIndex).controls.forEach((val: any, index: number) => {
            if (!val.value.isDelete) {
              refTimeArray.push({
                weakDay: val.value.weekDay,
                scheduleStartTime: this.utilityService.get12FormatTimeIntoMinute(val.value.startTime),
                scheduleEndTime: this.utilityService.get12FormatTimeIntoMinute(val.value.endTime),
                physicianScheduleHealthClinicIndex: parentIndex,
                physicianScheduleDetailsIndex: index
              })
            }
          })
        }

      })
      if (isStartTime) {
        this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTime')?.setValue('')
      }
      let isErr = false;
      if (refTimeArray.length) {
        refTimeArray.forEach((val: any, index: number) => {
          if (!isErr && val.weakDay == weakDay) {
            if ((val.scheduleStartTime && val.scheduleEndTime && !isStartTime && startTimeValue && startTimeValue <= val.scheduleStartTime && selectedTime >= val.scheduleStartTime && selectedTime >= val.scheduleEndTime) || (val.scheduleStartTime && selectedTime > val.scheduleStartTime) && (val.scheduleEndTime && selectedTime < val.scheduleEndTime)) {
              if (isStartTime) {
                setTimeout(() => this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTime')?.setValue(''), 10)
  
                this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTimeErrMsg')?.setValue('Physician already scheduled in this time range')
                setTimeout(() => this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                 this.toastr.error('Physician already scheduled in this time range')
              } else {
                setTimeout(() => this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTime')?.setValue(''), 10)
                this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTimeErrMsg')?.setValue('Physician already scheduled in this time range')
                setTimeout(() => this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Physician already scheduled in this time range')
                // set error for the end date at the selected index
              }
              isErr = true;
            }
          }
          //  else if ((val.scheduleStartTime === 0 && selectedTime > val.scheduleEndTime) || (val.scheduleEndTime === 0 && selectedTime < val.scheduleStartTime)) {
          //   if (isStartTime) {

          //     setTimeout(()=>this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTime')?.setValue(''),10)
          //     this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTimeErrMsg')?.setValue('Invalid')
          //     setTimeout(() => this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('startTimeErrMsg')?.setValue(''), 1500);
          //     this.toastr.error('Please select a valid time')
          //   } else {
          //     setTimeout(()=>this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTime')?.setValue(''),10)
          //     this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTimeErrMsg')?.setValue('Invalid')
          //     setTimeout(() => this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).at(physicianScheduleDetailsIndex).get('endTimeErrMsg')?.setValue(''), 1500);
          //     this.toastr.error('Please select a valid time')
          //     // set error for the end date at the selected index
          //   }
          //   isErr = true;
          // }

        })
      }
    }

  }

  showBorder(physicianScheduleHealthClinicIndex: number, index: number) {
    const ActiveList = this.physicianScheduleDetailsList(physicianScheduleHealthClinicIndex).value
    if (ActiveList[index].isDelete !== true && index < ActiveList.length - 1) {
      return true
    }
    return false;
  }
  // schedule end ----->

  // BusyHour Start ------>
  refreshBusyHours(event: any) {
    if (event) {
      this.getDaliBusyHours()
    }
  }

  private addBusyHoursGroup() {
    return this.fb.group({
      scheduleIdentifier: [''],
      weekDay: ['', Validators.required],
      startTime: [{ value: '', disabled: true }, Validators.required],
      endTime: [{ value: '', disabled: true }, Validators.required],
      dndIndicator: [false],
      eventDescription: [''],
      transactionResult: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      startTimeErrMsg: [''],
      isdataFill: [false],
      endTimeErrMsg: ['']
    })
  }

  addAnotherBusyHour() {
    this.dailyBusyHoursList().push(this.addBusyHoursGroup());
  }

  deleteBusyHours(dailyBusyHoursIndex: number, dailyBusyHoursIsAdd: boolean) {
    if (dailyBusyHoursIsAdd) {
      this.dailyBusyHoursList().removeAt(dailyBusyHoursIndex);
      this.addAnotherBusyHour();
    } else {
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isDelete')?.setValue(true);
    }
    const activelist = this.dailyBusyHoursList().value.filter((res: any) => res.isDelete !== true);
    if (!activelist.length) {
      const DeletedDailyBusyHoursList: Array<any> = []
      this.dailyBusyHoursList().getRawValue().forEach((val: any) => {
        DeletedDailyBusyHoursList.push(val)
      })
      if (DeletedDailyBusyHoursList.length) {
        this.saveDaliBusyHours({ dailyBusyHoursList: DeletedDailyBusyHoursList }, true)
      } else {
        this.addAnotherBusyHour();
      }
    }
  }

  dailyBusyHoursList() {
    return this.busyHoursform.get('dailyBusyHoursList') as FormArray;
  }

  getBusyHoursController(dailyBusyHoursIndex: number, controlName: any) {
    const controllArray = <any>this.dailyBusyHoursList();
    return controllArray.controls[dailyBusyHoursIndex].controls[controlName];
  }

  busyHoursChange(dailyBusyHoursIndex: number, dailyBusyHoursIsAdd: boolean) {
    this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isdataFill')?.setValue(true);
    if (!dailyBusyHoursIsAdd) {
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isChange')?.setValue(true);
    }
  }

  busyHoursChangeWeakDay(dailyBusyHoursIndex: number, dailyBusyHoursIsAdd: boolean, weakDay: any) {
    this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isdataFill')?.setValue(true);
    if (!dailyBusyHoursIsAdd) {
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isChange')?.setValue(true);
    }
    if (weakDay) {
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.enable()
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.setValue('')
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.enable()
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue('')
    }
  }

  busyHoursChangeTime(dailyBusyHoursIndex: number, dailyBusyHoursIsAdd: boolean, time: any, weakDay: any, isStartTime: any) {
    this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isdataFill')?.setValue(true);
    if (!dailyBusyHoursIsAdd) {
      this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('isChange')?.setValue(true);
    }
    let startTimeValue = 0
    startTimeValue = this.utilityService.get12FormatTimeIntoMinute(this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.value)
    if (time && weakDay) {
      const selectedTime = this.utilityService.get12FormatTimeIntoMinute(time);
      const refTimeArray: Array<any> = [];
      this.dailyBusyHoursList().controls.forEach((val: any, index: number) => {
        if (!val.value.isDelete) {
          refTimeArray.push({
            weakDay: val.value.weekDay,
            scheduleStartTime: this.utilityService.get12FormatTimeIntoMinute(val.value.startTime),
            scheduleEndTime: this.utilityService.get12FormatTimeIntoMinute(val.value.endTime)
          })
        }
        if (isStartTime) {
          this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue('')
        }
      })
      let isErr = false;
      if (refTimeArray.length) {
        refTimeArray.forEach((val: any, index: number) => {
          if (!isErr && val.weakDay == weakDay) {
            if ((val.scheduleStartTime && val.scheduleEndTime && !isStartTime && startTimeValue && startTimeValue <= val.scheduleStartTime && selectedTime >= val.scheduleStartTime && selectedTime >= val.scheduleEndTime) || (val.scheduleStartTime && selectedTime > val.scheduleStartTime) && (val.scheduleEndTime && selectedTime < val.scheduleEndTime)) {
              if (isStartTime) {
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.setValue(''), 10)

                this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Already busy hours scheduled in this time range')
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Already busy hours scheduled in this time range')
              } else {
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue(''), 10)
                this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Already busy hours scheduled in this time range')
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Already busy hours scheduled in this time range')
                // set error for the end date at the selected index
              }
              isErr = true;
            }
            // else if ((val.scheduleStartTime === 0 && selectedTime > val.scheduleEndTime) || (val.scheduleEndTime === 0 && selectedTime < val.scheduleStartTime)) {
            //   if (isStartTime) {

            //     setTimeout(()=>this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.setValue(''),10)
            //     this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Invalid time duration')
            //     setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
            //     this.toastr.error('Please select a valid time')
            //   } else {
            //     setTimeout(()=>this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue(''),10)
            //     this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Invalid time duration')
            //     setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
            //     this.toastr.error('Please select a valid time')
            //     // set error for the end date at the selected index
            //   }
            //   isErr = true;
            // }
          }
        })
      }
    }
  }

  createBusyHoursForm(data: any) {
    if (data.length) {
      data.forEach((busyHours: any, index: number) => {
        const tempBusyHours = {
          scheduleIdentifier: busyHours.scheduleIdentifier,
          dndIndicator: busyHours.dndIndicator === 'Y',
          weekDay: busyHours.weekDay,
          startTime: this.utilityService.timeFormateInto12Hours(busyHours.startTime),
          endTime: this.utilityService.timeFormateInto12Hours(busyHours.endTime),
          eventDescription: busyHours.eventDescription,
          transactionResult: '',
          isAdd: false,
          isChange: false,
          isDelete: false,
          isdataFill: true,
        }
        this.addAnotherBusyHour();
        this.dailyBusyHoursList().at(this.dailyBusyHoursList().length - 1).patchValue(tempBusyHours)
        this.dailyBusyHoursList().at(this.dailyBusyHoursList().length - 1).get('startTime')?.enable()
        this.dailyBusyHoursList().at(this.dailyBusyHoursList().length - 1).get('endTime')?.enable()
      })
    }
    this.addAnotherBusyHour();
  }

  getDaliBusyHours = async (healthClinicID?: string) => {
    const reqData: any = {
      apiRequest: {
        healthClinicID: healthClinicID ? healthClinicID : '',
        physicianUserCode: this.selectedPhysicianDetails.physicianUserCode,
      },
    }
    this.physicianScheduleService.GetDaliBusyHours(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const data: Array<any> = res.apiResponse.dailyBusyHoursList ? res.apiResponse.dailyBusyHoursList : []
          this.dailyBusyHoursList().clear();
          this.createBusyHoursForm(data);
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error('Dali busy hours could not fetch due to some error')
        }
      })
  }

  saveDaliBusyHours = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.busyHoursform);
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          physicianUserCode: this.selectedPhysicianDetails.physicianUserCode,
          dailyBusyHoursCount: 0,
          dailyBusyHoursList: []
        }
      }
      data.dailyBusyHoursList.forEach((busyHours: any) => {
        const tempBusyHours = {
          scheduleIdentifier: busyHours.scheduleIdentifier,
          dndIndicator: busyHours.dndIndicator ? 'Y' : 'N',
          weekDay: +busyHours.weekDay,
          startTime: this.utilityService.timeFormateInto24Hours(busyHours.startTime),
          endTime: this.utilityService.timeFormateInto24Hours(busyHours.endTime),
          eventDescription: busyHours.eventDescription,
          actionIndicator: '',
          transactionResult: '',
        }
        if (busyHours.isAdd) {
          tempBusyHours.actionIndicator = 'ADD'
        } else {
          if (busyHours.isDelete) {
            tempBusyHours.actionIndicator = 'DEL'
          } else {
            if (busyHours.isChange) {
              tempBusyHours.actionIndicator = 'UPD'
            } else {
              tempBusyHours.actionIndicator = ''
            }
          }
        }
        reqData.apiRequest.dailyBusyHoursList.push(tempBusyHours)
      })
      reqData.apiRequest.dailyBusyHoursCount = reqData.apiRequest.dailyBusyHoursList.length
      this.physicianScheduleService.DaliBusyHoursSetup(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Busy Hours Saved')
            this.getDaliBusyHours()
            this.miniCalComponent.refreshCalendar();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error('Busy Hours could not save due some error ')
          }
        })
    }
  }



  // BusyHour End ------>

  private intializingFormGroup() {
    this.holidayForm = this.fb.group({
      holidayDetailsList: this.fb.array([this.addHolidayDetailsGroup()]),
    })
    this.physicianScheduleForm = this.fb.group({
      physicianScheduleCount: [''],
      physicianScheduleHealthClinicList: this.fb.array([])
    })
    this.searchPhysicianForm = this.fb.group({
      physicianName: [''],
      consultationTime: [''],
      consultationTimeIsAdd: [true],
      consultationTimeIsChange: [false],
      consultationTimeIsDelete: [false],
    })
    this.busyHoursform = this.fb.group({
      dailyBusyHoursList: this.fb.array([])
    })
  }

  private intializingMessage() {
    this.errorMessage = {
      ScheduleError: {
        physicianScheduleHealthClinic: {
          healthClinicID: {
            required: PHYSICIAN_SCHEDULE_ERR_MSG.ERR_MSG_REQUIERD_healthClinicID
          },
          consultationFee: {
            required: PHYSICIAN_SCHEDULE_ERR_MSG.ERR_MSG_REQUIERD_consultationFee
          },
          consultationTime: {
            required: PHYSICIAN_SCHEDULE_ERR_MSG.ERR_MSG_REQUIERD_consultationTime
          },
          physicianScheduleDetailsList: {
            weekDay: {
              required: PHYSICIAN_SCHEDULE_ERR_MSG.ERR_MSG_REQUIERD_weekDay
            },
            startTime: {
              required: PHYSICIAN_SCHEDULE_ERR_MSG.ERR_MSG_REQUIERD_startTime
            },
            endTime: {
              required: PHYSICIAN_SCHEDULE_ERR_MSG.ERR_MSG_REQUIERD_endTime
            }
          }
        },
        consultationTime: {
          required: 'Consultation time is required'
        },
        physician: {
          required: 'Please select a physician'
        }
      },
      holidaysError: {
        holidayStartDate: {
          required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOLIDAY_START_DATE
        },
        holidayEndDate: {
          required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOLIDAY_END_DATE
        },
        holidayDescription: {
          maxlength: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_MAX_LENGTH_HOLIDAY_DESCRIPTION,
          required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_HOLIDAY_DESCRIPTION
        }
      },
      busyHoursError: {
        weekDay: {
          required: BUSYHOURS_ERROR_MSG.ERR_MSG_REQUIERD_BUSYHOURS_DAY
        },
        startTime: {
          required: BUSYHOURS_ERROR_MSG.ERR_MSG_REQUIERD_BUSYHOURS_START_TIME
        },
        endTime: {
          required: BUSYHOURS_ERROR_MSG.ERR_MSG_REQUIERD_BUSYHOURS_END_TIME
        }
      }
    }
  }

}
