import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../services/common.service';
import { PriyaInfiSystemsService } from '@services/priya-infi-systems.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm:FormGroup;
  errMsg:any;
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private priyaInfiSystemsService: PriyaInfiSystemsService,
  ) {
    this.contactForm = this.fb.group({
      firstName:['',Validators.required],
      middleName:[''],
      lastName:['',Validators.required],
      contactNumber:['',Validators.required],
      emailID:['',Validators.required],
      contactMessage:[''],
    })
    this.errMsg = {
      firstName:{
        required:'First name is required'
      },
      lastName:{
        required:'Last name is required'
      },
      contactNumber:{
        required:'Contact number is required'
      },
      emailID:{
        required:'emailID is required'
      }
    }
   }
  
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  

}
