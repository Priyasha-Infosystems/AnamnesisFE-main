import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineEntryComponent } from './medicine-entry.component';

describe('MedicineEntryComponent', () => {
  let component: MedicineEntryComponent;
  let fixture: ComponentFixture<MedicineEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
