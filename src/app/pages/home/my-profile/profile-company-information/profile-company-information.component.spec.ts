import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCompanyInformationComponent } from './profile-company-information.component';

describe('ProfileCompanyInformationComponent', () => {
  let component: ProfileCompanyInformationComponent;
  let fixture: ComponentFixture<ProfileCompanyInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileCompanyInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileCompanyInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
