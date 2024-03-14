import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriyashaInfoComponent } from './priyasha-info.component';

describe('PriyashaInfoComponent', () => {
  let component: PriyashaInfoComponent;
  let fixture: ComponentFixture<PriyashaInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriyashaInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriyashaInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
