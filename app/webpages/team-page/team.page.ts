///<reference path="../../../node_modules/rxjs/Observable.d.ts"/>
import {Component, OnInit, Injectable} from '@angular/core';
import {Router, RouteParams} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';

import {GlobalFunctions} from "../../global/global-functions";
import {VerticalGlobalFunctions} from "../../global/vertical-global-functions";
import {Division, Conference, SportPageParameters} from '../../global/global-interface';
import {GlobalSettings} from "../../global/global-settings";
import {LoadingComponent} from '../../fe-core/components/loading/loading.component';
import {ErrorComponent} from '../../fe-core/components/error/error.component';

import {CommentModule} from '../../fe-core/modules/comment/comment.module';
import {HeadlineComponent} from '../../fe-core/components/headline/headline.component';

import {ArticlesModule} from "../../fe-core/modules/articles/articles.module";

import {TwitterModule, twitterModuleData} from "../../fe-core/modules/twitter/twitter.module";
import {TwitterService} from '../../services/twitter.service';

import {DYKModule, dykModuleData} from "../../fe-core/modules/dyk/dyk.module";
import {DykService} from '../../services/dyk.service';

import {FAQModule, faqModuleData} from "../../fe-core/modules/faq/faq.module";
import {FaqService} from '../../services/faq.service';

import {BoxScoresModule} from '../../fe-core/modules/box-scores/box-scores.module';
import {BoxScoresService} from '../../services/box-scores.service';

import {ComparisonModule, ComparisonModuleData} from '../../fe-core/modules/comparison/comparison.module';
import {ComparisonStatsService} from '../../services/comparison-stats.service';

import {StandingsModule, StandingsModuleData} from '../../fe-core/modules/standings/standings.module';
import {TDLStandingsTabdata} from '../../services/standings.data';
import {StandingsService} from '../../services/standings.service';

import {SchedulesService} from '../../services/schedules.service';
import {SchedulesModule} from '../../fe-core/modules/schedules/schedules.module';

import {TeamRosterModule, RosterModuleData} from '../../fe-core/modules/team-roster/team-roster.module';
import {RosterService} from '../../services/roster.service';
import {TeamRosterData} from '../../services/roster.data';

import {ProfileHeaderData, ProfileHeaderModule} from '../../fe-core/modules/profile-header/profile-header.module';
import {IProfileData, ProfileHeaderService} from '../../services/profile-header.service';

import {NewsModule} from '../../fe-core/modules/news/news.module';
import {NewsService} from '../../services/news.service';

import {PlayerStatsModule, PlayerStatsModuleData} from '../../fe-core/modules/player-stats/player-stats.module';
import {PlayerStatsService} from '../../services/player-stats.service'
import {MLBPlayerStatsTableData} from '../../services/player-stats.data'

//module | interface | service
import {DraftHistoryModule} from '../../fe-core/modules/draft-history/draft-history.module';

import {ImagesMedia} from "../../fe-core/components/carousels/images-media-carousel/images-media-carousel.component";
import {ImagesService} from "../../services/carousel.service";

import {ListOfListsModule} from "../../fe-core/modules/list-of-lists/list-of-lists.module";
import {ListOfListsService} from "../../services/list-of-lists.service";

import {TransactionsModule, TransactionModuleData} from "../../fe-core/modules/transactions/transactions.module";
import {TransactionsService} from "../../services/transactions.service";
import {DailyUpdateModule} from "../../fe-core/modules/daily-update/daily-update.module";
import {DailyUpdateService, DailyUpdateData} from "../../services/daily-update.service";

import {SidekickWrapper} from "../../fe-core/components/sidekick-wrapper/sidekick-wrapper.component";

import {ResponsiveWidget} from '../../fe-core/components/responsive-widget/responsive-widget.component';
import {VideoModule} from "../../fe-core/modules/video/video.module";
import {VideoService} from "../../services/video.service";
import {HeadlineDataService} from "../../global/global-ai-headline-module-service";
import {HeadlineData} from "../../global/global-interface";

import {SeoService} from "../../seo.service";

declare var moment;
declare var jQuery: any; //used for scroll event

@Component({
    selector: 'Team-page',
    templateUrl: './app/webpages/team-page/team.page.html',
    directives: [
        SidekickWrapper,
        VideoModule,
        LoadingComponent,
        ErrorComponent,
        DailyUpdateModule,
        SchedulesModule,
        BoxScoresModule,
        DraftHistoryModule,
        HeadlineComponent,
        ProfileHeaderModule,
        StandingsModule,
        CommentModule,
        DYKModule,
        FAQModule,
        TwitterModule,
        ComparisonModule,
        TeamRosterModule,
        NewsModule,
        ArticlesModule,
        ImagesMedia,
        ListOfListsModule,
        PlayerStatsModule,
        TransactionsModule,
        ResponsiveWidget
    ],
    providers: [
      VideoService,
      BoxScoresService,
      SchedulesService,
      StandingsService,
      ProfileHeaderService,
      RosterService,
      ListOfListsService,
      ImagesService,
      NewsService,
      FaqService,
      DykService,
      PlayerStatsService,
      TransactionsService,
      ComparisonStatsService,
      DailyUpdateService,
      TwitterService,
      Title
    ]
})

export class TeamPage implements OnInit {
    public widgetPlace: string = "widgetForModule";
    headerData:any;
    pageParams:SportPageParameters;
    partnerID:string = null;
    hasError: boolean = false;
    headlineError:boolean = false;
    headlineData:HeadlineData;
    profileHeaderData:ProfileHeaderData;
    profileData:IProfileData;
    comparisonModuleData: ComparisonModuleData;
    standingsData: StandingsModuleData;
    playerStatsData: PlayerStatsModuleData;
    rosterData: RosterModuleData<TeamRosterData>;
    dailyUpdateData: DailyUpdateData;
    firstVideo:string;
    videoData:any;
    imageData:Array<any>;
    copyright:any;
    imageTitle: any;
    profileType:string = "team";
    isProfilePage:boolean = true;
    // draftHistoryData:any;
    ptabName:string;

    boxScoresData:any;
    currentBoxScores:any;
    dateParam:any;

    transactionsActiveTab: any;
    transactionsData:TransactionModuleData;
    transactionFilter1: Array<any>;
    dropdownKey1: string;

    schedulesData:any;
    scheduleFilter1:Array<any>;
    selectedFilter1:string;
    eventStatus: any;
    isFirstRun:number = 0;

    profileName:string;
    listOfListsData:Object; // paginated data to be displayed
    newsDataArray: Array<Object>;
    faqData: Array<faqModuleData>;
    dykData: Array<dykModuleData>;
    twitterData: Array<twitterModuleData>;

    constructorControl:boolean = true;

    private batchLoadIndex: number = 1;

    teamName: string;
    activeTransactionsTab: string;
    transactionModuleFooterParams: any;

    public scope: string;
    public sportLeagueAbbrv: string = GlobalSettings.getSportLeagueAbbrv().toLowerCase();
    public collegeDivisionAbbrv: string = GlobalSettings.getCollegeDivisionAbbrv();

    constructor(private _params:RouteParams,
                private _router:Router,
                private _title: Title,
                private _standingsService:StandingsService,
                private _boxScores:BoxScoresService,
                private _schedulesService:SchedulesService,
                private _profileService:ProfileHeaderService,
                private _lolService: ListOfListsService,
                private _transactionsService:TransactionsService,
                private _imagesService:ImagesService,
                private _playerStatsService: PlayerStatsService,
                private _rosterService: RosterService,
                private _newsService: NewsService,
                private _faqService: FaqService,
                private _dykService: DykService,
                private _twitterService: TwitterService,
                private _comparisonService: ComparisonStatsService,
                private _dailyUpdateService: DailyUpdateService,
                private _headlineDataService:HeadlineDataService,
                private _seoService: SeoService,
                private _videoBatchService: VideoService) {

        this.pageParams = {
            teamId: Number(_params.get("teamId"))
        };

        GlobalSettings.getParentParams(_router, parentParams => {
          if (this.constructorControl) {
            //check to see if scope is correct and redirect
            VerticalGlobalFunctions.scopeRedirect(_router, _params);
            this.partnerID = parentParams.partnerID;
            this.scope = parentParams.scope;
            var currDate = new Date();
            var currentUnixDate = currDate.getTime();
            //convert currentDate(users local time) to Unix and push it into boxScoresAPI as YYYY-MM-DD in EST using moment timezone (America/New_York)
            this.dateParam ={
              profile:'team',//current profile page
              teamId:this.pageParams.teamId, // teamId if it exists
              date: moment.tz( currentUnixDate , 'America/New_York' ).format('YYYY-MM-DD')
              // date: '2016-09-11'
            }
            this.setupProfileData(this.partnerID,this.scope);
            this.constructorControl = false;
          }

          this.transactionModuleFooterParams = {
              scope: this.scope,
              teamName: _params.get("teamName"),
              teamId: _params.get("teamId")
          }
        });
    }

    ngOnInit() {
        this.ptabName="Passing";
    }

    /**
     *
     * Profile Header data is needed to fill in data info for other modules.
     * It is required to synchronously aquire data first before making any asynchronous
     * calls from other modules.
     *
     **/
    private setupProfileData(partnerID, scope) {

        this._profileService.getTeamProfile(this.pageParams.teamId).subscribe(
            data => {
                /*** About the [Team Name] ***/
                this.metaTags(data);
                this.pageParams = data.pageParams;
                this.profileData = data;
                let headerData = data.headerData != null ? data.headerData : null;
                this.profileName = data.teamName;
                if(headerData.teamMarket != null){
                  this.profileName = headerData.teamMarket;
                  this.profileName = headerData.teamName != null ? this.profileName + ' ' + headerData.teamName : this.profileName;
                }
                this.profileHeaderData = this._profileService.convertToTeamProfileHeader(data);
                this.dailyUpdateModule(this.pageParams.teamId);

                setTimeout(() => { // defer loading everything below the fold
                  this.getHeadlines();

                  /*** Keep Up With Everything [Team Name] ***/
                  this.getBoxScores(this.dateParam);

                this.eventStatus = 'pregame';
                this.getSchedulesData(this.eventStatus);//grab pregame data for upcoming games
                this.standingsData = this._standingsService.loadAllTabsForModule(this.pageParams, this.scope, this.pageParams.teamId.toString(), data.headerData.teamMarket + ' ' + data.teamName);
                this.rosterData = this._rosterService.loadAllTabsForModule(this.scope, this.pageParams.teamId, this.profileName, this.pageParams.conference, true, data.headerData.teamMarket);
                this.playerStatsData = this._playerStatsService.loadAllTabsForModule(this.pageParams.teamId, this.profileName, true);
                this.activeTransactionsTab = "Transactions"; // default tab is Transactions
                this.transactionsData = this._transactionsService.loadAllTabsForModule(this.profileName, this.activeTransactionsTab, this.pageParams.teamId);
                //this.loadMVP
                this.setupComparisonData();

                  /*** Other [League Name] Content You May Love ***/
                  this.getImages(this.imageData);
                  this.getDykService();
                  this.getFaqService();
                  this.setupListOfListsModule();
                  this.getNewsService();
                  this.getTeamVideoBatch(7, 1, 1, 0, scope,this.pageParams.teamId);

                  /*** Interact With [League Name]’s Fans ***/
                  this.getTwitterService();
                }, 2000);
            },
            err => {
                this.hasError = true;
                console.log("Error getting team profile data for " + this.pageParams.teamId, err);
            }
        );
    }

    private metaTags(data){
      //create meta description that is below 160 characters otherwise will be truncated
      let header = data.headerData;
      let metaDesc =  header.description;
      let link = window.location.href;
      let title = header.teamMarket + ' ' + header.teamName;
      let image = header.teamLogo;
      let record = '';
      if (header.leagueRecord != null) {
        record = header.leagueRecord;
        let recordArr = record.split('-');
        record = "(" + recordArr[0] + "-" + recordArr[1] + ")";
      }
      title = title  + record;
      this._seoService.setCanonicalLink(this._params.params, this._router);
      this._seoService.setOgTitle(title);
      this._seoService.setOgDesc(metaDesc);
      this._seoService.setOgType('Website');
      this._seoService.setOgUrl(link);
      this._seoService.setOgImage(GlobalSettings.getImageUrl(image));
      this._seoService.setTitle(title);
      this._seoService.setMetaDescription(metaDesc);
      this._seoService.setMetaRobots('Index, Follow');

      let color = header.color != null ? header.color.split(',')[0]:'#2d3e50';
      this._seoService.setThemeColor(color);
      //grab domain for json schema
      let domainSite;
      if(GlobalSettings.getHomeInfo().isPartner && !GlobalSettings.getHomeInfo().isSubdomainPartner){
        domainSite = "https://"+window.location.hostname+'/'+GlobalSettings.getHomeInfo().partnerName;
      }else{
        domainSite = "https://"+window.location.hostname;
      }

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
           "@id": "`+window.location.href+"?league="+header.divisionName+`",
           "name": "`+header.divisionName+`"
         }
       },{
         "@type": "ListItem",
         "position": 3,
         "item": {
           "@id": "`+window.location.href+`",
           "name": "`+header.teamMarket + ' ' + header.teamName+`"
         }
       }]
      }`;
      this._seoService.setApplicationJSON(teamSchema, 'page');
      this._seoService.setApplicationJSON(jsonSchema, 'json');
    }

    ngOnDestroy(){
      this._seoService.removeApplicationJSON('page');
      this._seoService.removeApplicationJSON('json');
    }
    //api for Headline Module
    private getHeadlines(){
        var scope = this.scope == "fbs" ? "ncaa" : "nfl";
        this._headlineDataService.getAiHeadlineData(scope, this.pageParams.teamId)
            .subscribe(
                HeadlineData => {
                    this.headlineData = HeadlineData.data;
                    this.headlineError = HeadlineData.data.status != "Success";
                },
                err => {
                    console.log("Error loading AI headline data for " + this.pageParams.teamId, err);
                }
            )
    }

    private dailyUpdateModule(teamId: number) {
        this._dailyUpdateService.getTeamDailyUpdate(teamId)
            .subscribe(data => {
                this.dailyUpdateData = data;
            },
            err => {
                this.dailyUpdateData = this._dailyUpdateService.getErrorData();
                console.log("Error getting daily update data", err);
            });
    }

    private getTeamVideoBatch(numItems, startNum, pageNum, first, scope, teamID?){
       // if(teamID)
        this._videoBatchService.getVideoBatchService(numItems, startNum, pageNum, first, scope, teamID)
            .subscribe(data => {
              ;
                this.firstVideo = data.data[first].videoLink;
                this.videoData = this._videoBatchService.transformVideoStack(data.data.slice(1));
            },
            err => {
                console.log("Error getting video data");
            }
        );
    }

    private getTwitterService() {
        this._twitterService.getTwitterService(this.profileType, this.pageParams.teamId)
            .subscribe(data => {
                this.twitterData = data;
            },
            err => {
                console.log("Error getting twitter data");
            });
    }

    private getDykService() {
        this._dykService.getDykService(this.profileType, this.pageParams.teamId)
            .subscribe(data => {
                this.dykData = data;
            },
            err => {
                console.log("Error getting did you know data");
            });
    }

    private getFaqService() {
        this._faqService.getFaqService(this.profileType, this.pageParams.teamId)
            .subscribe(data => {
                    this.faqData = data;
                },
                err => {
                    console.log("Error getting faq data for team", err);
                });
    }

    private getNewsService() {
      let params = {
        limit : 10,
        pageNum : 1,
        id : this.pageParams.teamId
      }
        this._newsService.getNewsService(this.scope,params, "team", "module")
            .subscribe(data => {
                this.newsDataArray = data.news;
            },
            err => {
                console.log("Error getting news data");
            });
    }

    //api for BOX SCORES
    private getBoxScores(dateParams?) {
        if ( dateParams != null ) {
            this.dateParam = dateParams;
        }
        this._boxScores.getBoxScores(this.boxScoresData, this.profileName, this.dateParam, (boxScoresData, currentBoxScores) => {
          this.boxScoresData = boxScoresData;
          this.currentBoxScores = currentBoxScores;
        })
    }

    //grab tab to make api calls for post of pregame table
    private scheduleTab(tab) {
      this.isFirstRun = 0;
        if(tab == 'Upcoming Games'){
          this.eventStatus = 'pregame';
          this.getSchedulesData(this.eventStatus, null);
        }else if(tab == 'Previous Games'){
          this.eventStatus = 'postgame';
          this.getSchedulesData(this.eventStatus, this.selectedFilter1);
        }else{
          this.eventStatus = 'postgame';
          this.getSchedulesData(this.eventStatus, this.selectedFilter1);// fall back just in case no status event is present
        }
    }
    private filterDropdown(filter){
      let tabCheck = 0;
      if(this.eventStatus == 'postgame'){
        tabCheck = -1;
      }
      if(this.isFirstRun > tabCheck){
        this.selectedFilter1 = filter.key;
        this.getSchedulesData(this.eventStatus, this.selectedFilter1);
      }
      this.isFirstRun++;
    }

    //api for Schedules
    private getSchedulesData(status, year?){
      var limit = 5;
      if(status == 'pregame'){
        this.selectedFilter1 = null;
      }
      this._schedulesService.getScheduleTable(this.schedulesData, this.scope, 'team', status, limit, 1, this.pageParams.teamId, (schedulesData) => {
        if(status == 'pregame'){
          this.scheduleFilter1=null;
        }else{
          if(this.scheduleFilter1 == null){// only replaces if the current filter is not empty
            this.scheduleFilter1 = schedulesData.seasons;
          }
        }
        this.schedulesData = schedulesData;
      }, year) //year if null will return current year and if no data is returned then subract 1 year and try again
    }

    private transactionsTab(tab) {
        this.transactionsActiveTab = tab;
        this.getTransactionsData();
    }
    private transactionsFilterDropdown(filter) {
      if ( this.transactionsActiveTab == null ) {
        this.transactionsActiveTab = this.transactionsData[0];
      }
      this.dropdownKey1 = filter;
      this.getTransactionsData();
    }
    private getTransactionsData() {
      this._transactionsService.getTransactionsService(this.transactionsActiveTab, this.pageParams.teamId, 'module', this.dropdownKey1)
      .subscribe(
          transactionsData => {
            if ( this.transactionFilter1 == undefined ) {
              this.transactionFilter1 = transactionsData.yearArray;
              if(this.dropdownKey1 == null){
                this.dropdownKey1 = this.transactionFilter1[0].key;
              }
            }

            this.transactionsData.tabs.filter(tab => tab.tabDataKey == this.transactionsActiveTab.tabDataKey)[0] = transactionsData;
          },
          err => {
          console.log('Error: transactionsData API: ', err);
          }
      );
    } //private getTransactionsData

    private getImages(imageData) {
        this._imagesService.getImages(this.profileType, this.pageParams.teamId)
            .subscribe(data => {
                    return this.imageData = data.imageArray, this.copyright = data.copyArray, this.imageTitle = data.titleArray;
                },
                err => {
                    console.log("Error getting image data" + err);
                });
    }

    private setupComparisonData() {
        this._comparisonService.getInitialPlayerStats(this.scope, this.pageParams).subscribe(
            data => {
                this.comparisonModuleData = data;
            },
            err => {
                console.log("Error getting comparison data for "+ this.pageParams.teamId, err);
            });
    }

    private standingsTabSelected(tabData: Array<any>) {
        //only show 5 rows in the module
        this.pageParams.scope = this.scope;
        this._standingsService.getStandingsTabData(tabData, this.pageParams, (data) => {}, 5);
    }

    private standingsFilterSelected(tabData: Array<any>) {
      this.pageParams.scope = this.scope;
      this._standingsService.getStandingsTabData(tabData, this.pageParams, data => {
      }, 5);
    }

    private playerStatsTabSelected(tabData: Array<any>) {
         //only show 4 rows in the module
        this._playerStatsService.getStatsTabData(tabData, this.pageParams, data => {}, 5);
        var seasonArray=tabData[0];
        var seasonIds=seasonArray.seasonIds;
        var seasonTab = seasonIds.find(function (e) {
            if( e.value===tabData[1]){
                return true;
            }

        });
        if (tabData[0].tabActive=="Special"){
            this.ptabName="Kicking";
            if(seasonTab){

            }else{
                this.ptabName=tabData[1];
            }
        }else{
            this.ptabName=tabData[0].tabActive;
        };
    }

    setupListOfListsModule() {
        let params = {
          targetId : this.pageParams.teamId,
          limit : 5,
          pageNum : 1,
          scope : this.scope
        }
        this._lolService.getListOfListsService(params, "team", "module")
            .subscribe(
                listOfListsData => {
                    this.listOfListsData = listOfListsData.listData;
                    // this.listOfListsData["type"] = "team";
                    // this.listOfListsData["id"] = this.pageParams.teamId;
                },
                err => {
                    console.log('Error: listOfListsData API: ', err);
                }
            );
    }

    // function to lazy load page sections
    private onScroll(event) {
      this.batchLoadIndex = GlobalFunctions.lazyLoadOnScroll(event, this.batchLoadIndex);
      return;
    }
}
