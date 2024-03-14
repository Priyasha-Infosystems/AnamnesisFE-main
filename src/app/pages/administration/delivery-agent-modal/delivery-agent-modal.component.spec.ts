import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryAgentModalComponent } from './delivery-agent-modal.component';

describe('DeliveryAgentModalComponent', () => {
  let component: DeliveryAgentModalComponent;
  let fixture: ComponentFixture<DeliveryAgentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryAgentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryAgentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
