import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LABTEST_SELECTION_ERROR_MESSAGE } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabTestSelectionService } from '@services/lab-test-selection.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, startWith } from 'rxjs';

@Component({
  selector: 'app-lab-test-selection',
  templateUrl: './lab-test-selection.component.html',
  styleUrls: ['./lab-test-selection.component.css']
})
export class LabTestSelectionComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  addressID:string;
  @Input()
  couponCode:any;
  optionFormGroup: FormGroup;
  searchFormGroup: FormGroup;
  errorMessage: any = {};
  labtestList: Array<any> = [];
  filterdeLabtestList: Array<any> = [];
  selectedLabtests: Array<any> = [];
  childDisplayNo: number = 310;
  testDescriptionDisllayNo: number = 310;
  customErrMsg: string = '';
  openViewMoreTextPopup: boolean = false;
  viewMoreText: string = '';
  editeMode: boolean = false;
  customErrorAddToCartMsg: string = '';
  public requestKeyDetails: any;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private labtestSelectionservices: LabTestSelectionService
  ) { }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.intializingMessage()
    this.intializingMedicineSeectionFormGroups();
    this.searchFormGroup.get('searchKey')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(response => {
        if (response && response.length > 2) {
          this.getLabtestList(response)
        }
      })
  }

  addToCart = async () => {
    const reqData: any = {
      apiRequest: {
        laboratoryTestCount: 0,
        labtestOrderDetailsList: []
      }
    };
    if (this.selectedLabtests.length) {
      let seqNo: number = 0;
      this.selectedLabtests.forEach((val, index) => {
        if (val.childTests.length) {
          val.childTests.forEach((child: any) => {
            if (child.childCheck) {
              seqNo = seqNo + 1;
              const tempLaboratoryTestPackage: any = {
                userID: this.requestKeyDetails.userID,
                cartItemSeqNo: '',
                prescriptionID: '',
                itemType: 'PK',
                itemCode: child.childTestCode,
                packageID: val.testCode,
                quantity: 1,
                addressID: this.addressID,
                couponCode: this.couponCode,
                itemStatus:val.laboratoryTestPackageStatus,
                actionIndicator: 'ADD',
                transactionResult: '',
              }
              reqData.apiRequest.labtestOrderDetailsList.push(tempLaboratoryTestPackage)
            }
          })
        } else {
          seqNo = seqNo + 1;
          const tempLaboratoryTestPackage: any = {
            userID: this.requestKeyDetails.userID,
            cartItemSeqNo: '',
            prescriptionID: '',
            itemType: 'LT',
            itemCode: val.testCode,
            packageID: '',
            quantity: 1,
            addressID: this.addressID,
            couponCode: this.couponCode,
            itemStatus:val.laboratoryTestPackageStatus,
            actionIndicator: 'ADD',
            transactionResult: '',
          }
          reqData.apiRequest.labtestOrderDetailsList.push(tempLaboratoryTestPackage)
        }
      })
      reqData.apiRequest.laboratoryTestCount = reqData.apiRequest.labtestOrderDetailsList.length;
      await this.labtestSelectionservices.addToCart(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.toastr.success('Item has been placed to cart successfully');
            this.close.emit(true);
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
          this.toastr.error("Lab test couldn't move to cart due some error");
          }
        })
    } else {
      this.customErrorAddToCartMsg = 'No lab test for cart';
      setTimeout(() => { this.customErrorAddToCartMsg = '' }, 1500);
    }
  }

  editLabTest(testCode: string) {
    this.customErrMsg = '';
    this.resetForm()
    const foundlabTests = [];
    const foundLabTest = this.selectedLabtests.find(res => res.testCode === testCode)
    if (this.editeMode === false) {
      const selectedLabtestIndex = this.selectedLabtests.findIndex(res => res.testCode === testCode)
      this.selectedLabtests[selectedLabtestIndex].isUpdated = true;
      foundlabTests.push({ ...foundLabTest, isUpdated: true })
      this.formCreat(foundlabTests);
    }
    this.editeMode = true;
  }

  deleteLabtest(selectedLabtestIndex: number) {
    if (this.editeMode === false) {
      this.selectedLabtests.splice(selectedLabtestIndex, 1);
    }
  }

  save(data: any) {
    this.customErrMsg = '';
    const preaviousSelection: Array<any> = [];
    const selectedLabtests: Array<any> = [];
    data.options.forEach((option: any, index: number) => {
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
      if (tempTestDescription.length > this.testDescriptionDisllayNo) {
        tempoptions.fullTestDescription = tempoptions.testDescription;
        tempoptions.testDescription = tempTestDescription.substring(0, this.testDescriptionDisllayNo);
      }
      if (tempoptions.testCheck) {
        const found = this.selectedLabtests.find(res => res.testCode === tempoptions.testCode);
        if (found) {
          if (tempoptions.isUpdated) {
            const foundIndex = this.selectedLabtests.findIndex(res => res.testCode === found.testCode)
            if (foundIndex > -1) {
              this.selectedLabtests[foundIndex] = tempoptions;
              this.resetForm()
            }
          } else {
            preaviousSelection.push(tempoptions)
          }
        } else {
          selectedLabtests.push(tempoptions);
        }
      } else {
        if (tempChildTestList.length) {
          const found = this.selectedLabtests.find(res => res.testCode === tempoptions.testCode);
          if (found) {
            if (tempoptions.isUpdated) {
              const foundIndex = this.selectedLabtests.findIndex(res => res.testCode === found.testCode)
              if (foundIndex > -1) {
                this.selectedLabtests[foundIndex] = tempoptions;
                this.resetForm()
              }
            } else {
              preaviousSelection.push(tempoptions)
            }
          } else {
            selectedLabtests.push(tempoptions);
          }
        } else {
          if (tempoptions.isUpdated) {
            const foundIndex = this.selectedLabtests.findIndex(res => res.testCode === tempoptions.testCode);
            if (foundIndex > -1) {
              this.selectedLabtests.splice(foundIndex, 1);
            }
          }
        }
      }
    })
    if (preaviousSelection.length) {
      preaviousSelection.forEach((val: any) => {
        if (this.customErrMsg.length === 0) {
          this.customErrMsg = this.customErrMsg + val.test
        } else {
          this.customErrMsg = `${this.customErrMsg}, ${val.test}`
        }
      })
      this.customErrMsg = `${this.customErrMsg} already selected`;
    } else {
      selectedLabtests.forEach((val: any) => {
        this.selectedLabtests.push(val);
      })
      this.resetForm()
    }
    this.editeMode = false;
  }

  viewAllChild(selectedLabtestIndex: number) {
    this.selectedLabtests.forEach((val: any, i: number) => {
      this.selectedLabtests[i].openViewMoreTextPopup = false;
    })
    this.selectedLabtests[selectedLabtestIndex].openViewMoreTextPopup = true;
  }

  viewLessChild(selectedLabtestIndex: number) {
    this.selectedLabtests[selectedLabtestIndex].displayNo = this.childDisplayNo;
  }

  optionChecked(index: number, value: boolean) {
    this.childTests(index).controls.forEach((val: any, i: number) => {
      this.childTests(index).controls[i].get('childCheck')?.patchValue(value);
    })
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
    if (noOfCheck === this.childTests(optionIndex).controls.length) {
      this.optins().at(optionIndex).get('testCheck')?.patchValue(true);
    }
  }

  getLabtestList = async (searchKey: string) => {
    const reqData: any = {
      apiRequest: { medicineKeyword: searchKey }
    }
    await this.labtestSelectionservices.getLabTestList(reqData)
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
              laboratoryTestPackageStatus:laboratoryTestPackage.laboratoryTestPackageStatus,
              childTests: []
            }
            laboratoryTestPackage.laboratoryTestSummaryList.forEach((laboratoryTestSummary: any) => {
              const tempChildTest: any = {
                childTest: laboratoryTestSummary.laboratoryTestName,
                childTestCode: laboratoryTestSummary.laboratoryTestCode,
                childTestDescription: laboratoryTestSummary.laboratoryTestDescrption,
                recordType: laboratoryTestSummary.recordType,
                laboratoryTestPackageStatus:laboratoryTestPackage.laboratoryTestPackageStatus,
                childCheck: false
              }
              tempLabTest.childTests.push(tempChildTest)
            })
            labtestList.push(tempLabTest);
          })
          this.labtestList = labtestList;
          this.formCreat(this.labtestList);
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

  private formCreat(labtestList: Array<any>) {
    this.optionFormGroup = this.fb.group({
      options: this.fb.array([])
    })
    labtestList.forEach((val: any, index: number) => {
      var parentData: FormGroup = this.addOptionGroup();
      this.optins().push(parentData);
      val.childTests.forEach((v: any, i: number) => {
        var child: FormGroup = this.addChildTestGroup()
        this.childTests(index).push(child)
        // this.childTests(index).at(i). disable();
      })
    })
    labtestList.forEach((val: any, i: number) => {
      let controlArray = <FormArray>this.optionFormGroup.controls["options"];
      controlArray.controls[i].patchValue(val);
    })
  }

  resetForm() {
    this.searchFormGroup.reset();
    this.selectedLabtests.forEach((val: any, i: number) => {
      this.selectedLabtests[i].isUpdated = false;
    })
    this.optionFormGroup = this.fb.group({
      options: this.fb.array([])
    })
    this.editeMode = false;
  }

  optins() {
    return this.optionFormGroup.get('options') as FormArray;
  }

  addOptionGroup() {
    return this.fb.group({
      isUpdated: [false],
      testCode: [''],
      test: [''],
      testCheck: [''],
      testDescription: [''],
      laboratoryTestPackageStatus:[''],
      childTests: this.fb.array([])
    })
  }

  childTests(index: number) {
    return this.optins().at(index).get('childTests') as FormArray;
  }

  addChildTestGroup() {
    return this.fb.group({
      childTest: [''],
      childTestCode: [''],
      laboratoryTestPackageStatus:[''],
      childCheck: [false]
    })
  }

  changeValidator() {
    this.searchFormGroup.get('searchKey')?.clearValidators();
    this.searchFormGroup.get('searchKey')?.updateValueAndValidity();
  }

  closeLabTestPopup() {
    this.close.emit();
  }

  viewMorTextPopupClose(index: number) {
    this.selectedLabtests[index].openViewMoreTextPopup = false;
    this.openViewMoreTextPopup = false;
  }

  private intializingMedicineSeectionFormGroups() {
    this.optionFormGroup = this.fb.group({
      options: this.fb.array([])
    })
    this.searchFormGroup = this.fb.group({
      searchKey: ['']
    })
  }

  private intializingMessage() {
    this.errorMessage.searchKey = {
      required: LABTEST_SELECTION_ERROR_MESSAGE.ERR_MSG_REQUIERD_LABTEST,
      minLength: LABTEST_SELECTION_ERROR_MESSAGE.ERR_MSG__MINLENGTH_LABTEST
    };
  }
}
