import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialUserSignupComponent } from './commercial-user-signup.component';

describe('CommercialUserSignupComponent', () => {
  let component: CommercialUserSignupComponent;
  let fixture: ComponentFixture<CommercialUserSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialUserSignupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercialUserSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
