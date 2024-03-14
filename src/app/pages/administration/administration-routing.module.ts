import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseAssignmentComponent } from '@pages/administration/case-assignment/case-assignment.component';
import { AdministrationComponent } from './administration.component';
import { AnamnesisSetupComponent } from './anamnesis-setup/anamnesis-setup.component';
import { AuthorisedSignatoryAdditionComponent } from '../home/authorised-signatory-addition/authorised-signatory-addition.component';
import { MyAssignmentComponent } from './my-assignment/my-assignment.component';
import { MedicineEntryComponent } from './medicine-entry/medicine-entry.component';
import { NewCaseRegitrationComponent } from './new-case-regitration/new-case-regitration.component';
import { WorkRequestComponent } from './work-request/work-request.component';
import { HouseholdItemComponent } from './household-item/household-item.component';
import { SupplierRequisitionComponent } from './supplier-requisition/supplier-requisition.component';
import { OrderPickupComponent } from './order-pickup/order-pickup.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { DeliveryPickupComponent } from './delivery-pickup/delivery-pickup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { DeliveryAgentAssignmentComponent } from './delivery-agent-assignment/delivery-agent-assignment.component';
import { DemoComponent } from './demo/demo.component';
import { PaymentApprovalComponent } from './payment-approval/payment-approval.component';
import { InventoryBalanceReportComponent } from './inventory-balance-report/inventory-balance-report.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { DrugsRegisterSheetComponent } from './drugs-register-sheet/drugs-register-sheet.component';
import { WorkDashboardComponent } from './work-dashboard/work-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrationComponent,
    children: [
      {
        path: 'my-assignment',
        component: MyAssignmentComponent,
      },
      {
        path: 'case-assignment',
        component: CaseAssignmentComponent,
      },
      {
        path: 'medicine-entry',
        component: MedicineEntryComponent,
      },
      {
        path: 'anamnesis-setup',
        component: AnamnesisSetupComponent,
      },
      {
        path: 'new-case-registration',
        component: NewCaseRegitrationComponent,
      },
      {
        path: 'work-request',
        component: WorkRequestComponent,
      },
      {
        path: 'household-item',
        component: HouseholdItemComponent,
      },
      {
        path: 'supplier-requisition',
        component: SupplierRequisitionComponent,
      },
      {
        path: 'order-pickup',
        component: OrderPickupComponent,
      },
      {
        path: 'inventory-management',
        component: InvoiceComponent,
      },
      {
        path: 'goods-received-nots',
        component: ViewInvoiceComponent,
      },
      {
        path: 'delivery-pickup',
        component: DeliveryPickupComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'sales-dashboard',
        component: SalesDashboardComponent,
      },
      {
        path: 'delivery-agent-assignment',
        component: DeliveryAgentAssignmentComponent,
      },
      {
        path: 'demo',
        component: DemoComponent,
      },
      {
        path: 'payment-approval',
        component: PaymentApprovalComponent,
      }, {
        path: 'inventory-balance-report',
        component: InventoryBalanceReportComponent,
      },
      {
        path: 'sales-report',
        component: SalesReportComponent,
      },
      {
        path: 'drugs-register-sheet',
        component: DrugsRegisterSheetComponent,
      },
      {
        path: 'work-dashboard',
        component: WorkDashboardComponent,
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
