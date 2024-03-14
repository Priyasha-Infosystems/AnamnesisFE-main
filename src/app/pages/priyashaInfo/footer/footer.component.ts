import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../services/common.service';
import { PriyaInfiSystemsService } from '@services/priya-infi-systems.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  activeMenu: string = "";
  subscritionForm:FormGroup;
  errMsg:any;
  currentDate:any = new Date();
  @Input()
  prod:boolean;
  @Output()
  navigate: EventEmitter<{}> = new EventEmitter<{}>();
  @Output()
  termNCnd: EventEmitter<{}> = new EventEmitter<{}>();
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private priyaInfiSystemsService: PriyaInfiSystemsService,
  ) {
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

  navigateTo(key: string) {
    if(!this.prod && key ==='login'){
      this.navigate.emit('Login');
    }else{
      this.activeMenu = key;
    this.router.navigate([`/${key}`], { skipLocationChange: true });
    } 
  }

  openTermNCndPopup(){
    this.termNCnd.emit()
  }
  
}
