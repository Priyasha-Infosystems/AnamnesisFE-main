import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseholdItemComponent } from './household-item.component';

describe('HouseholdItemComponent', () => {
  let component: HouseholdItemComponent;
  let fixture: ComponentFixture<HouseholdItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HouseholdItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HouseholdItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
