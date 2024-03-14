import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineSelectionComponent } from './medicine-selection.component';

describe('MedicineSelectionComponent', () => {
  let component: MedicineSelectionComponent;
  let fixture: ComponentFixture<MedicineSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
