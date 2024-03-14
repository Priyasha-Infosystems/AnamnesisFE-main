import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRequisitionComponent } from './supplier-requisition.component';

describe('SupplierRequisitionComponent', () => {
  let component: SupplierRequisitionComponent;
  let fixture: ComponentFixture<SupplierRequisitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRequisitionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierRequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
