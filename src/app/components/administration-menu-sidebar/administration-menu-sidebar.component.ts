import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-administration-menu-sidebar',
  templateUrl: './administration-menu-sidebar.component.html',
  styleUrls: ['./administration-menu-sidebar.component.css']
})
export class AdministrationMenuSidebarComponent implements OnInit {

  activeMenu: string = "";
  activeMenuList: any = [];
  reportsMenuList:any = [];

  enableEditPage: boolean = false;
  constructor(
    private router: Router,
    private store: Store<any>
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
    });
    this.activeMenu = this.router.url.split("/")[2] ? this.router.url.split("/")[2] : "";
    if (this.router.url === "/administration") {
      this.router.navigate(['administration/new-case-registration'], { skipLocationChange: true });
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

  navigateTo(key: string) {
    this.activeMenu = key.split("/")[1];
    this.router.navigate([`/${key}`], { skipLocationChange: true });
  }

  async getUserMenuList() {
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.userMenuListsFetched && val.userMenuLists.administrationMenuCount> 0) {
        const setMenuList: any = [];
        val.userMenuLists.administrationScreenList.forEach((menuList: any) => {
          if (menuList.screenAvailability === "Y") {
            setMenuList.push(menuList.screenCode);
          }
        })
        this.activeMenuList = [...setMenuList];
      }
      if (val.userMenuListsFetched && val.userMenuLists.reportsMenuCount> 0) {
        const setReportMenuList: any = [];
        val.userMenuLists.reportsScreenList.forEach((menuList: any) => {
          if (menuList.screenAvailability === "Y") {
            setReportMenuList.push(menuList.screenCode);
          }
        })
        this.reportsMenuList = [...setReportMenuList];
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

}
