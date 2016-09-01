import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Http, Headers} from '@angular/http';
import {VerticalGlobalFunctions} from '../global/vertical-global-functions';
import {GlobalFunctions} from '../global/global-functions';
import {GlobalSettings} from '../global/global-settings';
import {CircleImageData} from '../fe-core/components/images/image-data';
import {SliderCarousel, SliderCarouselInput} from '../fe-core/components/carousels/slider-carousel/slider-carousel.component';
import {TransactionModuleData} from '../fe-core/modules/transactions/transactions.module';
import {TransactionTabData} from '../fe-core/components/transactions/transactions.component';
import {TransactionsListInput} from '../fe-core/components/transactions-list-item/transactions-list-item.component';

declare var moment: any;

interface TransactionInfo {
    transactionDate: string;
    transactionType?: string;
    playerPosition: string;
    id: string;
    teamKey: string;
    personKey: string;
    repDate: string;
    articleId: string;
    headline: string;
    contents: string;
    docId: string;
    teamId: string;
    teamName: string;
    playerId: string;
    playerName: string;
    playerFirstName: string;
    playerLastName: string;
    roleStatus: string;
    active: string;
    uniformNumber: string;
    position: string;
    depth: string;
    height: string;
    weight: string;
    birthDate: string;
    city: string;
    area: string;
    country: string;
    heightInInches: string;
    age: string;
    salary: string;
    pub1PlayerId: string;
    pub1TeamId: string;
    pub2Id: string;
    pub2TeamId: string;
    lastUpdate: string;
    playerHeadshot: string;
    teamLogo: string;
    totalResults: number;
    totalPages: number;
    transactionTimestamp: number;
    backgroundImage: string;
}

@Injectable()
export class TransactionsService {
  private _apiUrl: string = GlobalSettings.getApiUrl();

  constructor(public http: Http) {}

  //Function to set custom headers
  setToken(){
      var headers = new Headers();
      return headers;
  }

  getTabs(errorMessagePrepend: string, isPage: boolean): Array<TransactionTabData> {
    var tabs: TransactionTabData[] = [
      {
        tabDataKey  : 'transactions',
        tabDisplay  : 'Transactions',
        isLoaded    : false
      },
      {
        tabDataKey  : 'suspensions',
        tabDisplay  : 'Suspensions',
        isLoaded    : false
      },
      {
        tabDataKey  : 'injuries',
        tabDisplay  : 'Injuries',
        isLoaded    : false
      }];

      tabs.forEach(tab => {
        tab.sortOptions = [
          { key: "2016", value: "2016"},
          { key: "2015", value: "2015"}
        ],

        tab.sortTitle = "Season: ",
        tab.errorMessage = errorMessagePrepend + tab.tabDisplay.toLowerCase(),
        tab.includeDropdown = isPage
        tab.carData = this.getEmptyCarousel(tab); //must be called after the rest is set up
      });

      return tabs;
  }

  private getTabSingularName(key: string) {
    switch (key) {
      case "transactions":    return "Transaction";
      case "suspensions":     return "Suspension";
      case "injuries":        return "Injury";
    }
  }

  getTabsForPage(profileName: string, teamId?: number) {
    var errorMessagePrepend;
    if ( teamId ) {
      errorMessagePrepend = "Sorry, the " + profileName + " do not currently have any data for ";
    }
    else { //is league-wide data
      errorMessagePrepend = "Sorry, " + profileName + " does not currently have any data for ";
    }
    return this.getTabs(errorMessagePrepend, true);
  }

  loadAllTabsForModule(profileName: string, teamId?: number): TransactionModuleData {
    var route, errorMessagePrepend;
    if ( teamId ) {
      route = ['Transactions-page',{teamName: GlobalFunctions.toLowerKebab(profileName), teamId:teamId, limit:1000, pageNum: 1}]
      errorMessagePrepend = "Sorry, the " + profileName + " do not currently have any data for ";
    }
    else { //is league-wide data
      route = ['Transactions-tdl-page',{limit:1000, pageNum: 1}];
      errorMessagePrepend = "Sorry, " + profileName + " does not currently have any data for ";
    }

    return {
      tabs: this.getTabs(errorMessagePrepend, true),
      profileName: profileName,
      ctaRoute: route
    }
  }

  getTransactionsService(tab:TransactionTabData, teamId: number, type: string, sort?, limit?, page?, year?){
    //Configure HTTP Headers
    var headers = this.setToken();

    if( year == "2016" ){
      tab.selectedSort = "2016";
    } else if( year == "2015" ){
      tab.selectedSort = "2015";
    }

    if( limit == null){ limit = 10;}
    if( page == null){ page = 1;}
    if ( year == null ) { year ="2016" };

    var callURL = this._apiUrl + '/';

    if ( teamId ) {
       callURL += 'transactions/team/'+ teamId + '/';
    }
    else {
       callURL += 'transactions/league/';
    }
    callURL += year + '/' + tab.tabDataKey + '/' + page + '/' + limit;

    // only set current team if it's a team profile page,
    // this module should also only be on the team profile
    // and MLB profile pages
    var currentTeam = type == "module" ? teamId : null;

    return this.http.get( callURL, {headers: headers})
      .map(res => res.json())
      .map(
        data => {
          tab.carData = this.carTransactions(data.data, type, tab, currentTeam);
          tab.dataArray = this.listTransactions(data.data, type);
          if ( tab.dataArray != null && tab.dataArray.length == 0 ) {
            tab.dataArray = null;
          }
          tab.isLoaded = true;
          return tab;
        },
        err => {
          console.log('Error getting transaction data for ' + tab.tabDataKey);
        }
      );
  } //getTransactionsService

  getEmptyCarousel(tab: TransactionTabData): Array<SliderCarouselInput> {
    return [SliderCarousel.convertToCarouselItemType1(2, {
      backgroundImage: null,
      copyrightInfo: GlobalSettings.getCopyrightInfo(),
      subheader: [tab.tabDisplay],
      profileNameLink: null,
      description: [tab.isLoaded ? tab.errorMessage : ""],
      lastUpdatedDate: null,
      circleImageUrl: "/app/public/no-image.svg",
      circleImageRoute: null
    })];
  }

  //BELOW ARE TRANSFORMING FUNCTIONS to allow the modules to match their corresponding components
  carTransactions(data: Array<TransactionInfo>, type: string, tab: TransactionTabData, teamId): Array<SliderCarouselInput> {
    let self = this;
    var carouselArray = [];
    if(data.length == 0){//if no data is being returned then show proper Error Message in carousel
      carouselArray = this.getEmptyCarousel(tab);
    }else{
      if ( type == "module" ) {
          // module only needs four list items
        data = data.slice(0,4);
      }

      //if data is coming through then run through the transforming function for the module
      carouselArray = data.map((val, index) => {
        var teamRoute = VerticalGlobalFunctions.formatTeamRoute(val.teamName, val.teamId);
        var playerFullName = val.playerFirstName + ' ' + val.playerLastName;
        var playerRoute = null;

        if ( ( !val.roleStatus && val.active == 'injured' ) || val.active == 'active' ) {
          playerRoute = VerticalGlobalFunctions.formatPlayerRoute(val.playerName, val.playerName, val.playerId);;
        }
        var teamLinkText = {
          route: teamId == val.teamId ? null : teamRoute,
          text: val.teamName
        };
        var playerLinkText = {
          route: playerRoute,
          text: playerFullName,
          class: 'text-heavy'
        };

        //Description conditional need updated when correct API gets set up and "Type" is added to JSON object
        var description;

        if (val.transactionType == "suspension") {
          description = playerFullName + " " + val.playerPosition + " for the " + val.teamName +  " was " + val.contents;
        }
        else if (val.transactionType == "injuries") {
          description = playerFullName + " " + val.playerPosition + " for the " + val.teamName +  " is out with " + val.contents;
        }
        else {
          description = playerFullName + " was " + val.contents;
        }

        return SliderCarousel.convertToCarouselItemType1(index, {
          backgroundImage: GlobalSettings.getBackgroundImageUrl(val.backgroundImage),
          copyrightInfo: GlobalSettings.getCopyrightInfo(),
          subheader: [tab.tabDisplay + ' - ', teamLinkText],
          profileNameLink: playerLinkText,
          description: [
              description
          ],
          // lastUpdatedDate: GlobalFunctions.formatUpdatedDate(val.transactionTimestamp),
          lastUpdatedDate: GlobalFunctions.formatUpdatedDate(val.transactionDate),
          circleImageUrl: GlobalSettings.getImageUrl(val.playerHeadshot),
          circleImageRoute: playerRoute
          // subImageUrl: GlobalSettings.getImageUrl(val.teamLogo),
          // subImageRoute: teamRoute
        });
      });
    }
    return carouselArray;
  }


  listTransactions(data: Array<TransactionInfo>, type: string): Array<TransactionsListInput>{
    let self = this;
    var listDataArray = [];

    if(type == "module"){
      data = data.slice(0,4);
    }

    listDataArray = data.map(function(val, index){
      var playerRoute = null;

      playerRoute = VerticalGlobalFunctions.formatPlayerRoute(val.playerName, val.playerName, val.playerId);

      var playerTextLink = {
        route: playerRoute,
        text: val.playerLastName + ", " + val.playerFirstName + " ",
        class: 'text-heavy'
      }

      return {
        dataPoints: [{
          style   : 'transactions-small',
          data    : GlobalFunctions.formatLongDate(val.transactionDate),
          value   : [playerTextLink, val.contents],
          url     : null
        }],
        imageConfig: TransactionsService.getListImageData(GlobalSettings.getImageUrl(val.playerHeadshot), playerRoute)
      };
    });
    return listDataArray;
  }//end of function

  static getListImageData(mainImg: string, mainImgRoute: Array<any>){
    if(mainImg == null || mainImg == ''){
      mainImg = "/app/public/no-image.svg";
    }
    return { //interface is found in image-data.ts
        imageClass        : "image-48",
        mainImage : {
            imageUrl      : mainImg,
            urlRouteArray : mainImgRoute,
            hoverText     : "<i class='fa fa-mail-forward'></i>",
            imageClass    : "border-1",
        },
        subImages : [],
    };
  }
}
