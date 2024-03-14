import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { GeneralMedicalInfoService } from '@services/general-medical-info.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-general-medical-information-update',
  templateUrl: './general-medical-information-update.component.html',
  styleUrls: ['./general-medical-information-update.component.css']
})
export class GeneralMedicalInformationUpdateComponent implements OnInit {
  medicalInfoForm: FormGroup;
  generalMedicalInformationOptionList: Array<any> = [];
  gmlaboratoryTestList: any = [];
  filteredMedicalInfoOption: Array<any> = [];
  selectedPatientDetails: any;
  healthClinicDetails: any;
  appointmentList: any = [];
  allAppointmentList: any = [];
  completionStatusHide: boolean = false;
  errorMessage: any = {};
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public generalMedicalInfoService: GeneralMedicalInfoService,
    public utility: UtilityService,
    private store: Store<any>,
  ) {
  }

  hideCompletionStatus(data: boolean, appointmentIndex: number) {
    if (data) {
      const ap: any = [...this.appointmentList]
      ap[appointmentIndex].isCompletionStatusHide = true;
      const list = [...ap[appointmentIndex].patientScheduleInfoList]
      ap[appointmentIndex].patientScheduleInfoList = [];
      list.forEach((res: any) => {
        if (res.completionStatus !== 'Y') {
          ap[appointmentIndex].patientScheduleInfoList.push(res);
        }
      })
      this.appointmentList = ap
    } else {
      this.appointmentList[appointmentIndex].isCompletionStatusHide = false;
      this.appointmentList[appointmentIndex].patientScheduleInfoList = this.allAppointmentList[appointmentIndex].patientScheduleInfoList;
    }

  }

  getAppoinmentList = async () => {
    const reqData: any = {
      apiRequest: {
        appointmentDate: new Date(),
        healthClinicID: this.healthClinicDetails.diagnosticCentreID
      }
    };
    this.generalMedicalInfoService.getAppointmentList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const healthClinicAppointmentList: any = []
          const refHealthClinicAppointmentList: any = []
          res.apiResponse.healthClinicAppointmentList.forEach((healthClinicAppointment: any, index: number) => {
            const data = { ...healthClinicAppointment, isCompletionStatusHide: false }
            healthClinicAppointmentList.push(data);
          })
          res.apiResponse.healthClinicAppointmentList.forEach((healthClinicAppointment: any, index: number) => {
            const data = { ...healthClinicAppointment, isCompletionStatusHide: false }
            refHealthClinicAppointmentList.push(data);
          })
          this.allAppointmentList = [...healthClinicAppointmentList]
          this.appointmentList = [...refHealthClinicAppointmentList]
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Diagnostic centre couldn't fetch due some error");
        }
      })
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility) {
        this.generalMedicalInformationOptionList = val.utility.generalMedicalInfoList.generalMedicalInfoDetailsList
        this.gmlaboratoryTestList = val.utility.gmlaboratoryTestList
      }
    })
    this.intializingPrescriptionFormGroup();
    this.intializingMessage();
    this.getDiagnosticCentreDetails();
    this.medicalInfoForm.valueChanges.subscribe(res => {
      this.filterMedicalInfoOptionList();
    })
  }

  getDiagnosticCentreDetails() {
    const reqData: any = {
      apiRequest: {
        commercialID: ''
      }
    }
    this.generalMedicalInfoService.GetDiagnosticCentreDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.healthClinicDetails = {
            diagnosticCentreID: res.apiResponse.diagnosticCentreID,
            diagnosticCentreName: res.apiResponse.diagnosticCentreName,
          }
          this.getAppoinmentList();
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Diagnostic centre couldn't fetch due some error");
        }
      })
  }

  setIsArrived = async () => {
    const reqData: any = {
      apiRequest: {
        patientID: this.selectedPatientDetails.PatientID,
        patientUserCode: this.selectedPatientDetails.PatientCode,
        physicianUserCode: this.selectedPatientDetails.physicianCode,
        commercialID: this.healthClinicDetails.diagnosticCentreID,
        appointmentDate: this.selectedPatientDetails.appointmentDate,
        appointmentTime: this.selectedPatientDetails.appointmentTime,
        arrivalInd: this.selectedPatientDetails.isArrived === 'Y' ? 'N' : 'Y',
        transactionResult: '',
      }
    };
    await this.generalMedicalInfoService.PatientArrival(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.selectedPatientDetails.isArrived = res.apiResponse.arrivalInd;
          this.appointmentList[this.selectedPatientDetails.appointmentIndex].patientScheduleInfoList[this.selectedPatientDetails.patientIndex].arrivalStatus = res.apiResponse.arrivalInd
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medical information could not save due some error");
        }
      })
  }

  getAppointmentList = async () => {
    const reqData: any = {
      apiRequest: {
        appointmentDate: new Date(),
        healthClinicID: this.healthClinicDetails.diagnosticCentreID
      }
    };
    await this.generalMedicalInfoService.getAppointmentList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {

        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medical information could not save due some error");
        }
      })
  }

  selectPatient(patientScheduleInfo: any, appointment: any, appointmentIndex: number, patientIndex: number) {
    this.selectedPatientDetails = {
      physicianName: appointment.physicianName,
      physicianID: appointment.patientID,
      physicianCode: appointment.physicianUserCode,
      physicianQualification: appointment.physicianQualification,
      physicianSpecialisation: appointment.physicianSpecialisation,
      physicianRegistrationNumber: appointment,
      physicianRegistrationAuthority: appointment,
      PatientName: patientScheduleInfo.patientName,
      PatientID: patientScheduleInfo.patientID,
      PatientCode: patientScheduleInfo.patientUserCode,
      appointmentDate: patientScheduleInfo.appointmentDate,
      appointmentTime: patientScheduleInfo.appointmentTime,
      isArrived: patientScheduleInfo.arrivalStatus,
      gmiStatusInfo: patientScheduleInfo.gmiStatusInfo,
      appointmentIndex: appointmentIndex,
      patientIndex: patientIndex
    }
    this.medicalInfoList().clear();
    this.addAnotherMedicalInfo();
  }

  saveMedicalGeneralInfo = async () => {
    this.formService.markFormGroupTouched(this.medicalInfoForm);
    if (this.medicalInfoForm.valid) {
      const reqData: any = {
        apiRequest: {
          userID: this.selectedPatientDetails.PatientID,
          commercialID: this.healthClinicDetails.diagnosticCentreID,
          userHeight: '',
          userWeight: '',
          userBloodGroup: "",
          userTemperature: '',
          userPulse: '',
          userPressure: '',
          userOtherIndicator: "XXXXX",
           // laboratoryTestResultList: [],
           generalLabtestDiabeticInfomrationList:[],
           generalLabtestThyroidInfomrationList:[],
          recorddate: new Date()
        }
      }
      this.medicalInfoForm.value.medicalInfoList.forEach((medicalInfo: any) => {
        switch (medicalInfo.key) {
          case 'HT':
            reqData.apiRequest.userHeight = medicalInfo.result
            break;
          case 'WT':
            reqData.apiRequest.userWeight = medicalInfo.result
            break;
          case 'BG':
            reqData.apiRequest.userBloodGroup = medicalInfo.result
            break;
          case 'TM':
            reqData.apiRequest.userTemperature = medicalInfo.result
            break;
          case 'PL':
            reqData.apiRequest.userPulse = medicalInfo.result
            break;
          case 'BP':
            reqData.apiRequest.userPressure = medicalInfo.result
            break;
          case 'BP':
            reqData.apiRequest.userPressure = medicalInfo.result
            break;
          case 'BP':
            reqData.apiRequest.userPressure = medicalInfo.result
            break;
          case 'BP':
            reqData.apiRequest.userPressure = medicalInfo.result
            break;
          case 'GM23019910':
            reqData.apiRequest.userPressure = medicalInfo.result
            if (medicalInfo.result) {
              let labtestDetails = this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === 'GM23019910')
              let value = {
                laboratoryTestCode: labtestDetails.laboratoryTestCode,
                laboratoryTestDate: medicalInfo.checkupDate,
                laboratoryTestName: labtestDetails.laboratoryTestName,
                laboratoryTestValue: medicalInfo.result
              }
              reqData.apiRequest.generalLabtestDiabeticInfomrationList.push(value)
            }
            break;
          case 'GM23019920':
            reqData.apiRequest.userPressure = medicalInfo.result
            if (medicalInfo.result) {
              let labtestDetails = this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === 'GM23019920')
              let value = {
                laboratoryTestCode: labtestDetails.laboratoryTestCode,
                laboratoryTestDate: medicalInfo.checkupDate,
                laboratoryTestName: labtestDetails.laboratoryTestName,
                laboratoryTestValue: medicalInfo.result
              }
              reqData.apiRequest.generalLabtestDiabeticInfomrationList.push(value)
            }
            break;
          case 'GM23019930':
            reqData.apiRequest.userPressure = medicalInfo.result
            if (medicalInfo.result) {
              let labtestDetails = this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === 'GM23019930')
              let value = {
                laboratoryTestCode: labtestDetails.laboratoryTestCode,
                laboratoryTestDate: medicalInfo.checkupDate,
                laboratoryTestName: labtestDetails.laboratoryTestName,
                laboratoryTestValue: medicalInfo.result
              }
              reqData.apiRequest.generalLabtestDiabeticInfomrationList.push(value)
            }
            break;
          case 'GM23019940':
            reqData.apiRequest.userPressure = medicalInfo.result
            if (medicalInfo.result) {
              let labtestDetails = this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === 'GM23019940')
              let value = {
                laboratoryTestCode: labtestDetails.laboratoryTestCode,
                laboratoryTestDate: medicalInfo.checkupDate,
                laboratoryTestName: labtestDetails.laboratoryTestName,
                laboratoryTestValue: medicalInfo.result
              }
              reqData.apiRequest.generalLabtestThyroidInfomrationList.push(value)
            }
            break;
          case 'GM23019950':
            reqData.apiRequest.userPressure = medicalInfo.result
            if (medicalInfo.result) {
              let labtestDetails = this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === 'GM23019950')
              let value = {
                laboratoryTestCode: labtestDetails.laboratoryTestCode,
                laboratoryTestDate: medicalInfo.checkupDate,
                laboratoryTestName: labtestDetails.laboratoryTestName,
                laboratoryTestValue: medicalInfo.result
              }
              reqData.apiRequest.generalLabtestThyroidInfomrationList.push(value)
            }
            break;
          case 'GM23019960':
            reqData.apiRequest.userPressure = medicalInfo.result
            if (medicalInfo.result) {
              let labtestDetails = this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === 'GM23019960')
              let value = {
                laboratoryTestCode: labtestDetails.laboratoryTestCode,
                laboratoryTestDate: medicalInfo.checkupDate,
                laboratoryTestName: labtestDetails.laboratoryTestName,
                laboratoryTestValue: medicalInfo.result
              }
              reqData.apiRequest.generalLabtestThyroidInfomrationList.push(value)
            }
            break;
          case 'DC':
            if (medicalInfo.result.length) {
              reqData.apiRequest.userOtherIndicator = reqData.apiRequest.userOtherIndicator.substring(0, 0) + medicalInfo.result + reqData.apiRequest.userOtherIndicator.substring(0 + 1);
            }
            break;
          case 'TH':
            if (medicalInfo.result.length) {
              reqData.apiRequest.userOtherIndicator = reqData.apiRequest.userOtherIndicator.substring(0, 1) + medicalInfo.result + reqData.apiRequest.userOtherIndicator.substring(1 + 1);
            }
            break;
          case 'SM':
            if (medicalInfo.result.length) {
              reqData.apiRequest.userOtherIndicator = reqData.apiRequest.userOtherIndicator.substring(0, 2) + medicalInfo.result + reqData.apiRequest.userOtherIndicator.substring(2 + 1);
            }
            break;
          case 'AL':
            if (medicalInfo.result.length) {
              reqData.apiRequest.userOtherIndicator = reqData.apiRequest.userOtherIndicator.substring(0, 3) + medicalInfo.result + reqData.apiRequest.userOtherIndicator.substring(3 + 1);
            }
            break;
          case 'BC':
            if (medicalInfo.result.length) {
              reqData.apiRequest.userOtherIndicator = reqData.apiRequest.userOtherIndicator.substring(0, 4) + medicalInfo.result + reqData.apiRequest.userOtherIndicator.substring(4 + 1);
            }
            break;

          default:
            break;
        }
      })
      await this.generalMedicalInfoService.medicalGeneralInfoSave(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.GMIStatusUpdate();
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Medical information could not save due some error");
          }
        })
    }

  }

  GMIStatusUpdate = async () => {
    const reqData: any = {
      apiRequest: {
        patientID: this.selectedPatientDetails.PatientID,
        patientUserCode: this.selectedPatientDetails.PatientCode,
        physicianUserCode: this.selectedPatientDetails.physicianCode,
        commercialID: this.healthClinicDetails.diagnosticCentreID,
        appointmentDate: this.selectedPatientDetails.appointmentDate,
        appointmentTime: this.selectedPatientDetails.appointmentTime,
        arrivalInd: this.selectedPatientDetails.isArrived === 'Y' ? 'N' : 'Y',
        gmiStatusInfo: 'Y',
        transactionResult: '',
      }
    }
    await this.generalMedicalInfoService.GMIStatusUpdate(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.selectedPatientDetails.gmiStatusInfo = res.apiResponse.gmiStatusInfo;
          this.appointmentList[this.selectedPatientDetails.appointmentIndex].patientScheduleInfoList[this.selectedPatientDetails.patientIndex].gmiStatusInfo = res.apiResponse.gmiStatusInfo
          this.selectedPatientDetails = undefined;
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medical information could not save due some error");
        }
      })
  }

  getPlaceHolder(key: string) {
    return this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === key).measurementUnit
  }

  isSelectedPreviousMedicalInfoOption(key: string, selectedkey: string) {
    const a = this.filteredMedicalInfoOption.find(res => res === key)
    if (a) {
      if (a === selectedkey) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  filterMedicalInfoOptionList = () => {
    this.filteredMedicalInfoOption = [];
    this.medicalInfoForm.value.medicalInfoList.forEach((medicalInfo: any) => {
      if (medicalInfo.key) {
        this.filteredMedicalInfoOption.push(medicalInfo.key)
      }
    })
  }

  selectMedicalInfoSelect(medicalInfoIndex: number, option: string) {
    const gmOption = this.generalMedicalInformationOptionList.find((res: any) => res.generalMedicalInfoKey === option)
    this.medicalInfoList().at(medicalInfoIndex).get('resultType')?.setValue(gmOption.generalMedicalInfoValidationRule)
    this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue('')
    this.medicalInfoList().at(medicalInfoIndex).get('result')?.clearValidators()
    this.medicalInfoList().at(medicalInfoIndex).get('result')?.updateValueAndValidity()
    if (gmOption.generalMedicalInfoKey === 'BP') {
      this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValidators([Validators.required, Validators.pattern('([0-9])+([/])+([0-9])+([0-9])')])
    } else {
      this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValidators([Validators.required])
    }
  }

  onChangeResult(medicalInfoIndex: number, value: string, resultType: string) {
    if (value.length) {
      switch (resultType) {
        case 'I':
          if (!this.commonService.checkUserNumber(value)) {
            const oldVal: string = value
            this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue(oldVal.substring(0, oldVal.length - 1))
          }
          break;
        case 'D':
          if (!this.commonService.checkDecimalNumber(value)) {
            const oldVal: string = value
            this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue(oldVal.substring(0, oldVal.length - 1))
          }
          break;
        case '/':
          if (!this.commonService.checkDecimalNumberwithSlash(value)) {
            const oldVal: string = value
            this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue(oldVal.substring(0, oldVal.length - 1))
          }
          break;

        default:
          break;
      }

    }
  }

  deleteMedicalInfo(medicalInfoIndex: number) {
    this.medicalInfoList().removeAt(medicalInfoIndex);
    if (this.medicalInfoList().length < 1) {
      this.addAnotherMedicalInfo()
    }
  }

  addAnotherMedicalInfo() {
    if (this.medicalInfoList().valid) {
      this.medicalInfoList().push(this.addMedicalInfoGroup())
    } else {
      this.medicalInfoList().at(this.medicalInfoList().length - 1).get('err')?.setValue('Please fill the details first');
      setTimeout(() => {
        this.medicalInfoList().at(this.medicalInfoList().length - 1).get('err')?.setValue('');
      }, 2000);
    }
  }

  private addMedicalInfoGroup() {
    return this.fb.group({
      key: ['', Validators.required],
      resultType: ['I'],
      result: ['', Validators.required],
      err: ['']
    })
  }

  medicalInfoList() {
    return (this.medicalInfoForm.get('medicalInfoList') as FormArray);
  }

  getmedicalInfoController(medicalInfoIndex: number, controlName: any) {
    let medicalInfoArray = <any>this.medicalInfoForm.controls['medicalInfoList']
    return medicalInfoArray.controls[medicalInfoIndex].controls[controlName]
  }

  private intializingPrescriptionFormGroup() {
    this.medicalInfoForm = this.fb.group({
      medicalInfoList: this.fb.array([this.addMedicalInfoGroup()])
    })
  }

  private intializingMessage() {
    this.errorMessage = {
      result: {
        required: 'Requird',
        pattern: 'Wrong format'
      },
      key: {
        required: 'Requird',
      }
    }
  }

}
