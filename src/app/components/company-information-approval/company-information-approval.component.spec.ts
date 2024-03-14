import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInformationApprovalComponent } from './company-information-approval.component';

describe('CompanyInformationApprovalComponent', () => {
  let component: CompanyInformationApprovalComponent;
  let fixture: ComponentFixture<CompanyInformationApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyInformationApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyInformationApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
