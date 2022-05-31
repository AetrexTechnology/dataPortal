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
    displayedColumns = ['Gender', 'USSize', 'AvgLength', 'StdLength','Length95percentile','Length75percentile','Length50percentile','Length25percentile',"Length5percentile","Avgwidth","StdWidth","Width95percentile","Width75percentile","Width50percentile","Width25percentile","Width5percentile","AvgInstep","StdInstep","Instep95percentile","Instep75percentile","Instep50percentile","Instep25percentile","Instep5percentile","AvgArchHeight","StdArchHeight","ArchHeight95percentile","ArchHeight75percentile","ArchHeight50percentile","ArchHeight25percentile","ArchHeight5percentile","AvgGirth","StdGirth","Girth95percentile","Girth75percentile","Girth50percentile","Girth25percentile","Girth5percentile"];
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
    AvgLength:number,
    StdLength:number,
    Length95percentile:number,
    Length75percentile:number,
    Length50percentile:number,
    Length25percentile:number,
    Length5percentile:number
    Avgwidth:number,
    StdWidth:number,
    Width95percentile:number,
    Width75percentile:number,
    Width50percentile:number,
    Width25percentile:number,
    Width5percentile:number,
    AvgInstep:number,
    StdInstep:number,
    Instep95percentile:number,
    Instep75percentile:number,
    Instep50percentile:number,
    Instep25percentile:number,
    Instep5percentile:number,
    AvgArchHeight:number,
    StdArchHeight:number,
    ArchHeight95percentile:number,
    ArchHeight75percentile:number,
    ArchHeight50percentile:number,
    ArchHeight25percentile:number,
    ArchHeight5percentile:number,
    AvgGirth:number,
    StdGirth:number,
    Girth95percentile:number,
    Girth75percentile:number,
    Girth50percentile:number,
    Girth25percentile:number,
    Girth5percentile:number
}
  const ELEMENT_DATA: TableData[] = [
    // ['Gender', 'USSize', 'Length', 'width','Instep','ArchHeight','grith'];
    {Gender:"Female", USSize:2,  AvgLength:249.00, StdLength:5.30, Length95percentile:254.38,Length75percentile:253.62,Length50percentile:250.01,Length25percentile:245.39,Length5percentile:242.20,Avgwidth:109.84,StdWidth:2.43,Width95percentile:112.86,Width75percentile:111.60,Width50percentile:109.55,Width25percentile:107.78,Width5percentile:107.21,AvgInstep:73.02,StdInstep:21.41,Instep95percentile:99.34,Instep75percentile:88.70,Instep50percentile:71.29,Instep25percentile:55.60,Instep5percentile:49.12,AvgArchHeight:30.75,StdArchHeight:25.13,ArchHeight95percentile:65.70,ArchHeight75percentile:40.50,ArchHeight50percentile:21.00,ArchHeight25percentile:11.25,ArchHeight5percentile:9.45,AvgGirth:11,StdGirth:221.20,Girth95percentile:80.96,Girth75percentile:332.63,Girth50percentile:256.62,Girth25percentile:194.37,Girth5percentile:158.94},
    {Gender:"Female", USSize:2,  AvgLength:249.00, StdLength:5.30, Length95percentile:254.38,Length75percentile:253.62,Length50percentile:250.01,Length25percentile:245.39,Length5percentile:242.20,Avgwidth:109.84,StdWidth:2.43,Width95percentile:112.86,Width75percentile:111.60,Width50percentile:109.55,Width25percentile:107.78,Width5percentile:107.21,AvgInstep:73.02,StdInstep:21.41,Instep95percentile:99.34,Instep75percentile:88.70,Instep50percentile:71.29,Instep25percentile:55.60,Instep5percentile:49.12,AvgArchHeight:30.75,StdArchHeight:25.13,ArchHeight95percentile:65.70,ArchHeight75percentile:40.50,ArchHeight50percentile:21.00,ArchHeight25percentile:11.25,ArchHeight5percentile:9.45,AvgGirth:11,StdGirth:221.20,Girth95percentile:80.96,Girth75percentile:332.63,Girth50percentile:256.62,Girth25percentile:194.37,Girth5percentile:158.94},
    {Gender:"Female", USSize:2,  AvgLength:249.00, StdLength:5.30, Length95percentile:254.38,Length75percentile:253.62,Length50percentile:250.01,Length25percentile:245.39,Length5percentile:242.20,Avgwidth:109.84,StdWidth:2.43,Width95percentile:112.86,Width75percentile:111.60,Width50percentile:109.55,Width25percentile:107.78,Width5percentile:107.21,AvgInstep:73.02,StdInstep:21.41,Instep95percentile:99.34,Instep75percentile:88.70,Instep50percentile:71.29,Instep25percentile:55.60,Instep5percentile:49.12,AvgArchHeight:30.75,StdArchHeight:25.13,ArchHeight95percentile:65.70,ArchHeight75percentile:40.50,ArchHeight50percentile:21.00,ArchHeight25percentile:11.25,ArchHeight5percentile:9.45,AvgGirth:11,StdGirth:221.20,Girth95percentile:80.96,Girth75percentile:332.63,Girth50percentile:256.62,Girth25percentile:194.37,Girth5percentile:158.94},
    {Gender:"Female", USSize:2,  AvgLength:249.00, StdLength:5.30, Length95percentile:254.38,Length75percentile:253.62,Length50percentile:250.01,Length25percentile:245.39,Length5percentile:242.20,Avgwidth:109.84,StdWidth:2.43,Width95percentile:112.86,Width75percentile:111.60,Width50percentile:109.55,Width25percentile:107.78,Width5percentile:107.21,AvgInstep:73.02,StdInstep:21.41,Instep95percentile:99.34,Instep75percentile:88.70,Instep50percentile:71.29,Instep25percentile:55.60,Instep5percentile:49.12,AvgArchHeight:30.75,StdArchHeight:25.13,ArchHeight95percentile:65.70,ArchHeight75percentile:40.50,ArchHeight50percentile:21.00,ArchHeight25percentile:11.25,ArchHeight5percentile:9.45,AvgGirth:11,StdGirth:221.20,Girth95percentile:80.96,Girth75percentile:332.63,Girth50percentile:256.62,Girth25percentile:194.37,Girth5percentile:158.94},
    {Gender:"Female", USSize:2,  AvgLength:249.00, StdLength:5.30, Length95percentile:254.38,Length75percentile:253.62,Length50percentile:250.01,Length25percentile:245.39,Length5percentile:242.20,Avgwidth:109.84,StdWidth:2.43,Width95percentile:112.86,Width75percentile:111.60,Width50percentile:109.55,Width25percentile:107.78,Width5percentile:107.21,AvgInstep:73.02,StdInstep:21.41,Instep95percentile:99.34,Instep75percentile:88.70,Instep50percentile:71.29,Instep25percentile:55.60,Instep5percentile:49.12,AvgArchHeight:30.75,StdArchHeight:25.13,ArchHeight95percentile:65.70,ArchHeight75percentile:40.50,ArchHeight50percentile:21.00,ArchHeight25percentile:11.25,ArchHeight5percentile:9.45,AvgGirth:11,StdGirth:221.20,Girth95percentile:80.96,Girth75percentile:332.63,Girth50percentile:256.62,Girth25percentile:194.37,Girth5percentile:158.94},
    {Gender:"Female", USSize:2,  AvgLength:249.00, StdLength:5.30, Length95percentile:254.38,Length75percentile:253.62,Length50percentile:250.01,Length25percentile:245.39,Length5percentile:242.20,Avgwidth:109.84,StdWidth:2.43,Width95percentile:112.86,Width75percentile:111.60,Width50percentile:109.55,Width25percentile:107.78,Width5percentile:107.21,AvgInstep:73.02,StdInstep:21.41,Instep95percentile:99.34,Instep75percentile:88.70,Instep50percentile:71.29,Instep25percentile:55.60,Instep5percentile:49.12,AvgArchHeight:30.75,StdArchHeight:25.13,ArchHeight95percentile:65.70,ArchHeight75percentile:40.50,ArchHeight50percentile:21.00,ArchHeight25percentile:11.25,ArchHeight5percentile:9.45,AvgGirth:11,StdGirth:221.20,Girth95percentile:80.96,Girth75percentile:332.63,Girth50percentile:256.62,Girth25percentile:194.37,Girth5percentile:158.94},
   
  ];