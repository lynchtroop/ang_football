import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppComponent }  from '../app-component/app.component';

import { DeepDiveNgModule } from "../ngModules/deep-dive.ngmodule";
import { DeepDivePage } from "../webpages/deep-dive-page/deep-dive.page";
import { LeaguePage } from "../webpages/league-page/league.page";
import { ArticlePages } from "../webpages/article-pages/article-pages.page";
// import {AboutUsPage} from "./webpages/aboutus/aboutus";
// import {PrivacyPolicy} from "./webpages/privacy-policy/privacy-policy";
// import {TermOfService} from "./webpages/term-of-service/term-of-service";
// import {SyndicatedArticlePage} from "./webpages/syndicated-article-page/syndicated-article-page";
// import {SearchPage} from "./webpages/search-page/search-page";

const relativeChildRoutes = [
   /* {
        path:'search/:userInput',
        component: SearchPage
    },*/
    // {
    //     path: 'about-us',
    //     component: AboutUsPage
    // },
    // {
    //     path: 'privacy-policy',
    //     component: PrivacyPolicy
    // },
    // {
    //     path: 'term-of-service',
    //     component: TermOfService
    // },
    // {
    //     path: 'search/articles/:userInput',
    //     component: SearchPage
    // },
    // {
    //     path: ':category/:subCategory/article/:articleType/:articleID',
    // //redirectTo: 'news/:articleType/:articleID',
    //     component: SyndicatedArticlePage,
    // },
    // {
    //     path: ':category/article/:articleType/:articleID',
    //     //redirectTo: 'news/:articleType/:articleID',
    //     component: SyndicatedArticlePage,
    // },
    // {
    //     //added article category with subarticles
    //     path: ':category/:subCategory',
    //     component: DeepDivePage,
    // },
    // {
    //     //category is top level deep dive page that are groupings of other deep dive pages (ex: sports)
    //     path: ':category',
    //     component: DeepDivePage,
    // },
    {
      path: '/articles/:eventType/:eventID',
      component: ArticlePages
    },
    {
      path: 'league',
      component: LeaguePage
    },
    {
        path: '',
        component: DeepDivePage,
    },

  ];

const appRoutes: Routes = [
    {
        path: '',
        component: AppComponent,
        children: relativeChildRoutes
    },
    {
      path: ':scope',
      component: AppComponent,
      children: relativeChildRoutes
    },
    {
        path: '',
        redirectTo:'deep-dive',
        pathMatch:'full'
    },

];

export const routing = RouterModule.forRoot(appRoutes);
