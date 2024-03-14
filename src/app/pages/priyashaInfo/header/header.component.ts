import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { isLoginClicked } from 'src/store/actions/login.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  openNavbar: boolean = false
  @Input()
  prod:boolean;
  @Output()
  navigate: EventEmitter<{}> = new EventEmitter<{}>();

  activeMenu: string = "";
  constructor(
    private router: Router,
    private store: Store<any>,
    private location: Location
  ) { }

  ngOnInit(): void {
  }
  header_variable = false;

  @HostListener("document:scroll")
  scrollfunction() {
    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
      this.header_variable = true;
    }
    else {
      this.header_variable = false;
    }
  }

  navigateTo(key: string) {
    if (this.router.url !== "/about" && this.router.url !== "/blog") {
      this.navigate.emit(key);
    } else {
    const state = {
      divId: key
    }
    const extras = { skipLocationChange: true, state };
    this.router.navigate(['/home'], extras)
    this.location.replaceState('/');
  }
    this.toggleNavbar()
  }
  navigateOther(key: string) {
      this.activeMenu = key;
      this.router.navigate([`/${key}`], { skipLocationChange: false });
      this.toggleNavbar()
  }

  navigateLogin() {
    if(!this.prod){
      this.navigate.emit('Login');
    }else{
      this.router.navigate(['/login'], { skipLocationChange: true });
      this.store.dispatch(new isLoginClicked(true));
    }
    this.toggleNavbar()
    this.location.replaceState('/');
  }

  toggleNavbar() {
    this.openNavbar = !this.openNavbar;
  }
}