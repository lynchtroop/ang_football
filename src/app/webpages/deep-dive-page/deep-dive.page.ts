import { Component, OnInit, Input, NgZone, Renderer } from '@angular/core';
import { DeepDiveService } from '../../services/deep-dive.service';
import { SchedulesService } from '../../services/schedules.service';
import { GlobalSettings } from "../../global/global-settings";
import { GlobalFunctions } from "../../global/global-functions";
import { GeoLocation } from "../../global/global-service";
import { isNode, isBrowser, prebootComplete } from "angular2-universal";

import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../seo.service';
import { VerticalGlobalFunctions } from "../../global/vertical-global-functions";

//window declarions of global functions from library scripts
declare var moment;
// declare var jQuery: any;

@Component({
  selector: 'deep-dive-page',
  templateUrl: './deep-dive.page.html'
})

export class DeepDivePage {
  public widgetPlace: string = "widgetForPage";

  //page variables
  scope: string = 'nfl';
  scopeDisplayed: any;
  sidescrollScope: string;
  partnerID: string;
  partnerData: any;
  profileName: string;
  geoLocation: string;

  sideScrollIcon: string;
  sideScrollData: any;
  scrollLength: number;
  ssMax: number = 9;
  callCount: number = 1;
  callLimit: number = 9;
  safeCall: boolean = true;
  //for carousel
  carouselData: any;
  videoData: any;
  toggleData: any;
  blockIndex: number = 0;
  changeScopeVar: string = "";
  isLoading: boolean = false;

  firstStackTop: any;
  firstStackRow: any;

  private _routeSubscription: any;

  public prebootHasRun: boolean = false;

  constructor(
    public renderer: Renderer,
    private _activatedRoute: ActivatedRoute,
    private _deepDiveData: DeepDiveService,
    private _schedulesService: SchedulesService,
    private _geoLocation: GeoLocation,
    private _seoService: SeoService,
    public ngZone: NgZone,
    private _router: Router
  ) {
    this._routeSubscription = this._activatedRoute.params.subscribe(
      (params: any) => {
        this.resetScopedVariables();
        this.scope = params['scope'] != null ? params['scope'].toLowerCase() : 'nfl';

        this.profileName = this.scope == 'home' ? 'Football' : this.scope.toUpperCase();
        this.scopeNameDisplay(this.scope);
        this.toggleData = this.scope == 'home' ? [this.getToggleInfo()] : null;
        // GlobalSettings.storePartnerId(params.partner_id);
        this.metaTags();
        this.getGeoLocation();
      }
    );
  }

  resetScopedVariables(){
    this.safeCall = true;
    this.callCount = 1;
    this.blockIndex = 0;
    this.sideScrollData = null;
    this.isLoading = false;
    this.carouselData = null;
    this.blockIndex = 1;
  }

  //Subscribe to getGeoLocation in geo-location.service.ts. On Success call getNearByCities function.
  getGeoLocation() {
    this._geoLocation.grabLocation().subscribe(res => {
      this.geoLocation = res.state;
      this.callModules();
    });
  }
  ngOnDestroy() {
    this._routeSubscription.unsubscribe();
  }

  scopeNameDisplay(scope) {
    scope = scope.toLowerCase();
    switch (scope) {
      case 'nfl':
        this.scopeDisplayed = {
          scope: 'Football',
          text: 'Upcoming NFL Games',
          topScope: 'football'
        };
        break;
      case 'fbs':
      case 'ncaaf':
        this.scopeDisplayed = {
          scope: 'Football',
          text: 'Upcoming NCAAF Games',
          topScope: 'football'
        }
        break;
      case 'all':
      case 'football':
      case 'home':
        this.scopeDisplayed = {
          scope: 'Football',
          text: null,
          topScope: 'football'
        };
        break;
      default:
        this.scopeDisplayed = {
          scope: 'Football',
          text: 'Upcoming NFL Games',
          topScope: null
        }
        break;
    }
  } //scopeNameDisplay



  private metaTags() {
    //This call will remove all meta tags from the head.
    this._seoService.removeMetaTags();
    //create meta description that is below 160 characters otherwise will be truncated
    let metaDesc = GlobalSettings.getPageTitle('Dive into the most recent news on Football and read the latest articles about your favorite fooball team.', 'Deep Dive');
    let link = window.location.href;
    let image = GlobalSettings.getmainLogoUrl();
    let title = 'Deep Dive Page';
    let keywords = "football";
    this._seoService.setTitle(title);
    this._seoService.setMetaDescription(metaDesc);
    this._seoService.setCanonicalLink(this._activatedRoute.params,this._router);
    this._seoService.setMetaRobots('Index, Follow');
    this._seoService.setOgTitle(title);
    this._seoService.setOgDesc(metaDesc);
    this._seoService.setOgType('Website');
    this._seoService.setOgUrl(link);
    this._seoService.setOgImage(image);
    //Elastic Search
    this._seoService.setMetaDescription(metaDesc);
    this._seoService.setPageTitle(title);
    this._seoService.setPageType(title);
    this._seoService.setPageUrl(link);
    this._seoService.setImageUrl(image);
    this._seoService.setKeyWord(keywords);
  } //metaTags



  getToggleInfo() {
    let toggleData = {
      'nfl': {
        title: 'Loyal to the NFL?',
        subtext: 'Stay up to date with everything NFL.',
        scope: 'NFL',
        // This is image has been hardcoded to prevent from the server side rendering from selecting a different random image
        // from the client side rendering. It allows for a smoother transition between the two views
        image: 'http://images.synapsys.us/02/nfl/stock/2016/11/image-carousel-nfl-05.jpg',
        // image: VerticalGlobalFunctions.getRandomToggleCarouselImage().nfl, // random selection
        buttonClass: 'carousel_toggle-button',
        buttonText: 'Visit the NFL Section',
        buttonScope: 'nfl'
      },
      'ncaaf': {
        title: 'Loyal to the NCAA?',
        subtext: 'Stay up to date with everything NCAA.',
        scope: 'NCAA',
        // This is image has been hardcoded to prevent from the server side rendering from selecting a different random image
        // from the client side rendering. It allows for a smoother transition between the two views
        image: '//images.synapsys.us/02/ncaaf/stock/2016/11/image-carousel-ncaaf-01.jpg',
        // image: VerticalGlobalFunctions.getRandomToggleCarouselImage().ncaaf, // random selection
        buttonClass: 'carousel_toggle-button',
        buttonText: 'Visit the College Section',
        buttonScope: 'ncaaf'
      },
      'midImage': GlobalSettings.mainIcon,
    }
    return toggleData;
  }

  //api for Schedules
  private getSideScroll() {
    let self = this;
    if (this.safeCall && this.scope != 'home') {
      this.safeCall = false;
      this.scope = this.scope.toLowerCase();
      let changeScope = this.scope == 'ncaaf' ? 'fbs' : this.scope;
      this._schedulesService.setupSlideScroll(this.sideScrollData, changeScope, 'league', 'pregame', this.callLimit, this.callCount, (sideScrollData) => {
        if (this.sideScrollData == null) {
          this.sideScrollData = sideScrollData;
        }
        else {
          sideScrollData.forEach(function(val, i) {
            self.sideScrollData.push(val);
          })
        }
        if(sideScrollData.length > 0){// if data returned is an emptry array then dont run this api call anymore.
          this.safeCall = true;
        }
        this.callCount++;
        this.scrollLength = this.sideScrollData.length;
      }, null, null)
    }
  }



  changeScope(event) {
    event = event.toLowerCase();
    this.scopeNameDisplay(event);
    let route = VerticalGlobalFunctions.getWhiteLabel();
    this._router.navigate([route, event.toLowerCase()]);
  } //changeScope



  private scrollCheck(event) {
    let maxScroll = this.sideScrollData.length;
    if (event >= (maxScroll - this.ssMax)) {
      this.getSideScroll();
    }
  } //scrollCheck



  private getDeepDiveVideoBatch() {
    this._deepDiveData.getDeepDiveVideoBatchService(this.scope, '1', '1', this.geoLocation).subscribe(
      data => {
        try{
          var video = data.data['videos'] != null ? this._deepDiveData.transformVideoStack(data.data) : null;
          this.videoData = video['videos'];
        }catch(e){
          console.log('error in video data');
        }
      }
    )
  }

  private getDataCarousel() {
    this._deepDiveData.getCarouselData(this.scope, this.carouselData, '15', '1', this.geoLocation, (carData) => {
      this.carouselData = carData;
    })
  }

  getFirstArticleStackData() {
    this._deepDiveData.getDeepDiveBatchService(this.scope, 1, 1, this.geoLocation)
      .subscribe(data => {
        this.firstStackTop = this._deepDiveData.transformToArticleStack(data, GlobalSettings._deepDiveMd);
      },
      err => {
        console.log("Error getting first article stack data");
      });
    this._deepDiveData.getDeepDiveAiBatchService(this.scope, 'postgame-report', 1, this.callLimit, this.geoLocation)
      .finally(() => GlobalSettings.setPreboot() ) // call preboot after last piece of data is returned on page
      .subscribe(data => {
        this.firstStackRow = this._deepDiveData.transformToAiArticleRow(data);
      },
      err => {
        console.log("Error getting first AI article batch data");
      }
    );
  }

  callModules() {
    this.isLoading = true;
    this.getDataCarousel();
    this.getDeepDiveVideoBatch();
    this.getSideScroll();
    this.getFirstArticleStackData();
  }

  // function to lazy load page sections
  private onScroll(event) {
    this.blockIndex = GlobalFunctions.lazyLoadOnScroll(event, this.blockIndex);
    return;
  }

  toggleRoute(event) {
    this._router.navigate(['/' + event.toLowerCase()]);
  }
}
