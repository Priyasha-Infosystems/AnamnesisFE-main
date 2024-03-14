import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianEditionComponent } from './physician-edition.component';

describe('PhysicianEditionComponent', () => {
  let component: PhysicianEditionComponent;
  let fixture: ComponentFixture<PhysicianEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianEditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
