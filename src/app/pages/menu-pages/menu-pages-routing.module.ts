import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuPagesComponent } from './menu-pages.component';
import { MyHealthReportComponent } from './my-health-report/my-health-report.component';
import { PatientConsultationComponent } from './patient-consultation/patient-consultation.component';

const routes: Routes = [
  {
    path: '',
    component: MenuPagesComponent,
    children: [
      {
        path: 'my-health-report',
        component: MyHealthReportComponent,
      },
      {
        path: 'patient-consultation',
        component: PatientConsultationComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuPagesRoutingModule { }
