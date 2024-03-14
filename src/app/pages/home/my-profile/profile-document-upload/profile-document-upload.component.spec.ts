import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDocumentUploadComponent } from './profile-document-upload.component';

describe('ProfileDocumentUploadComponent', () => {
  let component: ProfileDocumentUploadComponent;
  let fixture: ComponentFixture<ProfileDocumentUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileDocumentUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileDocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
