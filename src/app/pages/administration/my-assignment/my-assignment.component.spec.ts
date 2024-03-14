import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssignmentComponent } from './my-assignment.component';

describe('MyAssignmentComponent', () => {
  let component: MyAssignmentComponent;
  let fixture: ComponentFixture<MyAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyAssignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
