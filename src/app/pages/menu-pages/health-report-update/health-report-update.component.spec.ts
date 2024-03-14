import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthReportUpdateComponent } from './health-report-update.component';

describe('HealthReportUpdateComponent', () => {
  let component: HealthReportUpdateComponent;
  let fixture: ComponentFixture<HealthReportUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthReportUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthReportUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
