import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message.component';

@NgModule({
  declarations: [
    ValidationMessageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    ValidationMessageComponent
  ]
})
export class ValidationMessageModule { }
