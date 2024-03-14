import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralMedicalInformationUpdateComponent } from './general-medical-information-update.component';

describe('GeneralMedicalInformationUpdateComponent', () => {
  let component: GeneralMedicalInformationUpdateComponent;
  let fixture: ComponentFixture<GeneralMedicalInformationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralMedicalInformationUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralMedicalInformationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
