import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabTestSelectionComponent } from './lab-test-selection.component';

describe('LabTestSelectionComponent', () => {
  let component: LabTestSelectionComponent;
  let fixture: ComponentFixture<LabTestSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTestSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabTestSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
