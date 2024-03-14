import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRequisitionConfirmationComponent } from './supplier-requisition-confirmation.component';

describe('SupplierRequisitionConfirmationComponent', () => {
  let component: SupplierRequisitionConfirmationComponent;
  let fixture: ComponentFixture<SupplierRequisitionConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRequisitionConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierRequisitionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
