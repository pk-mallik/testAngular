import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

export interface Pallet {
  consignmentId: number;
  lastLocation: string;
  lastLog: number;
  reference: string;
  status: number;
  trackerId: number;
  checked?: boolean;
  assetId: string;
}

export interface Exception {
  consignmentId: number;
  exceptionId: string;
  maxValue: number;
  minValue: string;
  recordedOn: number;
  trackerId: number;
  actualValue: boolean;
  exceptionType: number;
}

export interface MarkersInfo {
  Temperature: number;
  AssetID: number;
  TrackerID: number;
  Origin: string;
  DateEvent: any;
  BatteryLevel: number;
  BatteryState: string;
  BatteryVoltage: number;
  PositionType: number;
  Latitude: number;
  Longitude: number;
  Model: string;
}

@Component({
  selector: 'app-movement-report',
  templateUrl: './movement-report.component.html',
  styleUrls: ['./movement-report.component.scss'],
})
export class MovementReport implements OnInit {
  latitude = 51.678418;
  longitude = 7.809007;
  zoom = 12;
  locationMap = [];
  markers: any = [];
  markerData: any;
  showMarkerData: boolean = false;
  circleRadius: number = 6000;
  bounds:any;

  selectedMapType: string ="hybrid";

  ngOnInit(): void {
  }

  onFileChanged(event: any) {
    const f = event.target.files[0];
    const reader = new FileReader();

    reader.onload = ((theFile) => {
      return (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          this.bounds = new window['google'].maps.LatLngBounds();

          for (let tLog of json) {
            if (tLog.Latitude && tLog.Longitude) {
              this.bounds.extend(new window['google'].maps.LatLng(tLog.Latitude, tLog.Longitude));
              tLog.color = this.getRandomColor(tLog.TrackerID);
            }
          }
          this.markers = json;
          this.setVisible('');
        } catch (ex) {
          alert('exception when trying to parse json = ' + ex);
        }
      };
    })(f);
    reader.readAsText(f);
  }

  getRandomColor(trigger: string) {
    return "rgb(" + Math.floor((Math.random() * Number(trigger) * 255) % 150 + 100) + "," +
      Math.floor((Math.random() * Number(trigger) * 255) % 150 + 100) + "," +
      Math.floor((Math.random() * Number(trigger) * 255) % 150 + 100) + ")";
  }

  markerClick(markerData: any) {
    this.showMarkerData = true;
    console.log(markerData);
    this.markerData = markerData;
  }

  navigate(markerData: any) {
    let navigationParam = `${markerData.Latitude}%2C${markerData.Longitude}`;
    let url = `https://www.google.com/maps/search/?api=1&query=${navigationParam}`
    window.open(url, "_blank");
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

          tRad = 3000;

          break;

        }

      case 9:

        {

          tRad = 1500;

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

          tRad = 100;

          break;

        }

      case 14:

        {

          tRad = 50;

          break;

        }

      case 15:

        {

          tRad = 20;

          break;

        }

      case 16:

        {

          tRad = 10;

          break;

        }

      case 17:

        {

          tRad = 5;

          break;

        }

      case 18:

        {

          tRad = 4;

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
    this.circleRadius = tRad;


  }

  changeMapType(event: any){
    this.selectedMapType = event.target.value;
  }
  ExceptionList: Array<any> = ["Temperature", "Battery Voltage"];

  exceptionListValue: any[] = [];
  selectedException: string = '';

  changeException(exception: any) {
    //this.exceptionListValue = this.ExceptionList.find(x => x.name == exception).exceptionListValue;
    this.selectedException = exception.target.value;
    switch (this.selectedException) {
      case 'Temperature':
        this.exceptionListValue = [-5, 0, 5, 10, 20, 25, 30];
        break;
      case 'Battery Voltage':
        this.exceptionListValue = [5, 10, 20, 30, 50, 120];
        break;
      default:
        this.exceptionListValue = [];
        break;
    }
    this.showMarkerData = false;
  }

  onChange(selectedValue: any) {
    this.setVisible(selectedValue.target.value);
  }

  setVisible(excValue: string) {
    for (let i = 0; i < this.markers.length; i++) {
      if (excValue === '') {
        this.markers[i].isVisible = true;
        continue;
      }

      switch (this.selectedException) {
        case 'Temperature': {
          this.markers[i].isVisible = this.markers[i].Temperature > Number(excValue);
          break;
        }
        case 'Battery Voltage': {
          this.markers[i].isVisible = this.markers[i].BatteryLevel < Number(excValue);
          break;
        }
        default: {
          this.markers[i].isVisible = true;
        }
      }
    }
  }

  switchTable() {
//    this.switchTables = !this.switchTables
  }

  ngAfterViewInit(): void {

  }

  loadingFunc() {
//    this.loading = !this.loading
  }

  onRefresh() {
//    this.router.navigate(['movement-report', { fromDetails: true }]);
  }
}
