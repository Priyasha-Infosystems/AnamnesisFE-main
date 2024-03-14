import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileHospitilizationDetailsComponent } from './profile-hospitilization-details.component';

describe('ProfileHospitilizationDetailsComponent', () => {
  let component: ProfileHospitilizationDetailsComponent;
  let fixture: ComponentFixture<ProfileHospitilizationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileHospitilizationDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileHospitilizationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
