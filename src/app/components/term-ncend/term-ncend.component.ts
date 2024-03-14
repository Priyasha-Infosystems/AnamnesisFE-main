import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-term-ncend',
  templateUrl: './term-ncend.component.html',
  styleUrls: ['./term-ncend.component.css']
})
export class TermNCendComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  constructor() { }

  ngOnInit(): void {
  }

  closePopup(){
    this.close.emit()
  }

}
