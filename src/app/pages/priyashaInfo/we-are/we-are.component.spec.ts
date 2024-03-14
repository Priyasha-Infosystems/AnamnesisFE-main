import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeAreComponent } from './we-are.component';

describe('WeAreComponent', () => {
  let component: WeAreComponent;
  let fixture: ComponentFixture<WeAreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeAreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeAreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
