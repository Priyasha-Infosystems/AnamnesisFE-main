import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabtestReportUploadComponent } from './labtest-report-upload.component';

describe('LabtestReportUploadComponent', () => {
  let component: LabtestReportUploadComponent;
  let fixture: ComponentFixture<LabtestReportUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabtestReportUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabtestReportUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
