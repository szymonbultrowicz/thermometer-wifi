import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppComponent } from './app.component';
import { TokenGuard } from './auth/token.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Error401Component } from './error401/error401.component';

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
    MatToolbarModule,
    MatButtonModule,
    HttpClientModule,
    NgxChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
