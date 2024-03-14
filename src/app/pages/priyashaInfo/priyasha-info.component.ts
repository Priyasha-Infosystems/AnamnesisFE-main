import { Component, OnInit } from '@angular/core';
import * as AOS from 'aos';

AOS.init({
  duration: 1200,
})

@Component({
  selector: 'app-priyasha-info',
  templateUrl: './priyasha-info.component.html',
  styleUrls: ['./priyasha-info.component.css']
})
export class PriyashaInfoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
