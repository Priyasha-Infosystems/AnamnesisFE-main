import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePrescriptionComponent } from './generate-prescription.component';

describe('GeneratePrescriptionComponent', () => {
  let component: GeneratePrescriptionComponent;
  let fixture: ComponentFixture<GeneratePrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratePrescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratePrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
