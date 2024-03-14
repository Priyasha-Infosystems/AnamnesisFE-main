import { FormGroup, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  public markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).map((key) => {
      formGroup.controls[key].markAsTouched();
      formGroup.controls[key].markAsDirty();
      const mayBeFG = formGroup.controls[key] as FormGroup;
      if (mayBeFG.controls) {
        this.markFormGroupTouched(mayBeFG);
      }
    });
  }

  public markFormGroupUnTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).map((key) => {
      formGroup.controls[key].markAsUntouched();
      formGroup.controls[key].markAsPristine();
    });
    formGroup.markAsPristine();
  }
}
