import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  ColDef,
  GridApi,
  ColumnApi,
  CsvExportParams,
  GridOptions
} from 'ag-grid-community';

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
  selector: 'app-mapgrid',
  templateUrl: './mapgrid.component.html',
  styleUrls: ['./mapgrid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapgridComponent implements OnInit {
  @Input() showMap = true;
  @Input() gridMarkers: any = [];
//  @Input() shapeParam:any=null;
  @Output() customerChange:EventEmitter<string> =new EventEmitter<string>();

  public icon : any = { 'url': '../../assets/red-circle.png', 'scaledSize': { 'height': 10, 'width': 10}}
  infoLabel: string = "Not done";

  public clientDisplay :any =[
    { Locations:{latitude : 35.384357,
      longitude : -100.790756},
      CellularRadius: 1000
    },
    { Locations:{latitude : 35.385357,
      longitude : -99.790756},
      CellularRadius: 500
    }

  ]

  mapStyle: any=[
    {"featureType":"poi.medical"}
  ]

  private api?: GridApi;
  private columnApi?: ColumnApi;
  showSpinner: boolean = true;
  drawingManager :any;

  onGridReady(params: { api: GridApi; columnApi: ColumnApi; }): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.gridOptions.api = params.api;
    this.api.sizeColumnsToFit();
  }
  latitude = 35.384357;
  longitude = -100.790756;
  zoom = 3;
  map: any;
  markers: any = [];
  color = "green";

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.directionObject.north = this.latitude + 1;
    this.directionObject.south = this.latitude - 1;
    this.directionObject.east = this.longitude + 1;
    this.directionObject.west = this.longitude - 1;
    this.prevLat = this.latitude;
    this.prevLng = this.longitude;

  }

  onMapReady(event : any){
    console.log("map Ready")
    this.map = event
    this.initDrawingManager(event)
  }

  initDrawingManager(map:any) {
    const drawingOptions = {
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.RECTANGLE,
        ],
      },
      circleOptions: {
        fillColor: "#ffff00",
        fillOpacity: 1,
        strokeWeight: 5,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    };

    this.drawingManager = new google.maps.drawing.DrawingManager(drawingOptions);
    this.drawingManager.setMap(map);

    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      // Polygon : console.log(event.overlay.getPath().getArray());
      // console.log(event);
      // console.log(event.type);
      // console.log(event.overlay);
      // console.log(event.overlay.getPath().getArray());
      // var       coords = event.overlay.getPath().getArray().map((x : any) => x.toJSON());
      // coords.push(coords[0]);
      // let tempStr = "";
      // for (let i = 0; i < coords.length; i++) {
      //   tempStr += "["+coords[i].lng + "," + coords[i].lat + "],";
      // }
      // this.infoLabel = tempStr;
//      this.infoLabel = event.overlay.getPath().getArray().map((x : any) => x.toJSON()).toString();
//      console.log(event.overlay.getPath().getArray().map((x : any) => x.toJSON()));
      this.drawingManager.setDrawingMode(null);
      event.overlay.setMap(null);
      this.cd.detectChanges();
//      this.shapeParam("new one");
//      this.customerChange.emit("mjslaj");
    });
  }

  onMapPolygonComplete(event:any){
    console.log("Polygon")
    console.log(event)
  }
  drawRectangle: any = false;
  getRectangleData() {
    this.drawRectangle = !this.drawRectangle;
  }
  directionObject: any = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };
  prevLat: any;
  prevLng: any;
  centerChange(event: any) {
    console.log(event);
    this.prevLat = event.coords.lat;
    this.prevLng = event.coords.lng;
    this.directionObject.north = event.lat;
    this.directionObject.south = event.lat + 1;
    this.directionObject.east = event.lng;
    this.directionObject.west = event.lng + 1;
  }

  deltaLat: any;
  deltaLng: any;
  newLat: any;
  newLng: any;
  dragChange(event: any) {
    this.newLat = event.coords.lat;
    this.newLng = event.coords.lng;
    this.deltaLat = this.newLat - this.prevLat;
    this.deltaLng = this.newLng - this.prevLng;
    this.directionObject.north = this.directionObject.north + this.deltaLat;
    this.directionObject.south = this.directionObject.south + this.deltaLat;
    this.directionObject.east = this.directionObject.east + this.deltaLng;
    this.directionObject.west = this.directionObject.west + this.deltaLng;
  }

  boundsChange(event: any) {
    this.directionObject.north = event.north;
    this.directionObject.south = event.south;
    this.directionObject.east = event.east;
    this.directionObject.west = event.west;
  }

//  public MapTypeList: Array<any> = ['roadmap', 'satellite', 'hybrid', 'terrain']

mapTypeList: any = [
  { typeOfMap: "Hybrid", value: "hybrid" },
  { typeOfMap: "Satellite", value: "satellite" },
  { typeOfMap: "Terrain", value: "terrain" },
  { typeOfMap: "Roadmap", value: "roadmap" }
];


  selectedMapType: string = 'roadmap';
  textColor = "red";

  toggleDiv: boolean = false;

  onZoomChange(event: any){
    this.zoom = event;
  }
  changeMapType(mapType: any) {
    console.log(mapType.target.value);
    this.selectedMapType = mapType.target.value;
    if(this.selectedMapType == "roadmap" || this.selectedMapType == "terrain"){
      this.textColor = "red";
    }else{
      this.textColor = "white";
    }
  }

  columnDefs: ColDef[] = [
    { headerName: 'Tracker ID', field: 'TrackerID', filter: true, sortable: true },
    {
      headerName: 'Updated', field: 'PositionTime', sortable: true, filter: true,
      cellRenderer: (data) => {
        if (!data.value) {
          return '';
        }
        var tDate = new Date(parseInt(data.value));
        return new Date(parseInt(data.value)).toLocaleDateString() + ' ' +
          new Date(parseInt(data.value)).toLocaleTimeString();
      }
    },

    { headerName: 'Battery Level', field: 'BatteryLevel', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Battery State', field: 'BatteryState', filter: true, sortable: true },
    { headerName: 'Battery Voltage', field: 'BatteryVoltage', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Client ID', field: 'ClientID', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Last Moved', field: 'LastMoved', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Last Movement', field: 'LastMovement', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Last Started', field: 'LastStarted', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Last Stopped', field: 'LastStopped', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Latitude', field: 'Latitude', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Longitude', field: 'Longitude', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Position Type', field: 'PositionType', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Temperature', field: 'Temperature', filter: 'agNumberColumnFilter', sortable: true },
    { headerName: 'Tracker Type', field: 'TrackerType', filter: 'agNumberColumnFilter', sortable: true }
  ]

  gridOptions: GridOptions = {
    "rowData": this.gridMarkers,
    "columnDefs": this.columnDefs,
  };

  onExportClick() {
    var params: CsvExportParams = {
      "allColumns": true,
      "fileName": "OON",
    }
    //if (this.gridOptions.api) {
    this.gridOptions.api?.exportDataAsCsv(params)
    // alert("Exported");
    //}
  }

  onFilterChanged(params: any) {
    this.showMap = false;
    this.cd.detectChanges();
    let tData: any = [];
    params.api?.forEachNodeAfterFilter((node: { data: any; }) => {
      tData.push(node.data);
    });
    this.markers = tData;
    this.showMap = true;
    this.cd.detectChanges();

  }


}
