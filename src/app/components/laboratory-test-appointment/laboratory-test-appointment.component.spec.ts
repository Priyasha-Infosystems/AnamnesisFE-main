import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryTestAppointmentComponent } from './laboratory-test-appointment.component';

describe('LaboratoryTestAppointmentComponent', () => {
  let component: LaboratoryTestAppointmentComponent;
  let fixture: ComponentFixture<LaboratoryTestAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboratoryTestAppointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryTestAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
