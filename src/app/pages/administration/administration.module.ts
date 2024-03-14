import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdministrationRoutingModule } from './administration-routing.module';
import { AdministrationComponent } from './administration.component';
import { ValidationMessageModule } from 'src/app/components/validation-message/validation-message/validation-message.module';
import { NgOtpInputModule } from 'ng-otp-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HeaderModule } from 'src/app/components/header/header.module';
import { AdministrationMenuSidebarModule } from 'src/app/components/administration-menu-sidebar/administration-menu-sidebar.module';
import { MyAssignmentComponent } from './my-assignment/my-assignment.component';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { AuthorisedSignatoryAdditionComponent } from '../home/authorised-signatory-addition/authorised-signatory-addition.component';
import { AnamnesisSetupComponent } from './anamnesis-setup/anamnesis-setup.component';
import { CaseAssignmentComponent } from '@pages/administration/case-assignment/case-assignment.component';
import { AnamnesisSetupServiceService } from '@services/anamnesis-setup-service.service';
import { CaseAssignmentService } from '@services/case-assignment.service';
import { PhysicianConsultationPrescriptionDataEntryComponent } from 'src/app/components/physician-consultation-prescription-data-entry/physician-consultation-prescription-data-entry.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PrescriptionDataEntryService } from '@services/prescription-data-entry.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ViewMoreTextComponentComponent } from 'src/app/components/view-more-text-component/view-more-text-component.component';
import { ViewMoreTextModule } from 'src/app/components/view-more-text-component/view-more-text.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { ViewFileModule } from 'src/app/components/view-file/view-file.module';
import { ViewCaseLogModule } from 'src/app/components/view-case-log/view-case-log.module';
import { AddressModalModule } from 'src/app/components/address-modal/address-modal.module';
import { CompanyInformationApprovalComponent } from 'src/app/components/company-information-approval/company-information-approval.component';
import { CompanyInformationApprovalService } from '@services/company-information-approval.service';
import { PersonalInformationApprovalComponent } from 'src/app/components/personal-information-approval/personal-information-approval.component';
import { PhysicianCredentialApprovalComponent } from 'src/app/components/physician-credential-approval/physician-credential-approval.component';
import { DocumentApprovalService } from '@services/document-approval.service';
import { PersonalInformationApprovalService } from '@services/personal-information-approval.service';
import { PhysicianCredentialApprovalService } from '@services/physician-credential-approval.service';
import { AuthorisedSignatoryAddService } from '@services/authorised-signatory-add.service';
import { FileUploadService } from '@services/fileUpload.service';
import { LabtestReportUploadComponent } from 'src/app/components/labtest-report-upload/labtest-report-upload.component';
import { LabtestReportUploadService } from '@services/labtest-report-upload.service';
import { MedicineEntryComponent } from '@pages/administration/medicine-entry/medicine-entry.component';
import { MedicineEntryService } from '@services/medicine-entry.service';
import { AutocompletePositionDirective } from 'src/app/directives/autocomplete-position-directive.directive';
import { AuthorisedSignatoryApprovalComponent } from 'src/app/components/authorised-signatory-approval/authorised-signatory-approval.component';
import { NewCaseRegitrationComponent } from './new-case-regitration/new-case-regitration.component';
import { NewCaseRegistrationService } from '@services/new-case-registration.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { WorkRequestComponent } from './work-request/work-request.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HouseholdItemComponent } from './household-item/household-item.component';
import { WorkRequestPopupComponent } from 'src/app/components/work-request-popup/work-request-popup.component';
import { PhysicianConsultationComponent } from 'src/app/components/physician-consultation/physician-consultation.component';
import { LaboratoryTestAppointmentComponent } from 'src/app/components/laboratory-test-appointment/laboratory-test-appointment.component';
import { HealthEquipmentService } from '@services/health-equipment.service';
import { SupplierRequisitionComponent } from './supplier-requisition/supplier-requisition.component';
import { OrderPickupComponent } from './order-pickup/order-pickup.component';
import { SupplierRequisitionConfirmationComponent } from 'src/app/components/supplier-requisition-confirmation/supplier-requisition-confirmation.component';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { InvoiceComponent } from './invoice/invoice.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { DeliveryPickupComponent } from './delivery-pickup/delivery-pickup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { GetFile, TruncPrice } from '@pipes/all-pipes/all-pipes';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';
import { DeliveryAgentAssignmentComponent } from './delivery-agent-assignment/delivery-agent-assignment.component';
import { ViewMyCartService } from '@services/view-my-cart.service';
import { DashboardService } from '@services/dashboard.service';
import { DemoComponent } from './demo/demo.component';
import { ProfileService } from '@services/profile.service';
import { PaymentApprovalComponent } from './payment-approval/payment-approval.component';
import { PaymentService } from '@services/payment.service';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { InventoryBalanceReportComponent } from './inventory-balance-report/inventory-balance-report.component';
import { InventoryBalanceReportService } from '@services/inventory-balance-report.service';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { ExcelService } from '@services/exel.service';
import { PhysicianEditionComponent } from 'src/app/components/physician-edition/physician-edition.component';
import { AddNewEntityComponent } from 'src/app/components/add-new-entity/add-new-entity.component';
import { DrawingComponent } from 'src/app/components/drawing/drawing.component';
import { DrugsRegisterSheetComponent } from './drugs-register-sheet/drugs-register-sheet.component';
import { UtilityService } from '@services/utility.service';
import { CommonService } from '@services/common.service';
import { WorkDashboardComponent } from './work-dashboard/work-dashboard.component';


@NgModule({
  declarations: [
    AdministrationComponent,
    MyAssignmentComponent,
    DeliveryAgentModalComponent,
    AuthorisedSignatoryApprovalComponent,
    CaseAssignmentComponent,
    AnamnesisSetupComponent,
    PhysicianConsultationPrescriptionDataEntryComponent,
    LabtestReportUploadComponent,
    CompanyInformationApprovalComponent,
    PersonalInformationApprovalComponent,
    PhysicianCredentialApprovalComponent,
    MedicineEntryComponent,
    AutocompletePositionDirective,
    NewCaseRegitrationComponent,
    WorkRequestComponent,
    HouseholdItemComponent,
    WorkRequestPopupComponent,
    PhysicianConsultationComponent,
    LaboratoryTestAppointmentComponent,
    SupplierRequisitionComponent,
    OrderPickupComponent,
    SupplierRequisitionConfirmationComponent,
    InvoiceComponent,
    ViewInvoiceComponent,
    DeliveryPickupComponent,
    DashboardComponent,
    SalesDashboardComponent,
    DeliveryAgentAssignmentComponent,
    DemoComponent,
    PaymentApprovalComponent,
    InventoryBalanceReportComponent,
    SalesReportComponent,
    PhysicianEditionComponent,
    AddNewEntityComponent,
    DrawingComponent,
    DrugsRegisterSheetComponent,
    WorkDashboardComponent
  ],
  imports: [
    AdministrationRoutingModule,
    CommonModule,
    HeaderModule,
    NgxSpinnerModule,
    NgxMaterialTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NgOtpInputModule,
    ValidationMessageModule,
    AdministrationMenuSidebarModule,
    PdfViewerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    ViewMoreTextModule,
    ViewFileModule,
    ViewCaseLogModule,
    AddressModalModule,
    NgbModule,
    DatePipe,
    AllPipesModule,
    NgxSliderModule,
  ],
  exports: [
    AutocompletePositionDirective
  ],
  providers: [
    AnamnesisSetupServiceService,
    CaseAssignmentService,
    PrescriptionDataEntryService,
    LabtestReportUploadService,
    CompanyInformationApprovalService,
    DocumentApprovalService,
    PersonalInformationApprovalService,
    PhysicianCredentialApprovalService,
    FileUploadService,
    MedicineEntryService,
    NewCaseRegistrationService,
    AuthorisedSignatoryAddService,
    DatePipe,
    HealthEquipmentService,
    SupplierRequisitionService,
    ViewMyCartService,
    DashboardService,
    ProfileService,
    PaymentService,
    GetFile,
    ExcelService,
    InventoryBalanceReportService,
    UtilityService,
    CommonService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' }
  ]
})
export class AdministrationModule { }
