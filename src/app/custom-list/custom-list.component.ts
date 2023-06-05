import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-list',
  templateUrl: './custom-list.component.html',
  styleUrls: ['./custom-list.component.scss']
})
export class CustomListComponent implements OnInit {

  @Input() showVal = 'Not Spec';
	@Input() source:Array<any> = [];
	@Input() destination:Array<any> = [];
  constructor() { }

  ngOnInit(): void {
  }

}
