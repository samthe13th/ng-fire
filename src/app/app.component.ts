import { Component, inject, OnInit } from '@angular/core';
import { Database, get, objectVal, ref, set, update } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  private db: Database = inject(Database);
  config$: Observable<any> = new BehaviorSubject<any>(null);
  karaokeUrl$: Observable<any> = new BehaviorSubject<any>(null);
  karaokeUser$: Observable<any> = new BehaviorSubject<any>(null);

  landingScreen = false;
  loaded = false;
  isKaraokeUser = false;
  karaokeUser = 0;
  stream = 'dolby';
  theme = 'karaoke';
  room = "bqfkn_show";
  showOpen = false;
  showVisible = false;
  chatUrl: any;
  tvOverlay = true;
  adminId = 'thebqfknadmin';
  isAdmin = false;
  testUser = false;

  k1 = '2faf2Q3Jk';
  k2 = '93jfks9oF';
  k3 = '3jfkasdf3';

  karaokeIds: {[key: string]: number} = {
    [this.k1]: 0,
    [this.k2]: 1,
    [this.k3]: 2
  }

  karaokeUsers = [
    { name: 'Karaoke 1', id: this.k1, url: '', vmixEmbed: false },
    { name: 'Karaoke 2', id: this.k2, url: '', vmixEmbed: false },
    { name: 'Karaoke 3', id: this.k3, url: '', vmixEmbed: false }
  ]

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private toastr: ToastrService
    ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isAdmin = params?.['admin'] === this.adminId;
      this.testUser = params?.['testUser'] === '1';
      this.karaokeUser = this.getKaraokeUser(params?.['k']);
      let chatParams = `?room=${this.room}&theme=${this.theme}`;
      console.log('testUser', params, this.testUser)

      if (this.isAdmin) {
        chatParams += `&admin=${this.adminId}`
      }
      this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        "https://chatroom-d4ab9.web.app" + chatParams
      );
      this.config$ = objectVal(this.getRef(['config'])).pipe(tap((config) => {
        if (config?.showOpen) {
          this.setStream('dolby');
        }
      }))
      this.setDatabaseProperties();
    })
  }

  getKaraokeUser(id: string) {
    return this.karaokeIds[id];
  }

  onClipboardCopy(callback: any) {
    this.toastr.success(callback.content, 'Copied to clipboard');
  }

  async setDatabaseProperties() {
    get(this.getRef(['karaokeUsers'])).then((users) => {
      if (users.exists()) {
        this.karaokeUsers = users.val();
      }
    })
    if (this.karaokeUser !== undefined) {
      this.karaokeUrl$ = objectVal(this.getRef(['karaokeUsers', (this.karaokeUser).toString()])).pipe(
        map((user: any) => this.sanitizer.bypassSecurityTrustResourceUrl(user?.url)),
      )
      this.karaokeUser$ = objectVal(this.getRef(['karaokeUsers', (this.karaokeUser).toString()])).pipe(
        map((user: any) => ({ 
          ...user,
          url: this.sanitizer.bypassSecurityTrustResourceUrl(user?.url)
        }))
      )
    }
  }

  onChangeKaraokeUrl(ev: any, index: number) {
    set(this.getRef(['karaokeUsers']), this.karaokeUsers)
  }

  onChangeKaraokeSwitch(ev: any, index: number) {
    setTimeout(() => {
      set(this.getRef(['karaokeUsers']), this.karaokeUsers)
    })
  }

  getRef(path: string[]) {
    const pathString = [this.room, ...path].join('/');
    return ref(this.db, pathString)
  }

  toggleShowOpen(value: boolean) {
    update(this.getRef(['config']), { showOpen: !value });
  };

  toggleShowVisible(value: boolean) {
    update(this.getRef(['config']), { showVisible: !value });
  };

  setStream(stream: string) {
    this.stream = stream;
  };
}