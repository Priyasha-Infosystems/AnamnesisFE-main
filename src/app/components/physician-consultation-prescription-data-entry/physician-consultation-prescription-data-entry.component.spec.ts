import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianConsultationPrescriptionDataEntryComponent } from './physician-consultation-prescription-data-entry.component';

describe('PhysicianConsultationPrescriptionDataEntryComponent', () => {
  let component: PhysicianConsultationPrescriptionDataEntryComponent;
  let fixture: ComponentFixture<PhysicianConsultationPrescriptionDataEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianConsultationPrescriptionDataEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianConsultationPrescriptionDataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
