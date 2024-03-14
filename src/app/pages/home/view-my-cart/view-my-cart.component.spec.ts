import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMyCartComponent } from './view-my-cart.component';

describe('ViewMyCartComponent', () => {
  let component: ViewMyCartComponent;
  let fixture: ComponentFixture<ViewMyCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMyCartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMyCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
