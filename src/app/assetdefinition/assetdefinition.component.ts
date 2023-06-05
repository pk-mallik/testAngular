import { Component, ElementRef, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import { ColDef, ColumnApi } from 'ag-grid-community';
//import { ButtonRendererComponent } from 'app/pages/trackerspanel/button-renderer.component';
import { AgGridAngular } from 'ag-grid-angular';
//import { IDropdownSettings } from 'ng-multiselect-dropdown';
//import { BlockChainService } from 'app/blockchain.service';
import { ToastrService } from 'ngx-toastr';
//import { Item } from 'angular2-multiselect-dropdown';


@Component({
  selector: 'app-assetdefinition',
  templateUrl: './assetdefinition.component.html',
  styleUrls: ['./assetdefinition.component.scss'],
})

export class AssetDefinitionComponent implements OnInit {
  private api: any;
  private columnApi: ColumnApi;
//  @ViewChild('agGridDataTable') agGrid: AgGridAngular;
  frameworkComponents: any;
  dropdownSettings: IDropdownSettings = {};
  
  constructor(private blockchainservice : BlockChainService, private toastr: ToastrService) {
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    }

    this.dropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 30,
      allowSearchFilter: true
  };
  }
 selectedData: any;
  onItemSelect(item: any) {
    console.log(item);
    if(this.assetDetailsList.filter(x => x.AssetName == item.item_text).length != 0)
    this.assetGridData = this.assetDetailsList.filter(x => x.AssetName == item.item_text)[0].assetAttribute;
    this.selectedData = item;
  }

  onItemDeSelect(item: any) {
    console.log(item);
    this.assetGridData = [];
  }
  
  //  onSelectAll(items: any) {
  //   console.log(items);
  // }
  //  onDeSelectAll(items: any) {
  //   console.log(items);
  // }
  
  AssetIDList: Array<any> = ["AS123", "AS234", "AS345"];

  assetDetails: Array<any> = ["AS123", "AS234", "AS345"];

  columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'AttributeName', editable: true, sortable: true },
    { headerName: 'Type', field: 'AttributeType', editable: true, cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
        values: ['string', 'number', 'LoV'],
    }, },
    { headerName: 'Values', field: 'AttributeValues', editable: true },
    {
      headerName: 'Delete',
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
      onClick: this.onDeleteButtonClick.bind(this),
      label: 'Delete'
      },
    },
];

rowData = [
  { name: 'ABC', type: 'Select Type', values: 350 },
  { name: 'DEF', type: 'Select Type', values: 320 },
  { name: 'PQR', type: 'Select Type', values: 720 }
];

onRowEditingStopped(params)
{
  debugger;
}

onDeleteButtonClick(params)
{
  this.api.updateRowData({remove: [params.data]});
}

onGridReady(params): void {
  this.api = params.api;
  this.columnApi = params.columnApi;
  this.api.sizeColumnsToFit();
}

assetGridData : any[];
assetDetailsList: any[];
assetDropdown: any[];
ngOnInit() : void {
  const payloadData = {
    "EnterpriseID" : "3c867f52-2ty8-45d0-8ae3-1f1ad885890",
    // "CustomerID": "3333333",
    // "LocationID": "55556666"
  }
  this.blockchainservice.makeRequest(payloadData, '/Assets.svc/Query').subscribe((data: any[]) => {
    let tmp = [];
    if(data.length != 0)
    {
    this.assetGridData = data[0].assetAttribute;
    this.assetDetailsList = data;
    for(let i=0; i < data.length; i++)
    {
      tmp.push({ item_id: i, item_text: data[i].AssetName });
    }
    this.assetDropdown = tmp;
    }
    else
    {
      this.assetDropdown = []; 
    }
   })
}

addAsset(){
 // let newAsset = 
//  const payload = {
//   "AssetID": new Date().getTime(), 
//   "AssetName": "NEW",
//   "Assetype": "",
//   "assetAttribute": []
// }
//   this.assetDetailsList.push(payload);
let tmp = [];
for(let i=0; i < this.assetDetailsList.length; i++)
    {
      tmp.push({ item_id: i, item_text: this.assetDetailsList[i].AssetName });
    }
  //  this.assetDropdown = tmp;
tmp.push({ item_id: new Date().getTime(), item_text: 'NEW' + new Date().getTime() });
this.assetDropdown = tmp;
  this.assetGridData = [];
}

onAddRow()
   {
    this.agGrid.api.updateRowData({add: [{}] })
   // this.assetGridData.push({'AttributeName': '', 'AttributeType': 'string', 'AttributeValues': ''})
   }

   assetGridFieldData : any;
   gridData: any;
   onCellValueChanged(event) {
    //this.assetGridFieldData = event.data
     this.gridData = this.getAllData();
  }

  getAllData() {
    let rowData = [];
    this.api.forEachNode(node => rowData.push(node.data));
    return rowData;  
  }

   saveModifiedRows() {
    const payload = {
      "AssetID": this.selectedData.item_id, 
      "AssetName": this.selectedData.item_text,
      "Assetype": "",
      "assetAttribute": this.gridData
    }
    this.blockchainservice.makeRequest(payload, '/Assets.svc/Update').subscribe((data: any[]) => {
    this.showSuccess();
  },
  error => ( this.showError() ))
  }
  
  showSuccess() {
    this.toastr.success('Data Saved Successfully', 'Success');
  }
  showError() {
    this.toastr.error('Something went wrong', 'Error');
  }

}
