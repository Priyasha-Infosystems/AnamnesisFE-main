import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { ProfileService } from '@services/profile.service';
import { isProfileCompleted } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['../my-profile.component.css']
})
export class ProfileEditComponent implements OnInit {

  @Input() enabledPages: any;
  @Output()
  setViewPage: EventEmitter<{}> = new EventEmitter<{}>();
  isProfileCompleted: string;

  constructor(
    private profileService: ProfileService,
    private commonService: CommonService,
    private store: Store<any>,
  ) {
    this.store.pipe(select('profileState')).subscribe(async val => {
      this.isProfileCompleted = val.isProfileCompleted;
    })
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  getProfileIndex(id: any) {
    return this.enabledPages.indexOf(id) + 1;
  }

  async getLastUpdateInformation() {
    await this.profileService.getLastUpdateInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const profileScreenDataList = res.apiResponse.userProfileSectionList;
          this.enabledPages = [];
          let isEditPage: boolean = false
          profileScreenDataList.forEach((profile: any) => {
            if (profile.screenCode !== "MPFL") {
              if (profile.screenAvailability === "Y") {
                this.enabledPages.push(profile.screenCode);
              } else if (profile.screenAvailability === "N" && !isEditPage) {
                this.enabledPages.push(profile.screenCode);
                isEditPage = true;
              }
            }
          });
          if (!isEditPage) {
            this.setViewPage.emit();
            this.store.dispatch(new isProfileCompleted(true));
          }
        }
      })
      .catch((err: any) => {
      })
  }

  setEdit() {
    this.setViewPage.emit();
  }
}
