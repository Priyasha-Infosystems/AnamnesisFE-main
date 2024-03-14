import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { HeaderModule } from 'src/app/components/header/header.module';
import { MenuSidebarModule } from 'src/app/components/menu-sidebar/menu-sidebar.module';
import { UploadHealthDocumentComponent } from './upload-health-document/upload-health-document.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { AuthorizePrescriptionComponent } from './authorize-prescription/authorize-prescription.component';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { SecurityQuestionComponent } from './security-question/security-question.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AddressModalComponent } from './address-modal/address-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { ValidationMessageModule } from 'src/app/components/validation-message/validation-message/validation-message.module';
import { ToastrModule } from 'ngx-toastr';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { PhysicianScheduleComponent } from './physician-schedule/physician-schedule.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DiagnosticCenterScheduleComponent } from './diagnostic-center-schedule/diagnostic-center-schedule.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MedicineDetailsComponent } from 'src/app/components/medicine-details/medicine-details.component';
import { ApiService } from '@services/api.service';
import { DiagnosticCenterScheduleService } from '@services/diagnostic-center-schedule.service';
import { MedicineSelectionComponent } from 'src/app/components/medicine-selection/medicine-selection.component';
import { ViewMyCartComponent } from './view-my-cart/view-my-cart.component';
import { LabTestSelectionComponent } from 'src/app/components/lab-test-selection/lab-test-selection.component';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { HealthcareEquipmentSelectionComponent } from 'src/app/components/healthcare-equipment-selection/healthcare-equipment-selection.component';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { OrderWithPrescriptionComponent } from 'src/app/components/order-with-prescription/order-with-prescription.component';
import { MedicineEntryComponent } from '../administration/medicine-entry/medicine-entry.component';
import { MedicineEntryService } from '@services/medicine-entry.service';
import { MedicineDetailsService } from '@services/medicine-details.service';
import { OrderWithPrescriptionService } from '@services/order-with-prescription.service';
import { ViewMoreTextComponentComponent } from 'src/app/components/view-more-text-component/view-more-text-component.component';
import { LabTestSelectionService } from '@services/lab-test-selection.service';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ProfilePersonalInformationComponent } from './my-profile/profile-personal-information/profile-personal-information.component';
import { ProfileCompanyInformationComponent } from './my-profile/profile-company-information/profile-company-information.component';
import { ProfilePhysicianCredentialsComponent } from './my-profile/profile-physician-credentials/profile-physician-credentials.component';
import { ProfileDocumentUploadComponent } from './my-profile/profile-document-upload/profile-document-upload.component';
import { ProfileGeneralInformationComponent } from './my-profile/profile-general-information/profile-general-information.component';
import { ProfileHospitilizationDetailsComponent } from './my-profile/profile-hospitilization-details/profile-hospitilization-details.component';
import { ProfileMedicalHistoryComponent } from './my-profile/profile-medical-history/profile-medical-history.component';
import { ProfileEditComponent } from './my-profile/profile-edit/profile-edit.component';
import { ProfileViewComponent } from './my-profile/profile-view/profile-view.component';
import { ViewMoreTextModule } from 'src/app/components/view-more-text-component/view-more-text.module';
import { ProfileBusinessInformationComponent } from './my-profile/profile-business-information/profile-business-information.component';
import { PrescriptionViewComponent } from 'src/app/components/prescription-view/prescription-view.component';
import { PrescriptionViewService } from '@services/prescription-view.service';
import { MedicineDetailsModule } from 'src/app/components/medicine-details/medicine-details.module';
import { PrescriptionViewModule } from 'src/app/components/prescription-view/prescription-view.module';
import { AuthorisedSignatoryAdditionComponent } from '@pages/home/authorised-signatory-addition/authorised-signatory-addition.component';
import { AuthorisedSignatoryAddService } from '@services/authorised-signatory-add.service';
import { PhysicianCalendarComponent } from './physician-calendar/physician-calendar.component';
import { SingleUserSetupComponent } from './user-setup/single-user-setup/single-user-setup.component';
import { BulkUserSetupComponent } from './user-setup/bulk-user-setup/bulk-user-setup.component';
import { UserSetupService } from '@services/user-setup.service';
import { GeneralMedicalInformationUpdateComponent } from './general-medical-information-update/general-medical-information-update.component';
import { GeneralMedicalInfoService } from '@services/general-medical-info.service';
import { PhysicianCalendarService } from '@services/physician-calendar.service';
import { PhysicianScheduleService } from '@services/physician-schedule.service';
import { MyOrderListComponent } from './my-order-list/my-order-list.component';
import { OrderDetailsService } from '@services/order-details.service';
import { OrderDetailsComponent } from 'src/app/components/order-details/order-details.component';
import { CartAddressComponent } from 'src/app/components/cart-address/cart-address.component';
import { LabtestReportCreatComponent } from './labtest-report-creat/labtest-report-creat.component';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarViewComponent } from 'src/app/components/calendar-view/calendar-view.component';
import { MiniCalendarViewComponent } from 'src/app/components/mini-calendar-view/mini-calendar-view.component';
import { MapModule } from 'src/app/components/map/map.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PriceSetupComponent } from './price-setup/price-setup.component';
import { AnamnesisSetupServiceService } from '@services/anamnesis-setup-service.service';
import { HealthcareEquipmentDetailsComponent } from 'src/app/components/healthcare-equipment-details/healthcare-equipment-details.component';
import { HealthcareEquipmentDetailsModule } from 'src/app/components/healthcare-equipment-details/healthcare-equipment-details.module';
import { WalletComponent } from './wallet/wallet.component';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';


@NgModule({
  declarations: [
    HomeComponent,
    MyProfileComponent,
    UploadHealthDocumentComponent,
    ManageAddressComponent,
    AuthorizePrescriptionComponent,
    UserSetupComponent,
    SecurityQuestionComponent,
    ChangePasswordComponent,
    AddressModalComponent,
    AddScheduleComponent,
    PhysicianScheduleComponent,
    DiagnosticCenterScheduleComponent,
    MedicineSelectionComponent,
    ViewMyCartComponent,
    LabTestSelectionComponent,
    HealthcareEquipmentSelectionComponent,
    OrderWithPrescriptionComponent,
    AuthorisedSignatoryAdditionComponent,
    ProfilePersonalInformationComponent,
    ProfileCompanyInformationComponent,
    ProfilePhysicianCredentialsComponent,
    ProfileDocumentUploadComponent,
    ProfileGeneralInformationComponent,
    ProfileHospitilizationDetailsComponent,
    ProfileMedicalHistoryComponent,
    ProfileEditComponent,
    ProfileViewComponent,
    ProfileBusinessInformationComponent,
    PhysicianCalendarComponent,
    SingleUserSetupComponent,
    BulkUserSetupComponent,
    GeneralMedicalInformationUpdateComponent,
    MyOrderListComponent,
    OrderDetailsComponent,
    CartAddressComponent,
    LabtestReportCreatComponent,
    CalendarViewComponent,
    MiniCalendarViewComponent,
    PriceSetupComponent,
    WalletComponent,
    WelcomePageComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    HeaderModule,
    MenuSidebarModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NgOtpInputModule,
    ValidationMessageModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    NgxMaterialTimepickerModule,
    ViewMoreTextModule,
    MedicineDetailsModule,
    HealthcareEquipmentDetailsModule,
    PrescriptionViewModule,
    NgbModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MapModule,
    AllPipesModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    ApiService,
    DiagnosticCenterScheduleService,
    MedicineSelectionService,
    HealthEquipmentService,
    ViewMyCartService,
    MedicineDetailsService,
    OrderWithPrescriptionService,
    LabTestSelectionService,
    PrescriptionViewService,
    AuthorisedSignatoryAddService,
    UserSetupService,
    GeneralMedicalInfoService,
    PhysicianCalendarService,
    PhysicianScheduleService,
    OrderDetailsService,
    LabtestReportUploadService,
    AnamnesisSetupServiceService
  ]
})
export class HomeModule { }
