import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { GeneralMedicalInfoService } from '@services/general-medical-info.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-health-report-update',
  templateUrl: './health-report-update.component.html',
  styleUrls: ['./health-report-update.component.css']
})
export class HealthReportUpdateComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  currentDate: any = new Date();
  madicalInfoForm: FormGroup;
  errorMessage: any;
  filteredMedicalInfoOption: any = [];
  generalMedicalInformationOptionList: any = [];
  gmlaboratoryTestList: any = [];
  requestKeyDetails: any;
  errMsg: any
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    private store: Store<any>,
    public generalMedicalInfoService: GeneralMedicalInfoService,
  ) {
    this.intializingMessage()
    this.intializingFormGroup();
  }

  ngOnInit(): void {
    this.store.pipe(select('commonUtility')).subscribe((val: any) => {
      if (val?.executedUtility) {
        this.generalMedicalInformationOptionList = val.utility.generalMedicalInfoList.generalMedicalInfoDetailsList
        this.gmlaboratoryTestList = val.utility.gmlaboratoryTestList
      }
    })
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.madicalInfoForm.get('medicalInfoList')?.valueChanges.subscribe(res => {
      this.filterMedicalInfoOptionList()
    })
  }

  getPlaceHolder(key: string) {
    return this.gmlaboratoryTestList.find((res: any) => res.laboratoryTestCode === key).measurementUnit
  }

  saveMedicalInfo = async (data: any) => {
    let reloadEmitData = 'N'
    let isValid = true;
    const validmedicalInfoList: any = [];
    data.medicalInfoList.forEach((value: any, index: number) => {
      if (index + 1 < data.medicalInfoList.length || index + 1 === 1) {
        if (this.medicalInfoList().at(index).valid) {
          validmedicalInfoList.push(this.medicalInfoList().at(index).getRawValue())
        } else {
          isValid = false
          var controls = this.medicalInfoList().at(index) as FormGroup;
          this.formService.markFormGroupTouched(controls)
        }
      } else {
        if (this.medicalInfoList().at(index).valid) {
          validmedicalInfoList.push(this.medicalInfoList().at(index).getRawValue())
        }
      }
    })
    if (isValid) {
      const reqData: any = {
        apiRequest: {
          userID: this.requestKeyDetails.userID,
          commercialID: '',
          userHeight: '',
          userWeight: '',
          userBloodGroup: '',
          userTemperature: '',
          userPulse: '',
          userPressure: '',
          diabeticInd: '',
          thyroidInd: '',
          smokingInd: '',
          alcoholInd: '',
          pressureInd: '',
          userOtherIndicator: "XXXXX",
          // laboratoryTestResultList: [],
          generalLabtestDiabeticInfomrationList:[],
          generalLabtestThyroidInfomrationList:[],
          recorddate: new Date()
        }
      }
      validmedicalInfoList.forEach((medicalInfo: any) => {
        switch (medicalInfo.key) {
          case 'HT':
            reqData.apiRequest.userHeight = medicalInfo.result
            break;
          case 'WT':
            reqData.apiRequest.userWeight = medicalInfo.result
            break;
          case 'BP':
            reqData.apiRequest.userPressure = medicalInfo.result
            break;
          case 'PL':
            reqData.apiRequest.userPulse = medicalInfo.result
            break;
          case 'BG':
            reqData.apiRequest.userBloodGroup = medicalInfo.result
            break;
          case 'TM':
            reqData.apiRequest.userTemperature = medicalInfo.result
            break;
          case 'GM23019910':
            reloadEmitData = 'Y'
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
            reloadEmitData = 'Y'
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
            reloadEmitData = 'Y'
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
            reloadEmitData = 'Y'
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
            reloadEmitData = 'Y'
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
            reloadEmitData = 'Y'
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
            this.toastr.success('General medical information has been updated successfully')
            this.closePopup(reloadEmitData);
          } else {
            this.errMsg = res.anamnesisErrorList.anErrorList[0].errorMessage;
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.errMsg = "Medical information could not save due some error";
          }
        })
    }
  }

  filterMedicalInfoOptionList = () => {
    this.filteredMedicalInfoOption = [];
    this.madicalInfoForm.value.medicalInfoList.forEach((medicalInfo: any) => {
      this.filteredMedicalInfoOption.push(medicalInfo.key)
    })
  }

  isSelectedPreviousMedicalInfoOption(key: string, selectedkey: string) {
    const a = this.filteredMedicalInfoOption.find((res: any) => res === key)
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

  checkValidDate(medicalInfoIndex: number) {
    const dateControl = this.medicalInfoList().at(medicalInfoIndex).get('checkupDate');
    const a = this.utilityService.getTimeStamp(dateControl!.value, '11:59:59 PM')
    const b = this.currentDate.getTime()
    if (dateControl!.value && this.utilityService.getTimeStamp(dateControl!.value, '00:00:01 AM') > this.currentDate.getTime()) {
      dateControl!.setValue('')
    } else {
      if (this.medicalInfoList().at(medicalInfoIndex).valid && this.medicalInfoList().length < medicalInfoIndex + 2) {
        this.addAnotherMedicalInfo()
      }
    }
  }

  onChangeResult(medicalInfoIndex: number, value: string, resultType: string) {
    if (value.length) {
      switch (resultType) {
        case 'I':
          if (!this.commonService.checkUserNumber(value)) {
            const oldVal: string = value
            this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue(oldVal.substring(0, oldVal.length - 1))
          } else {
            if (this.medicalInfoList().at(medicalInfoIndex).valid && this.medicalInfoList().length < medicalInfoIndex + 2) {
              this.addAnotherMedicalInfo()
            }
          }
          break;
        case 'D':
          if (!this.commonService.checkDecimalNumber(value)) {
            const oldVal: string = value
            this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue(oldVal.substring(0, oldVal.length - 1))
          } else {
            if (this.medicalInfoList().at(medicalInfoIndex).valid && this.medicalInfoList().length < medicalInfoIndex + 2) {
              this.addAnotherMedicalInfo()
            }
          }
          break;
        case '/':
          if (!this.commonService.checkDecimalNumberwithSlash(value)) {
            const oldVal: string = value
            this.medicalInfoList().at(medicalInfoIndex).get('result')?.setValue(oldVal.substring(0, oldVal.length - 1))
          } else {
            if (this.medicalInfoList().at(medicalInfoIndex).valid && this.medicalInfoList().length < medicalInfoIndex + 2) {
              this.addAnotherMedicalInfo()
            }
          }
          break;

        default:
          break;
      }

    }
  }

  onChangeSelectedResuld(medicalInfoIndex: number, value: string) {
    if (value) {
      if (this.medicalInfoList().at(medicalInfoIndex).valid && this.medicalInfoList().length < medicalInfoIndex + 2) {
        this.addAnotherMedicalInfo()
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
    if (this.medicalInfoList().length < 11) {
      this.medicalInfoList().push(this.addMedicalInfoGroup())
      if (this.medicalInfoList().length > 1) {
        const preDate = this.medicalInfoList().at(this.medicalInfoList().length - 2).get('checkupDate')?.value;
        this.medicalInfoList().at(this.medicalInfoList().length - 1).get('checkupDate')?.setValue(preDate);
      }
    }
  }

  private addMedicalInfoGroup() {
    return this.fb.group({
      key: ['', Validators.required],
      resultType: ['I'],
      result: ['', Validators.required],
      checkupDate: ['', Validators.required]
    })
  }

  medicalInfoList() {
    return (this.madicalInfoForm.get('medicalInfoList') as FormArray);
  }

  getmedicalInfoController(medicalInfoIndex: number, controlName: any) {
    let medicalInfoArray = <any>this.madicalInfoForm.controls['medicalInfoList']
    return medicalInfoArray.controls[medicalInfoIndex].controls[controlName]
  }

  private intializingMessage() {
    this.errorMessage = {
      result: {
        required: 'Requird',
        pattern: 'Wrong format'
      },
      key: {
        required: 'Requird',
      },
      checkupDate: {
        required: 'Requird',
      }
    }
  }

  intializingFormGroup() {
    this.madicalInfoForm = this.fb.group({
      medicalInfoList: this.fb.array([this.addMedicalInfoGroup()])
    })
  }

  closePopup(data: any) {
    this.close.emit(data)
  }
}
