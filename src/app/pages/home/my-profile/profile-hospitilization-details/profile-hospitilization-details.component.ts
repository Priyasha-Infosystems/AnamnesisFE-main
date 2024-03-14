import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { ProfileService } from '@services/profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-hospitilization-details',
  templateUrl: './profile-hospitilization-details.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileHospitilizationDetailsComponent implements OnInit {

  public hospitalisationParam: FormGroup;
  hospitalisationError: any = "";
  errorMessage: any = {};
  defaultHospitalisationDetails: any;
  currentDate: any;

  @Output()
  updateSave: EventEmitter<{}> = new EventEmitter<{}>();

  @Input() profileIndex: any

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private formService: FormService,
    private toastr: ToastrService,
    public datePipe: DatePipe,
  ) {
    this.getLocalTime();
    this.hospitalisationParam = this.fb.group({
      hospitalisationDetailsInfoList: this.fb.array([]),
    })
  }

  getLocalTime() {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-US');
    const localTime = now.toLocaleTimeString();
    const dateTime = `${localDate} ${localTime}`;
    const localDateTime = new Date(dateTime);
    const timestamp = localDateTime.getTime();
    this.currentDate = timestamp;
  }

  setForm() {
    var parentData: FormGroup = this.fb.group({
      hospitalisationDate: [''],
      hospitalisationReason: [{ value: '', disabled: true }],
      actionIndicator: [''],
      showHospitalisationDate: [''],
      dataSet: [false],
      isApi: [false],
      uniqueID: ['']
    })
    this.getHospitalisationList().push(parentData);
  }

  checkValidDate(index?: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const controls: any = controlArray.controls[index];
    if (index) {
      const dateControl: any = controlArray.controls[index].get('hospitalisationDate');
      if (dateControl!.value && new Date(dateControl!.value).getTime() > this.currentDate) {
        dateControl!.setValue('');
        controls.controls.hospitalisationReason.disable();
      } else {
        controls.controls.hospitalisationReason.enable();
      }
    }
    const control = controlArray.controls;
    control.forEach((cntr: any) => {
      if ((cntr.controls.hospitalisationDate.touched && cntr.value.hospitalisationDate === "") || (cntr.value.hospitalisationDate === "" && cntr.value.hospitalisationReason !== "") || (cntr.value.hospitalisationDate === "" && cntr.value.isApi)) {
        cntr.controls["hospitalisationDate"].setValidators([
          Validators.required
        ])
        cntr.controls["hospitalisationDate"].updateValueAndValidity();
        cntr.controls.hospitalisationReason.disable();
      } else {
        cntr.controls["hospitalisationDate"].setValidators([])
        cntr.controls["hospitalisationDate"].updateValueAndValidity();
        cntr.controls.hospitalisationReason.enable();
      }
    })
  }

  getSetDate(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const dateControl: any = controlArray.controls[index].get('hospitalisationDate');
    return dateControl.value ? this.datePipe.transform(dateControl.value, 'dd-MM-y') : '';
  }

  async setData(data: any) {
    for (let i = 0; i < data.length; i++) {
      this.setForm();
    }
    let i = 0;
    data.forEach((val: any) => {
      let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
      val.showHospitalisationDate = val.hospitalisationDate && val.hospitalisationDate.length > 0 ? this.datePipe.transform(val.hospitalisationDate, 'dd-MM-y') : '';
      controlArray.controls[i].patchValue(val);
      const control: any = controlArray.controls[i];
      control.controls.dataSet.setValue(true);
      control.controls.isApi.setValue(true);
      i++;
    })
  }

  getHospitalisationList() {
    return this.hospitalisationParam.get('hospitalisationDetailsInfoList') as FormArray
  }

  resetError() {
    this.hospitalisationError = "";
  }

  onChanges(): void {
    this.hospitalisationParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  ngOnInit(): void {
    this.getHospitilizationDetails();
    this.onChanges()
    this.intializingMessage();
  }

  intializingMessage() {
    this.errorMessage.hospitalisationDate = {
      pattern: "Please enter a valid date",
      required: "Hospitalisation date is required"
    };
    this.errorMessage.hospitalisationReason = {
      required: "Hospitalisation reason is required"
    };
  }

  getHospitilizationDetails = async () => {
    await this.profileService.getPreviousHospitalisationInfo()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.defaultHospitalisationDetails = [...res.apiResponse];
          const hospitalisationDetails = [...res.apiResponse];
          if (hospitalisationDetails.length > 0) {
            this.setData(hospitalisationDetails);
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
    reqData.hospitalisationDetailsInfoList.forEach((data: any) => {
      delete data.dataSet;
      if (data.actionIndicator === "" && (data.hospitalisationDate || data.hospitalisationReason)) {
        data.actionIndicator = "ADD"
      }
      if (data.actionIndicator !== "GET") {
        reqAr.push(data)
      }
    })
    return reqAr;
  }

  async save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.hospitalisationParam);
    this.resetError();
    if (isValid) {
      const reqData = {
        apiRequest: this.getReqObj(data),
      }
      await this.profileService.updatePreviousHospitalisationInfo(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.updateSave.emit();
            this.toastr.success("Data updated successfully");
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
          }
        })
        .catch((err: any) => {
          this.hospitalisationError = err.error.message;
        })
    }
  }

  addHospitalizationDetails() {
    this.setForm()
  }

  addHospitalisation(index: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.hospitalisationParam);
    if (isValid) {
      let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
      const control: any = controlArray.controls[index];
      if (control.controls.actionIndicator.value === "" && control.controls.hospitalisationDate.value === "" && control.controls.hospitalisationReason.value === "") {
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

  editHospitalisation(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index];
    control.controls.dataSet.setValue(false);
    control.controls.hospitalisationReason.enable();
  }

  deleteHospitalisation(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index];
    if (this.getLabel(index) === "Update") {
      control.controls.actionIndicator.setValue("DEL");
    } else {
      controlArray.removeAt(index)
    }
    if (controlArray.controls.filter((data: any) => data.value.actionIndicator !== "DEL").length === 0) {
      this.addHospitalizationDetails();
    }
  }

  isDisbaled(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index];
    if (!control.controls.dataSet.value) {
      return false;
    }
    return true;
  }

  isHosResDisbaled(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index];
    if (control.controls.hospitalisationReason.status === "DISABLED") {
      return true;
    }
    return false;
  }

  getLabel(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index];
    const isHostSelected = control.controls.isApi.value
    if (!isHostSelected) {
      return "Add";
    }
    return "Update";
  }

  isdeleted(index: any) {
    let controlArray = <FormArray>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index];
    if (control.controls.actionIndicator.value === "DEL") {
      return false;
    }
    return true;
  }

  getController(index: any, controlName: any) {
    let controlArray = <any>this.hospitalisationParam.controls["hospitalisationDetailsInfoList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control;
  }

}
