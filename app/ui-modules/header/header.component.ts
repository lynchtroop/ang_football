import {Component, Input, OnInit, OnChanges, Output, EventEmitter, ElementRef, Renderer} from '@angular/core';
// import {Search, SearchInput} from '../components/search/search.component';
import {GlobalSettings} from "../../global/global-settings";
import {GlobalFunctions} from "../../global/global-functions";
import {HamburgerMenuComponent, MenuData} from '../../ui-modules/hamburger-menu/hamburger-menu.component';

declare var stButtons: any;
declare var jQuery: any;

@Component({
    selector: 'header-component',
    templateUrl: './app/ui-modules/header/header.component.html',
    providers: [],
})
export class HeaderComponent {
    @Input() partnerID: string;
    @Input() partnerScript: any;
    @Output() tabSelected = new EventEmitter();
    @Output() scrollPadding = new EventEmitter();
    public scope: string;
    public routeSubscription: any;
    public logoUrl: string;
    public partnerLogoUrl: string;
    private _stickyHeader: string;
    private _stickyHeaderPartner: string;
    public searchInput: any = {
        placeholderText: "Search for a football player or team...",
        hasSuggestions: true
    };
    public hamburgerMenuData: Array<MenuData>;
    public hamburgerMenuInfo: Array<MenuData>;
    public titleHeader: string;
    public isOpened: boolean = false;
    public isSearchOpened: boolean = false;
    public isActive: boolean = false;
    public _sportLeagueAbbrv: string = GlobalSettings.getSportLeagueAbbrv();
    public _collegeDivisionAbbrv: string = GlobalSettings.getCollegeDivisionAbbrv();
    public _sportName: string = GlobalSettings.getSportName().toUpperCase();
    private elementRef: any;
    scrollTopPrev: number = 0;
    scrollUp: boolean = false;

    public linkHome: any;

    //deprecated
    private _router: any;
    constructor(elementRef: ElementRef, private _renderer: Renderer) {
        this.elementRef = elementRef;
    }
    openSearch(event) {
        if (this.isSearchOpened == true) {
            this.isSearchOpened = false;
        } else {
            this.isSearchOpened = true;
        }
    }
    // Page is being scrolled
    onScrollStick(event) {
        var header = document.getElementById('pageHeader');
        var stickyItem = document.getElementById('header-bottom'); //
        var scrollTop = event.srcElement.body.scrollTop; // pixels from top of page to current scroll view
        let heightBeforeStick = header.offsetHeight - stickyItem.offsetHeight; // used to send back to page container to determin the padding of when the header turns from a block to a position fixed and scroll height changes
        let scrollPadding = 0; // used to send back to page container to determin the padding of when the header turns from a block to a position fixed and scroll height changes
        let scrollPolarity = scrollTop - this.scrollTopPrev; // positive (+) return will be scroll down and negative (-) return will be scroll up

        if (scrollPolarity > 0 || scrollTop == 0) {// scrollUp is true scrollPolarity is negative which will add the header back
            scrollPadding = 0;
            this.scrollUp = false;
        } else {
            scrollPadding = header.offsetHeight;
            this.scrollUp = true;
        }
        this.scrollTopPrev = scrollTop;
        if (scrollTop > heightBeforeStick) {// if body scrollTop is greater than height before sticky header then add fix header class
            stickyItem.classList.add('fixedHeader');
            if (this.scrollUp) {
              this.scrollPadding.next(scrollPadding);
                stickyItem.classList.remove('fixedHeader');
            } else {
                stickyItem.classList.add('fixedHeader');
            }
        } else {
            stickyItem.classList.remove('fixedHeader');
        }
        this.scrollPadding.next(scrollPadding);
    }//onScrollStick ends

    public getMenu(event): void {
        if (this.isOpened == true) {
            this.isOpened = false;
        } else {
            this.isOpened = true;
        }
    }
    menuCheck(event) {
        var windowWidth = event.target.innerWidth;
        if (windowWidth > 640) {
            this.isSearchOpened = false;
        }
    }
    ngOnInit() {
        //wait 1 second to make sure the router scope changes before running the global settings getScopeNow and grab correct scope
        setTimeout(() => {
            this.scope = GlobalSettings.getScopeNow();
        }, 1000);

        // with router deprecated being able to navigate correctly on different layered router outlets
        var partnerHome = GlobalSettings.getHomeInfo().isPartner && !GlobalSettings.getHomeInfo().isSubdomainPartner;
        if (partnerHome) {
            // this.linkHome = [relPath+'Partner-home',{scope:'home',partner_id:GlobalSettings.getHomeInfo().partnerName}];
        } else {
            this.linkHome = ['/home'];
        }
        stButtons.locateElements();
        this._renderer.listenGlobal('document', 'click', (event) => {
            var element = document.elementFromPoint(event.clientX, event.clientY);
            if(element){
              let menuCheck = element.className.indexOf("menucheck");
              let searchCheck = element.className.indexOf("searchcheck");
              if (this.isOpened && menuCheck < 0) {
                this.isOpened = false;
              }
              if (this.isSearchOpened && searchCheck < 0) {
                this.isSearchOpened = false;
              }
            }
        });
        this.logoUrl = 'app/public/icon-t-d-l.svg';
        this.partnerLogoUrl = 'app/public/Football-DeepDive_Logo_Outlined-W.svg';

        //insert salad bar
        var v = document.createElement('script');
        v.src = 'http://w1.synapsys.us/widgets/deepdive/bar/bar.js?brandHex=234a66';
        document.getElementById('header-bottom').insertBefore(v, document.getElementById('salad-bar'));

        var setPlaceholder = setInterval(function() { // keep checking for the existance of the salad bar until it loads in
            if (document.getElementById('ddb-search-desktop')) {
                //override the salad bar default placeholder text, and use the one for TDL
                document.getElementById('ddb-search-desktop')['placeholder'] = "Search for a sports team…";
                document.getElementById('ddb-small-desktop-search-input')['placeholder'] = "Search for a sports team…";
                document.getElementById('ddb-search-mobile')['placeholder'] = "Search for a sports team…";
                //override the default salad bars hamburger icon and use the scoreboard icon when on TDL
                var scoreboardIcon = document.getElementById('ddb-dropdown-boxscores-button').getElementsByClassName('ddb-icon')[0];
                scoreboardIcon.classList.add('fa', 'fa-box-scores');
                scoreboardIcon.classList.remove('ddb-icon-bars', 'ddb-icon');

                //dont need to keep running this anymore now that its all set
                clearInterval(setPlaceholder);
            }
        }, 1000);

    }
}
