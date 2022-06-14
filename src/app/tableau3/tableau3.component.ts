import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';

@Component({
  selector: 'app-tableau3',
  templateUrl: './tableau3.component.html',
  styleUrls: ['./tableau3.component.scss']
})
export class Tableau3Component implements OnInit {

  constructor(public dialog: MatDialog ) { }

  ngOnInit(): void {
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
