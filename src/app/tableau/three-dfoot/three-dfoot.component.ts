import { Component, OnInit } from '@angular/core';
import {MatTableModule } from '@angular/material/table'

@Component({
  selector: 'app-thrre-dfoot',
  templateUrl: './three-dfoot.component.html',
  styleUrls: ['./three-dfoot.component.scss']
})
export class ThreeDfootComponent implements OnInit {
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  selectedValue1: any;
  selectedValue2: any;
  selectedValue3: any;

  items = [{
    value : "United States",
    viewValue : "Country-United States"
  },{
    value : "India",
    viewValue : "country-India"
  },{
    value : "Korea",
    viewValue : "country-Korea"
  }];

  items2 = [{
    value : "Male",
    viewValue : "Gender-Male"
  },{
    value : "Female",
    viewValue : "Female"
  }];

  items3 = [{
    value : "7",
    viewValue : "size-7"
  },{
    value : "8",
    viewValue : "size-8"
  },{
    value : "10",
    viewValue : "size-10"
  }];
  constructor() { }

  ngOnInit(): void {
  }

}
export interface Element {

}

const ELEMENT_DATA: Element[] = [
  {position: 1,L_Length: 24.3, R_Length: 24.3, L_Width: 8.72, R_Width:8.72, L_Girth:22.25, R_Girth:22.25, L_Arch_Height:1.45, R_Arch_Height:1.45, L_Instep_Height:6.29, R_Instep_Height:6.29,Size_7_F_US:0,},
 
];