import { LabelType, Options } from '@angular-slider/ngx-slider';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LOCAL_STORAGE } from '@constant/constants';
import { AuthorizePrescriptionService } from '@services/authorizePrescription.service';
import { CommonService } from '@services/common.service';
import { HealthReportService } from '@services/health-report.service';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-consultation-report',
  templateUrl: './consultation-report.component.html',
  styleUrls: ['./consultation-report.component.css']
})
export class ConsultationReportComponent implements OnInit,OnChanges {
  @Output()
  PrescriptionID: EventEmitter<{}> = new EventEmitter<{}>();
  @Input() isPc: boolean;
  @Input() selectedPatientDetails: any;
  @Input() personalInfo: any;
  @Input()
  RefreshInd?:boolean = false;
  needRefresh:boolean = false;
  isPhysicianConsultation: boolean = false;
  isPhysicianLaboratory: boolean = false;
  showByDate: boolean = true;
  showByTest: boolean = false;

  defaultPrescriptionFiles: any = [];
  defaultLabReportsFiles: any = [];
  prescriptionFiles: any = [];
  labReportsFiles: any = [];

  laboratoryTestReportByDate: any = [];
  laboratoryTestReportByTest: any = [];
  availableDates: any = [];
  availableTests: any = [];
  availableReportsByDate: any = [];
  availableReportsByTest: any = [];
  refAvailableReportsByDate: any = [];
  refAvailableReportsByTest: any = [];

  dateAccordionArray: any = [];
  testAccordionArray: any = [];
  prescriptionAccordionArray: any = [];

  filterSelectedDates: any = [];
  filterSelectedTests: any = [];

  userId: any = ""
  userCode: any = ""

  labSearchKey: any = "";
  prescSearchKey: any = "";

  dateRangeObj: any = {};

  TrandChart: boolean = false;

  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  labDateOptions: any = {};
  labDateValue: any;
  labHighValue: any;

  prescDateOptions: any = {};
  prescDateValue: any;
  prescHighValue: any;

  private debouncePrescription = new Subject<number>();
  private debounceLab = new Subject<number>();

  constructor(
    public authorizePrescriptionService: AuthorizePrescriptionService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private healthReportService: HealthReportService,
    private localStorage: LocalStorageService,
    public datePipe: DatePipe,
  ) {
    this.debouncePrescription.pipe(debounceTime(500)).subscribe(value => {
      const enDtt = this.datePipe.transform(new Date(value), 'yyyy-MM-dd');
      this.dateRangeObj.prescriptionEndDate = enDtt;
      if (this.isPc) {
        this.getPatientPrescriptionFiles(true);
      } else {
        this.getPrescriptionFiles(true);
      }
    });

    this.debounceLab.pipe(debounceTime(500)).subscribe(value => {
      const enDtt = this.datePipe.transform(new Date(value), 'yyyy-MM-dd');
      this.dateRangeObj.laboratoryTestReportEndDate = enDtt;
      if (this.isPc) {
        this.getPhyLabReports(true)
        this.getPhyLabReportsDetails()
      } else {
        this.getLabReports(true);
        this.getLabReportsDetails();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.RefreshInd){
      this.needRefresh = true;
    }
  }

  refresh(){
    this.needRefresh = false;
    this.getUserDetails();
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  async getUserDetails() {
    this.userId = this.isPc ? this.selectedPatientDetails.userID : await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.USER_ID) || "";
    this.userCode = this.isPc ? this.selectedPatientDetails.userCode : await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.USER_CODE) || "";
    this.getPatientTimeDuration();
  }

  async getLabReportsDetails() {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        laboratortTestStartDate: this.dateRangeObj.laboratoryTestReportStartDate ?? "",
        laboratortTestEndDate: this.dateRangeObj.laboratoryTestReportEndDate ?? "",
        departmentCode: ''
      }
    };
    await this.healthReportService.getLaboratoryTestReportDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.resetFlags();
          this.laboratoryTestReportByDate = [...res.apiResponse.byDateLaboratoryTestReportList];
          this.availableReportsByDate = [...res.apiResponse.byDateLaboratoryTestReportList];
          if (this.availableReportsByDate.length) {
            this.dateAccordionArray.push(this.availableReportsByDate[0].laboratoryTestDate);
          }
          this.refAvailableReportsByDate = [...res.apiResponse.byDateLaboratoryTestReportList];
          this.getDates();
          // this.laboratoryTestReportByTest = [...res.apiResponse.byTestByDeptLaboratoryTestReportList];
          // this.availableReportsByTest = [...res.apiResponse.byTestByDeptLaboratoryTestReportList];
          if (res.apiResponse.byTestByDeptLaboratoryTestReportList.length) {
            this.testAccordionArray.push(res.apiResponse.byTestByDeptLaboratoryTestReportList[0].departmentName);
          }
          // this.refAvailableReportsByTest = [...res.apiResponse.byTestByDeptLaboratoryTestReportList];
          this.getTests(res.apiResponse.byTestByDeptLaboratoryTestReportList);
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  async getPhyLabReportsDetails() {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        laboratortTestStartDate: this.dateRangeObj.laboratoryTestReportStartDate ?? "",
        laboratortTestEndDate: this.dateRangeObj.laboratoryTestReportEndDate ?? "",
      }
    };
    await this.healthReportService.getPhyLaboratoryTestReportDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.resetFlags();
          this.laboratoryTestReportByDate = [...res.apiResponse.byDateLaboratoryTestReportList];
          this.availableReportsByDate = [...res.apiResponse.byDateLaboratoryTestReportList];
          if (this.availableReportsByDate.length) {
            this.dateAccordionArray.push(this.availableReportsByDate[0].laboratoryTestDate);
          }
          this.refAvailableReportsByDate = [...res.apiResponse.byDateLaboratoryTestReportList];
          this.getDates();
          // this.laboratoryTestReportByTest = [...res.apiResponse.byTestByDeptLaboratoryTestReportList];
          // this.availableReportsByTest = [...res.apiResponse.byTestByDeptLaboratoryTestReportList];
          if (res.apiResponse.byTestByDeptLaboratoryTestReportList.length) {
            this.testAccordionArray.push(res.apiResponse.byTestByDeptLaboratoryTestReportList[0].departmentName);
          }
          // this.refAvailableReportsByTest = [...res.apiResponse.byTestByDeptLaboratoryTestReportList];
          this.getTests(res.apiResponse.byTestByDeptLaboratoryTestReportList);
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  getTests(list: any) {
    this.availableTests = [];
    if (list.length > 0) {
      // dates to get from backend in recent date > old dates sorting
      list.forEach((tests: any) => {
        if (this.availableTests.indexOf(tests.departmentName) < 0) {
          this.availableTests.push(tests.departmentName);
        }
      });
    }
    this.getSortedTests(list);
  }

  getSortedTests(list: any) {
    this.laboratoryTestReportByTest = [];
    this.availableTests.forEach((avlTst: any) => {
      const testDates: any = [];
      const testIds: any = [];
      const filterAvailableReportsByTest = list.filter((l: any) => l.departmentName === avlTst);
      const tests: any = [];
      filterAvailableReportsByTest.forEach((tt: any) => {
        tests.push(tt.byTestLaoratoryTestReportList[0])
      })
      tests.forEach((fat: any) => {
        if (testIds.indexOf(fat.laboratoryTestCode) < 0) {
          testIds.push(fat.laboratoryTestCode)
        }
        fat.observationBasedLaboratoryTestReportList.forEach((obb: any) => {
          if (testDates.indexOf(obb.laboratoryTestDate) < 0) {
            testDates.push(obb.laboratoryTestDate)
          }
        })
        fat.valueBasedLaboratoryTestReportList.forEach((vbb: any) => {
          if (testDates.indexOf(vbb.laboratoryTestDate) < 0) {
            testDates.push(vbb.laboratoryTestDate)
          }
        })
      });
      const testDatArr: any = [];
      testIds.forEach((tidd: any) => {
        const testArrray: any = [];
        const filteredTestsId: any = tests.filter((tst: any) => tst.laboratoryTestCode === tidd)
        filteredTestsId.forEach((test: any) => {
          const testF = test;
          const obsAr: any = [];
          const valAr: any = [];
          testF.observationBasedLaboratoryTestReportList.forEach((obs: any) => {
            obsAr.push(obs);
            testF.laboratoryTestDate = obs.laboratoryTestDate
          })
          testF.valueBasedLaboratoryTestReportList.forEach((val: any) => {
            valAr.push(val);
            testF.laboratoryTestDate = val.laboratoryTestDate
          })
          testF.valueBasedLaboratoryTestReportList = valAr;
          testF.observationBasedLaboratoryTestReportList = obsAr;
          testArrray.push(testF);
        })
        const testsObb = {
          testName: filteredTestsId[0].laboratoryTestName,
          tests: testArrray
        }
        testDatArr.push(testsObb)
      })
      const testObj = {
        departmentName: avlTst,
        test: testDatArr
      }
      this.laboratoryTestReportByTest.push(testObj);
    })
    this.availableReportsByTest = [...this.laboratoryTestReportByTest];
    this.refAvailableReportsByTest = [...this.laboratoryTestReportByTest];
  }

  getDates() {
    this.availableDates = [];
    if (this.laboratoryTestReportByDate.length > 0) {
      this.laboratoryTestReportByDate.forEach((dates: any) => {
        if (this.availableDates.indexOf(dates.laboratoryTestDate) < 0) {
          this.availableDates.push(dates.laboratoryTestDate);
        }
      })
    }
  }

  getDateNames(date: any) {
    const month = this.monthNames[date.split("-")[1].replace(/^0+/, '') - 1];
    const dt = date.split("-")[2].replace(/^0+/, '');
    return dt + ' ' + month;
  }

  showPhysicianConsultation() {
    this.isPhysicianConsultation = !this.isPhysicianConsultation;
  }

  showPhysicianLaboratory() {
    this.isPhysicianLaboratory = !this.isPhysicianLaboratory;
  }

  closeWindow() {
    this.isPhysicianLaboratory = false;
    this.isPhysicianConsultation = false;
  }

  toggleDateSelect() {
    this.showByDate = true;
    this.showByTest = false;
    this.resetFlags()
  }

  toggleTestSelect() {
    this.showByDate = false;
    this.showByTest = true;
    this.resetFlags()
  }

  resetFlags() {
    // this.dateAccordionArray = [];
    // this.testAccordionArray = [];
    this.filterSelectedDates = [];
    this.availableReportsByDate = this.laboratoryTestReportByDate;
    this.refAvailableReportsByDate = this.availableReportsByDate;
    this.availableReportsByTest = this.laboratoryTestReportByTest;
    this.refAvailableReportsByTest = this.availableReportsByTest;
  }

  dateFormat(date: string) {
    return new Date(date);
  }

  ChartModal() {
    this.TrandChart = !this.TrandChart;
  }

  async getPatientPrescriptionFiles(isChange?: boolean) {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        listStartDate: this.dateRangeObj.prescriptionStartDate ?? "",
        listEndDate: this.dateRangeObj.prescriptionEndDate ?? "",
      }
    };
    await this.authorizePrescriptionService.patientPrescriptionList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultPrescriptionFiles = [...res.apiResponse.prescriptionSummaryList || []];
          this.prescriptionFiles = res.apiResponse.prescriptionSummaryList || [];
          if (this.prescriptionFiles.length) {
            this.prescriptionAccordionArray.push(this.prescriptionFiles[0].prescriptionDate);
            // if (!isChange) {
            //   const spDt = this.prescriptionFiles[0].prescriptionDate;
            //   const stDt = this.subtractMonths(new Date(spDt));
            //   if (stDt < this.prescDateValue) {
            //     this.prescDateValue = stDt
            //   }
            //   const spdDtDt = this.prescriptionFiles[this.prescriptionFiles.length - 1].prescriptionDate;
            //   const edDt = new Date(spdDtDt);
            //   if (edDt < this.prescHighValue) {
            //     this.prescHighValue = edDt
            //   }
            // }
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  async getPrescriptionFiles(isChange?: boolean) {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        listStartDate: this.dateRangeObj.prescriptionStartDate ?? "",
        listEndDate: this.dateRangeObj.prescriptionEndDate ?? "",
      }
    };
    await this.authorizePrescriptionService.getPrescriptionList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultPrescriptionFiles = [...res.apiResponse.prescriptionSummaryList || []];
          this.prescriptionFiles = res.apiResponse.prescriptionSummaryList || [];
          if (this.prescriptionFiles.length) {
            this.prescriptionAccordionArray.push(this.prescriptionFiles[0].prescriptionDate);
            // if (!isChange) {
            //   const spDt = this.prescriptionFiles[0].prescriptionDate;
            //   const stDt = this.subtractMonths(new Date(spDt));
            //   if (stDt < this.prescDateValue) {
            //     this.prescDateValue = stDt
            //   }
            //   const spdDtDt = this.prescriptionFiles[this.prescriptionFiles.length - 1].prescriptionDate;
            //   const edDt = new Date(spdDtDt);
            //   if (edDt < this.prescHighValue) {
            //     this.prescHighValue = edDt
            //   }
            // }
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  subtractMonths(date: any) {
    const sDate = date.setMonth(date.getMonth() - 1);
    return sDate;
  }

  addMonths(date: any) {
    const sDate = date.setMonth(date.getMonth() + 1);
    return sDate;
  }

  async getPhyLabReports(isChange?: boolean) {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        listStartDate: this.dateRangeObj.laboratoryTestReportStartDate ?? "",
        listEndDate: this.dateRangeObj.laboratoryTestReportEndDate ?? "",
      }
    };
    await this.authorizePrescriptionService.getPhyLabTestReportList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultLabReportsFiles = [...res.apiResponse.laboratoryTestReportSummaryList];
          this.labReportsFiles = res.apiResponse.laboratoryTestReportSummaryList;
          // if (this.labReportsFiles.length > 0 && !isChange) {
          //   const spDt = this.labReportsFiles[0].laboratoryTestReportDate;
          //   const stDt = this.subtractMonths(new Date(spDt));
          //   if (stDt < this.labDateValue) {
          //     this.labDateValue = stDt
          //   }
          //   const spdDtDt = this.labReportsFiles[this.labReportsFiles.length - 1].laboratoryTestReportDate;
          //   const edDt = new Date(spdDtDt);
          //   if (edDt < this.labHighValue) {
          //     this.labHighValue = edDt
          //   }
          // }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  async getLabReports(isChange?: boolean) {
    const reqData: any = {
      apiRequest: {
        customerID: this.userId,
        listStartDate: this.dateRangeObj.laboratoryTestReportStartDate ?? "",
        listEndDate: this.dateRangeObj.laboratoryTestReportEndDate ?? "",
      }
    };
    await this.authorizePrescriptionService.getLabTestReportList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultLabReportsFiles = [...res.apiResponse.laboratoryTestReportSummaryList];
          this.labReportsFiles = res.apiResponse.laboratoryTestReportSummaryList;
          // if (this.labReportsFiles.length > 0 && !isChange) {
          //   const spDt = this.labReportsFiles[0].laboratoryTestReportDate;
          //   const stDt = this.subtractMonths(new Date(spDt));
          //   if (stDt < this.labDateValue) {
          //     this.labDateValue = stDt
          //   }
          //   const spdDtDt = this.labReportsFiles[this.labReportsFiles.length - 1].laboratoryTestReportDate;
          //   const edDt = new Date(spdDtDt);
          //   if (edDt < this.labHighValue) {
          //     this.labHighValue = edDt
          //   }
          // }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
      })
  }

  setAccordion(date: any) {
    const index = this.dateAccordionArray.indexOf(date);
    if (index >= 0) {
      this.dateAccordionArray.splice(index, 1);
    } else {
      this.dateAccordionArray.push(date);
    }
  }

  setAccordionTest(test: any) {
    const index = this.testAccordionArray.indexOf(test);
    if (index >= 0) {
      this.testAccordionArray.splice(index, 1);
    } else {
      this.testAccordionArray.push(test);
    }
  }

  setAccordionPrescription(date: any) {
    const index = this.prescriptionAccordionArray.indexOf(date);
    if (index >= 0) {
      this.prescriptionAccordionArray.splice(index, 1);
    } else {
      this.prescriptionAccordionArray.push(date);
    }
  }

  isPrescriptionAccordionVisible(date: any) {
    const index = this.prescriptionAccordionArray.indexOf(date);
    if (index >= 0) {
      return true;
    }
    return false;
  }

  isTestAccordionVisible(date: any) {
    const index = this.testAccordionArray.indexOf(date);
    if (index >= 0) {
      return true;
    }
    return false;
  }

  isAccordionVisible(date: any) {
    const index = this.dateAccordionArray.indexOf(date);
    if (index >= 0) {
      return true;
    }
    return false;
  }

  filterDates(date: any) {
    const index = this.filterSelectedDates.indexOf(date);
    if (index >= 0) {
      this.filterSelectedDates.splice(index, 1);
    } else {
      this.filterSelectedDates.push(date);
    }
    this.availableReportsByDate = [];
    this.refAvailableReportsByDate = [];
    if (this.filterSelectedDates.length === 0) {
      this.availableReportsByDate = this.laboratoryTestReportByDate
    } else {
      const availableReportsByDate:Array<any> = []
      this.filterSelectedDates.forEach((dd: any) => {
        const reportsByDate = this.laboratoryTestReportByDate.find((dates: any) => dates.laboratoryTestDate === dd);
        availableReportsByDate.push(reportsByDate);
      })
      this.availableReportsByDate = availableReportsByDate.sort((a:any,b:any)=>{
        var a_Date = new Date(a.laboratoryTestDate).getTime()
        var b_Date = new Date(b.laboratoryTestDate).getTime()
        return a_Date - b_Date
      })
    }
    this.refAvailableReportsByDate = [...this.availableReportsByDate];
  }

  filterTests(test: any) {
    const index = this.filterSelectedTests.indexOf(test);
    if (index >= 0) {
      this.filterSelectedTests.splice(index, 1);
    } else {
      this.filterSelectedTests.push(test);
    }
    this.availableReportsByTest = [];
    this.refAvailableReportsByTest = [];
    if (this.filterSelectedTests.length === 0) {
      this.availableReportsByTest = this.laboratoryTestReportByTest
    } else {
      const availableReportsByTest:Array<any> = [];
      this.filterSelectedTests.forEach((tt: any) => {
        const reportsByTest = this.laboratoryTestReportByTest.find((tests: any) => tests.departmentName === tt);
        availableReportsByTest.push(reportsByTest);
      })
      this.availableReportsByTest = availableReportsByTest.sort((a:any,b:any)=>{
        var a_departmentName:string  = a.departmentName;
        var b_departmentName:string = b.departmentName;
        return a_departmentName.localeCompare(b_departmentName)
      })
    }
    this.refAvailableReportsByTest = [...this.availableReportsByTest];
  }

  isTestSelected(date: any) {
    const index = this.filterSelectedTests.indexOf(date);
    if (index >= 0) {
      return true;
    }
    return false;
  }

  isDateSelected(date: any) {
    const index = this.filterSelectedDates.indexOf(date);
    if (index >= 0) {
      return true;
    }
    return false;
  }

  onValueChange(event: any, isEvent: boolean) {
    if (isEvent) {
      const stDate = this.datePipe.transform(new Date(event), 'yyyy-MM-dd');
      this.dateRangeObj.laboratoryTestReportStartDate = stDate;
    }
  }

  onHighValueChange(event: any, isEvent: boolean) {
    if (isEvent) {
      this.debounceLab.next(event);
    }
  }

  onPrescValueChange(event: any, isEvent: boolean) {
    if (isEvent) {
      const stDate = this.datePipe.transform(new Date(event), 'yyyy-MM-dd');
      this.dateRangeObj.prescriptionStartDate = stDate;
    }
  }

  onPrescHighValueChange(event: any, isEvent: boolean) {
    if (isEvent) {
      this.debouncePrescription.next(event);
    }
  }

  getPatientTimeDuration = async () => {
    const reqData: any = {
      apiRequest: {
        patientUserID: this.userId,
        patientUserCode: this.userCode,
      }
    };
    await this.healthReportService.patientTimeDuration(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.dateRangeObj = res.apiResponse;
          this.setTimeRange();
          this.setPrescriptionTimeRange();
          if (this.isPc) {
            this.getPatientPrescriptionFiles();
            this.getPhyLabReports(true)
            this.getPhyLabReportsDetails()
          } else {
            this.getPrescriptionFiles();
            this.getLabReports(true);
            this.getLabReportsDetails();
          }
        }
      })
      .catch((err: any) => {
      })
  }

  onLabKeyChange(value: any) {
    this.labSearchKey = value;
    this.search();
  }

  onPrescSearchKey(value: any) {
    this.prescSearchKey = value;
    this.prescSearch();
  }

  getLastDay(day: any) {
    const selectedDate = new Date(day);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    return lastDayOfMonth
  }

  setTimeRange() {
    let startDate = this.dateRangeObj.laboratoryTestReportStartDate
    let endDate = this.dateRangeObj.laboratoryTestReportEndDate
    let dates: any = [];

    let d0: any = startDate.split('-');
    let d1: any = endDate.split('-');

    for (
      let y = d0[0];
      y <= d1[0];
      y++
    ) {
      for (
        var m = d0[1];
        m <= 12;
        m++
      ) {
        dates.push(y + "-" + m + "-1");
        if (y >= d1[0] && m >= d1[1]) break;
      };
      d0[1] = 1;
    };

    const dateRange: any = []
    dates.forEach((ddd: any, index: number) => {
      if (index !== dates.length - 1) {
        dateRange.push(new Date(ddd));
      }
    })

    dateRange.push(this.getLastDay(dates[dates.length - 1]))
    this.labDateValue = dateRange[0].getTime();
    this.labHighValue = dateRange[dateRange.length - 1].getTime();
    this.labDateOptions = {
      stepsArray: dateRange.map((date: any) => {
        return { value: date.getTime() };
      }),
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return this.datePipe.transform(new Date(value), 'MMM-yy') || '';
          case LabelType.High:
            return this.datePipe.transform(new Date(value), 'MMM-yy') || '';
          default:
            return this.datePipe.transform(new Date(value), 'MMM-yy') || '';
        }
      }
    };
  }

  setPrescriptionTimeRange() {
    let startDate = this.dateRangeObj.prescriptionStartDate
    let endDate = this.dateRangeObj.prescriptionEndDate
    let dates = [];

    let d0: any = startDate.split('-');
    let d1: any = endDate.split('-');

    for (
      let y = d0[0];
      y <= d1[0];
      y++
    ) {
      for (
        var m = d0[1];
        m <= 12;
        m++
      ) {
        dates.push(y + "-" + m + "-1");
        if (y >= d1[0] && m >= d1[1]) break;
      };
      d0[1] = 1;
    };

    const dateRange: any = []
    dates.forEach((ddd: any, index: number) => {
      if (index !== dates.length - 1) {
        dateRange.push(new Date(ddd));
      }
    })

    dateRange.push(this.getLastDay(dates[dates.length - 1]))
    this.prescDateValue = dateRange[0].getTime();
    this.prescHighValue = dateRange[dateRange.length - 1].getTime();
    this.prescDateOptions = {
      stepsArray: dateRange.map((date: any) => {
        return { value: date.getTime() };
      }),
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return this.datePipe.transform(new Date(value), 'MMM-yy') || '';
          case LabelType.High:
            return this.datePipe.transform(new Date(value), 'MMM-yy') || '';
          default:
            return this.datePipe.transform(new Date(value), 'MMM-yy') || '';
        }
      }
    };
  }

  search() {
    this.labReportsFiles = [...this.defaultLabReportsFiles];
    this.availableReportsByDate = [...this.refAvailableReportsByDate]
    const availableFiltyeredReportsByDate = [...this.availableReportsByDate];
    this.availableReportsByTest = [...this.refAvailableReportsByTest]
    const availableFiltyeredReportsByTest = [...this.availableReportsByTest];
    const refJsonData = [...this.labReportsFiles];
    const keyword = this.labSearchKey;

    const filteredData = refJsonData.filter((item: any) => {
      const keys = Object.keys(item);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = item[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      for (let key in item) {
        const value = item[key];
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (typeof value[i] === 'object' && this.filterObject(value[i], keyword)) {
                return true;
              }
            }
          } else {
            if (this.filterObject(value, keyword)) {
              return true;
            }
          }
        }
      }
      return false;
    });
    const dateFilteredData = availableFiltyeredReportsByDate.filter((item: any) => {
      const keys = Object.keys(item);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = item[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      for (let key in item) {
        const value = item[key];
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (typeof value[i] === 'object' && this.filterObject(value[i], keyword)) {
                return true;
              }
            }
          } else {
            if (this.filterObject(value, keyword)) {
              return true;
            }
          }
        }
      }
      return false;
    });
    const testFilteredData = availableFiltyeredReportsByTest.filter((item: any) => {
      const keys = Object.keys(item);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = item[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      for (let key in item) {
        const value = item[key];
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (typeof value[i] === 'object' && this.filterObject(value[i], keyword)) {
                return true;
              }
            }
          } else {
            if (this.filterObject(value, keyword)) {
              return true;
            }
          }
        }
      }
      return false;
    });
    this.labReportsFiles = filteredData;
    this.availableReportsByDate = dateFilteredData;
    this.availableReportsByTest = testFilteredData;
  }

  filterObject(obj: any, keyword: any) {
    if (obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (typeof value[i] === 'object' && this.filterObject(value[i], keyword)) {
                return true;
              }
            }
          } else {
            if (this.filterObject(value, keyword)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  prescSearch() {
    this.prescriptionFiles = [...this.defaultPrescriptionFiles];
    const refJsonData = [...this.prescriptionFiles];
    const keyword = this.prescSearchKey;

    const filteredData = refJsonData.filter((item: any) => {
      const keys = Object.keys(item);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = item[key];
        if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      for (let key in item) {
        const value = item[key];
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              if (typeof value[i] === 'object' && this.filterObject(value[i], keyword)) {
                return true;
              }
            }
          } else {
            if (this.filterObject(value, keyword)) {
              return true;
            }
          }
        }
      }
      return false;
    });
    this.prescriptionFiles = filteredData;
  }

  getDisplayName() {
    return this.isPc ? this.selectedPatientDetails.displayName : this.personalInfo.displayName
  }

  prescriptionView(prescriptionID: string) {
    this.PrescriptionID.emit(prescriptionID);
  }

  isTrendChartShow(test:any,testName:any){
   let ValueBasedTestcount = 0;
   test.forEach((testNames:any)=>{
    testNames.tests.forEach((testsDates:any)=>{
      testsDates.valueBasedLaboratoryTestReportList.forEach((valueLabTest:any)=>{
        if(testNames.testName === testName){
          ValueBasedTestcount = ValueBasedTestcount+1
        }
      })
    })
   })
   if(ValueBasedTestcount>2){
    return true;
   }
   return false;
  }

}
