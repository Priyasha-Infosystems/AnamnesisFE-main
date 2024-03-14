import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BASE_IMAGE_URL } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabTestSelectionService } from '@services/lab-test-selection.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { PrescriptionViewService } from '@services/prescription-view.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prescription-view',
  templateUrl: './prescription-view.component.html',
  styleUrls: ['./prescription-view.component.css']
})
export class PrescriptionViewComponent implements OnInit {
  @Input()
  prescriptionID: string;
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  public prescriptionDetails: any;
  public childDisplayNo: number = 50;
  public medicineForm: FormGroup;
  public labtestForm: FormGroup;
  public houseHoldItemForm: FormGroup;
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL;
  private isAddToCart: boolean = false;
  public isAnotherUser = false;
  public somthingWentWrong: boolean = false;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private prescriptionViewService: PrescriptionViewService,
    private labtestSelectionservices: LabTestSelectionService,
    private medicineSelectionService: MedicineSelectionService,
    public utilityService: UtilityService,
  ) {
    this.intializingMedicineSeectionFormGroup();
  }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.getPrescription(this.prescriptionID);
  }

  labTestAddToCart = async (data: any) => {
    const selectedLabtests: Array<any> = [];
    data.labtests.forEach((val: any, index: number) => {
      if (val.labTestCheck) {
        selectedLabtests.push(this.prescriptionDetails.labTeses[index]);
      }
    })
    const reqData: any = {
      apiRequest: []
    };
    if (selectedLabtests.length) {
      let seqNo: number = 0;
      selectedLabtests.forEach((val, index) => {
        seqNo = seqNo + 1;
        const tempLaboratoryTestPackage: any = {
          userID: this.requestKeyDetails.userID,
          cartItemSeqNo: '',
          prescriptionID: this.prescriptionID,
          itemType: 'LT',
          itemCode: val.labtest.testCode,
          packageID: '',
          quantity: 1,
          addressID: '',
          couponCode: '',
          itemStatus:val.laboratoryTestPackageStatus,
          actionIndicator: 'ADD',
          transactionResult: '',
          itemCategory:''
        }
        reqData.apiRequest.push(tempLaboratoryTestPackage);
      })
      await this.medicineSelectionService.addToCartPrescriptionItem(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success(`${selectedLabtests.length > 1 ? 'Items' : 'Item'}`+'has been placed to cart successfully');
            this.isAddToCart = true;
            this.labtests().controls.forEach((val: any, i: number) => {
              val.get('labTestCheck').setValue(false)
            })
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
            this.toastr.error(`${selectedLabtests.length > 1 ? 'Items' : 'Item'} couldn't move to cart due some error`);
          }
        })
    } else {
      // this.customErrorAddToCartMsg = 'No lab test for cart';
      // setTimeout(() => { this.customErrorAddToCartMsg = '' }, 1500);
    }
  }

  houseHoldItemAddToCart = async (data: any) => {
    const selectedHouseHoldItems: Array<any> = [];
    data.houseHoldItemList.forEach((val: any, index: number) => {
      if (val.houseHoldItemCheck) {
        selectedHouseHoldItems.push(this.prescriptionDetails.houseHoldItemList[index]);
      }
    })
    const reqData: any = {
      apiRequest: []
    };
    if (selectedHouseHoldItems.length) {
      let seqNo: number = 0;
      selectedHouseHoldItems.forEach((val, index) => {
        seqNo = seqNo + 1;
        const tempLaboratoryTestPackage: any = {
          userID: this.requestKeyDetails.userID,
          cartItemSeqNo: '',
          prescriptionID: this.prescriptionID,
          itemType: 'HI',
          itemCode: val.householdItemCode,
          packageID: '',
          quantity: 1,
          addressID: '',
          couponCode: '',
          itemStatus:val.householdItemStatus,
          actionIndicator: 'ADD',
          transactionResult: '',
          itemCategory:''
        }
        reqData.apiRequest.push(tempLaboratoryTestPackage);
      })
      await this.medicineSelectionService.addToCartPrescriptionItem(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success(`${selectedHouseHoldItems.length > 1 ? 'Items' : 'Item'}`+'has been placed to cart successfully');
            this.isAddToCart = true;
            this.labtests().controls.forEach((val: any, i: number) => {
              val.get('labTestCheck').setValue(false)
            })
           
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
            this.toastr.error(`${selectedHouseHoldItems.length > 1 ? 'Items' : 'Item'} couldn't move to cart due some error`);
          }
        })
    } else {
      // this.customErrorAddToCartMsg = 'No lab test for cart';
      // setTimeout(() => { this.customErrorAddToCartMsg = '' }, 1500);
    }
  }

  medicineAddToCart = async (data: any) => {
    const selectedMedicineList: Array<any> = [];
    data.medicines.forEach((val: any, index: number) => {
      if (val.medicineCheck) {
        selectedMedicineList.push(this.prescriptionDetails.medicines[index]);
      }
    })
    const reqData: any = {
      apiRequest: []
    }
    if (selectedMedicineList.length) {
      let seqNo: number = 0;
      selectedMedicineList.forEach((val, index) => {
        seqNo = seqNo + 1;
        const tempMedicine = {
          userID: this.requestKeyDetails.userID,
          cartItemSeqNo: '',
          prescriptionID: this.prescriptionID,
          itemType: 'MD',
          itemCode: val.medicineCode,
          packageID: '',
          quantity: 1,
          addressID: '',
          couponCode: '',
          itemStatus:val.medicineStatus,
          actionIndicator: 'ADD',
          transactionResult: '',
          itemCategory: val.medicineCategory,
        }
        reqData.apiRequest.push(tempMedicine);
      })
      await this.medicineSelectionService.addToCartPrescriptionItem(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success(`${selectedMedicineList.length > 1 ? 'Items' : 'Item'}`+'has been placed to cart successfully');
            this.isAddToCart = true;
            this.medicines().controls.forEach((val: any, i: number) => {
              val.get('medicineCheck').setValue(false)
            })
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error(`${selectedMedicineList.length > 1 ? 'Items' : 'Item'} couldn't move to cart due some error`);
          }
        })
    } else {
      // this.customErrorAddToCartMsg = 'No medicine for cart';
      // setTimeout(() => { this.customErrorAddToCartMsg = '' }, 1500);
    }
  }

  getOpeningDays(days: any) {
    if (days && days.length > 0) {
      const totalDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const openDays: any = [];
      days.split("").forEach((day: any, index: any) => {
        if (day == "Y") {
          openDays.push(totalDays[index]);
        }
      });
      return openDays.join(', ');
    }
    return "";
  }

  getPrescription = async (prescriptionID: string) => {
    const reqData: any = {
      apiRequest: { prescriptionID: prescriptionID }
    }
    await this.prescriptionViewService.GetPrescription(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const prescription = res.apiResponse;
          if (this.requestKeyDetails.userCode !== prescription.patientCode) {
            this.isAnotherUser = true;
          }
          this.prescriptionDetails = {
            patientName: prescription.patientName,
            patientUserID: prescription.patientID,
            profilePictureName: prescription?.profilePictureName ? prescription.profilePictureName : '',
            patientprofileGender: prescription.gender,
            patientDOB: new Date(prescription.dateofbirth), /** @todo dateOfBirth convert Date type*/
            patientAge: Math.floor((Math.abs(Date.now() - new Date(prescription.dateofbirth).getTime()) / (1000 * 3600 * 24)) / 365.25), /** @todo dateOfBirth convert  Age*/
            physicianName: prescription.physicianName,
            physicianUserID: prescription.physicianID,
            physicianQualification: prescription.physicianQualification,
            physicianSpecialization: prescription.physicianSpecialisation ? prescription.physicianSpecialisation : '',
            physicianEmailID: prescription.physicianEmailID,
            physicianContactNo: prescription.physicianContactNo ? prescription.physicianContactNo : '',
            healthClinicName: prescription.healthclinicName,
            healthClinicID: prescription.healthClinicID,
            healthclinicAddress: prescription.healthclinicAddress,
            healthClinicCity: prescription.healthClinicCity,
            healthClinicState: prescription.healthClinicState,
            healthClinicCountry: prescription.healthClinicCountry,
            healthclinicPincode: prescription.healthclinicPincode,
            healthClinicLandmark: prescription.healthClinicLandmark,
            healthclinicemailID: prescription.healthclinicemailID,
            healthcliniccontactNo: prescription.healthcliniccontactNo,
            healthclinicOpenDays: this.getOpeningDays(prescription.healthclinicOpenDays),
            healthclinicOpenTime: prescription?.healthclinicOpenTime ? this.utilityService.timeFormateInto12Hours(prescription.healthclinicOpenTime) : '',
            healthclinicCloseTime: prescription?.healthclinicCloseTime ? this.utilityService.timeFormateInto12Hours(prescription.healthclinicCloseTime) : '',
            temperature: prescription?.patientTemperature ? prescription.patientTemperature : '',
            temperatureInFahrenheit: '',
            pulse: prescription?.patientPulse ? prescription.patientPulse : '',
            pressure: prescription?.patientPressure ? prescription.patientPressure : '',
            weight: prescription?.patientWeight ? prescription.patientWeight : '',
            hight: prescription?.patientHeight ? prescription.patientHeight : '',
            diabetics: '',
            alchol: '',
            smoking: '',
            thyroid: '',
            pressureRange: '',
            symptoms: prescription.symptoms.replace('\n', '<br />'),
            diagnosis: prescription.diagnosis.replace('\n', '<br />'),
            medicines: [],
            tempmedicineForm: {},
            labTeses: [],
            tempHouseHoldItemGroup: {},
            houseHoldItemList: [],
            templabTestFormGroup: {},
            nextVisitCount: prescription.nextVisitDays,
            nextVisitUnit: prescription.nextVisitDaysUnit,
            nextVisitDate: ''/**@todo nextVisitDate map*/,
            prescriptionSpecialInstruction: prescription.specialInstructions.replace('\n', '<br />'),/**@todo prescriptionSpecialInstruction map*/
            visitDate: new Date(prescription.visitDate),
          }
          if (prescription.nextVisitDays) {
            if (prescription.nextVisitDays && prescription.nextVisitDaysUnit.length) {
              const currentDate = new Date(prescription.visitDate);
              let nextVisitDate: any;
              if (prescription.nextVisitDaysUnit === 'D') {
                nextVisitDate = new Date(currentDate.setDate(currentDate.getDate() + +prescription.nextVisitDays))
              } else if (prescription.nextVisitDaysUnit === 'M') {
                nextVisitDate = new Date(currentDate.setMonth(currentDate.getMonth() + +prescription.nextVisitDays))
              } else {
                nextVisitDate = currentDate.setFullYear(currentDate.getFullYear() + +prescription.nextVisitDays)
              }
              this.prescriptionDetails.nextVisitDate = nextVisitDate;
            } else {
              this.prescriptionDetails.nextVisitDate = '';
            }
          }
          for (let index = 0; index < prescription.patientOtheIndicator.length; index++) {
            switch (index) {
              case 0:
                this.prescriptionDetails.diabetics = prescription.patientOtheIndicator[index]
                break;
              case 1:
                this.prescriptionDetails.thyroid = prescription.patientOtheIndicator[index]
                break;
              case 2:
                this.prescriptionDetails.smoking = prescription.patientOtheIndicator[index]
                break;
              case 3:
                this.prescriptionDetails.alchol = prescription.patientOtheIndicator[index]
                break;
              case 4:
                this.prescriptionDetails.pressureRange = prescription.patientOtheIndicator[index]
                break;
              default:
                break;
            }
          }
          // this.prescriptionDetails.temperatureInFahrenheit =(Math.round((+prescription.patientTemperature*(9/5)+32) * 100) / 100).toFixed(2);
          prescription.prescriptionMedicationDetailsList.forEach((medicationDetails: any) => {
            const tempMedicationDetails: any = {
              medicineName: medicationDetails.medicineName,
              medicineSearch: true,
              medicineComposition: medicationDetails.medicineComposition,
              medicineCode: medicationDetails.medicineCode,
              frequency: medicationDetails.medicationFrequency,
              dose: medicationDetails.medicationDose,
              medicineTiming: medicationDetails.medicationTiming,
              dayCount: medicationDetails.medicineDuration,
              duration: medicationDetails.medicineDurationUnit,
              durationText: '',
              spcialNotes: medicationDetails.medicationNotes ? medicationDetails.medicationNotes : '',
              medicineCategory:medicationDetails.medicineCategory
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
            this.prescriptionDetails.medicines.push(tempMedicationDetails)
            this.medicines().push(this.addMedicineFormGroup())
          })
          prescription.prescriptionLabTestDetailsList.forEach((labTestDetails: any) => {
            const tempLabtest: any = {
              labtestSearch: '',
              ifLabtestSearch: true,
              labtest: {
                isUpdated: false,
                testCode: labTestDetails.laboratoryTestCode,
                test: labTestDetails.laboratoryTestName,
                testCheck: true,
                testDescription: labTestDetails.laboratoryDescription,
                childTests: [],
                displayText: '',
                fullDisplayText: '',
                hidenItem: null,
                openViewMoreTextPopup: false,
                fullTestDescription: '',
              },
              specialInstructionOnTime: labTestDetails.laboratoryTestNotes,
              durationCount: labTestDetails.laboratoryTestTiming,
              durationUnit: labTestDetails.laboratoryTestTimingUnit,
              durationText: '',
              durationNowCheck: false,
              updateMode: false
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
            const tempChildTestList: Array<any> = [];
            labTestDetails.laboratoryTestSummaryList?.forEach((laboratoryTest: any) => {
              const tempClildTest = {
                childTest: laboratoryTest.laboratoryTestName,
                childTestCode: laboratoryTest.laboratoryTestCode,
                childCheck: laboratoryTest.activeIndicator === 'Y' ? true : false
              }
              if (tempClildTest.childCheck) {
                tempChildTestList.push(tempClildTest);
              }
            })
            tempLabtest.labtest.childTests = tempChildTestList;
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
            const tempTestDescription: string = tempLabtest.labtest.testDescription ? tempLabtest.labtest.testDescription : '';
            if (tempTestDescription.length > this.childDisplayNo) {
              tempLabtest.labtest.fullTestDescription = tempTestDescription;
              tempLabtest.labtest.testDescription = tempTestDescription.substring(0, this.childDisplayNo);
            }
            this.prescriptionDetails.labTeses.push(tempLabtest);
            this.labtests().push(this.addLabtestFormGroup())
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
            this.prescriptionDetails.houseHoldItemList.push(houseHoldItem)
            this.houseHoldItemList().push(this.addHouseHoldItemFormGroup())
          })
        } else {
          if (res.anamnesisErrorList.dbModificationInd === 'Y') {
            this.toastr.error('Please try again');
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
          this.somthingWentWrong = true;
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.somthingWentWrong = true;
        this.toastr.error("Prescription couldn't fetch due some error");
        }
      })
  }

  viewAllChild(labtestIndex: number) {
    this.prescriptionDetails.labTeses.forEach((val: any, i: number) => {
      this.prescriptionDetails.labTeses[i].labtest.openViewMoreTextPopup = false;
    })
    this.prescriptionDetails.labTeses[labtestIndex].labtest.openViewMoreTextPopup = true;
  }

  viewMorTextPopupClose(labtestIndex: number) {
    this.prescriptionDetails.labTeses[labtestIndex].labtest.openViewMoreTextPopup = false;
  }

  prescriptionClose() {
    if (this.isAddToCart) {
      this.close.emit(true)
    } else {
      this.close.emit()
    }
  }

  addMedicineFormGroup() {
    return this.fb.group({
      medicineCheck: [false]
    })
  }
  addHouseHoldItemFormGroup() {
    return this.fb.group({
      houseHoldItemCheck: [false]
    })
  }
  addLabtestFormGroup() {
    return this.fb.group({
      labTestCheck: [false]
    })
  }

  medicines() {
    return this.medicineForm.get('medicines') as FormArray
  }
  labtests() {
    return this.labtestForm.get('labtests') as FormArray
  }
  houseHoldItemList() {
    return this.houseHoldItemForm.get('houseHoldItemList') as FormArray
  }

  private intializingMedicineSeectionFormGroup() {
    this.medicineForm = this.fb.group({
      medicines: this.fb.array([])
    })
    this.labtestForm = this.fb.group({
      labtests: this.fb.array([])
    })
    this.houseHoldItemForm = this.fb.group({
      houseHoldItemList: this.fb.array([])
    })
  }
}
