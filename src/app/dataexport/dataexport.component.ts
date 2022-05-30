import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup ,Validators} from '@angular/forms';
import { IDropdownSettings,} from 'ng-multiselect-dropdown';
// import { TableData } from '../data.model';
@Component({
  selector: 'app-dataexport',
  templateUrl: './dataexport.component.html',
  styleUrls: ['./dataexport.component.scss']
})


  export class DataexportComponent implements OnInit {
    isDisabled=true;
    showTable = false;
    dropdownListGender = [];
    dropdownListCountry=[];
    dropdownListUSSize=[];
    dropdownListMeasurements = [];
    dropdownListStatistics=[];
    selectedItems = [];
    dropdownSettings = {};
    displayedColumns = ['Gender', 'USSize', 'Length', 'width','Instep','ArchHeight','grith'];
    dataSource = ELEMENT_DATA;
    // export interface Data {
    //   name: string;
    //   position: number;
    //   weight: number;
    //   symbol: string;
    // }
    // const ELEMENT_DATA: Element[] = [
    //   {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    //   {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    //   {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    //   {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    //   {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    // ];

    constructor (){}
    ngOnInit() {
      this.dropdownListGender = [
        { item_id: 1, item_text: 'Male' },
        { item_id: 2, item_text: 'Female' }
      ];
      this.dropdownListCountry = [
        { item_id: 1, item_text: 'United States' },
        { item_id: 2, item_text: 'India' },
        { item_id: 3, item_text: 'Spain' },
        { item_id: 4, item_text: 'Mexico' },
        { item_id: 5, item_text: 'Canada' }
      ];
      this.dropdownListUSSize = [
        { item_id: 1, item_text: '2' },
        { item_id: 2, item_text: '2.5' },
        { item_id: 3, item_text: '3' },
        { item_id: 4, item_text: '3.5' },
        { item_id: 5, item_text: '4' },
        { item_id: 6, item_text: '4.5' },
        { item_id: 7, item_text: '5' },
        { item_id: 8, item_text: '5.5' },
        { item_id: 9, item_text: '6' },
        { item_id: 10, item_text: '6.5' },
        { item_id: 11, item_text: '7' },
        { item_id: 12, item_text: '7.5' },
        { item_id: 13, item_text: '8' },
        { item_id: 14, item_text: '8.5' },
        { item_id: 15, item_text: '9' },
        { item_id: 16, item_text: '9.5' },
        { item_id: 17, item_text: '10' },
        { item_id: 18, item_text: '10.5' },
        { item_id: 19, item_text: '11' },
        { item_id: 20, item_text: '11.5' },
        { item_id: 21, item_text: '12' },
        { item_id: 22, item_text: '12.5' },
        { item_id: 23, item_text: '13' },
        { item_id: 24, item_text: '13.5' },
        { item_id: 25, item_text: '14' },
        { item_id: 26, item_text: '14.5' },
        { item_id: 27, item_text: '15' },
        { item_id: 28, item_text: '14.5' },
        { item_id: 29, item_text: '15' },
        { item_id: 30, item_text: '15.5' },
        { item_id: 31, item_text: '16' },
        { item_id: 32, item_text: '16.5' },
        { item_id: 33, item_text: '17' },
        { item_id: 34, item_text: '17.5' },
        { item_id: 35, item_text: '18' }
      ];
      this.dropdownListMeasurements = [
        { item_id: 1, item_text: 'Length' },
        { item_id: 2, item_text: 'Width' },
        { item_id: 3, item_text: 'Girth' },
        { item_id: 4, item_text: 'Arch Height' },
        { item_id: 5, item_text: 'Instep Height' }
      ];
      this.dropdownListStatistics = [
        { item_id: 1, item_text: 'Average' },
        { item_id: 2, item_text: 'Standard Deviation' },
        { item_id: 3, item_text: '10th Percentile' },
        { item_id: 4, item_text: '25th Percentile' },
        { item_id: 5, item_text: '50th Percentile' },
        { item_id: 6, item_text: '75th Percentile' },
        { item_id: 7, item_text: '90th Percentile' }
      ];
      this.selectedItems = [
      ];
      this.dropdownSettings= {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        enableCheckAll:false,
      
        itemsShowLimit: 3,
        allowSearchFilter: true
      };
    }
    onItemSelect(item: any) {
      this.selectedItems.push(item);
      if(this.selectedItems.length != 0){
        this.isDisabled=false;
        // this.showTable = true;
      }
      else{
        this.isDisabled=true;
        this.showTable = false;
      }
    }
    onItemDeSelect(item: any) {
      this.selectedItems.pop();
      if(this.selectedItems.length != 0){
        this.isDisabled=false;
        // this.showTable = true;
      }
      else{
        this.isDisabled=true;
        this.showTable = false;
        
      }
    }

    onsubmit(){
      if(this.selectedItems.length != 0){
        this.isDisabled=false;
        this.showTable = true;
      }
      else{
        this.showTable = false;
        alert("Please select the filter Option");
      }
    }
  }
  export interface TableData {
    Gender:string,
    USSize:number,
    Length:number,
    width:number,
    Instep:number,
    ArchHeight:number,
    grith:number,

}
  const ELEMENT_DATA: TableData[] = [
    // ['Gender', 'USSize', 'Length', 'width','Instep','ArchHeight','grith'];
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
    {Gender:"Male", USSize:2, Length: 1.0079, width: 12,Instep:11,ArchHeight:1,grith:2},
  ];