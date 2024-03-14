import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticCenterScheduleComponent } from './diagnostic-center-schedule.component';

describe('DiagnosticCenterScheduleComponent', () => {
  let component: DiagnosticCenterScheduleComponent;
  let fixture: ComponentFixture<DiagnosticCenterScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosticCenterScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticCenterScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
