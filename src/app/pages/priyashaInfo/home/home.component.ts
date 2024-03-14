import { AfterViewChecked, Output, EventEmitter, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from '@services/form.service';
import { ToastrService } from 'ngx-toastr';
import { PriyaInfiSystemsService } from '@services/priya-infi-systems.service';
import { DatePipe } from '@angular/common';
import { IF_LOGIN_ALLOW } from '@constant/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewChecked, OnDestroy {

 

  @ViewChild('Banner', { static: false }) Banner: any;
  @ViewChild('servicesList', { static: false }) servicesList: any;
  @ViewChild('servicesStep', { static: false }) servicesStep: any;
  @ViewChild('recentPosts', { static: false }) recentPosts: any;
  @ViewChild('contactForm', { static: false }) contactForm: any;

  activeMenu: string = "";
  ShowBlog: number = 0;
  atcivetype: boolean = true;
  dinamicText: string = '';
  dinamictestOptionArray: any = ['Anytime', 'Anywhere', 'Available', 'Accessible', 'Affordable'];
  action: boolean = false;
  contactFormGroup: FormGroup;
  errMsg: any;
  currentDate: any = new Date();
  prod: boolean = IF_LOGIN_ALLOW;
  commingSoonPopUp: boolean = false;
  termNCndPopUp: boolean = false;
  currentWord: string = '';
  currentLetterIndex: number = 0;
  routeData: any;
  divId: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private priyaInfiSystemsService: PriyaInfiSystemsService,
    private datePipe: DatePipe,
  ) {
    this.setContactForm();
    this.routeData = this.router.getCurrentNavigation()!.extras.state;
    if (this.routeData?.divId) {
      this.divId = this.routeData?.divId
    }
  }

  async openBlog(blogIndex:number) {
    const state = {
      blogIndex:blogIndex
    }
    const extras = { skipLocationChange: false, state };
    this.router.navigate(['/blog'],extras)
    
   }
  ngOnDestroy(): void {
    this.action = false;
  }

  populateWords() {
    if (this.currentWord.length < this.dinamictestOptionArray[this.currentLetterIndex].length) {
      this.currentWord = this.dinamictestOptionArray[this.currentLetterIndex].slice(0, this.currentWord.length + 1);
      setTimeout(() => this.populateWords(), 400);
    } else {
      this.currentLetterIndex++;
      if (this.currentLetterIndex >= this.dinamictestOptionArray.length) {
        this.currentLetterIndex = 0;
      }
      this.currentWord = '';
      setTimeout(() => this.populateWords(), 1000);
    }
  }

  // async startTimer() {
  //   if (this.action) {
  //     this.dinamicText = ''
  //     for (let index = 0; index < this.dinamictestOptionArray.length; index++) {
  //       this.dinamicText = ''
  //       this.typeWriter(this.dinamictestOptionArray[index])
  //       await this.delay1(this.dinamictestOptionArray[index].length * 200 + 2000)
  //     }
  //     await this.startTimer()
  //   }
  // }

  // async typeWriter(res: any) {
  //   for (let index = 0; index < res.length; index++) {
  //     this.dinamicText = this.dinamicText + res[index]
  //     await this.delay(200)
  //   }
  // }

  delay = async (ms = 1000) =>
    new Promise(resolve => setTimeout(resolve, ms))

  delay1 = async (ms = 10000) =>
    new Promise(resolve => setTimeout(resolve, ms))

  Servicetext = [
    {
      Text: `Our main service is the project “Anamnesis: Myhealthbook” and “Senescence Care”
    that aims healthcare digitisation.
   ` }
  ]

  blogBox = [
    { image: 'big-brother', title: 'Everything you need to know about Lasik', time: '2024-02-23T06:30:00.000Z' },
    { image: 'ophthalmologist', title: 'Glaucoma- Another name for Blindness', time: '2024-02-20T06:30:00.000Z' },
    { image: 'diana-polekhina', title: 'How can the HPV vaccine help with cervical cancer?', time: '2024-02-15T06:30:00.000Z' },
    { image: 'donn-gabriel', title: 'Smoking and eye health: Everything you need to know', time: '2024-02-10T06:30:00.000Z' },
  ]

  ngOnInit(): void {
    // window.scrollTo(0, 0);
    this.action = true;
    this.populateWords();
    // this.startTimer();
    this.contactFormGroup.get('contactNumber')?.valueChanges.subscribe(res => {
      if (res) {
        if (!this.commonService.checkUserNumber(res)) {
          this.contactFormGroup.get('contactNumber')?.setValue('')
        }
      }
    })
    this.contactFormGroup.get('firstName')?.valueChanges.subscribe(res => {
      if (res) {
        if (!this.commonService.checkUserName(res)) {
          this.contactFormGroup.get('firstName')?.setValue('')
        }
      }
    })
    this.contactFormGroup.get('middleName')?.valueChanges.subscribe(res => {
      if (res) {
        if (!this.commonService.checkUserName(res)) {
          this.contactFormGroup.get('middleName')?.setValue('')
        }
      }
    })
    this.contactFormGroup.get('lastName')?.valueChanges.subscribe(res => {
      if (res) {
        if (!this.commonService.checkUserName(res)) {
          this.contactFormGroup.get('lastName')?.setValue('')
        }
      }
    })
  }

  ngAfterViewChecked() {
    if (this.divId) {
      setTimeout(() => this.scrollToDiv(this.divId), 50);
    }
  }

  timeDiff(data: any) {
    const blogDateTime: any = new Date(data).getTime()
    const currentDateTime: any = this.currentDate.getTime()
    const timeDiff = Math.floor((currentDateTime - blogDateTime) / 1000);
    if (timeDiff < 60) {
      return 'Now'
    } else if (timeDiff > 59 && timeDiff < 3600) {
      return `${Math.trunc(timeDiff / 60)} ${Math.trunc(timeDiff / 60) > 1 ? 'minutes' : 'minute'} ago`
    } else if (timeDiff > 3599 && timeDiff < 86400) {
      return `${Math.trunc((timeDiff / 60) / 60)} ${Math.trunc((timeDiff / 60) / 60) > 1 ? 'Hours' : 'Hour'} ago`
    } else if (timeDiff > 86399 && timeDiff < 604799) {
      return `${Math.trunc((timeDiff / 60) / 60 / 24)} ${Math.trunc((timeDiff / 60) / 60 / 24) > 1 ? 'Days' : 'Day'} ago`
    } else if (timeDiff > 604799) {
      return `${this.datePipe.transform(blogDateTime, 'dd MMM yyyy')}`
    } else {
      return `${this.datePipe.transform(blogDateTime, 'dd MMM yyyy')}`
    }
  }

  isApiError(response: any) {
    if (!response.anamnesisErrorList || (response.anamnesisErrorList.anErrorCount > 0 && response.anamnesisErrorList.anErrorList.length > 0)) {
      return true;
    }
    return false;
  }

  saveContactForm = async () => {
    this.formService.markFormGroupTouched(this.contactFormGroup);
    if (this.contactFormGroup.valid) {
      await this.priyaInfiSystemsService.contactUs(this.contactFormGroup.value)
        .then(async (res: any) => {
          if (!this.isApiError(res)) {
            if (res.apiResponse.transactionResult === 'Success') {
              this.contactFormGroup.reset()
              this.toastr.success('Thank you for contacting us. We will get back to you shortly.')
            }
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if (err.status !== 401) {
            this.toastr.error('Somthing went wrong')
          }
        })
    }
  }

  setContactForm() {
    this.contactFormGroup = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      emailID: ['', [Validators.required, Validators.email]],
      customerMessage: [''],
    })
    this.errMsg = {
      firstName: {
        required: 'First name is required'
      },
      lastName: {
        required: 'Last name is required'
      },
      contactNumber: {
        required: 'Contact number is required',
        maxLength: '',
        minLength: ''
      },
      emailID: {
        required: 'emailID is required',
        email: 'Please enter Valid email'
      }
    }
  }

  navigateTo(key: string) {
    if (!this.prod && key === 'login') {
      this.commingSoonPopUp = true;
    } else {
      this.activeMenu = key;
      this.router.navigate([`/${key}`], { skipLocationChange: key === 'blog' ? false : true });
    }
  }

  scrollToDiv(id: any) {
    if (id === 'Banner') {
      const element = this.Banner.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (id === 'servicesList') {
      const element = this.servicesList.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (id === 'servicesStep') {
      const element = this.servicesStep.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (id === 'recentPosts') {
      const element = this.recentPosts.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (id === 'contactForm') {
      const element = this.contactForm.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (id === 'Login') {
      this.commingSoonPopUp = true;
    }
    this.divId = ''
  }

  closeCommingSoonPopUp() {
    this.commingSoonPopUp = false;
  }

  openTermNCndPopUp() {
    this.termNCndPopUp = true;
  }
  closeTermNCndPopUp() {
    this.termNCndPopUp = false;
  }

}


