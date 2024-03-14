import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPickupComponent } from './delivery-pickup.component';

describe('DeliveryPickupComponent', () => {
  let component: DeliveryPickupComponent;
  let fixture: ComponentFixture<DeliveryPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryPickupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
