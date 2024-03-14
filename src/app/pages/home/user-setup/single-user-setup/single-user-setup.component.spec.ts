import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleUserSetupComponent } from './single-user-setup.component';

describe('SingleUserSetupComponent', () => {
  let component: SingleUserSetupComponent;
  let fixture: ComponentFixture<SingleUserSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleUserSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleUserSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
