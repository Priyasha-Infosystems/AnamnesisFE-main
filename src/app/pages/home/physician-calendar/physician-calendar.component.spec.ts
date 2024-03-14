import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianCalendarComponent } from './physician-calendar.component';

describe('PhysicianCalendarComponent', () => {
  let component: PhysicianCalendarComponent;
  let fixture: ComponentFixture<PhysicianCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
