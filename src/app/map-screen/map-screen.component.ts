//key Tj9oYuQo4aIfhKO7LTJK7QNsDBfduvjeaw8FdvqkG4A
//SAAS phXWFCRF4TSBqg_Vt-2SC5x6pDCHCpUAbflvlogkzi0

import { PolylineManager } from '@agm/core';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { NotificationService } from '../notification.service';



imports: [
  BrowserModule,
  FormsModule
]
@Component({
  selector: 'app-map-screen',
  templateUrl: './map-screen.component.html',
  styleUrls: ['./map-screen.component.scss']
})
export class MapScreenComponent implements OnInit {
  @Input() my_modal_title ='';
  @Input() my_modal_content = '';

  infoLabel = "Not done";
  mapSettings = {
    center: {
      lat: 22.2736308,
      lng: 70.7512555,
    },
    origin: {
      lat: 27.176670,
      lng: 78.008072
    },
    destination: {
      lat: 26.850000,
      lng: 80.949997
    },
    mapType: 'satellite',
  }

  markers: any = [] ;
  bounds: any = [];
  trackerColors: { trackerId: string, color: string }[] = [];

  selectedException: string = '';
  exceptionsList: any = [];
  selectedVal: string = '';

  circleSettings = { radius: 6000, maxTemp: 0, maxHumidity: 0, minBattery: 0 };

  // Map Icons http://kml4earth.appspot.com/icons.html#shapes
  //iconStyle = "http://maps.google.com/mapfiles/kml/pushpin/purple-pushpin.png";


  tSel = "terrain";

  mapTypeList: any = [
    { typeOfMap: "Hybrid", value: "hybrid" },
    { typeOfMap: "Satellite", value: "satellite" },
    { typeOfMap: "Terrain", value: "terrain" },
    { typeOfMap: "Roadmap", value: "roadmap" }
  ];

  category: any = ['school', 'college'];

  displayStyle = "none";

  constructor(    private notifyService : NotificationService, polylineManager: PolylineManager
    ){
  }

  ngOnInit(): void {
  }
  getDistance(orig: any, dest: any) {
    var depTime = new Date();
    const matrix = new google.maps.DistanceMatrixService();
    return new Promise((resolve, reject) => {
      matrix.getDistanceMatrix({
        origins: [orig],
        destinations: [dest],
        travelMode: google.maps.TravelMode.DRIVING,
      }, function (response, status) {
        if (status === 'OK') {
          resolve(response.rows[0].elements[0]);
        } else {
          reject(response);
        }
      });
    })
  }


  changeMapType(event: any) {
    this.mapSettings.mapType = event.target.value;
  }
  changeExceptionType(event: any) {
    console.log('Showing...');
    this.notifyService.showSuccess('Changed Exception Type', event.target.value);
    this.selectedException = event.target.value;
    switch (this.selectedException) {
      case 'Temperature': {
        this.exceptionsList = [-5, 0, 5, 10, 15, 20, 25, 30];
        break;
      }
      case 'Battery Level': {
        this.exceptionsList = [50, 30, 20, 15, 10, 5];
        break;
      }
      default: {
        this.exceptionsList = [];
      }
    }
    this.setVisible('');
  }
  changeException(event: any) {
    this.selectedVal = event.target.value;
    this.setVisible(event.target.value);
  }

  setVisible(excValue: string) {
    for (let i = 0; i < this.markers.length; i++) {
      if(excValue===''){
        this.markers[i].isVisible = true;
        continue;
      }
      switch (this.selectedException) {
        case 'Temperature': {
          this.markers[i].isVisible = this.markers[i].Temperature > Number(excValue);
          break;
        }
        case 'Battery Level': {
          this.markers[i].isVisible = this.markers[i].BatteryLevel < Number(excValue);
          break;
        }
        default:{
          this.markers[i].isVisible = true;
        }
      }
    }
  }

  showMarkers(){
    this.markers = [
      {
        "LocationName": "New CALLEBAUT CHESTER",
        "Longitude" : -83.7209698,
        "Latitude" :  34.2129736,
      },
      {
          "LocationName": "BARRY CALLEBAUT CHESTER",
          "Longitude" : -2.9250476,
          "Latitude" :  53.1927264,

      },
      {
          "LocationName": "PERFECT PALLET DICKSON WAREHOUSE",
          "Longitude" : -87.348858,
          "Latitude" :  36.059904,
      }
    ]

    this.bounds = new window['google'].maps.LatLngBounds();
    for (let tLog of this.markers) {
      if (tLog.Latitude && tLog.Longitude) {
        this.bounds.extend(new google.maps.LatLng(tLog.Latitude, tLog.Longitude));
        tLog.color = this.getRandomColor(tLog.TrackerID);
      }
    }

  }

  onFileLoad(event: any) {
    const f = event.target.files[0];
    const reader = new FileReader();

    reader.onload = ((theFile) => {
      return (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          this.markers = this.trackerColors = [];
          this.bounds = new window['google'].maps.LatLngBounds();
          for (let tLog of json) {
            if (tLog.Latitude && tLog.Longitude) {
              this.bounds.extend(new window['google'].maps.LatLng(tLog.Latitude, tLog.Longitude));
              tLog.color = this.getRandomColor(tLog.TrackerID);
            }
          }
          this.markers = json;
          this.setVisible('');
          this.selectedException = "Select...";
          this.changeExceptionType({target:{value:''}});
        } catch (ex) {
          alert('exception when trying to parse json = ' + ex);
        }
      };
    })(f);
    reader.readAsText(f);
  }

  getRandomColor(trigger: string) {
    return "rgb(" + (Math.floor((Math.random() * Number(trigger) * 255) % 150) + 100) + "," +
      (Math.floor((Math.random() * Number(trigger) * 255) % 150) + 100) + "," +
      (Math.floor((Math.random() * Number(trigger) * 255) % 150) + 100) + ")";
  }

  onZoomChanged(zoomLevel: number) {
    var tRad = 3000;
    switch (zoomLevel) {
      case 0:
        {
          tRad = 500000;
          break;
        }
      case 1:
        {
          tRad = 300000;
          break;
        }
      case 2:
        {
          tRad = 200000;
          break;
        }
      case 3:
        {
          tRad = 90000;
          break;
        }
      case 4:
        {
          tRad = 60000;
          break;
        }
      case 5:
        {
          tRad = 30000;
          break;
        }
      case 6:
        {
          tRad = 15000;
          break;
        }
      case 7:
        {
          tRad = 8000;
          break;
        }
      case 8:
        {
          tRad = 4000;
          break;
        }
      case 9:
        {
          tRad = 2000;
          break;
        }
      case 10:
        {
          tRad = 1000;
          break;
        }
      case 11:
        {
          tRad = 500;
          break;
        }
      case 12:
        {
          tRad = 250;
          break;
        }
      case 13:
        {
          tRad = 150;
          break;
        }
      case 14:
        {
          tRad = 75;
          break;
        }
      case 15:
        {
          tRad = 40;
          break;
        }
      case 16:
        {
          tRad = 20;
          break;
        }
      case 17:
        {
          tRad = 10;
          break;
        }
      case 18:
        {
          tRad = 5;
          break;
        }
      case 19:
        {
          tRad = 3;
          break;
        }
      case 20:
        {
          tRad = 2;
          break;
        }
      default:
        {
          tRad = 1;
          break;
        }
    }
    this.circleSettings.radius = tRad;
    this.infoLabel = "Size: " + String(this.circleSettings.radius) + "  Zoom: " + String(zoomLevel);
  }


  openPopup() {
    this.displayStyle = "block";
  }
  closePopup() {
    this.displayStyle = "none";
  }
}
