import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { COMMING_SOON_DATE } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { FormService } from '@services/form.service';
import { PriyaInfiSystemsService } from '@services/priya-infi-systems.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comming-soon',
  templateUrl: './comming-soon.component.html',
  styleUrls: ['./comming-soon.component.css']
})
export class CommingSoonComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  interval:any;
  days:any;
  hours:number;
  minutes:number;
  seconds:number;
  distance:any;
  subscritionForm:FormGroup;
  errMsg:any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private priyaInfiSystemsService: PriyaInfiSystemsService,
  ) { 
    this.countDown()
    this.subscritionForm = this.fb.group({
      emailID:['',[Validators.required,Validators.email]]
    })
    this.errMsg = {
      email:{
        required:'emailID is required',
        email:'Please enter Valid email'
      }
    }
  }
  ngOnInit(): void {
   
  }

  closeCommingSoonPopUp(){
    this.close.emit(true);
  }

  countDown(){
    var countDownDate = new Date(COMMING_SOON_DATE).getTime();
    this.interval = setInterval(() => {
      var now = new Date().getTime();
      this.distance = countDownDate - now;
      this.days = Math.floor(this.distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((this.distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((this.distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((this.distance % (1000 * 60)) / 1000);
    }, 1000);
  }

  isApiError(response: any) {
    if (!response.anamnesisErrorList || (response.anamnesisErrorList.anErrorCount > 0 && response.anamnesisErrorList.anErrorList.length > 0)) {
      return true;
    }
    return false;
  }

  saveContactForm = async () =>{
    this.formService.markFormGroupTouched(this.subscritionForm);
    if(this.subscritionForm.valid){
      await this.priyaInfiSystemsService.subscribe(this.subscritionForm.value)
      .then(async (res: any) => {
        if (!this.isApiError(res)) {
          if(res.apiResponse.transactionResult === 'Success'){
            this.subscritionForm.reset()
            this.toastr.success('Email id registered successfully for newsletter')
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error('Somthing went wrong')
        }
      })
    }
  }

  resetForm(){
    this.subscritionForm.reset()
  }

}
