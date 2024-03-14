import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileGeneralInformationComponent } from './profile-general-information.component';

describe('ProfileGeneralInformationComponent', () => {
  let component: ProfileGeneralInformationComponent;
  let fixture: ComponentFixture<ProfileGeneralInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileGeneralInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
