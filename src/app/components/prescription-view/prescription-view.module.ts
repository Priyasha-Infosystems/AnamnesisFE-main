import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionViewComponent } from './prescription-view.component';
import { ViewMoreTextModule } from '../view-more-text-component/view-more-text.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';

@NgModule({
  declarations: [PrescriptionViewComponent],
  imports: [
    CommonModule,
    ViewMoreTextModule,
    FormsModule,
    ReactiveFormsModule,
    AllPipesModule
  ],
  exports:[PrescriptionViewComponent]
})
export class PrescriptionViewModule { }
