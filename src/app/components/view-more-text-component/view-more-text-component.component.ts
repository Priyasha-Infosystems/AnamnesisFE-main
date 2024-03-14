import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-view-more-text-component',
  templateUrl: './view-more-text-component.component.html',
  styleUrls: ['./view-more-text-component.component.css']
})
export class ViewMoreTextComponentComponent implements OnInit,OnChanges {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input() viewMoreText : string;
  showtext: string;
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
   this.showtext = this.viewMoreText;
  }

  ngOnInit(): void {
  }

  closeViewMorePopup() {
    this.close.emit();
  }
}
