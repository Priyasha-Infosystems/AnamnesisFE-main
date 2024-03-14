import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorisedSignatoryApprovalComponent } from './authorised-signatory-approval.component';

describe('AuthorisedSignatoryApprovalComponent', () => {
  let component: AuthorisedSignatoryApprovalComponent;
  let fixture: ComponentFixture<AuthorisedSignatoryApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorisedSignatoryApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorisedSignatoryApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
