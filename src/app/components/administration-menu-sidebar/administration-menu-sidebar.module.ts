import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrationMenuSidebarComponent } from './administration-menu-sidebar.component';



@NgModule({
  declarations: [
    AdministrationMenuSidebarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AdministrationMenuSidebarComponent
  ]
})
export class AdministrationMenuSidebarModule { }
