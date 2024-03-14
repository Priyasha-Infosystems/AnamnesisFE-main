import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class PriyaInfiSystemsService {

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

   contactUs(data: any) {
    return this.apiService.post('api/Homepage/ContactUs', data);
  }
  async subscribe(data: any) {
    return this.apiService.post('api/Homepage/SubscriptionAdd?emailID='+data.emailID, data);
  }
}
