import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { SecurityQuestionService } from '@services/securityQuestions.service';
import { isSecQuestionSet } from 'src/store/actions/profile.actions';

@Component({
  selector: 'app-menu-pages',
  templateUrl: './menu-pages.component.html',
  styleUrls: ['./menu-pages.component.css']
})
export class MenuPagesComponent implements OnInit {
  isSecQuestionesSet:boolean = false
  constructor(
    private commonService: CommonService,
    public secQuestionService: SecurityQuestionService,
    private store: Store<any>,
  ) { 
    this.commonService.updateUserMenuList();
  }

  async ngOnInit() {
    await this.store.pipe(select('profileState')).subscribe(async val => {
      this.isSecQuestionesSet = val.isSecQuestionesSet;
    })
    this.getUserSecQuestionList()
  }

  async getUserSecQuestionList() {
    if(!this.isSecQuestionesSet){
      await this.secQuestionService.GetUserSecQuestions()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const questionsList = res.apiResponse.userSecQuestionsList;
          if (questionsList && questionsList.length > 0) {
            this.store.dispatch(new isSecQuestionSet(true));
          }
        }
      })
      .catch((err: any) => {
      })
    }
  }

}
