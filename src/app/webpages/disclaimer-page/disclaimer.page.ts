import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Injector } from '@angular/core';

import { TitleInputData } from "../../fe-core/components/title/title.component";
import { GlobalSettings } from '../../global/global-settings';
import { GlobalFunctions } from '../../global/global-functions';
import { SeoService } from "../../seo.service";
import { VerticalGlobalFunctions } from "../../global/vertical-global-functions";

@Component({
    selector: 'Disclaimer-page',
    templateUrl: './disclaimer.page.html'
})

export class DisclaimerPage {
    public scope: string;
    public storedPartnerParam: string;

    public widgetPlace: string = "widgetForPage";
    public pageName: string;
    public pageLinkName: string;
    public contactLink: Array<any>;
    public contactUsLinkName: string;
    public titleData: TitleInputData;
    public partnerLink: string;

    constructor(
      private _seoService: SeoService,
      private _router: Router,
      public _activatedRoute: ActivatedRoute
    ) {
      this._activatedRoute.params.subscribe(
        (param :any)=> {
          this.scope = param['scope'] != null ? param['scope'].toLowerCase() : 'nfl';
        }
      );
      this.storedPartnerParam = GlobalSettings.storedPartnerId();
      this.loadData(this.storedPartnerParam);
      this.metaTags();
    }

    ngAfterViewInit(){}



    private metaTags() {
      //This call will remove all meta tags from the head.
      this._seoService.removeMetaTags();
      //create meta description that is below 160 characters otherwise will be truncated
      let title = 'Disclaimer';
      let metaDesc = 'Disclaimer page to disclose any information';
      let image = GlobalSettings.getmainLogoUrl();

      let keywords = "football";
      let link = this._seoService.getPageUrl();
      this._seoService.setTitle(title);
      this._seoService.setMetaDescription(metaDesc);
      this._seoService.setCanonicalLink();
      this._seoService.setMetaRobots('NOINDEX, FOLLOW');

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
          'es_page_type': 'Disclaimer page',
        },
        {
          'es_keywords': 'football, Touchdown loyal, Disclaimer'
        },
        {
          'es_image_url':image
        }
      ])
    } //metaTags



    loadData(partnerID:string) {
      this.pageLinkName = GlobalSettings.getHomePage(partnerID).replace(/https?:\/\//, "");
      this.pageName = partnerID != null ? GlobalSettings.getBasePartnerTitle() : GlobalSettings.getBaseTitle();
      this.titleData = {
          imageURL : GlobalSettings.getSiteLogoUrl(),
          text1: 'Last Updated: Friday, Oct. 28 2016.',
          text2 : ' United States',
          text3 : GlobalFunctions.convertToPossessive(this.pageName) + " Disclaimer",
          text4 : '',
          icon: 'fa fa-map-marker'
      };
      this.partnerLink = partnerID != null ? VerticalGlobalFunctions.getWhiteLabel() : "/" + VerticalGlobalFunctions.getWhiteLabel();
      this.contactLink = [this.partnerLink, this.scope, 'contact-us'];
      this.contactUsLinkName = this.pageLinkName + '/' + this.scope + '/contact-us';
      GlobalSettings.setPreboot();
    }
}
