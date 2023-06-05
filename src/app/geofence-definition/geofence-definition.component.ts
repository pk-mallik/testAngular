import { MapsAPILoader } from '@agm/core'
import {
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ColDef, ColumnApi, GridApi, GridOptions } from 'ag-grid-community'
/*import { BlockChainService } from 'app/services/blockchainService/blockchain.service';
import { UtilityService } from 'app/utils/utility.service';
import * as atlas from 'azure-maps-control';
import { event } from 'jquery';*/
import { IDropdownSettings } from 'ng-multiselect-dropdown'
import { ToastrService } from 'ngx-toastr'
@Component({
  selector: 'app-geofence-definition',
  templateUrl: './geofence-definition.component.html',
  styleUrls: ['./geofence-definition.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeofenceDefinitionComponent implements OnInit {
  private api: GridApi
  private columnApi: ColumnApi
  public showSpinner: boolean = false
  private geoCoder: any
  address: string
  name: string
  locationName: string = ''
  locationLatitude: number
  locationLongitude: number
  locationAddress: string
  locationType: string
  locationParam: string
  locationDataList: any = []
  locationLdata: any = []
  celldata: boolean

  public default: any = {
    url: '../../assets/img/ATImages/location/Default.png',
    scaledSize: { height: 12, width: 12 },
  }
  public client: any = {
    url: '../../assets/img/ATImages/location/Client.png',
    scaledSize: { height: 15, width: 15 },
  }
  public store: any = {
    url: '../../assets/img/ATImages/location/Store.png',
    scaledSize: { height: 15, width: 15 },
  }
  public dc: any = {
    url: '../../assets/img/ATImages/location/Dc.png',
    scaledSize: { height: 15, width: 15 },
  }
  public rM2: any = {
    url: '../../assets/img/ATImages/location/RM2.png',
    scaledSize: { height: 15, width: 15 },
  }
  public recovery: any = {
    url: '../../assets/img/ATImages/location/Recovery Pt.png',
    scaledSize: { height: 15, width: 15 },
  }
  public nal: any = {
    url: '../../assets/img/ATImages/location/NAL.png',
    scaledSize: { height: 15, width: 15 },
  }

  public IconMoving: any = {
    url: '../../assets/img/ATImages/movementState/moving.png',
    scaledSize: { height: 30, width: 30 },
  }

  onGridReady(params: any): void {
    this.api = params.api
    this.api.sizeColumnsToFit()
  }

  copyContent(item: any) {
    //    document.addEventListener('copy', (e: ClipboardEvent) => {
    //      e.clipboardData.setData('text/plain', (item));
    //      e.preventDefault();
    //      document.removeEventListener('copy', null);
    //    });
    //    document.execCommand('copy');
  }

  copyData(markerData: any) {
    this.copyContent(markerData.TrackerID)
    this.toastr.success('Copied')
  }

  locationTags: any = [
    {
      LocationType: 'Client',
      Tag: 'Costco',
      CellularRadius: 3000,
      WifiRadius: 100,
    },
    {
      LocationType: 'Client',
      Tag: 'Tyson',
      CellularRadius: 3000,
      WifiRadius: 100,
    },
    {
      LocationType: 'RM2s',
      Tag: 'RM2',
      CellularRadius: 3000,
      WifiRadius: 100,
    },
  ]
  clientData: any = [
    {
      EnterpriseID: '5c862f42-2f94-45d0-8ae3-1f1ad885678b',
      id: '10353667-1dcb-437f-9e4b-99350a5422b3',
      Address: '22633 SAVI RANCH PKWY, YORBA LINDA, CA - 92887-4664',
      Locations: {
        name: 'COSTCO DC YORBA LINDA WAREHOUSE',
        type: 'Point',
        Longitude: -117.743,
        Latitude: 33.875,
      },
      LocationType: 'Client',
      Tag: 'Costco',
      CellularRadius: 3000,
      WifiRadius: 100,
    },
    {
      EnterpriseID: '5c862f42-2f94-45d0-8ae3-1f1ad885678b',
      id: '2bd0e9f6-fe54-40c1-aa5e-839abc8032ac',
      Address: '20 STEW LEONARD DR, YONKERS, NY - 10710-7204',
      Locations: {
        name: 'COSTCO DC YONKERS WAREHOUSE',
        type: 'Point',
        Longitude: -73.863,
        Latitude:40.973
      },
      LocationType: 'RM2',
      Tag: 'Costco',
      CellularRadius: 6000,
      WifiRadius: 100,
    },
    {
      EnterpriseID: '5c862f42-2f94-45d0-8ae3-1f1ad885678b',
      id: '24461bc2-838c-4a78-9c94-f17ebfa324ac',
      Address: '4901 WILSON AVE SW, WYOMING, MI - 49418-8788',
      Locations: {
        name: 'COSTCO DC WYOMING WAREHOUSE',
        type: 'Point',
        Longitude: -85.763,
        Latitude: 42.876
      },
      LocationType: 'Recovery Pt',
      Tag: 'Costco',
      CellularRadius: 3000,
      WifiRadius: 100,
      paths: [
    
        {"lng": -88.15503797473288,"lat": 44.57766200062239},
        {"lng": -83.14527234973288,"lat":45.447518508175826},
        {"lng":-82.88160047473288,"lat":40.50012907128214},
        {"lng":-88.94605359973288,"lat": 40.4332633577303},
        {"lng": -88.15503797473288,"lat": 44.57766200062239},
      ]

    },
  ]
  currMarker : any = null

  latitude = 35.384357
  longitude = -100.790756
  zoom = 4
  color = 'green'
  profileData: any
  modelData: any
  public dropdownSettings: IDropdownSettings = {}
  public clientList: any = []
  trackerHistoryData: any
  public rowSelection = 'single'
  trackerId: any = ''
  currentStartDate: any
  currentEndDate: any
  latlng: Array<Array<any>> = []
  deviceStr: any = null
  public map: any
  public popup: any
  public clientLocationList: any[]
  public clientDisplay: any
  public markerdisable: boolean = false
  public showJourney: boolean = false
  drawingManager: any
  currentDrawing: any = null
  shapeParam: any = null
  radiusLat = 0
  radiusLong = 0
  public JourneyTab: boolean = true
  public QueryTab: boolean = true
  public customControl: boolean = true
  selectedLocation: any = {}
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'Tag',
      textField: 'Tag',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    }
    this.clientLocationList = []
  }
  @ViewChild('search') searchElementRef: ElementRef

  ngAfterViewInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder()

      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
      )
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace()
          this.markerdisable = true

          if (place.geometry === undefined || place.geometry === null) {
            return
          }

          this.latitude = place.geometry.location.lat()
          this.longitude = place.geometry.location.lng()
          this.zoom = 12
          this.cd.detectChanges()
        })
      })
    })

    this.deviceStr = this.route.snapshot.paramMap.get('deviceStr')
    if (this.deviceStr != null && this.deviceStr !== '') {
      this.trackerId = this.deviceStr.trim()
      let startDate = new Date()
      this.journey()
    }
  }
  onMapReady(event: any) {
    this.map = event
    this.initDrawingManager(event)
  }

  onPathChange(params:any){
    console.log(params)
  }
  initDrawingManager(map: any) {
    console.log('Drawing')
    const drawingOptions = {
      drawingMode: null,

      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          // google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.RECTANGLE,
        ],
      },
      circleOptions: {
        fillColor: '#0000ff',
        fillOpacity: 0.2,
        strokeWeight: 1,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: '#00ffff',
        fillOpacity: 0.2,
        strokeWeight: 1,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: '#0000ff',
        fillOpacity: 0.2,
        strokeWeight: 1,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    }

    if (map !== null) {
      this.drawingManager = new google.maps.drawing.DrawingManager(
        drawingOptions,
      )
      this.drawingManager.setMap(map)
    } else {
      this.drawingManager.setMap(map)
    }

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event) => this.createDrawingParam(event),
    )
  }

  createDrawingParam(event: any) {
    console.log(event)
    if (this.currentDrawing != null) {
      this.currentDrawing.overlay.setMap(null)
      this.currentDrawing = null
    }
    switch (event.type) {
      case 'circle': {
        let circleCoordinates = event.overlay.center.toJSON()
        this.shapeParam = {
          array: [
            { coordinates: [circleCoordinates.lng, circleCoordinates.lat] },
          ],
          radius: event.overlay.radius,
        }
        break
      }
      case 'polygon': {
        let polygonCoordinates = event.overlay
          .getPath()
          .getArray()
          .map((x: { toJSON: () => any }) => x.toJSON())

        this.shapeParam = {
          array: [],
          radius: 0,
        }
        for (var j = 0; j < polygonCoordinates.length; j++) {
          this.shapeParam.array.push({
            coordinates: [polygonCoordinates[j].lng, polygonCoordinates[j].lat],
          })
        }
        console.log(this.shapeParam)
        break
      }
      case 'rectangle': {
        let rectangleCoordinates = event.overlay.bounds.toJSON()
        this.shapeParam = {
          array: [],
          radius: 0,
        }
        this.shapeParam.array.push({
          coordinates: [rectangleCoordinates.west, rectangleCoordinates.north],
        })

        this.shapeParam.array.push({
          coordinates: [rectangleCoordinates.west, rectangleCoordinates.south],
        })

        this.shapeParam.array.push({
          coordinates: [rectangleCoordinates.east, rectangleCoordinates.south],
        })

        this.shapeParam.array.push({
          coordinates: [rectangleCoordinates.east, rectangleCoordinates.north],
        })

        console.log(this.shapeParam)
        this.shapeText = ''

        break
      }
      default: {
        this.shapeParam = null
      }
    }
    this.currentDrawing = event
    this.drawingManager.setDrawingMode(null)
    this.shapeText = JSON.stringify(this.shapeParam)
    console.log(this.shapeText)
    this.cd.detectChanges()
  }

  ngOnInit(): void {
    this.populateModelList()
    this.populateLocationList()
    this.populateProfileList()

    this.directionObject.north = this.latitude + 1
    this.directionObject.south = this.latitude - 1
    this.directionObject.east = this.longitude + 1
    this.directionObject.west = this.longitude - 1
    this.prevLat = this.latitude
    this.prevLng = this.longitude
  }

  showGeofence(marker: any){
    console.log("marker");
    console.log(marker);
    this.currMarker=marker;

//    this.currMarker
  }

  public populateModelList() {
    /*    this.blockchainservice.makeRequestWithoutParameter('/TrackerModel.svc/GetDeviceModel')
      .subscribe((response: any[]) => {
        this.modelData = response;
        this.modelData.sort((a, b) => (a.model < b.model ? -1 : 1));
      },
        (err: string) => {
          alert("Error " + err);
        });*/
  }
  public populateLocationList() {
    const payloadData1 = {
      EnterpriseID: localStorage.getItem('EnterpriseID'),
    }

    /*    this.blockchainservice.makeRequest(payloadData1, '/Locations.svc/GetAllReportingGroup')
      .subscribe((response: any[]) => {
        this.clientData = response.filter(x => x?.Tag);
        this.clientData.sort((a, b) => (a.Tag < b.Tag ? -1 : 1));
        this.cd.detectChanges();
      },
        (err: string) => {
          alert("Error " + err);
        });*/
  }

  getLocationIcon(locationType: string){
    let urlStr:string="../../assets/img/ATImages/location/"+locationType+".png";
    var tIcon:any = {
      url: urlStr,
      scaledSize: { height: 20, width: 20 },
    }
    return tIcon;
  }

  onMapClicked(event: any) {
    console.log(event);
    this.latitude = event.coords.lat;
    this.longitude = event.coords.lng;
    this.selectedLocation = "Select Location Type";
    this.getMapClickAddress(this.latitude, this.longitude);
    this.locationLatitude = this.latitude;
    this.locationLongitude = this.longitude;
  }

  getMapClickAddress(latitude: number, longitude: number) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results: any, status: any) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          // this.zoom = 12;
          this.locationAddress = results[0].formatted_address;
          this.locationName = results[0].address_components[0].long_name;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
    // return this.address;
  }
  public populateProfileList() {
    /*    this.blockchainservice.makeRequestWithoutParameter('/Profiles.svc/DeviceProfileList')
      .subscribe((response: any[]) => {
        this.profileData = response;
        this.profileData.sort((a, b) => (a.profile < b.profile ? -1 : 1));
        this.cd.detectChanges();
      },
        (err: string) => {
          alert("Error " + err);
        });*/
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude
        this.longitude = position.coords.longitude
        this.zoom = 8
        this.getAddress(this.latitude, this.longitude)
      })
    }
  }

  getAddress(latitude: any, longitude: any) {
    /*    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });*/
  }

  selectedModel: any
  onModelChange(event: any) {
    this.selectedModel = event
  }

  selectedProfile: any
  onProfileChange(event: any) {
    this.selectedProfile = event
  }

  selectedTag: any
  onClientChange(event: any) {
    if (event == '') {
      this.data = []
    }
    this.selectedTag = event
  }
  typeChange: any
  onTypeChange(event: any) {
    this.typeChange = event
  }
  public getClientLocations() {
    let comma = ''
    this.clientLocationList.forEach((element) => {
      comma += '"' + element + '"' + ','
    })
    this.showSpinner = true
    this.showMap = false
    this.cd.detectChanges()
    const payloadData = {
      EnterpriseID: localStorage.getItem('EnterpriseID'),
      Tag: comma.replace(/,(?=\s*$)/, ''),
    }

    this.clientDisplay = []
    /*    this.blockchainservice.makeRequest(payloadData, '/Locations.svc/GetAllTagLocation').subscribe((locationData: any[]) => {
      this.clientDisplay = locationData;
      this.clientDisplay.forEach(element => {
        element.CellularRadius = parseInt(element.CellularRadius);
      });
      this.showSpinner = false;
      this.showMap = true;
      this.cd.detectChanges();
    },

      (err: string) => {
        alert("Error " + err);
        this.showSpinner = false;
        this.showMap = true;
        this.cd.detectChanges();
      });*/
  }

  onItemSelect(item: any) {
    if (item != null) {
      this.clientLocationList.push(item.Tag)
      this.getClientLocations()
      if (this.clientLocationList.length == 1) {
        this.initDrawingManager(this.map)
      }
      this.cd.detectChanges()
    } else {
      this.clientLocationList.push(item.Tag)
      this.getClientLocations()
    }
  }

  onDeSelect(item: any) {
    this.clientLocationList = this.clientLocationList.filter(
      (x) => x !== item.Tag,
    )
    if (this.clientLocationList.length > 0) {
      this.getClientLocations()
    } else {
      this.initDrawingManager(null)
      this.clientDisplay = []
      this.locationName = ''
      this.locationAddress = ''
    }
  }

  onDeSelectAll(item: any) {
    this.showSpinner = true
    this.showMap = false
    this.cd.detectChanges()
    this.clientDisplay = []
    this.clientLocationList = []
    this.showSpinner = false
    this.showMap = true
    this.initDrawingManager(null)
    this.cd.detectChanges()
  }
  onSelectAll(items: any) {
    this.clientLocationList = []
    items.forEach((element: { Tag: any }) => {
      this.clientLocationList.push(element.Tag)
    })
    this.getClientLocations()
    this.initDrawingManager(this.map)
  }

  onSelectionChanged() {
    const selectedRows = this.api.getSelectedRows()
    ;(document.querySelector('#selectedRows') as any).innerHTML =
      selectedRows.length === 1 ? selectedRows[0] : ''
  }

  public LocationSymbolClicked(e: any): void {
    //Make sure the event occurred on a point feature.
    /*    if (e.shapes && e.shapes.length > 0 && e.shapes[0].getType() === 'Point') {
      var properties = e.shapes[0].getProperties();

      // Set the popup options.
      this.popup.setOptions({
        //Update the content of the popup.
        content: atlas.PopupTemplate.applyTemplate({
          'Location Name': properties.LocationName,
          'Client Name': properties.ClientName,

        }),

        //Update the position of the popup with the pins coordinate.
        position: e.shapes[0].getCoordinates()
      });

      // Open the popup.
      this.popup.open(this.map);
    }*/
  }

  lastkeydown1: number = 0
  userList1: any
  getUserIdsFirstWay($event: any) {
    let userId = (<HTMLInputElement>document.getElementById('userIdFirstWay'))
      .value
    this.userList1 = []

    if (userId.length > 2) {
      if ($event.timeStamp - this.lastkeydown1 > 200) {
        this.userList1 = this.searchFromArray(this.modelData, userId)
      }
    }
  }

  searchFromArray(arr: any, regex: any) {
    let matches = [],
      i
    for (i = 0; i < arr.length; i++) {
      if (arr[i].id.match(regex)) {
        matches.push(arr[i])
      }
    }
    return matches
  }

  drawRectangle: any = false
  // showRectangleButton: any = false;
  getRectangleData() {
    this.drawRectangle = !this.drawRectangle
    //this.showRectangleButton = true;
  }
  directionObject: any = {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  }
  prevLat: any
  prevLng: any
  centerChange(event: any) {
    // this.showRectangleButton = true;
    this.prevLat = event.lat
    this.prevLng = event.lng
    this.directionObject.north = event.lat - 1
    this.directionObject.south = event.lat + 1
    this.directionObject.east = event.lng + 1
    this.directionObject.west = event.lng - 1
  }

  deltaLat: any
  deltaLng: any
  newLat: any
  newLng: any
  dragChange(event: any) {
    //this.showRectangleButton = true;
    console.log(event)
    this.newLat = event.coords.lat
    this.newLng = event.coords.lng
    this.deltaLat = this.newLat - this.prevLat
    this.deltaLng = this.newLng - this.prevLng
    this.directionObject.north = this.directionObject.north + this.deltaLat
    this.directionObject.south = this.directionObject.south + this.deltaLat
    this.directionObject.east = this.directionObject.east + this.deltaLng
    this.directionObject.west = this.directionObject.west + this.deltaLng
  }

  boundsChange(event: any) {
    console.log(event)
    // this.showRectangleButton = true;
    this.directionObject.north = event.north
    this.directionObject.south = event.south
    this.directionObject.east = event.east
    this.directionObject.west = event.west
  }

  markerLatitude: number = 0
  markerLongitude: number = 0
  address1: any
  locationName1: any
  tag: any
  markerClickedData: any
  previous: any
  onMarkerClicked(event: any, infoWindow: any) {
    if (this.previous) {
      this.previous.close()
    }
    this.previous = infoWindow
    console.log(event)
    this.markerClickedData = event
    this.markerLatitude = event.Locations.latitude
    this.markerLongitude = event.Locations.longitude
    this.address1 = event.Address
    this.locationName1 = event.LocationName
    this.tag = event.Tag
  }
  OnLocationMarkerClick(event: any) {
    //this.selectedLocation = event;
    this.locationName = event.Locations.name
    this.locationParam = JSON.stringify(event.ShapeQueryParam.Geofence)
    this.locationAddress = event.Address
    this.locationLatitude = event.Locations.latitude
    this.locationLongitude = event.Locations.longitude
  }
  navigate(markerData: any) {
    let navigationParam = `${markerData.Latitude}%2C${markerData.Longitude}`
    let url = `https://www.google.com/maps/search/?api=1&query=${navigationParam}`
    window.open(url, '_blank')
  }
  onJourneyInfo(markerData: any) {
    this.trackerId = markerData.TrackerID.trim()
    let startDate = new Date(markerData.EventTime - 30 * 24 * 15 * 60 * 60 * 60)
    let endDate = new Date(markerData.EventTime)
    this.cd.detectChanges()
    this.journey()
  }
  latLngData: any = []
  drawPolyline: any = false
  bounds: any
  trackerIdCheck: any
  journey() {
    this.showSpinner = true
    this.showMap = true
    const payloadValidTrackerData = {
      TrackerID: this.trackerId.trim(),
    }
    /*    this.blockchainservice.makeRequest(payloadValidTrackerData, '/Trackers.svc/ValidTracker')
      .subscribe((response: any[]) => {
        this.trackerIdCheck = response;
      },
        (err: string) => {
          alert("Error " + err);
        });
    if (this.trackerIdCheck == "Invalid Tracker") {
      this.toastr.error('Invalid Tracker ID!!');
      return;
    }
    else {
      const payloadData = {
        "EventTime": {
          "startdate": parseInt(this.utilityService.convertDateToAPIFormat(this.currentStartDate))
          , "enddate": parseInt(this.utilityService.convertDateToAPIFormat(this.currentEndDate))
        },
        "TrackerID": this.trackerId.trim()
      }
      this.blockchainservice.makeRequestWithoutEnterpriseId(payloadData, '/Trackers.svc/TrackerHistory')
        .subscribe((response: any[]) => {
          if (response.length == 0) {
            this.showSpinner = false;
            this.showMap = true;
            //this.gridMarkers = response;
            //this.trackerIdData = response;
            this.cd.detectChanges();
            this.toastr.error('No records found!!');
          }
          else {
            this.latLngData = response;
            this.trackerIdData = response;
            this.showRectangle = true;
            this.latLngData.sort((a, b) => (a.EventTime < b.EventTime ? -1 : 1));
            this.showSpinner = false;
            this.latlng = [];
            this.latLngData.forEach(element => {
              if (element.Latitude != null && element.Longitude != null) {
                this.latlng.push([element.Latitude, element.Longitude]);
              }
            });
            this.cd.detectChanges();
            this.mapsAPILoader.load().then(() => {
              this.bounds = new google.maps.LatLngBounds();
              for (let tLog of this.latLngData) {
                if (tLog.Latitude && tLog.Longitude) {
                  this.bounds.extend(new google.maps.LatLng(tLog.Latitude, tLog.Longitude));
                }
              }
              this.cd.detectChanges();
            })
          }
        },
          (err: string) => {
            alert("Error " + err);
          });
    }*/
  }

  data: any = []
  shapeText: string = ''
  gridMarkers: any = []
  trackerIdData: any = []
  showMap = true
  showRectangle = true
  fetchData() {
    const payloadData = {
      LocationType: null,
      Origin: null,
      Model: null,
      profile: null,
      EnterpriseID: localStorage.getItem('EnterpriseID'),
      location: this.shapeParam,
    }
    this.showSpinner = true
    this.showMap = false
    this.cd.detectChanges()
  }

  SaveParam() {
    const payloadData = {
      Address: this.locationAddress,
      EnterpriseID: localStorage.getItem('EnterpriseID'),
      Locations: {
        latitude: this.locationLatitude,
        longitude: this.locationLongitude,
        name: this.locationName,
      },
      Geofence: this.shapeParam,
    }
    /*    this.blockchainservice.makeRequest(payloadData, '/Locations.svc/Update').subscribe((data: any[]) => {
      this.toastr.success('Data Saved Successfully', 'Success');
      this.locationDataList.push(payloadData);
    })*/
  }

  TypeList: Array<any> = ['locoaware', 'eliot']

  MapTypeList: Array<any> = ['roadmap', 'satellite', 'hybrid', 'terrain']

  selectedMapType: string = 'roadmap'

  changeMapType(mapType: any) {
    this.selectedMapType = mapType
  }

  getAllLocation() {
    const payloadData = {
      EnterpriseID: localStorage.getItem('EnterpriseID'),
    }
    /*    this.blockchainservice.makeRequest(payloadData, '/Locations.svc/GetAllLocations').subscribe((data: any[]) => {
      this.locationDataList = data;
      this.showSpinner = false;
      this.cd.detectChanges();
    })*/
  }

  getLocationDetails(event: any) {
    this.locationName = event.Locations.name
    this.locationAddress = event.Address
  }

  AllReportEditable(event: any) {}
}
