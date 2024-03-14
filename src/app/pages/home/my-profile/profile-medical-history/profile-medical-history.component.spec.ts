import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMedicalHistoryComponent } from './profile-medical-history.component';

describe('ProfileMedicalHistoryComponent', () => {
  let component: ProfileMedicalHistoryComponent;
  let fixture: ComponentFixture<ProfileMedicalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileMedicalHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileMedicalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
