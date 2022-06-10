import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from "../../auth/api.service";
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn : Observable<boolean>;
  

  constructor(private apiService:ApiService,public dialog: MatDialog) {
    this.isLoggedIn = this.apiService.isLoggedIn();
    console.log(this.isLoggedIn);
  }

  ngOnInit() {
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  logout(){
    this.apiService.logout();
  }
}
