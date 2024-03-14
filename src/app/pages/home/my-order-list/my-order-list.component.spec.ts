import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOrderListComponent } from './my-order-list.component';

describe('MyOrderListComponent', () => {
  let component: MyOrderListComponent;
  let fixture: ComponentFixture<MyOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyOrderListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
