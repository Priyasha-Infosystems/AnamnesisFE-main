import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationMenuSidebarComponent } from './administration-menu-sidebar.component';

describe('AdministrationMenuSidebarComponent', () => {
  let component: AdministrationMenuSidebarComponent;
  let fixture: ComponentFixture<AdministrationMenuSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationMenuSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrationMenuSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
