import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BASE_IMAGE_URL_FOR_REQ, LABTEST_REPORTUPLOAD } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-labtest-report-upload',
  templateUrl: './labtest-report-upload.component.html',
  styleUrls: ['./labtest-report-upload.component.css']
})
export class LabtestReportUploadComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  viewFileIndex: number = 0;
  pdfZoom: number = 1;
  rotateDeegre: number = 0;
  errorMessage: any = {};
  viewTestReportIndex: number = 0;
  labTestForm: FormGroup;
  //searchedDiagnosticCentre start---->
  searcDiagnosticCentre: any;
  diagnosticCentreList: Array<any> = [];
  showDiagnosticCentreDetails: boolean;
  selectedDiagnosticCentreDetails: any;
  oldDiagnosticCentreSearchValue: string;
  //searchedDiagnosticCentre <----end
  //searchedHedhealthClinic start---->
  searcPatient: any;
  patientList: Array<any> = [];
  showPatientDetails: boolean;
  selectedPatientDetails: any;
  oldPatientSearchValue: string;
  //searchedHedhealthClinic <----end
  ValueBasedLabTestList: Array<any> = [];
  ObservationBasedLabTestList: Array<any> = [];
  currentDate: Date = new Date()
  preLaboratoryTestReportDetailsList: Array<any> = [];
  fileDetailsList: Array<any> = [];
  deleteConfirmationBox: boolean = false;
  labTestReportDelete: any;
  deleteAuthorisedSignatoryConfirmationBox: boolean = false;
  deleteAuthorisedSignatoryTestReportIndex: any;
  deletedLabtestReportList: Array<any> = [];
  somthingWentWrong: boolean = false;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    private labtestReportUploadService: LabtestReportUploadService,
    public datePipe: DatePipe,
  ) {
    this.intializingMessage()
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getValueBasedLabTestList();
    this.intializingLabTestFormGroup()
  }

  async submitLabtest() {
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode,
        actionIndicator: this.WorkRequestDetails.wrStatus == 2 ? 'REVIEW' : this.WorkRequestDetails.wrStatus == 8 ? 'FINAL' : 'REVIEW',
        transactionResult: null
      }
    }
    await this.labtestReportUploadService.labtestSubmit(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.closePopUp(true)
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
          this.deleteConfirmationBox = false;
          this.labTestReportDelete = {};
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Lab test couldn't save due to some error");
        }
      })
  }

  saveLabtest = async (data: any, isValid: boolean, isSubmit?: boolean) => {
    this.formService.markFormGroupTouched(this.labTestForm);
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          fileCount: this.fileDetailsList.length,
          inputFileDetailsList: this.fileDetailsList,
          laboratoryTestReportCount: 0,
          laboratoryTestReportDetailsList: []
        }
      }
      data.testReportList.forEach((testReport: any, TestReportIndex: number) => {
        const tempTestReport: any = {
          laboratoryTestReportID: testReport.laboratoryTestReportID,
          documentID: testReport.documentID,
          patientUserCode: testReport.patientCode,
          patientName: testReport.patientName,
          diagnosticCentreID: testReport.diagnosticCentreID,
          diagnosticCentreName: testReport.diagnosticCentreName,
          laboratoryTestDate: this.datePipe.transform(new Date(testReport.laboratoryTestDate), 'y-MM-dd'),
          totalPageCount: '',
          laboratoryTestReportPageList: [],
          actionIndicator: 'ADD',
          transactionResult: ''
        }
        testReport.testPageList.forEach((testPage: any, testPageIndex: number) => {
          if (testPage.isAdd) {
            const ReportFoundIndex = this.deletedLabtestReportList.findIndex(res => res.testReportIndex === TestReportIndex)
            if (ReportFoundIndex > -1) {
              const foundDeletedPage = this.deletedLabtestReportList[ReportFoundIndex].testPageList.find((res: any) => res.pageSeqNo === testPage.pageSeqNo)
              if (foundDeletedPage) {
                const tempLaboratoryTestReportPage: any = {
                  pageNo: foundDeletedPage.pageSeqNo,
                  pageResultType: foundDeletedPage.resultType ? 'V' : 'O',
                  laboratoryTestResultCount: 0,
                  laboratoryTestResultList: [],
                  laboratoryObservationTestResult: {
                    laboratoryTestCode: '',
                    laboratoryTestName: '',
                    laboratoryTestProcedure: '',
                    laboratoryTestFindings: '',
                    laboratoryTestImpression: ''
                  },
                  authorisedSignatoryCount: 0,
                  authorisedSignatoryDetailsList: [],
                  laboratoryTestReportPageNotes: foundDeletedPage.specialNotes,
                  pageActionIndicator: '',
                  pageTransactionResult: ''
                }
                if (!foundDeletedPage.resultType) {
                  tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestCode = foundDeletedPage.labtestList[0].laboratoryTestCode;
                  tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestName = foundDeletedPage.labtestList[0].testName;
                  tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestProcedure = foundDeletedPage.procedure;
                  tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestFindings = foundDeletedPage.testFindings;
                  tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestImpression = foundDeletedPage.impression;
                  tempLaboratoryTestReportPage.laboratoryTestResultCount = 1;
                } else {
                  foundDeletedPage.labtestList.forEach((labtest: any, labtestIndex: number) => {
                    const tempLaboratoryTestResult: any = {
                      laboratoryTestCode: labtest.laboratoryTestCode,
                      laboratoryTestName: labtest.testName,
                      testComponentInd: labtest.testComponentInd ? 'Y' : 'N',
                      laboratoryTestComponentResultList: [],
                      recordType: labtest.recordType,
                      measurementUnit: '',
                      numeric: labtest.isNumeric==='Y',
                      laboratoryTestValue: labtest.testResult,
                      laboratoryTestValueChar: labtest.testResultChar,
                      normal: labtest.isNormal,
                      benchmark: labtest.benchmark,
                      actionIndicator: 'ADD',
                      transactionResult: ''
                    }
                    if (labtest.testComponentInd) {
                      labtest.componentList.forEach((component: any, componentIndex: number) => {
                        const tempLaboratoryTestComponentResult: any = {
                          laboratoryTestComponentCode: component.componentCode,
                          laboratoryTestComponentName: component.componentName,
                          recordType: component.recordType,
                          numeric: component.isNumeric==='Y',
                          measurementUnit: '',
                          laboratoryTestValue: component.componentResult,
                          laboratoryTestValueChar: component.componentResultChar,
                          normal: component.isNormal,
                          benchmark: component.benchmark,
                          actionIndicator: '',
                          transactionResult: ''
                        }
                        if (labtest.isAdd) {
                          tempLaboratoryTestComponentResult.actionIndicator = ''
                        } else {
                          if (component.isDelete) {
                            tempLaboratoryTestComponentResult.actionIndicator = ''
                          } else {
                            if (component.isChange) {
                              tempLaboratoryTestComponentResult.actionIndicator = 'UPD'
                            } else {
                              tempLaboratoryTestComponentResult.actionIndicator = ''
                            }
                          }
                        }
                        tempLaboratoryTestResult.laboratoryTestComponentResultList.push(tempLaboratoryTestComponentResult)
                      })
                    }
                    if (labtest.isAdd) {
                      tempLaboratoryTestResult.actionIndicator = 'ADD'
                    } else {
                      if (labtest.isDelete) {
                        tempLaboratoryTestResult.actionIndicator = 'DEL'
                      } else {
                        if (labtest.isChange) {
                          tempLaboratoryTestResult.actionIndicator = 'UPD'
                        } else {
                          tempLaboratoryTestResult.actionIndicator = ''
                        }
                      }
                    }
                    tempLaboratoryTestReportPage.laboratoryTestResultList.push(tempLaboratoryTestResult)
                  })
                  tempLaboratoryTestReportPage.laboratoryTestResultCount = tempLaboratoryTestReportPage.laboratoryTestResultList.length;
                }
                foundDeletedPage.authorisedSignatoryList.forEach((authorisedSignatory: any, authorisedSignatoryIndex: number) => {
                  const tempAuthorisedSignatoryDetails = {
                    physicianUserCode: authorisedSignatory.physicianCode,
                    profilePictureID: '',
                    physicianName: authorisedSignatory.physicianName,
                    signatureFileID: authorisedSignatory.physicianSignattureFileID,
                    actionIndicator: 'ADD',
                    transactionResult: ''
                  }
                  if (authorisedSignatory.isAdd) {
                    tempAuthorisedSignatoryDetails.actionIndicator = 'ADD'
                  } else {
                    if (authorisedSignatory.isDelete) {
                      tempAuthorisedSignatoryDetails.actionIndicator = 'DEL'
                    } else {
                      if (authorisedSignatory.isChange) {
                        tempAuthorisedSignatoryDetails.actionIndicator = 'UPD'
                      } else {
                        tempAuthorisedSignatoryDetails.actionIndicator = ''
                      }
                    }
                  }
                  tempLaboratoryTestReportPage.authorisedSignatoryDetailsList.push(tempAuthorisedSignatoryDetails)
                })
                tempLaboratoryTestReportPage.authorisedSignatoryCount = tempLaboratoryTestReportPage.authorisedSignatoryDetailsList.length;
                if (foundDeletedPage.isAdd) {
                  tempLaboratoryTestReportPage.pageActionIndicator = 'ADD'
                } else {
                  if (foundDeletedPage.isDelete) {
                    tempLaboratoryTestReportPage.pageActionIndicator = 'DEL'
                  } else {
                    if (foundDeletedPage.isChange) {
                      tempLaboratoryTestReportPage.pageActionIndicator = 'UPD'
                    } else {
                      tempLaboratoryTestReportPage.pageActionIndicator = ''
                    }
                  }
                }
                tempTestReport.laboratoryTestReportPageList.push(tempLaboratoryTestReportPage);
              }
            }
          }
          const tempLaboratoryTestReportPage: any = {
            pageNo: testPageIndex + 1,
            pageResultType: testPage.resultType ? 'V' : 'O',
            laboratoryTestResultCount: 0,
            laboratoryTestResultList: [],
            laboratoryObservationTestResult: {
              laboratoryTestCode: '',
              laboratoryTestName: '',
              laboratoryTestProcedure: '',
              laboratoryTestFindings: '',
              laboratoryTestImpression: ''
            },
            authorisedSignatoryCount: 0,
            authorisedSignatoryDetailsList: [],
            laboratoryTestReportPageNotes: testPage.specialNotes,
            pageActionIndicator: '',
            pageTransactionResult: ''
          }
          if (!testPage.resultType) {
            tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestCode = testPage.labtestList[0].laboratoryTestCode;
            tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestName = testPage.labtestList[0].testName;
            tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestProcedure = testPage.procedure;
            tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestFindings = testPage.testFindings;
            tempLaboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestImpression = testPage.impression;
            tempLaboratoryTestReportPage.laboratoryTestResultCount = 1;
          } else {
            testPage.labtestList.forEach((labtest: any, labtestIndex: number) => {
              const tempLaboratoryTestResult: any = {
                laboratoryTestCode: labtest.laboratoryTestCode,
                laboratoryTestName: labtest.testName,
                testComponentInd: labtest.testComponentInd ? 'Y' : 'N',
                laboratoryTestComponentResultList: [],
                recordType: labtest.recordType,
                measurementUnit: '',
                numeric: labtest.isNumeric==='Y',
                laboratoryTestValue: labtest.testResult,
                laboratoryTestValueChar: labtest.testResultChar,
                normal: labtest.isNormal,
                benchmark: labtest.benchmark,
                actionIndicator: 'ADD',
                transactionResult: ''
              }
              if (labtest.testComponentInd) {
                labtest.componentList.forEach((component: any, componentIndex: number) => {
                  const tempLaboratoryTestComponentResult: any = {
                    laboratoryTestComponentCode: component.componentCode,
                    laboratoryTestComponentName: component.componentName,
                    recordType: component.recordType,
                    numeric: component.isNumeric==='Y',
                    measurementUnit: '',
                    laboratoryTestValue: component.componentResult,
                    laboratoryTestValueChar: component.componentResultChar,
                    normal: component.isNormal,
                    benchmark: component.benchmark,
                    actionIndicator: '',
                    transactionResult: ''
                  }
                  if (labtest.isAdd) {
                    tempLaboratoryTestComponentResult.actionIndicator = ''
                  } else {
                    if (component.isDelete) {
                      tempLaboratoryTestComponentResult.actionIndicator = ''
                    } else {
                      if (component.isChange) {
                        tempLaboratoryTestComponentResult.actionIndicator = 'UPD'
                      } else {
                        tempLaboratoryTestComponentResult.actionIndicator = ''
                      }
                    }
                  }
                  tempLaboratoryTestResult.laboratoryTestComponentResultList.push(tempLaboratoryTestComponentResult)
                })
              }
              if (labtest.isAdd) {
                tempLaboratoryTestResult.actionIndicator = 'ADD'
              } else {
                if (labtest.isDelete) {
                  tempLaboratoryTestResult.actionIndicator = 'DEL'
                } else {
                  if (labtest.isChange) {
                    tempLaboratoryTestResult.actionIndicator = 'UPD'
                  } else {
                    tempLaboratoryTestResult.actionIndicator = ''
                  }
                }
              }
              tempLaboratoryTestReportPage.laboratoryTestResultList.push(tempLaboratoryTestResult)
            })
            tempLaboratoryTestReportPage.laboratoryTestResultCount = tempLaboratoryTestReportPage.laboratoryTestResultList.length;
          }
          testPage.authorisedSignatoryList.forEach((authorisedSignatory: any, authorisedSignatoryIndex: number) => {
            const tempAuthorisedSignatoryDetails = {
              physicianUserCode: authorisedSignatory.physicianCode,
              profilePictureID: '',
              physicianName: authorisedSignatory.physicianName,
              signatureFileID: authorisedSignatory.physicianSignattureFileID,
              actionIndicator: 'ADD',
              transactionResult: ''
            }
            if (authorisedSignatory.isAdd) {
              tempAuthorisedSignatoryDetails.actionIndicator = 'ADD'
            } else {
              if (authorisedSignatory.isDelete) {
                tempAuthorisedSignatoryDetails.actionIndicator = 'DEL'
              } else {
                if (authorisedSignatory.isChange) {
                  tempAuthorisedSignatoryDetails.actionIndicator = 'UPD'
                } else {
                  tempAuthorisedSignatoryDetails.actionIndicator = ''
                }
              }
            }
            tempLaboratoryTestReportPage.authorisedSignatoryDetailsList.push(tempAuthorisedSignatoryDetails)
          })
          tempLaboratoryTestReportPage.authorisedSignatoryCount = tempLaboratoryTestReportPage.authorisedSignatoryDetailsList.length;
          if (testPage.isAdd) {
            tempLaboratoryTestReportPage.pageActionIndicator = 'ADD'
          } else {
            if (testPage.isDelete) {
              tempLaboratoryTestReportPage.pageActionIndicator = 'DEL'
            } else {
              if (testPage.isChange) {
                tempLaboratoryTestReportPage.pageActionIndicator = 'UPD'
              } else {
                tempLaboratoryTestReportPage.pageActionIndicator = ''
              }
            }
          }
          tempTestReport.laboratoryTestReportPageList.push(tempLaboratoryTestReportPage);
        })
        tempTestReport.totalPageCount = tempTestReport.laboratoryTestReportPageList.length;
        if (testReport.isAdd) {
          tempTestReport.actionIndicator = 'ADD'
        } else {
          if (testReport.isDelete) {
            tempTestReport.actionIndicator = 'DEL'
          } else {
            if (testReport.isChange) {
              tempTestReport.actionIndicator = 'UPD'
            } else {
              tempTestReport.actionIndicator = ''
            }
          }
        }
        reqData.apiRequest.laboratoryTestReportDetailsList.push(tempTestReport);
        reqData.apiRequest.laboratoryTestReportCount = reqData.apiRequest.laboratoryTestReportDetailsList.length;
      })
      await this.labtestReportUploadService.labtestSave(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            if (isSubmit) {
              this.submitLabtest();
            }
            this.getValueBasedLabTestList();
            this.intializingLabTestFormGroup();
            this.deleteConfirmationBox = false;
            this.labTestReportDelete = {};
          } else {
            if (res.anamnesisErrorList.dbModificationInd === 'Y') {
              this.toastr.error('Please try again');
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            }
            this.deleteConfirmationBox = false;
            this.labTestReportDelete = {};
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Lab test  couldn't save due some error");
          }
        })
    }
  }

  getValueBasedLabTestList = async () => {
    const reqData: any = {
      apiRequest: {
        resultType: 'V',
        searchKeyword: ''
      }
    }
    this.ValueBasedLabTestList = [];
    await this.labtestReportUploadService.SearchLaboratoryTest(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.ValueBasedLabTestList = res.apiResponse.laboratoryTestSearchList;
          this.getSavedLabtestList();
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

  getSavedLabtestList = async () => {
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode,
      }
    }
    await this.labtestReportUploadService.getSavedLabtest(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.createForm(res.apiResponse.laboratoryTestReportDetailsList);
          this.preLaboratoryTestReportDetailsList = res.apiResponse.laboratoryTestReportDetailsList;
          this.fileDetailsList = res.apiResponse.inputFileDetailsList;
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
            this.somthingWentWrong = true;
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            this.somthingWentWrong = true;
          }
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.somthingWentWrong = true;
        this.toastr.error("Lab test couldn't fetch due some error");
        }
      })
  }

  createForm(data: any) {
    if (data.length) {
      data.forEach((laboratoryTestReportDetails: any, laboratoryTestReportDetailsIndex: number) => {
        const templaboratoryTestReportDetails = {
          laboratoryTestReportID: laboratoryTestReportDetails.laboratoryTestReportID,
          documentID: laboratoryTestReportDetails.documentID,
          diagnosticCentreName: laboratoryTestReportDetails.diagnosticCentreName,
          diagnosticCentreID: laboratoryTestReportDetails.diagnosticCentreID,
          diagnosticCentreSearch: false,
          diagnosticCentreErrMsg: '',
          patientName: laboratoryTestReportDetails.patientName,
          patientID: '',
          patientCode: laboratoryTestReportDetails.patientUserCode,
          patientSearch: false,
          laboratoryTestDate: laboratoryTestReportDetails.laboratoryTestDate,
          testPageList: [],
          isAdd: false,
          isChange: false,
          isDelete: false,
          dataSet: true,
        }
        this.testReportList().push(this.addTestReportGroup());
        this.testReportList().at(laboratoryTestReportDetailsIndex).patchValue(templaboratoryTestReportDetails);
        this.testReportList().at(laboratoryTestReportDetailsIndex).get('diagnosticCentreName')?.disable();
        this.testReportList().at(laboratoryTestReportDetailsIndex).get('patientName')?.disable();
        laboratoryTestReportDetails.laboratoryTestReportPageList.forEach((laboratoryTestReportPage: any, laboratoryTestReportPageIndex: number) => {
          const tempLaboratoryTestReportPage = {
            pageSeqNo: laboratoryTestReportPageIndex + 1,
            resultType: laboratoryTestReportPage.pageResultType === 'V',
            specialNotes: laboratoryTestReportPage.laboratoryTestReportPageNotes,
            procedure: '',
            testFindings: '',
            impression: '',
            labtestList: [],
            authorisedSignatoryList: [],
            isAdd: false,
            isChange: false,
            isDelete: false,
            dataSet: true,
          }
          if (laboratoryTestReportPage.pageResultType === 'O') {
            tempLaboratoryTestReportPage.procedure = laboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestProcedure;
            tempLaboratoryTestReportPage.testFindings = laboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestFindings;
            tempLaboratoryTestReportPage.impression = laboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestImpression;
          }
          this.testPageList(laboratoryTestReportDetailsIndex).push(this.addTestPageGroup());
          this.testPageList(laboratoryTestReportDetailsIndex).at(laboratoryTestReportPageIndex).patchValue(tempLaboratoryTestReportPage)
          if (!tempLaboratoryTestReportPage.resultType) {
            const tempLaboratoryTestResult = {
              testName: laboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestName,
              laboratoryTestCode: laboratoryTestReportPage.laboratoryObservationTestResult.laboratoryTestCode,
              testResult: '',
              isNormal: false,
              laboratoryTestResultType: '',
              recordType: '',
              isNumeric: 'N',
              benchmark: '',
              testComponentInd: false,
              testComponentCount: 0,
              componentList: [],
              tempLabtestList: [],
              isAdd: false,
              isChange: false,
              isDelete: false,
              dataSet: true,
            }
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).push(this.addLabTestGroup());
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(0).patchValue(tempLaboratoryTestResult)
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(0).get('testName')?.disable()
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(0).get('testResult')?.clearValidators();
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(0).get('testResult')?.updateValueAndValidity();
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(0).get('testResultChar')?.clearValidators();
            this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(0).get('testResultChar')?.updateValueAndValidity();
          } else {
            laboratoryTestReportPage.laboratoryTestResultList.forEach((laboratoryTestResult: any, laboratoryTestResultIndex: number) => {
              const tempLaboratoryTestResult = {
                testName: laboratoryTestResult.laboratoryTestName,
                laboratoryTestCode: laboratoryTestResult.laboratoryTestCode,
                testResult: laboratoryTestResult.laboratoryTestValue,
                testResultChar: laboratoryTestResult.laboratoryTestValueChar?laboratoryTestResult.laboratoryTestValueChar:'',
                isNormal: laboratoryTestResult.normal,
                laboratoryTestResultType: laboratoryTestResult.laboratoryTestResultType,
                recordType: laboratoryTestResult.recordType,
                isNumeric: laboratoryTestResult.numeric?'Y':'N',
                benchmark: laboratoryTestResult.benchmark,
                testComponentInd: laboratoryTestResult.testComponentInd === 'Y',
                testComponentCount: laboratoryTestResult.laboratoryTestComponentResultList.length,
                componentList: [],
                tempLabtestList: [],
                isAdd: false,
                isChange: false,
                isDelete: false,
                dataSet: true,
              }
              this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).push(this.addLabTestGroup());
              this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).patchValue(tempLaboratoryTestResult);
              this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testName')?.disable();
              if (laboratoryTestResult.testComponentInd === 'Y') {
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResult')?.clearValidators();
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResult')?.updateValueAndValidity();
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResultChar')?.clearValidators();
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResultChar')?.updateValueAndValidity();
              } 
              if(laboratoryTestResult.numeric){
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResultChar')?.clearValidators();
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResultChar')?.updateValueAndValidity();
              }else{
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResult')?.clearValidators();
                this.labtestList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(laboratoryTestResultIndex).get('testResult')?.updateValueAndValidity();
              }
              laboratoryTestResult.laboratoryTestComponentResultList.forEach((laboratoryTestComponent: any, laboratoryTestComponentIndex: number) => {
                const tempLaboratoryTestComponent: any = {
                  componentName: laboratoryTestComponent.laboratoryTestComponentName,
                  componentCode: laboratoryTestComponent.laboratoryTestComponentCode,
                  componentResult: laboratoryTestComponent.laboratoryTestValue,
                  componentResultChar: laboratoryTestComponent.laboratoryTestValueChar,
                  isNormal: laboratoryTestComponent.normal,
                  recordType: laboratoryTestComponent.recordType,
                  isNumeric: laboratoryTestComponent.numeric?'Y':'N',
                  benchmark: laboratoryTestComponent.benchmark,
                  isAdd: false,
                  isChange: false,
                  isDelete: false,
                  dataSet: true,
                }
                this.componentList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex, laboratoryTestResultIndex).push(this.addComponentGroup());
                this.componentList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex, laboratoryTestResultIndex).at(laboratoryTestComponentIndex).patchValue(tempLaboratoryTestComponent);
              })
            })
          }
          laboratoryTestReportPage.authorisedSignatoryDetailsList.forEach((authorisedSignatoryDetails: any, authorisedSignatoryDetailsIndex: number) => {
            const tempauthorisedSignatoryDetails = {
              physicianName: authorisedSignatoryDetails.physicianName,
              physicianID: '',
              physicianCode: authorisedSignatoryDetails.physicianUserCode,
              physicianSearch: '',
              physicianQualification: authorisedSignatoryDetails.physicianQualification,
              physicianSpecialisation: authorisedSignatoryDetails.physicianSpecialisation,
              physicianRegistrationNumber: authorisedSignatoryDetails.registrationNumber,
              physicianRegistrationAuthority: authorisedSignatoryDetails.registrationAuthority,
              physicianSignattureFileID: authorisedSignatoryDetails.signatureFileID,
              tempAuthorisedSignatoryList: null,
              searcAuthorisedSignatory: '',
              isAdd: false,
              isChange: false,
              isDelete: false,
              dataSet: false,
            }
            this.authorisedSignatoryList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).push(this.addAuthorisedSignatoryGroup());
            this.authorisedSignatoryList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(authorisedSignatoryDetailsIndex).patchValue(tempauthorisedSignatoryDetails);
            if (!this.authorisedSignatoryList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(authorisedSignatoryDetailsIndex).get('physicianName')?.disabled) {
              this.authorisedSignatoryList(laboratoryTestReportDetailsIndex, laboratoryTestReportPageIndex).at(authorisedSignatoryDetailsIndex).get('physicianName')?.disable();
            }
          })
        })
      })
    } else {
      this.addAnotherTestReport();
    }
    this.onFormChange(0)
  }

  filterLabtestList(searchKeyword: string, testReportIndex: number, testPageIndex: number, labtestIndex: number, pagrResultType: boolean) {
    const filterValue = searchKeyword.toLowerCase();
    let filteredLabTestList = [];
    if (pagrResultType) {
      filteredLabTestList = this.ValueBasedLabTestList.filter(option =>
        option.laboratoryTestName.toLowerCase().indexOf(filterValue) > -1);
    } else {
      filteredLabTestList = this.ObservationBasedLabTestList.filter(option =>
        option.laboratoryTestName.toLowerCase().indexOf(filterValue) > -1);
    }
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('tempLabtestList')?.setValue(filteredLabTestList)
  }

  addAnotherTestReport() {
    this.testReportList().push(this.addTestReportGroup());
    const testReportIndex = this.testReportList().length - 1;
    this.testPageList(testReportIndex).push(this.addTestPageGroup());
    const testPageIndex = this.testPageList(testReportIndex).length - 1;
    this.authorisedSignatoryList(testReportIndex, testPageIndex).push(this.addAuthorisedSignatoryGroup());
    this.labtestList(testReportIndex, testPageIndex).push(this.addLabTestGroup());
  }

  deleteTestReport(testReportIndex: number) {
    const data = this.testReportList().at(testReportIndex).getRawValue();
    if (!data.isAdd) {
      this.labTestReportDelete = {
        testReportIndex,
        data
      }
      this.deleteConfirmationBox = true;
    } else {
      if (this.testReportList().length > 1) {
        this.testReportList().removeAt(testReportIndex)
        if (testReportIndex > 0) {
          this.onFormChange(testReportIndex - 1);
        }
      }
    }
  }

  confirmDelete() {
    this.labTestReportDelete.data.isDelete = true;
    const finalData = {
      testReportList: [this.labTestReportDelete.data]
    }
    this.saveLabtest(finalData, true);
    if (this.testReportList().length === 0) {
      this.addAnotherTestReport();
    }
    if (this.labTestReportDelete.testReportIndex > 0) {
      this.onFormChange(this.labTestReportDelete.testReportIndex - 1);
    }
  }
  cancelDelete() {
    this.deleteConfirmationBox = false;
    this.labTestReportDelete = {};
  }

  addAnotherTestPage(testReportIndex: number, testReportIssAdd: boolean) {
    if (this.testPageList(testReportIndex).valid) {
      this.testPageList(testReportIndex).push(this.addTestPageGroup());
      const testPageIndex = this.testPageList(testReportIndex).length - 1;
      this.authorisedSignatoryList(testReportIndex, testPageIndex).push(this.addAuthorisedSignatoryGroup())
      this.labtestList(testReportIndex, testPageIndex).push(this.addLabTestGroup())
    } else {
      this.testPageList(testReportIndex).at(this.testPageList(testReportIndex).length - 1).get('errMsg')?.setValue('Please fill the details first')
      setTimeout(() => {
        this.testPageList(testReportIndex).at(this.testPageList(testReportIndex).length - 1).get('errMsg')?.setValue('')
      }, 1500);
    }
  }

  deleteTestPage(testReportIndex: number, testPageIndex: number, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    const testPageListValue = this.testPageList(testReportIndex).value;
    if (!testPageIssAdd) {
      this.testPageList(testReportIndex).at(testPageIndex).get('isDelete')?.setValue(true)
      this.testPageList(testReportIndex).at(testPageIndex).clearValidators();
      this.testPageList(testReportIndex).at(testPageIndex).updateValueAndValidity();
    } else {
      this.testPageList(testReportIndex).removeAt(testPageIndex)
    }
    const activeTestPageList = testPageListValue.filter((res: any) => res.isDelete !== true);
    if (activeTestPageList.length <= 1) {
      this.addAnotherTestPage(testReportIndex, testReportIssAdd)
    }
  }

  addAnotherLabtest(testReportIndex: number, testPageIndex: number, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    if (this.labtestList(testReportIndex, testPageIndex).valid) {
      this.labtestList(testReportIndex, testPageIndex).push(this.addLabTestGroup());
    } else {
      this.labtestList(testReportIndex, testPageIndex).at(this.labtestList(testReportIndex, testPageIndex).length - 1).get('errMsg')?.setValue('Please fill the details first');
      setTimeout(() => {
        this.labtestList(testReportIndex, testPageIndex).at(this.labtestList(testReportIndex, testPageIndex).length - 1).get('errMsg')?.setValue('');
      }, 1500);
    }
  }

  deleteLabtest(testReportIndex: number, testPageIndex: number, labtestIndex: number, labtestIssAdd: boolean, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    const labtestListValue = this.labtestList(testReportIndex, testPageIndex).value;
    const activeLabtestList = labtestListValue.filter((res: any) => res.isDelete !== true);
    if (!labtestIssAdd) {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('isDelete')?.setValue(true);
    } else {
      this.labtestList(testReportIndex, testPageIndex).removeAt(labtestIndex);
    }
    if (activeLabtestList.length === 1) {
      this.addAnotherLabtest(testReportIndex, testPageIndex, testPageIssAdd, testReportIssAdd)
    }
  }

  addAnotherAuthorisedSignatory(testReportIndex: number, testPageIndex: number, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    if (this.authorisedSignatoryList(testReportIndex, testPageIndex).valid) {
      this.authorisedSignatoryList(testReportIndex, testPageIndex).push(this.addAuthorisedSignatoryGroup());
    } else {
      this.authorisedSignatoryList(testReportIndex, testPageIndex).at(this.authorisedSignatoryList(testReportIndex, testPageIndex).length - 1).get('errMsg')?.setValue('Please fill the details first')
      setTimeout(() => {
        this.authorisedSignatoryList(testReportIndex, testPageIndex).at(this.authorisedSignatoryList(testReportIndex, testPageIndex).length - 1).get('errMsg')?.setValue('')
      }, 1500);
    }
  }

  deleteAuthorisedSignatory(testReportIndex: number, testPageIndex: number, authorisedSignatoryIndex: number, authorisedSignatoryIssAdd: boolean, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    const authorisedSignatoryListValue = this.authorisedSignatoryList(testReportIndex, testPageIndex).value
    const ActiveAuthorisedSignatoryList = authorisedSignatoryListValue.filter((res: any) => res.isDelete !== true)
    if (!authorisedSignatoryIssAdd) {
      this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('isDelete')?.setValue(true);
    } else {
      this.authorisedSignatoryList(testReportIndex, testPageIndex).removeAt(authorisedSignatoryIndex);
    }
    if (ActiveAuthorisedSignatoryList.length === 1) {
      this.addAnotherAuthorisedSignatory(testReportIndex, testPageIndex, testPageIssAdd, testReportIssAdd)
    }
  }

  onFormChange(testReportIndex: number) {
    this.viewTestReportIndex = testReportIndex;
    this.testReportList().at(testReportIndex).get('patientName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searcPatient = response;
        if (response && response.length > 2 && this.testReportList().at(testReportIndex).get('patientSearch')?.value === true) {
          this.oldPatientSearchValue = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
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
        }
      })
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searcDiagnosticCentre = response;
        if (response && response.length > 2 && this.testReportList().at(testReportIndex).get('diagnosticCentreSearch')?.value === true) {
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
        }
      })
  }

  // patientSearch start ---->
  selectPatient(testReportIndex: number, Patient: any) {
    this.showPatientDetails = true;
    this.selectedPatientDetails = Patient;
    this.testReportList().at(testReportIndex).get('patientName')?.setValue(Patient.displayName);
    this.testReportList().at(testReportIndex).get('patientSearch')?.setValue(false);
    if (this.testReportList().at(testReportIndex).get('patientName')?.disabled) {
      this.testReportList().at(testReportIndex).get('patientName')?.disable();
    }
  }

  unSelectPatient(testReportIndex: number) {
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
    this.testReportList().at(testReportIndex).get('patientName')?.setValue(this.oldPatientSearchValue);
    this.testReportList().at(testReportIndex).get('patientSearch')?.setValue(false);
    this.testReportList().at(testReportIndex).get('patientName')?.enable();
  }

  selectPatientForTestPage(testReportIndex: number) {
    this.testReportList().at(testReportIndex).get('patientCode')?.setValue(this.selectedPatientDetails.userCode);
    this.testReportList().at(testReportIndex).get('patientID')?.setValue(this.selectedPatientDetails.userID);
    this.testReportList().at(testReportIndex).get('patientName')?.setValue(this.selectedPatientDetails.displayName);
    if (this.testReportList().at(testReportIndex).get('patientName')?.disabled) {
      this.testReportList().at(testReportIndex).get('patientName')?.disable();
    }
    this.testReportList().at(testReportIndex).get('patientSearch')?.setValue(false);
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
    this.testReportChange(testReportIndex)
  }

  unSelectPatientForTestPage(testReportIndex: number) {
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
    this.testReportList().at(testReportIndex).get('patientName')?.setValue(this.oldPatientSearchValue);
    this.testReportList().at(testReportIndex).get('patientCode')?.setValue('');
    this.testReportList().at(testReportIndex).get('patientName')?.enable();
    this.testReportList().at(testReportIndex).get('patientSearch')?.setValue(false);
  }

  onTypePatientName(testReportIndex: number) {
    this.testReportList().at(testReportIndex).get('patientSearch')?.setValue(true);
  }
  // <---- patientSearch end
  // diagnosticCentreSearch start ---->
  selectDiagnosticCentre(testReportIndex: number, diagnosticCentre: any) {
    this.showDiagnosticCentreDetails = true;
    this.selectedDiagnosticCentreDetails = diagnosticCentre;
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.setValue(diagnosticCentre.diagnosticCentreName);
    this.testReportList().at(testReportIndex).get('diagnosticCentreErrMsg')?.setValue('');
    this.testReportList().at(testReportIndex).get('diagnosticCentreSearch')?.setValue(false);
    if (this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.disabled) {
      this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.disable();
    }
  }
  unSelectDiagnosticCentre(testReportIndex: number) {
    this.showDiagnosticCentreDetails = false;
    this.selectedDiagnosticCentreDetails = {};
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.setValue(this.oldDiagnosticCentreSearchValue);
    this.testReportList().at(testReportIndex).get('diagnosticCentreSearch')?.setValue(false);
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.enable();
  }

  selectDiagnosticCentreForTestPage(testReportIndex: number) {
    this.testReportList().at(testReportIndex).get('diagnosticCentreID')?.setValue(this.selectedDiagnosticCentreDetails.diagnosticCentreID);
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.setValue(this.selectedDiagnosticCentreDetails.diagnosticCentreName);
    if (this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.disabled) {
      this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.disable();
    }
    this.testReportList().at(testReportIndex).get('diagnosticCentreSearch')?.setValue(false);
    this.showDiagnosticCentreDetails = false;
    this.selectedDiagnosticCentreDetails = {};
    this.deleteAuthorisedSignatoryTestReportIndex = testReportIndex;
    this.testReportChange(testReportIndex);
  }

  unSelectDiagnosticCentreForTestPage(testReportIndex: number) {
    this.deleteAuthorisedSignatoryConfirmationBox = true;
    this.deleteAuthorisedSignatoryTestReportIndex = testReportIndex;
  }

  openPopUpForAuthorisedSignatory() {
    this.deleteAuthorisedSignatoryConfirmationBox = true;
  }

  closePopUpForAuthorisedSignatory() {
    this.deleteAuthorisedSignatoryConfirmationBox = false;
    this.deleteAuthorisedSignatoryTestReportIndex = null;
  }

  clearAuthorisedSignatoryForReport() {
    const testReportIndex = this.deleteAuthorisedSignatoryTestReportIndex;
    this.showDiagnosticCentreDetails = false;
    this.selectedDiagnosticCentreDetails = {};
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.setValue(this.oldDiagnosticCentreSearchValue);
    this.testReportList().at(testReportIndex).get('diagnosticCentreID')?.setValue('');
    this.testReportList().at(testReportIndex).get('diagnosticCentreName')?.enable();
    this.testReportList().at(testReportIndex).get('diagnosticCentreSearch')?.setValue(false);
    this.testPageList(testReportIndex).controls.forEach((testPage: any, testPageIndex: number) => {
      this.authorisedSignatoryList(testReportIndex, testPageIndex).controls.forEach((authorisedSignatory: any, authorisedSignatoryIndex: number) => {
        if (authorisedSignatory.value.isAdd) {
          this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('isDelete')?.setValue(true);
        } else {
          this.authorisedSignatoryList(testReportIndex, testPageIndex).removeAt(authorisedSignatoryIndex);
        }
      })
      this.authorisedSignatoryList(testReportIndex, testPageIndex).push(this.addAuthorisedSignatoryGroup());
    })
    this.deleteAuthorisedSignatoryConfirmationBox = false;
  }
  onTypeDiagnosticCentreName(testReportIndex: number) {
    this.testReportList().at(testReportIndex).get('diagnosticCentreSearch')?.setValue(true);
  }
  // <----  diagnosticCentreSearch end
  //  authorisedSignatory search start ----->
  authorisedSignatorySearch = async (searchKeyword: string, testReportIndex: number, testPageIndex: number, authorisedSignatoryIndex: number, diagnosticCentreID: string) => {
    if (diagnosticCentreID.length) {
      if (searchKeyword && searchKeyword.length > 2) {
        this.oldPatientSearchValue = searchKeyword;
        this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('searcAuthorisedSignatory')?.setValue(searchKeyword)
        const reqData: any = {
          apiRequest: {
            searchKeyword: searchKeyword,
            commercialID: diagnosticCentreID
          },
        }
        await this.labtestReportUploadService.searchAuthorisedSignatory(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res) && res.apiResponse.resultCount > 0) {
              this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('tempAuthorisedSignatoryList')?.setValue(res.apiResponse.authorisedSignatoryDetailsList);
            } else {
              this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('tempAuthorisedSignatoryList')?.setValue(null);
            }
          })
          .catch((err: any) => {
            this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('tempAuthorisedSignatoryList')?.setValue(null);
          })
      } else {
        this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('tempAuthorisedSignatoryList')?.setValue(null);
      }
    } else {
      /**
       * @todo errMsg Add
       */
      this.testReportList().at(testReportIndex).get('diagnosticCentreErrMsg')?.setValue('Please select diagnostic centren')
      setTimeout(() => { this.testReportList().at(testReportIndex).get('diagnosticCentreErrMsg')?.setValue('') }, 1500);
    }
  }

  /**
   * @author Baidurja Khunte
   * @todo Map AuthorisedSignatory group
   */
  selectAuthorisedSignatory(authorisedSignatory: any, testReportIndex: number, testPageIndex: number, authorisedSignatoryIndex: number) {
    const authorisedSignatoryListValue: Array<any> = this.authorisedSignatoryList(testReportIndex, testPageIndex).value
    const filterauthorisedSignatory = authorisedSignatoryListValue.find((res: any) => res.physicianCode === authorisedSignatory.physicianUserCode && !res.isDelete);
    if (filterauthorisedSignatory) {
      /**
       * @todo add msg
       */
      this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('errMsg')?.setValue('This authorisedSignatory already chosen');
      setTimeout(() => this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('errMsg')?.setValue(''), 1500);
    } else {
      const tempauthorisedSignatory = {
        physicianName: authorisedSignatory.physicianName,
        physicianID: '',
        physicianCode: authorisedSignatory.physicianUserCode,
        physicianSearch: '',
        physicianQualification: authorisedSignatory.physicianQualification,
        physicianSpecialisation: authorisedSignatory.physicianSpecialisation,
        physicianRegistrationNumber: authorisedSignatory.registrationNumber,
        physicianRegistrationAuthority: authorisedSignatory.registrationAuthority,
        physicianSignattureFileID: authorisedSignatory.signatureFileID,
        signatureFileName: authorisedSignatory.signatureFileName,
        tempAuthorisedSignatoryList: null,
        searcAuthorisedSignatory: '',
        isAdd: true,
        isChange: false,
        isDelete: false,
        dataSet: false,
      }
      this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).patchValue(tempauthorisedSignatory);
      this.authorisedSignatoryList(testReportIndex, testPageIndex).at(authorisedSignatoryIndex).get('physicianName')?.disable();
    }
  }
  //  <----- authorisedSignatory search end
  testReportChange(testReportIndex: number) {
    if (!this.testReportList().at(testReportIndex).value.isAdd && !this.testReportList().at(testReportIndex).value.isDelete) {
      this.testReportList().at(testReportIndex).get('isChange')?.setValue(true);
    }
  }

  pageResultTypeChange = async (testReportIndex: number, testPageIndex: number, TestPageIsAdd: boolean, val: boolean, testReportIsAdd: boolean) => {
    if (!val) {
      if (!this.ObservationBasedLabTestList.length) {
        const reqData: any = {
          apiRequest: {
            resultType: 'O',
            searchKeyword: ''
          }
        }
        this.ObservationBasedLabTestList = [];
        await this.labtestReportUploadService.SearchLaboratoryTest(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.ObservationBasedLabTestList = res.apiResponse.laboratoryTestSearchList;
              this.changeTestPage(testReportIndex, testPageIndex, TestPageIsAdd, val, testReportIsAdd)
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
              this.ObservationBasedLabTestList = [];
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Lab test List couldn't fetch due some error");
            this.ObservationBasedLabTestList = [];
            }
          })
      } else {
        this.changeTestPage(testReportIndex, testPageIndex, TestPageIsAdd, val, testReportIsAdd)
      }
    } else {
      this.changeTestPage(testReportIndex, testPageIndex, TestPageIsAdd, val, testReportIsAdd)
    }
  }

  changeTestPage(testReportIndex: number, testPageIndex: number, TestPageIsAdd: boolean, val: boolean, testReportIsAdd: boolean) {
    if (!TestPageIsAdd) {
      const deletePageValue = this.testPageList(testReportIndex).at(testPageIndex).value;
      deletePageValue.isDelete = true;
      deletePageValue.resultType = !val;
      this.testPageList(testReportIndex).at(testPageIndex).reset();
      this.testPageList(testReportIndex).at(testPageIndex).get('isAdd')?.setValue(true);
      this.testPageList(testReportIndex).at(testPageIndex).get('isChange')?.setValue(false);
      this.testPageList(testReportIndex).at(testPageIndex).get('isDelete')?.setValue(false);
      this.testPageList(testReportIndex).at(testPageIndex).get('dataSet')?.setValue(false);
      this.testPageList(testReportIndex).at(testPageIndex).get('pageSeqNo')?.setValue(deletePageValue.pageSeqNo);
      // var labtestListControllArray = this.testPageList(testReportIndex).at(testPageIndex).get('labtestList') as FormArray;
      this.labtestList(testReportIndex, testPageIndex).clear();
      this.labtestList(testReportIndex, testPageIndex).push(this.addLabTestGroup());
      const newLabtestIndex = this.labtestList(testReportIndex, testPageIndex).length - 1;
      if (!val) {
        this.labtestList(testReportIndex, testPageIndex).at(newLabtestIndex).get('tempLabtestList')?.setValue(this.ObservationBasedLabTestList);
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.setValidators([Validators.required]);
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.setValidators([Validators.required]);
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.setValidators([Validators.required]);
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.updateValueAndValidity();
      } else {
        this.labtestList(testReportIndex, testPageIndex).at(newLabtestIndex).get('tempLabtestList')?.setValue(this.ValueBasedLabTestList);
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.clearValidators();
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.setValue('');
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.clearValidators();
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.setValue('');
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.clearValidators();
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.setValue('');;
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.updateValueAndValidity();
      }
      var authorisedSignatoryListControllArray = this.testPageList(testReportIndex).at(testPageIndex).get('authorisedSignatoryList') as FormArray;
      authorisedSignatoryListControllArray.clear();
      authorisedSignatoryListControllArray.push(this.addAuthorisedSignatoryGroup());
      this.testPageList(testReportIndex).at(testPageIndex).get('resultType')?.setValue(val);
      if (this.deletedLabtestReportList.length) {
        const foundIndex = this.deletedLabtestReportList.findIndex((res: any) => res.testReportIndex === testReportIndex);
        if (foundIndex > -1) {
          this.deletedLabtestReportList[foundIndex].testPageList.push(deletePageValue)
        } else {
          const labtestReport: any = {
            testReportIndex: testReportIndex,
            testPageList: [deletePageValue]
          }
          this.deletedLabtestReportList.push(labtestReport)
        }
      } else {
        const labtestReport: any = {
          testReportIndex: testReportIndex,
          testPageList: [deletePageValue]
        }
        this.deletedLabtestReportList.push(labtestReport)
      }
    } else {
      var labtestListControllArray = this.testPageList(testReportIndex).at(testPageIndex).get('labtestList') as FormArray;
      labtestListControllArray.clear();
      labtestListControllArray.push(this.addLabTestGroup());
      const newLabtestIndex = labtestListControllArray.length - 1;
      if (!val) {
        labtestListControllArray.at(newLabtestIndex).get('tempLabtestList')?.setValue(this.ObservationBasedLabTestList)
        labtestListControllArray.at(newLabtestIndex).get('testResult')?.clearValidators();
        labtestListControllArray.at(newLabtestIndex).get('testResult')?.updateValueAndValidity();
        labtestListControllArray.at(newLabtestIndex).get('testResultChar')?.clearValidators();
        labtestListControllArray.at(newLabtestIndex).get('testResultChar')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.setValidators([Validators.required]);
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.setValidators([Validators.required]);
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.setValidators([Validators.required]);
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.updateValueAndValidity();
      } else {
        labtestListControllArray.at(newLabtestIndex).get('tempLabtestList')?.setValue(this.ValueBasedLabTestList)
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.clearValidators();
        this.testPageList(testReportIndex).at(testPageIndex).get('procedure')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.clearValidators();
        this.testPageList(testReportIndex).at(testPageIndex).get('testFindings')?.updateValueAndValidity();
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.clearValidators();
        this.testPageList(testReportIndex).at(testPageIndex).get('impression')?.updateValueAndValidity();
      }
      this.testPageList(testReportIndex).at(testPageIndex).get('resultType')?.setValue(val);
    }
  }

  selectlabtest(labtest: any, testReportIndex: number, testPageIndex: number, labtestIndex: number) {
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('tempLabtestList')?.setValue([])
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testName')?.setValue(labtest.laboratoryTestName);
    if (!this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testName')?.disabled) {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testName')?.disable();
    }
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('laboratoryTestCode')?.setValue(labtest.laboratoryTestCode);
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('laboratoryTestResultType')?.setValue(labtest.laboratoryTestResultType);
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('recordType')?.setValue(labtest.recordType);
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('isNumeric')?.setValue(labtest.numeric);
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('benchmark')?.setValue(labtest.benchmark);
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testComponentCount')?.setValue(labtest.testComponentCount);
    if (labtest.numeric) {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.clearValidators();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.setValue('');
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.updateValueAndValidity();
    } else {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.clearValidators();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.setValue('');
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.updateValueAndValidity();
    }
    if (labtest.laboratoryTestResultType === 'O') {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.clearValidators();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.setValue('');
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.updateValueAndValidity();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.clearValidators();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.setValue('');
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.updateValueAndValidity();
    }
    if (labtest.testComponentCount) {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.clearValidators();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.setValue('');
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.updateValueAndValidity();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.clearValidators();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.setValue('');
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResultChar')?.updateValueAndValidity();
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testComponentInd')?.setValue(true);
      var contreolArray = this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('componentList') as FormArray;
      contreolArray.clear();
      labtest.laboratoryTestComponentList.forEach((val: any, index: number) => {
        const tempComponentData = {
          componentName: val.testComponentName,
          componentCode: val.testComponentCode,
          componentResult: '',
          componentResultChar: '',
          isNormal: false,
          benchmark: val.benchmark,
          recordType: val.recordType,
          isNumeric: val.numeric,
          isAdd: true,
          isChange: false,
          isDelete: false,
          dataSet: false,
        }
        contreolArray.push(this.addComponentGroup());
        contreolArray.at(index).patchValue(tempComponentData);
        if (val.numeric) {
          contreolArray.at(index).get('componentResultChar')?.clearValidators();
          contreolArray.at(index).get('componentResultChar')?.setValue('');
          contreolArray.at(index).get('componentResultChar')?.updateValueAndValidity();
        } else {
          contreolArray.at(index).get('componentResult')?.clearValidators();
          contreolArray.at(index).get('componentResult')?.setValue('');
          contreolArray.at(index).get('componentResult')?.updateValueAndValidity();
        }
      })
    }
    this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('isNormal')?.setValue(false);
  }

  labtestNumericResultChange(testReportIndex: number, testPageIndex: number, labtestIndex: number, value: string, labtestIsAdd: any, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    if (value.length) {
      if (!this.commonService.checkDecimalNumber(value)) {
        const oldVal = value
        this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('testResult')?.setValue('')
      }
    }
    if (!labtestIsAdd) {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('isChange')?.setValue(true);
    }
  }

  labtestChange(testReportIndex: number, testPageIndex: number, labtestIndex: number, labtestIsAdd: any, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    if (!labtestIsAdd) {
      this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('isChange')?.setValue(true);
    }
  }

  testPageChange(testReportIndex: number, testPageIndex: number, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    if (!testPageIssAdd) {
      this.testPageList(testReportIndex).at(testPageIndex).get('isChange')?.setValue(true);
    }
  }

  componentNumericResultChange(testReportIndex: number, testPageIndex: number, labtestIndex: number, componentIndex: number, labtestIsAdd: any, testPageIssAdd: boolean, testReportIssAdd: boolean, value: string) {
    if (value.length) {
      if (!this.commonService.checkDecimalNumber(value)) {
        const oldVal = value
        this.componentList(testReportIndex, testPageIndex, labtestIndex).at(componentIndex).get('componentResult')?.setValue(oldVal.substring(0, oldVal.length - 1))
      }
    }
    if (!labtestIsAdd) {
      this.componentList(testReportIndex, testPageIndex, labtestIndex).at(componentIndex).get('isChange')?.setValue(true);
    }
  }

  componentChange(testReportIndex: number, testPageIndex: number, labtestIndex: number, componentIndex: number, labtestIsAdd: any, testPageIssAdd: boolean, testReportIssAdd: boolean) {
    if (!labtestIsAdd) {
      this.componentList(testReportIndex, testPageIndex, labtestIndex).at(componentIndex).get('isChange')?.setValue(true);
    }
  }

  testReportList() {
    return this.labTestForm.get('testReportList') as FormArray;
  }

  getTestReportController(testReportIndex: number, controlName: string) {
    let ControlArray = <any>this.testReportList();
    return ControlArray.controls[testReportIndex].controls[controlName];
  }

  // getTestReportController(testReportIndex:number,controlName:string){
  //   let prescriptionFormControlArray = <any>this.testReportList();
  //   return this.testReportList().controls[testReportIndex].controls[controlName];
  // }

  testPageList(testReportIndex: number) {
    return this.testReportList().at(testReportIndex).get('testPageList') as FormArray
  }

  activetestPageList(testReportIndex: number) {
    return this.testPageList(testReportIndex).value.filter((res: any) => res.isDelete !== true)
  }

  showPageNumber(testReportIndex: number, testPageIndex: number) {
    let deleteCount: number = 0;
    this.testPageList(testReportIndex).value.forEach((testPage: any, pageIndex: number) => {
      if (testPageIndex > pageIndex) {
        if (testPage.isDelete) {
          deleteCount = deleteCount + 1;
        }
      }
    })
    return testPageIndex - deleteCount + 1
  }

  getTestPageController(testReportIndex: number, testPageIndex: number, controlName: string) {
    let ControlArray = <any>this.testPageList(testReportIndex);
    return ControlArray.controls[testPageIndex].controls[controlName];
  }

  labtestList(testReportIndex: number, testPageIndex: number) {
    return this.testPageList(testReportIndex).at(testPageIndex).get('labtestList') as FormArray
  }

  getLabtestController(testReportIndex: number, testPageIndex: number, labtestIndex: number, controlName: any) {
    let ControlArray = <any>this.labtestList(testReportIndex, testPageIndex);
    return ControlArray.controls[labtestIndex].controls[controlName];
  }

  authorisedSignatoryList(testReportIndex: number, testPageIndex: number) {
    return this.testPageList(testReportIndex).at(testPageIndex).get('authorisedSignatoryList') as FormArray
  }
  getAuthorisedSignatoryController(testReportIndex: number, testPageIndex: number, authorisedSignatoryIndex: number, controlName: any) {
    let ControlArray = <any>this.authorisedSignatoryList(testReportIndex, testPageIndex);
    return ControlArray.controls[authorisedSignatoryIndex].controls[controlName];
  }

  componentList(testReportIndex: number, testPageIndex: number, labtestIndex: number) {
    return this.labtestList(testReportIndex, testPageIndex).at(labtestIndex).get('componentList') as FormArray
  }

  getComponentController(testReportIndex: number, testPageIndex: number, labtestIndex: number, componentIndex: number, controlName: any) {
    let ControlArray = <any>this.componentList(testReportIndex, testPageIndex, labtestIndex);
    return ControlArray.controls[componentIndex].controls[controlName];
  }

  checkValidDate(testReportIndex: number) {
    const dateControl = this.testReportList().at(testReportIndex).get('laboratoryTestDate');
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '00:00:01 AM') > this.currentDate.getTime()) {
      dateControl!.setValue('')
    }
    this.testReportChange(testReportIndex)
  }

  private addTestReportGroup() {
    return this.fb.group({
      laboratoryTestReportID: [''],
      documentID: [''],
      diagnosticCentreName: [''],
      diagnosticCentreID: ['', Validators.required],
      diagnosticCentreSearch: [true],
      diagnosticCentreErrMsg: [''],
      patientName: [''],
      patientID: [''],
      patientCode: ['', Validators.required],
      patientSearch: [true],
      laboratoryTestDate: ['', Validators.required],
      testPageList: this.fb.array([]),
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
    })
  }

  private addTestPageGroup() {
    return this.fb.group({
      pageSeqNo: [''],
      resultType: [true],
      specialNotes: [''],
      procedure: [''],
      testFindings: [''],
      impression: [''],
      labtestList: this.fb.array([]),
      authorisedSignatoryList: this.fb.array([]),
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
      errMsg: [''],
    })
  }

  private addLabTestGroup() {
    return this.fb.group({
      testName: [''],
      laboratoryTestCode: ['', Validators.required],
      testResult: ['', Validators.required],
      testResultChar: ['', Validators.required],
      isNormal: [false],
      laboratoryTestResultType: [''],
      recordType: [''],
      isNumeric: [false],
      benchmark: [''],
      testComponentInd: [false],
      testComponentCount: [0],
      componentList: this.fb.array([]),
      tempLabtestList: [this.ValueBasedLabTestList],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
      errMsg: [''],
    })
  }

  private addComponentGroup() {
    return this.fb.group({
      componentName: [''],
      componentCode: [''],
      componentResult: ['', Validators.required],
      componentResultChar: ['', Validators.required],
      isNormal: [false],
      recordType: [''],
      isNumeric: [false],
      benchmark: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
    })
  }

  private addAuthorisedSignatoryGroup() {
    return this.fb.group({
      physicianName: [''],
      physicianID: [''],
      physicianCode: ['', Validators.required],
      physicianSearch: [''],
      physicianQualification: [''],
      physicianSpecialisation: [''],
      physicianRegistrationNumber: [''],
      physicianRegistrationAuthority: [''],
      physicianSignattureFileID: [''],
      signatureFileName: [''],
      tempAuthorisedSignatoryList: [null],
      searcAuthorisedSignatory: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
      errMsg: ['']
    })
  }

  private intializingLabTestFormGroup() {
    this.labTestForm = this.fb.group({
      testReportList: this.fb.array([])
    })
  }

  private intializingMessage() {
    this.errorMessage.testReport = {
      diagnosticCentreID: {
        required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_DIAGNOST_CENTRE
      },
      patientCode: {
        required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_PATIENT
      },
      laboratoryTestDate: {
        required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_DATE
      },
      testPageList: {
        procedure: {
          required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_PROCEDURE
        },
        testFindings: {
          required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_FINDINGS
        },
        impression: {
          required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_IMPRESSION
        },
        labtestList: {
          laboratoryTestCode: {
            required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST
          },
          testResult: {
            required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_RESULT
          },
          testResultChar: {
            required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_RESULT
          },
          componentList: {
            componentResult: {
              required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_COMPONENT_RESULT
            },
            componentResultChar: {
              required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_COMPONENT_RESULT
            }
          }
        },
        authorisedSignatoryList: {
          physicianCode: {
            required: LABTEST_REPORTUPLOAD.ERR_MSG_REQUIERD_LABTEST_AUTHORISED_SIGNATORY
          }
        }
      }
    }
  }

  changeViewTestReport(testReportIndex: number) {
    this.viewTestReportIndex = testReportIndex;
    this.onFormChange(testReportIndex);
    this.deleteAuthorisedSignatoryConfirmationBox = false;
  }

  changeFileView(index: number) {
    this.viewFileIndex = index;
    this.pdfZoom = 1;
  }

  zoomIn(isIMG: boolean) {
    if (this.pdfZoom <= 10) {
      this.pdfZoom = this.pdfZoom + 1
      if (isIMG) {
        this.setupZoom(this.pdfZoom, true)
      }
    }
  }
  zoomOut(isIMG: boolean) {
    if (this.pdfZoom > 1) {
      this.pdfZoom = this.pdfZoom - 1
      if (isIMG) {
        this.setupZoom(this.pdfZoom, false)
      }
    }
  }

  setupZoom(data: any, isZoomIn: boolean): void {
    let val = data * 10
    if (!isZoomIn) {
      val = data * 10
    }
    function zoom(id: string, value: number): void {
      var outerDiv = document.getElementById('img-wrapper');
      var imgEle = document.getElementById(id);
      var scale = "scale(" + value + ");"
      var origin = "top";
      var translateX = '';
      if (outerDiv!.clientWidth !== outerDiv!.scrollWidth) {
        origin = "top left";
        translateX = ' translateX(' + (-imgEle!.offsetLeft) + 'px) ';
      }
      var style = "-ms-transform:" + translateX + scale + "-webkit-transform:" + translateX + scale + "transform:" + translateX + scale + "transform-origin:" + origin + ";";
      document.getElementById(id)!.setAttribute("style", style);
      outerDiv!.scrollTop = outerDiv!.scrollHeight / 2 - outerDiv!.clientHeight / 2;
      outerDiv!.scrollLeft = outerDiv!.scrollWidth / 2 - outerDiv!.clientWidth / 2;
    }

    var multiplier = 3;
    var zoomlevel = 1 + val / 100 * multiplier;
    zoom("image", zoomlevel);
  }

  rotateImg() {
    switch (this.rotateDeegre) {
      case 0:
        this.rotateDeegre = 90
        break;
      case 90:
        this.rotateDeegre = 180
        break;
      case 180:
        this.rotateDeegre = 360
        break;
      case 360:
        this.rotateDeegre = 0
        break;
      default:
        break;
    }
  }

  closePopUp(data: boolean) {
    this.close.emit(data)
  }

  getSubmitButton() {
    if (this.WorkRequestDetails.wrStatus == 8) {
      return 'Final Submit'
    }
    return 'Submit for Review';
  }
}
