import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugsRegisterSheetComponent } from './drugs-register-sheet.component';

describe('DrugsRegisterSheetComponent', () => {
  let component: DrugsRegisterSheetComponent;
  let fixture: ComponentFixture<DrugsRegisterSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrugsRegisterSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugsRegisterSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
