import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

//globals
import { GlobalSettings } from "../../global/global-settings";
import { VerticalGlobalFunctions } from '../../global/vertical-global-functions';

//services
import { DraftHistoryService } from '../../services/draft-history.service';
import { ListPageService } from '../../services/list-page.service';
import { ProfileHeaderService } from '../../services/profile-header.service';
import { SchedulesService } from '../../services/schedules.service';
import { SeoService } from "../../seo.service";

//interfaces
import { DetailListInput } from '../../fe-core/components/detailed-list-item/detailed-list-item.component';
import { ModuleFooterData, FooterStyle } from '../../fe-core/components/module-footer/module-footer.component';
import { SliderCarouselInput } from '../../fe-core/components/carousels/slider-carousel/slider-carousel.component';
import { TitleInputData } from '../../fe-core/components/title/title.component';



//libraries
declare var moment;



@Component({
    selector: 'schedules-page',
    templateUrl: './app/webpages/schedules-page/schedules.page.html',
})

export class SchedulesPage implements OnInit {
  public partnerID: string;
  public scope: string;
  public paramsub: any;
  public initialPage: number;
  public initialTabKey: string;
  public teamID: number;
  public teamName: string;
  public pageNum: number;

  profileHeaderData: TitleInputData;
  errorData: any;
  paginationParameters: any;
  isError: boolean = false;
  tabData: any;
  limit: number = 10;
  isFirstRun: number = 0;

  schedulesData: any;
  scheduleFilter1: Array<any>;
  scheduleFilter2: any;
  selectedFilter1: string;
  selectedFilter1Param: string; //values form url and do not change
  selectedFilter2: string;
  selectedFilter2Param: string; //values form url and do not change
  eventStatus: string;
  currentYear = moment().year();

  public selectedTabKey: string;

  constructor(
    private activateRoute: ActivatedRoute,
    private _router: Router,
    private _schedulesService: SchedulesService,
    private profHeadService: ProfileHeaderService,
    private _title: Title,
    private _seoService: SeoService
  ) {
  //  this.isFirstRun = 0;

    this.paramsub = this.activateRoute.params.subscribe(
      (param :any)=> {
        this.scope = param['scope'].toLowerCase() == 'ncaaf' ? 'fbs' : 'nfl';
        this.initialPage = Number(param['pageNum']);
        this.partnerID = param['partnerID'];
        this.teamID = param['teamID'];
        this.teamName = param['teamName'];
        this.selectedFilter1 = param["year"] ? param["year"] : this.currentYear;
        this.selectedTabKey = param["tab"] == null || param["tab"] == 'all' ? 'pregame' : param["tab"];
        this.pageNum = param['pageNum'] ? param['pageNum'] : 1;
        this.initialTabKey = !this.selectedTabKey ? 'pregame' : this.initialTabKey;
        this.eventStatus = this.selectedTabKey;

        if (this.initialPage <= 0) {
            this.initialPage = 1;
        }

        this.getSchedulesData(this.eventStatus, this.initialPage, this.selectedFilter1, this.selectedFilter2);
      }
    );
  } //constructor

  ngOnInit() {} //ngOnInit



  resetDropdown1() {
    this.scheduleFilter1 = null;
    this.selectedFilter1 = null;
  }
  resetDropdown2() {
    this.scheduleFilter2 = null;
    this.selectedFilter2 = null;
  }



  private metaTags(data) {
    //create meta description that is below 160 characters otherwise will be truncated
    let text3 = data.text3 != null ? data.text3: '';
    let text4 = data.text4 != null ? '. '+data.text4: '';
    let title = text3 + ' ' + text4;
    let metaDesc = text3 + ' ' + text4 + ' as of ' + data.text1;
    let link = window.location.href;
    let imageUrl;
    if(data.imageURL != null && data.imageURL != ""){
       imageUrl = data.imageURL;
    }else{
       imageUrl = GlobalSettings.getmainLogoUrl();
    }
    this._seoService.setCanonicalLink();
    this._seoService.setOgTitle(title);
    this._seoService.setOgDesc(metaDesc +". Know more about football.");
    this._seoService.setOgType('Website');
    this._seoService.setOgUrl();
    this._seoService.setOgImage(imageUrl);
    this._seoService.setTitle(title);
    this._seoService.setMetaDescription(metaDesc);
    this._seoService.setMetaRobots('INDEX, FOLLOW');
  } //metaTags



  private scheduleTab(tab) {
    let activeTabKey;
    this.isFirstRun = 0;
    this.initialPage = 1;
    if (tab == 'Upcoming Games') {
      this.isFirstRun = 1;
      this.eventStatus = 'pregame';
      activeTabKey = this.eventStatus;
      this.getSchedulesData(this.eventStatus, this.initialPage, this.selectedFilter1, null);
    } else if (tab == 'Previous Games') {
      if (this.selectedFilter1 == null || this.selectedFilter1 == 'all') {
        this.resetDropdown1();
      }
      this.eventStatus = 'postgame';
      activeTabKey = this.eventStatus;
      this.getSchedulesData(this.eventStatus, this.pageNum, this.selectedFilter1, this.selectedFilter2);
    } else {
      this.eventStatus = 'pregame';
      activeTabKey = this.eventStatus;
      this.getSchedulesData(this.eventStatus, this.pageNum, this.selectedFilter1, this.selectedFilter2);// fall back just in case no status event is present
    }
  } //scheduleTab



  private getSchedulesData(status, pageNum, year?, week?) {
    var teamId = this.teamID; //determines to call league page or team page for schedules-table
    if (typeof year == 'undefined' || year == null) {
      year == new Date().getFullYear();
      this.selectedFilter1 = year;
    }
    if (teamId) {
      this.profHeadService.getTeamProfile(Number(teamId))
      .subscribe(
        data => {
          // this._title.setTitle(GlobalSettings.getPageTitle("Schedules", data.teamName));
          data.teamName=data.headerData.teamMarket?data.headerData.teamMarket+" "+ data.teamName:data.teamName;
          this.profileHeaderData = this.profHeadService.convertTeamPageHeader(this.scope, data, "Current Season Schedule - " + data.teamName);
          this.metaTags(this.profileHeaderData);
          this.errorData = {
            data: data.teamName + " has no record of any more games for the current season.",
            icon: "fa fa-calendar-times-o"
          }
        },
        err => {
          this.isError = true;
          console.log('Error: Schedules Profile Header API: ', err);
        // this.isError = true;
        }
      );
      this._schedulesService.getScheduleTable(this.schedulesData, this.scope, 'team', status, this.limit, this.initialPage, teamId, (schedulesData) => {
        this.schedulesData = schedulesData;
        if (this.schedulesData != null) {
          if (status == 'pregame') {
            this.scheduleFilter1 = null;
          } else {
            this.scheduleFilter1 = schedulesData.seasons;
            if (this.selectedFilter1 == null) {
              this.selectedFilter1 = this.schedulesData.seasons['data'][0].key;
            }
            // if(this.scheduleFilter1 == null){// only replaces if the current filter is not empty
            // }
          }
          this.tabData = schedulesData.tabs;
          } else if (this.schedulesData == null) {
            this.isError = true;
          }

          this.setPaginationParams(schedulesData.pageInfo, year, this.selectedTabKey, pageNum);
      }, year, week)
    } else {
    // this._title.setTitle(GlobalSettings.getPageTitle("Schedules", "Football"));
    this.profHeadService.getLeagueProfile(this.scope)
      .subscribe(
        data => {
          var currentDate = new Date();// no stat for date so will grab current year client is on
          var display: string;
          if (currentDate.getFullYear() == currentDate.getFullYear()) {// TODO must change once we have historic data
            display = "Current Season"
          }
          var pageTitle = display + " Schedules - " + data.headerData.leagueFullName;
          this.profileHeaderData = this.profHeadService.convertLeagueHeader(data.headerData, pageTitle);
          this.metaTags(this.profileHeaderData);
          this.errorData = {
            data: data.headerData.leagueFullName + " has no record of any more games for the current season.",
            icon: "fa fa-calendar-times-o"
          }
        },
        err => {
          this.isError = true;
          console.log('Error: Schedules Profile Header API: ', err);
        }
      );
      if (year == null || year == 'all') {
        year = new Date().getFullYear();
      }
      this._schedulesService.getScheduleTable(this.schedulesData, this.scope, 'league', status, this.limit, pageNum, null, (schedulesData) => {
      this.schedulesData = schedulesData;
      if (this.schedulesData != null) {
        if (status == 'pregame' || status == 'created') {
          this.scheduleFilter1 = null;
        } else {
          if (this.scheduleFilter1 == null) {// only replaces if the current filter is not empty
            this.scheduleFilter1 = schedulesData.seasons;
          }
        }
        if (schedulesData.carData.length > 0) {
          this.scheduleFilter2 = schedulesData.weeks;
        } else {
          this.scheduleFilter2 = null;
        }
        this.schedulesData = schedulesData;
        this.tabData = schedulesData != null ? schedulesData.tabs : null;
      } else if (this.schedulesData == null) {
        this.isError = true;
      }

      this.setPaginationParams(schedulesData.pageInfo, year, this.selectedTabKey, pageNum);
    }, year, week)
    }
  } //getSchedulesData



  private filterDropdown(filter) {
    let tabCheck = 0;
    if (this.eventStatus == 'postgame') {
        tabCheck = -1;
    }
    if (this.isFirstRun > tabCheck) {
        var teamId = this.teamID;
        let filterChange = false;
        if (filter.value == 'filter1' && this.eventStatus == 'postgame' && this.selectedFilter1 != filter.key) {
            this.selectedFilter1 = filter.key;
            if (this.selectedFilter2 != null) {
                this.selectedFilter2 = this.scheduleFilter2['data'][0].key;//reset weeks to first in dropdown
            }
            filterChange = true;
        }
        if (!teamId) {
            if (filter.value == 'filter2' && this.selectedFilter2 != filter.key) {
                this.selectedFilter2 = filter.key;
                filterChange = true;
            }
        }
        if (filterChange) {
            this.isFirstRun = 0;
            this.initialPage = 1;
            this.getSchedulesData(this.eventStatus, this.initialPage, this.selectedFilter1, this.selectedFilter2);
        }
    }
    this.isFirstRun++;
  } //filterDropdown



  //PAGINATION
  //sets the total pages for particular lists to allow client to move from page to page without losing the sorting of the list
  setPaginationParams(input, year: string, tab: string, pageNum: number) {
    var pageType;
    var navigationPage = '/' + this.scope + '/schedules/';
    if (!teamName && !teamId) {
      navigationPage = '/' + this.scope + '/schedules/league';
    }
    var navigationParams = {
        year: year,
        tab: tab,
        pageNumber: pageNum
    };

    var teamName = this.teamName;
    var teamId = this.teamID;

    if (teamName) {
        navigationParams['teamName'] = teamName;
    }
    if (teamId) {
        navigationParams['teamId'] = teamId;
    }

    this.paginationParameters = {
        index: pageNum,
        max: input.totalPages,
        paginationType: 'module',
        navigationPage: navigationPage,
        navigationParams,
        indexKey: 'pageNumber'
    }
  } //setPaginationParams



  newIndex(newPage) {
    window.scrollTo(0, 0);
    this.isFirstRun = 0;
    this.initialPage = newPage;

    this.getSchedulesData(this.eventStatus, this.initialPage, this.selectedFilter1, this.selectedFilter2);
  } //newIndex

}