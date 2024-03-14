import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { relationTypeDetails } from 'src/store/actions/utility.actions';

@Component({
  selector: 'app-profile-medical-history',
  templateUrl: './profile-medical-history.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileMedicalHistoryComponent implements OnInit {

  public medicalHistoryParam: FormGroup;
  medicalHistoryError: any = "";
  errorMessage: any = {};
  defaultMedicalHistoryDetails: any
  relationOptionList:any = [];
  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
    private store: Store<any>,
  ) {
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      this.relationOptionList = val.relationList;
    })
    this.medicalHistoryParam = this.fb.group({
      familyMedicalHistoryDetailList: this.fb.array([]),
    })
  }

  async getrelationOptionList(){
    if(!this.relationOptionList.length){
      await this.profileService.getFamilyRelationList()
      .then(async (res: any) => {
        this.relationOptionList = res.apiResponse
        await this.store.dispatch(new relationTypeDetails(res.apiResponse));
        await this.store.pipe(select('commonUtility')).subscribe(async val => {
          this.relationOptionList = val.relationList;
        })
      })
      .catch((err: any) => {
      })
    }
  }

  setForm() {
    var parentData: FormGroup = this.fb.group({
      relation: [''],
      diseaseName: [''],
      historyNotes: [''],
      historySeqNo: [''],
      actionIndicator: [''],
      dataSet: [false],
      isApi: [false],
      uniqueID: ['']
    })
    this.getMedicalHistoryList().push(parentData);
  }

  async setData(data: any) {
    for (let i = 0; i < data.length; i++) {
      this.setForm();
    }
    let i = 0;
    data.forEach((val: any) => {
      let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
      controlArray.controls[i].patchValue(val);
      const control: any = controlArray.controls[i];
      control.controls.dataSet.setValue(true);
      control.controls.isApi.setValue(true);
      i++;
    })
  }

  getMedicalHistoryList() {
    return this.medicalHistoryParam.get('familyMedicalHistoryDetailList') as FormArray
  }

  resetError() {
    this.medicalHistoryError = "";
  }

  onChanges(): void {
    this.medicalHistoryParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.getMedicalHistory();
    this.onChanges()
    this.intializingMessage();
    this.getrelationOptionList();
  }

  intializingMessage() {
    this.errorMessage.relation = {
      required: "Relation is required"
    };
    this.errorMessage.diseaseName = {
      required: "Disease is required"
    };
    this.errorMessage.historyNotes = {
      required: "Notes is required"
    };
  }

  getMedicalHistory = async () => {
    await this.profileService.getFamilyMedicalHistory()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultMedicalHistoryDetails = [...res.apiResponse];
          const medicalHistoryDetails = [...res.apiResponse];
          if (medicalHistoryDetails.length > 0) {
            this.setData(medicalHistoryDetails);
          } else {
            this.setForm()
          }
        } else {
          this.setForm()
        }
      })
      .catch((err: any) => {
      })
  }

  getReqObj(data: any) {
    const reqData = { ...data }
    const reqAr: any = [];
    reqData.familyMedicalHistoryDetailList.forEach((data: any, index: any) => {
      delete data.dataSet;
      delete data.isApi;
      if (data.actionIndicator === "" && (data.diseaseName !== "" || data.historyNotes !== "" || data.historySeqNo !== "" || data.relation !== "")) {
        data.actionIndicator = "ADD"
      }
      data.historySeqNo = index + 1;
      if (data.actionIndicator !== "GET") {
        reqAr.push(data)
      }
    })
    return reqAr;
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.medicalHistoryParam);
    this.resetError();
    if (isValid) {
      const reqData = {
        apiRequest: this.getReqObj(data),
      }
      await this.profileService.updateFamilyMedicalHistory(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.medicalHistoryError = err.error.message;
        })
    }
  }

  addMedicalHistoryDetails() {
    this.setForm()
  }

  addMedicalHistory(index: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.medicalHistoryParam);
    if (isValid) {
      let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
      const control: any = controlArray.controls[index];
      if (control.controls.actionIndicator.value === "" && control.controls.diseaseName.value === "" && control.controls.historyNotes.value === "" && control.controls.relation.value === "") {
        control.controls.actionIndicator.setValue("");
      } else if (control.controls.actionIndicator.value === "") {
        control.controls.actionIndicator.setValue("ADD");
      } else if (this.getLabel(index) === "Update") {
        control.controls.actionIndicator.setValue("UPD");
      } else {
        control.controls.actionIndicator.setValue("ADD");
      }
      if (!control.controls.dataSet.value) {
        control.controls.dataSet.setValue(true);
      }
    }
  }

  editMedicalHistory(index: any) {
    let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index];
    control.controls.dataSet.setValue(false);
  }

  deleteMedicalHistory(index: any) {
    let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index];
    if (this.getLabel(index) === "Update") {
      control.controls.actionIndicator.setValue("DEL");
    } else {
      controlArray.removeAt(index)
    }
    if (controlArray.controls.filter((data: any) => data.value.actionIndicator !== "DEL").length === 0) {
      this.addMedicalHistoryDetails();
    }
  }

  isDisbaled(index: any) {
    let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index];
    if (!control.controls.dataSet.value) {
      return false;
    }
    return true;
  }

  getLabel(index: any) {
    let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index];
    const isHistorySelected = control.controls.isApi.value;
    if (!isHistorySelected) {
      return "Add";
    }
    return "Update";
  }

  checkValidData(index?: any) {
    let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index];;
    if (control.controls.isApi.value) {
      if (!control.controls.relation.value) {
        control.controls["relation"].setValidators([
          Validators.required
        ])
        control.controls["relation"].updateValueAndValidity();
      }
      if (!control.controls.diseaseName.value) {
        control.controls["diseaseName"].setValidators([
          Validators.required
        ])
        control.controls["diseaseName"].updateValueAndValidity();
      }
    } else if (control.controls.relation.value || control.controls.diseaseName.value || control.controls.historyNotes.value) {
      control.controls["relation"].setValidators([
        Validators.required
      ])
      control.controls["relation"].updateValueAndValidity();
      control.controls["diseaseName"].setValidators([
        Validators.required
      ])
      control.controls["diseaseName"].updateValueAndValidity();
    }
  }

  isdeleted(index: any) {
    let controlArray = <FormArray>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index];
    if (control.controls.actionIndicator.value === "DEL") {
      return false;
    }
    return true;
  }

  getController(index: any, controlName: any) {
    let controlArray = <any>this.medicalHistoryParam.controls["familyMedicalHistoryDetailList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control;
  }

}
