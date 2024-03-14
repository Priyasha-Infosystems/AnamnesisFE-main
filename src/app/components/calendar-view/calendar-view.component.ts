import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  Renderer2,
  ChangeDetectorRef,
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
import { UtilityService } from '@services/utility.service';
import { IWeakDay } from 'src/app/models/utility.models';

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
    primary: '#a27b28',
    secondary: '#FFF7E6'
  }
};

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  openModal: boolean = false;
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
  isScheduleFetched: boolean;
  refresh = new Subject<void>();
  events: any = [];
  requestKeyDetails: any;
  rangeDates: any = [];
  openEventPopup: boolean = false;
  selectedEvents: any = [];
  patientSchedulelist: any = [];
  openPatientScheduleModal: boolean = false;
  selectedDayEvents: any = [];
  weekDays$: Observable<IWeakDay[]>;
  constructor(
    private physicianCalendarService: PhysicianCalendarService,
    public commonService: CommonService,
    public datePipe: DatePipe,
    private renderer: Renderer2,
    private physicianScheduleService: PhysicianScheduleService,
    public utilityService: UtilityService,
    private cdref: ChangeDetectorRef
  ) {
    this.weekDays$ = this.utilityService.getWeekDays();
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear().toString();
    this.selectedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? "";
  }

  ngOnInit(): void {
    this.events = [];
    this.getHolidayList();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.getDaliBusyHours();
    })
    this.getPhysicianAppointmentList();
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  getPhysicianAppointmentList = async () => {
    const reqData: any = {
      apiRequest: {
      }
    };
    await this.physicianScheduleService.getPhysicianAppointmentList(reqData)
      .then(async (res: any) => {
        this.patientSchedulelist = [];
        if (!this.commonService.isApiError(res)) {
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
        if (this.patientSchedulelist.length > 0) {
          this.patientSchedulelist.forEach((schedule: any) => {
            const holidayObj = {
              start: new Date(schedule[0].scheduleDate),
              end: new Date(schedule[0].scheduleDate),
              title: 'Patient Schedule',
              color: { ...colors['orange'] },
              allDay: true,
              evType: 'A'
            }
            this.events.push(holidayObj);
          });
        }
        this.isScheduleFetched = true;
        this.refresh.next();
      })
      .catch((err: any) => {
      })
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
    const reqData: any = {
      apiRequest: {
        processYear: this.selectedYear,
        commercialID: ''
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
            })
          }
        }
        this.isHolidayListFetched = true;
      })
      .catch((err: any) => {
      })
  }

  getDateWithTimestamps(date: any) {
    var timestamps = [];
    var current = new Date(date);
    current.setHours(8);
    current.setMinutes(30);
    current.setSeconds(0);
    current.setMilliseconds(0);
    while (current.getDate() === date.getDate() && current.getHours() <= 20 && current.getMinutes() <= 30) {
      timestamps.push(new Date(current));
      current.setTime(current.getTime() + 30 * 60 * 1000);
    }
    const rangeObj: any = []
    for (var i = 0; i < timestamps.length; i += 1) {
      var obj: any = {
        start: '',
        end: ''
      }
      obj.start = timestamps[i]
      obj.end = timestamps[i + 1]
      if (obj.start && obj.end) {
        rangeObj.push(obj);
      }
    }
    return rangeObj;
  }

  getAllDayEvents() {
    var date = new Date();
    var timestamps = this.getDateWithTimestamps(date);
    const allEvents: any = []
    timestamps.forEach((timestamp: any) => {
      const calendarObj = {
        start: timestamp.start,
        end: timestamp.end,
        startTime: timestamp.start.toLocaleTimeString(),
        endTime: timestamp.end.toLocaleTimeString(),
        title: '',
        color: { ...colors['yellow'] },
        evType: 'N',
        check: false
      }
      allEvents.push(calendarObj)
    });
    return allEvents
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }, event: any): void {
    const regEvents: any = events
    const selectedDayEvents: CalendarEvent[] = [...this.getAllDayEvents()];
    let isHoliday: boolean = false
    if (regEvents.length && regEvents[0].evType === 'H') {
      regEvents.forEach((rEv: any) => {
        if (rEv.evType === 'H') {
          isHoliday = true;
        }
      })
    }
    const ev: any = [...this.events]
    for (const calendarEvent of ev) {
      if (isHoliday && calendarEvent.evType === 'H') {
        selectedDayEvents.forEach((events: any, index: any) => {
          selectedDayEvents[index] = { ...calendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
        })
      }
      if (!isHoliday && startOfDay(calendarEvent.start) <= startOfDay(event.day.date) && endOfDay(calendarEvent.end) >= endOfDay(event.day.date) && calendarEvent.evType !== 'A') {
        selectedDayEvents.forEach((events: any, index: any) => {
          const refEvents = { ...events }
          const start = this.utilityService.timeFormateInto24Hours(refEvents.startTime)
          const end = this.utilityService.timeFormateInto24Hours(refEvents.endTime)
          const rangeStartTime = new Date(`2000-01-01T${start}`);
          const rangeEndTime = new Date(`2000-01-01T${end}`);
          const periodStartTime = new Date(`2000-01-01T${calendarEvent.startTime}`);
          const periodEndTime = new Date(`2000-01-01T${calendarEvent.endTime}`);
          if (periodStartTime <= rangeStartTime && periodEndTime >= rangeEndTime) {
            selectedDayEvents[index] = { ...calendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
          } else if (periodStartTime > rangeStartTime && periodStartTime < rangeEndTime) {
            selectedDayEvents[index] = { ...calendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
          } else if (periodEndTime < rangeEndTime && periodEndTime > rangeStartTime) {
            selectedDayEvents[index] = { ...calendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
          }
        })
      }
      if (startOfDay(calendarEvent.start) <= startOfDay(event.day.date) && endOfDay(calendarEvent.end) >= endOfDay(event.day.date) && calendarEvent.evType === 'A') {
        this.patientSchedulelist[0].forEach((scheduleList: any) => {
          selectedDayEvents.forEach((events: any, index: any) => {
            const refEvents = { ...events }
            const start = this.utilityService.timeFormateInto24Hours(refEvents.startTime)
            const end = this.utilityService.timeFormateInto24Hours(refEvents.endTime)
            const rangeStartTime = new Date(`2000-01-01T${start}`);
            const rangeEndTime = new Date(`2000-01-01T${end}`);
            const periodStartTime = new Date(`2000-01-01T${scheduleList.sessionStartTime}`);
            const periodEndTime = new Date(`2000-01-01T${scheduleList.sessionEndTime}`);
            const scheduleCalendarEvent = { ...calendarEvent }
            const filteredSchedeule = scheduleList.appointmentInformationList.filter((schedule: any) => {
              const appointmentTimeFormat = new Date(`2000-01-01T${schedule.appointmentTime}`)
              return appointmentTimeFormat >= rangeStartTime && appointmentTimeFormat < rangeEndTime
            })
            scheduleCalendarEvent.appointmentInformationList = filteredSchedeule;
            scheduleCalendarEvent.healthClinicName = scheduleList.healthClinicName;
            scheduleCalendarEvent.sessionStartTime = events.startTime;
            scheduleCalendarEvent.sessionEndTime = events.endTime;
            if (periodStartTime <= rangeStartTime && periodEndTime >= rangeEndTime) {
              selectedDayEvents[index] = { ...scheduleCalendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
            } else if (periodStartTime > rangeStartTime && periodStartTime < rangeEndTime) {
              selectedDayEvents[index] = { ...scheduleCalendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
            } else if (periodEndTime < rangeEndTime && periodEndTime > rangeStartTime) {
              selectedDayEvents[index] = { ...scheduleCalendarEvent, start: events.start, end: events.end, startTime: events.startTime, endTime: events.endTime, check: false }
            }
          })
        })
      }
    }
    this.selectedDayEvents = [];
    this.selectedDayEvents = [...selectedDayEvents];
    if (this.selectedDayEvents.length) {
      this.openEventPopup = true;
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
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent: any) => {
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

  getWeakDayNameFormCode(WeakDay: any) {
    let weekDays: any = [];
    this.weekDays$.subscribe(res => {
      weekDays = res;
    })
    const foundWeekDay = weekDays.find((res: any) => res.dayCode === +WeakDay)
    return foundWeekDay ? foundWeekDay.dayName : ''
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.selectedDayEvents = [];
    this.selectedDayEvents = [this.modalData.event];
    if (event.color?.primary === "#a27b28") {
      this.openPatientScheduleModal = true;
    } else {
      this.openModal = true;
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  closeEventPopup() {
    this.openEventPopup = false;
  }

  closeModal() {
    this.openModal = false;
    this.openPatientScheduleModal = false;
  }

  getTwentyFourHourTime(date: any) {
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0');
  }

  getTimeRange(event: any) {
    if (event.evType === "B" || event.evType === "N") {
      const startTime = this.utilityService.timeFormateInto12Hours(this.getTwentyFourHourTime(event.start))
      const endTime = this.utilityService.timeFormateInto12Hours(this.getTwentyFourHourTime(event.end))
      return startTime + '\n' + 'To' + '\n' + endTime;
    }
    if (event.evType === "H") {
      const startTime = this.datePipe.transform(new Date(event.start), 'd-MMM-yyyy');
      const endTime = this.datePipe.transform(new Date(event.end), 'd-MMM-yyyy');
      return startTime + '\n' + 'To' + '\n' + endTime;
    }
    return ''
  }

  getFromTimeRange(event: any) {
    if (event.evType === "B" || event.evType === "N" || event.evType === "H") {
      const startTime = this.utilityService.timeFormateInto12Hours(this.getTwentyFourHourTime(event.start))
      return startTime;
    }
    // if (event.evType === "H") {
    //   const startTime = this.datePipe.transform(new Date(event.start), 'd-MMM-yyyy');
    //   return startTime;
    // }
    return ''
  }

  getToTimeRange(event: any) {
    if (event.evType === "B" || event.evType === "N" || event.evType === "H") {
      const endTime = this.utilityService.timeFormateInto12Hours(this.getTwentyFourHourTime(event.end))
      return endTime;
    }
    // if (event.evType === "H") {
    //   const endTime = this.datePipe.transform(new Date(event.end), 'd-MMM-yyyy');
    //   return endTime;
    // }
    return ''
  }

  getScheduleTimeRange(event: any) {
    const startTime = this.utilityService.timeFormateInto12Hours(event.sessionStartTime)
    return startTime;
  }

  getClass(event: any) {
    if (event.evType === "B" && event.title === 'Busy Hours') {
      return 'box YellowBox';
    }
    if (event.evType === "B" && event.title !== 'Busy Hours') {
      return 'box PinkBox';
    }
    if (event.evType === "H") {
      return 'box BlueBox'
    }
    return ''
  }
}
