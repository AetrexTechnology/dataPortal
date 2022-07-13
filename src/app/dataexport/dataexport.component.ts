import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup ,Validators} from '@angular/forms';
import { IDropdownSettings,} from 'ng-multiselect-dropdown';
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import {AppService} from '../../app/app.service';
import { ApiService } from '../auth/api.service';
import {ResultData} from '../DataModels';
import { MatTableDataSource } from '@angular/material/table';
import { SpinnerService } from '../spinner.service';
import { MatTableExporterModule } from 'mat-table-exporter';
// import { TableData } from ../data.model;
@Component({
  selector: 'app-dataexport',
  templateUrl: './dataexport.component.html',
  styleUrls: ['./dataexport.component.scss']
})


  export class DataexportComponent extends MatTableExporterModule implements OnInit {
    isDisabled=true;
    public Gender: FormGroup;
    public Country: FormGroup;
    public USSize: FormGroup;
    public Measurements: FormGroup;
    public Statistics: FormGroup;
    public dataExportFilters:FormGroup;
    showTable = false;
    Nodata = false;
    dropdownListGender = [];
    dropdownListCountry=[];
    dropdownListUSSize=[];
    dropdownListMeasurements = [];
    dropdownListStatistics=[];
    selectedItems = [];
    dropdownSettings = {};
    displayedColumns = [];
    TableData:any
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    resultData:ResultData = {
      GenderArray:undefined,
      CountryArray: undefined,
      USSizeArray: undefined,
      MeasurementsArray: undefined,
      StatisticsArray: undefined
    }
    // export interface Data {
    //   name: string;
    //   position: number;
    //   weight: number;
    //   symbol: string;
    // }
    // const ELEMENT_DATA: Element[] = [
    //   {position: 1, name: Hydrogen, weight: 1.0079, symbol: H},
    //   {position: 2, name: Helium, weight: 4.0026, symbol: He},
    //   {position: 3, name: Lithium, weight: 6.941, symbol: Li},
    //   {position: 4, name: Beryllium, weight: 9.0122, symbol: Be},
    //   {position: 5, name: Boron, weight: 10.811, symbol: B},
    // ];

    constructor (public dialog: MatDialog,public appService:AppService, public apiService:ApiService,public formBuilder: FormBuilder,private spinnerservice:SpinnerService){
      super();
    }
    ngOnInit() {
      this.initForm();
      this.dataExportFilters = this.formBuilder.group({
        dropdownListGender : ['', Validators.required],
        dropdownListCountry : ['', Validators.required],
        dropdownListUSSize: ['', Validators.required],
        dropdownListMeasurements : ['', Validators.required],
        dropdownListStatistics : ['', Validators.required]
      });

      this.dropdownListGender = [
        { item_id: 1, item_text: 'Male' },
        { item_id: 2, item_text: 'Female' }
      ];
      this.dropdownListCountry = [
        { item_id: 1, item_text: 'United States' },
        { item_id: 2, item_text: 'Canada' },
        { item_id: 3, item_text: 'Mexico' },
        { item_id: 4, item_text: 'Puerto Rico' },
        { item_id: 5, item_text: 'Brazil' },
        { item_id: 6, item_text: 'Germany' },
        { item_id: 7, item_text: 'United Kingdom' },
        { item_id: 8, item_text: 'Netherlands' },
        { item_id: 9, item_text: 'Denmark' },
        { item_id: 10, item_text: 'Spain' },
        { item_id: 11, item_text: 'Israel' },
        { item_id: 12, item_text: 'United Arab Emirates' },
        { item_id: 13, item_text: 'Thailand' },
        { item_id: 14, item_text: 'Indonesia' },
        { item_id: 15, item_text: 'China' },
        { item_id: 9, item_text: 'South Korea' },
        { item_id: 10, item_text: 'Japan' },
        { item_id: 11, item_text: 'Russia' }
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
        { item_id: 4, item_text: 'ArchHeight' },
        { item_id: 5, item_text: 'DorsalHeight' },
        { item_id: 6, item_text: 'AnkleGirth' },
        { item_id: 7, item_text: 'BallGirth' },
        { item_id: 8, item_text: 'BallHeight' },
        { item_id: 9, item_text: 'BallWidth' },
        { item_id: 10, item_text: 'HeelWidth' },
        { item_id: 11, item_text: 'InstepWidth' },
        { item_id: 12, item_text: 'LengthToFirstMetHead' },
        { item_id: 13, item_text: 'LengthToFifthMetHead' },
        { item_id: 14, item_text: 'LongHeelGirth' },
        { item_id: 15, item_text: 'ShortHeelGirth' },
        { item_id: 16, item_text: 'MaxToeHeight' }
      ];
      this.dropdownListStatistics = [
        { item_id: 1, item_text: 'Average' },
        { item_id: 2, item_text: 'Standard Deviation' },
        { item_id: 3, item_text: '10_percentile' },
        { item_id: 4, item_text: '15_percentile' },
        { item_id: 5, item_text: '20_percentile' },
        { item_id: 6, item_text: '30_percentile' },
        { item_id: 7, item_text: '35_percentile' },
        { item_id: 8, item_text: 'Average' },
        { item_id: 9, item_text: '40_percentile' },
        { item_id: 10, item_text: '50_percentile' },
        { item_id: 11, item_text: '55_percentile' },
        { item_id: 12, item_text: '60_percentile' },
        { item_id: 13, item_text: '65_percentile' },
        { item_id: 14, item_text: '70_percentile' },
        { item_id: 15, item_text: '75_percentile' },
        { item_id: 16, item_text: '80_percentile' },
        { item_id: 17, item_text: '85_percentile' },
        { item_id: 18, item_text: '90_percentile' },
        { item_id: 19, item_text: '95_percentile' }
      ];
      this.selectedItems = [
      ];
      this.dropdownSettings= {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        enableCheckAll:true,
        itemsShowLimit: 1,
        allowSearchFilter: true
      };
    }
    public initForm() {
      this.Gender = this.formBuilder.group({
        Gender:['',[Validators.required]]
      }),
      this.Country = this.formBuilder.group({
        Country:['',[Validators.required]]
      })
      this.USSize = this.formBuilder.group({
        USSize:['',[Validators.required]]
      }),
      this.Measurements = this.formBuilder.group({
        Measurements:['',[Validators.required]]
      }),
      this.Statistics = this.formBuilder.group({
        Statistics:['',[Validators.required]]
      })
    }
    onItemSelect(item: any) {
      this.selectedItems.push(item);
      if(this.selectedItems.length != 0){
        this.isDisabled=false;
      }
      else{
        this.isDisabled=true;
      }
    }
    onItemDeSelect(item: any) {
      this.selectedItems.pop();
      if(this.selectedItems.length != 0){
        this.isDisabled=false;
      }
      else{
        this.isDisabled=true;
        
      }
    }
    openDialog() {
      const dialogRef = this.dialog.open(DialogComponent);
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }


    onsubmit(){
    this.spinnerservice.requestStarted();
      let obj = {}
      let resultarray  = [];
      this.resultData.GenderArray = this.Gender.value.Gender.map(item=>item.item_text).toString();
      this.resultData.CountryArray = this.Country.value.Country.map(item=>item.item_text).toString();
      this.resultData.USSizeArray = this.USSize.value.USSize.map(item=>item.item_text).toString();
      this.resultData.MeasurementsArray = this.Measurements.value.Measurements.map(item=>item.item_text).toString();
      this.resultData.StatisticsArray =this.Statistics.value.Statistics.map(item=>item.item_text).toString();
        this.apiService.getTableData(this.resultData).subscribe((successData: any) => {
          if (!successData.err) {
            this.spinnerservice.requestEnded();
            if(successData.result.length == 0 ){
              this.showTable = false;
              this.Nodata = true;
            }
            else{
              this.showTable = true;
              this.Nodata = false;
            }
            this.TableData = successData;
            obj= this.TableData.result[0];
            this.displayedColumns = Object.keys(obj);
            this.dataSource = new MatTableDataSource<any>(this.TableData.result);

             console.log("Details updated and sent email successfully.");
          } else {
          }
      }, (error: any) => {
        this.spinnerservice.requestEnded();
        this.showTable = false;
        console.log("Error")
      });
    }
  }
  