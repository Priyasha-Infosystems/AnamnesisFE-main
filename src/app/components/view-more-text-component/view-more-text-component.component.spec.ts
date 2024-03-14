import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMoreTextComponentComponent } from './view-more-text-component.component';

describe('ViewMoreTextComponentComponent', () => {
  let component: ViewMoreTextComponentComponent;
  let fixture: ComponentFixture<ViewMoreTextComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMoreTextComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMoreTextComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
