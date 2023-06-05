import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-testcontrol',
  templateUrl: './testcontrol.component.html',
  styleUrls: ['./testcontrol.component.scss']
})
export class TestcontrolComponent implements OnInit {
  enterpriseList: any = [
    {
      "EnterpriseID": "41be263b-bc70-41cd-a4ac-240f1c975712",
      "Name": "GreenTeck Global",
    },
    {
      "EnterpriseID": "3a7fe1af-b60b-414d-b11d-b72fe976fc31",
      "Name": "RM2",
    },
    {
      "EnterpriseID": "172234e4-beb6-4d79-851f-c055a9eb3f64",
      "Name": "ACE Deliveries",
    }
  ]

  currentEnterprise: any;
  constructor() {
    if (localStorage.getItem("EnterpriseID") === null) {
      this.currentEnterprise = "3a7fe1af-b60b-414d-b11d-b72fe976fc31"
      localStorage.setItem("EnterpriseID", this.currentEnterprise);
    } else{
      this.currentEnterprise = localStorage.getItem("EnterpriseID");
    }
  }

  ngOnInit(): void {
  }

  onEnterpriseChange(event: any) {
    this.currentEnterprise = event.target.value;
    localStorage.setItem("EnterpriseID", this.currentEnterprise);
  }

}
