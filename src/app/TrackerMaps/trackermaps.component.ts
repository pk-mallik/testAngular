import { MapsAPILoader } from '@agm/core';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { factors } from '@turf/turf';
import {
    ColDef, ColumnApi,
    CsvExportParams, GridApi, GridOptions
} from 'ag-grid-community';
import { BlockChainService } from 'app/services/blockchainService/blockchain.service';
import { UtilityService } from 'app/utils/utility.service';
import * as atlas from 'azure-maps-control';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { AgmDrawingManager } from '@agm/drawing';

@Component({
    selector: 'app-trackermaps',
    templateUrl: './trackermaps.component.html',
    styleUrls: ['./trackermaps.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TrackerMapsComponent implements OnInit {

    private api: GridApi;
    private columnApi: ColumnApi;
    public showSpinner: boolean = false;
    private geoCoder;
    address: string;
    name: string;
    locationName: string = '';
    locationLatitude: number;
    locationLongitude: number;
    locationAddress: string;
    celldata: boolean;
    drawingManager :any;

    //trackerId: string = '';
    onGridReady(params): void {
        this.api = params.api;
        // this.columnApi = params.columnApi;  
        // this.gridOptions.api = params.api;
        this.api.sizeColumnsToFit();
    }

    copyContent(item) {
        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', (item));
            e.preventDefault();
            document.removeEventListener('copy', null);
        });
        document.execCommand('copy');
    }

    copyData(markerData) {
        this.copyContent(markerData.TrackerID);
    }

    latitude = 35.384357;
    longitude = -100.790756;
    zoom = 4;
    color = "green";
    profileData: any;
    modelData: any;
    clientData: any = [];
    public dropdownSettings: IDropdownSettings = {};
    public clientList: any = [];
    trackerHistoryData: any;
    public rowSelection = 'single';
    trackerId: any = '';
    currentStartDate: any;
    currentEndDate: any;
    latlng: Array<Array<any>> = [];
    deviceStr = '';
    public map: any;
    public popup: any;
    public clientLocationList: any[];
    public clientDisplay: any;
    public markerdisable: boolean = false;
    public searchGrid: boolean;
    public showJourney: boolean = false;
    // Radius
    //radius = 50000;
    radiusLat = 0;
    radiusLong = 0;

    constructor(private mapsAPILoader: MapsAPILoader, private toastr: ToastrService, private blockchainservice: BlockChainService, private cd: ChangeDetectorRef, private ngZone: NgZone,
        private utilityService: UtilityService, private datepipe: DatePipe, private route: ActivatedRoute, private router: Router) {

        this.dropdownSettings = {
            singleSelection: false,
            idField: 'ClientID',
            textField: 'ClientName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true
        };
        this.clientLocationList = [];
    }
    @ViewChild('search') searchElementRef: ElementRef;

    ngAfterViewInit(): void {
        this.mapsAPILoader.load().then(() => {
            //this.setCurrentLocation();
            this.geoCoder = new google.maps.Geocoder;

            let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
            autocomplete.addListener("place_changed", () => {
                this.ngZone.run(() => {
                    let place: google.maps.places.PlaceResult = autocomplete.getPlace();
                    this.markerdisable = true;

                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }

                    this.latitude = place.geometry.location.lat();
                    this.longitude = place.geometry.location.lng();
                    this.zoom = 12;
                    this.cd.detectChanges();
                });
            });
        });

        this.deviceStr = this.route.snapshot.paramMap.get("deviceStr");
        if ((this.deviceStr != null) && (this.deviceStr !== "")) {
            this.trackerId = this.deviceStr.trim();
            let startDate = new Date();
            this.currentStartDate = this.datepipe.transform(startDate.setMonth(startDate.getMonth() - 3), 'yyyy-MM-ddTHH:mm');
            this.currentEndDate = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm');
            this.journey();
        }
    }
    onMapReady(event : any){
        this.map = event
        this.initDrawingManager(event)  
      }
    
      initDrawingManager(map:any) {
        console.log("Drawing")
        this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.CIRCLE,
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
          });
      
          this.drawingManager.setMap(map);
    }
    

    ngOnInit(): void {
        this.currentStartDate = this.datepipe.transform(new Date().getTime() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-ddTHH:mm');
        this.currentEndDate = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm');

        this.directionObject.north = this.latitude + 1;
        this.directionObject.south = this.latitude - 1;
        this.directionObject.east = this.longitude + 1;
        this.directionObject.west = this.longitude - 1;
        this.prevLat = this.latitude;
        this.prevLng = this.longitude;

        const payloadData = {
            "company": "RM2",
            "IsDeleted": false
        }

        this.blockchainservice.makeRequest(payloadData, '/Profiles.svc/ProfileList')
            .subscribe((response: any[]) => {
                this.profileData = response;
                this.profileData.sort((a, b) => (a.name < b.name ? -1 : 1));
                this.cd.detectChanges();
            },
                (err: string) => {
                    alert("Error " + err);
                });

        const payloadData1 = {
            "EnterpriseID": localStorage.getItem('EnterpriseID')
        }
        //this.getClientLocations();
        this.blockchainservice.makeRequest(payloadData1, '/Client.svc/Query')
            .subscribe((response: any[]) => {
                this.clientData = response;
                //this.clientList = response.map(x=>x.ClientName);
                this.clientData.sort((a, b) => (a.ClientName < b.ClientName ? -1 : 1));
                this.cd.detectChanges();
            },
                (err: string) => {
                    alert("Error " + err);
                });

        this.blockchainservice.makeRequestWithoutParameter('/TrackerModel.svc/query')
            .subscribe((response: any[]) => {
                this.modelData = response;
                this.modelData.sort((a, b) => (a.id < b.id ? -1 : 1));
                this.cd.detectChanges();
            },
                (err: string) => {
                    alert("Error " + err);
                });

    }

    private setCurrentLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.zoom = 8;
                this.getAddress(this.latitude, this.longitude);
            });
        }
    }


    getAddress(latitude, longitude) {
        this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
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

        });
    }

    selectedModel: any;
    onModelChange(event: any) {
        this.selectedModel = event;
    }

    selectedProfile: any;
    onProfileChange(event) {
        this.selectedProfile = event;
    }

    selectedClient: any;
    onClientChange(event) {
        this.selectedClient = event;
    }
    typeChange: any;
    onTypeChange(event) {
        this.typeChange = event;
    }
    public getClientLocations() {
        let comma = '';
        this.clientLocationList.forEach(element => {
            comma += "'" + element + "'" + ',';
        });
        this.showSpinner = true;
        this.showMap = false;
        this.cd.detectChanges();
        const payloadData = {
            "ClientID": comma.replace(/,(?=\s*$)/, '')
        }

        this.clientDisplay = [];
        this.blockchainservice.makeRequest(payloadData, '/Locations.svc/ClientLocation').subscribe((locationData: any[]) => {
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
            });
    }

    onItemSelect(item: any) {
        this.clientLocationList.push(item.ClientID);
        this.getClientLocations();
    }

    onDeSelect(item: any) {
        this.clientLocationList = this.clientLocationList.filter(x => x !== item.ClientID);
        if (this.clientLocationList.length > 0) {
            this.getClientLocations();
        }
        this.clientDisplay = [];
    }

    onDeSelectAll(item: any) {
        this.showSpinner = true;
        this.showMap = false;
        this.cd.detectChanges();
        this.clientDisplay = [];
        this.clientLocationList = [];
        this.showSpinner = false;
        this.showMap = true;
        this.cd.detectChanges();
    }
    onSelectAll(items: any) {
        this.clientLocationList = [];
        items.forEach(element => {
            this.clientLocationList.push(element.ClientID);
        });
        this.getClientLocations();
    }

    onSelectionChanged() {
        const selectedRows = this.api.getSelectedRows();
        (document.querySelector('#selectedRows') as any).innerHTML =
            selectedRows.length === 1 ? selectedRows[0] : '';
    }

    public LocationSymbolClicked(e): void {
        //Make sure the event occurred on a point feature.
        if (e.shapes && e.shapes.length > 0 && e.shapes[0].getType() === 'Point') {
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
        }
    }
    clearData() {
        this.data = [];
        this.gridMarkers = [];
        this.trackerIdData = [];
        this.searchGrid = false;
        this.showGrid = true;
        this.latitude = 35.384357;
        this.longitude = -100.790756;
        this.showRectangle = false;
    }

    lastkeydown1: number = 0;
    userList1: any;
    getUserIdsFirstWay($event) {
        let userId = (<HTMLInputElement>document.getElementById('userIdFirstWay')).value;
        this.userList1 = [];

        if (userId.length > 2) {
            if ($event.timeStamp - this.lastkeydown1 > 200) {
                this.userList1 = this.searchFromArray(this.modelData, userId);
            }
        }
    }

    searchFromArray(arr, regex) {
        let matches = [], i;
        for (i = 0; i < arr.length; i++) {
            if (arr[i].id.match(regex)) {
                matches.push(arr[i]);
            }
        }
        return matches;
    };

    drawRectangle: any = false;
    // showRectangleButton: any = false;
    getRectangleData() {
        this.drawRectangle = !this.drawRectangle;
        //this.showRectangleButton = true;
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
        // this.showRectangleButton = true;
        console.log(event);
        this.prevLat = event.lat;
        this.prevLng = event.lng;
        this.directionObject.north = event.lat - 1;
        this.directionObject.south = event.lat + 1;
        this.directionObject.east = event.lng + 1;
        this.directionObject.west = event.lng - 1;
    }

    deltaLat: any;
    deltaLng: any;
    newLat: any;
    newLng: any;
    dragChange(event: any) {
        //this.showRectangleButton = true;
        console.log(event);
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
        console.log(event);
        // this.showRectangleButton = true;
        this.directionObject.north = event.north;
        this.directionObject.south = event.south;
        this.directionObject.east = event.east;
        this.directionObject.west = event.west;
    }

    markerLatitude: number;
    markerLongitude: number;
    markerClickedData: any;
    previous;
    onMarkerClicked(event, infoWindow) {
        if (this.previous) {
            this.previous.close();
        }
        this.previous = infoWindow;
        console.log(event);
        this.markerClickedData = event;
        this.markerLatitude = event.Locations.latitude;
        this.markerLongitude = event.Locations.longitude;
    }

    navigate(markerData) {
        let navigationParam = `${markerData.Latitude}%2C${markerData.Longitude}`;
        let url = `https://www.google.com/maps/search/?api=1&query=${navigationParam}`
        window.open(url, "_blank");
    }
    onJourneyInfo(markerData) {
        this.trackerId = markerData.TrackerID.trim();
        let startDate = new Date(markerData.EventTime - 30 * 24 * 15 * 60 * 60 * 60);
        let modifiedStartDate = this.datepipe.transform(startDate, 'yyyy-MM-ddThh:mm');
        let endDate = new Date(markerData.EventTime);
        let modifiedEndDate = this.datepipe.transform(endDate, 'yyyy-MM-ddThh:mm');
        this.currentStartDate = modifiedStartDate;
        this.currentEndDate = modifiedEndDate;
        this.cd.detectChanges();
        this.journey();
    }
    latLngData: any = [];
    drawPolyline: any = false;
    bounds: any;
    trackerIdCheck: any;
    journey() {
        // this.showRectangle = false;
        this.showSpinner = true;
        this.showMap = true;
        this.showGrid = false;
        const payloadValidTrackerData = {
            "TrackerID": this.trackerId.trim()
        }
        this.blockchainservice.makeRequest(payloadValidTrackerData, '/Trackers.svc/ValidTracker')
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
                        this.showGrid = false;
                        this.gridMarkers = [];
                        this.cd.detectChanges();
                        this.toastr.error('No records found!!');
                    }
                    else {
                        this.latLngData = response;
                        this.trackerIdData = response;
                        this.searchGrid = false;
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
        }
    }

    onBlurMethod() {
        this.gridMarkers = [];
        this.trackerIdData = [];
        if (this.trackerId != "") {
            this.showRectangle = false;
            this.showJourney = true;
        }
        else {
            this.showJourney = false;
        }
    }

    data: any = [];
    gridMarkers: any = [];
    trackerIdData: any = [];
    showMap = true;
    showGrid = true;
    showRectangle = true;
    fetchData() {
        // this.showRectangleButton = false;
        if (this.trackerId != '' && (this.currentStartDate == undefined || this.currentStartDate == '') && (this.currentEndDate == undefined || this.currentEndDate == '')) {
            this.toastr.error("Please Enter Date Range.");
            return;
        }

        if (new Date(this.currentEndDate) < new Date(this.currentStartDate)) {
            this.toastr.error("End Date should be greater than Start Date");
            return;
        }
        // this.showMap = false;
        this.showGrid = false;
        // this.showRectangle = false;
        this.selectedClient = this.selectedClient == '' ? undefined : this.selectedClient;
        this.typeChange = this.typeChange == '' ? undefined : this.typeChange;
        this.selectedModel = this.selectedModel == '' ? undefined : this.selectedModel;
        this.selectedProfile = this.selectedProfile == '' ? undefined : this.selectedProfile;
        if ((this.trackerId == '' && (this.selectedClient == undefined && this.typeChange == undefined &&
            this.selectedModel == undefined && this.selectedProfile == undefined) && this.drawRectangle == false)) {
            this.showMap = false;
            this.gridMarkers = [];
            this.data = [];
            this.toastr.error("Please enter Tracker ID and atleast any Select Dropdown or draw Rectangle.");
            return;
        }
        else {
            if (this.trackerId == '') {
                const payloadData = {
                    "ClientID": this.selectedClient == "" ? null : this.selectedClient,
                    "Origin": this.typeChange == "" ? null : this.typeChange,
                    "Model": this.selectedModel == "" ? null : this.selectedModel,
                    "profile": this.selectedProfile == "" ? null : this.selectedProfile,
                    "location": this.drawRectangle ? {
                        "east": this.directionObject.east,
                        "north": this.directionObject.north,
                        "south": this.directionObject.south,
                        "west": this.directionObject.west
                    } : null
                }
                this.showSpinner = true;
                this.showMap = false;
                this.cd.detectChanges();
                this.blockchainservice.makeRequest(payloadData, '/Trackers.svc/QueryMapData')
                    .subscribe((response: any[]) => {
                        this.data = response;
                        this.searchGrid = true;
                        this.gridMarkers = response;
                        this.showSpinner = false;
                        this.showMap = true;
                        this.showGrid = true;
                        this.drawRectangle = false;
                        this.cd.detectChanges();
                        if (this.data.length > 1) {
                            this.mapsAPILoader.load().then(() => {
                                this.bounds = new google.maps.LatLngBounds();
                                for (let tLog of this.data) {
                                    if (tLog.Latitude && tLog.Longitude) {
                                        this.bounds.extend(new google.maps.LatLng(tLog.Latitude, tLog.Longitude));
                                        // this.bounds.extend(new google.maps.LatLng(this.data[3].Latitude, this.data[3].Longitude));
                                    }
                                }
                                console.log(this.bounds);
                                this.cd.detectChanges();
                            });
                        }
                    },
                        (err: string) => {
                            alert("Error " + err);
                            this.showMap = true;
                            this.cd.detectChanges();
                        });
            }
            else {
                this.journey();
            }
        }
    }

    // fetchRectangleData() {
    //       this.showMap = false;
    //       this.showGrid = false;
    //      // this.showRectangle = false;
    //      this.showRectangleButton = false;
    //       this.selectedClient = this.selectedClient == '' ? undefined : this.selectedClient;
    //       this.typeChange = this.typeChange == '' ? undefined : this.typeChange;
    //       this.selectedModel = this.selectedModel == '' ? undefined : this.selectedModel;
    //       this.selectedProfile = this.selectedProfile == '' ? undefined : this.selectedProfile;
    //       if ((this.trackerId == '' && (this.selectedClient == undefined && this.typeChange == undefined &&
    //           this.selectedModel == undefined && this.selectedProfile == undefined))) {
    //           this.toastr.error("Please enter Tracker ID or atleast any Select Dropdown.");
    //           return;
    //       }
    //       else {
    //           if (this.trackerId == '') {
    //               const payloadData = {
    //                   "ClientID": this.selectedClient == "" ? null : this.selectedClient,
    //                   "Origin": this.typeChange == "" ? null : this.typeChange,
    //                   "Model": this.selectedModel == "" ? null : this.selectedModel,
    //                   "profile": this.selectedProfile == "" ? null : this.selectedProfile,
    //                   "location": this.drawRectangle ? {
    //                       "east": this.directionObject.east,
    //                       "north": this.directionObject.north,
    //                       "south": this.directionObject.south,
    //                       "west": this.directionObject.west
    //                   } : null
    //               }
    //               this.showSpinner = true;
    //               this.blockchainservice.makeRequest(payloadData, '/Trackers.svc/QueryMapData')
    //                   .subscribe((response: any[]) => {
    //                       this.data = response;
    //                       this.gridMarkers = response;
    //                       this.showSpinner = false;
    //                       this.showMap = true;
    //                       this.showGrid = true;
    //                       this.cd.detectChanges();
    //                   },
    //                       (err: string) => {
    //                           alert("Error " + err);
    //                           this.showMap = true;
    //                           this.cd.detectChanges();
    //                       });
    //           }
    //           else {
    //               this.journey();
    //           }
    //       }
    //   }

    TypeList: Array<any> = ["locoaware", "eliot"];

    MapTypeList: Array<any> = ['roadmap', 'satellite', 'hybrid', 'terrain']

    selectedMapType: string = 'roadmap';

    changeMapType(mapType: any) {
        this.selectedMapType = mapType;
    }

    columnDefs: ColDef[] = [
        { headerName: 'Tracker ID', field: 'TrackerID', cellRenderer: this.createHyperLink.bind(this), filter: true, sortable: true },
        { headerName: 'Address', field: 'address', filter: true, sortable: true, tooltipField: 'address' },
        { headerName: 'Client Name', field: 'ClientName', filter: true, sortable: true },
        { headerName: 'Latitude', field: 'Latitude', filter: 'agNumberColumnFilter', sortable: true },
        { headerName: 'Longitude', field: 'Longitude', filter: 'agNumberColumnFilter', sortable: true },
        {
            headerName: 'Position Time', field: 'EventTime', filter: 'date', sortable: true,
            filterParams: {
                filterOptions: ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange'],
                // use inRangeInclusive: true for the range filter to include the selected 
                // from and to dates. Setting it false would fetch only the inbetween dates
                inRangeInclusive: true,
                comparator: function (filterLocalDateAtMidnight, cellValue) {
                    const datepipe: DatePipe = new DatePipe('en-US');
                    let convertedDate = datepipe.transform(cellValue, 'MM/dd/YYYY');
                    let searchedDate = datepipe.transform(filterLocalDateAtMidnight, 'MM/dd/YYYY');
                    if (searchedDate == convertedDate) {
                        return 0;
                    }
                    if (convertedDate < searchedDate) {
                        return -1;
                    }
                    if (convertedDate > searchedDate) {
                        return 1;
                    }
                }
            },
            cellRenderer: (data) => {
                if (!data.value || data.value === "0") {
                    return '';
                }
                let tDate = this.datepipe.transform(data.value, 'MM/dd/YYYY HH:mm:ss');
                return tDate;
            },
        },
        { headerName: 'Battery Level', field: 'BatteryLevel', filter: true, sortable: true },
        { headerName: 'Battery Voltage', field: 'BatteryVoltage', filter: true, sortable: true },
        { headerName: 'Battery State', field: 'BatteryState', filter: true, sortable: true },
        { headerName: 'Temperature', field: 'Temperature', filter: 'agNumberColumnFilter', sortable: true },
        { headerName: 'Tracker Type', field: 'Origin', filter: true, sortable: true },
        { headerName: 'Profile', field: 'profile', filter: true, sortable: true },
        { headerName: 'Model', field: 'Model', filter: true, sortable: true }
    ]



    columnDefs1: ColDef[] = [
        { headerName: 'Tracker ID', field: 'TrackerID', cellRenderer: this.createHyperLink.bind(this), filter: true, sortable: true },
        { headerName: 'Latitude', field: 'Latitude', filter: 'agNumberColumnFilter', sortable: true },
        { headerName: 'Longitude', field: 'Longitude', filter: 'agNumberColumnFilter', sortable: true },
        {
            headerName: 'Position Time', field: 'EventTime', filter: 'date', sortable: true,
            filterParams: {
                filterOptions: ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange'],
                // use inRangeInclusive: true for the range filter to include the selected 
                // from and to dates. Setting it false would fetch only the inbetween dates
                inRangeInclusive: true,
                comparator: function (filterLocalDateAtMidnight, cellValue) {
                    const datepipe: DatePipe = new DatePipe('en-US');
                    let convertedDate = datepipe.transform(cellValue, 'MM/dd/YYYY');
                    let searchedDate = datepipe.transform(filterLocalDateAtMidnight, 'MM/dd/YYYY');
                    if (searchedDate == convertedDate) {
                        return 0;
                    }
                    if (convertedDate < searchedDate) {
                        return -1;
                    }
                    if (convertedDate > searchedDate) {
                        return 1;
                    }
                }
            },
            cellRenderer: (data) => {
                if (!data.value || data.value === "0") {
                    return '';
                }
                let tDate = this.datepipe.transform(data.value, 'MM/dd/YYYY HH:mm:ss');
                return tDate;
            },
        },
        { headerName: 'Movement State', field: 'MovementState', filter: true, sortable: true },
        { headerName: 'Battery Level', field: 'BatteryLevel', filter: true, sortable: true },
        { headerName: 'Battery Voltage', field: 'BatteryVoltage', filter: true, sortable: true },
        { headerName: 'Battery State', field: 'BatteryState', filter: true, sortable: true },
        { headerName: 'Temperature', field: 'Temperature', filter: 'agNumberColumnFilter', sortable: true },
        { headerName: 'Tracker Type', field: 'Origin', filter: true, sortable: true },
        { headerName: 'Model', field: 'Model', filter: true, sortable: true }
    ]
    createHyperLink(params): any {
        if (params.value == '') { return; }
        const spanElement = document.createElement('span');
        var id = params.value
        //spanElement.innerHTML = '<a href="#/deviceDetails">' + id + '</a>';
        spanElement.innerHTML = '<a href="#/deviceDetails;deviceStr=' + id + '">' + id + '</a>';
        spanElement.addEventListener<"click">('click', this.toDeviceDetailsPage.bind(this, id));
        //spanElement.addEventListener<"click">('click',(id));
        return spanElement;
    }

    toDeviceDetailsPage(event) {
        this.router.navigate(['/deviceDetails', { deviceStr: event }]);

    }

    gridOptions: GridOptions = {
        "rowData": this.gridMarkers,
        "columnDefs": this.columnDefs,
    };

    gridOptions1: GridOptions = {
        "rowData": this.trackerIdData,
        "columnDefs": this.columnDefs1,
    };

    onExportClick() {
        let header = this.columnDefs.map(columnDef => {
            let id = columnDef.field || columnDef.colId;
            let headerName = columnDef.headerName;
            return headerName;
        });
        let a: any;
        let params: any = {
            fileName: 'Maps',
            // columnSeparator: ';',
            "allColumns": true,
            // skipHeader: true,
            columnKeys: this.columnDefs.map(c => c.field || c.colId).filter(c => !!c)
        };
        // params.customHeader = header.join(params.columnSeparator) + '\n';
        params.processCellCallback = function (cellParams) {
            if (cellParams && (cellParams.column.colId === 'EventTime')) {
                return new Date(parseInt(cellParams.value)).toLocaleDateString('en-GB') + ' ' +
                    new Date(parseInt(cellParams.value)).toLocaleTimeString(); //apply your timestamp formatter      
            } else if (cellParams && cellParams.column.colId === 'TrackerID') {
                return "'" + cellParams.value;
            } else
                return cellParams.value // no formatting
        }
        this.gridOptions.api.exportDataAsCsv(params);

    }
    onExportTrackerClick() {
        let header = this.columnDefs1.map(columnDef => {
            let id = columnDef.field || columnDef.colId;
            let headerName = columnDef.headerName;
            return headerName;
        });
        let a: any;
        let params: any = {
            fileName: 'TrackerJourney',
            // columnSeparator: ';',
            "allColumns": true,
            // skipHeader: true,
            columnKeys: this.columnDefs.map(c => c.field || c.colId).filter(c => !!c)
        };
        // params.customHeader = header.join(params.columnSeparator) + '\n';
        params.processCellCallback = function (cellParams) {
            if (cellParams && (cellParams.column.colId === 'EventTime')) {
                return new Date(parseInt(cellParams.value)).toLocaleDateString('en-GB') + ' ' +
                    new Date(parseInt(cellParams.value)).toLocaleTimeString(); //apply your timestamp formatter      
            } else if (cellParams && cellParams.column.colId === 'TrackerID') {
                return "'" + cellParams.value;
            } else
                return cellParams.value // no formatting
        }
        this.gridOptions1.api.exportDataAsCsv(params);

    }

    onFilterChanged(params: GridOptions) {
        this.showMap = false;
        this.cd.detectChanges();
        let tData = [];
        params.api?.forEachNodeAfterFilter(node => {
            tData.push(node.data);
        });
        //this.gridMarkers = tData;
        this.data = tData;
        this.showMap = true;
        this.cd.detectChanges();
    }
}
