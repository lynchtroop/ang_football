//learn about robots.txt here
//http://www.robotstxt.org/robotstxt.html

/**
 *Optimal Length for Search Engines
 *Roughly 155 Characters
 ***/

import { Injectable, Inject } from '@angular/core';
import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter';
import { DOCUMENT } from '@angular/platform-browser';
import { isNode } from "angular2-universal";

import { GlobalSettings } from "./global/global-settings";

declare var Zone: any;

@Injectable()
export class SeoService {
    private dom:any;
    private document:any;
    private headElement:HTMLElement;
    private pageUrl: string;

    private metaDescription:HTMLElement;

    private canonicalLink:HTMLElement;

    private themeColor:HTMLElement;

    private ogTitle:HTMLElement;
    private ogType:HTMLElement;
    private ogUrl:HTMLElement;
    private ogImage:HTMLElement;
    private ogDesc:HTMLElement;

    private startDate:HTMLElement;
    private endDate:HTMLElement;
    private isArticle:HTMLElement;

    //Elastic Search meta tags
    private es_search_type:HTMLElement;
    private es_source:HTMLElement;
    private es_article_id:HTMLElement;
    private es_article_title:HTMLElement;
    private es_keyword:HTMLElement;
    private es_published_date:HTMLElement;
    private es_author:HTMLElement;
    private es_publisher:HTMLElement;
    private es_image_url:HTMLElement;
    private es_article_teaser:HTMLElement;
    private es_article_url:HTMLElement;
    private es_article_type:HTMLElement;
    private es_search_string:HTMLElement;

    robots:HTMLElement;
    private DOM:any;

    /**
     * Inject the Angular 2 Title Service
     * @param titleService
     */
    constructor(
      @Inject(DOCUMENT) document: any
    ) {
        this.DOM = getDOM();
        this.document = document;
        this.headElement = this.document.head;
        // /**
        //  * get the <head> Element
        //  * @type {any}
        //  */
        this.metaDescription = this.getOrCreateElement('name', 'description', 'meta');
        // this.themeColor = this.getOrCreateElement('name', 'theme-color', 'meta');
        this.canonicalLink = this.getOrCreateElement('rel', 'canonical', 'link');
        this.robots = this.getOrCreateElement('name', 'robots', 'meta');
        this.ogTitle = this.getOrCreateElement('property', 'og:title', 'meta');
        this.ogDesc = this.getOrCreateElement('property', 'og:description', 'meta');
        this.ogType = this.getOrCreateElement('property', 'og:type', 'meta');
        this.ogUrl = this.getOrCreateElement('property', 'og:url', 'meta');
        this.ogImage = this.getOrCreateElement('property', 'og:image', 'meta');

        this.startDate = this.getOrCreateElement('name', 'start_date', 'meta');
        this.endDate = this.getOrCreateElement('name', 'end_date', 'meta');
        this.isArticle = this.getOrCreateElement('name', 'is_article', 'meta');
        this.es_search_type = this.getOrCreateElement('name', 'search_type', 'meta');
        this.es_source = this.getOrCreateElement('name', 'source', 'meta');
        this.es_article_id = this.getOrCreateElement('name', 'article_id', 'meta');
        this.es_article_title = this.getOrCreateElement('name', 'article_title', 'meta');
        this.es_keyword = this.getOrCreateElement('name', 'keyword', 'meta');
        this.es_published_date = this.getOrCreateElement('name', 'published_date', 'meta');
        this.es_author = this.getOrCreateElement('name', 'author', 'meta');
        this.es_publisher = this.getOrCreateElement('name', 'publisher', 'meta');
        this.es_image_url = this.getOrCreateElement('name', 'image_url', 'meta');
        this.es_article_teaser = this.getOrCreateElement('name', 'article_teaser', 'meta');
        this.es_article_url = this.getOrCreateElement('name', 'article_url', 'meta');
        this.es_article_type = this.getOrCreateElement('name', 'article_type', 'meta');
        this.es_search_string = this.getOrCreateElement('name', 'search_string', 'meta');
    }

    public getPageUrl() {
      this.pageUrl = "";
      if(isNode) {
        this.pageUrl = Zone.current.get('originUrl') + Zone.current.get('requestUrl');
      }else{
        this.pageUrl = window.location.href;
      }

      return this.pageUrl;
    } //getPageUrl



    //sets title to atleast less than 50 characters and will choose the  first 3 words and append site name at end
    public setTitle(newTitle: string) {
      let splitTitle = newTitle.split(' ');
      let shortTitle;
      if(splitTitle.length > 3){
        splitTitle = splitTitle.splice(0,3);
        shortTitle = splitTitle.join(' ') + '...';
      }else{
        shortTitle = splitTitle.join(' ');
      }
      this.document.title = shortTitle;
    }

    // //incase we dont want the base title to be in head title tag
    // public setTitleNoBase(title:string) {
    //     this.titleService.setTitle(title);
    // }}

    public setMetaDescription(description:string) {
      let truncatedDescription = description;
      if (truncatedDescription.length > 167) {
          truncatedDescription = truncatedDescription.substring(0, 167);
          truncatedDescription += '...';
      }
      this.setElementAttribute(this.metaDescription, 'content', truncatedDescription);
    }

    public setCanonicalLink() {
      let canonicalUrl = this.getPageUrl();
      this.setElementAttribute(this.canonicalLink, 'href', canonicalUrl);
    }

    //Valid values for the "CONTENT" attribute are: "INDEX", "NOINDEX", "FOLLOW", "NOFOLLOW"
    //http://www.robotstxt.org/meta.html
    public setMetaRobots(robots:string) {
      this.setElementAttribute(this.robots, 'content', robots);
    }

    public setThemeColor(color:string) {
      this.setElementAttribute(this.themeColor, 'content', color);
    }

    public setOgTitle(newTitle:string) {
      this.setElementAttribute(this.ogTitle, 'content', newTitle);
    }

    public setOgDesc(description:string) {
      this.setElementAttribute(this.ogDesc, 'content', description);
    }

    public setOgType(newType:string) {
      this.setElementAttribute(this.ogType, 'content', newType);
    }

    public setOgUrl() {
      let ogUrl = this.getPageUrl();
      this.setElementAttribute(this.ogUrl, 'content', ogUrl)
    }

    public setOgImage(imageUrl:string) {
      this.setElementAttribute(this.ogImage, 'content', imageUrl);
    }

    public setApplicationJSON(json, id) {
      let el:HTMLElement;
      el = this.DOM.createElement('script');
      this.setElementAttribute(el, 'type', 'application/ld+json');
      this.setElementAttribute(el, 'id', id);
      this.DOM.setText(el, json);
      this.DOM.insertBefore(this.document.head.lastChild, el);
    }

    public removeApplicationJSON(id) {
        let el:HTMLElement;
        el = document.getElementById(id);
        if (el != null) {
            el.remove();
        }
    }

    public setKeyword(keyword:string) {
      this.setElementAttribute(this.es_keyword, 'content', keyword);
    }

    public setStartDate(startDate:string) {
      this.setElementAttribute(this.startDate, 'content', startDate);
    }

    public setEndDate(endDate:string) {
      this.setElementAttribute(this.endDate, 'content', endDate);
    }

    public setIsArticle(isArticle:string) {
      this.setElementAttribute(this.isArticle, 'content', isArticle);
    }

    public setSearchType(searchType:string) {
      this.setElementAttribute(this.es_search_type, 'content', searchType);
    }

    public setArticleId(articleId:string) {
      this.setElementAttribute(this.es_article_id, 'content', articleId);
    }

    public setArticleTitle(articleTitle:string) {
      this.setElementAttribute(this.es_article_title, 'content', articleTitle);
    }

    public setAuthor(author:string) {
      this.setElementAttribute(this.es_author, 'content', author);
    }

    public setPublisher(publisher:string) {
      this.setElementAttribute(this.es_publisher, 'content', publisher);
    }

    public setArticleUrl() {
      let articleUrl = this.getPageUrl();
      this.setElementAttribute(this.es_article_url, 'content', articleUrl);
    }

    public setSearchString(searchString:string) {
      this.setElementAttribute(this.es_search_string, 'content', searchString);
    }

    public setSource(source:string) {
      this.setElementAttribute(this.es_source, 'content', source);
    }

    public setPublishedDate(publishedDate:string) {
      this.setElementAttribute(this.es_published_date, 'content', publishedDate);
    }

    public setImageUrl(imageUrl:string) {
      this.setElementAttribute(this.es_image_url, 'content', imageUrl);
    }

    public setArticleTeaser(articleTeaser:string) {
      this.setElementAttribute(this.es_article_teaser, 'content', articleTeaser);
    }

    public setArticleType(articleType:string) {
      this.setElementAttribute(this.es_article_type, 'content', articleType);
    }

    private getOrCreateElement(name: string, attr: string, type: string): HTMLElement {
      let el: HTMLElement;
      el = this.DOM.createElement(type);
      this.setElementAttribute(el, name, attr);
      this.DOM.insertBefore(this.document.head.lastChild, el);

      return el;
    }

    private setElementAttribute(el: HTMLElement, name: string, attr: string) {
      return this.DOM.setAttribute(el, name, attr);
    }
}
