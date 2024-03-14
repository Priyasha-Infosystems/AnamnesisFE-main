import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyHealthReportComponent } from './my-health-report/my-health-report.component';
import { PatientConsultationComponent } from './patient-consultation/patient-consultation.component';
import { MenuPagesRoutingModule } from './menu-pages-routing.module';
import { MenuPagesComponent } from './menu-pages.component';
import { HeaderModule } from 'src/app/components/header/header.module';
import { ConsultationReportComponent } from './consultation-report/consultation-report.component';
import { GeneratePrescriptionComponent } from './generate-prescription/generate-prescription.component';
import { PrescriptionDataEntryService } from '@services/prescription-data-entry.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgOtpInputModule } from 'ng-otp-input';
import { ValidationMessageModule } from 'src/app/components/validation-message/validation-message/validation-message.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ViewMoreTextModule } from 'src/app/components/view-more-text-component/view-more-text.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { PrescriptionViewModule } from 'src/app/components/prescription-view/prescription-view.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HealthReportUpdateComponent } from './health-report-update/health-report-update.component';
import { GeneralMedicalInfoService } from '@services/general-medical-info.service';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { SecurityQuestionService } from '@services/securityQuestions.service';

@NgModule({
  declarations: [
    MyHealthReportComponent,
    PatientConsultationComponent,
    MenuPagesComponent,
    ConsultationReportComponent,
    GeneratePrescriptionComponent,
    HealthReportUpdateComponent,
  ],
  imports: [
    CommonModule,
    MenuPagesRoutingModule,
    HeaderModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NgOtpInputModule,
    ValidationMessageModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    ViewMoreTextModule,
    NgxSliderModule,
    PrescriptionViewModule,
    NgbModule,
    AllPipesModule,
  ],
  providers: [
    PrescriptionDataEntryService,
    GeneralMedicalInfoService,
    ViewMyCartService,
    SecurityQuestionService
  ]
})
export class MenuPagesModule { }
