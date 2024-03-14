import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewMoreTextComponentComponent } from './view-more-text-component.component';

@NgModule({
  declarations: [
    ViewMoreTextComponentComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[ViewMoreTextComponentComponent]
})
export class ViewMoreTextModule { }
