import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabtestReportCreatComponent } from './labtest-report-creat.component';

describe('LabtestReportCreatComponent', () => {
  let component: LabtestReportCreatComponent;
  let fixture: ComponentFixture<LabtestReportCreatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabtestReportCreatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabtestReportCreatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
