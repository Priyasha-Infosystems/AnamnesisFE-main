import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseAssignmentComponent } from './case-assignment.component';

describe('CaseAssignmentComponent', () => {
  let component: CaseAssignmentComponent;
  let fixture: ComponentFixture<CaseAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
