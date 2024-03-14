import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {
  activeMenu: string = "";
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.router.events.subscribe(() => {
      this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
    });
    this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
  }

  getHeader() {
    let label = ''
    switch (this.activeMenu) {
      case 'my-assignment':
        label = 'My Assignment';
        break;
      case 'case-assignment':
        label = 'Request Assignment';
        break;
      case 'medicine-entry':
        label = 'Medicine Entry';
        break;
      case 'anamnesis-setup':
        label = 'Anamnesis Setup';
        break;
      case 'new-case-registration':
        label = 'New Request';
        break;
      case 'work-request':
        label = 'View Request';
        break;
      case 'household-item':
        label = 'Household Item';
        break;
      case 'supplier-requisition':
        label = 'Supplier Requisition';
        break;
      case 'goods-received-nots':
        label = 'Goods Received Notes';
        break;
      case 'order-pickup':
        label = 'Order Pickup';
        break;
      case 'dashboard':
        label = 'My Dashboard';
        break;
      case 'sales-dashboard':
        label = 'Sales Dashboard';
        break;
      case 'delivery-pickup':
        label = 'Delivery Pickup';
        break;
      case 'delivery-agent-assignment':
        label = 'Delivery Agent Assignment';
        break;
      case 'payment-approval':
        label = 'Payment Approval';
        break;
      case 'inventory-management':
        label = 'Inventory Management';
        break;
      default:
        break;
    }
    return label;
  }
}
