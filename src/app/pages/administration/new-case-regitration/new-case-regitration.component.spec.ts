import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCaseRegitrationComponent } from './new-case-regitration.component';

describe('NewCaseRegitrationComponent', () => {
  let component: NewCaseRegitrationComponent;
  let fixture: ComponentFixture<NewCaseRegitrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCaseRegitrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCaseRegitrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
