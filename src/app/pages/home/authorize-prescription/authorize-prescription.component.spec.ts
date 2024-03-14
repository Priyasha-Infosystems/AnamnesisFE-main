import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizePrescriptionComponent } from './authorize-prescription.component';

describe('AuthorizePrescriptionComponent', () => {
  let component: AuthorizePrescriptionComponent;
  let fixture: ComponentFixture<AuthorizePrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorizePrescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizePrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
