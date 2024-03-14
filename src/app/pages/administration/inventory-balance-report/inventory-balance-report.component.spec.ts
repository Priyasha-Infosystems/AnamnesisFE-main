import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryBalanceReportComponent } from './inventory-balance-report.component';

describe('InventoryBalanceReportComponent', () => {
  let component: InventoryBalanceReportComponent;
  let fixture: ComponentFixture<InventoryBalanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryBalanceReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
