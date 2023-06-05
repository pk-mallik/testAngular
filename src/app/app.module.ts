//import { NgModule } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA,ErrorHandler } from '@angular/core';  

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AgmCoreModule } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AgGridModule } from 'ag-grid-angular';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { CustomListComponent } from './custom-list/custom-list.component';

import { MapScreenComponent } from './map-screen/map-screen.component';
import { MovementReport} from './movement-report/movement-report.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { TestGridComponent } from './test-grid/test-grid.component';
import { GeofenceDefinitionComponent } from './geofence-definition/geofence-definition.component';
import { MapgridComponent } from './mapgrid/mapgrid.component';
import { AgmMarkerClustererModule } from '@agm/markerclusterer';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { TestcontrolComponent } from './testcontrol/testcontrol.component';
import { AgmDrawingModule } from '@agm/drawing'

@NgModule({
  declarations: [
    AppComponent,
    MapScreenComponent,
    InstructionsComponent,
    MovementReport,
    CustomListComponent,
    TestGridComponent,
    MapgridComponent,
    TestcontrolComponent,
    GeofenceDefinitionComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],  
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,  
    AgmMarkerClustererModule,
    GooglePlaceModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBIaKawvez9pH2UE7J1ljYYNP__9X-7ZiM',
      libraries: ['places','drawing']
    }),
    NgbModule,
    AgGridModule.withComponents([]),
    ToastrModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    AgmDrawingModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
