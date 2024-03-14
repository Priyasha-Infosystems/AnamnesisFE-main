import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  Renderer2,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Observable, Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarView,
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { PhysicianCalendarService } from '@services/physician-calendar.service';
import { CommonService } from '@services/common.service';
import { DatePipe } from '@angular/common';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { CalendarUtils } from 'angular-calendar';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from '@services/form.service';
import { UtilityService } from '@services/utility.service';
import { IWeakDay } from 'src/app/models/utility.models';
import { ToastrService } from 'ngx-toastr';
import { DiagnosticCenterScheduleService } from '@services/diagnostic-center-schedule.service';
import { BUSYHOURS_ERROR_MSG, DIAGONOSTIC_ERROR_MESSAGE } from '@constant/constants';

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  orange: {
    primary: '#FFF7E6',
    secondary: '#FFF7E6'
  }
};

@Component({
  selector: 'app-mini-calendar-view',
  templateUrl: './mini-calendar-view.component.html',
  styleUrls: ['./mini-calendar-view.component.css']
})
export class MiniCalendarViewComponent implements OnInit, OnChanges {
  @Output()
  preHoliDayArray: EventEmitter<{}> = new EventEmitter<{}>();
  @Output()
  refreshBusyHours: EventEmitter<{}> = new EventEmitter<{}>();
  @Input() diagnosticCentreID: string;
  selectedDay: any;
  activeDayIsOpen: boolean = true;
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  selectedDate: string = "";
  selectedYear: string = "";
  isHolidayListFetched: boolean;
  isBusyHoursFetched: boolean;
  refresh = new Subject<void>();
  events: Array<any> = [];
  requestKeyDetails: any;
  rangeDates: any = [];
  selectedDayEvents: any = [];
  openHolidayPopup: boolean = false;
  selectedHolidayForm: FormGroup;
  openBusyHoursPopup: boolean = false;
  weekDays$: Observable<IWeakDay[]>;
  public busyHoursform: FormGroup;
  public errorMessage: any = {};
  public timePickerTheme: any = {};

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private physicianCalendarService: PhysicianCalendarService,
    public commonService: CommonService,
    public datePipe: DatePipe,
    private renderer: Renderer2,
    private physicianScheduleService: PhysicianScheduleService,
    private diagnosticCenterService: DiagnosticCenterScheduleService,
    private calendarUtils: CalendarUtils,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private cdref: ChangeDetectorRef

  ) {
    this.timePickerTheme = this.utilityService.timePickerTheme;
    this.weekDays$ = this.utilityService.getWeekDays();
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear().toString();
    this.selectedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? "";
    this.intializingMessage()
    this.busyHoursform = this.fb.group({
      dailyBusyHoursList: this.fb.array([])
    })
  }

  ngOnChanges(): void {
  }

  ngOnInit(): void {
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.events = [];
    this.isHolidayListFetched = false;
    this.isBusyHoursFetched = false;

    this.getHolidayList();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.getDaliBusyHours();
    })
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    const selectedCalYear = this.viewDate.getFullYear().toString();
    if (this.selectedYear !== selectedCalYear) {
      this.selectedYear = selectedCalYear
      this.ngOnInit();
    }
    const holidayLists: any = [];
    this.rangeDates.forEach((dates: any) => {
      holidayLists.push(this.datePipe.transform(new Date(dates), 'yyyy-MM-dd'))
    })
    if (holidayLists.length) {
      renderEvent.body.forEach((day) => {
        const curDt = this.datePipe.transform(new Date(day.date), 'yyyy-MM-dd')
        if (day.inMonth && holidayLists.indexOf(curDt) >= 0) {
          day.cssClass = 'bg-blue';
        }
      });
    }
  }

  findRecurringDates(startDate: any) {
    let nextYear = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    let recurringDates = [];

    while (startDate < nextYear) {
      recurringDates.push(new Date(startDate.getTime()));
      startDate.setDate(startDate.getDate() + 7);
    }
    return recurringDates;
  }

  getDaliBusyHours = async () => {
    const reqData: any = {
      apiRequest: {
        physicianUserCode: this.requestKeyDetails.userCode,
      },
    }
    this.physicianScheduleService.GetDaliBusyHours(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const data: Array<any> = res.apiResponse.dailyBusyHoursList.length > 0 ? res.apiResponse.dailyBusyHoursList : [];
          data.forEach((dd: any) => {
            const d = new Date();
            const dayOfWeek = d.getDay();
            const currentDayOfWeek = dayOfWeek === 0 ? 1 : dayOfWeek + 1;
            const weekDay = d.getDate();
            const remDay = dd.weekDay - currentDayOfWeek;
            const fd = new Date();
            fd.setDate(weekDay + remDay);
            const reqEvnt = this.findRecurringDates(fd);
            reqEvnt.forEach((evnt: any) => {
              const fd = this.datePipe.transform(new Date(evnt), 'yyyy-MM-dd')!.split('-');
              const tds = dd.startTime.split(':');
              const tde = dd.endTime.split(':');
              const event: any = {
                start: new Date(+fd[0], +fd[1] - 1, +fd[2], tds[0], tds[1]),
                end: new Date(+fd[0], +fd[1] - 1, +fd[2], tde[0], tde[1]),
                title: dd.dndIndicator !== "N" ? "Do Not Disturb" : 'Busy Hours',
                color: dd.dndIndicator !== "N" ? { ...colors['red'] } : { primary: '#e3bc08', secondary: '#FDF1BA' },
                scheduleIdentifier: dd.scheduleIdentifier,
                evType: 'B',
                startTime: dd.startTime,
                endTime: dd.endTime,
                eventDescription: dd.eventDescription,
                dndIndicator: dd.dndIndicator,
                weekDay: dd.weekDay
              }
              this.events.push(event);
            })
          })
        }
        this.isBusyHoursFetched = true;
        this.refresh.next();
      })
      .catch((err: any) => {
      })
  }

  groupDatesByRange(dates: any) {
    let startDate = dates[0];
    let endDate = dates[0];
    const result = [];

    for (let i = 1; i < dates.length; i++) {
      if (dates[i] - endDate === 86400000) {
        endDate = dates[i];
      } else {
        result.push({ startDate, endDate });
        startDate = dates[i];
        endDate = dates[i];
      }
    }

    result.push({ startDate, endDate });
    return result;
  }

  async getHolidayList() {
    let isDiagnosticCentre = false
    const reqData: any = {
      apiRequest: {
        processYear: this.selectedYear,
        commercialID: this.diagnosticCentreID ? this.diagnosticCentreID : ''
      }
    };
    await this.physicianCalendarService.getHolidayList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.rangeDates = [];
          if (res.apiResponse.holidayInformationList.length > 0) {
            res.apiResponse.holidayInformationList.forEach((holiday: any) => {
              this.rangeDates.push(new Date(holiday.holidayDate))
            })
          }
          const holObjArr: Array<any> = [];
          const groupDates = this.rangeDates.length ? this.groupDatesByRange(this.rangeDates) : [];
          if (groupDates.length) {
            groupDates.forEach((group: any) => {
              const selectedHolidayDate = res.apiResponse.holidayInformationList.find((list: any) => list.holidayDate === this.datePipe.transform(new Date(group.startDate), 'yyyy-MM-dd'));
              const holidayObj = {
                start: group.startDate,
                end: group.endDate,
                title: selectedHolidayDate.holidayDescription ? selectedHolidayDate.holidayDescription : 'Holiday',
                color: { ...colors['blue'] },
                allDay: true,
                evType: 'H'
              }
              this.events.push(holidayObj);
              const holObj = {
                holidayStartDate: this.getTimeStamp(group.startDate),
                holidayEndDate: this.getTimeStamp(group.endDate)
              }
              holObjArr.push(holObj)
            })
            this.preHoliDayArray.emit(holObjArr);
          }
        }
        this.isHolidayListFetched = true;
      })
      .catch((err: any) => {
      })
  }

  getTimeStamp(date: any) {
    const mDate = new Date(date);
    return date ? mDate.getTime() : 0;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }, event: any): void {
    const selectedDayEvents: CalendarEvent[] = [];
    const ev: any = [...this.events]
    for (const calendarEvent of ev) {
      if (startOfDay(calendarEvent.start) <= startOfDay(event.day.date) && endOfDay(calendarEvent.end) >= endOfDay(event.day.date)) {
        selectedDayEvents.push({ ...calendarEvent, check: false });
      }
    }
    // this.selectedHolidayEvent = {};
    // if (selectedDayEvents.length) {
    //   const holidayEvent = selectedDayEvents.find((evnt: any) => evnt.color.primary === "#1e90ff");
    //   if (holidayEvent) {
    //     this.selectedHolidayEvent = holidayEvent;
    //     this.createSelectedForm()
    //     this.openHolidayPopup = true;
    //   }
    // }
    this.selectedDayEvents = [];
    this.selectedDayEvents = [...selectedDayEvents];
    if (this.selectedDayEvents.length) {
      this.openHolidayPopup = true;
    }
    const selectedElement = event.sourceEvent.target;
    if (this.selectedDay) {
      this.renderer.setStyle(this.selectedDay, 'background-color', 'transparent');
    }
    this.renderer.setStyle(selectedElement, 'background-color', '#0000ff26');
    this.selectedDay = selectedElement;
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
      this.selectedDate = this.datePipe.transform(new Date(date), 'yyyy-MM-dd') ?? "";
    }
    const busyHoursList: Array<any> = []
    this.selectedDayEvents.forEach((selectedDayEvent: any) => {
      if (selectedDayEvent.evType === 'B') {
        const tempBusyHours = {
          scheduleIdentifier: selectedDayEvent.scheduleIdentifier,
          dndIndicator: selectedDayEvent.dndIndicator,
          weekDay: selectedDayEvent.weekDay,
          startTime: selectedDayEvent.startTime,
          endTime: selectedDayEvent.endTime,
          eventDescription: selectedDayEvent.eventDescription,
        }
        busyHoursList.push(tempBusyHours);
      }
    })
    this.createBusyHoursForm(busyHoursList);
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
    if (time && weakDay) {
      const selectedTime = this.utilityService.get12FormatTimeIntoMinute(time);
      const refTimeArray: Array<any> = [];
      this.dailyBusyHoursList().controls.forEach((val: any, index: number) => {
        if (!val.value.isDelete) {
          refTimeArray.push({
            weakDay: val.getRawValue().weekDay,
            scheduleStartTime: this.utilityService.get12FormatTimeIntoMinute(val.getRawValue().startTime),
            scheduleEndTime: this.utilityService.get12FormatTimeIntoMinute(val.getRawValue().endTime)
          })
        }
        if (isStartTime) {
          this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue('')
        }
      })
      let isErr = false;
      if (refTimeArray.length) {
        refTimeArray.forEach((val: any, index: number) => {
          if (!isErr && index !== dailyBusyHoursIndex && val.weakDay == weakDay) {
            if ((val.scheduleStartTime && selectedTime > val.scheduleStartTime) && (val.scheduleEndTime && selectedTime < val.scheduleEndTime)) {
              if (isStartTime) {
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.setValue(''), 10)
                this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Invalid time duration')
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Please select a valid time')
              } else {
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue(''), 10)
                this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Invalid time duration')
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Please select a valid time')
                // set error for the end date at the selected index
              }
              isErr = true;
            } else if ((val.scheduleStartTime === 0 && selectedTime > val.scheduleEndTime) || (val.scheduleEndTime === 0 && selectedTime < val.scheduleStartTime)) {
              if (isStartTime) {
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTime')?.setValue(''), 10)
                this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Invalid time duration')
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Please select a valid time')
              } else {
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('endTime')?.setValue(''), 10)
                this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue('Invalid time duration')
                setTimeout(() => this.dailyBusyHoursList().at(dailyBusyHoursIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Please select a valid time')
                // set error for the end date at the selected index
              }
              isErr = true;
            }
          }
        })
      }
    }
  }

  private addBusyHoursGroup() {
    return this.fb.group({
      scheduleIdentifier: [''],
      weekDay: [{ value: '', disabled: true }, Validators.required],
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

  createBusyHoursForm(data: any) {
    this.dailyBusyHoursList().clear()
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
  }
  saveDaliBusyHours = async (data: any, isValid: boolean) => {
    this.formService.markFormGroupTouched(this.busyHoursform);
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          physicianUserCode: this.requestKeyDetails.userCode,
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
            this.refreshBusyHours.emit(true)
            this.openHolidayPopup = false;
            this.refreshCalendar();
            this.selectedDayEvents = [];
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

  checkEventsForDelete(index: number) {
    this.selectedDayEvents[index].check = !this.selectedDayEvents[index].check
  }

  deleteEvents = async () => {
    const HoliDayList: any = []
    const BusyHoursList: any = []
    let holidayDeleteCompleate = false;
    let busyHoursDeleteCompleate = false;
    this.selectedDayEvents.forEach((val: any) => {
      if (val.evType === 'H' && val.check) {
        HoliDayList.push(val)
      } else if (val.evType === 'B' && val.check) {
        BusyHoursList.push(val)
      }
    })
    if (HoliDayList.length) {
      const reqData: any = {}
      if (this.diagnosticCentreID) {
        reqData.apiRequest = {
          holidayCount: HoliDayList.length,
          commercialID: this.diagnosticCentreID,
          holidayDetailsList: []
        }
      } else {
        reqData.apiRequest = {
          holidayCount: HoliDayList.length,
          physicianUserID: this.requestKeyDetails.userID,
          holidayDetailsList: []
        }
      }
      HoliDayList.forEach((holiday: any, index: number) => {
        const holidayDetails = {
          actionIndicator: 'DEL',
          holidayDescription: holiday.title,
          holidayEndDate: this.utilityService.getLocalDate(holiday.end),
          holidaySeqNo: index + 1,
          holidayStartDate: this.utilityService.getLocalDate(holiday.start),
          transactionResult: ''
        }
        reqData.apiRequest.holidayDetailsList.push(holidayDetails)
      })
      if (this.diagnosticCentreID) {
        this.diagnosticCenterService.addHolidaySchedules(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.toastr.success('Holidays delete')
              holidayDeleteCompleate = true
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Holidays couldn't delete due some error");
            }
          })
      } else {
        await this.physicianScheduleService.addHolidaySchedules(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.toastr.success('Holidays delete')
              holidayDeleteCompleate = true
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Holidays couldn't delete due some error");
            }
          })
      }

    } else {
      holidayDeleteCompleate = true
    }
    if (BusyHoursList.length) {
      const reqData: any = {
        apiRequest: {
          physicianUserCode: this.requestKeyDetails.userCode,
          dailyBusyHoursCount: 0,
          dailyBusyHoursList: []
        }
      }
      BusyHoursList.forEach((busyHours: any) => {
        const tempBusyHours = {
          scheduleIdentifier: busyHours.scheduleIdentifier,
          dndIndicator: busyHours.dndIndicator,
          weekDay: busyHours.weekDay,
          startTime: busyHours.startTime,
          endTime: busyHours.endTime,
          eventDescription: busyHours.eventDescription,
          actionIndicator: 'DEL',
          transactionResult: '',
        }
        reqData.apiRequest.dailyBusyHoursList.push(tempBusyHours)
      })
      reqData.apiRequest.dailyBusyHoursCount = reqData.apiRequest.dailyBusyHoursList.length;
      await this.physicianScheduleService.DaliBusyHoursSetup(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            busyHoursDeleteCompleate = true
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error('Busy Hours could not save due some error ')
          }
        })
    } else {
      busyHoursDeleteCompleate = true
    }
    if (holidayDeleteCompleate && busyHoursDeleteCompleate) {
      if (BusyHoursList.length) {
        this.refreshBusyHours.emit(true)
      }
      this.openHolidayPopup = false;
      this.refreshCalendar();
      this.selectedDayEvents = [];
    }
  }

  refreshCalendar() {
    this.ngOnInit();
  }

  getWeakDayNameFormCode(WeakDay: any) {
    let weekDays: any = [];
    this.weekDays$.subscribe(res => {
      weekDays = res;
    })
    const foundWeekDay = weekDays.find((res: any) => res.dayCode === +WeakDay)
    return foundWeekDay ? foundWeekDay.dayName : ''
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.selectedDayEvents = [];
    this.selectedDayEvents = [this.modalData.event];
    if (this.selectedDayEvents.length) {
      this.openHolidayPopup = true;
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  closeHolidayPopup() {
    this.openHolidayPopup = false;
  }

  closeBusyHoursPopUp() {
    this.openBusyHoursPopup = false
  }

  private intializingMessage() {
    this.errorMessage = {
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
