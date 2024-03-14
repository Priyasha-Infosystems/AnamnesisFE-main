import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileBusinessInformationComponent } from './profile-business-information.component';

describe('ProfileBusinessInformationComponent', () => {
  let component: ProfileBusinessInformationComponent;
  let fixture: ComponentFixture<ProfileBusinessInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileBusinessInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileBusinessInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
