import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceSetupComponent } from './price-setup.component';

describe('PriceSetupComponent', () => {
  let component: PriceSetupComponent;
  let fixture: ComponentFixture<PriceSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
