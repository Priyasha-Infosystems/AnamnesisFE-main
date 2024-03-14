import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewFileComponent } from './view-file.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    ViewFileComponent
  ],
  imports: [
    CommonModule,
    PdfViewerModule
  ],
  exports:[ViewFileComponent]
})
export class ViewFileModule { }
