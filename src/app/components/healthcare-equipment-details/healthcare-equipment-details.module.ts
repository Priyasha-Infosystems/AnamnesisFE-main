import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthcareEquipmentDetailsComponent } from './healthcare-equipment-details.component';
import { HeaderModule } from 'angular-admin-lte';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageModule } from '../validation-message/validation-message/validation-message.module';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';

@NgModule({
  declarations: [
    HealthcareEquipmentDetailsComponent,
    
  ],
  imports: [
    CommonModule,
    HeaderModule,
    NgxSpinnerModule,
    NgxMaterialTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationMessageModule,
    AllPipesModule
  ],
  exports:[
    HealthcareEquipmentDetailsComponent
  ]
})
export class HealthcareEquipmentDetailsModule { }
