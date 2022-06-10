import { BrowserModule } from '@angular/platform-browser';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {DemoMaterialModule} from './material-module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS  } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { ApiService } from './auth/api.service';
import { CookieService } from 'ngx-cookie-service';
import { ApiInterceptor } from "./auth/api.interceptor";
import { TableauComponent } from './tableau/tableau.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import { ThreeDfootComponent } from './tableau/three-dfoot/three-dfoot.component';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from  '@angular/material/select';
import { SharedServiceService } from '../app/shared-service.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataexportComponent } from './dataexport/dataexport.component';
import { ThreedfeetmoduleModule } from './threedfeetmodule/threedfeetmodule.module';
import {MatDialogModule} from '@angular/material/dialog';

import { AppService } from './app.service';
import { DialogComponent } from './dialog/dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HeaderComponent,
    FooterComponent,
    TableauComponent,
    ThreeDfootComponent,
    DataexportComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    DemoMaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDividerModule,
    MatTableModule,
    MatSelectModule,
    ThreedfeetmoduleModule,
    MatDialogModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  providers: [ApiService, CookieService,SharedServiceService,AppService, {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiInterceptor,
            multi: true
        },],
  bootstrap: [AppComponent]
})
export class AppModule { }
