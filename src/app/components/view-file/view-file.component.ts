import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-view-file',
  templateUrl: './view-file.component.html',
  styleUrls: ['./view-file.component.css']
})
export class ViewFileComponent implements OnInit {
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  wrAttachmentDetails: any = {};
  public requestKeyDetails: any;
  public imageBaseUrl: string = BASE_IMAGE_URL_FOR_REQ;
  public pdfZoom:number =1;
  constructor(
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
  }

  zoomIn(){
    this.pdfZoom = this.pdfZoom+1
  }
  zoomOut(){
    if(this.pdfZoom>1){
      this.pdfZoom = this.pdfZoom-1
    }
  }

  closePopup=()=>{
    this.close.emit(true);
  }
}
