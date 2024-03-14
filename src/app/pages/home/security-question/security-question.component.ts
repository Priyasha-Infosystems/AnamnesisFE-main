import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { SecurityQuestionService } from '@services/securityQuestions.service';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { isSecQuestionSet } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
  styleUrls: ['./security-question.component.css']
})
export class SecurityQuestionComponent implements OnInit {

  questionsList: any = [];
  setQuestionsList: any = [];
  public securityQuestionForm: FormGroup;
  addedQuestions: any = [];
  deletedQuestions: any = [];
  selectedQuestionIds: any = [];
  formLength: number = 0;
  public errorMessage: any = {};

  constructor(
    public secQuestionService: SecurityQuestionService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private store: Store<any>,
  ) {
    this.securityQuestionForm = this.fb.group({
      securityQuestionsList: this.fb.array([]),
    })
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getUserSecQuestionList();
    this.intializingMessage();
  }

  clearAll() {
    this.securityQuestionForm.reset()
    this.getSecurityQuestionformList().clear()
  }

  private intializingMessage() {
    this.errorMessage.secQuestionAnswer = {
      required: "Please answer to the selected security question"
    };
  }

  setForm() {
    var parentData: FormGroup = this.fb.group({
      secQuestionID: [0],
      secQuestionDescription: [''],
      secQuestionAnswer: [{ value: '', disabled: true }],
      secQuestionSeqNo: [''],
      actionIndicator: [''],
      dataSet: [false]
    })
    this.getSecurityQuestionformList().push(parentData)
  }

  async setData() {
    this.formLength = this.setQuestionsList.length === 0 ? this.setQuestionsList.length + 1 : this.setQuestionsList.length;
    for (let i = 0; i < this.formLength; i++) {
      this.setForm();
    }
    let i = 0;
    this.setQuestionsList.forEach((val: any) => {
      let controlArray = <FormArray>this.securityQuestionForm.controls["securityQuestionsList"];
      controlArray.controls[i].patchValue(val);
      const control: any = controlArray.controls[i];
      control.controls.secQuestionAnswer.value = "";
      control.controls.dataSet.setValue(true);
      control.controls.secQuestionAnswer.enable();
      i++;
    })
  }

  getSecurityQuestionformList() {
    return this.securityQuestionForm.get('securityQuestionsList') as FormArray
  }

  async GetUserSecQuestions() {
    await this.secQuestionService.GetUserSecQuestions()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.setQuestionsList = res.apiResponse.userSecQuestionsList;
          this.setQuestionsList.forEach((ql: any) => {
            this.selectedQuestionIds.push(ql.secQuestionID);
          })
          this.setData();
          if (this.setQuestionsList && this.setQuestionsList.length > 0) {
            this.store.dispatch(new isSecQuestionSet(true));
          }
        } else {
          this.setQuestionsList = []
        }
      })
      .catch((err: any) => {
      })
  }

  async getUserSecQuestionList() {
    await this.secQuestionService.GetAllSecQuestions()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.questionsList = res.apiResponse.secQuestionDetailsList
          this.addedQuestions = [];
          this.deletedQuestions = [];
          this.selectedQuestionIds = [];
          this.GetUserSecQuestions();
        } else {
          this.questionsList = []
        }
      })
      .catch((err: any) => {
      })
  }

  getReqObj() {
    const reqObj: any = {
      userSecQuestionCount: this.addedQuestions.length + this.deletedQuestions.length,
      userSecQuestionList: [...this.addedQuestions, ...this.deletedQuestions],
    }
    if (reqObj.userSecQuestionCount > 0) {
      reqObj.userSecQuestionList.forEach((reqQuestion: any) => {
        reqQuestion.secQuestionID = +reqQuestion.secQuestionID;
        delete reqQuestion.dataSet;
      })
    }
    return reqObj;
  }

  async handleSubmit(questionObj: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.securityQuestionForm);
    if (isValid) {
      this.addedQuestions = [];
      questionObj.securityQuestionsList.forEach((data: any) => {
        if (+data.secQuestionID > 0 && (data.actionIndicator === "ADD" || data.actionIndicator === "UPD")) {
          this.addedQuestions.push(data)
        }
      })
      if (this.addedQuestions.length !== 0 || this.deletedQuestions.length !== 0) {
        const reqData = {
          apiRequest: this.getReqObj(),
        }
        await this.secQuestionService.SecQuestionSetup(reqData)
          .then(async (res: any) => {
            if (!this.commonService.isApiError(res)) {
              this.clearAll();
              this.getUserSecQuestionList();
              this.toastr.success("Security question updated successfully");
            } else {
              this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
            }
          })
          .catch((err: any) => {
          })
      } else {
        this.toastr.error("Nothing to update");
      }
    }
  }

  onChangeQuestion(index: any) {
    let controlArray = <FormArray>this.securityQuestionForm.controls["securityQuestionsList"];
    const control: any = controlArray.controls[index];
    const filterQuestion = this.questionsList.find((q: any) => +q.secQuestionID === +control.controls.secQuestionID.value);
    control.controls.secQuestionAnswer.setValue("");
    control.controls.secQuestionSeqNo.setValue(index + 1);
    this.selectedQuestionIds[index] = filterQuestion.secQuestionID;
    const deletedSetQuestion = this.setQuestionsList.find((ques: any) => ques.secQuestionDescription === control.controls.secQuestionDescription.value)
    if (deletedSetQuestion && control.controls.dataSet.value) {
      deletedSetQuestion.actionIndicator = "DEL"
      this.deletedQuestions.push(deletedSetQuestion);
    }
    if (filterQuestion) {
      control.controls.secQuestionDescription.setValue(filterQuestion.secQuestionDescription);
      control.controls.secQuestionAnswer.enable()
      control.controls.secQuestionAnswer.setValidators([
        Validators.required,
      ]);
      control.controls.secQuestionAnswer.updateValueAndValidity();
    } else {
      control.controls.secQuestionDescription.setValue("Select security Question from the list");
      control.controls.secQuestionAnswer.disable()
      control.controls.secQuestionAnswer.setValidators([]);
      control.controls.secQuestionAnswer.updateValueAndValidity();
    }
    control.controls.dataSet.setValue(false);
  }

  addSecQuestion() {
    let controlArray = <FormArray>this.securityQuestionForm.controls["securityQuestionsList"];
    if(controlArray.at(controlArray.length-1).getRawValue().secQuestionAnswer ||controlArray.at(controlArray.length-1).getRawValue().secQuestionSeqNo){
      if (controlArray.controls.length < 5) {
        this.setForm();
      }else{
        if (controlArray.controls.length < 5) {
          this.setForm();
        }else{
          this.toastr.info('You can add upto 5 security questions');
        }
      }
    }else{
      this.toastr.info('Please provide answers for all previously added questions');
    }
   
  }

  onChangeAnswer(index: any) {
    let controlArray = <FormArray>this.securityQuestionForm.controls["securityQuestionsList"];
    const control: any = controlArray.controls[index];
    const isDeletedQuestion = this.setQuestionsList.find((ques: any) => ques.secQuestionDescription === control.controls.secQuestionDescription.value)
    if (control.controls.secQuestionAnswer.value !== "") {
      if (!isDeletedQuestion) {
        control.controls.actionIndicator.setValue("ADD");
      } else {
        control.controls.actionIndicator.setValue("UPD");
      }
    } else {
      control.controls.actionIndicator.setValue("");
    }
  }

  getPlaceholder(index: any) {
    let controlArray = <FormArray>this.securityQuestionForm.controls["securityQuestionsList"];
    const control: any = controlArray.controls[index];
    let isUpdated: boolean = false;
    if (control.controls.dataSet.value) {
      isUpdated = true;
    }
    return isUpdated;
  }

  getController(index: any, controlName: any) {
    let controlArray = <any>this.securityQuestionForm.controls["securityQuestionsList"];
    const control: any = controlArray.controls[index].controls[controlName];
    return control;
  }

  isSelectedQuestion(index: any) {
    if (this.selectedQuestionIds.indexOf(index) >= 0) {
      return true;
    }
    return false;
  }
}
