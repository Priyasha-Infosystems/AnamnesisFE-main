import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadMapComponent } from './load-map.component';

describe('LoadMapComponent', () => {
  let component: LoadMapComponent;
  let fixture: ComponentFixture<LoadMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
