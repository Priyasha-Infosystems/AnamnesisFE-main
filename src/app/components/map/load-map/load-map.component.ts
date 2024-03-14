import { Component, OnInit } from '@angular/core';
import { mappls, mappls_plugin } from 'mappls-web-maps'

@Component({
  selector: 'app-load-map',
  templateUrl: './load-map.component.html',
  styleUrls: ['./load-map.component.css']
})
export class LoadMapComponent implements OnInit {

  mapObject: any;
  mapplsClassObject = new mappls();
  mapplsPluginObject = new mappls_plugin();
  mapProps = { center: [28.6330, 77.2194], traffic: false, zoom: 4, geolocation: false, clickableIcons: false }
  constructor() { }

  ngOnInit() {
    this.mapplsClassObject.initialize("e67f1c2b1e22f58d3b69f99e5ef1a358", () => {
      this.mapObject = this.mapplsClassObject.Map({ id: "map", properties: this.mapProps });
      this.mapObject.on("load", () => {
        // Activites after mapload
      })
    });
  }
}
