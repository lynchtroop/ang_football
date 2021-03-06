import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { isBrowser } from 'angular2-universal';

//globals
import { GlobalFunctions } from '../global/global-functions';
import { VerticalGlobalFunctions }  from '../global/vertical-global-functions';
import { GlobalSettings } from '../global/global-settings';

//interfaces
import { SearchComponentResult, SearchComponentData } from '../ui-modules/search/search.component';
import { PaginationParameters } from '../fe-core/interfaces/pagination.data';




//Interface for input of search component
export interface SearchInput {
    //Text that goes in as the placeholder for the input
    placeholderText: string;
    //Boolean to determine if the search dropdown shosuld be displayed
    hasSuggestions: boolean;
    //Text that goes in the input on load
    initialText?: string;
}

export interface SearchPageInput {
    //Data for the search bar component
    searchComponent: SearchInput;
    //Search Image
    heroImage: string;
    //Title Text
    headerText: string;
    //Text under title of search header
    subHeaderText: string;
    //Query string of the search
    query: string;
    //Tab data
    tabData: Array<{
        //Name of Tab
        tabName: string;
        //Boolean to determine if tab is initially selected
        isTabDefault?: boolean;
        //Search results related to tab
        results: Array<{
            title: string;
            url: Array<any>;
            urlText: string;
            description: string;
        }>;
        error:{
          message:string;
          icon:string;
        };
        pageMax:any;
        totalResults:any;
        paginationParameters: PaginationParameters;
    }>
}

declare var Fuse: any;
@Injectable()
export class SearchService{
    public pageMax: number = 10;
    public searchJSON: any;

    public searchAPI: string = GlobalSettings.getApiUrl() + '/landingPage/search';
    constructor(private http: Http, private _router:Router){
      //Get initial search JSON data
      this.getSearchJSON()
    }

    //Function get search JSON object
    getSearchJSON(){
      // this.newSearchAPI = this.newSearchAPI+scope;
        return this.http.get(this.searchAPI, {
            })
            .map(
                res => res.json()
            ).subscribe(
                data => {
                    this.searchJSON = data;
                },
                err => {
                  console.log('ERROR search results');
                    this.searchJSON = null
                }
            )
    }
    //Function get search JSON object
    getSearch(){
      return this.http.get(this.searchAPI, {})
          .map(
              res => res.json()
          ).map(
              data => {
                  return data;
              },
              err => {
                console.log('ERROR search results');
              }
          )
    }

    /*
     *  Functions for search component
     */

    //Function used by search input to get suggestions dropdown
    getSearchDropdownData(term: string){
        //TODO: Wrap in async
        let data = this.searchJSON;
        let dataSearch = {
          players: [],
          teams: []
        };
        for(var s in data){
          data[s]['players'].forEach(function(item){
            item['scope'] = s == 'fbs'? 'ncaaf': 'nfl';
            dataSearch.players.push(item);
          })
          data[s]['teams'].forEach(function(item){
            item['scope'] = s == 'fbs'? 'ncaaf': 'nfl';
            dataSearch.teams.push(item);
          })
        }

        //Search for players and teams
        let playerResults = this.searchPlayers(term, null, dataSearch.players);
        let teamResults = this.searchTeams(term, null, dataSearch.teams);
        //Transform data to useable format
        let searchResults = this.resultsToDropdown(playerResults, teamResults);
        //Build output to send to search component
        let searchOutput: SearchComponentData = {
            term: term,
            searchResults: searchResults
        };
        return Observable.of(searchOutput);
    }

    //Convert players and teams to needed dropdown array format
    resultsToDropdown(playerResults, teamResults){
        let searchArray: Array<SearchComponentResult> = [];
        let partnerScope = GlobalSettings.getHomeInfo();
        let count = 0, max = 4;
        for(let i = 0, length = teamResults.length; i < length; i++){
            //Exit loop if max dropdown count
            if(count >= max){
                break;
            }
            let item = teamResults[i];
            let teamName = item.teamName;

            //generate route for team
            let route = VerticalGlobalFunctions.formatTeamRoute('nfl', teamName, item.teamId);
            count++;
            searchArray.push({
                title: teamName,
                value: teamName,
                imageUrl: {
                    imageClass: "image-43",
                    mainImage: {
                      imageUrl: GlobalSettings.getImageUrl(item.teamLogo, GlobalSettings._imgSmLogo),
                      hoverText: "<i class='fa fa-mail-forward search-text'></i>",
                      imageClass: "border-1",
                      urlRouteArray: route,
                    }
                },
                routerLink: route
              })
        }

        for(let i = 0, length = playerResults.length; i < length; i++){
            //Exit loop if max dropdown count
            if(count >= max){
                break;
            }
            count++;
            let item = playerResults[i];
            let playerName = item.playerName;
            let route = VerticalGlobalFunctions.formatPlayerRoute('nfl', item.teamName, playerName, item.playerId);
            searchArray.push({
                title: '<span class="text-heavy">' + playerName + '</span> - ' + item.teamName,
                value: playerName,
                imageUrl: {
                    imageClass: "image-43",
                    mainImage: {
                      imageUrl: item.imageUrl != "No Image" ?GlobalSettings.getImageUrl(item.imageUrl, GlobalSettings._imgSmLogo): "/app/public/no-image.svg",
                      urlRouteArray: route,
                      hoverText: "<i class='fa fa-mail-forward search-text'></i>",
                      imageClass: "border-1"
                    }
                },
                routerLink: route
            })
        }
        return searchArray;
    }

    //Function to build search route
    getSearchRoute(term: string){
        let searchRoute: Array<any>;
        let partnerId: string = VerticalGlobalFunctions.getWhiteLabel();
        let scope: string = GlobalSettings.getScopeNow();
        //Build search Route
        if ( term ) {
            searchRoute = [partnerId, scope, 'search', term];
        }else{
            searchRoute = null;
        }
        return searchRoute !== null ? searchRoute : ['error'];
    }

    /*
     * Functions for search page
     */
    getSearchPageData(partnerId: string, query: string, scope, data){
        let dataSearch = {
          players: [],
          teams: []
        };
        //coming from router as possibly ncaaf and will need to change it to fbs for api then swap it back to ncaaf for display
        scope = scope == 'ncaaf'?'fbs':scope;
        //
        if(scope !== null){
          data[scope]['players'].forEach(function(item){
            item['scope'] = scope == 'fbs' ? 'ncaaf': 'nfl';
            dataSearch.players.push(item);
          });
          data[scope]['teams'].forEach(function(item){
            item['scope'] = scope == 'fbs' ? 'ncaaf': 'nfl';
            dataSearch.teams.push(item);
          })
        }else{
          for(var s in data){
            data[s]['players'].forEach(function(item){
              item['scope'] = s == 'fbs'? 'ncaaf': 'nfl';
              dataSearch.players.push(item);
            })
            data[s]['teams'].forEach(function(item){
              item['scope'] = s == 'fbs'? 'ncaaf': 'nfl';
              dataSearch.teams.push(item);
            })
          }
        }

        //converts to usable scope for api calls null is default value for all
        scope = scope != null ? GlobalSettings.getScope(scope) : null;
        //Search for players and teams
        let playerResults = this.searchPlayers(query, scope, dataSearch.players);
        let teamResults = this.searchTeams(query, scope, dataSearch.teams);

        let searchResults = this.resultsToTabs(partnerId, query, playerResults, teamResults);
        return {
          results: searchResults,
          filters: this.filterDropdown()
        };
    }

    filterDropdown(){
      var dropdownFilter = [{
        key: null,
        value: 'ALL',
      },{
        key: 'nfl',
        value: 'NFL',
      },{
        key: 'ncaaf',
        value: 'NCAAF',
      }];
      return dropdownFilter;
    }

    //Convert players and teams to tabs format
    resultsToTabs(partnerId: string, query, playerResults, teamResults){
      let self = this;
      let partnerScope = GlobalSettings.getHomeInfo();

        let searchPageInput: SearchPageInput = {
            searchComponent : {
                placeholderText: 'Search for a player or team...',
                hasSuggestions: true,
                initialText: query
            },
            heroImage: '',
            headerText: 'Discover The Latest In Football',
            subHeaderText: 'Find the Players and Teams you love.',
            query: query,
            tabData: [
                {
                    tabName: 'Player (' + playerResults.length + ')',
                    isTabDefault: playerResults.length >= teamResults.length ? true : false,
                    results: [],
                    error:{
                      message:"Sorry we can't find a <span class='text-heavy'>Player Profile</span> matching your search term(s) ''<span class='query-blue'>"+query+"</span>'', please try your search again.",
                      icon:'fa-search-icon-01'
                    },
                    pageMax:this.pageMax,
                    totalResults:playerResults.length,
                    paginationParameters: {
                        index: 1,
                        max: 10,//default value will get changed in next function
                        paginationType: 'module'
                    }
                },
                {
                    tabName: 'Team (' + teamResults.length + ')',
                    isTabDefault: teamResults.length > playerResults.length ? true : false,
                    results: [],
                    error:{
                      message:"Sorry we can't find a <span class='text-heavy'>Team Profile</span> matching your search term(s) '<span class='query-blue'>"+query+"</span>', please try your search again.",
                      icon:'fa-search-icon-01'
                    },
                    pageMax:this.pageMax,
                    totalResults:teamResults.length,
                    paginationParameters: {
                        index: 1,
                        max: 10,//default value will get changed in next function
                        paginationType: 'module'
                    }
                }
            ]
        };

        let setTabDefault = searchPageInput.tabData
        var objCounter = 0;
        var objData1 = [];

        playerResults.forEach(function(item){
            let playerName = item.playerName;
            let title = GlobalFunctions.convertToPossessive(playerName) + " Player Profile";
            let route = VerticalGlobalFunctions.formatPlayerRoute(item.scope, item.teamName, playerName, item.playerId);
            let relRoute = route.join('/');
            let urlText = '<p>' + GlobalSettings.getHomePage(partnerId, false) + '<b>' + relRoute + '</b></p>';
            let regExp = new RegExp(playerName, 'g');
            let description = item.playerDescription.replace(regExp, ('<span class="text-heavy">' + playerName + '</span>'));

            if(typeof objData1[objCounter] == 'undefined' || objData1[objCounter] === null){//create paginated objData.  if objData array does not exist then create new obj array
              objData1[objCounter] = [];
              objData1[objCounter].push({
                  title: title,
                  urlText: urlText,
                  url: route,
                  description: description
              })
            }else{// otherwise push in data
              objData1[objCounter].push({
                  title: title,
                  urlText: urlText,
                  url: route,
                  description: description
              })
              if(objData1[objCounter].length >= self.pageMax){// increment the objCounter to go to next array
                objCounter++;
              }
            }
        });
        searchPageInput.tabData[0].results = objData1;
        searchPageInput.tabData[0].paginationParameters.max = searchPageInput.tabData[0].results.length;

        var objCounter = 0;
        var objData2 = [];

        teamResults.forEach(function(item){
            let teamName = item.teamName;
            let title = GlobalFunctions.convertToPossessive(teamName) + " Team Profile";
            let route = VerticalGlobalFunctions.formatTeamRoute(item.scope, teamName, item.teamId);
            let relRoute = route.join('/');
            let urlText = GlobalSettings.getHomePage(partnerId, false) + '<b>' + relRoute + '</b>';
            let regExp = new RegExp(teamName, 'g');
            let description = item.teamDescription.replace(regExp, ('<b>' + teamName + '</b>'));

            if(typeof objData2[objCounter] == 'undefined' || objData2[objCounter] === null){//create paginated objData.  if objData array does not exist then create new obj array
              objData2[objCounter] = [];
              objData2[objCounter].push({
                  title: title,
                  urlText: urlText,
                  url: route,
                  description: description
              })
            }else{// otherwise push in data
              objData2[objCounter].push({
                  title: title,
                  urlText: urlText,
                  url: route,
                  description: description
              })
              if(objData2[objCounter].length >= self.pageMax){// increment the objCounter to go to next array
                objCounter++;
              }
            }
        });

        searchPageInput.tabData[1].results = objData2;
        searchPageInput.tabData[1].paginationParameters.max = searchPageInput.tabData[1].results.length;
        return searchPageInput;
    }

    /*
     *  Search Functions used by both component and page
     */
     static _orderByComparatorPlayer(a:any, b:any)/*--:number--*/{
       if ((a.score - b.score) == 0){
         if (a.item.playerName.toLowerCase() > b.item.playerName.toLowerCase()){return 1;} else {return -1;}
       }
       else {
         return a.score - b.score;
       }
     }
     static _orderByComparatorTeam(a:any, b:any)/*--:number--*/{
       if ((a.score - b.score) == 0){
         if (a.item.teamName.toLowerCase() > b.item.teamName.toLowerCase()){return 1;} else {return -1;}
       }
       else {
         return a.score - b.score;
       }
     }



    //Function to search through players. Outputs array of players that match criteria
    searchPlayers(term, scope, data) {
        var fuse = new Fuse(data, {
            //Fields the search is based on
            keys: [{
              name: 'playerFirstName',
              weight: 0.5
            }, {
              name: 'playerLastName',
              weight: 0.3
            }, {
                name: 'playerName',
                weight: 0.2
            }],
            //At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location),
            // a threshold of 1.0 would match anything.
            threshold: 0.1,
            distance: 10,
            tokenize: false,
            sortFn: SearchService._orderByComparatorPlayer
        });
        return fuse.search(term);
    }



    //Function to search through teams. Outputs array of teams that match criteria
    searchTeams(term, scope, data) {
        var fuse = new Fuse(data, {
            //Fields the search is based on
            keys: ['teamName'],
            //At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything.
            threshold: 0.2,
            shouldSort: true,
            sortFn: SearchService._orderByComparatorTeam
        });
        return fuse.search(term);
      }
}
