import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClipboardModule } from 'ngx-clipboard';
import { ToastrModule } from 'ngx-toastr';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  declarations: [
    AppComponent,
    InlineEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    FontAwesomeModule,
    ClipboardModule,
    PickerModule,
    UiSwitchModule.forRoot({
      size: 'small',
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    ToastrModule.forRoot(),
  ],
  exports: [
    InlineEditComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
