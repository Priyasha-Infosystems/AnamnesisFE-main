import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { AuthorizePrescriptionComponent } from './authorize-prescription/authorize-prescription.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DiagnosticCenterScheduleComponent } from './diagnostic-center-schedule/diagnostic-center-schedule.component';
import { HomeComponent } from './home.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { MedicineEntryComponent } from '../administration/medicine-entry/medicine-entry.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { PhysicianScheduleComponent } from './physician-schedule/physician-schedule.component';
import { SecurityQuestionComponent } from './security-question/security-question.component';
import { UploadHealthDocumentComponent } from './upload-health-document/upload-health-document.component';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { ViewMyCartComponent } from './view-my-cart/view-my-cart.component';
import { AuthorisedSignatoryAdditionComponent } from './authorised-signatory-addition/authorised-signatory-addition.component';
import { PhysicianCalendarComponent } from './physician-calendar/physician-calendar.component';
import { GeneralMedicalInformationUpdateComponent } from './general-medical-information-update/general-medical-information-update.component';
import { MyOrderListComponent } from './my-order-list/my-order-list.component';
import { LabtestReportCreatComponent } from './labtest-report-creat/labtest-report-creat.component';
import { PriceSetupComponent } from './price-setup/price-setup.component';
import { WalletComponent } from './wallet/wallet.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'my-profile',
        component: MyProfileComponent,
      },
      {
        path: 'upload-health-document',
        component: UploadHealthDocumentComponent,
      },
      {
        path: 'manage-address',
        component: ManageAddressComponent,
      },
      {
        path: 'authorize-prescription',
        component: AuthorizePrescriptionComponent,
      },
      {
        path: 'user-setup',
        component: UserSetupComponent,
      },
      {
        path: 'add-schedule',
        component: AddScheduleComponent,
      },
      {
        path: 'physician-schedule',
        component: PhysicianScheduleComponent,
      },
      {
        path: 'security-question',
        component: SecurityQuestionComponent,
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'diagnostic-center-schedule',
        component: DiagnosticCenterScheduleComponent,
      },
      {
        path: 'view-my-cart',
        component: ViewMyCartComponent,
      },
      {
        path: 'auth-signatory-addition',
        component: AuthorisedSignatoryAdditionComponent,
      },
      {
        path: 'physician-calendar',
        component: PhysicianCalendarComponent,
      },
      {
        path: 'general-medical-information-update',
        component: GeneralMedicalInformationUpdateComponent,
      },
      {
        path: 'my-order-list',
        component: MyOrderListComponent,
      },
      {
        path: 'labtest-report-creat',
        component: LabtestReportCreatComponent,
      },
      {
        path: 'price-setup',
        component: PriceSetupComponent,
      },
      {
        path: 'wallet',
        component: WalletComponent,
      },
      {
        path: 'welcome',
        component: WelcomePageComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
