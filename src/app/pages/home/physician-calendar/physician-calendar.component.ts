import { Component, OnInit } from '@angular/core';
import { CommonService } from '@services/common.service';
import { PhysicianCalendarService } from '@services/physician-calendar.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-physician-calendar',
  templateUrl: './physician-calendar.component.html',
  styleUrls: ['./physician-calendar.component.css']
})
export class PhysicianCalendarComponent implements OnInit {
  currentDate: Date = new Date();
  constructor(
    private toastr: ToastrService,
    public commonService: CommonService,
    private physicianCalendarService: PhysicianCalendarService
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  onSelect(event: any) {
    this.currentDate = event;
  }

}
