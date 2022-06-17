import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../auth/api.service";
import {TableauComponent} from "../../tableau/tableau.component"
import { Subscription }   from 'rxjs';
import { SharedServiceService } from '../../shared-service.service'
import {Router, NavigationEnd,ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  subscription:Subscription;
  reload:any;
  data:any;
  staticdata = {
    "AnkleGirth": {
        "Female": 24.59,
        "Male": 26.85
    },
    "ArchHeight": {
        "Female": 1.96,
        "Male": 2.14
    },
    "BallGirth": {
        "Female": 22.4,
        "Male": 24.80
    },
    "BallHeight": {
        "Female": 4.29,
        "Male": 4.72
    },
    "BallWidth": {
        "Female": 9.06,
        "Male": 10.00
    },
    "DorsalHeight": {
        "Female": 6.25,
        "Male": 6.98
    },
    "Girth": {
        "Female": 23.29,
        "Male": 26.16
    },
    "HeelWidth": {
        "Female": 6.39,
        "Male": 7.0
    },
    "InstepWidth": {
        "Female": 8.29,
        "Male": 9.32
    },
    "Length": {
        "Female": 24.29,
        "Male": 26.86
    },
    "LengthToFifthMetHead": {
        "Female": 15.28,
        "Male": 16.91
    },
    "LengthToFirstMetHead": {
        "Female": 17.46,
        "Male": 19.3
    },
    "LongHeelGirth": {
        "Female": 31.9,
        "Male": 35.51
    },
    "MaxToeHeight": {
        "Female": 3.03,
        "Male": 3.36
    },
    "ShortHeelGirth": {
        "Female": 30.72,
        "Male": 34.10
    },
    "US Size": {
        "Female": 8.5,
        "Male": 21.5
    },
    "Width": {
        "Female": 9.3,
        "Male": 10.30
    }
}
  constructor(public dialog: MatDialog ,private apiService:ApiService,private router: Router,private shared:SharedServiceService,private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.navigate(['/dashboard']);
     if (!localStorage.getItem('foo')) { 
    localStorage.setItem('foo', 'no reload') 
    location.reload() 
  } else {
    localStorage.removeItem('foo') 
  }
  this.apiService.getsummarystatus().subscribe(data=>{
    if (data) {
      this.data = data;
         }
    else{
      this.data = this.staticdata;
      console.log('data not available')
    }
  },(err:HttpErrorResponse)=>{
      console.log("no data Available Hence showing static data")
      this.data = this.staticdata;
  });
    // this.subscription =  this.shared.subj$.subscribe(val=>{
    //   alert(val);
    //   this.reload = val;
    //   if(this.reload){
    //     window.location.reload();
    //   }
    //   console.log(val);
    // })
  }
  logout(){
    this.apiService.logout();
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
