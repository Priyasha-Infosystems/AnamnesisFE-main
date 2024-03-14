import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryAgentAssignmentComponent } from './delivery-agent-assignment.component';

describe('DeliveryAgentAssignmentComponent', () => {
  let component: DeliveryAgentAssignmentComponent;
  let fixture: ComponentFixture<DeliveryAgentAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryAgentAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryAgentAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
