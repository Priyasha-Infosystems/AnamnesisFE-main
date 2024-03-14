import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartAddressComponent } from './cart-address.component';

describe('CartAddressComponent', () => {
  let component: CartAddressComponent;
  let fixture: ComponentFixture<CartAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CartAddressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
