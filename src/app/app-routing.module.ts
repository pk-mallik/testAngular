import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { MapScreenComponent } from './map-screen/map-screen.component';
import { MovementReport} from './movement-report/movement-report.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { TestGridComponent } from './test-grid/test-grid.component';
import { TestcontrolComponent } from './testcontrol/testcontrol.component';
import { GeofenceDefinitionComponent } from './geofence-definition/geofence-definition.component';
const routes: Routes = 
  [
    { path: 'home', component: AppComponent },
    { path: 'map-screen', component: MapScreenComponent},
    {path: 'instructions', component: InstructionsComponent},
    {path: 'movement-report', component: MovementReport},
    {path: 'test-grid', component:TestGridComponent},
    {path: 'test-control', component:TestcontrolComponent},
    {path: 'geofence', component:GeofenceDefinitionComponent},
  ];

  //    { path: '', redirectTo: 'home', pathMatch: 'full' },

@NgModule({
  imports: [RouterModule.forRoot(routes), NgbModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
