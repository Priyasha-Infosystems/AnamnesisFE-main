import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularUserSignupComponent } from './regular-user-signup.component';

describe('RegularUserSignupComponent', () => {
  let component: RegularUserSignupComponent;
  let fixture: ComponentFixture<RegularUserSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegularUserSignupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularUserSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
