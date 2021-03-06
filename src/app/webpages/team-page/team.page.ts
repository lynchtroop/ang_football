import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

//globals
import { GlobalSettings } from "../../global/global-settings";
import { GlobalFunctions } from "../../global/global-functions";
import { VerticalGlobalFunctions } from "../../global/vertical-global-functions";
import { isBrowser, isNode } from "angular2-universal";

//services
import { ProfileHeaderService} from '../../services/profile-header.service';
import { DailyUpdateService } from "../../services/daily-update.service";
import { ArticleDataService } from "../../services/article-page-service";
import { BoxScoresService } from "../../services/box-scores.service";
import { SchedulesService } from '../../services/schedules.service';
import { StandingsService } from "../../services/standings.service";
import { RosterService } from '../../services/roster.service';
import { TransactionsService } from "../../services/transactions.service";
import { ComparisonStatsService } from '../../services/comparison-stats.service';
import { ImagesService } from "../../services/carousel.service";
import { VideoService } from "../../services/video.service";
import { DykService } from '../../services/dyk.service';
import { FaqService } from '../../services/faq.service';
import { ListOfListsService } from "../../services/list-of-lists.service";
import { NewsService } from "../../services/news.service";
import { TwitterService } from "../../services/twitter.service";
import { SeoService } from "../../seo.service";
import { PlayerStatsService } from "../../services/player-stats.service";
import { DraftHistoryService } from '../../services/draft-history.service';

//interfaces
import { Division, Conference, SportPageParameters } from '../../global/global-interface';
import { IProfileData, ProfileHeaderData } from "../../fe-core/modules/profile-header/profile-header.module";
import { DailyUpdateData } from "../../fe-core/modules/daily-update/daily-update.module";
import { HeadlineData } from "../../global/global-interface";
import { StandingsModuleData } from '../../fe-core/modules/standings/standings.module';
import { RosterModuleData } from '../../fe-core/modules/team-roster/team-roster.module';
import { TeamRosterData } from '../../services/roster.data';
import { TransactionModuleData } from "../../fe-core/modules/transactions/transactions.module";
import { ComparisonModuleData } from '../../fe-core/modules/comparison/comparison.module';
import { dykModuleData } from "../../fe-core/modules/dyk/dyk.module";
import { faqModuleData } from "../../fe-core/modules/faq/faq.module";
import { twitterModuleData } from "../../fe-core/modules/twitter/twitter.module";
import { PlayerStatsModule, PlayerStatsModuleData } from '../../fe-core/modules/player-stats/player-stats.module';
import { SliderCarouselInput } from '../../fe-core/components/carousels/slider-carousel/slider-carousel.component';

//Libraries
declare var moment;
declare var Zone: any;

@Component({
    selector: 'Team-page',
    templateUrl: './team.page.html'
})

export class TeamPage implements OnInit {
  public widgetPlace: string = "widgetForModule";

  private constructorControl:boolean = true;
  public partnerID: string;
  public scope: string;
  public storeSubscriptions: any = [];
  public routeSubscriptions: any;
  public teamID: number;
  public teamName: string;
  public pageParams:SportPageParameters;
  public dateParam:any;
  public storedPartnerParam: string;
  public seasonBase: string;

  public imageConfig: any;

  private profileData: IProfileData;
  private profileName:string;
  private profileHeaderData:ProfileHeaderData;
  private profileType:string = "team";
  private isProfilePage:boolean = true;

  private headlineData:any;
  private headlineError:boolean = false;

  private dailyUpdateData: DailyUpdateData;

  private boxScoresData:any;
  private currentBoxScores:any;

  private schedulesData:any;
  private scheduleTabsData: any;
  private scheduleFilter1:Array<any>;
  private selectedFilter1:string;
  private eventStatus: any;
  private selectedScheduleTabDisplay: string;
  private schedulesModuleFooterUrl: Array<any>;

  private standingsData:StandingsModuleData;

  private rosterData: RosterModuleData<TeamRosterData>;
  private activeRosterTab: any;
  private rosterModuleFooterUrl: Array<any>;

  private transactionsActiveTab: any;
  private transactionsData:TransactionModuleData;
  private transactionFilter1: Array<any>;
  private activeTransactionsTab: string;
  private transactionModuleFooterParams: any;
  private dropdownKey1: string;

  private draftHistoryData: any;
  private draftHistoryActiveTab: string;
  private draftHistoryFilter1: any = 1;
  private draftHistoryModuleFooterParams: any;
  private draftHistorySortOptions: Array<any> = [{key: '1', value: 'Ascending'}, {key: '2', value: 'Descending'}];
  private draftHistoryCarouselData: Array<Array<SliderCarouselInput>>;
  private draftHistoryDetailedDataArray: any;
  private draftHistoryIsError: boolean = false;
  private draftHistortyModuleFooterUrl: Array<any>;

  private comparisonModuleData: ComparisonModuleData;

  private imageData:Array<any>;
  private copyright:any;
  private imageTitle:any;

  private firstVideo:string;
  private videoData:any = null;

  private dykData: Array<dykModuleData>;

  private faqData: Array<faqModuleData>;

  private listOfListsData:Object; // paginated data to be displayed

  /*private newsDataArray: Array<Object>;*/

  private twitterData: Array<twitterModuleData>;

  private ptabName:string;

  private batchLoadIndex: number = 1;

  private playerStatsData: PlayerStatsModuleData;
  private isLoaded: boolean = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private _profileService: ProfileHeaderService,
    private _dailyUpdateService: DailyUpdateService,
    private _headlineDataService:ArticleDataService,
    private _boxScores: BoxScoresService,
    private _schedulesService:SchedulesService,
    private _standingsService:StandingsService,
    private _rosterService: RosterService,
    private _transactionsService: TransactionsService,
    private _draftHistoryService: DraftHistoryService,
    private _comparisonService: ComparisonStatsService,
    private _imagesService: ImagesService,
    private _videoBatchService: VideoService,
    private _dykService: DykService,
    private _faqService: FaqService,
    private _lolService: ListOfListsService,
    private _newsService: NewsService,
    private _twitterService: TwitterService,
    private _seoService: SeoService,
    private _playerStatsService: PlayerStatsService,
    private _cdRef: ChangeDetectorRef
  ) {
    this.routeSubscriptions = this.activateRoute.params.subscribe(
      (param :any)=> {
        this.resetSubscription();
        this.routeChangeResets();

        this.imageConfig = this._dailyUpdateService.getImageConfig();
        this.teamName = param['teamName'];
        this.teamID = param['teamID'];
        this.partnerID = param['partnerID'];
        this.scope = param['scope'] != null ? param['scope'].toLowerCase() : 'nfl';

        var currentUnixDate = new Date().getTime();
        this.dateParam = {
          scope: 'team',//current profile page
          teamId: param['teamID'], // teamId if it exists
          date: moment.tz( currentUnixDate , 'America/New_York' ).format('YYYY-MM-DD')
        }; //this.dateParam
        this.storedPartnerParam = VerticalGlobalFunctions.getWhiteLabel();
        this.setupProfileData(this.storedPartnerParam, this.scope, this.teamID);
      }
    ); //this.paramsub
  } //constructor

  ngOnInit() {
    this.ptabName="Passing";
  } //ngOnInit

  // This function contains values that need to be manually reset when navigatiing from team page to team page
  routeChangeResets() {
    this.isLoaded = false;
    this.standingsData = null;
    this.rosterData = null;
    this.playerStatsData = null;
    this.transactionsData = null;
    this.batchLoadIndex = 1;
  } //routeChangeResets


  ngOnDestroy(){
    this._seoService.removeApplicationJSON('page');
    this._seoService.removeApplicationJSON('json');

    this.routeChangeResets();
    this.resetSubscription();
    if(this.routeSubscriptions){
      this.routeSubscriptions.unsubscribe();
    }
  } //ngOnDestroy

  private resetSubscription(){
    if(this.storeSubscriptions){
      var numOfSubs = this.storeSubscriptions.length;

      for( var i = 0; i < numOfSubs; i++ ){
        if(this.storeSubscriptions[i]){
          this.storeSubscriptions[i].unsubscribe();
        }
      }
    }
  }

  private setupProfileData(partnerID, scope, teamID?) {
    this.storeSubscriptions.push(this._profileService.getTeamProfile(this.teamID).subscribe(
      data => {
        this.metaTags(data);
        this.pageParams = data.pageParams;
        this.pageParams['partnerRoute'] = this.storedPartnerParam;
        this.pageParams['scope'] = this.scope;
        this.pageParams['teamName'] = GlobalFunctions.toLowerKebab(this.pageParams['teamName']);
        this.pageParams['teamID'] = this.teamID;

        this.profileData = data;
        let headerData = data.headerData != null ? data.headerData : null;

        this.seasonBase = headerData['seasonBase'];

        this.profileName = data.teamName;
        if(headerData.teamMarket != null){
          this.profileName = headerData.teamMarket;
          this.profileName = headerData.teamName != null ? this.profileName + ' ' + headerData.teamName : this.profileName;
        }
        data['scope'] = this.scope;
        this.profileHeaderData = this._profileService.convertToTeamProfileHeader(data);
        this.dailyUpdateModule(teamID);
        this.getHeadlines();
        this.getBoxScores(this.dateParam);
        this.isLoaded = true;
        this.eventStatus = 'pregame';
        this.getSchedulesData(this.eventStatus);//grab pregame data for upcoming games

        //---Batch 2---//
        this.standingsData = this._standingsService.loadAllTabsForModule(this.pageParams, data.profileType, this.pageParams.teamId.toString(), data.teamName);
        this.rosterData = this._rosterService.loadAllTabsForModule(partnerID, this.scope, this.pageParams.teamId, this.profileName, this.pageParams.conference, true, data.headerData.teamMarket);
        this.getRosterService();
        this.playerStatsData = this._playerStatsService.loadAllTabsForModule(partnerID, this.scope, this.pageParams.teamId, this.profileName, this.seasonBase, true);

        //--Batch 3--//
        this.activeTransactionsTab = "Transactions"; // default tab is Transactions
        this.transactionsData = this._transactionsService.loadAllTabsForModule(this.profileName, this.activeTransactionsTab, this.pageParams.teamId);
        this.draftHistoryData = this._draftHistoryService.getDraftHistoryTabs(this.profileData);
        this.getDraftHistoryData();

        //--Batch 4--//
        this.setupComparisonData();
        this.getImages(this.imageData);
        this.getDykService();

        //--Batch 5--//
        this.getFaqService();
        this.setupListOfListsModule();
        // this.getNewsService();
        this.getTwitterService();
      }
    ))
  } //setupProfileData

  private metaTags(data) {
    //This call will remove all meta tags from the head.
    this._seoService.removeMetaTags();
    // //create meta description that is below 160 characters otherwise will be truncated
    let header = data.headerData;
    let metaDesc =  header.description;
    let title = header.teamMarket + ' ' + header.teamName;
    let image = header.leagueLogo ? GlobalSettings.getImageUrl(header.leagueLogo, GlobalSettings._imgPageLogo) : GlobalSettings.mainIcon;
    let record = '';
    if (header.leagueRecord != null) {
      record = header.leagueRecord;
    let recordArr = record.split('-');
      record = "(" + recordArr[0] + "-" + recordArr[1] + ")";
    }
    let color = header.teamColorsHex != null ? header.teamColorsHex.split(',')[0]:'#2d3e50';
    //grab domain for json schema
    let domainSite;

    if(GlobalSettings.getHomeInfo().isPartner && !GlobalSettings.getHomeInfo().isSubdomainPartner){
      domainSite = GlobalSettings._proto + "//" + GlobalSettings._globalSiteUrl + Zone.current.get('requestUrl');
    }else{
      domainSite = GlobalSettings._proto + "//" + GlobalSettings._globalSiteUrl + Zone.current.get('requestUrl');
    }
    title = title  + ' ' + record;

    let keywords = "football";
    keywords += header.teamName ? ", " + header.teamName : "";
    keywords += header.teamMarket ? ", " + header.teamMarket : "";
    let link = this._seoService.getPageUrl();
    this._seoService.setTitle(title);
    this._seoService.setThemeColor(color);
    this._seoService.setMetaDescription(metaDesc);
    this._seoService.setCanonicalLink();
    this._seoService.setMetaRobots('Index, Follow');

    this._seoService.setMetaTags([
      {
        'og:title': title,
      },
      {
        'og:description': metaDesc,
      },
      {
        'og:type':'website',
      },
      {
        'og:url':link,
      },
      {
        'og:image': image,
      },
      {
        'es_page_title': title,
      },
      {
        'es_page_url': link
      },
      {
        'es_description': metaDesc,
      },
      {
        'es_page_type': 'Team Profile page',
      },
      {
        'es_keywords': keywords
      },
      {
        'es_image_url':image
      }
    ])

    //manually generate team schema for team page until global funcation can be created
    let teamSchema = `
    {
      "@context": "http://schema.org",
      "@type": "SportsTeam",
      "name": "`+header.teamMarket + ' ' + header.teamName+`",
    }`;

    //manually generate json schema for BreadcrumbList
    let jsonSchema = `
    {
      "@context": "http://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@id": "`+domainSite+"/"+this.scope.toLowerCase()+"/pick-a-team"+`",
        "name": "`+this.scope.toUpperCase()+`"
      }
    },{
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@id": "`+domainSite+"?league="+header.divisionName+`",
        "name": "`+header.divisionName+`"
      }
    },{
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@id": "`+domainSite+`",
        "name": "`+header.teamMarket + ' ' + header.teamName+`"
        }
      }]
    }`;
    this._seoService.setApplicationJSON(teamSchema, 'page');
    this._seoService.setApplicationJSON(jsonSchema, 'json');
  } //metaTags

  private dailyUpdateModule(teamId: number) {
    this.storeSubscriptions.push(this._dailyUpdateService.getTeamDailyUpdate(teamId)
      .finally(() => GlobalSettings.setPreboot() ) // call preboot after last piece of data is returned on page (of first batch)
      .subscribe(data => {
        this.dailyUpdateData = data;
      },
      err => {
        this.dailyUpdateData = this._dailyUpdateService.getErrorData();
        console.log("Error getting daily update data", err);
    }));
  } //dailyUpdateModule



  private getHeadlines(){
    this.storeSubscriptions.push(this._headlineDataService.getAiHeadlineData(this.scope, this.pageParams.teamId, false)
      .subscribe(
        HeadlineData => {
          this.headlineData = HeadlineData;
        }
    ))
  } //getHeadlines

  private getBoxScores(dateParams) {
     let newDate;
     if ( dateParams != null && (newDate == null || dateParams.date != newDate.date) ) {
       newDate = dateParams;
       this.dateParam = dateParams;
       this.storeSubscriptions.push(this._boxScores.getBoxScores(this.boxScoresData, this.profileName, this.dateParam, (boxScoresData, currentBoxScores) => {
         this.boxScoresData = boxScoresData;
         this.currentBoxScores = currentBoxScores;
         this.dateParam = newDate;
         this._cdRef.detectChanges();
       }))
     }
  } //getBoxScores



    private scheduleTab(tab) {
        this.eventStatus = tab == "Previous Games" ? 'postgame' : 'pregame';
        this.getSchedulesData(this.eventStatus);
    } //scheduleTab
    private getSelectedScheduleTab(tabsData, status) {
        let matchingTabs = tabsData.filter(value => value.data == status);
        matchingTabs[0]['tabData'].sections = this.schedulesData.data;
        matchingTabs[0]['tabData'].isActive = true;
        this.selectedScheduleTabDisplay = matchingTabs[0].display;
        return tabsData;
    } //getSelectedScheduleTab
    private scheduleFilterDropdown(filter){
        if( filter.key != this.selectedFilter1 ) {
            this.selectedFilter1 = filter.key;
            this.getSchedulesData(this.eventStatus, filter.key);
        }
    } //scheduleFilterDropdown
    private getSchedulesData(status, year?) {
      var limit = 5;
      var pageNum = 1;
      year = year ? year : this.seasonBase;
      if(status == 'pregame') {
          this.selectedFilter1 = null;
          year = 'all';
      }
      this.storeSubscriptions.push(this._schedulesService.getScheduleTable(this.schedulesData, this.scope, 'team', status, limit, 1, this.pageParams.teamId, (schedulesData) => {
        if(status == 'pregame'){
          this.scheduleFilter1 = null;
        } else {
          if(this.scheduleFilter1 == null){// only replaces if the current filter is not empty
            this.scheduleFilter1 = schedulesData.seasons;
          }
        }
        this.schedulesData = schedulesData ? schedulesData : null;
        this.scheduleTabsData = this.schedulesData.tabs ? this.getSelectedScheduleTab(this.schedulesData.tabs, status) : null;
        this.schedulesModuleFooterUrl = [this.storedPartnerParam, this.scope, 'schedules', this.teamName, this.teamID, year, status, pageNum];
      }, year)) //year if null will return current year and if no data is returned then subract 1 year and try again
    } //getSchedulesData




    private standingsTabSelected(tabData: Array<any>) {
      //only show 5 rows in the module
      this.pageParams.scope = this.scope;
      this.storeSubscriptions.push(this._standingsService.getStandingsTabData(tabData, this.pageParams, this.seasonBase, (data) => {}, 5,));
    } //standingsTabSelected

    private standingsFilterSelected(tabData: Array<any>) {
      this.pageParams.scope = this.scope;
      this.storeSubscriptions.push(this._standingsService.getStandingsTabData(tabData, this.pageParams, this.seasonBase, data => {
      }, 5));
    } //standingsFilterSelected

    private transactionsTab(tab) {
      this.transactionsActiveTab = tab;
      this.getTransactionsData();
    } //transactionsTab
    private transactionsFilterDropdown(filter) {
      if ( this.transactionsActiveTab == null ) {
        this.transactionsActiveTab = this.transactionsData[0];
      }
      this.dropdownKey1 = filter;
      this.getTransactionsData();
    } //transactionsFilterDropdown
    private getTransactionsData() {
      if(this.dropdownKey1 == null){
        this.dropdownKey1 = this.seasonBase;
      }
      this.storeSubscriptions.push(this._transactionsService.getTransactionsService(this.transactionsActiveTab, this.pageParams.teamId, 'module', this.dropdownKey1)
        .subscribe(
          transactionsData => {
            if ( this.transactionFilter1 == undefined ) {
              this.transactionFilter1 = transactionsData.yearArray;
            }
            this.transactionModuleFooterParams = [this.storedPartnerParam, this.scope, transactionsData.tabDataKey, this.dropdownKey1, this.pageParams['teamName'], this.pageParams['teamID'], 20];
            this.transactionsData.tabs.filter(tab => tab.tabDataKey == this.transactionsActiveTab.tabDataKey)[0] = transactionsData;
          },
          err => {
            console.log('Error: transactionsData API: ', err);
          }
      ));
    } //private getTransactionsData



    private draftHistoryTab(tab) {
        this.draftHistoryActiveTab = tab;
        this.getDraftHistoryData();
    }
    private draftHistoryFilterDropdown(filter) {
        this.draftHistoryFilter1 = filter;
        this.getDraftHistoryData();
    }
    private getDraftHistoryData() {
        this.draftHistoryActiveTab = this.draftHistoryActiveTab ? this.draftHistoryActiveTab : this.seasonBase;
        var matchingTabs = this.draftHistoryActiveTab ?
                        this.draftHistoryData.filter(tab => tab.tabKey == this.draftHistoryActiveTab) :
                        null;
        if ( matchingTabs ) {
            var activeTab = matchingTabs[0];
            var activeFilter = this.draftHistoryFilter1 ? this.draftHistoryFilter1 : 1;
            this.storeSubscriptions.push(
                this._draftHistoryService.getDraftHistoryService(this.profileData, activeTab, 0, 'page', activeFilter, 2)
                    .subscribe(
                        draftHistoryData => {
                            activeTab.isLoaded = true;
                            activeTab.detailedDataArray = draftHistoryData.detailedDataArray;
                            activeTab.carouselDataArray = draftHistoryData.carouselDataArray;
                            this.draftHistoryCarouselData = draftHistoryData.carouselDataArray
                        },
                        err => {
                          activeTab.isLoaded = true;
                          this.draftHistoryIsError = true;
                          console.log('Error: draftData API: ', err);
                        }
                    )
            )
            this.draftHistortyModuleFooterUrl = [this.storedPartnerParam, this.scope, 'draft-history', activeTab.tabKey, this.teamName, this.teamID, activeFilter == 1 ? 'asc' : 'desc'];
        }
    } //getDraftHistoryData



    private setupComparisonData() {
      this.storeSubscriptions.push(this._comparisonService.getInitialPlayerStats(this.scope, this.pageParams).subscribe(
        data => {
          this.comparisonModuleData = data;
        },
        err => {
          console.log("Error getting comparison data for "+ this.pageParams.teamId, err);
        }));
    } //setupComparisonData



    private getImages(imageData) {
      this.storeSubscriptions.push(this._imagesService.getImages(this.profileType, this.pageParams.teamId)
      .subscribe(data => {
        return this.imageData = data.imageArray, this.copyright = data.copyArray, this.imageTitle = data.titleArray;
      },
      err => {
        console.log("Error getting image data" + err);
      }));
    } //getImages

    private getDykService() {
      this.storeSubscriptions.push(this._dykService.getDykService(this.profileType, this.pageParams.teamId)
        .subscribe(data => {
          this.dykData = data;
        },
        err => {
          console.log("Error getting did you know data");
      }));
    } //getDykService



    private getFaqService() {
       this.storeSubscriptions.push(this._faqService.getFaqService(this.profileType, this.pageParams.teamId)
         .subscribe(data => {
           this.faqData = data;
         },
         err => {
           console.log("Error getting faq data for team", err);
       }));
    } //getFaqService



private setupListOfListsModule() {
      let params = {
        targetId : this.pageParams.teamId,
        limit : 5,
        pageNum : 1,
        scope : this.scope
      }
      this.storeSubscriptions.push(this._lolService.getListOfListsService(params, "team", "module", 1)
        .subscribe(
          listOfListsData => {
            this.listOfListsData = listOfListsData ? listOfListsData.listData : null;
          },
          err => {
            console.log('Error: listOfListsData API: ', err);
          }
      ));
    } //setupListOfListsModule



    private rosterTabSelected(rosterTabTitle) {
        this.activeRosterTab = this.rosterData.tabs.filter(value => value.title == rosterTabTitle);
        this.getRosterService();
    }
    private getRosterService() {
        this.activeRosterTab = this.activeRosterTab ?
                               this.activeRosterTab[0] :
                               this.rosterData.tabs[0];

        this.rosterModuleFooterUrl = this._rosterService.getLinkToPage(this.storedPartnerParam, this.scope, this.teamID, this.teamName, this.activeRosterTab.type);
    }



 /*

  This service call is disabled for MPC server
  private getNewsService() {
      let params = {
        limit : 10,
        pageNum : 1,
        id : this.pageParams.teamId
      }
      let scope = GlobalSettings.getScope(this.scope);
      this.storeSubscriptions.push(this._newsService.getNewsService(scope, params, "team", "module")
        .subscribe(data => {
          this.newsDataArray = data.news;
        },
        err => {
          console.log("Error getting news data");
      }));
  }*/ //getNewsService//



    private playerStatsTabSelected(tabData: Array<any>) {
         //only show 4 rows in the module
         if(tabData[1] == null){
           tabData[1] = this.seasonBase;
         }
        this._playerStatsService.getStatsTabData(tabData, this.pageParams, data => {}, 5);
        var seasonArray = tabData[0];
        var seasonIds = seasonArray.seasonIds;
        var seasonTab = seasonIds.find(function (e) {
          if( e.value === tabData[1]){
            return true;
          }
        });
        if (tabData[0].tabActive=="Special"){
            this.ptabName="Kicking";
            if(seasonTab){
            } else {
              this.ptabName=tabData[1];
            }
        } else {
          this.ptabName=tabData[0].tabActive;
        };
    }



    private getTwitterService() {
      this.storeSubscriptions.push(this._twitterService.getTwitterService(this.profileType, this.pageParams.teamId)
        .subscribe(data => {
          this.twitterData = data;
        },
        err => {
          console.log("Error getting twitter data");
      }));
    } //getTwitterService



    // function to lazy load page sections
    private onScroll(event) {
      this.batchLoadIndex = GlobalFunctions.lazyLoadOnScroll(event, this.batchLoadIndex);
      return;
    }
}
