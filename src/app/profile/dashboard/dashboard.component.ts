import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../auth/api.service";
import {TableauComponent} from "../../tableau/tableau.component"
import { Subscription }   from 'rxjs';
import { SharedServiceService } from '../../shared-service.service'
import {Router, NavigationEnd,ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  subscription:Subscription;
  reload:any;
  constructor(public dialog: MatDialog ,private apiService:ApiService,private router: Router,private shared:SharedServiceService,private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.navigate(['/dashboard']);
     if (!localStorage.getItem('foo')) { 
    localStorage.setItem('foo', 'no reload') 
    location.reload() 
  } else {
    localStorage.removeItem('foo') 
  }
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
