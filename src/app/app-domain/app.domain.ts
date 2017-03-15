import { Component, OnInit } from '@angular/core';
import { AppComponent }  from '../app-component/app.component';
import { GlobalSettings } from "../global/global-settings";
import { isBrowser, isNode } from 'angular2-universal';

declare var Zone;

@Component({
  selector: 'app-domain',
  templateUrl: './app.domain.html',
  styles: [require('../global/stylesheets/main.less').toString()]
})
export class AppDomain implements OnInit{
  ngOnInit(){
    console.log('REQUEST REQUEST REQUEST',Zone.current.get('request'));
    console.log('HOSTNAME HOSTNAME HOSTNAME',Zone.current.get('hostname'));
    GlobalSettings._env = isNode ? Zone.current.get('hostname').split('.')[0] : window.location.hostname.split('.')[0];// make sure Zone is declared and set the environment before rendering the rest of the page
  }
}
