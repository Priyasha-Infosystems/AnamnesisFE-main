import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { ProfileService } from '@services/profile.service';
import { setProfileDetails } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit {
  displayName:any;
  profilePicUrl: string = "../../../assets/images/profile-pic-dummy.png";
  profilePicDetails: any ;
  isProfilePicFetched: boolean
  constructor(
    private profileService: ProfileService,
    private commonService: CommonService,
    private store: Store<any>,
  ) { }

  async ngOnInit(){
    await this.store.pipe(select('profileState')).subscribe(async val => {
      this.displayName = val.profileDetails.displayName ?? val.companyDetails.legalBusinessName ?? ""
    })
    this.store.pipe(select('commonUtility')).subscribe(async val => {
      if (val.userMenuListsFetched) {
        this.profilePicDetails =val.userMenuLists.profilePictureDetails;
        this.isProfilePicFetched = val.userMenuLists.profilePictureDetails?.fileName ? true : false;
      }
    })
    this.getPersonalInformation();
  }

  getPersonalInformation = async () => {
    await this.profileService.getPersonalInformation()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const personalData = { ...res.apiResponse };
          personalData.gender = res.apiResponse.gender ? res.apiResponse.gender : "";
          personalData.maritialStatus = res.apiResponse.maritialStatus ? res.apiResponse.maritialStatus : "";
          this.store.dispatch(new setProfileDetails(personalData));
        }
      })
      .catch((err: any) => {
      })
  }

}
