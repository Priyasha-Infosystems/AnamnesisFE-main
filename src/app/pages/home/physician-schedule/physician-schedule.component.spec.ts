import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianScheduleComponent } from './physician-schedule.component';

describe('PhysicianScheduleComponent', () => {
  let component: PhysicianScheduleComponent;
  let fixture: ComponentFixture<PhysicianScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
