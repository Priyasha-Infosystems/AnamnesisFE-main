import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianCredentialApprovalComponent } from './physician-credential-approval.component';

describe('PhysicianCredentialApprovalComponent', () => {
  let component: PhysicianCredentialApprovalComponent;
  let fixture: ComponentFixture<PhysicianCredentialApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianCredentialApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianCredentialApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
