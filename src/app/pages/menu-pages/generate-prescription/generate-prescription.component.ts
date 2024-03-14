import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, GENERATE_PRESCRIPTION_ERROR_MSG } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { PrescriptionDataEntryService } from '@services/prescription-data-entry.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
@Component({
  selector: 'app-generate-prescription',
  templateUrl: './generate-prescription.component.html',
  styleUrls: ['./generate-prescription.component.css']
})
export class GeneratePrescriptionComponent implements OnInit, OnChanges {
  @Input()
  generatePrescriptionDetails: any;
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger }) matAutoComplete: MatAutocompleteTrigger;
  prescriptionForm: FormGroup;
  labtestOptionForm: FormGroup;
  medicineList: Array<any> = [];
  labtestList: Array<any> = [];
  childDisplayNo: number = 80;
  medicineGroupOptions: Array<any> = [];
  errorMessage: any = {};
  customeLabtestFormErrorMsg: string = '';
  healthEquipmentList: Array<any> = [];
  healthEquipmentGroupOptions: Array<any> = [];
  isSelectAnotherHealthClicic: boolean = true;

  //searchedHedhealthClinic start---->
  searcHedhealthClinic: any;
  healthClinicList: Array<any> = [];
  showHealthClinicDetails: boolean;
  selectedHealthClinicDetails: any;
  oldHealthClinicSearchValue: string;
  //searchedHedhealthClinic <----end
  imageBaseUrl: string = BASE_IMAGE_URL;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private prescriptionDataEntryService: PrescriptionDataEntryService,
    private healthEquipmentService: HealthEquipmentService
  ) { }

  ngOnInit(): void {
  }

  //searchedHealthClinic start---->
  selectHealthClinic(healthClinic: any) {
    this.showHealthClinicDetails = true;
    this.selectedHealthClinicDetails = healthClinic;
    this.prescriptionForm.get('healthClinicName')?.setValue(healthClinic.healthClinicName);
    this.prescriptionForm.get('healthClinicSearch')?.setValue(false);
    this.prescriptionForm.get('healthClinicName')?.disable();
  }
  unSelectHealthClinic() {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.prescriptionForm.get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.prescriptionForm.get('healthClinicSearch')?.setValue(false);
    this.prescriptionForm.get('healthClinicName')?.enable();
  }

  selectHealthClinicForPrescription() {
    this.prescriptionForm.get('healthClinicID')?.setValue(this.selectedHealthClinicDetails.healthClinicID);
    this.prescriptionForm.get('healthClinicName')?.setValue(this.selectedHealthClinicDetails.healthClinicName);
    this.prescriptionForm.get('addressLine')?.setValue(this.selectedHealthClinicDetails.addressLine);
    this.prescriptionForm.get('landmark')?.setValue(this.selectedHealthClinicDetails.landmark);
    this.prescriptionForm.get('city')?.setValue(this.selectedHealthClinicDetails.city);
    this.prescriptionForm.get('stateName')?.setValue(this.selectedHealthClinicDetails.stateName);
    this.prescriptionForm.get('pincode')?.setValue(this.selectedHealthClinicDetails.pincode);
    this.prescriptionForm.get('primaryContactNo')?.setValue(this.selectedHealthClinicDetails.primaryContactNo);
    this.prescriptionForm.get('secondaryContactNo')?.setValue(this.selectedHealthClinicDetails.secondaryContactNo);
    this.prescriptionForm.get('healthClinicName')?.disable();
    this.prescriptionForm.get('healthClinicSearch')?.setValue(false);
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
  }

  unSelectHealthClinicForPrescription() {
    this.showHealthClinicDetails = false;
    this.selectedHealthClinicDetails = {};
    this.prescriptionForm.get('healthClinicName')?.setValue(this.oldHealthClinicSearchValue);
    this.prescriptionForm.get('healthClinicID')?.setValue('');
    this.prescriptionForm.get('healthClinicName')?.enable();
    this.prescriptionForm.get('healthClinicSearch')?.setValue(false);
  }

  onTypeHealthClinicName() {
    this.prescriptionForm.get('healthClinicSearch')?.setValue(true);
  }
  //searchedHealthClinic <----end

  ngOnChanges(changes: SimpleChanges): void {
    this.intializingMessage();
    this.intializingPrescriptionFormGroup();
    this.onFormChange();
    this.createPrescripthonForm()
  }

  async createPrescripthonForm(data?: any) {
    if (this.generatePrescriptionDetails.healthClinicID) {
      const reqData: any = {
        apiRequest: {
          searchKeyword: this.generatePrescriptionDetails.healthClinicID,
        },
      }
      await this.prescriptionDataEntryService.searchHealthClinic(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res) && res.apiResponse.healthClinicCount > 0) {
            const healthClinicDetails = res.apiResponse.healthClinicDetailsViewList[0];
            this.prescriptionForm.get('healthClinicID')?.setValue(healthClinicDetails.healthClinicID);
            this.prescriptionForm.get('healthClinicName')?.setValue(healthClinicDetails.healthClinicName);
            this.prescriptionForm.get('addressLine')?.setValue(healthClinicDetails.addressLine);
            this.prescriptionForm.get('landmark')?.setValue(healthClinicDetails.landmark);
            this.prescriptionForm.get('city')?.setValue(healthClinicDetails.city);
            this.prescriptionForm.get('stateName')?.setValue(healthClinicDetails.stateName);
            this.prescriptionForm.get('pincode')?.setValue(healthClinicDetails.pincode);
            this.prescriptionForm.get('primaryContactNo')?.setValue(healthClinicDetails.primaryContactNo);
            this.prescriptionForm.get('secondaryContactNo')?.setValue(healthClinicDetails.secondaryContactNo);
            this.prescriptionForm.get('healthClinicSearch')?.setValue(false);
            if (this.generatePrescriptionDetails.visitDate) {
              this.isSelectAnotherHealthClicic = false;
              this.prescriptionForm.get('visitDate')?.setValue(new Date(this.generatePrescriptionDetails.visitDate))
            }
            this.prescriptionForm.get('patientName')?.setValue(this.generatePrescriptionDetails.patientName)
            this.prescriptionForm.get('patientUserCode')?.setValue(this.generatePrescriptionDetails.patientUserCode)
            this.prescriptionForm.get('patientID')?.setValue(this.generatePrescriptionDetails.patientID)
            this.prescriptionForm.get('dateOfBirth')?.setValue(this.generatePrescriptionDetails.dateOfBirth)
            this.prescriptionForm.get('gender')?.setValue(this.generatePrescriptionDetails.gender)
            this.prescriptionForm.get('physicianName')?.setValue(this.generatePrescriptionDetails.physicianName)
            this.prescriptionForm.get('physicianUserID')?.setValue(this.generatePrescriptionDetails.physicianUserID)
            this.prescriptionForm.get('physicianUserCode')?.setValue(this.generatePrescriptionDetails.physicianUserCode)
            this.prescriptionForm.get('temperature')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userTemperature ? this.generatePrescriptionDetails?.genMedInfo?.userTemperature : '')
            this.prescriptionForm.get('pulse')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userPulse ? this.generatePrescriptionDetails?.genMedInfo?.userPulse : '')
            this.prescriptionForm.get('pressure')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userPressure ? this.generatePrescriptionDetails?.genMedInfo?.userPressure : '')
            this.prescriptionForm.get('weight')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userWeight ? this.generatePrescriptionDetails?.genMedInfo?.userWeight : '')
            this.prescriptionForm.get('hight')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userHeight ? this.generatePrescriptionDetails?.genMedInfo?.userHeight : '')
            this.prescriptionForm.get('diabetics')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.diabeticInd ? this.generatePrescriptionDetails?.genMedInfo?.diabeticInd : 'X')
            this.prescriptionForm.get('alchol')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.alcoholInd ? this.generatePrescriptionDetails?.genMedInfo?.alcoholInd : 'X')
            this.prescriptionForm.get('smoking')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.smokingInd ? this.generatePrescriptionDetails?.genMedInfo?.smokingInd : 'X')
            this.prescriptionForm.get('thyroid')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.thyroidInd ? this.generatePrescriptionDetails?.genMedInfo?.thyroidInd : 'X')
            this.prescriptionForm.get('pressureRange')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.pressureInd ? this.generatePrescriptionDetails?.genMedInfo?.pressureInd : 'X')
          } else {
            this.healthClinicList = [];
          }
        })
        .catch((err: any) => {
          this.healthClinicList = [];
        })
    } else {
      this.prescriptionForm.get('healthClinicID')?.setValue('');
      this.prescriptionForm.get('healthClinicName')?.setValue('');
      this.prescriptionForm.get('addressLine')?.setValue('');
      this.prescriptionForm.get('landmark')?.setValue('');
      this.prescriptionForm.get('city')?.setValue('');
      this.prescriptionForm.get('stateName')?.setValue('');
      this.prescriptionForm.get('pincode')?.setValue('');
      this.prescriptionForm.get('primaryContactNo')?.setValue('');
      this.prescriptionForm.get('secondaryContactNo')?.setValue('');
      this.prescriptionForm.get('healthClinicSearch')?.setValue(false);
      this.prescriptionForm.get('patientName')?.setValue(this.generatePrescriptionDetails.patientName)
      this.prescriptionForm.get('patientUserCode')?.setValue(this.generatePrescriptionDetails.patientUserCode)
      this.prescriptionForm.get('patientID')?.setValue(this.generatePrescriptionDetails.patientID)
      this.prescriptionForm.get('dateOfBirth')?.setValue(this.generatePrescriptionDetails.dateOfBirth)
      this.prescriptionForm.get('gender')?.setValue(this.generatePrescriptionDetails.gender)
      this.prescriptionForm.get('physicianName')?.setValue(this.generatePrescriptionDetails.physicianName)
      this.prescriptionForm.get('physicianUserID')?.setValue(this.generatePrescriptionDetails.physicianUserID)
      this.prescriptionForm.get('physicianUserCode')?.setValue(this.generatePrescriptionDetails.physicianUserCode)
      this.prescriptionForm.get('temperature')?.setValue(this.generatePrescriptionDetails.genMedInfo.userTemperature ? this.generatePrescriptionDetails?.genMedInfo?.userTemperature : '')
      this.prescriptionForm.get('pulse')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userPulse ? this.generatePrescriptionDetails?.genMedInfo?.userPulse : '')
      this.prescriptionForm.get('pressure')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userPressure ? this.generatePrescriptionDetails?.genMedInfo?.userPressure : '')
      this.prescriptionForm.get('weight')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userWeight ? this.generatePrescriptionDetails?.genMedInfo?.userWeight : '')
      this.prescriptionForm.get('hight')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.userHeight ? this.generatePrescriptionDetails?.genMedInfo?.userHeight : '')
      this.prescriptionForm.get('diabetics')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.diabeticInd ? this.generatePrescriptionDetails?.genMedInfo?.diabeticInd : 'X')
      this.prescriptionForm.get('alchol')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.alcoholInd ? this.generatePrescriptionDetails?.genMedInfo?.alcoholInd : 'X')
      this.prescriptionForm.get('smoking')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.smokingInd ? this.generatePrescriptionDetails?.genMedInfo?.smokingInd : 'X')
      this.prescriptionForm.get('thyroid')?.setValue(this.generatePrescriptionDetails?.genMedInfo?.thyroidInd ? this.generatePrescriptionDetails?.genMedInfo?.thyroidInd : 'X')
      this.prescriptionForm.get('pressureRange')?.setValue(this.generatePrescriptionDetails.genMedInfo.pressureInd ? this.generatePrescriptionDetails.genMedInfo.pressureInd : 'X')
    }
  }

  labtestClearValidators() {
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.clearValidators();
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.updateValueAndValidity();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.clearValidators();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.updateValueAndValidity();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.clearValidators();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.updateValueAndValidity();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.clearValidators();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.updateValueAndValidity();
  }
  medicineClearValidators() {
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineName')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineName')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineCode')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineCode')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('frequency')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('frequency')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.updateValueAndValidity();
    this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.clearValidators();
    this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.updateValueAndValidity();
  }

  houseHoldItemClearValidators() {
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('householdItemCode')?.clearValidators()
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('householdItemCode')?.updateValueAndValidity()
  }

  savePrescriptions = async (prescription: any, isValid: boolean) => {
    this.labtestClearValidators();
    this.medicineClearValidators();
    this.houseHoldItemClearValidators();
    this.formService.markFormGroupTouched(this.prescriptionForm)
    if (isValid) {
      const reqData: any = {
        apiRequest: {
        }
      };
      let addIndicator = false;
      const tempprescription: any = {
        prescriptionID: prescription.prescriptionID ? prescription.prescriptionID : '',
        prescriptionDate: prescription.visitDate,
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
      prescription.medicines.forEach((medicine: any) => {
        const tempMedicine: any = {
          actionIndicator: "",
          medicationDays: 0,
          medicationDose: medicine.dose,
          medicationFrequency: medicine.frequency,
          medicationNotes: medicine.spcialNotes,
          medicationTiming: medicine.medicineTiming,
          medicineCode: medicine.medicineCode,
          medicineComposition: medicine.medicineComposition,
          medicineDuration: medicine.dayCount,
          medicineDurationUnit: medicine.duration,
          medicineMealTimings: "",
          medicineName: medicine.medicineName,
          transactionResult: ""
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
      reqData.apiRequest = tempprescription
      await this.prescriptionDataEntryService.PhysicianGeneratePrescription(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.close.emit(true);
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Prescription couldn't save due some error");
          }
        })
    }
  }

  onFormChange() {
    this.prescriptionForm.valueChanges!.subscribe(res => {
      if (!res.isAdd && !res.isDelete && !res.isChange) {
        if (res.dataSet && !this.prescriptionForm.pristine) {
          this.prescriptionForm.get('isChange')?.setValue(true);
        }
      }
    })
    this.prescriptionForm.get('visitDate')!.valueChanges.subscribe(res => {
      if (res) {
        this.prescriptionForm.get('visitDateErrorMsg')?.setValue('');
        this.nextVisitChange()
      }
    })
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.prescriptionForm.get('tempmedicineForm')?.get('medicineSearch')?.value === true) {
          this.getMedicileList(response);
        }
      })
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.prescriptionForm.get('templabTestFormGroup')?.get('ifLabtestSearch')?.value) {
          this.getLabtestList(response)
        } else {
          if (response.length < 2 && !this.prescriptionForm.get('templabTestFormGroup')?.get('updateMode')?.value) {
            this.labtestList = [];
            this.labtestFormCreat(this.labtestList);
          }
        }
      })
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('householdItemName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2 && this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.value) {
          this.getHealthcareEquipmentleList(response)
        }
      })
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationNowCheck')?.valueChanges.subscribe(res => {
      if (res) {
        this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.setValue('0');
        this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.setValue('D');
        if (this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.disabled) {
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.disable();
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.disable();
        }
      } else {
        if (this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.disabled) {
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.setValue('0');
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.setValue('D');
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.enable();
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.enable();
        }
      }
    })
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.valueChanges.subscribe(res => {
      if (this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value) {
        if (this.commonService.checkUserNumber(this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value)) {
          if (+this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value > -1 && this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.value) {
            this.labtestDurationChange()
          }
          if (+this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value !== 0) {
            this.prescriptionForm.get('templabTestFormGroup')?.get('durationNowCheck')?.setValue(false);
          }
          if (this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value === '') {
            this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue('');
          }
        } else {
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.setValue('')
        }
      }
    })
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.valueChanges.subscribe(res => {
      if (+this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value > -1 && this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.value) {
        this.labtestDurationChange()
      }
    })
    this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.valueChanges.subscribe(res => {
      if (this.commonService.checkUserNumber(this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.value)) {
        if (+this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.value > -1 && this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.value) {
          this.medicineDurationChange()
        }
        if (this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.value === '') {
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue('');
        }
      } else {
        this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.setValue('')
      }
    })
    this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.valueChanges.subscribe(res => {
      if (this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.value > -1 && this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.value) {
        this.medicineDurationChange()
      }
    })
    this.prescriptionForm.get('nextVisitCount')?.valueChanges.subscribe(res => {
      this.nextVisitChange()
    })
    this.prescriptionForm.get('nextVisitUnit')?.valueChanges.subscribe(res => {
      this.nextVisitChange()
    })
    this.prescriptionForm.get('temperature')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkDecimalNumber(res)) {
          const oldVal: string = res
          this.prescriptionForm.get('temperature')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionForm.get('pulse')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkUserNumber(res)) {
          const oldVal: string = res
          this.prescriptionForm.get('pulse')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionForm.get('pressure')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkDecimalNumberwithSlash(res)) {
          const oldVal: string = res
          this.prescriptionForm.get('pressure')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionForm.get('weight')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkDecimalNumber(res)) {
          const oldVal: string = res
          this.prescriptionForm.get('weight')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })
    this.prescriptionForm.get('hight')!.valueChanges.subscribe(res => {
      if (res.length) {
        if (!this.commonService.checkUserNumber(res)) {
          const oldVal: string = res
          this.prescriptionForm.get('hight')?.setValue(oldVal.substring(0, oldVal.length - 1))
        }
      }
    })

    this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.valueChanges.subscribe(res => {
      if (!this.commonService.checkUserNumber(this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.value)) {
        this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.setValue('')
      }
    });
    this.prescriptionForm.get('tempmedicineForm')?.get('frequency')?.valueChanges.subscribe(res => {
      if (res) {
        this.medicineValidaValidationChange(res);
      }
    });
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.valueChanges.subscribe(res => {
      if (res) {
        if (!res.length) {
          const data = this.prescriptionForm.get('tempmedicineForm')?.value
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
            this.prescriptionForm.get('tempmedicineForm')?.get('breakfast')?.setValue(false)
            this.prescriptionForm.get('tempmedicineForm')?.get('lunch')?.setValue(false)
            this.prescriptionForm.get('tempmedicineForm')?.get('dinner')?.setValue(false)
            this.prescriptionForm.get('tempmedicineForm')?.get('snacks')?.setValue(false)
          }
        }
      }
    });
    this.prescriptionForm.get('healthClinicName')!.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async response => {
        this.searcHedhealthClinic = response;
        if (response && response.length > 2 && this.prescriptionForm.get('healthClinicSearch')?.value === true) {
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
  }

  nextVisitChange() {
    const tempvisitDate = this.prescriptionForm.get('visitDate')?.value;
    if (tempvisitDate) {
      const tempNextVisitCount = this.prescriptionForm.get('nextVisitCount')?.value;
      const tempNextVisitUnit = this.prescriptionForm.get('nextVisitUnit')?.value;
      if (tempNextVisitCount) {
        if (this.commonService.checkUserNumber((tempNextVisitCount as number).toString()) === true) {
          if (tempNextVisitCount && tempNextVisitUnit.length) {
            const currentDate = new Date(tempvisitDate);
            let nextVisitDate: any;
            if (this.prescriptionForm.get('nextVisitUnit')?.value === 'D') {
              nextVisitDate = new Date(currentDate.setDate(currentDate.getDate() + +tempNextVisitCount))
            } else if (this.prescriptionForm.get('nextVisitUnit')?.value === 'M') {
              nextVisitDate = new Date(currentDate.setMonth(currentDate.getMonth() + +tempNextVisitCount))
            } else {
              nextVisitDate = currentDate.setFullYear(currentDate.getFullYear() + +tempNextVisitCount)
            }
            this.prescriptionForm.get('nextVisitDate')?.setValue(nextVisitDate);
          } else {
            this.prescriptionForm.get('nextVisitDate')?.setValue('');
          }
        } else {
          this.prescriptionForm.get('nextVisitCount')?.setValue('')
        }
      } else {
        this.prescriptionForm.get('nextVisitDate')?.setValue('');
      }
    } else {
      this.prescriptionForm.get('visitDateErrorMsg')?.setValue(this.errorMessage.prescriptionForm.visitDate.required)
    }
  }
  //medicine star-------->

  medicineValidaValidationChange(frequency: any) {
    if (frequency === 'SOS') {
      this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.clearValidators();
      this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.updateValueAndValidity();
      this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.clearValidators();
      this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.updateValueAndValidity();
      this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.clearValidators();
      this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.updateValueAndValidity();
    } else {
      this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.setValidators([Validators.required]);
      this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.updateValueAndValidity();
      this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.setValidators([Validators.required]);
      this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.updateValueAndValidity();
      this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValidators([Validators.required]);
      this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.updateValueAndValidity();
    }
  }

  editMedicine(medicineIndex: number) {
    if (!this.medicines().at(medicineIndex).get('updateMode')?.value) {
      this.prescriptionForm.get('tempmedicineForm')?.get('medicineSearch')?.setValue(false)
      this.medicines().at(medicineIndex).get('updateMode')?.setValue(true);
      const tempData: any = this.medicines().at(medicineIndex).value;
      tempData.medicineSearch = false;
      (this.prescriptionForm.get('tempmedicineForm') as FormGroup).patchValue(this.medicines().at(medicineIndex).value)
    }
  }

  medicineFormClear() {
    const updatedMedicineIndex = this.medicines().value.findIndex((res: any) => res.medicineCode === this.prescriptionForm.get('tempmedicineForm')?.value.medicineCode)
    this.prescriptionForm.get('tempmedicineForm')?.reset();
    this.prescriptionForm.get('tempmedicineForm')?.get('isAdd')?.setValue(true);
    this.prescriptionForm.get('tempmedicineForm')?.get('isChange')?.setValue(false);
    this.prescriptionForm.get('tempmedicineForm')?.get('isDelete')?.setValue(false);
    this.prescriptionForm.get('tempmedicineForm')?.get('dataSet')?.setValue(false);
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineTiming')?.setValue('');
    this.prescriptionForm.get('tempmedicineForm')?.get('frequency')?.setValue('');
    this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.setValue('');
    this.prescriptionForm.get('tempmedicineForm')?.get('dose')?.setValue('');
    this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue('');
    this.medicineList = [];
    this.medicineGroupOptions = [];
    if (updatedMedicineIndex > -1) {
      if (this.medicines().at(updatedMedicineIndex).get('updateMode')?.value) {
        this.medicines().at(updatedMedicineIndex).get('updateMode')?.setValue(false)
      }
    }
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineName')?.enable()
  }

  medicineSave(data: any) {
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineSearch')?.setValue(false)
    this.formService.markFormGroupTouched((this.prescriptionForm.get('tempmedicineForm') as FormGroup))
    if ((this.prescriptionForm.get('tempmedicineForm') as FormGroup).valid) {
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
              this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          case '2':
            if (eatingTimings.length !== 2) {
              eatingTimingsValid = false;
              this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          case '3':
            if (eatingTimings.length !== 3) {
              eatingTimingsValid = false;
              this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          case '4':
            if (eatingTimings.length !== 4) {
              eatingTimingsValid = false;
              this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('Eating timings is not Valid')
              setTimeout(() => { this.prescriptionForm.get('tempmedicineForm')?.get('eatingTimingErrMsg')?.setValue('') }, 1500);
            }
            break;
          default:
            break;
        }
      }
      if (eatingTimingsValid) {
        const filterMedicine = this.medicines().value.find((res: any) => res.medicineCode === data.medicineCode && res.isDelete !== true);
        if (filterMedicine) {
          const updatedMedicineIndex = this.medicines().value.findIndex((res: any) => res.medicineCode === data.medicineCode)
          if (filterMedicine.updateMode) {
            const tempData = { ...data };
            if (!tempData.isAdd) {
              tempData.isChange = true;
            }
            tempData.updateMode = false;
            tempData.medicineSearch = false;
            this.medicines().controls[updatedMedicineIndex].patchValue(tempData);
            this.medicineFormClear()
            this.medicineList = [];
            this.medicineGroupOptions = [];
          } else {
            this.prescriptionForm.get('tempmedicineForm')?.get('errMsg')?.setValue('This medecine already chosen')
            setTimeout(() => { this.prescriptionForm.get('tempmedicineForm')?.get('errMsg')?.setValue('') }, 2500);
          }
        } else {
          this.medicines().push(this.addMedicineFormGroup());
          const newMedicineIndex = this.medicines().length - 1;
          if (newMedicineIndex > -1) {
            data.medicineSearch = false;
            this.medicines().controls[newMedicineIndex].patchValue({ ...data });
            this.medicineFormClear()
            this.medicineList = [];
            this.medicineGroupOptions = [];
          }
        }
      }
    }
  }

  medicineDurationChange() {
    const durationCount = +this.prescriptionForm.get('tempmedicineForm')?.get('dayCount')?.value
    const durationUnit = this.prescriptionForm.get('tempmedicineForm')?.get('duration')?.value
    if (durationCount > 1) {
      switch (durationUnit) {
        case 'D':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Days`)
          break;
        case 'W':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Weeks`)
          break;
        case 'M':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Months`)
          break;
        case 'Y':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Years`)
          break;
        default:
          break;
      }
    } else if (durationCount > 0 && durationCount < 2) {
      switch (durationUnit) {
        case 'D':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Day`)
          break;
        case 'W':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Week`)
          break;
        case 'M':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Month`)
          break;
        case 'Y':
          this.prescriptionForm.get('tempmedicineForm')?.get('durationText')?.setValue(`${durationCount} Year`)
          break;
        default:
          break;
      }
    }
  }

  medcineOptionSelected(medicineName: string) {
    const tempMedicine = this.medicineList.find(res => res.medicineName === medicineName);
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineComposition')?.setValue(tempMedicine.medicineComposition);
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineCode')?.setValue(tempMedicine.medicineCode);
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineSearch')?.setValue(false);
  }

  getMedicileList = async (searchString: string) => {
    const reqData: any = {
      apiRequest: { medicineKeyword: searchString ,indicator: 'S' }
    }
    await this.prescriptionDataEntryService.getMedicineList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicineList = [...res.apiResponse.medicineSearchList];
          this.medicineGroupOptions = this.filter('');
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

  getTempmedicineFormController(controlName: any) {
    const control = this.prescriptionForm.get('tempmedicineForm') as FormGroup
    return control.controls[controlName];
  }
  onTypeMedicine() {
    this.prescriptionForm.get('tempmedicineForm')?.get('medicineSearch')?.setValue(true);
  }

  filter = (value: any): any[] => {
    const filterValue = value.toLowerCase();
    return this.medicineList.filter(item => item.medicineName.toLowerCase().includes(filterValue));
  };

  private addMedicineFormGroup() {
    return this.fb.group({
      medicineName: ['', Validators.required],
      medicineSearch: [true],
      medicineComposition: [''],
      medicineCode: ['', Validators.required],
      frequency: ['', Validators.required],
      dose: [''],
      medicineTiming: [''],
      dayCount: ['',],
      duration: ['',],
      durationText: ['', Validators.required],
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

  medicines() {
    return this.prescriptionForm.get('medicines') as FormArray;
  }

  deleteMedecine(medicineIndex: number) {
    if (!this.medicines().at(medicineIndex).get('updateMode')?.value) {
      if (this.medicines().at(medicineIndex).get('isAdd')?.value) {
        this.medicines().removeAt(medicineIndex);
      } else {
        this.medicines().at(medicineIndex).get('isDelete')?.setValue(true);
        this.prescriptionForm.get('isChange')?.setValue(true);
      }
    }
  }
  //<---------medicine end
  //labtest start ------->

  labtestSave(data: any) {
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.setValidators([Validators.required]);
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('testCode')?.updateValueAndValidity();
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValidators([Validators.required]);
    this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.updateValueAndValidity();
    this.formService.markFormGroupTouched((this.prescriptionForm.get('templabTestFormGroup') as FormGroup))
    if ((this.prescriptionForm.get('templabTestFormGroup') as FormGroup).valid) {
      const filterLabtest = this.labTeses().value.find((res: any) => res.labtest.testCode === data.labtest.testCode && res.isDelete !== true);
      if (filterLabtest) {
        const updatedLabTestIndex = this.labTeses().value.findIndex((res: any) => res.labtest.testCode === data.labtest.testCode)
        if (filterLabtest.updateMode) {
          const tempData = { ...data };
          tempData.updateMode = false;
          tempData.isAdd = true;
          tempData.isDelete = false;
          tempData.isChange = false;
          this.labTeses().controls[updatedLabTestIndex].patchValue(tempData);
          let controlArray = <FormArray>this.labTeses().at(updatedLabTestIndex).get('labtest')?.get('childTests');
          controlArray.clear();
          tempData.labtest.childTests.forEach((val: any, index: number) => {
            var childTest: FormGroup = this.addChildTestGroup();
            controlArray.push(childTest);
            controlArray?.controls[index].patchValue(val);
          })
          this.prescriptionForm.get('templabTestFormGroup')?.reset();
          this.prescriptionForm.get('templabTestFormGroup')?.get('isAdd')?.setValue(true);
          this.prescriptionForm.get('templabTestFormGroup')?.get('isChange')?.setValue(false);
          this.prescriptionForm.get('templabTestFormGroup')?.get('isDelete')?.setValue(false);
          this.prescriptionForm.get('templabTestFormGroup')?.get('dataSet')?.setValue(false);
          this.prescriptionForm.get('templabTestFormGroup')?.get('labTeses')?.reset();
          let templabTestFormchildTestscontrolArray = <FormArray>this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('childTests');
          templabTestFormchildTestscontrolArray.clear();
          this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.enable();
          this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.setValue('');
          this.labtestList = [];
          this.labtestFormCreat(this.labtestList);
        } else {
          this.prescriptionForm.get('templabTestFormGroup')?.get('errMsg')?.setValue('This lab test already chosen')
          setTimeout(() => { this.prescriptionForm.get('templabTestFormGroup')?.get('errMsg')?.setValue('') }, 2500);
        }
      } else {
        this.labTeses().push(this.addLabTestFormGroup());
        const newLabTesteIndex = this.labTeses().length - 1;
        if (newLabTesteIndex > -1) {
          this.labTeses().controls[newLabTesteIndex].patchValue({ ...data });
          let controlArray = <FormArray>this.labTeses().at(newLabTesteIndex).get('labtest')?.get('childTests');
          controlArray.clear();
          data.labtest.childTests.forEach((val: any, index: number) => {
            var childTest: FormGroup = this.addChildTestGroup();
            controlArray.push(childTest);
            controlArray?.controls[index].patchValue(val);
          })
          this.prescriptionForm.get('templabTestFormGroup')?.reset();
          this.prescriptionForm.get('templabTestFormGroup')?.get('isAdd')?.setValue(true);
          this.prescriptionForm.get('templabTestFormGroup')?.get('isChange')?.setValue(false);
          this.prescriptionForm.get('templabTestFormGroup')?.get('isDelete')?.setValue(false);
          this.prescriptionForm.get('templabTestFormGroup')?.get('dataSet')?.setValue(false);
          this.prescriptionForm.get('templabTestFormGroup')?.get('labTeses')?.reset();
          let tempLabtestForChildTestsControlArray = <FormArray>this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('childTests');
          tempLabtestForChildTestsControlArray.clear();
          this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.enable();
          this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.setValue('');
          this.labtestList = [];
          this.labtestFormCreat(this.labtestList);
        }
      }
    }
  }

  editLabtest(labTestIndex: number) {
    if (!this.labTeses().at(labTestIndex).get('updateMode')?.value) {
      const deletelabtest = this.labTeses().at(labTestIndex)?.value
      deletelabtest.isDelete = true;
      deletelabtest.isAdd = false;
      this.labTeses().push(this.addLabTestFormGroup());
      const newLabTesteIndex = this.labTeses().length - 1;
      if (newLabTesteIndex > -1) {
        this.labTeses().controls[newLabTesteIndex].patchValue({ ...deletelabtest });
        let controlArray = <FormArray>this.labTeses().at(newLabTesteIndex).get('labtest')?.get('childTests');
        controlArray.clear();
        deletelabtest.labtest.childTests.forEach((val: any, index: number) => {
          var childTest: FormGroup = this.addChildTestGroup();
          controlArray.push(childTest);
          controlArray?.controls[index].patchValue(val);
        })
      }
      this.prescriptionForm.get('isChange')?.setValue(true);
      const templabtest = {
        ...this.labTeses().at(labTestIndex).get('labtest')?.value
      }
      templabtest.testCheck = true;
      templabtest.testDescription = templabtest.fullTestDescription;
      this.labtestFormCreat([templabtest]);
      this.labTeses().at(labTestIndex).get('updateMode')?.setValue(true);
      const value = this.labTeses().at(labTestIndex).value;
      var templabTestFormGroup = (this.prescriptionForm.get('templabTestFormGroup') as FormGroup)
      value.uniqueID = '';
      value.isAdd = true;
      templabTestFormGroup.patchValue(value);
      this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.disable();
      value.labtest.childTests;
      var childTestControlArray = templabTestFormGroup.get('labtest')?.get('childTests') as FormArray;
      childTestControlArray.clear()
      value.labtest.childTests.forEach((v: any, i: number) => {
        childTestControlArray.push(this.addChildTestGroup());
        childTestControlArray.at(i).patchValue(v);
      })
    }
  }

  optionChoose(value: any) {
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
        (this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('childTests') as FormArray).clear();
        tempoptions.childTests.forEach((val: any, index: number) => {
          (this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('childTests') as FormArray).push(this.addChildTestGroup());
        })
        this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.patchValue(tempoptions);
        this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.disable();
        this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.setValue(tempoptions.test)
        this.prescriptionForm.get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(false)
        this.labtestOptionForm = this.fb.group({
          options: this.fb.array([])
        })
      } else {
        this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.patchValue(tempoptions);
        this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.disable();
        this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.setValue(tempoptions.test);
        this.prescriptionForm.get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(false);
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

  labtestDurationChange() {
    const durationCount = +this.prescriptionForm.get('templabTestFormGroup')?.get('durationCount')?.value
    const durationUnit = this.prescriptionForm.get('templabTestFormGroup')?.get('durationUnit')?.value
    if (durationCount > 1) {
      switch (durationUnit) {
        case 'D':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Days`)
          break;
        case 'W':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Weeks`)
          break;
        case 'M':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Months`)
          break;
        case 'Y':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Years`)
          break;
        default:
          break;
      }
    } else {
      switch (durationUnit) {
        case 'D':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Day`)
          break;
        case 'W':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Week`)
          break;
        case 'M':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Month`)
          break;
        case 'Y':
          this.prescriptionForm.get('templabTestFormGroup')?.get('durationText')?.setValue(`${durationCount} Year`)
          break;
        default:
          break;
      }
    }
  }

  viewAllChild(selectedLabtestIndex: number) {
    this.labTeses().at(selectedLabtestIndex).get('labtest')?.get('openViewMoreTextPopup')
    this.labTeses().controls.forEach((val: any, i: number) => {
      this.labTeses().at(i).get('labtest')?.get('openViewMoreTextPopup')?.setValue(false)
    })
    this.labTeses().at(selectedLabtestIndex).get('labtest')?.get('openViewMoreTextPopup')?.setValue(true)
  }

  viewMorTextPopupClose(selectedLabtestIndex: number) {
    this.labTeses().at(selectedLabtestIndex).get('labtest')?.get('openViewMoreTextPopup')?.setValue(false)
  }

  deleteLabtest(labtestIndex: number) {
    if (!this.labTeses().at(labtestIndex).get('updateMode')?.value) {
      if (this.labTeses().at(labtestIndex).get('isAdd')?.value) {
        this.labTeses().removeAt(labtestIndex);
      } else {
        this.labTeses().at(labtestIndex).get('isDelete')?.setValue(true);
        this.prescriptionForm.get('isChange')?.setValue(true);
      }
    }
  }

  getTemplabTestFormController(controlName: any) {
    let control = <any>this.prescriptionForm.get('templabTestFormGroup')
    return control.controls[controlName];
  }

  removeSelecetedLabTest() {
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.reset();
    let controlArray = <FormArray>this.prescriptionForm.get('templabTestFormGroup')?.get('labtest')?.get('childTests');
    controlArray.clear();
    this.prescriptionForm.get('templabTestFormGroup')?.get('labtestSearch')?.enable();
    this.prescriptionForm.get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(true);
  }

  onLabtestSearchType() {
    this.prescriptionForm.get('templabTestFormGroup')?.get('ifLabtestSearch')?.setValue(true)
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

  labTeses() {
    return this.prescriptionForm.get('labTeses') as FormArray;
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

  clearLabTestOptionForm() {
    this.labtestFormCreat([]);
  }

  childTests(index: number) {
    return this.optins().at(index).get('childTests') as FormArray;
  }

  private addChildTestGroup() {
    return this.fb.group({
      uniqueID: [''],
      childTest: [''],
      childTestCode: [''],
      childCheck: [false]
    })
  }

  optins() {
    return this.labtestOptionForm.get('options') as FormArray;
  }

  private addOptionGroup() {
    return this.fb.group({
      isUpdated: [false],
      testCode: [''],
      test: [''],
      testCheck: [''],
      testDescription: [''],
      childTests: this.fb.array([])
    })
  }

  private addLabTestFormGroup() {
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

  //<--------labtest end
  // houseHoldItem Start ------>
  editHouseHoldItem(houseHoldItemIndex: number, isAdd: any) {
    const editFound = this.houseHoldItemList().value.find((res: any) => res.updateMode === true)
    if (!editFound) {
      this.houseHoldItemList().at(houseHoldItemIndex).get('updateMode')?.setValue(true);
      this.houseHoldItemList().at(houseHoldItemIndex).get('isChange')?.setValue(true);
      this.houseHoldItemList().at(houseHoldItemIndex).get('householdItemName')?.disable();
      const edidData = this.houseHoldItemList().at(houseHoldItemIndex).getRawValue()
      this.prescriptionForm.get('tempHouseHoldItemGroup')?.patchValue(edidData);
    }
  }

  saveHouseHoldItem(data: any, isValid?: boolean) {
    const formControl: FormGroup = this.prescriptionForm.get('tempHouseHoldItemGroup') as FormGroup
    this.formService.markFormGroupTouched(formControl)
    if (isValid) {
      const fiendHouseHoldItemIndex = this.houseHoldItemList().getRawValue().findIndex((res: any) => res.householdItemCode === data.householdItemCode)
      if (data.updateMode) {
        this.houseHoldItemList().at(fiendHouseHoldItemIndex).patchValue(data)
        this.HouseHoldItemFormReset()
      } else {
        if (fiendHouseHoldItemIndex > -1) {
          this.getTempHouseHoldFormController('errMsg').setValue('This item is already selected')
        } else {
          this.houseHoldItemList().push(this.addHouseHoldItemGroup())
          this.houseHoldItemList().at(this.houseHoldItemList().length - 1).patchValue(data)
          this.HouseHoldItemFormReset()
          this.healthEquipmentList = [];
          this.healthEquipmentGroupOptions = [];
        }
      }
    }
  }

  deleteHouseHoldItem(houseHoldItemIndex: number, isAdd: any) {
    if (isAdd) {
      this.houseHoldItemList().removeAt(houseHoldItemIndex)
    } else {
      this.houseHoldItemList().at(houseHoldItemIndex).get('isDelete')?.setValue(true)
    }
  }

  onTypeHouseHoldItemName() {
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.setValue(true);
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

  houseHoldItemSelected(houseHoldItem: any) {
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.setValue(false);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('householdItemCode')?.setValue(houseHoldItem.householdItemCode);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('householdItemName')?.setValue(houseHoldItem.householdItemName);
  }

  houseHoldItemList() {
    return this.prescriptionForm.get('houseHoldItemList') as FormArray;
  }

  getTempHouseHoldFormController(key: any) {
    const control = this.prescriptionForm.get('tempHouseHoldItemGroup') as FormGroup
    return control.controls[key];
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

  HouseHoldItemFormReset() {
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.reset()
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('houseHoldItemSearch')?.setValue(true);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('isAdd')?.setValue(true);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('isChange')?.setValue(false);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('isDelete')?.setValue(false);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('updateMode')?.setValue(false);
    this.prescriptionForm.get('tempHouseHoldItemGroup')?.get('errMsg')?.setValue('');
  }

  // houseHoldItem End ------>
  private intializingPrescriptionFormGroup() {
    this.prescriptionForm = this.fb.group({
      prescriptionID: [''],
      patientName: [{ value: '', disabled: true }],
      patientSearch: [true],
      patientUserCode: [''],
      patientID: [''],
      dateOfBirth: [''],
      gender: [''],
      physicianName: [{ value: '', disabled: true }],
      physicianSearch: [true],
      physicianUserID: [''],
      physicianUserCode: [''],
      healthClinicName: [{ value: '', disabled: false },],
      healthClinicSearch: [true],
      healthClinicID: ['', [Validators.required]],
      addressLine: [''],
      landmark: [''],
      city: [''],
      stateName: [''],
      pincode: [''],
      primaryContactNo: [''],
      secondaryContactNo: [''],
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
      visitDate: [{ value: new Date(), disabled: true }],
      visitDateErrorMsg: [''],
      isAdd: [true],
      isChange: [false],
      isDelete: [false],
      dataSet: [false],
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
    }
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

  closePrescriptionPopup() {
    this.close.emit();
  }
}
