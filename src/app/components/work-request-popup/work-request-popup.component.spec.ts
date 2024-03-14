import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkRequestPopupComponent } from './work-request-popup.component';

describe('WorkRequestPopupComponent', () => {
  let component: WorkRequestPopupComponent;
  let fixture: ComponentFixture<WorkRequestPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkRequestPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
