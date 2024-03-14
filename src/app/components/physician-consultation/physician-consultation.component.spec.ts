import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianConsultationComponent } from './physician-consultation.component';

describe('PhysicianConsultationComponent', () => {
  let component: PhysicianConsultationComponent;
  let fixture: ComponentFixture<PhysicianConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianConsultationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
