import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcareEquipmentSelectionComponent } from './healthcare-equipment-selection.component';

describe('HealthcareEquipmentSelectionComponent', () => {
  let component: HealthcareEquipmentSelectionComponent;
  let fixture: ComponentFixture<HealthcareEquipmentSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthcareEquipmentSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthcareEquipmentSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
