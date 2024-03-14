import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadMapComponent } from './load-map/load-map.component';

@NgModule({
  declarations: [
    LoadMapComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoadMapComponent
  ]
})
export class MapModule { }
