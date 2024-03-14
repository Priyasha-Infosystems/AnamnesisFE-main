import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressModalComponent } from './address-modal.component';
import { ValidationMessageModule } from '../validation-message/validation-message/validation-message.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AddressModalComponent
  ],
  imports: [
    CommonModule,
    ValidationMessageModule,
    ReactiveFormsModule
  ],
  exports:[AddressModalComponent]
})
export class AddressModalModule { }
