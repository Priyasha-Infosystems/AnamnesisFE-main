import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCaseLogComponent } from './view-case-log.component';

describe('ViewCaseLogComponent', () => {
  let component: ViewCaseLogComponent;
  let fixture: ComponentFixture<ViewCaseLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCaseLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCaseLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
