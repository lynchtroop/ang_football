import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Http, Headers} from '@angular/http';
import {GlobalFunctions} from '../global/global-functions';
import {RosterModuleData} from '../fe-core/modules/team-roster/team-roster.module';
import {RosterTableModel, NFLRosterTabData, TeamRosterData} from '../services/roster.data';
import {VerticalGlobalFunctions} from '../global/vertical-global-functions';
import {GlobalSettings} from '../global/global-settings';
import {Conference, Division} from '../global/global-interface';

@Injectable()
export class RosterService {
  private _apiUrl: string = GlobalSettings.getApiUrl();
  private _tabTypes = ['full', 'offense', 'defense', 'special'];
  public storedPartnerParam: string;

  public fullRoster: { [type:string]:Array<TeamRosterData> };

  constructor(public http: Http){}

  setToken(){
    var headers = new Headers();
    return headers;
  }

  initializeAllTabs(scope:string, teamId: string, conference: Conference, maxRows?: number, isTeamProfilePage?: boolean): Array<NFLRosterTabData> {
    return this._tabTypes.map(type => new NFLRosterTabData(this, scope, teamId, type, conference, maxRows, isTeamProfilePage));
  }

  getRosterTabData(rosterTab: NFLRosterTabData): Observable<Array<TeamRosterData>> {
    var teamId = rosterTab.teamId;
    var type = rosterTab.type;

    rosterTab.isLoaded = false;
    rosterTab.hasError = false;

    var fullUrl = this._apiUrl + "/roster/" + teamId;
    //console.log("loading full team roster: "+ fullUrl);
    return this.http.get(fullUrl, {headers: this.setToken()})
      .map(res => res.json())
      .map(data => {
        this.fullRoster = data.data;
        return data.data;
      });
  }//getRosterService ends

  loadAllTabsForModule(partnerRoute: string, scope:string, teamId: number, teamName: string, conference: Conference, isTeamProfilePage: boolean, fullTeam): RosterModuleData<TeamRosterData> {
    return {
        moduleTitle: "Team Roster",
        moduleIdentifier: " - " + teamName,
        pageRouterLink: this.getLinkToPage(partnerRoute, scope, teamId, teamName),
        tabs: this.initializeAllTabs(scope, teamId.toString(), conference, 5, isTeamProfilePage)
    };
  }

  private getModuleTitle(teamName: string): string {
    let moduletitle = "Team Roster";
    if ( teamName ) {
      moduletitle += " - " + teamName;
    }
    return moduletitle;
  }

  getPageTitle(teamName: string): string {
    let pageTitle = "Team Roster";
    if ( teamName ) {
      pageTitle = "Team Roster - " + teamName;
    }
    return pageTitle;
  }

  getLinkToPage(partnerRoute: string, scope, teamId: number, teamName: string): Array<any> {
    var pageName = "team-roster";
    return [partnerRoute, scope, pageName, GlobalFunctions.toLowerKebab(teamName), teamId];
  }

}