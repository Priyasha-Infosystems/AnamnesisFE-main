import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressLine, GetFile, InrHTML, TruncPrice } from './all-pipes';



@NgModule({
  declarations: [TruncPrice,AddressLine,GetFile,InrHTML],
  imports: [
    CommonModule
  ],
  exports:[TruncPrice,AddressLine,GetFile,InrHTML]
})
export class AllPipesModule { }
