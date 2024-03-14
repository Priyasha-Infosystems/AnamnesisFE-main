import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUserSetupComponent } from './bulk-user-setup.component';

describe('BulkUserSetupComponent', () => {
  let component: BulkUserSetupComponent;
  let fixture: ComponentFixture<BulkUserSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUserSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUserSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
