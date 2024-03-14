import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderWithPrescriptionComponent } from './order-with-prescription.component';

describe('OrderWithPrescriptionComponent', () => {
  let component: OrderWithPrescriptionComponent;
  let fixture: ComponentFixture<OrderWithPrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderWithPrescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderWithPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
