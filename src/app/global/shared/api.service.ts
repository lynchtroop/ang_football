import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { isNode } from 'angular2-universal';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { CacheService  } from './cache.service';


@Injectable()
export class ApiService {
  constructor(public _http: Http) {

  }

 /**
  * whatever domain/feature method name
  */
  get(url: string, options?: any) {
    if(isNode){// only show apis being ran on server
      console.log(url);
    }
    return this._http.get(url, options)
      .map(res => res.json())
      .catch(err => {
        console.log(url, ' => Error: ', err);
        return Observable.throw(err);
      });
  }

}
