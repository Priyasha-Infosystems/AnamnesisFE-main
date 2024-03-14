import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { IWeakDay } from '../models/utility.models';
import { of } from 'rxjs';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { LocalStorageService } from './localService/localStorage.service';
import { Store } from '@ngrx/store';
import { isUserMenuListFetched, userMenuLists } from 'src/store/actions/utility.actions';
import { isLoginClicked, userProfile } from 'src/store/actions/login.actions';
import { isProfileCompleted, isSecQuestionSet, setProfileDetails, setUserID } from 'src/store/actions/profile.actions';
import { CommonService } from './common.service';
import { MedicineDetailsService } from './medicine-details.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public timePickerTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#713bdb',
      primaryFontFamily: 'poppins',
    },
    dial: {
      dialBackgroundColor: '#713bdb',
    },
    clockFace: {
      clockFaceBackgroundColor: '#ba8fefbb',
      clockHandColor: '#713bdb',
      clockFaceTimeInactiveColor: '#fff'
    }
  };
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalStorageService,
    private store: Store<any>,
  ) {
  }

  /**
   * sortData(sort, itemList, fieldsName) => sort data base on sort field option
   * @param sort in sort object
   * @param itemList in item list
   * @param fieldsName in fields list
   */
  sortData(sort: any, itemList: any[], fieldsName: string[]) {
    const data = itemList.slice();
    const fieldName: string = fieldsName[sort.active];
    return data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return this.compare(a[fieldName], b[fieldName], isAsc);
    });
  }

  /**
   * compare(a, b, isAsc) => compare value base on sort wise
   * @param a in a value
   * @param b in b valua
   * @param isAsc in ascending & decending
   */
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /// TODO: Below all function is used in future so when we use that time we un comment and use
  log(message: any, values?: any) {
    if (!environment.production) {
    }
  }

  setLocalStore(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getLocalStore(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  clearStorageFor(key: string) {
    return localStorage.removeItem(key);
  }

  clearStorage() {
    return localStorage.clear();
  }

  showLoading() {
    this.spinner.show();
  }

  hideLoading() {
    this.spinner.hide();
  }

  showSuccessToast(msg: string | undefined) {
    this.toastr.success(msg, '', { positionClass: 'toast-bottom-right' });
  }

  showErrorToast(msg: string | undefined) {
    this.toastr.error(msg, '', { positionClass: 'toast-bottom-right' });
  }

  showInfoToast(msg: string | undefined) {
    this.toastr.info(msg, '', { positionClass: 'toast-bottom-right' });
  }

  showAlert(error: any) {
    this.showInfoToast(error);
    // const alert = this.alertCtrl.create({
    //   message: error,
    //   title: "Alert",
    //   buttons: ['Ok']
    // });
    // alert.present();
  }

  downloadCsvOrXlsx(data: unknown[], type: string, name: any) {
    let extension = '';
    let url = '';
    const ws = XLSX.utils.json_to_sheet(data);
    if (type === 'csv') {
      const blobData = XLSX.utils.sheet_to_csv(ws, {
        FS: ';',
      });
      url = window.URL.createObjectURL(new Blob([blobData]));
      extension = 'csv';
    } else {
      const workbook: XLSX.WorkBook = { Sheets: { orders: ws }, SheetNames: ['orders'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      url = window.URL.createObjectURL(blob);
      extension = 'xlsx';
    }
    const fileName = `${name}.${extension}`;
    this.downloadFile(url, fileName);
  }

  downloadFile(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  }

  download(url: string, downloadName: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = downloadName;
    a.click();
    document.body.removeChild(a);
  }

  onPageChanged(perPage: number, currentPage: any, eventPage: any) {
    if (perPage !== 0) {
      if (currentPage !== eventPage) {
        currentPage = eventPage;
      }
    }
    return { perPage, currentPage };
  }

  onPageSet(perPage: any, currentPage: number, isReset: any) {
    if (isReset) {
      currentPage = 1;
    }
    const perPageData = perPage;
    return { perPageData, currentPage, isReset };
  }

  getWeekDays() {
    const weekDays: IWeakDay[] = [
      { dayCode: 1, dayName: 'Sunday' },
      { dayCode: 2, dayName: 'Monday' },
      { dayCode: 3, dayName: 'Tuesday' },
      { dayCode: 4, dayName: 'Wednesday' },
      { dayCode: 5, dayName: 'Thursday' },
      { dayCode: 6, dayName: 'Friday' },
      { dayCode: 7, dayName: 'Saturday' },

    ];
    return of(weekDays);
  }
  get24TimeOf30MinGap() {
    const times: string[] = [
      '00:30 AM',
      '01:00 AM',
      '01:30 AM',
      '02:00 AM',
      '02:30 AM',
      '03:00 AM',
      '03:30 AM',
      '04:00 AM',
      '04:30 AM',
      '05:00 AM',
      '05:30 AM',
      '06:00 AM',
      '06:30 AM',
      '07:00 AM',
      '07:30 AM',
      '08:00 AM',
      '08:30 AM',
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 AM',
      '12:30 AM',
      '00:30 PM',
      '01:00 PM',
      '01:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
      '06:30 PM',
      '07:00 PM',
      '07:30 PM',
      '08:00 PM',
      '08:30 PM',
      '09:00 PM',
      '09:30 PM',
      '10:00 PM',
      '10:30 PM',
      '11:00 PM',
      '11:30 PM',
      '12:00 PM',
      '12:30 PM',

    ];
    return of(times);
  }

  timeFormateInto24Hours(time: string) {
    if(time.split(':')[0].length<2){
      time = '0'+time
    }
    if (time.split(' ', 2)[1] === 'PM') {
      if ((time as string).split(' ', 2)[0].split(':')[0] === '12') {
        return `${(((time as string).split(' ', 2)[0].split(':')[0]))}:${(time as string).split(' ', 2)[0].split(':')[1]}:00`
      } else {
        return `${(12 + (+(time as string).split(' ', 2)[0].split(':')[0]))}:${(time as string).split(' ', 2)[0].split(':')[1]}:00`
      }
    } else if (time.split(' ', 2)[1] === 'AM') {
      if ((time as string).split(' ', 2)[0].split(':')[0] === '12') {
        return `00:${(time as string).split(' ', 2)[0].split(':')[1]}:00`
      } else {
        return `${(time as string).split(' ', 2)[0].split(':')[0]}:${(time as string).split(' ', 2)[0].split(':')[1]}:00`
      }
    }
    return time
  }

  get12FormatTimeIntoMinute(time: string){
    let minute:number = 0;
    if(time && time !==''){
      if (time.split(' ', 2)[1] === 'PM') {
        if ((time as string).split(' ', 2)[0].split(':')[0] === '12') {
          minute = ((+(((time as string).split(' ', 2)[0].split(':')[0])))*60)+(+((time as string).split(' ', 2)[0].split(':')[1]))
        } else {
           minute = ((12 +(+(((time as string).split(' ', 2)[0].split(':')[0]))))*60)+(+((time as string).split(' ', 2)[0].split(':')[1]))
        }
      }else{
        if ((time as string).split(' ', 2)[0].split(':')[0] === '12') {
          minute = +((time as string).split(' ', 2)[0].split(':')[1])
        } else {
          minute = ((+(time as string).split(' ', 2)[0].split(':')[0])*60)+(+((time as string).split(' ', 2)[0].split(':')[1]))
        }
      }
    }

    return minute;
  }

  timeFormateInto12Hours(time:string){
    let tempTime;
    if(time.split(':')[0] === '12'){
      tempTime =`12:${time.split(':')[1]} PM`
    }else if(time.split(':')[0] === '00'){
      tempTime =`12:${time.split(':')[1]} AM`
    }
    else if((+time.split(':')[0])<12){
      tempTime =`${time.split(':')[0]}:${time.split(':')[1]} AM`
    }
    else if((+time.split(':')[0])%12){
      tempTime =`${(+time.split(':')[0])%12}:${time.split(':')[1]} PM`
    }
    return tempTime;
  }

  getLocalTime(date?:any) {
    let now = new Date();
    if(date){
      now = new Date(date);
    }
    const localDate = now.toLocaleDateString('en-US');
    const localTime = now.toLocaleTimeString();
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    return timestamp;
  }
  getLocalDate(date:any) {
    const now = new Date(date);
    const localDate = now.toLocaleDateString('en-US');
    const localTime = now.toLocaleTimeString();
    const dateTime = `${localDate} ${localTime}`;
    return new Date(dateTime);
  }

  async handleClearStore() {
    localStorage.clear();
    await this.localStorage.clearStorage();
    await this.localStorage.clearDataFromIndexedDB();
    this.store.dispatch(new userMenuLists([]));
    this.store.dispatch(new isUserMenuListFetched(false));
    this.store.dispatch(new userProfile([]));
    this.store.dispatch(new isSecQuestionSet(false));
    this.store.dispatch(new isProfileCompleted(false));
    this.store.dispatch(new setProfileDetails({}));
    this.store.dispatch(new setUserID(''));
    this.store.dispatch(new isLoginClicked(true));
  }

  getTimeStamp(date?: any,timeStamp?:string) {
    let time = 0;
    if(date && date !==''){
      let now = new Date(date);
      const localDate = now.toLocaleDateString('en-US');
      const dateTime = `${localDate} ${timeStamp}`;
      const localDateTime = new Date(dateTime);
      time = localDateTime.getTime()
    }
    return time
  } 
}
