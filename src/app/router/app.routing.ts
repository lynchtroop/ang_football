import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent }  from '../app-component/app.component';
import { AppSiteMap }  from '../app-sitemap/app.sitemap';

//pages
import { DeepDivePage } from "../webpages/deep-dive-page/deep-dive.page";
import { PickTeamPage } from "../webpages/pickateam-page/pickateam.page";
import { LeaguePage } from "../webpages/league-page/league.page";
import { TeamPage } from "../webpages/team-page/team.page";
import { PlayerPage } from "../webpages/player-page/player.page";
import { SchedulesPage } from "../webpages/schedules-page/schedules.page";
import { StandingsPage } from "../webpages/standings-page/standings.page";
import { TeamRosterPage } from "../webpages/team-roster-page/team-roster.page";
import { TransactionsPage } from "../webpages/transactions-page/transactions.page";
import { SeasonStatsPage } from "../webpages/season-stats-page/season-stats.page";
import { DraftHistoryPage } from "../webpages/draft-history-page/draft-history.page";
import { ArticlePages } from "../webpages/article-pages/article-pages.page";
import { AboutUsPage } from "../webpages/about-us-page/about-us.page";
import { ContactUsPage } from "../webpages/contactus-page/contactus.page";
import { DisclaimerPage } from "../webpages/disclaimer-page/disclaimer.page";
import { MVPListPage } from "../webpages/mvp-list-page/mvp-list.page";
import { PlayerStatsPage } from "../webpages/player-stats-page/player-stats.page";
import { ListPage } from "../webpages/list-page/list.page";
import { ListOfListsPage } from "../webpages/list-of-lists-page/list-of-lists.page";
import { DirectoryPage } from "../webpages/directory-page/directory.page";
import { ErrorPage } from "../webpages/error-page/error-page.page";
import { PartnerErrorPage } from "../webpages/partner-error/error";

import { SearchPage } from "../webpages/search-page/search.page";
import { SiteMap } from "../siteMap/siteMap";
import { SiteTeamMap } from "../siteMap/siteTeamMap";
import { SitePlayerMap } from "../siteMap/sitePlayerMap";
import { SiteAiArticleMap } from "../siteMap/siteAiArticleMap";
import { SiteArticleMap } from "../siteMap/siteArticleMap";
import { SiteVideoArticleMap } from "../siteMap/siteVideoArticleMap";
import { SiteListMap } from "../siteMap/siteListMap";


export const siteMapRoutes = [
  {
    path: '',
    component: SiteMap
  },
  {
    path: ':scope/team/:teamId',
    component: SiteTeamMap
  },
  {
    path: ':scope/player/:playerId',
    component: SitePlayerMap
  },
  {
    path: ':scope/aiarticles',
    component: SiteAiArticleMap
  },
  {
    path: ':scope/articles/:pageNumber',
    component: SiteArticleMap
  },
  {
    path: ':scope/list/:profile',
    component: SiteListMap
  },
  {
    path: ':scope/videoarticles/:pageNumber',
    component: SiteVideoArticleMap
  },
];

const relativeChildRoutes = [
  {
    path: 'sitemap',
    component: AppSiteMap,
    children: siteMapRoutes
  },
  {
    path: ':scope/contact-us',
    component: ContactUsPage,
  },
  {
    path: ':scope/disclaimer',
    component: DisclaimerPage,
  },
  {
    path: ':scope/about-us',
    component: AboutUsPage,
  },
  {
    path: ':scope/pick-a-team',
    component: PickTeamPage,
  },
  {
    path: ':scope/team/:teamName/:teamID',
    component: TeamPage,
  },
  {
    path: ':scope/player/:teamName/:fullName/:playerID',
    component: PlayerPage,
  },
  // // //Misc. Pages
  {
    path: ':scope/directory/:type/:startsWith/page/:page',
    component: DirectoryPage,
  },
  {
    path: ':scope/search/:query',
    component: SearchPage,
  },
  //
  // // //Module Pages
  {
    path: ':scope/mvp-list/:type/:pageNum',
    component: MVPListPage
  },
  {
    path: ':scope/mvp-list/:type/:tab/:pageNum',
    component: MVPListPage
  },
  {
    path: ':scope/schedules/league/:year/:pageNum',
    component: SchedulesPage
  },
  {
    path: ':scope/schedules/league/:year/:tab/:pageNum',
    component: SchedulesPage
  },
  {
    path: ':scope/schedules/:teamName/:teamID/:year/:pageNum',
    component: SchedulesPage
  },
  {
    path: ':scope/schedules/:teamName/:teamID/:year/:tab/:pageNum',
    component: SchedulesPage
  },
  {
    path: ':scope/standings',
    component: StandingsPage
  },
  {
    path: ':scope/standings/:type',
    component: StandingsPage
  },
  {
    path: ':scope/standings/:type/:teamName/:teamID',
    component: StandingsPage
  },
  {
    path: ':scope/team-roster/:teamName/:teamID',
    component: TeamRosterPage
  },
  {
    path: ':scope/team-roster/:teamName/:teamID/:tab',
    component: TeamRosterPage
  },
  {
    path: ':scope/list/:query',
    component: ListPage
  },
  {
    path: ':scope/list/:target/:statName/:season/:ordering',
    component: ListPage
  },
  {
    path: ':scope/list/:target/:statName/:season/:ordering/:perPageCount/:pageNumber',
    component: ListPage
  },
  {
    path: ':scope/draft-history/:tab/league/:filter1',
    component: DraftHistoryPage
  },
  {
    path: ':scope/draft-history/:tab/:teamName/:teamId/:filter1',
    component: DraftHistoryPage
  },
  {
    path: ':scope/transactions/:filter1/:teamName/:teamId/:limit',
    component: TransactionsPage
  },
  {
    path: ':scope/suspensions/:filter1/:teamName/:teamId/:limit',
    component: TransactionsPage
  },
  {
    path: ':scope/injuries/:filter1/:teamName/:teamId/:limit',
    component: TransactionsPage
  },
  {
    path: ':scope/transactions/:filter1/league/:limit',
    component: TransactionsPage
  },
  {
    path: ':scope/suspensions/:filter1/league/:limit',
    component: TransactionsPage
  },
  {
    path: ':scope/injuries/:filter1/league/:limit',
    component: TransactionsPage
  },
  {
    path: ':scope/season-stats/:tab/:fullName/:playerID',
    component: SeasonStatsPage
  },
  {
    path: ':scope/player-stats/:teamName/:teamID',
    component: PlayerStatsPage
  },
  {
    path: ':scope/articles/:eventType/:eventID',
    component: ArticlePages
  },
  {
    path: ':scope/list-of-lists/:target/:targetId/:perPageCount/:pageNumber',
    component: ListOfListsPage
  },
  {
    path: ':scope/list-of-lists/:target/:targetId',
    component: ListOfListsPage
  },
  // // //Error pages and error handling
  {
    path: '/error',
    component: ErrorPage
  },
  {
    path: '/not-found',
    component: ErrorPage,
  },
  {
    path: ':scope/league',
    component: LeaguePage,
  },
  {
    path: ':scope',
    component: DeepDivePage,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '/**',
    redirectTo: 'home'
  }
];

export const appRoutes: Routes = [
  {
    path: 'error-page',
    component: PartnerErrorPage
  },
  {
    path: '',
    component: AppComponent,
    children: relativeChildRoutes
  },
  {
    path: ':partnerID',
    component: AppComponent,
    children: relativeChildRoutes
  },
];

export const routing = RouterModule.forChild(appRoutes);
