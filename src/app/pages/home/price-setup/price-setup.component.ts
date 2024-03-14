import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnamnesisSetupServiceService } from '@services/anamnesis-setup-service.service';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { PriceSetupService } from '@services/price.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-price-setup',
  templateUrl: './price-setup.component.html',
  styleUrls: ['./price-setup.component.css']
})
export class PriceSetupComponent implements OnInit {

  public priceSetupForm: FormGroup;
  public departmentList: Array<any> = [];
  public LabTestList: Array<any> = [];
  public filteredLabTestList: Array<any> = [];
  errorMessage: any = {};

  constructor(
    private fb: FormBuilder,
    private anamnesisSetupServiceService: AnamnesisSetupServiceService,
    private labtestReportUploadService: LabtestReportUploadService,
    public commonService: CommonService,
    private formService: FormService,
    private toastr: ToastrService,
    private priceSetupService: PriceSetupService,
  ) {
    this.priceSetupForm = this.fb.group({
      depPriceList: this.fb.array([]),
    })
  }

  priceSetupGroup() {
    return this.fb.group({
      departmentCode: ['', [Validators.required]],
      priceTestList: this.fb.array([]),
    })
  }

  priceGroup() {
    return this.fb.group({
      test: [''],
      testCode: ['', [Validators.required]],
      price: ['', [Validators.required]],
      tempLabtestList: [this.LabTestList],
      errMsg: ['']
    })
  }

  intializingMessage() {
    this.errorMessage.departmentCode = {
      required: "Department is required",
    };
    this.errorMessage.testCode = {
      required: "Test is required",
    };
    this.errorMessage.price = {
      required: "Required",
    };
  }

  priceSetupFormList() {
    return this.priceSetupForm.get('depPriceList') as FormArray;
  }

  getPriceTestList(index: number) {
    return this.priceSetupFormList().at(index).get('priceTestList') as FormArray
  }

  addTestOrder(index: any) {
    this.getPriceTestList(index).push(this.priceGroup());
  }

  addPricingDetails() {
    this.priceSetupFormList().push(this.priceSetupGroup())
    this.addTestOrder(this.priceSetupFormList().length - 1);
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    // this.getPriceTestList(0).push(this.priceGroup());
    this.getInitialData()
    this.getLabTestList()
    this.intializingMessage();
  }

  getInitialData = async () => {
    const reqData: any = {
      apiRequest: {}
    }
    await this.anamnesisSetupServiceService.getInitialData(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.departmentList = res.apiResponse.departmentCodeDetailsList;
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Specimen Type List and Trend Chart list couldn't fetch due some error");
        }
      })
  }

  getLabTestList = async () => {
    const reqData: any = {
      apiRequest: {
        resultType: 'V',
        searchKeyword: ''
      }
    }
    this.LabTestList = [];
    await this.labtestReportUploadService.getLabtestList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.LabTestList = res.apiResponse.laboratoryTestPackageList;
          this.addPricingDetails()
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

  filterLabtestList(searchKeyword: string, priceSetupFormListIndex: number, priceTestIndex: number,) {
    const filterValue = searchKeyword.toLowerCase();
    let filteredLabTestList = [];
    filteredLabTestList = this.LabTestList.filter(option =>
      option.laboratoryTestPackageDescription.toLowerCase().indexOf(filterValue) > -1);
    this.getPriceTestList(priceSetupFormListIndex).at(priceTestIndex).get('tempLabtestList')?.setValue(filteredLabTestList)
  }


  selectLabtest(labtest: any, priceSetupFormListIndex: number, priceTestIndex: number) {
    const depertmentList = this.getPriceTestList(priceSetupFormListIndex).getRawValue();
    if (depertmentList.find((res => res.testCode === labtest.laboratoryTestPackageCode))) {
      this.getPriceTestList(priceSetupFormListIndex).at(priceTestIndex).get('errMsg')?.setValue('This labtest already selected');
      setTimeout(() => this.getPriceTestList(priceSetupFormListIndex).at(priceTestIndex).get('errMsg')?.setValue(''), 1500);
    } else {
      this.getPriceTestList(priceSetupFormListIndex).at(priceTestIndex).get('testCode')?.setValue(labtest.laboratoryTestPackageCode)
      this.getPriceTestList(priceSetupFormListIndex).at(priceTestIndex).get('test')?.setValue(labtest.laboratoryTestPackageDescription)
    }

  }

  deletePricingDetails(index: any) {
    this.priceSetupFormList().removeAt(index)
  }

  deleteOrder(parentIndex: any, index: any) {
    this.getPriceTestList(parentIndex).removeAt(index)
  }

  getLabReqObj(data: any) {
    const reqArray: any = [];
    const labPriceObject = [...data.depPriceList];
    labPriceObject.forEach((labObject: any) => {
      const prArr: any = [];
      labObject.priceTestList.forEach((prList: any) => {
        const prOb = {
          laboratoryTestCode: prList.testCode,
          laboratoryTestPrice: prList.price
        }
        prArr.push(prOb)
      })
      const labObj = {
        departmentCode: labObject.departmentCode,
        labtestPriceSetUpDetailsList: prArr
      }
      reqArray.push(labObj)
    })
    return reqArray;
  }

  save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.priceSetupForm);
    if (isValid) {
      const reqData: any = {
        apiRequest: this.getLabReqObj(data),
      }
      this.priceSetupService.labtestPriceSetup(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            window.scrollTo(0, 0);
            this.toastr.success("Price setup is successfully submitted");
            this.priceSetupForm.reset();
          } else {
            this.toastr.error("Something went wrong");
          }
        })
        .catch((err: any) => {
        })
    }
  }

  getController(index: any, controlName: any) {
    let controlArray = <any>this.priceSetupForm.controls["depPriceList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control;
  }

  getChildController(parentIndex: any, childIndex: any, controlName: any) {
    let controlArray = <any>this.priceSetupForm.controls["depPriceList"];
    const control: any = controlArray.controls[parentIndex].controls['priceTestList'].controls[childIndex].controls[controlName];
    return control;
  }

}
