import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UniversalModule, isBrowser, isNode, AUTO_PREBOOT } from 'angular2-universal/browser'; // for AoT we need to manually split universal packages
import { IdlePreload, IdlePreloadModule } from '@angularclass/idle-preload';

// import { AppModule, AppComponent } from './+app/app.module'; //TODO
import { AppModule, AppDomain } from './app/ngModules/app.ngmodule'; //TODO
import { CacheService } from './app/global/shared/cache.service';
import { GlobalModule } from './app/ngModules/global.ngmodule';
import { ProfileNgModule } from './app/ngModules/profile.ngmodule';
import { DeepDiveNgModule } from './app/ngModules/deep-dive.ngmodule';

// Will be merged into @angular/platform-browser in a later release
// see https://github.com/angular/angular/pull/12322
import { Meta } from './angular2-meta';

// import * as LRU from 'modern-lru';

export function getLRU(lru?: any) {
  // use LRU for node
  // return lru || new LRU(10);
  return lru || new Map();
}
export function getRequest() {
  // the request object only lives on the server
  return { cookie: document.cookie };
}
export function getResponse() {
  // the response object is sent as the index.html and lives on the server
  return {};
}


// TODO(gdi2290): refactor into Universal
export const UNIVERSAL_KEY = 'UNIVERSAL_CACHE';

@NgModule({
  bootstrap: [ AppDomain ],
  imports: [
    // MaterialModule.forRoot() should be included first

    FormsModule,
    RouterModule.forRoot([], { useHash: false, preloadingStrategy: IdlePreload }),
    GlobalModule.forRoot(),
    ProfileNgModule.forRoot(),
    DeepDiveNgModule.forRoot(),

    IdlePreloadModule.forRoot(),
    AppModule,
    UniversalModule, // BrowserModule, HttpModule, and JsonpModule are included
  ],
  providers: [
    { provide: 'isBrowser', useValue: isBrowser },
    { provide: 'isNode', useValue: isNode },

    { provide: 'req', useFactory: getRequest },
    { provide: 'res', useFactory: getResponse },

    { provide: 'LRU', useFactory: getLRU, deps: [] },

    CacheService,

    Meta,

    //AUTO_PREBOOT is set to false so we can manually call the preboot function after all content is loaded per page to avoid page flicker when transitioning from server-sive view to client view
    {
      provide: AUTO_PREBOOT,
      useValue: false
    } // turn off auto preboot complete
  ]
})
export class MainModule {
  constructor(public cache: CacheService) {
    // TODO(gdi2290): refactor into a lifecycle hook
    // this.doRehydrate();
  }

  doRehydrate() {
    let defaultValue = {};
    let serverCache = this._getCacheValue(CacheService.KEY, defaultValue);
    this.cache.rehydrate(serverCache);
  }

  _getCacheValue(key: string, defaultValue: any): any {
    // browser
    const win: any = window;
    if (win[UNIVERSAL_KEY] && win[UNIVERSAL_KEY][key]) {
      let serverCache = defaultValue;
      try {
        serverCache = JSON.parse(win[UNIVERSAL_KEY][key]);
        if (typeof serverCache !== typeof defaultValue) {
          console.log('Angular Universal: The type of data from the server is different from the default value type');
          serverCache = defaultValue;
        }
      } catch (e) {
        console.log('Angular Universal: There was a problem parsing the server data during rehydrate');
        serverCache = defaultValue;
      }
      return serverCache;
    } else {
      console.log('Angular Universal: UNIVERSAL_CACHE is missing');
    }
    return defaultValue;
  }
}
