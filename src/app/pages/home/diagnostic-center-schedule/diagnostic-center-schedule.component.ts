import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilityService } from '@services/utility.service';
import { Observable } from 'rxjs';
import { IWeakDay } from 'src/app/models/utility.models';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, DIAGONOSTIC_ERROR_MESSAGE } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { DiagnosticCenterScheduleService } from '@services/diagnostic-center-schedule.service';
import { ToastrService } from 'ngx-toastr';
import { FormService } from '@services/form.service';
import { MiniCalendarViewComponent } from 'src/app/components/mini-calendar-view/mini-calendar-view.component';

@Component({
  selector: 'app-diagnostic-center-schedule',
  templateUrl: './diagnostic-center-schedule.component.html',
  styleUrls: ['./diagnostic-center-schedule.component.css']
})
export class DiagnosticCenterScheduleComponent implements OnInit {
  @ViewChild(MiniCalendarViewComponent) miniCalComponent: MiniCalendarViewComponent;
  public errorMessage: any = {};
  public diagnosticCentreScheduleForm: FormGroup;
  public holidayForm: FormGroup;
  public holidayScheduleForm: FormGroup;
  public weekDays$: Observable<IWeakDay[]>;
  public currentDate: any;
  public timePickerTheme: NgxMaterialTimepickerTheme;
  public filteredDepertmentCodeList: any[];
  public depertmentCodeList: any[];
  public lastDepartmentScheduleDetailsUniqueID: number = 0;
  public departmentScheduleDetailsListData: any[];
  public diagnosticCenterDetails: any;
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL;
  public commercialIDList: Array<any> = [];
  public userIsDCH: boolean = false;
  public editDepartmentScheduleDetailsIndex: number;
  public preHoliDayList: Array<any>;
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private commonService: CommonService,
    private diagnosticCenterService: DiagnosticCenterScheduleService,
    private formService: FormService,
  ) {
    this.getLocalTime()
    this.timePickerTheme = this.utilityService.timePickerTheme;
    this.currentDate = new Date();
    this.diagnosticCentreScheduleForm = this.fb.group({
      departmentScheduleDetailsList: this.fb.array([]),
    })
    this.holidayForm = this.fb.group({
      holidayDetailsList: this.fb.array([this.addHolidayDetailsGroup()]),
    })
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
      this.userIsDCH = res.userRoleList.find((val: any) => val.roleCode === 'DCH') ? true : false;
      if (this.userIsDCH) {
        this.getCommercialIDList();
      } else {
        this.getDepartmentCodeList();
      }
    })
    this.diagnosticCentreScheduleForm.valueChanges.subscribe(res => {
      this.filterDepertmentCodeList()
    })
    this.intializingMessage();
    this.weekDays$ = this.utilityService.getWeekDays();
  }

  isActiveCommercialID(commercialID: any) {
    if (this.diagnosticCenterDetails) {
      if (this.diagnosticCenterDetails.diagnosticCentreID === commercialID) {
        return true
      }
    }
    return false
  }

  changeCommercialID(commercialID: any) {
    this.getDiagnosticCentreDetails(commercialID);
  }

  getCommercialIDList = async () => {
    const reqData: any = {
      apiRequest: {}
    }
    await this.diagnosticCenterService.getCommercialIDList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.commercialIDList = res.apiResponse.commercialIDDetailsList;
          this.getDepartmentCodeList(this.commercialIDList[0].commercialID);
        } else {
          res.anamnesisErrorList.anErrorList.forEach((err: any) => {
            this.commercialIDList = [];
          })
        }
      })
      .catch((err: any) => {
        this.commercialIDList = [];
      })
  }

  getDepartmentScheduleDetailsList = async () => {
    const reqData = {
      apiRequest: {
        diagnosticCentreID: this.diagnosticCenterDetails.diagnosticCentreID
      }
    }
    await this.diagnosticCenterService.GetDiagnosticCentreScheduleDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.departmentScheduleDetailsList().clear();
          if (res.apiResponse.departmentScheduleDetailsList.length) {
            res.apiResponse.departmentScheduleDetailsList.forEach((depertmentSchedule: any, depertmentScheduleIndex: number) => {
              this.departmentScheduleDetailsList().push(this.addDepartmentScheduleDetailsGroup())
              const data = {
                scheduleIdentifier:depertmentSchedule.scheduleIdentifier,
                departmentSeqNo: depertmentSchedule.departmentSeqNo,
                departmentCode: depertmentSchedule.departmentCode,
                testingTime: depertmentSchedule.testingTime,
                scheduleDetailsList: [],
                isAdd: false,
                isDelete: false,
                isChange: false,
                editMode: false
              }
              this.departmentScheduleDetailsList().at(depertmentScheduleIndex).patchValue(data);
              this.departmentScheduleDetailsList().at(depertmentScheduleIndex).get('departmentCode')?.disable();
              depertmentSchedule.scheduleDetailsList.forEach((scheduleDetails: any, scheduleIndex: number) => {
                const data = {
                  scheduleSeqNo: scheduleDetails.scheduleSeqNo,
                  weekDay: scheduleDetails.weekDay,
                  startTime: this.utilityService.timeFormateInto12Hours(scheduleDetails.startTime),
                  endTime: this.utilityService.timeFormateInto12Hours(scheduleDetails.endTime),
                  additionalInformation: scheduleDetails.additionalInformation,
                  startTimeErrMsg: '',
                  endTimeErrMsg: '',
                  isAdd: false,
                  isDelete: false,
                  isChange: false,
                }
                this.scheduleDetailsList(depertmentScheduleIndex).push(this.addScheduleDetailsGroup())
                this.scheduleDetailsList(depertmentScheduleIndex).at(scheduleIndex).patchValue(data)
                this.scheduleDetailsList(depertmentScheduleIndex).at(scheduleIndex).get('startTime')?.enable()
                this.scheduleDetailsList(depertmentScheduleIndex).at(scheduleIndex).get('endTime')?.enable()
              })
            })
          } else {
            this.addAnotherDepartmentScheduleDetails()
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Schedule list couldn't fetch due some error");
        }
      })
    // data.forEach((value: any, index: number) => {
    //   this.lastDepartmentScheduleDetailsUniqueID = this.lastDepartmentScheduleDetailsUniqueID + 1
    //   data[index] = { ...value, uniqueID: this.lastDepartmentScheduleDetailsUniqueID }
    // });
    // return data;
  }

  getDiagnosticCentreDetails = async (commercialID?: any) => {
    const reqData: any = {
      apiRequest: {
        commercialID: ''
      }
    }
    if (commercialID) {
      reqData.apiRequest.commercialID = commercialID
    }
    await this.diagnosticCenterService.GetDiagnosticCentreDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.diagnosticCenterDetails = res.apiResponse;
          this.getDepartmentScheduleDetailsList()
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Diagnostic Centre Details couldn't fetch due some error");
        }
      })
  }

  filterDepertmentCodeList() {
    this.filteredDepertmentCodeList = []
    this.diagnosticCentreScheduleForm.getRawValue().departmentScheduleDetailsList.forEach((departmentScheduleDetails: any) => {
      if (!departmentScheduleDetails.isDelete) {
        this.filteredDepertmentCodeList.push(departmentScheduleDetails.departmentCode)
      }
    })
  }

  isSelectedPreviousDepertment(departmentCode: string, selectedDepartmentCode: string) {
    const a = this.filteredDepertmentCodeList.find(res => res === departmentCode)
    if (a) {
      if (a === selectedDepartmentCode) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  getDepartmentCodeList = async (commercialID?: string) => {
    await this.diagnosticCenterService.getAllDepartmentCodeList()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.depertmentCodeList = res.apiResponse.departmentCodeDetailsList;
          if (commercialID) {
            this.getDiagnosticCentreDetails(commercialID);
          } else {
            this.getDiagnosticCentreDetails();
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Depertment Code List couldn't fetch due some error");
        }
      })
  }

  getDepartmentNameFormCode(departmentCode?: string) {
    const department = this.depertmentCodeList.find((res: any) => res.departmentCode === departmentCode)
    return department ? department.departmentDescription : ''
  }

  getWeakDayNameFormCode(WeakDay: any) {
    let weekDays: any = [];
    this.weekDays$.subscribe(res => {
      weekDays = res;
    })
    const foundWeekDay = weekDays.find((res: any) => res.dayCode === +WeakDay)
    return foundWeekDay ? foundWeekDay.dayName : ''
  }

  addDepartmentScheduleDetailsGroup() {
    return this.fb.group({
      scheduleIdentifier:[''],
      departmentSeqNo: [''],
      departmentCode: ['', [Validators.required]],
      testingTime: ['', [Validators.required]],
      scheduleDetailsList: this.fb.array([]),
      isAdd: [true],
      isDelete: [false],
      isChange: [false],
      editMode: [true],
      customErrMSG:['']
    })
  }

  departmentScheduleDetailsList() {
    return this.diagnosticCentreScheduleForm.get('departmentScheduleDetailsList') as FormArray
  }

  getDepartmentScheduleController(departmentScheduleDetailsIndex: number, controlName: any) {
    let departmentScheduleDetailscontrol = <any>this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex);
    return departmentScheduleDetailscontrol.controls[controlName];
  }

  getScheduleDetailsController(departmentScheduleDetailsIndex: number, scheduleDetailsIndex: number, controlName: any) {
    let departmentScheduleDetailscontrol = <any>this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex);
    const scheduleDetailsListControlArray: any = departmentScheduleDetailscontrol.controls['scheduleDetailsList'];
    return scheduleDetailsListControlArray.controls[scheduleDetailsIndex].controls[controlName];
  }

  addAnotherDepartmentScheduleDetails(blockOption?:boolean) {
    if(blockOption){
      if(this.departmentScheduleDetailsList().valid){
        this.departmentScheduleDetailsList().push(this.addDepartmentScheduleDetailsGroup());
        this.addAnotherScheduleDetails(this.departmentScheduleDetailsList().length - 1, true)
      }else{
        this.departmentScheduleDetailsList().at(this.departmentScheduleDetailsList().length-1).get('customErrMSG')?.setValue('Please fill the details first');
        setTimeout(() => {
        this.departmentScheduleDetailsList().at(this.departmentScheduleDetailsList().length-1).get('customErrMSG')?.setValue(''); 
        }, 1500);
      }
    }else{
      this.departmentScheduleDetailsList().push(this.addDepartmentScheduleDetailsGroup());
      this.addAnotherScheduleDetails(this.departmentScheduleDetailsList().length - 1, true)
    }
    
  }

  departmentScheduleDetailsDelete(departmentScheduleDetailsIndex: number, depertmentIsAdd: boolean, editMode: boolean) {

    if (depertmentIsAdd) {
      this.departmentScheduleDetailsList().removeAt(departmentScheduleDetailsIndex);
    } else {
      // if(this.departmentScheduleDetailsList().length === 1){
      //   const deleteData = this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).getRawValue();
      //   deleteData.isDelete = true;
      //   this.departmentScheduleDetailsFormSubmit({departmentScheduleDetailsList:[deleteData]},true)
      // }else{
      this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isDelete')?.setValue(true);
      // }
    }
    const activeList = this.departmentScheduleDetailsList().value.filter((res: any) => res.isDelete === false);
    if (!activeList.length) {
      const deletedDepartmentScheduleDetailsList: any = []
      this.departmentScheduleDetailsList().getRawValue().forEach((res: any) => {
        const deleteData = res;
        deleteData.isDelete = true;
        deletedDepartmentScheduleDetailsList.push(deleteData)
      })
      if (deletedDepartmentScheduleDetailsList.length) {
        this.departmentScheduleDetailsFormSubmit({ departmentScheduleDetailsList: deletedDepartmentScheduleDetailsList }, true)

      } else {
        this.addAnotherDepartmentScheduleDetails();
      }
    }
  }

  addScheduleDetailsGroup() {
    return this.fb.group({
      scheduleSeqNo: [''],
      weekDay: [null, [Validators.required]],
      startTime: [{ value: '', disabled: true }, [Validators.required]],
      endTime: [{ value: '', disabled: true }, [Validators.required]],
      additionalInformation: ['', [Validators.maxLength(100)]],
      startTimeErrMsg: [''],
      endTimeErrMsg: [''],
      isAdd: [true],
      isDelete: [false],
      isChange: [false],
      customErrMSG:['']
    })
  }

  scheduleDetailsList(departmentScheduleDetailsIndex: number) {
    return this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('scheduleDetailsList') as FormArray
  }

  addAnotherScheduleDetails(departmentScheduleDetailsIndex: number, departmentScheduleDetailsIsAdd: boolean ,blockOption?:boolean) {
    if(blockOption){
      if(this.scheduleDetailsList(departmentScheduleDetailsIndex).valid){
        if (!departmentScheduleDetailsIsAdd) {
          this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
        }
        this.scheduleDetailsList(departmentScheduleDetailsIndex).push(this.addScheduleDetailsGroup());
      }else{
        this.scheduleDetailsList(departmentScheduleDetailsIndex).at(this.scheduleDetailsList(departmentScheduleDetailsIndex).length-1).get('customErrMSG')?.setValue('Please fill the details first');
        setTimeout(() => {
          this.scheduleDetailsList(departmentScheduleDetailsIndex).at(this.scheduleDetailsList(departmentScheduleDetailsIndex).length-1).get('customErrMSG')?.setValue('');
        }, 1500);
      }
    }else{
      if (!departmentScheduleDetailsIsAdd) {
        this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
      }
      this.scheduleDetailsList(departmentScheduleDetailsIndex).push(this.addScheduleDetailsGroup());
    }
  }

  scheduleDetailsDelete(departmentScheduleDetailsIndex: number, scheduleDetailsIndex: number, departmentScheduleDetailsIsAdd: boolean, scheduleDetailsIsAdd: boolean) {
    if (!departmentScheduleDetailsIsAdd) {
      this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
    }
    const activeScheduleDetailsList = this.scheduleDetailsList(departmentScheduleDetailsIndex).value.filter((res: any) => res.isDelete !== true)
    if (scheduleDetailsIsAdd) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).removeAt(scheduleDetailsIndex);
    } else {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('isDelete')?.setValue(true);
    }
    if (activeScheduleDetailsList.length === 1) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).push(this.addScheduleDetailsGroup())
    }
  }

  departmentScheduleDetailsFormSubmit(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.diagnosticCentreScheduleForm)
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          diagnosticCentreID: this.diagnosticCenterDetails.diagnosticCentreID,
          departmentScheduleDetailsList: []
        },
      }
      data.departmentScheduleDetailsList.forEach((departmentScheduleDetails: any, index: number) => {
        const tempDepartmentScheduleDetails: any = {
          scheduleIdentifier:departmentScheduleDetails.scheduleIdentifier?departmentScheduleDetails.scheduleIdentifier:'',
          departmentSeqNo: departmentScheduleDetails.departmentSeqNo ? departmentScheduleDetails.departmentSeqNo : '',
          departmentCode: departmentScheduleDetails.departmentCode,
          departmentName: this.depertmentCodeList.find(depertment => depertment.departmentCode === departmentScheduleDetails.departmentCode).departmentDescription,
          testingTime: +departmentScheduleDetails.testingTime,
          actionIndicator: '',
          scheduleDetailsList: []
        }
        if (departmentScheduleDetails.isAdd) {
          tempDepartmentScheduleDetails.actionIndicator = 'ADD'
        } else {
          if (departmentScheduleDetails.isDelete) {
            tempDepartmentScheduleDetails.actionIndicator = 'DEL'
          } else {
            if (departmentScheduleDetails.isChange) {
              tempDepartmentScheduleDetails.actionIndicator = 'UPD'
            } else {
              tempDepartmentScheduleDetails.actionIndicator = ''
            }
          }
        }
        departmentScheduleDetails.scheduleDetailsList.forEach((scheduleDetails: any, i: any) => {
          const tempScheduleDetails: any = {
            scheduleSeqNo: scheduleDetails.scheduleSeqNo,
            weekDay: +scheduleDetails.weekDay,
            startTime: this.utilityService.timeFormateInto24Hours(scheduleDetails.startTime),
            endTime: this.utilityService.timeFormateInto24Hours(scheduleDetails.endTime),
            additionalInformation: scheduleDetails.additionalInformation,
            actionIndicator: ''
          }
          if (departmentScheduleDetails.isDelete) {
            tempScheduleDetails.actionIndicator = 'DEL'
          } else {
            if (scheduleDetails.isAdd) {
              tempScheduleDetails.actionIndicator = 'ADD'
            } else {
              if (scheduleDetails.isDelete) {
                tempScheduleDetails.actionIndicator = 'DEL'
              } else {
                if (scheduleDetails.isChange) {
                  tempScheduleDetails.actionIndicator = 'UPD'
                } else {
                  tempScheduleDetails.actionIndicator = ''
                }
              }
            }
          }

          tempDepartmentScheduleDetails.scheduleDetailsList.push(tempScheduleDetails)
        })
        reqData.apiRequest.departmentScheduleDetailsList.push(tempDepartmentScheduleDetails)
      })
      this.diagnosticCenterService.addDignosticCenterSchedule(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Dignostic Center Schedule saved')
            this.getDepartmentScheduleDetailsList()
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Dignostic Center Schedule couldn't add due some error");
          }
        })
    }
  }

  scheduleDetailsWeakDayChange(departmentScheduleDetailsIndex: number, scheduleDetailsIndex: number, weakDay: any, departmentScheduleDetailsIsAdd: boolean, isAdd: boolean) {
    if (!departmentScheduleDetailsIsAdd) {
      this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
    }
    if (!isAdd) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('isChange')?.setValue(true)
    }
    if (weakDay) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTime')?.enable();
      this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTime')?.enable();
    }
    this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTime')?.setValue('')
    this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTime')?.setValue('')
  }

  scheduleDetailsTimeChange(departmentScheduleDetailsIndex: number, scheduleDetailsIndex: number, time?: any, weakDay?: any, isStartTime?: boolean, departmentScheduleDetailsIsAdd?: boolean, isAdd?: boolean) {
    if (!departmentScheduleDetailsIsAdd) {
      this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
    }
    if (!isAdd) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('isChange')?.setValue(true)
    }
    let startTimeValue = 0
    startTimeValue = this.utilityService.get12FormatTimeIntoMinute(this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTime')?.value)
    if (time && weakDay) {
      const selectedTime = this.utilityService.get12FormatTimeIntoMinute(time);
      const refTimeArray: Array<any> = [];
      this.scheduleDetailsList(departmentScheduleDetailsIndex).controls.forEach((val: any, index: number) => {
        refTimeArray.push({
          weakDay: val.value.weekDay,
          scheduleStartTime: this.utilityService.get12FormatTimeIntoMinute(val.value.startTime),
          scheduleEndTime: this.utilityService.get12FormatTimeIntoMinute(val.value.endTime)
        })
      })
      if (isStartTime) {
        this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTime')?.setValue('')
      }
      let isErr = false;
      if (refTimeArray.length) {
        refTimeArray.forEach((val: any, index: number) => {
          if (!isErr && val.weakDay == weakDay) {
            if ((val.scheduleStartTime && val.scheduleEndTime && !isStartTime && startTimeValue && startTimeValue <= val.scheduleStartTime && selectedTime >= val.scheduleStartTime && selectedTime >= val.scheduleEndTime) || (val.scheduleStartTime && selectedTime > val.scheduleStartTime) && (val.scheduleEndTime && selectedTime < val.scheduleEndTime)) {
              if (isStartTime) {
                setTimeout(() => this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTime')?.setValue(''), 10)
  
                this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTimeErrMsg')?.setValue('Schedule already present in this time range')
                setTimeout(() => this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Schedule already present in this time range')
              } else {
                setTimeout(() => this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTime')?.setValue(''), 10)
                this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTimeErrMsg')?.setValue('Schedule already present in this time range')
                setTimeout(() => this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTimeErrMsg')?.setValue(''), 3500);
                this.toastr.error('Schedule already present in this time range')
                // set error for the end date at the selected index
              }
              isErr = true;
            }
          }
          // else if ((val.scheduleStartTime === 0 && selectedTime > val.scheduleEndTime) || (val.scheduleEndTime === 0 && selectedTime < val.scheduleStartTime)) {
          //   if (isStartTime) {

          //     setTimeout(()=>this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTime')?.setValue(''),10)
          //     this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTimeErrMsg')?.setValue('Invalid')
          //     setTimeout(() => this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('startTimeErrMsg')?.setValue(''), 1500);
          //     this.toastr.error('Please select a valid time')
          //   } else {
          //     setTimeout(()=>this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTime')?.setValue(''),10)
          //     this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTimeErrMsg')?.setValue('Invalid')
          //     setTimeout(() => this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('endTimeErrMsg')?.setValue(''), 1500);
          //     this.toastr.error('Please select a valid time')
          //     // set error for the end date at the selected index
          //   }
          //   isErr = true;
          // }

        })
      }
    }
  }

  scheduleDetailsAdditionalInformationChange(departmentScheduleDetailsIndex: number, scheduleDetailsIndex: number, departmentScheduleDetailsIsAdd: boolean, ScheduleDetailsIsAdd: boolean) {
    if (!departmentScheduleDetailsIsAdd) {
      this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
    }
    if (!ScheduleDetailsIsAdd) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).at(scheduleDetailsIndex).get('isChange')?.setValue(true)
    }
  }

  departmentScheduleDetailsChange(departmentScheduleDetailsIndex: number, departmentScheduleDetailsIsAdd: boolean) {
    if (!departmentScheduleDetailsIsAdd) {
      this.scheduleDetailsList(departmentScheduleDetailsIndex).get('isChange')?.setValue(true)
    }
  }

  editDepertmentSchedule(departmentScheduleDetailsIndex: number) {
    this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('editMode')?.setValue(true);
  }

  saveDepertmentSchedule(departmentScheduleDetailsIndex: number) {
    const formControl = <FormGroup>this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex)
    this.formService.markFormGroupTouched(formControl)
    if (formControl) {
      if (formControl.valid) {
        formControl.get('editMode')?.setValue(false);
        this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex).get('departmentCode')?.disable();
      }
    }
  }

  showBorder(departmentScheduleDetailsIndex: number, index: number) {
    const ActiveList = this.scheduleDetailsList(departmentScheduleDetailsIndex).value
    if (ActiveList[index].isDelete !== true && index < ActiveList.length - 1) {
      return true
    }
    return false;
  }

  clearDepertment(departmentScheduleDetailsIndex: number) {
    const control = this.departmentScheduleDetailsList().at(departmentScheduleDetailsIndex);
    if (!control?.value.isAdd) {
      const deletedData = control.getRawValue()
      deletedData.isDelete = true;
      this.addAnotherDepartmentScheduleDetails()
      const NewIndex = this.departmentScheduleDetailsList().length - 1
      this.scheduleDetailsList(NewIndex).clear();
      this.departmentScheduleDetailsList().at(NewIndex).patchValue(deletedData)
      deletedData.scheduleDetailsList.forEach((res: any) => {
        res.isDelete = true
        this.addAnotherScheduleDetails(NewIndex, true)
        const newPhysicianScheduleDetailsIndex = this.scheduleDetailsList(NewIndex).length - 1;
        this.scheduleDetailsList(NewIndex).at(newPhysicianScheduleDetailsIndex).patchValue(res)
      })
    }
    control.reset()
    this.scheduleDetailsList(departmentScheduleDetailsIndex).clear();
    control.get('isAdd')?.setValue(true)
    control.get('isChange')?.setValue(false)
    control.get('isDelete')?.setValue(false)
    control.get('editMode')?.setValue(true)
    control.get('departmentCode')?.enable();
    this.addAnotherScheduleDetails(departmentScheduleDetailsIndex, true)
  }

  getPreHoliDayList(holidayList: any) {
    this.preHoliDayList = []
    if (holidayList.length) {
      this.preHoliDayList = holidayList;
    }
  }

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

  dateSelect(holidayIndex: number, date: any, isStartDate: boolean) {
    let startdate = 0
    startdate = this.utilityService.getTimeStamp(this.holidayDetailsList().at(holidayIndex).get('holidayStartDate')?.getRawValue(), '00:00:01 AM')
    const selectedDate = this.utilityService.getTimeStamp(date, '00:00:01 AM');
    const refDateArray: Array<any> = [];
    this.holidayDetailsList().controls.forEach((val: any, index: number) => {
      const obj = {
        holidayStartDate: this.utilityService.getTimeStamp(val.value.holidayStartDate, '00:00:01 AM'),
        holidayEndDate: this.utilityService.getTimeStamp(val.value.holidayEndDate, '00:00:01 AM')
      }
      refDateArray.push(obj)
    })
    if (isStartDate) {
      this.holidayDetailsList().at(holidayIndex).get('holidayEndDate')?.setValue('')
    }
    let isErr = false;
    if (this.preHoliDayList.length) {
      this.preHoliDayList.forEach((val: any, index: number) => {
        if (!isErr) {
          if ((val.holidayStartDate && val.holidayEndDate && !isStartDate && startdate && startdate <= val.holidayStartDate && selectedDate >= val.holidayStartDate && selectedDate >=val.holidayEndDate) || (val.holidayStartDate && selectedDate >= val.holidayStartDate)&&(val.holidayEndDate && selectedDate<= val.holidayEndDate)) {
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

  holiDayChange(holidayIndex: number) {
    this.holidayDetailsList().at(holidayIndex).get('isdataFill')?.setValue(true);
  }

  addHolidayDetailsGroup() {
    return this.fb.group({
      holidayStartDate: ['', [Validators.required]],
      holidayEndDate: ['', [Validators.required]],
      holidayDescription: ['', [Validators.maxLength(100)]],
      startDateErrMsg: [''],
      endDateErrMsg: [''],
      isAdd: [true],
      isDelete: [false],
      isChange: [false],
      isdataFill: [false]
    })
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

  holidayFormSubmit(holidayList: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.holidayForm);
    if (isValid === true) {
      const reqData: any = {
        apiRequest: {
          holidayCount: holidayList.holidayDetailsList.length,
          commercialID: this.diagnosticCenterDetails.diagnosticCentreID,
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
          holidayEndDate: new Date(holiday.holidayEndDate),
          holidaySeqNo: index + 1,
          holidayStartDate: new Date(holiday.holidayStartDate),
          transactionResult: ''
        }
        reqData.apiRequest.holidayDetailsList.push(holidayDetails)
      })
      this.diagnosticCenterService.addHolidaySchedules(reqData)
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

  private intializingMessage() {
    this.errorMessage = {
      labtestsError: {
        departmentCode: {
          required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_LABTEST_DEPT_NAME
        },
        testingTime: {
          required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_APPROX_TESTING_TIME
        },
        labTestSchedules: {
          weekDay: {
            required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_SCHEDULE_DAY
          },
          startTime: {
            required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_SCHEDULE_START_TIME
          },
          endTime: {
            required: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_REQUIERD_SCHEDULE_END_TIME
          },
          additionalInformation: {
            maxlength: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_MAX_LENGTH_SCHEDULE_END_TIME
          }
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
          maxlength: DIAGONOSTIC_ERROR_MESSAGE.ERR_MSG_MAX_LENGTH_HOLIDAY_DESCRIPTION
        }
      }
    }
  }
}
