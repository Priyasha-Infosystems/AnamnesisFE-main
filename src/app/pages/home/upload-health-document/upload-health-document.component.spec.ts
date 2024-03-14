import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadHealthDocumentComponent } from './upload-health-document.component';

describe('UploadHealthDocumentComponent', () => {
  let component: UploadHealthDocumentComponent;
  let fixture: ComponentFixture<UploadHealthDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadHealthDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadHealthDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
