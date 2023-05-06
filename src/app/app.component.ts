import { Component, inject } from '@angular/core';
import { Database, listVal, onValue, push, ref, set } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  private db: Database = inject(Database);
  items$: Observable<any[] | null>;

  constructor() {
    const items = ref(this.db, 'ng-fire/items');
    this.items$ = listVal(items);
  }

  addItem() {
    console.log("add")
    push(ref(this.db, 'ng-fire/items'), 'x');
  }
}