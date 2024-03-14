
import { Component,OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { GetFile } from '@pipes/all-pipes/all-pipes';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

declare interface GenericElementRef<T extends HTMLElement> {
  nativeElement: T;
}
@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements OnInit {
  @Input()
  presctiptionIndex:number;
  @Input()
  presctiptionIDForDrawing:any;
  @Input()
  exsistingFile:any;
  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @ViewChild('canvas') canvas: GenericElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D|null;
  dimension = { width: 600, height: 300 };
  isWriting = false;
  colorOprionArray:any =['black','blue','red','yellow','green','White'];
  selectedColor :any = 'black';
  penclieWidthOptions:any = [1,3,5,7]
  selectedPenclieWidth:any = 1;
  img:any = new Image;
  constructor(
    private getFile:GetFile
  ){

  }
  ngAfterViewInit() {
    
    this.ctx = this.canvas.nativeElement.getContext('2d');
    if(this.ctx){
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.dimension.width, this.dimension.height);
    }
    if(this.ctx && this.exsistingFile){
      const image = new Image();
      image.src = this.getFile.transform(this.exsistingFile.fileName,this.exsistingFile.fileType);
      image.addEventListener("load", () => {
        this.ctx?.drawImage(image, 0, 0,);
      });
    }
    // Handle Mouse events
    const mouseDownStream = fromEvent(this.canvas.nativeElement, 'mousedown');
    const mouseMoveStream = fromEvent(this.canvas.nativeElement, 'mousemove');
    const mouseUpStream = fromEvent(window, 'mouseup');

    mouseDownStream.pipe(map((e:any) => this.startDraw(e))).subscribe();
    mouseMoveStream.pipe(map((e:any) => this.keepDraw(e))).subscribe();
    mouseUpStream.pipe(map(() => (this.isWriting = false))).subscribe();

    // Handle Touch events
    const touchDownStream = fromEvent(this.canvas.nativeElement, 'touchstart');
    const touchMoveStream = fromEvent(this.canvas.nativeElement, 'touchmove');
    const touchUpStream = fromEvent(window, 'touchend');

    touchDownStream.pipe(map((e:any) => this.startDraw(e))).subscribe();
    touchMoveStream.pipe(map((e:any) => this.keepDraw(e))).subscribe();
    touchUpStream.pipe(map(() => (this.isWriting = false))).subscribe();
   
  }



  startDraw(e:any) {
    // if(this.img && this.exsistingFile && this.ctx){
    //   // this.img.onload = start;
    //   this.img.src = this.getFile.transform(this.exsistingFile.fileName,this.exsistingFile.fileType)
      
    //   this.ctx.drawImage(this.img, 0, 0);
    // }
    if(this.ctx){ 
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.selectedColor;
      this.ctx.lineWidth = this.selectedPenclieWidth;
      this.ctx.lineJoin = 'round';
      const location = this.getLocation(e);
      this.ctx.moveTo(location.X, location.Y);
      this.isWriting = true;
    }
  }

  keepDraw(e:any) {
    if (!this.isWriting) return;
    const location = this.getLocation(e);
    if(this.ctx){
      this.ctx.lineTo(location.X, location.Y);
      this.ctx.stroke();
    }
    
  }

  getLocation(e:any) {
    const location = { X: 0, Y: 0 };
    if (e instanceof MouseEvent) {
      location.X = e.offsetX;
      location.Y = e.offsetY;
    } else {
      const dimensions = e.target.getBoundingClientRect();

      location.X = e.touches[0].clientX - dimensions.left;
      location.Y = e.touches[0].clientY - dimensions.top;
    }
    return location;
  }

  onClearClick() {
    if(this.ctx){
      this.ctx.clearRect(0, 0, this.dimension.width, this.dimension.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.dimension.width, this.dimension.height);
    }
    this.selectedColor = 'black';
    this.selectedPenclieWidth = 1;
    if(this.ctx && this.exsistingFile){
      const image = new Image();
      image.src = this.getFile.transform(this.exsistingFile.fileName,this.exsistingFile.fileType);
      image.addEventListener("load", () => {
        this.ctx?.drawImage(image, 0, 0,);
      });
    }
  }

  onSaveClick() {
    const dataURL = this.canvas.nativeElement.toDataURL();
    this.closePopup(dataURL);
  }

  ngOnInit(): void {
  }

  closePopup(data:any){
    const outputData= {
      data:data,
      presctiptionIndex:this.presctiptionIndex,
      presctiptionIDForDrawing:this.presctiptionIDForDrawing,
      exsistingFile:this.exsistingFile
    }
    this.close.emit(outputData)
  }
  selectColor(color:any){
    this.selectedColor = color;
  }
  selectpenclieWidth(width:any){
    this.selectedPenclieWidth = width;
  }

  getWidth(width:any){
    return `${width+3} px`
  }
}
