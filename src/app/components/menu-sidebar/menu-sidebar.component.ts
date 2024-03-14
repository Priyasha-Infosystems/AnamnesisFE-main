import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.css']
})
export class MenuSidebarComponent implements OnInit {

  activeMenu: string = "";
  activeMenuList: any = [];
  enableEditPage: boolean = false;
  isProfileCompleted: boolean;
  isSecQuestionesSet: boolean;
  isAddressSet: boolean;

  constructor(
    private router: Router,
    private store: Store<any>,
    private toastr: ToastrService,
  ) {
    this.store.pipe(select('profileState')).subscribe(async val => {
      this.isSecQuestionesSet = val.isSecQuestionesSet;
      this.isProfileCompleted = val.isProfileCompleted;
      this.isAddressSet = val.profileDetails?.addressDetails?.addressID || val.companyDetails?.addressDetails?.addressID ? true : false;
    })
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
    });
    this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
    if (this.router.url === "/home") {
      this.router.navigate(['home/my-profile'], { skipLocationChange: true });
    }
    $(window).scroll(function () {
      var scrollTop = $(this).scrollTop();
      if (scrollTop! > 135) {
        $('#menuSidebar').addClass('fix');
      } else {
        $('#menuSidebar').removeClass('fix');
      }
    });
    this.getUserMenuList();
  }

  async getUserMenuList() {
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.userMenuListsFetched && val.userMenuLists.manageAccountMenuCount > 0) {
        const setMenuList: any = [];
        val.userMenuLists.manageAccountScreenList.forEach((menuList: any) => {
          if (menuList.screenAvailability === "Y") {
            setMenuList.push(menuList.screenCode);
          }
        })
        this.activeMenuList = [...setMenuList];
      }
      if (val.userMenuListsFetched && val.userMenuLists.userProfileSectionCount > 0) {
        const profileScreenDataList = val.userMenuLists.userProfileSectionList;
        this.enableEditPage = false;
        profileScreenDataList.forEach((profile: any) => {
          if (profile.screenAvailability === "N") {
            this.enableEditPage = true;
          }
        });
      }
    })
  }

  isAvailableMenu(key: string) {
    if (this.activeMenuList.indexOf(key) > -1) {
      return true;
    }
    return false;
  }

  navigateTo = (key: string) => {
    window.scrollTo(0, 0);
    if (key === 'my-profile' || key === 'manage-address') {
      this.activeMenu = key;
      this.router.navigate([`/home/${key}`], { skipLocationChange: true });
    } else if (this.isProfileCompleted && !this.isAddressSet) {
      this.activeMenu = 'manage-address';
      this.router.navigate([`/home/manage-address`], { skipLocationChange: true });
      this.toastr.error('Please add the address first');
    } else if (this.isProfileCompleted && this.isSecQuestionesSet) {
      this.activeMenu = key;
      this.router.navigate([`/home/${key}`], { skipLocationChange: true });
    } else if (this.isProfileCompleted && !this.isSecQuestionesSet) {
      this.toastr.error('Please complete the Security Question setup first');
      this.activeMenu = 'security-question';
      this.router.navigate([`/home/security-question`], { skipLocationChange: true });
    } else {
      window.scrollTo(0, 0);
      this.toastr.error('Please complete the Profile setup first');
      this.activeMenu = 'my-profile';
      this.router.navigate([`/home/my-profile`], { skipLocationChange: true });
    }
    // this.router.navigate([`/home/${key}`], { skipLocationChange: true });
  }

  navigateToSettings(key: string) {
    window.scrollTo(0, 0);
    if (this.isProfileCompleted) {
      this.activeMenu = key;
      this.router.navigate([`/home/${key}`], { skipLocationChange: true });
    } else {
      this.toastr.error('Please complete the profile to access this');
    }
  }
}
