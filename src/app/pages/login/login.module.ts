import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from '../login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { LoginService } from '@services/login.service';
import { ApiService } from '@services/api.service';
import { ValidationMessageModule } from 'src/app/components/validation-message/validation-message/validation-message.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SwiperModule } from 'swiper/angular';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { OtpValidationComponent } from './otp-validation/otp-validation.component';
import { RegularUserSignupComponent } from './regular-user-signup/regular-user-signup.component';
import { CommercialUserSignupComponent } from './commercial-user-signup/commercial-user-signup.component';
import { ToastrModule } from 'ngx-toastr';
import { NgImageSliderModule } from 'ng-image-slider';
import { NgMarqueeModule } from 'ng-marquee';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';

@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    OtpValidationComponent,
    RegularUserSignupComponent,
    CommercialUserSignupComponent,
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    ValidationMessageModule,
    NgxSpinnerModule,
    SwiperModule,
    ToastrModule.forRoot(),
    NgxUsefulSwiperModule,
    NgImageSliderModule,
    NgMarqueeModule,
    NgbModule,
    AllPipesModule
  ],
  providers: [
    LoginService,
    ApiService
  ]
})
export class LoginModule { }
