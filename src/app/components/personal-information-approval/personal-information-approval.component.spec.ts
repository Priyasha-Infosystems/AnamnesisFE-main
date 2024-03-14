import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInformationApprovalComponent } from './personal-information-approval.component';

describe('PersonalInformationApprovalComponent', () => {
  let component: PersonalInformationApprovalComponent;
  let fixture: ComponentFixture<PersonalInformationApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalInformationApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalInformationApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
