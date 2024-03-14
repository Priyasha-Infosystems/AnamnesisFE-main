import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermNCendComponent } from './term-ncend.component';

describe('TermNCendComponent', () => {
  let component: TermNCendComponent;
  let fixture: ComponentFixture<TermNCendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermNCendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermNCendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
