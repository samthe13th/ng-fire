import { Component, inject, OnInit } from '@angular/core';
import { Database, get, objectVal, ref, set } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { toNumber } from 'lodash';

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

  isKaraokeUser = false;
  karaokeUser = 0;
  stream = 'dolby';
  admin = null;
  theme = null;
  room = "";
  showOpen = false;
  chatUrl: any;
  tvOverlay = true;
  karaokeUsers = [
    { name: 'Karaoke 1', url: '', vmixEmbed: false },
    { name: 'Karaoke 2', url: '', vmixEmbed: false },
    { name: 'Karaoke 3', url: '', vmixEmbed: false }
  ]

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
    ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.room = params?.['room'] ?? null;
      this.admin = params?.['admin'] ?? null;
      this.karaokeUser = toNumber(params?.['karaoke']) ?? null;
      this.theme = params?.['theme'] ?? "";

      let chatParams = "";

      if (this.room) {
        chatParams = `?room=${this.room}&admin=${this.admin}&theme=${this.theme}`;
        this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          "https://chatroom-d4ab9.web.app" + chatParams
        );
      }
      this.config$ = objectVal(this.getRef(['config']));
      this.setDatabaseProperties();
    })
  }

  async setDatabaseProperties() {
    get(this.getRef(['karaokeUsers'])).then((users) => {
      if (users.exists()) {
        this.karaokeUsers = users.val();
      }
    })
    if (this.karaokeUser > 0) {
      this.karaokeUrl$ = objectVal(this.getRef(['karaokeUsers', (this.karaokeUser - 1).toString()])).pipe(
        map((user: any) => this.sanitizer.bypassSecurityTrustResourceUrl(user?.url)),
        tap((url) => console.log('urL: ', url))
      )
      this.karaokeUser$ = objectVal(this.getRef(['karaokeUsers', (this.karaokeUser - 1).toString()])).pipe(
        tap((user) => console.log({user})),
        map((user: any) => ({ 
          ...user,
          url: this.sanitizer.bypassSecurityTrustResourceUrl(user?.url)
        })),
        tap((user) => console.log('user: ', user))
      )
    }
  }

  onChangeKaraokeUrl(ev: any, index: number) {
    set(this.getRef(['karaokeUsers']), this.karaokeUsers)
  }

  onChangeKaraokeSwitch(ev: any, index: number) {
    setTimeout(() => {
      console.log('vmix: ', this.karaokeUsers[index])
      set(this.getRef(['karaokeUsers']), this.karaokeUsers)
    })
  }

  getRef(path: string[]) {
    const pathString = [this.room, ...path].join('/');
    return ref(this.db, pathString)
  }

  toggleShowOpen(value: boolean) {
    set(this.getRef(['config']), { showOpen: !value });
  };

  setStream(stream: string) {
    this.stream = stream;
  };
}