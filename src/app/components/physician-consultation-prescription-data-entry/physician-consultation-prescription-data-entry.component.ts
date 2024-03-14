import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_REQ, BASE_IMAGE_URL_FOR_TEST, GENERATE_PRESCRIPTION_ERROR_MSG } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { PrescriptionDataEntryService } from '@services/prescription-data-entry.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, findIndex, map, startWith } from 'rxjs';
import { DatePipe } from '@angular/common';
import { UtilityService } from '@services/utility.service';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { FileUploadService } from '@services/fileUpload.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
@Component({
  selector: 'app-physician-consultation-prescription-data-entry',
  templateUrl: './physician-consultation-prescription-data-entry.component.html',
  styleUrls: ['./physician-consultation-prescription-data-entry.component.css']
})
export class PhysicianConsultationPrescriptionDataEntryComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  WorkRequestDetails: any = {};
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger }) matAutoComplete: MatAutocompleteTrigger;
  requestKeyDetails: any;
  imageBaseUrlForWorkReq: string = BASE_IMAGE_URL_FOR_REQ;
  imageBaseUrl: string = BASE_IMAGE_URL_FOR_TEST;
  viewFileIndex: number = 0;
  pdfZoom: number = 1;
  rotateDeegre: number = 0;
  prescriptionShowIndex: number = 0;
  prescriptionForm: FormGroup;
  labtestOptionForm: FormGroup;
  medicineList: Array<any> = [];
  labtestList: Array<any> = [];
  childDisplayNo: number = 80;
  medicineGroupOptions: Array<any> = [];
  preSearchvalue: string = '';
  errorMessage: any = {};
  customeLabtestFormErrorMsg: string = '';
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
  //searchedHedhealthClinic start---->
  searcPatient: any;
  patientList: Array<any> = [];
  showPatientDetails: boolean;
  selectedPatientDetails: any;
  oldPatientSearchValue: string;
  //searchedHedhealthClinic <----end
  previousPrescriptions: Array<any> = [];
  currentDate: Date = new Date();
  deleteConfirmationBox: boolean = false;
  deletePrescriptionDetails: any;
  somthingWentWrong: boolean = false;
  healthEquipmentList: Array<any> = [];
  healthEquipmentGroupOptions: Array<any> = [];

  addPhysicianPopup:boolean = false;
  addNewetityPopup:boolean = false;
  drawinPopup :boolean = false;
  presctiptionIndexForDrawing:any;
  presctiptionIDForDrawing:any;
  existingFile:any;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    public datePipe: DatePipe,
    private prescriptionDataEntryService: PrescriptionDataEntryService,
    private healthEquipmentService: HealthEquipmentService,
    private fileUploadService: FileUploadService,
  ) {
    this.intializingPrescriptionFormGroup();
    this.intializingMessage();
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getPrescriptions();
  }

  getPrescriptions = async (prscriptionIndex?:number) => {
    let prescriptiloList: any[] = [];
    const reqData: any = {
      apiRequest: {
        workRequestID: this.WorkRequestDetails.caseCode,
      }
    };
    await this.prescriptionDataEntryService.GetPrescriptions(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          if (res.apiResponse.prescriptionCount) {
            prescriptiloList = res.apiResponse.prescriptionDetailsList;
            this.previousPrescriptions = prescriptiloList;
          }
          this.createPrescripthonForm(prescriptiloList,prscriptionIndex);
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
        this.toastr.error("Prescriptions couldn't fetch due some error");
        }
      })
  }

  createPrescripthonForm(data: any,prscriptionIndex?:number) {
    if (data.length > 0) {
      const tempPrescriptionList: Array<any> = []
      data.forEach((prescription: any, index: number) => {
        this.addPrescription();
        const tempPrescriptionData: any = {
          prescriptionID: prescription.prescriptionID,
          patientName: prescription.patientName ? prescription.patientName : '',
          patientSearch: false,
          patientUserCode: prescription.patientCode ? prescription.patientCode : '',
          patientID: prescription.patientID ? prescription.patientID : '',
          physicianName: prescription.physicianName ? prescription.physicianName : '',
          physicianSearch: false,
          physicianUserID: prescription.physicianCode ? prescription.physicianID : '',
          physicianUserCode: prescription.physicianCode ? prescription.physicianCode : '',
          healthClinicName: prescription.healthClinicName,
          healthClinicSearch: false,
          healthClinicID: prescription.healthClinicID,
          temperature: prescription.patientTemperature ? prescription.patientTemperature : '',
          pulse: prescription.patientPulse ? prescription.patientPulse : '',
          pressure: prescription.patientPressure ? prescription.patientPressure : '',
          weight: prescription.patientWeight ? prescription.patientWeight : '',
          hight: prescription.patientHeight ? prescription.patientHeight : '',
          diabetics: '',
          alchol: '',
          smoking: '',
          thyroid: '',
          pressureRange: '',
          symptoms: prescription.symptoms ? prescription.symptoms : '',
          diagnosis: prescription.diagnosis ? prescription.diagnosis : '',
          medicines: [],
          tempmedicineForm: {},
          labTeses: [],
          templabTestFormGroup: {},
          tempHouseHoldItemGroup: {},
          houseHoldItemList: [],
          nextVisitCount: prescription.nextVisitDays ? prescription.nextVisitDays : '',
          nextVisitUnit: prescription.nextVisitDaysUnit ? prescription.nextVisitDaysUnit : '',
          nextVisitDate: '',
          prescriptionSpecialInstruction: prescription.specialInstructions ? prescription.specialInstructions : '',
          visitDate: prescription.prescriptionDate ? prescription.prescriptionDate : '',
          isAdd: false,
          isChange: false,
          isDelete: false,
          srcFileDetails:prescription.srcFileDetails
        }
        for (let index = 0; index < prescription.patientOtherIndicator.length; index++) {
          switch (index) {
            case 0:
              tempPrescriptionData.diabetics = prescription.patientOtherIndicator[index]
              break;
            case 1:
              tempPrescriptionData.thyroid = prescription.patientOtherIndicator[index]
              break;
            case 2:
              tempPrescriptionData.smoking = prescription.patientOtherIndicator[index]
              break;
            case 3:
              tempPrescriptionData.alchol = prescription.patientOtherIndicator[index]
              break;
            case 4:
              tempPrescriptionData.pressureRange = prescription.patientOtherIndicator[index]
              break;
            default:
              break;
          }
        }
        prescription.prescriptionMedicationDetailsList?.forEach((medicationDetails: any) => {
          const tempMedicationDetails: any = {
            medicineName: medicationDetails.medicineName ? medicationDetails.medicineName : '',
            medicineSearch: true,
            medicineComposition: medicationDetails.medicineComposition ? medicationDetails.medicineComposition : '',
            medicineCode: medicationDetails.medicineCode ? medicationDetails.medicineCode : '',
            frequency: medicationDetails.medicationFrequency ? medicationDetails.medicationFrequency : '',
            dose: medicationDetails.medicationDose ? medicationDetails.medicationDose : '',
            medicineTiming: medicationDetails.medicationTiming ? medicationDetails.medicationTiming : '',
            dayCount: medicationDetails.medicineDuration ? medicationDetails.medicineDuration : '',
            duration: medicationDetails.medicineDurationUnit ? medicationDetails.medicineDurationUnit : '',
            durationText: '',
            spcialNotes: medicationDetails.medicationNotes ? medicationDetails.medicationNotes : '',
            spcialNoteCheck: true,
            breakfast: false,
            lunch: false,
            dinner: false,
            snacks: false,
            isAdd: false,
            isChange: false,
            isDelete: false,
            dataSet: false,
          }
          switch (medicationDetails.medicineDurationUnit) {
            case 'D':
              tempMedicationDetails.durationText = `${medicationDetails.medicineDuration} Days`;
              break;
            case 'W':
              tempMedicationDetails.durationText = `${medicationDetails.medicineDuration} Weeks`;
              break;
            case 'M':
              tempMedicationDetails.durationText = `${medicationDetails.medicineDuration} Months`;
              break;
            case 'Y':
              tempMedicationDetails.durationText = `${medicationDetails.medicineDuration} Years`;
              break;
            default:
              break;
          }
          medicationDetails.medicineMealTimings.length
          for (let index = 0; index < medicationDetails.medicineMealTimings.length; index++) {
            switch (index) {
              case 0:
                if (medicationDetails.medicineMealTimings[index] === 'Y') {
                  tempMedicationDetails.breakfast = true
                }
                break;
              case 1:
                if (medicationDetails.medicineMealTimings[index] === 'Y') {
                  tempMedicationDetails.lunch = true
                }
                break;
              case 2:
                if (medicationDetails.medicineMealTimings[index] === 'Y') {
                  tempMedicationDetails.snacks = true
                }
                break;
              case 3:
                if (medicationDetails.medicineMealTimings[index] === 'Y') {
                  tempMedicationDetails.dinner = true
                }
                break;
              default:
                break;
            }
          }
          tempPrescriptionData.medicines.push(tempMedicationDetails)
        })
        prescription.prescriptionLabTestDetailsList?.forEach((labTestDetails: any) => {
          const tempLabtest: any = {
            uniqueID: labTestDetails.uniqueID,
            labtestSearch: '',
            ifLabtestSearch: true,
            labtest: {
              isUpdated: false,
              testCode: labTestDetails.laboratoryTestCode ? labTestDetails.laboratoryTestCode : '',
              test: labTestDetails.laboratoryTestName ? labTestDetails.laboratoryTestName : '',
              testCheck: true,
              testDescription: labTestDetails.laboratoryDescription ? labTestDetails.laboratoryDescription : '',
              childTests: [],
              displayText: '',
              fullDisplayText: '',
              hidenItem: null,
              openViewMoreTextPopup: false,
              fullTestDescription: '',
            },
            specialInstructionOnTime: labTestDetails.laboratoryTestNotes ? labTestDetails.laboratoryTestNotes : '',
            durationCount: labTestDetails.laboratoryTestTiming.toString() ? labTestDetails.laboratoryTestTiming.toString() : '',
            durationUnit: labTestDetails.laboratoryTestTimingUnit ? labTestDetails.laboratoryTestTimingUnit : '',
            durationText: '',
            durationNowCheck: false,
            updateMode: false,
            isAdd: false,
            isChange: false,
            isDelete: false,
            dataSet: false,
          }
          switch (labTestDetails.laboratoryTestTimingUnit) {
            case 'D':
              tempLabtest.durationText = `${labTestDetails.laboratoryTestTiming} Days`;
              break;
            case 'W':
              tempLabtest.durationText = `${labTestDetails.laboratoryTestTiming} Weeks`;
              break;
            case 'M':
              tempLabtest.durationText = `${labTestDetails.laboratoryTestTiming} Months`;
              break;
            case 'Y':
              tempLabtest.durationText = `${labTestDetails.laboratoryTestTiming} Years`;
              break;
            default:
              break;
          }
          if (labTestDetails.laboratoryTestSummaryList) {
            labTestDetails.laboratoryTestSummaryList.forEach((laboratoryTest: any) => {
              const tempClildTest = {
                uniqueID: laboratoryTest.uniqueID,
                childTest: laboratoryTest.laboratoryTestName ? laboratoryTest.laboratoryTestName : '',
                childTestCode: laboratoryTest.laboratoryTestCode ? laboratoryTest.laboratoryTestCode : '',
                childCheck: laboratoryTest.activeIndicator === 'Y' ? true : false
              }
              tempLabtest.labtest.childTests.push(tempClildTest);
            })
          }
          const tempChildTestList: Array<any> = [];
          tempLabtest.labtest.childTests.forEach((val: any) => {
            if (val.childCheck) {
              tempChildTestList.push(val);
            }
          })
          if (tempChildTestList.length) {
            tempLabtest.labtest.hidenItem = tempChildTestList.length
            tempChildTestList.forEach((val: any) => {
              const valueLength = val.childTest.length;
              if (this.childDisplayNo > valueLength) {
                if (this.childDisplayNo > tempLabtest.labtest.displayText.length) {
                  let tempText
                  if (tempLabtest.labtest.displayText.length < 1) {
                    tempText = tempLabtest.labtest.displayText + val.childTest;
                  } else {
                    tempText = `${tempLabtest.labtest.displayText}, ${val.childTest}`;
                  }
                  if (this.childDisplayNo > tempText.length) {
                    tempLabtest.labtest.hidenItem = tempLabtest.labtest.hidenItem - 1;
                    tempLabtest.labtest.displayText = tempText;
                  }
                }
              }
              if (tempLabtest.labtest.fullDisplayText.length < 1) {
                tempLabtest.labtest.fullDisplayText = tempLabtest.labtest.fullDisplayText + val.childTest;
              } else {
                tempLabtest.labtest.fullDisplayText = `${tempLabtest.labtest.fullDisplayText}, ${val.childTest}`;
              }
            })
          }
          const tempTestDescription: string = tempLabtest.labtest.testDescription;
          if (tempTestDescription.length > this.childDisplayNo) {
            tempLabtest.labtest.fullTestDescription = tempLabtest.labtest.testDescription;
            tempLabtest.labtest.testDescription = tempTestDescription.substring(0, this.childDisplayNo);
          }
          tempPrescriptionData.labTeses.push(tempLabtest)
        })
        prescription.prescriptionHouseholdItemDetailsList.forEach((houseHoldItemDetails: any) => {
          const houseHoldItem = {
            householdItemCode: houseHoldItemDetails.householdItemCode,
            householdItemName: houseHoldItemDetails.householdItemName,
            houseHoldItemSearch: false,
            comments: houseHoldItemDetails.specialInstruction,
            isAdd: false,
            isChange: false,
            isDelete: false,
            updateMode: false,
            errMsg: ''
          }
          tempPrescriptionData.houseHoldItemList.push(houseHoldItem)
        })
        tempPrescriptionList.push(tempPrescriptionData)
      })
      tempPrescriptionList.forEach((v: any, i: number) => {
        let controlArray = <FormArray>this.prescriptionForm.controls['prescriptionList'];
        controlArray.controls[i].patchValue(v);
        this.prescriptionList().at(i).get('physicianName')?.disable();
        this.prescriptionList().at(i).get('patientName')?.disable();
        this.prescriptionList().at(i).get('healthClinicName')?.disable();
        this.nextVisitChange(i)
        v.medicines.forEach((medicine: any, medicineIndex: number) => {
          this.medicines(i).push(this.addMedicineFormGroup());
          const newMedicineIndex = this.medicines(i).length - 1;
          if (newMedicineIndex > -1) {
            this.medicines(i).controls[newMedicineIndex].patchValue({ ...medicine });
          }
        })
        v.labTeses.forEach((labTest: any, labTestIndex: number) => {
          this.labTeses(i).push(this.addLabTestFormGroup());
          const newLabTesteIndex = this.labTeses(i).length - 1;
          if (newLabTesteIndex > -1) {
            this.labTeses(i).controls[newLabTesteIndex].patchValue({ ...labTest });
            labTest.labtest.childTests.forEach((val: any, childTestsIndex: number) => {
              let controlArray = <FormArray>this.labTeses(i).at(newLabTesteIndex).get('labtest')?.get('childTests');
              var childTest: FormGroup = this.addChildTestGroup();
              controlArray.push(childTest);
              controlArray?.controls[childTestsIndex].patchValue(val);
            })
          }
        })
        v.houseHoldItemList.forEach((houseHoldItem: any) => {
          this.houseHoldItemList(i).push(this.addHouseHoldItemGroup())
          this.houseHoldItemList(i).at(this.houseHoldItemList(i).length - 1).patchValue(houseHoldItem)
        })
        this.prescriptionList().at(i).get('dataSet')?.setValue(true);
      })
    } else {
      this.addPrescription()
    }
    if(prscriptionIndex){
      this.viewPrescription(prscriptionIndex);
    }else{
      this.viewPrescription(0);
    }
    
  }

  savePrescriptions = async (data: any, isValid: boolean, saveOption: string, forDelete: boolean) => {
    if (!forDelete) {
      let errorIndex: number = 0;
      this.prescriptionList().controls.forEach((controls: any, index) => {
        if (controls.status === 'INVALID') {
          if (!errorIndex) {
            errorIndex = index;
          }
        }
      })
      if (errorIndex) {
        this.viewPrescription(errorIndex);
      }
      this.prescriptionList().controls.forEach((v: any, i: number) => {
        this.labtestClearValidators(i);
        this.medicineClearValidators(i);
        this.houseHoldItemClearValidators(i);
      })
      this.formService.markFormGroupTouched(this.prescriptionForm);
    }
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          workRequestID: this.WorkRequestDetails.caseCode,
          workRequestType: '',
          saveOption,
          prescriptionCount: data.prescriptionList.length,
          prescriptionDetailsList: []
        }
      };
      data.prescriptionList.forEach((prescription: any, prescriptionIndex: number) => {
        let addIndicator = false;
        const tempprescription: any = {
          prescriptionID: prescription.prescriptionID,
          prescriptionDate: this.datePipe.transform(new Date(prescription.visitDate), 'y-MM-dd'),
          patientID: prescription.patientID,
          patientCode: prescription.patientUserCode,
          healthClinicID: prescription.healthClinicID.length ? prescription.healthClinicID : "",
          healthClinicName: '',
          patientHeight: +prescription.hight,
          patientWeight: +prescription.weight,
          patientPressure: prescription.pressure,
          patientPulse: +prescription.pulse,
          patientTemperature: +prescription.temperature,
          patientOtherIndicator: `${prescription.diabetics}${prescription.thyroid}${prescription.smoking}${prescription.alchol}${prescription.pressureRange}`,
          symptoms: prescription.symptoms,
          diagnosis: prescription.diagnosis,
          physicianID: prescription.physicianUserID,
          physicianCode: prescription.physicianUserCode,
          physicianName: '',
          physicianQualification: '',
          physicianSpecialisation: '',
          prescriptionKeyword: '',
          prescriptionMedicationCount: prescription.medicines.length,
          prescriptionMedicationDetailsList: [],
          prescriptionLabTestCount: prescription.labTeses.length,
          prescriptionLabTestDetailsList: [],
          prescriptionHouseholdItemCount: prescription.houseHoldItemList.length,
          prescriptionHouseholdItemDetailsList: [],
          anUpdateGeneralMedicalInfoRequestList: [],
          specialInstructions: prescription.prescriptionSpecialInstruction,
          nextVisitDays: +prescription.nextVisitCount,
          nextVisitDaysUnit: prescription.nextVisitUnit,
          nextVisitDate: prescription.nextVisitDate,
          actionIndicator: "",
          transactionResult: ""
        }
        if (prescription.isAdd) {
          addIndicator = true
        } if (prescription.isChange) {
          tempprescription.actionIndicator = 'UPD'
        }
        if (prescription.isDelete) {
          tempprescription.actionIndicator = 'DEL'
        }
        if (addIndicator) {
          tempprescription.actionIndicator = 'ADD'
        }
        prescription.medicines.forEach((medicine: any, i: number) => {
          const tempMedicine: any = {
            medicineCode: medicine.medicineCode,
            medicineName: medicine.medicineName,
            medicationDose: medicine.dose,
            medicationFrequency: medicine.frequency,
            medicationTiming: medicine.medicineTiming,
            medicationNotes: medicine.spcialNotes,
            medicineDuration: medicine.dayCount,
            medicineDurationUnit: medicine.duration,
            actionIndicator: '',
            medicineMealTimings: ''
          }
          if (medicine.breakfast) {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
          } else {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
          }
          if (medicine.lunch) {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
          } else {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
          }
          if (medicine.snacks) {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
          } else {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
          }
          if (medicine.dinner) {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
          } else {
            tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
          }
          if (medicine.isChange) {
            tempMedicine.actionIndicator = 'UPD'
          }
          if (medicine.isDelete) {
            tempMedicine.actionIndicator = 'DEL'
          }
          if (medicine.isAdd) {
            tempMedicine.actionIndicator = 'ADD'
          }
          if (addIndicator) {
            tempMedicine.actionIndicator = 'ADD'
          }
          tempprescription.prescriptionMedicationDetailsList.push(tempMedicine)
        })
        prescription.labTeses.forEach((labtest: any) => {
          const tempLabtest: any = {
            uniqueID: labtest.uniqueID,
            laboratoryTestCode: labtest.labtest.testCode,
            laboratoryTestName: '',
            laboratoryDescription: '',
            recordType: labtest.labtest.childTests.length ? 'P' : 'T',
            laboratoryTestTiming: labtest.durationCount,
            laboratoryTestTimingUnit: labtest.durationUnit,
            laboratoryTestSummaryList: [],
            laboratoryTestNotes: labtest.specialInstructionOnTime,
            actionIndicator: ''
          }
          if (labtest.isChange) {
            tempLabtest.actionIndicator = 'UPD'
          }
          if (labtest.isDelete) {
            tempLabtest.actionIndicator = 'DEL'
          }
          if (labtest.isAdd) {
            tempLabtest.actionIndicator = 'ADD'
          }
          if (addIndicator) {
            tempLabtest.actionIndicator = 'ADD'
          }
          labtest.labtest.childTests.forEach((childTest: any) => {
            if (childTest.childCheck) {
              const tempChildTest: any = {
                uniqueID: childTest.uniqueID,
                laboratoryTestCode: childTest.childTestCode,
                laboratoryTestName: '',
                laboratoryTestDescrption: '',
                recordType: '',
                activeIndicator: ''
              }
              tempLabtest.laboratoryTestSummaryList.push(tempChildTest)
            }
          })
          tempprescription.prescriptionLabTestDetailsList.push(tempLabtest);
        })
        prescription.houseHoldItemList.forEach((houseItem: any) => {
          const HouseHoldItem = {
            householdItemCode: houseItem.householdItemCode,
            specialInstruction: houseItem.comments,
            itemquantity: 0,
            actionIndicator: '',
          }
          if (houseItem.isChange) {
            HouseHoldItem.actionIndicator = 'UPD'
          }
          if (houseItem.isDelete) {
            HouseHoldItem.actionIndicator = 'DEL'
          }
          if (houseItem.isAdd) {
            HouseHoldItem.actionIndicator = 'ADD'
          }
          if (addIndicator) {
            HouseHoldItem.actionIndicator = 'ADD'
          }
          tempprescription.prescriptionHouseholdItemDetailsList.push(HouseHoldItem)
        })
        reqData.apiRequest.prescriptionDetailsList.push(tempprescription);
      })
      await this.prescriptionDataEntryService.SavePrescription(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            if (saveOption === 'T') {
              this.intializingPrescriptionFormGroup();
              this.getPrescriptions()
            } else {
              this.close.emit(true);
            }
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Prescriptions couldn't save due some error");
          }
        })
    }
  }

  async savePrescriptionForDrawing(){
    const prescriptionData = this.prescriptionList().at(this.prescriptionShowIndex).getRawValue()
    if(!prescriptionData.prescriptionID){
      let errorIndex: number = 0;
      this.prescriptionList().controls.forEach((controls: any, index) => {
        if (controls.status === 'INVALID') {
          if (!errorIndex) {
            errorIndex = index;
          }
        }
      })
      if (errorIndex) {
        this.viewPrescription(errorIndex);
      }
      this.prescriptionList().controls.forEach((v: any, i: number) => {
        this.labtestClearValidators(i);
        this.medicineClearValidators(i);
        this.houseHoldItemClearValidators(i);
      })
      this.formService.markFormGroupTouched(this.prescriptionForm);
      const data =this.prescriptionForm.getRawValue()
      const isValid = this.prescriptionForm.valid;
      if (isValid) {
        const reqData: any = {
          apiRequest: {
            workRequestID: this.WorkRequestDetails.caseCode,
            workRequestType: '',
            saveOption:'T',
            prescriptionCount: data.prescriptionList.length,
            prescriptionDetailsList: []
          }
        };
        data.prescriptionList.forEach((prescription: any, prescriptionIndex: number) => {
          let addIndicator = false;
          const tempprescription: any = {
            prescriptionID: prescription.prescriptionID,
            prescriptionDate: this.datePipe.transform(new Date(prescription.visitDate), 'y-MM-dd'),
            patientID: prescription.patientID,
            patientCode: prescription.patientUserCode,
            healthClinicID: prescription.healthClinicID.length ? prescription.healthClinicID : "",
            healthClinicName: '',
            patientHeight: +prescription.hight,
            patientWeight: +prescription.weight,
            patientPressure: prescription.pressure,
            patientPulse: +prescription.pulse,
            patientTemperature: +prescription.temperature,
            patientOtherIndicator: `${prescription.diabetics}${prescription.thyroid}${prescription.smoking}${prescription.alchol}${prescription.pressureRange}`,
            symptoms: prescription.symptoms,
            diagnosis: prescription.diagnosis,
            physicianID: prescription.physicianUserID,
            physicianCode: prescription.physicianUserCode,
            physicianName: '',
            physicianQualification: '',
            physicianSpecialisation: '',
            prescriptionKeyword: '',
            prescriptionMedicationCount: prescription.medicines.length,
            prescriptionMedicationDetailsList: [],
            prescriptionLabTestCount: prescription.labTeses.length,
            prescriptionLabTestDetailsList: [],
            prescriptionHouseholdItemCount: prescription.houseHoldItemList.length,
            prescriptionHouseholdItemDetailsList: [],
            anUpdateGeneralMedicalInfoRequestList: [],
            specialInstructions: prescription.prescriptionSpecialInstruction,
            nextVisitDays: +prescription.nextVisitCount,
            nextVisitDaysUnit: prescription.nextVisitUnit,
            nextVisitDate: prescription.nextVisitDate,
            actionIndicator: "",
            transactionResult: ""
          }
          if (prescription.isAdd) {
            addIndicator = true
          } if (prescription.isChange) {
            tempprescription.actionIndicator = 'UPD'
          }
          if (prescription.isDelete) {
            tempprescription.actionIndicator = 'DEL'
          }
          if (addIndicator) {
            tempprescription.actionIndicator = 'ADD'
          }
          prescription.medicines.forEach((medicine: any, i: number) => {
            const tempMedicine: any = {
              medicineCode: medicine.medicineCode,
              medicineName: medicine.medicineName,
              medicationDose: medicine.dose,
              medicationFrequency: medicine.frequency,
              medicationTiming: medicine.medicineTiming,
              medicationNotes: medicine.spcialNotes,
              medicineDuration: medicine.dayCount,
              medicineDurationUnit: medicine.duration,
              actionIndicator: '',
              medicineMealTimings: ''
            }
            if (medicine.breakfast) {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
            } else {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
            }
            if (medicine.lunch) {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
            } else {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
            }
            if (medicine.snacks) {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
            } else {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
            }
            if (medicine.dinner) {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'Y'
            } else {
              tempMedicine.medicineMealTimings = tempMedicine.medicineMealTimings + 'N'
            }
            if (medicine.isChange) {
              tempMedicine.actionIndicator = 'UPD'
            }
            if (medicine.isDelete) {
              tempMedicine.actionIndicator = 'DEL'
            }
            if (medicine.isAdd) {
              tempMedicine.actionIndicator = 'ADD'
            }
            if (addIndicator) {
              tempMedicine.actionIndicator = 'ADD'
            }
            tempprescription.prescriptionMedicationDetailsList.push(tempMedicine)
          })
          prescription.labTeses.forEach((labtest: any) => {
            const tempLabtest: any = {
              uniqueID: labtest.uniqueID,
              laboratoryTestCode: labtest.labtest.testCode,
              laboratoryTestName: '',
              laboratoryDescription: '',
              recordType: labtest.labtest.childTests.length ? 'P' : 'T',
              laboratoryTestTiming: labtest.durationCount,
              laboratoryTestTimingUnit: labtest.durationUnit,
              laboratoryTestSummaryList: [],
              laboratoryTestNotes: labtest.specialInstructionOnTime,
              actionIndicator: ''
            }
            if (labtest.isChange) {
              tempLabtest.actionIndicator = 'UPD'
            }
            if (labtest.isDelete) {
              tempLabtest.actionIndicator = 'DEL'
            }
            if (labtest.isAdd) {
              tempLabtest.actionIndicator = 'ADD'
            }
            if (addIndicator) {
              tempLabtest.actionIndicator = 'ADD'
            }
            labtest.labtest.childTests.forEach((childTest: any) => {
              if (childTest.childCheck) {
                const tempChildTest: any = {
                  uniqueID: childTest.uniqueID,
                  laboratoryTestCode: childTest.childTestCode,
                  laboratoryTestName: '',
                  laboratoryTestDescrption: '',
                  recordType: '',
                  activeIndicator: ''
                }
                tempLabtest.laboratoryTestSummaryList.push(tempChildTest)
              }
            })
            tempprescription.prescriptionLabTestDetailsList.push(tempLabtest);
          })
          prescription.houseHoldItemList.forEach((houseItem: any) => {
            const HouseHoldItem = {
              householdItemCode: houseItem.householdItemCode,
              specialInstruction: houseItem.comments,
              itemquantity: 0,
              actionIndicator: '',
            }
            if (houseItem.isChange) {
              HouseHoldItem.actionIndicator = 'UPD'
            }
            if (houseItem.isDelete) {
              HouseHoldItem.actionIndicator = 'DEL'
            }
            if (houseItem.isAdd) {
              HouseHoldItem.actionIndicator = 'ADD'
            }
            if (addIndicator) {
              HouseHoldItem.actionIndicator = 'ADD'
            }
            tempprescription.prescriptionHouseholdItemDetailsList.push(HouseHoldItem)
          })
          reqData.apiRequest.prescriptionDetailsList.push(tempprescription);
        })
        await this.prescriptionDataEntryService.SavePrescription(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              await this.intializingPrescriptionFormGroup();
              await this.getPrescriptions(this.prescriptionShowIndex);
                const prescriptionID = this.prescriptionList().at(this.prescriptionShowIndex).getRawValue().prescriptionID;
                const existingSrcDocDetails = this.prescriptionList().at(this.prescriptionShowIndex).getRawValue().srcFileDetails;
                if(prescriptionID){
                  await this.openDrawinPopup(this.prescriptionShowIndex,prescriptionID,existingSrcDocDetails)
                }
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
            }
          })
          .catch((err: any) => {
            if(err.status !== 401){
            this.toastr.error("Prescriptions couldn't save due some error");
            }
          })
      }
    }else{
      
      this.openDrawinPopup(this.prescriptionShowIndex,prescriptionData.prescriptionID,prescriptionData.srcFileDetails)
    }
    
    
  }

  onFormChange() {
    this.prescriptionList().at(this.prescriptionShowIndex).valueChanges!.subscribe(res => {
      if (!res.isAdd && !res.isDelete && !res.isChange) {
        if (res.dataSet && !this.prescriptionList().at(this.prescriptionShowIndex).pristine) {
          this.prescriptionList().at(this.prescriptionShowIndex).get('isChange')?.setValue(true);
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('visitDate')!.valueChanges.subscribe(res => {
      if (res) {
        this.prescriptionList().at(this.prescriptionShowIndex).get('visitDateErrorMsg')?.setValue('');
        this.nextVisitChange(this.prescriptionShowIndex)
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineSearch')?.value === true) {
          this.getMedicileList(response);
        }
      })
    this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('labtestSearch')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('ifLabtestSearch')?.value) {
          this.getLabtestList(response)
        } else {
          if (response.length < 2 && !this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('updateMode')?.value) {
            this.labtestList = [];
            this.labtestFormCreat(this.labtestList);
          }
        }
      })
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempHouseHoldItemGroup')?.get('householdItemName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.prescriptionList().at(this.prescriptionShowIndex).get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.value) {
          this.getHealthcareEquipmentleList(response)
        }
      })
    this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationNowCheck')?.valueChanges.subscribe(res => {
      if (res) {
        this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.setValue('0');
        this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.setValue('D');
        if (this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.disabled) {
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.disable();
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.disable();
        }
      } else {
        if (this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.disabled) {
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.setValue('0');
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.setValue('D');
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.enable();
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.enable();
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.valueChanges.subscribe(res => {
      if (this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value) {
        if (this.commonService.checkUserNumber(this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value)) {
          if (+this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value > -1 && this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.value) {
            this.labtestDurationChange()
          }
          if (+this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value !== 0) {
            this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationNowCheck')?.setValue(false);
          }
          if (this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value === '') {
            this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue('');
          }
        } else {
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.setValue('')
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.valueChanges.subscribe(res => {
      if (+this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value > -1 && this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.value) {
        this.labtestDurationChange()
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.valueChanges.subscribe(res => {
      if (this.commonService.checkUserNumber(this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.value)) {
        if (+this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.value > -1 && this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('duration')?.value) {
          this.medicineDurationChange()
        }
        if (this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.value === '') {
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue('');
        }
      } else {
        this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.setValue('')
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('duration')?.valueChanges.subscribe(res => {
      if (this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.value > -1 && this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('duration')?.value) {
        this.medicineDurationChange()
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dose')?.valueChanges.subscribe(res => {
      if (!this.commonService.checkUserNumber(this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dose')?.value)) {
        this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dose')?.setValue('')
      }
    });
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineTiming')?.valueChanges.subscribe(res => {
      if (res) {
        if (!res.length) {
          const data = this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.value
          const eatingTimings: Array<boolean> = []
          if (data.breakfast) {
            eatingTimings.push(true)
          }
          if (data.lunch) {
            eatingTimings.push(true)
          }
          if (data.dinner) {
            eatingTimings.push(true)
          }
          if (data.snacks) {
            eatingTimings.push(true)
          }
          if (eatingTimings.length) {
            this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('breakfast')?.setValue(false)
            this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('lunch')?.setValue(false)
            this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dinner')?.setValue(false)
            this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('snacks')?.setValue(false)
          }
        }
      }
    });
    this.prescriptionList().at(this.prescriptionShowIndex).get('nextVisitCount')?.valueChanges.subscribe(res => {
      this.nextVisitChange(this.prescriptionShowIndex)
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('nextVisitUnit')?.valueChanges.subscribe(res => {
      this.nextVisitChange(this.prescriptionShowIndex)
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('physicianName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searchedPhysician = response;
        if (response && response.length > 2 && this.prescriptionList().at(this.prescriptionShowIndex).get('physicianSearch')?.value === true) {
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
    this.prescriptionList().at(this.prescriptionShowIndex).get('healthClinicName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searcHedhealthClinic = response;
        if (response && response.length > 2 && this.prescriptionList().at(this.prescriptionShowIndex).get('healthClinicSearch')?.value === true) {
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
        } else {
          this.healthClinicList = [];
        }
      })
    this.prescriptionList().at(this.prescriptionShowIndex).get('patientName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searchedPhysician = response;
        if (response && response.length > 2 && this.prescriptionList().at(this.prescriptionShowIndex).get('patientSearch')?.value === true) {
          this.oldPatientSearchValue = response
          const reqData: any = {
            apiRequest: {
              searchKeyword: response,
            },
          }
          await this.prescriptionDataEntryService.searchPatient(reqData)
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
        } else {
          this.patientList = [];
        }
      })
    this.prescriptionList().at(this.prescriptionShowIndex).get('temperature')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkDecimalNumber(res)) {
          const oldVal: string = res
          this.prescriptionList().at(this.prescriptionShowIndex).get('temperature')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('pulse')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkUserNumber(res)) {
          const oldVal: string = res
          this.prescriptionList().at(this.prescriptionShowIndex).get('pulse')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('pressure')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkDecimalNumberwithSlash(res)) {
          const oldVal: string = res
          this.prescriptionList().at(this.prescriptionShowIndex).get('pressure')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('weight')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkDecimalNumber(res)) {
          const oldVal: string = res
          this.prescriptionList().at(this.prescriptionShowIndex).get('weight')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionList().at(this.prescriptionShowIndex).get('hight')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkUserNumber(res)) {
          const oldVal: string = res
          this.prescriptionList().at(this.prescriptionShowIndex).get('hight')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
  }

  labtestClearValidators(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationCount')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationCount')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationUnit')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationUnit')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationText')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationText')?.updateValueAndValidity();
  }
  medicineClearValidators(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineName')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineName')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineCode')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineCode')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('frequency')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('frequency')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineTiming')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineTiming')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('dayCount')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('dayCount')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('duration')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('duration')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('durationText')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('durationText')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('dose')?.clearValidators();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('dose')?.updateValueAndValidity();
  }

  houseHoldItemClearValidators(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('householdItemCode')?.clearValidators()
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('householdItemCode')?.updateValueAndValidity()
  }

  //searchedPhysician start---->
  selectPhysician(prescriptionIndex: number, physician: any) {
    this.showPhysicianDetails = true;
    this.selectedPhysicianDetails = physician;
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.setValue(physician.physicianName);
    this.prescriptionList().at(prescriptionIndex).get('physicianSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.disable();
  }
  unSelectPhysician(prescriptionIndex: number) {
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.setValue(this.oldPhysicianSearchValue);
    this.prescriptionList().at(prescriptionIndex).get('physicianSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.enable();
  }

  selectPhysicianForPrescription(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('physicianUserID')?.setValue(this.selectedPhysicianDetails.physicianUserID);
    this.prescriptionList().at(prescriptionIndex).get('physicianUserCode')?.setValue(this.selectedPhysicianDetails.physicianUserCode);
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.setValue(this.selectedPhysicianDetails.physicianName);
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.disable();
    this.prescriptionList().at(prescriptionIndex).get('physicianSearch')?.setValue(false);
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
  }

  unSelectPhysicianForPrescription(prescriptionIndex: number) {
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.setValue(this.oldPhysicianSearchValue);
    this.prescriptionList().at(prescriptionIndex).get('physicianUserID')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('physicianUserCode')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('physicianName')?.enable();
    this.prescriptionList().at(prescriptionIndex).get('physicianSearch')?.setValue(false);
  }

  onTypephysicianName(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('physicianSearch')?.setValue(true);
  }

  //searchedPhysician <----end
  //searchedPatient start---->

  selectPatient(prescriptionIndex: number, Patient: any) {
    this.showPatientDetails = true;
    this.selectedPatientDetails = Patient;
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.setValue(Patient.displayName);
    this.prescriptionList().at(prescriptionIndex).get('patientSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.disable();
  }
  unSelectPatient(prescriptionIndex: number) {
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.setValue(this.oldPatientSearchValue);
    this.prescriptionList().at(prescriptionIndex).get('patientSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.enable();
  }

  selectPatientForPrescription(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('patientUserCode')?.setValue(this.selectedPatientDetails.userCode);
    this.prescriptionList().at(prescriptionIndex).get('patientID')?.setValue(this.selectedPatientDetails.userID);
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.setValue(this.selectedPatientDetails.displayName);
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.disable();
    this.prescriptionList().at(prescriptionIndex).get('patientSearch')?.setValue(false);
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
  }

  unSelectPatientForPrescription(prescriptionIndex: number) {
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.setValue(this.oldPatientSearchValue);
    this.prescriptionList().at(prescriptionIndex).get('patientUserCode')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('patientName')?.enable();
    this.prescriptionList().at(prescriptionIndex).get('patientSearch')?.setValue(false);
  }

  onTypePatientName(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('patientSearch')?.setValue(true);
  }
  //searchedPatient <----end
  //searchedHealthClinic start---->

  selectHealthClinic(prescriptionIndex: number, healthClinic: any) {
    this.showHealthClinicDetails = true;
    this.selectedHealthClinicDetails = healthClinic;
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.setValue(healthClinic.healthClinicName);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.disable();
  }
  unSelectHealthClinic(prescriptionIndex: number) {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.enable();
  }

  selectHealthClinicForPrescription(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('healthClinicID')?.setValue(this.selectedHealthClinicDetails.healthClinicID);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.setValue(this.selectedHealthClinicDetails.healthClinicName);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.disable();
    this.prescriptionList().at(prescriptionIndex).get('healthClinicSearch')?.setValue(false);
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
  }

  unSelectHealthClinicForPrescription(prescriptionIndex: number) {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.prescriptionList().at(prescriptionIndex).get('healthClinicID')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('healthClinicName')?.enable();
    this.prescriptionList().at(prescriptionIndex).get('healthClinicSearch')?.setValue(false);
  }

  onTypeHealthClinicName(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('healthClinicSearch')?.setValue(true);
  }
  //searchedHealthClinic <----end

  nextVisitChange(prescriptionIndex: number) {
    const tempvisitDate = this.prescriptionList().at(prescriptionIndex).get('visitDate')?.value;
    if (tempvisitDate) {
      const tempNextVisitCount = this.prescriptionList().at(prescriptionIndex).get('nextVisitCount')?.value;
      const tempNextVisitUnit = this.prescriptionList().at(prescriptionIndex).get('nextVisitUnit')?.value;
      if (tempNextVisitCount) {
        if (this.commonService.checkUserNumber((tempNextVisitCount as number).toString()) === true) {
          if (tempNextVisitCount && tempNextVisitUnit.length) {
            const currentDate = new Date(tempvisitDate);
            let nextVisitDate: any;
            if (this.prescriptionList().at(prescriptionIndex).get('nextVisitUnit')?.value === 'D') {
              nextVisitDate = new Date(currentDate.setDate(currentDate.getDate() + +tempNextVisitCount))
            } else if (this.prescriptionList().at(prescriptionIndex).get('nextVisitUnit')?.value === 'M') {
              nextVisitDate = new Date(currentDate.setMonth(currentDate.getMonth() + +tempNextVisitCount))
            } else {
              nextVisitDate = currentDate.setFullYear(currentDate.getFullYear() + +tempNextVisitCount)
            }
            this.prescriptionList().at(prescriptionIndex).get('nextVisitDate')?.setValue(nextVisitDate);
          } else {
            this.prescriptionList().at(prescriptionIndex).get('nextVisitDate')?.setValue('');
          }
        } else {
          this.prescriptionList().at(prescriptionIndex).get('nextVisitCount')?.setValue('')
        }
      } else {
        this.prescriptionList().at(prescriptionIndex).get('nextVisitDate')?.setValue('');
      }
    } else {
      this.prescriptionList().at(prescriptionIndex).get('visitDateErrorMsg')?.setValue(this.errorMessage.prescriptionForm.visitDate.required)
    }
  }

  // labtet start ---->
  labtestDurationChange() {
    const durationCount = +this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationCount')?.value
    const durationUnit = this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationUnit')?.value
    if (durationCount > 1) {
      switch (durationUnit) {
        case 'D':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Days`)
          break;
        case 'W':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Weeks`)
          break;
        case 'M':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Months`)
          break;
        case 'Y':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Years`)
          break;
        default:
          break;
      }
    } else {
      switch (durationUnit) {
        case 'D':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Day`)
          break;
        case 'W':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Week`)
          break;
        case 'M':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Month`)
          break;
        case 'Y':
          this.prescriptionList().at(this.prescriptionShowIndex).get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Year`)
          break;
        default:
          break;
      }
    }
  }

  viewAllChild(prescriptionIndex: number, selectedLabtestIndex: number) {
    this.labTeses(prescriptionIndex).at(selectedLabtestIndex).get('labtest')?.get('openViewMoreTextPopup')
    this.labTeses(prescriptionIndex).controls.forEach((val: any, i: number) => {
      this.labTeses(prescriptionIndex).at(i).get('labtest')?.get('openViewMoreTextPopup')?.setValue(false)
    })
    this.labTeses(prescriptionIndex).at(selectedLabtestIndex).get('labtest')?.get('openViewMoreTextPopup')?.setValue(true)
  }

  viewMorTextPopupClose(prescriptionIndex: number, selectedLabtestIndex: number) {
    this.labTeses(prescriptionIndex).at(selectedLabtestIndex).get('labtest')?.get('openViewMoreTextPopup')?.setValue(false)
    // this.openViewMoreTextPopup = false;
  }

  labtestSave(prescriptionIndex: number, data: any) {
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.setValidators([Validators.required]);
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationText')?.setValidators([Validators.required]);
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('durationText')?.updateValueAndValidity();
    this.formService.markFormGroupTouched((this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup') as FormGroup))
    if ((this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup') as FormGroup).valid) {
      const filterLabtest = this.labTeses(prescriptionIndex).value.find((res: any) => res.labtest.testCode === data.labtest.testCode && res.isDelete !== true);
      if (filterLabtest) {
        const updatedLabTestIndex = this.labTeses(prescriptionIndex).value.findIndex((res: any) => res.labtest.testCode === data.labtest.testCode)
        if (filterLabtest.updateMode) {
          const tempData = { ...data };
          tempData.updateMode = false;
          tempData.isAdd = true;
          tempData.isDelete = false;
          tempData.isChange = false;
          this.labTeses(prescriptionIndex).controls[updatedLabTestIndex].patchValue(tempData);
          let controlArray = <FormArray>this.labTeses(prescriptionIndex).at(updatedLabTestIndex).get('labtest')?.get('childTests');
          controlArray.clear();
          tempData.labtest.childTests.forEach((val: any, index: number) => {
            var childTest: FormGroup = this.addChildTestGroup();
            controlArray.push(childTest);
            controlArray?.controls[index].patchValue(val);
          })
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.reset();
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('isAdd')?.setValue(true);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('isChange')?.setValue(false);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('isDelete')?.setValue(false);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('dataSet')?.setValue(false);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labTeses')?.reset();
          let templabTestFormchildTestscontrolArray = <FormArray>this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('childTests');
          templabTestFormchildTestscontrolArray.clear();
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.enable();
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.setValue('');
          this.labtestList = [];
          this.labtestFormCreat(this.labtestList);
        } else {
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('errMsg')?.setValue('This lab test already chosen')
          setTimeout(() => { this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('errMsg')?.setValue('') }, 2500);
        }
      } else {
        this.labTeses(prescriptionIndex).push(this.addLabTestFormGroup());
        const newLabTesteIndex = this.labTeses(prescriptionIndex).length - 1;
        if (newLabTesteIndex > -1) {
          this.labTeses(prescriptionIndex).controls[newLabTesteIndex].patchValue({ ...data });
          let controlArray = <FormArray>this.labTeses(prescriptionIndex).at(newLabTesteIndex).get('labtest')?.get('childTests');
          controlArray.clear();
          data.labtest.childTests.forEach((val: any, index: number) => {
            var childTest: FormGroup = this.addChildTestGroup();
            controlArray.push(childTest);
            controlArray?.controls[index].patchValue(val);
          })
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.reset();
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('isAdd')?.setValue(true);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('isChange')?.setValue(false);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('isDelete')?.setValue(false);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('dataSet')?.setValue(false);
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labTeses')?.reset();
          let tempLabtestForChildTestsControlArray = <FormArray>this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('childTests');
          tempLabtestForChildTestsControlArray.clear();
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.enable();
          this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.setValue('');
          this.labtestList = [];
          this.labtestFormCreat(this.labtestList);
        }
      }
    }
  }

  onLabtestSearchType(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(true)
  }

  editLabtest(prescriptionIndex: number, labTestIndex: number) {
    if (!this.labTeses(prescriptionIndex).at(labTestIndex).get('updateMode')?.value) {
      const deletelabtest = this.labTeses(prescriptionIndex).at(labTestIndex)?.value
      deletelabtest.isDelete = true;
      deletelabtest.isAdd = false;
      this.labTeses(prescriptionIndex).push(this.addLabTestFormGroup());
      const newLabTesteIndex = this.labTeses(prescriptionIndex).length - 1;
      if (newLabTesteIndex > -1) {
        this.labTeses(prescriptionIndex).controls[newLabTesteIndex].patchValue({ ...deletelabtest });
        let controlArray = <FormArray>this.labTeses(prescriptionIndex).at(newLabTesteIndex).get('labtest')?.get('childTests');
        controlArray.clear();
        deletelabtest.labtest.childTests.forEach((val: any, index: number) => {
          var childTest: FormGroup = this.addChildTestGroup();
          controlArray.push(childTest);
          controlArray?.controls[index].patchValue(val);
        })
      }
      this.prescriptionList().at(prescriptionIndex).get('isChange')?.setValue(true);
      const templabtest = {
        ...this.labTeses(prescriptionIndex).at(labTestIndex).get('labtest')?.value
      }
      templabtest.testCheck = true;
      templabtest.testDescription = templabtest.fullTestDescription;
      this.labtestFormCreat([templabtest]);
      this.labTeses(prescriptionIndex).at(labTestIndex).get('updateMode')?.setValue(true);
      const value = this.labTeses(prescriptionIndex).at(labTestIndex).value;
      var templabTestFormGroup = (this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup') as FormGroup)
      value.uniqueID = '';
      value.isAdd = true;
      templabTestFormGroup.patchValue(value);
      this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.disable();
      value.labtest.childTests;
      var childTestControlArray = templabTestFormGroup.get('labtest')?.get('childTests') as FormArray;
      childTestControlArray.clear()
      value.labtest.childTests.forEach((v: any, i: number) => {
        childTestControlArray.push(this.addChildTestGroup());
        childTestControlArray.at(i).patchValue(v);
      })
    }
  }

  getLabtestList = async (searchKey: string) => {
    const reqData: any = {
      apiRequest: { laboratoryTestKeyword: searchKey }
    }
    await this.prescriptionDataEntryService.getLabTestList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const labtestList: Array<any> = [];
          res.apiResponse.laboratoryTestPackageList.forEach((laboratoryTestPackage: any) => {
            const tempLabTest: any = {
              testCode: laboratoryTestPackage.laboratoryTestPackageCode,
              test: laboratoryTestPackage.laboratoryTestPackageDescription,
              testCheck: false,
              testDescription: laboratoryTestPackage.laboratoryTestPackageDescription,
              scheduleStatus: laboratoryTestPackage.scheduleStatus,
              childTests: []
            }
            laboratoryTestPackage.laboratoryTestSummaryList.forEach((laboratoryTestSummary: any) => {
              const tempChildTest: any = {
                childTest: laboratoryTestSummary.laboratoryTestName,
                childTestCode: laboratoryTestSummary.laboratoryTestCode,
                childTestDescription: laboratoryTestSummary.laboratoryTestDescrption,
                recordType: laboratoryTestSummary.recordType,
                childCheck: false
              }
              tempLabTest.childTests.push(tempChildTest)
            })
            labtestList.push(tempLabTest);
          })
          this.labtestList = labtestList;
          this.labtestFormCreat(this.labtestList);
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Lab test List couldn't fetch due some error");
        }
      })
  }

  removeSelecetedLabTest(index: number) {
    this.prescriptionList().at(index).get('templabTestFormGroup')?.get('labtest')?.reset();
    let controlArray = <FormArray>this.prescriptionList().at(index).get('templabTestFormGroup')?.get('labtest')?.get('childTests');
    controlArray.clear();
    this.prescriptionList().at(index).get('templabTestFormGroup')?.get('labtestSearch')?.enable();
    this.prescriptionList().at(index).get('templabTestFormGroup')?.get('labtestSearch')?.setValue('');
    this.prescriptionList().at(index).get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(true);
  }

  optionChoose(prescriptionIndex: number, value: any) {
    const checkedOptionArray = value.options.filter((res: any) => res.testCheck === true);
    if (checkedOptionArray.length === 1) {
      const option = value.options.find((res: any) => res.testCheck === true);
      const tempoptions: any = {
        ...option, displayText: '', fullDisplayText: '', hidenItem: 0,
        openViewMoreTextPopup: false, fullTestDescription: ''
      };
      const tempChildTestList: Array<any> = [];
      tempoptions.childTests.forEach((val: any) => {
        if (val.childCheck) {
          tempChildTestList.push(val);
        }
      })
      if (tempChildTestList.length) {
        tempoptions.hidenItem = tempChildTestList.length
        tempChildTestList.forEach((val: any) => {
          const valueLength = val.childTest.length;
          if (this.childDisplayNo > valueLength) {
            if (this.childDisplayNo > tempoptions.displayText.length) {
              let tempText
              if (tempoptions.displayText.length < 1) {
                tempText = tempoptions.displayText + val.childTest;
              } else {
                tempText = `${tempoptions.displayText}, ${val.childTest}`;
              }
              if (this.childDisplayNo > tempText.length) {
                tempoptions.hidenItem = tempoptions.hidenItem - 1;
                tempoptions.displayText = tempText;
              }
            }
          }
          if (tempoptions.fullDisplayText.length < 1) {
            tempoptions.fullDisplayText = tempoptions.fullDisplayText + val.childTest;
          } else {
            tempoptions.fullDisplayText = `${tempoptions.fullDisplayText}, ${val.childTest}`;
          }
        })
      }
      const tempTestDescription: string = tempoptions.testDescription;
      if (tempTestDescription.length > this.childDisplayNo) {
        tempoptions.fullTestDescription = tempoptions.testDescription;
        tempoptions.testDescription = tempTestDescription.substring(0, this.childDisplayNo);
      }
      if (tempoptions.childTests.length) {
        (this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('childTests') as FormArray).clear();
        tempoptions.childTests.forEach((val: any, index: number) => {
          (this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.get('childTests') as FormArray).push(this.addChildTestGroup());
        })
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.patchValue(tempoptions);
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.disable();
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.setValue(tempoptions.test)
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(false)
        this.labtestOptionForm = this.fb.group({
          options: this.fb.array([])
        })
      } else {
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtest')?.patchValue(tempoptions);
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.disable();
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('labtestSearch')?.setValue(tempoptions.test);
        this.prescriptionList().at(prescriptionIndex).get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(false);
        this.labtestOptionForm = this.fb.group({
          options: this.fb.array([])
        })
      }
    } else if (checkedOptionArray.length > 1) {
      this.customeLabtestFormErrorMsg = 'Please choose one labtest';
      setTimeout(() => { this.customeLabtestFormErrorMsg = '' }, 1500);
    } else {
      this.customeLabtestFormErrorMsg = 'No labtest Choosen';
      setTimeout(() => { this.customeLabtestFormErrorMsg = '' }, 1500);
    }
  }

  clearLabTestOptionForm() {
    this.labtestFormCreat([]);
  }

  optionChecked(index: number, value: boolean) {
    if (value) {
      this.childTests(index).controls.forEach((val: any, i: number) => {
        if (this.childTests(index).controls[i].get('childCheck')?.setValue(true)) {
        }
      });
    } else {
      this.childTests(index).controls.forEach((val: any, i: number) => {
        if (this.childTests(index).controls[i].get('childCheck')?.setValue(false)) {
        }
      });
    }
  }

  childCheck(optionIndex: number) {
    let noOfCheck: number = 0;
    this.childTests(optionIndex).controls.forEach((val: any, i: number) => {
      if (this.childTests(optionIndex).controls[i].get('childCheck')?.value) {
        noOfCheck = noOfCheck + 1
      }
    });
    if (noOfCheck === 0) {
      this.optins().at(optionIndex).get('testCheck')?.patchValue(false);
    }
    if (noOfCheck > 0) {
      this.optins().at(optionIndex).get('testCheck')?.patchValue(true);
    }
  }

  private labtestFormCreat(labtestList: Array<any>) {
    this.labtestOptionForm = this.fb.group({
      options: this.fb.array([])
    })
    labtestList.forEach((val: any, index: number) => {
      var parentData: FormGroup = this.addOptionGroup();
      this.optins().push(parentData);
      this.optins().at(index).patchValue(val);
      this.childTests(index).clear();
      val.childTests.forEach((v: any, i: number) => {
        var child: FormGroup = this.addChildTestGroup()
        this.childTests(index).push(child);
        this.childTests(index).at(i).patchValue(v);
      })
    })
  }

  optins() {
    return this.labtestOptionForm.get('options') as FormArray;
  }

  addOptionGroup() {
    return this.fb.group({
      isUpdated: [false],
      testCode: [''],
      test: [''],
      testCheck: [''],
      testDescription: [''],
      childTests: this.fb.array([])
    })
  }

  childTests(index: number) {
    return this.optins().at(index).get('childTests') as FormArray;
  }

  addChildTestGroup() {
    return this.fb.group({
      uniqueID: [''],
      childTest: [''],
      childTestCode: [''],
      childCheck: [false]
    })
  }

  labTeses(index: number) {
    return this.prescriptionList().at(index).get('labTeses') as FormArray;
  }

  getTemplabTestFormController(prescriptionIndex: number, controlName: any) {
    let TempmedicineFormControlArray = <any>this.prescriptionForm.get('prescriptionList');
    return TempmedicineFormControlArray.controls[prescriptionIndex].controls['templabTestFormGroup'].controls[controlName];
  }

  deleteLabtest(prescriptionIndex: number, labtestIndex: number) {
    if (!this.labTeses(prescriptionIndex).at(labtestIndex).get('updateMode')?.value) {
      if (this.labTeses(prescriptionIndex).at(labtestIndex).get('isAdd')?.value) {
        this.labTeses(prescriptionIndex).removeAt(labtestIndex);
      } else {
        this.labTeses(prescriptionIndex).at(labtestIndex).get('isDelete')?.setValue(true);
        this.prescriptionList().at(prescriptionIndex).get('isChange')?.setValue(true);
      }
    }
  }
  //<-----labTest end
  // medicine start ----->
  medicineDurationChange() {
    const durationCount = +this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('dayCount')?.value
    const durationUnit = this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('duration')?.value
    if (durationCount > 1) {
      switch (durationUnit) {
        case 'D':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Days`)
          break;
        case 'W':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Weeks`)
          break;
        case 'M':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Months`)
          break;
        case 'Y':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Years`)
          break;
        default:
          break;
      }
    } else if (durationCount > 0 && durationCount < 2) {
      switch (durationUnit) {
        case 'D':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Day`)
          break;
        case 'W':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Week`)
          break;
        case 'M':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Month`)
          break;
        case 'Y':
          this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Year`)
          break;
        default:
          break;
      }
    }
  }

  selectedMedicineList(prescriptionIndex: number) {
    return this.prescriptionList().at(prescriptionIndex).get('medicines') as FormArray
  }

  deleteMedecine(prescriptionIndex: number, medicineIndex: number) {
    if (!this.medicines(prescriptionIndex).at(medicineIndex).get('updateMode')?.value) {
      if (this.medicines(prescriptionIndex).at(medicineIndex).get('isAdd')?.value) {
        this.medicines(prescriptionIndex).removeAt(medicineIndex);
      } else {
        this.medicines(prescriptionIndex).at(medicineIndex).get('isDelete')?.setValue(true);
        this.prescriptionList().at(prescriptionIndex).get('isChange')?.setValue(true);
      }
    }
  }

  editMedicine(prescriptionIndex: number, medicineIndex: number) {
    if (!this.medicines(prescriptionIndex).at(medicineIndex).get('updateMode')?.value) {
      this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineSearch')?.setValue(false)
      // this.getMedicileList(this.medicines(prescriptionIndex).at(medicineIndex).get('medicineName')?.value)
      this.medicines(prescriptionIndex).at(medicineIndex).get('updateMode')?.setValue(true);
      const tempData: any = this.medicines(prescriptionIndex).at(medicineIndex).value;
      tempData.medicineSearch = false;
      (this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm') as FormGroup).patchValue(this.medicines(prescriptionIndex).at(medicineIndex).value)
    }
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineName')?.disable()
  }

  medicineFormClear(prescriptionIndex: number) {
    const updatedMedicineIndex = this.medicines(prescriptionIndex).value.findIndex((res: any) => res.medicineCode === this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.value.medicineCode)
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.reset();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('isAdd')?.setValue(true);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('isChange')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('isDelete')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('dataSet')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineTiming')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('frequency')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('duration')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('dose')?.setValue('');
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('durationText')?.setValue('');
    this.medicineList = [];
    this.medicineGroupOptions = [];
    if (updatedMedicineIndex > -1) {
      if (this.medicines(prescriptionIndex).at(updatedMedicineIndex).get('updateMode')?.value) {
        this.medicines(prescriptionIndex).at(updatedMedicineIndex).get('updateMode')?.setValue(false)
      }
    }
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineName')?.enable()
  }

  medicineSave(prescriptionIndex: number, data: any) {
    this.prescriptionList().at(this.prescriptionShowIndex).get('tempmedicineForm')?.get('medicineSearch')?.setValue(false)
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineName')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineName')?.updateValueAndValidity();
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineCode')?.setValidators([Validators.required]);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineCode')?.updateValueAndValidity();
    // this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('durationText')?.setValidators([Validators.required]);
    // this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('durationText')?.updateValueAndValidity();
    this.formService.markFormGroupTouched((this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm') as FormGroup))
    if ((this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm') as FormGroup).valid) {
      const eatingTimings: Array<boolean> = []
      if (data.breakfast) {
        eatingTimings.push(true)
      }
      if (data.lunch) {
        eatingTimings.push(true)
      }
      if (data.dinner) {
        eatingTimings.push(true)
      }
      if (data.snacks) {
        eatingTimings.push(true)
      }
      let eatingTimingsValid = true;
      if (data.medicineTiming.length) {
        switch (data.dose) {
          case '1':
            if (eatingTimings.length !== 1) {
              eatingTimingsValid = false;
              this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          case '2':
            if (eatingTimings.length !== 2) {
              eatingTimingsValid = false;
              this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          case '3':
            if (eatingTimings.length !== 3) {
              eatingTimingsValid = false;
              this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          case '4':
            if (eatingTimings.length !== 4) {
              eatingTimingsValid = false;
              this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          default:
            break;
        }
      }
      if (eatingTimingsValid) {
        const filterMedicine = this.medicines(prescriptionIndex).value.find((res: any) => res.medicineCode === data.medicineCode && res.isDelete !== true);
        if (filterMedicine) {
          const updatedMedicineIndex = this.medicines(prescriptionIndex).value.findIndex((res: any) => res.medicineCode === data.medicineCode)
          if (filterMedicine.updateMode) {
            const tempData = { ...data };
            if (!tempData.isAdd) {
              tempData.isChange = true;
            }
            tempData.updateMode = false;
            tempData.medicineSearch = false;
            this.medicines(prescriptionIndex).controls[updatedMedicineIndex].patchValue(tempData);
            this.medicineFormClear(prescriptionIndex)
            this.medicineList = [];
            this.medicineGroupOptions = [];
          } else {
            this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('errMsg')?.setValue('This medecine already chosen')
            setTimeout(() => { this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('errMsg')?.setValue('') }, 2500);
          }
        } else {
          this.medicines(prescriptionIndex).push(this.addMedicineFormGroup());
          const newMedicineIndex = this.medicines(prescriptionIndex).length - 1;
          if (newMedicineIndex > -1) {
            data.medicineSearch = false;
            this.medicines(prescriptionIndex).controls[newMedicineIndex].patchValue({ ...data });
            this.medicineFormClear(prescriptionIndex)
            this.medicineList = [];
            this.medicineGroupOptions = [];
          }
        }
      }
    }
  }

  medcineOptionSelected(prescriptionIndex: number, medicineName: string) {
    const tempMedicine = this.medicineList.find(res => res.medicineName === medicineName);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineComposition')?.setValue(tempMedicine.medicineComposition);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineCode')?.setValue(tempMedicine.medicineCode);
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineSearch')?.setValue(false);
  }
  onTypeMedicine(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('tempmedicineForm')?.get('medicineSearch')?.setValue(true);
  }

  getMedicileList = async (searchString: string) => {
    const reqData: any = {
      apiRequest: { medicineKeyword: searchString ,indicator: 'S' }
    }
    await this.prescriptionDataEntryService.getMedicineList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicineList = [...res.apiResponse.medicineSearchList];
          this.medicineGroupOptions = this.filterMedicine('');
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine List couldn't fetch due some error");
        }
      })
  }

  filterMedicine = (value: any): any[] => {
    const filterValue = value.toLowerCase();
    return this.medicineList.filter(item => item.medicineName.toLowerCase().includes(filterValue));
  };

  getTempmedicineFormController(prescriptionIndex: number, controlName: any) {
    let prescriptionFormControlArray = <any>this.prescriptionForm.get('prescriptionList');
    return prescriptionFormControlArray.controls[prescriptionIndex].controls['tempmedicineForm'].controls[controlName];
  }

  addMedicineFormGroup() {
    return this.fb.group({
      medicineName: [''],
      medicineSearch: [true],
      medicineComposition: [''],
      medicineCode: ['',],
      frequency: ['',],
      dose: ['',],
      medicineTiming: ['',],
      dayCount: ['',],
      duration: ['',],
      durationText: [''],
      spcialNotes: [''],
      spcialNoteCheck: [false],
      breakfast: [false],
      lunch: [false],
      dinner: [false],
      snacks: [false],
      updateMode: [false],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
      errMsg: [''],
      eatingTimingErrMsg: ['']
    })
  }

  medicines(index: number) {
    return this.prescriptionList().at(index).get('medicines') as FormArray;
  }

  // <--------- medicine end

  addPrescription() {
    this.prescriptionList().push(this.addPrescriptionGroup());
  }

  viewPrescription(prescriptionIndex: number) {
    this.prescriptionShowIndex = prescriptionIndex;
    this.onFormChange();
    this.labtestList = [];
    this.medicineList = [];
    this.medicineGroupOptions = [];
    this.labtestFormCreat(this.labtestList);
    this.physicianList = [];
    this.showPhysicianDetails = false;
    this.selectedPhysicianDetails = {};
    this.oldPhysicianSearchValue = '';
    this.healthClinicList = [];
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.oldHealthClinicSearchValue = '';
    this.patientList = [];
    this.showPatientDetails = false;
    this.selectedPatientDetails = {};
    this.oldPatientSearchValue = '';
    this.prescriptionList().controls.forEach((v: any, i: number) => {
      if (!this.prescriptionList().at(i).get('physicianUserID')?.value) {
        this.prescriptionList().at(i).get('physicianName')?.setValue('');
        this.prescriptionList().at(i).get('physicianName')?.enable();
      }
    })
    this.healthClinicList = [];
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.oldHealthClinicSearchValue = '';
    this.prescriptionList().controls.forEach((v: any, i: number) => {
      if (!this.prescriptionList().at(i).get('healthClinicID')?.value) {
        this.prescriptionList().at(i).get('healthClinicName')?.setValue('');
        this.prescriptionList().at(i).get('healthClinicName')?.enable();
      }
    })
  }

  showPrescription(prescriptionIndex: number) {
    if (this.prescriptionList().at(prescriptionIndex).get('isDelete')?.value === false && this.prescriptionList().at(prescriptionIndex).get('isAdd')?.value === false) {
      return true;
    } else if (this.prescriptionList().at(prescriptionIndex).get('isDelete')?.value === false && this.prescriptionList().at(prescriptionIndex).get('isAdd')?.value === true) {
      return true;
    } else {
      return false;
    }
  }

  deletePrescription(prescriptionIndex: number, data: any) {
    if (!data.isAdd) {
      this.deletePrescriptionDetails = {
        prescriptionIndex: prescriptionIndex,
        data: data
      }
      this.deleteConfirmationBox = true;
    } else {
      if (this.prescriptionList().length > 1) {
        this.prescriptionList().removeAt(prescriptionIndex);
        if (prescriptionIndex > 0) {
          this.viewPrescription(prescriptionIndex - 1);
        }
      }
    }
  }

  confirmDelete() {
    this.deletePrescriptionDetails.data.isDelete = true;
    const finalData = {
      prescriptionList: [this.deletePrescriptionDetails.data]
    }
    this.savePrescriptions(finalData, true, 'T', true);
    if (this.prescriptionList().length === 0) {
      this.addPrescription();
    }
    if (this.deletePrescriptionDetails.prescriptionIndex > 0) {
      this.viewPrescription(this.deletePrescriptionDetails.prescriptionIndex - 1);
    }
    this.deleteConfirmationBox = false;
  }

  cancelDelete() {
    this.deletePrescriptionDetails = {};
    this.deleteConfirmationBox = false;
  }

  addLabTestFormGroup() {
    return this.fb.group({
      uniqueID: [''],
      labtestSearch: [''],
      ifLabtestSearch: [true],
      labtest: this.fb.group({
        isUpdated: [false],
        testCode: [''],
        test: [''],
        testCheck: true,
        testDescription: [''],
        childTests: this.fb.array([]),
        displayText: [''],
        fullDisplayText: [''],
        hidenItem: [null],
        openViewMoreTextPopup: [false],
        fullTestDescription: [''],
      }),
      specialInstructionOnTime: [''],
      durationCount: [''],
      durationUnit: [''],
      durationText: [''],
      durationNowCheck: [false],
      updateMode: [false],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
      errMsg: ['']
    })
  }

  // houseHoldItem Start ------>
  editHouseHoldItem(prescriptionIndex: number, houseHoldItemIndex: number, isAdd: any) {
    const editFound = this.houseHoldItemList(prescriptionIndex).value.find((res: any) => res.updateMode === true)
    if (!editFound) {
      this.houseHoldItemList(prescriptionIndex).at(houseHoldItemIndex).get('updateMode')?.setValue(true);
      this.houseHoldItemList(prescriptionIndex).at(houseHoldItemIndex).get('isChange')?.setValue(true);
      this.houseHoldItemList(prescriptionIndex).at(houseHoldItemIndex).get('householdItemName')?.disable();
      const edidData = this.houseHoldItemList(prescriptionIndex).at(houseHoldItemIndex).getRawValue()
      this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.patchValue(edidData);
    }
  }

  saveHouseHoldItem(prescriptionIndex: number, data: any, isValid?: boolean) {
    const formControl: FormGroup = this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup') as FormGroup
    this.formService.markFormGroupTouched(formControl)
    if (isValid) {
      const fiendHouseHoldItemIndex = this.houseHoldItemList(prescriptionIndex).getRawValue().findIndex((res: any) => res.householdItemCode === data.householdItemCode)
      if (data.updateMode) {
        this.houseHoldItemList(prescriptionIndex).at(fiendHouseHoldItemIndex).patchValue(data)
        this.HouseHoldItemFormReset(prescriptionIndex)
      } else {
        if (fiendHouseHoldItemIndex > -1) {
          this.getTempHouseHoldFormController(prescriptionIndex, 'errMsg').setValue('This item is already selected')
        } else {
          this.houseHoldItemList(prescriptionIndex).push(this.addHouseHoldItemGroup())
          this.houseHoldItemList(prescriptionIndex).at(this.houseHoldItemList(prescriptionIndex).length - 1).patchValue(data)
          this.HouseHoldItemFormReset(prescriptionIndex)
          this.healthEquipmentList = [];
          this.healthEquipmentGroupOptions = [];
        }
      }
    }
  }

  deleteHouseHoldItem(prescriptionIndex: number, houseHoldItemIndex: number, isAdd: any) {
    if (isAdd) {
      this.houseHoldItemList(prescriptionIndex).removeAt(houseHoldItemIndex)
    } else {
      this.houseHoldItemList(prescriptionIndex).at(houseHoldItemIndex).get('isDelete')?.setValue(true)
    }
  }

  onTypeHouseHoldItemName(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.setValue(true);
  }

  getHealthcareEquipmentleList = async (searchString: string) => {
    const reqData: any = {
      apiRequest: { searchKeyword: searchString }
    }
    await this.healthEquipmentService.getHealthcareEquipmentleList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.healthEquipmentList = [...res.apiResponse.householdItemDetailsList];
          this.healthEquipmentGroupOptions = this.filterHouseHoldItem('');
          this.matAutoComplete.openPanel();
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Equipment List couldn't fetch due some error");
        }
      })
  }

  filterHouseHoldItem = (value: any): any[] => {
    const filterValue = value.toLowerCase();
    return this.healthEquipmentList.filter(item => item.householdItemName.toLowerCase().includes(filterValue));
  };

  houseHoldItemSelected(prescriptionIndex: number, houseHoldItem: any) {
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('householdItemCode')?.setValue(houseHoldItem.householdItemCode);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('householdItemName')?.setValue(houseHoldItem.householdItemName);
  }

  houseHoldItemList(prescriptionIndex: number) {
    return this.prescriptionList().at(prescriptionIndex).get('houseHoldItemList') as FormArray;
  }

  getTempHouseHoldFormController(prescriptionIndex: number, key: any) {
    let prescriptionFormControlArray = <any>this.prescriptionForm.get('prescriptionList');
    return prescriptionFormControlArray.controls[prescriptionIndex].controls['tempHouseHoldItemGroup'].controls[key];
  }

  addHouseHoldItemGroup() {
    return this.fb.group({
      householdItemCode: ['', Validators.required],
      householdItemName: [''],
      houseHoldItemSearch: [false],
      comments: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      updateMode: [false],
      errMsg: ['']
    })
  }

  HouseHoldItemFormReset(prescriptionIndex: number) {
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.reset()
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.setValue(true);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('isAdd')?.setValue(true);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('isChange')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('isDelete')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('updateMode')?.setValue(false);
    this.prescriptionList().at(prescriptionIndex).get('tempHouseHoldItemGroup')?.get('errMsg')?.setValue('');
  }

  addPrescriptionGroup() {
    return this.fb.group({
      prescriptionID: [''],
      patientName: [''],
      patientSearch: [true],
      patientUserCode: ['', Validators.required],
      patientID: [''],
      physicianName: [''],
      physicianSearch: [true],
      physicianUserID: ['', Validators.required],
      physicianUserCode: [''],
      healthClinicName: [''],
      healthClinicSearch: [true],
      healthClinicID: ['', Validators.required],
      temperature: [''],
      pulse: [''],
      pressure: ['', Validators.pattern('([0-9])+([/])+([0-9])+([0-9])')],
      weight: [''],
      hight: [''],
      diabetics: ['X'],
      alchol: ['X'],
      smoking: ['X'],
      thyroid: ['X'],
      pressureRange: ['X'],
      symptoms: [''],
      diagnosis: [''],
      medicines: this.fb.array([]),
      tempmedicineForm: this.addMedicineFormGroup(),
      labTeses: this.fb.array([]),
      templabTestFormGroup: this.addLabTestFormGroup(),
      tempHouseHoldItemGroup: this.addHouseHoldItemGroup(),
      houseHoldItemList: this.fb.array([]),
      nextVisitCount: [''],
      nextVisitUnit: [''],
      nextVisitDate: [''],
      prescriptionSpecialInstruction: [''],
      visitDate: ['', Validators.required],
      visitDateErrorMsg: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
      srcFileDetails:[]
    })
  }

  getPrescriptionFormController(prescriptionIndex: number, controlName: string) {
    let prescriptionFormControlArray = <any>this.prescriptionForm.get('prescriptionList');
    return prescriptionFormControlArray.controls[prescriptionIndex].controls[controlName];
  }

  prescriptionList() {
    return this.prescriptionForm.get('prescriptionList') as FormArray;
  }

  checkValidDate(prescriptionIndex: number) {
    const dateControl = this.prescriptionList().at(prescriptionIndex).get('visitDate');
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '00:00:01 AM') > this.currentDate.getTime()) {
      dateControl!.setValue('')
    }
  }

  closePopup() {
    this.close.emit(false);
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

  private intializingPrescriptionFormGroup() {
    this.prescriptionForm = this.fb.group({
      prescriptionList: this.fb.array([])
    })
    this.labtestOptionForm = this.fb.group({
      options: this.fb.array([])
    })
  }

  private intializingMessage() {
    this.errorMessage.medicineForm = {
      medicineName: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_medicineName,
        minlength: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_MINLENGTH_medicineName
      },
      medicineCode: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_medicineCode,
      },
      frequency: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_frequency,
      },
      dose: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_dose,
      },
      medicineTiming: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_medicineTiming,
      },
      durationText: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_MED_durationText,
      },
      spcialNotes: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_spcialNotes,
      },
    };
    this.errorMessage.labtestForm = {
      testCode: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_labtestCode,
      },
      durationText: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_durationText,
      },
    };
    this.errorMessage.houseHoldItem = {
      householdItemCode: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_householdItemCode,
      },
      comments: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_householdItemCode,
      }
    }
    this.errorMessage.prescriptionForm = {
      physicianUserID: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_physicianUserID,
      },
      healthClinicID: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_healthClinicID,
      },
      patientUserCode: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_patientUserCode,
      },
      visitDate: {
        required: GENERATE_PRESCRIPTION_ERROR_MSG.ERR_MSG_REQUIERD_visitDate
      },
      pressure: {
        pattern: 'Wrong format'
      }
    }
  }

  getFile(data:any){
    return `${this.imageBaseUrl}${data.documentType}/${data.fileName}`
  }

  openAddPhysicianPopup(){
    this.addPhysicianPopup = true;
  }
  closeAddPhysicianPopup(){
    this.addPhysicianPopup = false;
  }

  openAddNewetityPopup(){
    this.addNewetityPopup = true;
  }
  closeAddNewetityPopup(){
    this.addNewetityPopup = false;
  }

  openDrawinPopup(presctiptionIndex:number,presctiptionID:any,existingSrcDocDetails?:any){
    this.drawinPopup = true;
    this.presctiptionIndexForDrawing = presctiptionIndex;
    this.presctiptionIDForDrawing = presctiptionID;
    if(existingSrcDocDetails){
      this.existingFile = existingSrcDocDetails;
    }
  }
  closeDrawinPopup(data:any){
    this.drawinPopup = false;
    if(data){
      this.uploadDoc(this.dataURItoBlob(data.data),data.presctiptionIndex,data.presctiptionIDForDrawing,data.exsistingFile)
    }
  }

 dataURItoBlob(dataURI:any) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
}

async uploadDoc(data: any,presctiptionIndex:number,presctiptionID:any,existingFile?:any) {                                        
  const formData = new FormData();
  formData.append('File', data);
  (await
    this.fileUploadService.uploadSCRDoc(
      formData,
      'SCR',
      presctiptionID,
      existingFile?existingFile.fileId:'',
      this. getPrescriptionFormController(presctiptionIndex,'patientUserCode').getRawValue()
    )).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          break;
        case HttpEventType.Response:
          if (!this.fileUploadService.isDocUploadApiError(event.body)) {
            this. getPrescriptionFormController(presctiptionIndex,'srcFileDetails').setValue(event.body.apiResponse)
            this.existingFile = {};
          } else {
            // this.myFiles[index].error = true;
          }
          setTimeout(() => {
            // progress = 0;
          }, 1500);
      }
    },
      (error) => {
        // this.myFiles[index].error = true;
        this.toastr.error(error ? error : "Documents couldn't be updated due some error");
      })

}
}
