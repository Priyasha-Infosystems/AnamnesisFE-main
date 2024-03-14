import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDashboardComponent } from './work-dashboard.component';

describe('WorkDashboardComponent', () => {
  let component: WorkDashboardComponent;
  let fixture: ComponentFixture<WorkDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
