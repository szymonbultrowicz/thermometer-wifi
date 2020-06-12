import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Error401Component } from './error401/error401.component';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  redirectTo: '/dashboard',
}, {
  path: 'dashboard',
  component: DashboardComponent,
}];

@NgModule({
  declarations: [
    AppComponent,
    Error401Component,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
