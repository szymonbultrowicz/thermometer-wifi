import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TokenGuard } from './auth/token.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Error401Component } from './error401/error401.component';
import { NgApexchartsModule } from 'ng-apexcharts';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  redirectTo: 'dashboard',
}, {
  path: '401',
  component: Error401Component,
}, {
  path: '',
  canActivate: [
    TokenGuard,
  ],
  children: [{
    path: 'dashboard',
    component: DashboardComponent,
  }],
}];

@NgModule({
  declarations: [
    AppComponent,
    Error401Component,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSelectModule,
    HttpClientModule,
    NgApexchartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
