import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnamnesisSetupComponent } from './anamnesis-setup.component';

describe('AnamnesisSetupComponent', () => {
  let component: AnamnesisSetupComponent;
  let fixture: ComponentFixture<AnamnesisSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnamnesisSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnamnesisSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
