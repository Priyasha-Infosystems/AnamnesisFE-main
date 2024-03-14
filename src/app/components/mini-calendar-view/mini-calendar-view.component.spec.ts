import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCalendarViewComponent } from './mini-calendar-view.component';

describe('MiniCalendarViewComponent', () => {
  let component: MiniCalendarViewComponent;
  let fixture: ComponentFixture<MiniCalendarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniCalendarViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniCalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
