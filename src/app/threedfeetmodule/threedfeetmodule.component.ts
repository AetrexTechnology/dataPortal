import { Component, Input, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ThreeDFeetService } from './threedfeet/three-d-feet.service';


@Component({
  selector: 'app-threedfeetmodule',
  templateUrl: './threedfeetmodule.component.html',
  styleUrls: ['./threedfeetmodule.component.scss']
})
export class ThreedfeetmoduleComponent implements OnInit {
  @Input() user:any;
 @Input() lfoot:any;
 @Input() rfoot:any;

  isLoaded = false;

  public treeDPosition = 'Init';
  threeDPosition = "Length";
  constructor(private threeDService: ThreeDFeetService, private appService: AppService) {

    //handle drag/drop events
    this.threeDService.position.subscribe(pos => {
      this.threeDPosition = pos;
    })
  }

  ngOnInit() {
      // this.appService.getProfileLastScan(this.user).subscribe(data => {
      //   if (data['footdata']) {
      //     this.lfoot = data['footdata'].leftfoot.objurl;
      //     this.rfoot = data['footdata'].rightfoot.objurl;
      //     this.isLoaded = true;
      //   }
      // })
  }
}
