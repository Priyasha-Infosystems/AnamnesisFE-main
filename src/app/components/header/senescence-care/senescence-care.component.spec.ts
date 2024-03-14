import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SenescenceCareComponent } from './senescence-care.component';

describe('SenescenceCareComponent', () => {
  let component: SenescenceCareComponent;
  let fixture: ComponentFixture<SenescenceCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SenescenceCareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SenescenceCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
