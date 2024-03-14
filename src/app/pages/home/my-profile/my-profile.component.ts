import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { ProfileService } from '@services/profile.service';
import { isProfileCompleted } from 'src/store/actions/profile.actions';
import { documentTypeDetails, isDocumentDetailsFetched } from 'src/store/actions/utility.actions';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  isEditPage = "";
  editablePages: any = [];

  constructor(
    private profileService: ProfileService,
    private commonService: CommonService,
    private store: Store<any>,
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getLastUpdateInformation();
    this.getUploadDocumentType();
    this.commonService.getCommercialTypes();
    this.commonService.getUtilityService();
  }

  async getUploadDocumentType() {
    await this.profileService.getUploadDocumentType()
      .then(async (res: any) => {
        if (res.apiResponse) {
          this.store.dispatch(new documentTypeDetails(res.apiResponse.documentTypeDetailsList));
          this.store.dispatch(new isDocumentDetailsFetched(true));
        }
      })
      .catch((err: any) => {
      })
  }

  async getLastUpdateInformation() {
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.userMenuListsFetched) {
        const profileScreenDataList = val.userMenuLists.userProfileSectionList
        profileScreenDataList && profileScreenDataList.forEach((profile: any) => {
          if (profile.screenCode !== "MPFL") {
            if (profile.screenAvailability === "Y") {
              this.editablePages.push(profile.screenCode);
            } else if (profile.screenAvailability === "N" && this.isEditPage === "") {
              this.isEditPage = "Y";
              this.editablePages.push(profile.screenCode);
            }
          }
        });
        if (this.isEditPage === "") {
          this.isEditPage = "N"
          this.store.dispatch(new isProfileCompleted(true));
        }
      }
    })
  }

  setViewEdit() {
    this.isEditPage = this.isEditPage === "Y" ? "N" : "Y";
    this.commonService.updateUserMenuList();
  }
}
