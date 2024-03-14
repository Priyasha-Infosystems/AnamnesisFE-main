import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcareEquipmentDetailsComponent } from './healthcare-equipment-details.component';

describe('HealthcareEquipmentDetailsComponent', () => {
  let component: HealthcareEquipmentDetailsComponent;
  let fixture: ComponentFixture<HealthcareEquipmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthcareEquipmentDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthcareEquipmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
