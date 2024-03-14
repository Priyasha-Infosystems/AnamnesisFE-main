import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewCaseLogComponent } from './view-case-log.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CaseLogService } from '@services/case-log.service';
import { ViewMoreTextModule } from '../view-more-text-component/view-more-text.module';



@NgModule({
  declarations: [
    ViewCaseLogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ViewMoreTextModule,
  ],
  exports:[ViewCaseLogComponent],
  providers:[CaseLogService]
})
export class ViewCaseLogModule { }
