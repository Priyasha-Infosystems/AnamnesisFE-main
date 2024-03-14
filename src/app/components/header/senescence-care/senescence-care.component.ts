import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-senescence-care',
  templateUrl: './senescence-care.component.html',
  styleUrls: ['./senescence-care.component.css']
})
export class SenescenceCareComponent implements OnInit {
  @Output() close: EventEmitter<{}> = new EventEmitter<{}>();
  constructor() { }

  ngOnInit(): void {
  }

  closePopUp(data: boolean) {
    this.close.emit(data)
  }

}
