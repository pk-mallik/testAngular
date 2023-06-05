import { NgZone, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IDropdownSettings, } from 'ng-multiselect-dropdown';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-test-grid',
  templateUrl: './test-grid.component.html',
  styleUrls: ['./test-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TestGridComponent implements OnInit {
  @ViewChild('search', { static: false }) searchElementRef: ElementRef<HTMLInputElement> = {} as ElementRef;

  public address: string = '';
  userName: string = 'Rita';
  public lastname: string = '';


  public showMap = true;
  public trackerList: any = [];
  showVal: string = "MyVal";
  markers: any = [];

  dropdownList:any = [];
  dropdownSettings: IDropdownSettings = {};
  selectedItems: any = [];
  mapRet : string = "ABC";

  constructor(private cd: ChangeDetectorRef, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
  }

  ngOnInit() {

    this.dropdownList = [
      'Item1',
      'Item2' ,
      'Item3' ,
      'Item4' ,
      'Item5' ];
    this.dropdownSettings = {
      idField: 'item_id',
      textField: 'item_text',
    };
    this.selectedItems = [
      'Item3' ,
      'Item4' ,
    ];
  }

  ngAfterViewInit() {
  //  this.findAdress();
  }

  shapeParam(shape: any){
    this.mapRet=shape
    console.log(this.mapRet)
    alert(shape)
  }

  findAdress() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          // some details
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place) {
            //s             this.address = place.formatted_address;
          }
        });
      });
    });
  }
  clearName() {
    this.userName = '';
  }

  fetchData() {
    this.mapRet="ddddd"
    /*    this.showMap=false;
        this.trackerList = [];
        this.cd.detectChanges();
    
        
        const payloadData = {
          "TrackerType": 'locoaware',
          "Stationaryfor" : 1,
          "ReportType": "OON"
        }
        this.blockchainservice.makeRequest(payloadData, '/CurrentTrackers.svc/TrackerForLocation')
        .subscribe((data: any[]) => {
           this.markers = data;
           this.trackerList = data;
           this.showMap=true;
           this.cd.detectChanges();
          },
          (err: string)  => {alert("Error " + err);
          this.showMap=true;
          this.cd.detectChanges();
          });
      */
  }

  onFilterChanged(event: any) {

  }
  onGridReady(event: any) {

  }

  onFileChanged(event: any) {
    const f = event.target.files[0];
    const reader = new FileReader();

    reader.onload = ((theFile) => {
      return (e: any) => {
        try {
          const json = JSON.parse(e.target.result);

          this.markers = json;
        } catch (ex) {
          alert('exception when trying to parse json = ' + ex);
        }
      };
    })(f);
    reader.readAsText(f);
  }
}
