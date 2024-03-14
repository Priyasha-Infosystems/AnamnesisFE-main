import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePhysicianCredentialsComponent } from './profile-physician-credentials.component';

describe('ProfilePhysicianCredentialsComponent', () => {
  let component: ProfilePhysicianCredentialsComponent;
  let fixture: ComponentFixture<ProfilePhysicianCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilePhysicianCredentialsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePhysicianCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
