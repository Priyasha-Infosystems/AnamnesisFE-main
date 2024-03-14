import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineDetailsComponent } from './medicine-details.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MedicineEditComponent } from './medicine-edit/medicine-edit.component';
import { HeaderModule } from 'angular-admin-lte';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageModule } from '../validation-message/validation-message/validation-message.module';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';
import { CommonService } from '@services/common.service';
import { UtilityService } from '@services/utility.service';

@NgModule({
  declarations: [
    MedicineDetailsComponent,
    MedicineEditComponent
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
  exports:[MedicineDetailsComponent],
  providers:[CommonService,UtilityService]
})
export class MedicineDetailsModule { }
