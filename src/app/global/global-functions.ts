import {Injectable} from '@angular/core';
import {Link} from './global-interface';
import { isBrowser, isNode, prebootComplete } from 'angular2-universal';

declare var jQuery: any; //used for scroll event
declare var moment: any;

@Injectable()

export class GlobalFunctions {
   private static prebootFired:boolean = false;
   private static documentHeight:number = 0;
    /*convert from inches to ft-in format*/
    static inchesToFeet(inch):string {
        if (inch === undefined || inch === null) {
            return inch;
        }
        inch = Number(inch);
        var feet = Math.floor(inch / 12);
        inch %= 12;
        return feet + "-" + inch;
    }

    /**
     * Returns the approriate ordinal suffix for the given number
     *
     * @example
     * Suffix(1) => "st"
     *
     * @example
     * Suffix(10) => "th"
     *
     * @example
     * Suffix(23) => "rd"
     *
     * @param {number}
     * @returns: string
     */
    static Suffix(i:number):string {
        var a = i % 10,
            b = i % 100;
        if (a == 1 && b != 11) {
            return "st";
        }
        if (a == 2 && b != 12) {
            return "nd";
        }
        if (a == 3 && b != 13) {
            return "rd";
        }
        if (i == 0) {
            return '';
        }
        return "th";
    };

    /**
     * - Converts the string to title case by capitalizing the first letter of
     * each word and lowercasing the rest of the word, where words are separated by whitespace characters.
     * - If the str is undefined or null, then it is returned without performing the conversion
     *
     * @param {string} str - The string value to convert to title case
     * @returns {string}
     */
    toTitleCase(str:string):string {
        if (str === undefined || str === null) {
            return str;
        }
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    static toTitleCase(str:string):string { // the above can be removed once conversion is swapped to static
        if (str === undefined || str === null) {
            return str;
        }
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    /**
     * - Transforms a USA phone number (7 or 10 character string) to a human readable format.
     * - If the string is not 7 or 10 characters long, it returns the string unchanged.
     * - If the val is undefined or null, then "N\A" is returned.
     *
     * @example
     * // "(123) 123-1234" (10 digits)
     * formatPhoneNumber("1231231234");
     *
     * @example
     * // "123-4567" (7 digits)
     * formatPhoneNumber("1234567");
     *
     * @example
     * // "1234" (4 digits);
     * formatPhoneNumber("1234");
     *
     * @example
     * // "12345678911"
     * formatPhoneNumber("12345678911");
     *
     * @param {string} val - The string or number to convert to a phone number
     */
    formatPhoneNumber(val:any):string {
        if (val === undefined || val === null) {
            return "N\A";
        }

        if (isNaN(val) === false) {
            val = val.toString();
        }

        var numberLength = val.length;
        if (numberLength === 10) {
            //Number with area code
            val = '(' + val.slice(0, 3) + ') ' + val.slice(3, 6) + '-' + val.slice(6, 10);
        } else if (numberLength === 7) {
            //Number without area code
            val = val.slice(0, 3) + '-' + val.slice(3, 7);
        }

        return val;
    }



    /**
     * - Returns a comma-delimited string for the given value.
     * - If the value is undefined or null, then the def string is returned instead.
     *
     * @example
     * // returns "456"
     * commaSeparateNumber(456)
     *
     * @example
     * // returns "4,566"
     * commaSeparateNumber(4566)
     *
     * @example
     * // returns "124,566"
     * commaSeparateNumber(124566)
     *
     * @example
     * // returns "2,124,566"
     * commaSeparateNumber(2124566)
     *
     * @example
     * // returns ""
     * commaSeparateNumber(undefined)
     *
     * @example
     * // returns "N/A"
     * commaSeparateNumber(undefined, "N/A")
     *
     * @param {number} value - The value to convert to a comma-delimited number
     * @param {string} def - (Optional) The default string value to use if the value is undefined. If it's not included, then "" is used as the def string.
     * @returns {string}
     */
    static commaSeparateNumber(value:number, def?:string) {
        if (value === null || value === undefined) {
            return def || "";
        }

        var parts = value.toString().split("."); //split on decimal point
        while (/(\d+)(\d{3})/.test(parts[0])) {
            parts[0] = parts[0].replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
        return parts.join(".");
    }


    /**
     * - Returns a comma-delimited currency string for the given value.
     * - If the value is 0, undefined, or null, then the def string is returned instead.
     *
     * @param {number} price - The value to convert to a currency string
     * @param {string} def - (Optional) The default string value to use if the number is 0 or undefined. If it's not included, then "N/A" is used as the def string.
     * @returns {string}
     */
    formatPriceNumber(value:number, def?:string):string {
        if (def === null || def === undefined) {
            def = "N\A";
        }

        if (value === null || value === undefined || value === 0) {
            return def;
        }
        else {
            //TODO: support multiple currencies?
            return "$" + GlobalFunctions.commaSeparateNumber(value);
        }
    }

    static roundToDecimal(num) {
        return Math.round(num * 100) / 100;
    } //static roundToDecimal


    /**
     * - Returns the full state name corresponding to the given postal code.
     * Only US states, DC, Puerto Rico, and Ontario (?) are supported.
     *
     * - If state is undefined or null. or if the state could not be found in the lookup
     * table, then state is returned unchanged.
     *
     * @param {string} state - The postal state code to convert to the full state name. Case does not matter.
     * @returns {string}
     */
    static fullstate(state:string):string {
        if (state === undefined || state === null) {
            return state;
        }
        var stateName = {
            AL: 'Alabama',
            AK: 'Alaska',
            AZ: 'Arizona',
            AR: 'Arkansas',
            CA: 'California',
            CO: 'Colorado',
            CT: 'Connecticut',
            DC: 'District of Columbia',
            DE: 'Delaware',
            FL: 'Florida',
            GA: 'Georgia',
            HI: 'Hawaii',
            ID: 'Idaho',
            IL: 'Illinois',
            IN: 'Indiana',
            IA: 'Iowa',
            KS: 'Kansas',
            KY: 'Kentucky',
            LA: 'Lousiana',
            ME: 'Maine',
            MD: 'Maryland',
            MA: 'Massachusetts',
            MI: 'Michigan',
            MN: 'Minnesota',
            MS: 'Mississippi',
            MO: 'Missouri',
            MT: 'Montana',
            NE: 'Nebraska',
            NV: 'Nevada',
            NH: 'New Hampshire',
            NJ: 'New Jersey',
            NM: 'New Mexico',
            NY: 'New York',
            NC: 'North Carolina',
            ND: 'North Dakota',
            OH: 'Ohio',
            OK: 'Oklahoma',
            ON: 'Ontario',
            OR: 'Oregon',
            PA: 'Pennsylvania',
            PR: 'Puerto Rico',
            RI: 'Rhode Island',
            SC: 'South Carolina',
            SD: 'South Dakota',
            TN: 'Tennessee',
            TX: 'Texas',
            UT: 'Utah',
            VT: 'Vermont',
            VA: 'Virginia',
            WA: 'Washington',
            WV: 'West Virginia',
            WI: 'Wisconsin',
            WY: 'Wyoming'
        };

        let upperState = state.toUpperCase();
        let displayState = stateName[upperState];
        return displayState !== undefined ? displayState : state;
    };


    /**
     * - Returns the full state name corresponding to the given postal code. Only US
     * states and DC are supported.
     * - If state is undefined or null. or if the state could not be found in the lookup
     * table, then state is returned unchanged.
     *
     * @param {string} state - The postal state code to convert to the AP Abbreviation. Case does not matter.
     * @returns {string}
     */

    static stateToAP(state:string):string {
        if (state === undefined || state === null) {
            return state;
        }

        var stateAP = {
            AL: 'Ala.',
            AK: 'Alaska',
            AZ: 'Ariz.',
            AR: 'Ark.',
            CA: 'Calif.',
            CO: 'Colo.',
            CT: 'Conn.',
            DE: 'Del.',
            DC: 'D.C.',
            FL: 'Fla.',
            GA: 'Ga.',
            HI: 'Hawaii',
            ID: 'Idaho',
            IL: 'Ill.',
            IN: 'Ind.',
            IA: 'Iowa',
            KS: 'Kan.',
            KY: 'Ky.',
            LA: 'La.',
            ME: 'Maine',
            MD: 'Md.',
            MA: 'Mass.',
            MI: 'Mich.',
            MN: 'Minn.',
            MS: 'Miss.',
            MO: 'Mo.',
            MT: 'Mont.',
            NE: 'Neb.',
            NV: 'Nev.',
            NH: 'N.H.',
            NJ: 'N.J.',
            NM: 'N.M.',
            NY: 'N.Y.',
            NC: 'N.C.',
            ND: 'N.D.',
            OH: 'Ohio',
            OK: 'Okla.',
            OR: 'Ore.',
            PA: 'Pa.',
            RI: 'R.I.',
            SC: 'S.C.',
            SD: 'S.D.',
            TN: 'Tenn.',
            TX: 'Texas',
            UT: 'Utah',
            VT: 'Vt.',
            VA: 'Va.',
            WA: 'Wash.',
            WV: 'W.Va.',
            WI: 'Wis.',
            WY: 'Wyo.'
        };

        let upperState = state.toUpperCase();
        let displayState = stateAP[upperState];
        return displayState !== undefined ? displayState : state;
    };

    /**
     * - Capital the first letter of a string
     **/
    capitalizeFirstLetter(str:string):string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * - Transforms camel case to regular case (Words split up and capitalized)
     * - If the str is undefined or null, then it is returned without performing the conversion
     *
     * @param {string} str - The str value to convert to regular case
     * @returns {string}
     */
    camelCaseToRegularCase(str:string):string {
        if (str === undefined || str === null) {
            return str;
        }
        return str
            .replace(/([A-Z][a-z]+)/g, " $1")
            .replace(/([A-Z][A-Z]+)/g, " $1")
            .replace(/([^A-Za-z ]+)/g, " $1")
            // uppercase the first character
            .replace(/^./, function (txt) {
                return txt.toUpperCase();
            })
    };

    /**
     * - Transforms kabab cased strings to camel case.
     * - If the str is undefined or null, then it is returned without performing the conversion.
     *
     * @param {string} str - The str value to convert to camel case
     * @returns {string}
     */
    kababCaseToCamelCase(str:string):string {
        if (str === undefined || str === null) {
            return str;
        }
        str = str.replace(/-/g, ' ');
        str = this.toTitleCase(str);
        str = str.replace(/ /g, '');
        str = str[0].toLowerCase() + str.slice(1);
        return str;
    };

    /**
     * - Transforms camel-cased strings to lower-case kabab case.
     * - Used mainly for SEO friendly URL values.
     * - If the str is undefined or null, then it is returned without performing the conversion.
     *
     * @param {string} str - The str value to convert to kabab case
     * @returns {string}
     */
    camelCaseToKababCase(str:string):string {
        if (str === undefined || str === null) {
            return str;
        }
        str = str
            .replace(/([A-Z][a-z]+)/g, " $1")
            .replace(/([A-Z][A-Z]+)/g, " $1")
            .replace(/([^A-Za-z ]+)/g, " $1")
            .replace(/ /g, '-');
        //Lowercase entire string
        str = str.toLowerCase();
        return str;
    };

    /**
     * - Transforms strings to lower-case kabab case with hyphens and strips commas, periods, and single quotes.
     * - Used mainly for SEO friendly URL values.
     * - If the str is undefined or null, then it is returned without performing the conversion.
     *
     * @param {string} str - The str value to convert to kabab case
     * @returns {string}
     */
    static toLowerKebab(str:string):string {
        str = str.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[\.,']/g, '');
        return str;
    }

    /**
     * - Formats the date as 'dddd, MMMM D, YYYY'
     * - Appends the timestamp as 'hh:mm A' if {includeTimestamp} is true.
     *
     * @param {any} jsDate - the date to format; can be a string or a JavaScript Date
     * @param {boolean} includeTimestamp - (Optional) set to true to include a timestamp at the end
     * @param {string} timezone - (Optional) the timezone string to append if {includeTimestamp} is true
     * @returns {string} - formatted string
     */
    static formatUpdatedDate(jsDate:any, includeTimestamp?:boolean, timezone?:string):string {
        if ( !jsDate ) return;

        var date = GlobalFunctions.sntGlobalDateFormatting(jsDate,'dayOfWeek');
        if (includeTimestamp) {
            var date2 = GlobalFunctions.sntGlobalDateFormatting(jsDate,'timeZone');
            return date2;
        }
        return date;
    }

    /**
     * - Formats the date as 'dddd, MMMM D, YYYY'
     * - Appends the timestamp as 'hh:mm A' if {includeTimestamp} is true.
     *
     * @param {any} jsDate - the date to format; can be a string or a JavaScript Date
     * @param {string} beforeMonthFormat - the date format to use before the AP month
     * @param {string} afterMonthFormat - the date format to use after the AP month
     * @returns {string} - formatted string
     */
    static formatDateWithAPMonth(jsDate:any, beforeMonthFormat:string, afterMonthFormat:string):string {
        var date = moment(jsDate);
        var str = (beforeMonthFormat ? date.format(beforeMonthFormat) : "") +
            GlobalFunctions.formatAPMonth(date.month()) + " " +
            (afterMonthFormat ? date.format(afterMonthFormat) : "");
        return str;
    }


    /*
    Checks to see if the input is unix or not. Assumes that a series of number is unix.
    */

    static isXUnix(value:any) {
      if(typeof value == 'string') { // if string return false;
        if(value.match(/^[0-9]+$/) == null) {
          return false;
        } else
        if(value.match(/^[0-9]+$/) != null) { // string number return true
          return true;
        }
      } else
      if(typeof value == 'number') { // assumes that if it is a number, it is unix
        return true;
      }
      else {
        return false;
      }
    }




    static convertToUnix(value:any){
      if(GlobalFunctions.isXUnix(value) == false){
        if(moment(value,'YYYY-MM-DD',true).isValid()){
          value = moment(value,"YYYY-MM-DD").tz("America/New_York").unix() * 1000;
          return value;
        } else
        if(moment(value.toString(),'h:mm:ss',true).isValid()) {
          value = moment(value).tz("America/New_York").unix() * 1000;
          return value;
        } else
        if(moment(value.toString(),'dddd, MMM. DD, YYYY',true).isValid()) {
          value = moment(value).tz("America/New_York").unix() * 1000;
          return value;
        } else
          if(moment(value.toString(),'hh:mm:ss',true).isValid()) {
            value = moment(value).tz("America/New_York").unix() * 1000;
        } else
          if(moment(value,'YYYY-MM-DD h:mm:ss',true).isValid()) {
            value = moment(value).tz("America/New_York").unix() * 1000;
            return value;
          }
      }
      else if(GlobalFunctions.isXUnix(value) == true) {
        if(value.length <= 11) {
          value = Number(value) * 1000;
          return value;
        } else {
          value = Number(value);
          return value;
        }
      }
      return value; // if original input is Unix to begin with
    }


    /*
    - Formats any stringed date into approrpriate styled date.
    - Formats Unix into approrpriate styled date.
    - Select the format of date you want with the identifiers:
      - defaultDate
      - shortDate
      - dayOfWeek
      - timeZone
    */

    static sntGlobalDateFormatting(unixTimestamp:any, identifier?:string, customDate?:string) {
      unixTimestamp = GlobalFunctions.convertToUnix(unixTimestamp);
      let newDate;
      let monthnum = Number(moment(unixTimestamp).tz('America/New_York').format("MM")) - 1;
      let month = GlobalFunctions.formatAPMonth(Number(monthnum));
      let longmonth = moment(unixTimestamp).tz('America/New_York').format('MMMM');
      let day = moment(unixTimestamp).tz('America/New_York').format('dddd');
      let dd = moment(unixTimestamp).tz('America/New_York').format("DD");
      let year = moment(unixTimestamp).tz('America/New_York').format("YYYY");
      let shortDate = moment(unixTimestamp).tz('America/New_York').format("MM/DD/YY");
      let timeZone = moment(unixTimestamp).tz('America/New_York').format('h:mmA z');
      let defaultDate = month + ' ' + dd + ', ' + year;

      switch(identifier){
        case 'defaultDate': newDate = defaultDate; // Oct. O6, 2016
          return newDate;
        case 'shortDate': newDate = moment(unixTimestamp).tz('America/New_York').format("MM/DD/YY"); // mm/dd/yy
          return newDate;
        case 'dayOfWeek': newDate = day + ', ' + defaultDate; // Tuesday, Jan. 14, 2016
          return newDate;
        case 'timeZone': newDate = day + ', ' + defaultDate + ' ' + timeZone; // Tuesday, Jan. 14, 2016 12:00 (EST)
          return newDate;
        case 'bulletedShortDateTime': newDate = day + ', ' + month + ' ' + dd + ' &bull; ' + moment(unixTimestamp).tz('America/New_York').format('h:mmA z'); // Tuesday, Jan. 14, 2016 12:00 (EST)
            return newDate;
        case 'custom': break;
        default:
          return defaultDate;
      }
    }


    /**
     * Parses the date string with moment and returns it as a long-date formatted string
     * @param {string} dateStr
     * @returns MMMM d, YYYY
     */
    static formatLongDate(dateStr:string) {
        if (!dateStr) {
            return "N/A";
        }
        var dateUnix = GlobalFunctions.convertToUnix(dateStr);
        var date = moment(dateUnix).format('d, YYYY')
        var month = GlobalFunctions.formatAPMonth(moment(dateUnix).format('MM'));
        if (!date) {
            return "N/A";
        }
        return month + ' ' + date;
    }

    /**
     * Returns the English name of the month formatted in AP style
     *
     * @param {number} month - The month to format (0-based)
     * @returns
     */

    // formatAPMonth uses zero based index for month, Moment.js uses 1 based index
    // when sending month numbers use JS, not Moment.js
    static formatAPMonth(month:number) {
        switch (month) {
            case 0:
                return "Jan.";
            case 1:
                return "Feb.";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "Aug.";
            case 8:
                return "Sept.";
            case 9:
                return "Oct.";
            case 10:
                return "Nov.";
            case 11:
                return "Dec.";
            default:
                return "";
        }
    }

    /**
     * Formats the given string as English words if it's between
     * 0 and 9. Otherwise the given string is returned unchanged.
     *
     * @param {number} num - The number to format
     * @returns
     */
    static formatNumber(num:number) {
        switch (num) {
            case 0:
                return "zero";
            case 1:
                return "one";
            case 2:
                return "two";
            case 3:
                return "three";
            case 4:
                return "four";
            case 5:
                return "five";
            case 6:
                return "six";
            case 7:
                return "seven";
            case 8:
                return "eight";
            case 9:
                return "nine";
            default:
                return num.toString();
        }
    }

    static setupAlphabeticalNavigation(pageType:string):Array<Link> {
        var navigationArray:Array<Link> = [];
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

        //Build alphabet array for navigation links
        for (var i in alphabet) {
            navigationArray.push({
                text: alphabet[i],
                route: ['Directory-page-starts-with',
                    {
                        type: pageType,
                        page: 1,
                        startsWith: alphabet[i]
                    }]
            });
        }
        return navigationArray;
    }


    /**
     * Create a valid value to set to routerLink by parsing a string delimited by a | pipe
     * -- creating an object for params when the object syntax is present in string
     * example input string: "Location-page|{‘loc’:'Industry-CA’}"
     */
    static parseToRoute(stringRoute) {
        if (stringRoute == null) {
            return ["Error-page"];
        }
        let stringRouteArr = stringRoute.split("|");

        let generatedUrl = stringRouteArr.map(function (item) {
            try {
                return JSON.parse(item);
            } catch (e) {
            }
            return item;
        });
        return generatedUrl;
    }

    /**
     * Format value to Billion/Million/Thousand
     */
    static nFormatter(num:number):string {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    /**
     * Get website host name
     */
    static getHostName(url:string):string {
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    }

    /**
     * Converts a given name to it's possessive version by checking to see if
     * the last character is an 's' or not. If it's an 's', then only an
     * apostrophe is added. Otherwise both an apostrophe and an 's' are added.
     *
     * If 'name' is null or empty, then it is returned unchanged.
     */
    static convertToPossessive(name:string) {
        if (!name || name.length == 0) return name;
        name = name.trim();
        var lastChar = name.charAt(name.length - 1);
        return lastChar == 's' ? name + "'" : name + "'s";
    }

    static formatDate(date) {
        var monthnum = moment.unix(date / 1000).format("MM");
        var month = GlobalFunctions.formatAPMonth(Number(monthnum));
        var day = moment.unix(date / 1000).format("DD");
        var year = moment.unix(date / 1000).format("YYYY");
        var time = moment.unix(date / 1000).format("h:mm");
        var a = moment.unix(date / 1000).format("A");
        var zone = "EST"
        return {month: month, day: day, year: year, time: time, a: a, zone: zone}
    }

    static formatShortDate(date) {
        var month = moment.unix(date / 1000).format("MM");
        var day = moment.unix(date / 1000).format("DD");
        var year = moment.unix(date / 1000).format("YY");
        var time = moment.unix(date / 1000).format("h:mm");
        var a = moment.unix(date / 1000).format("A");
        var zone = "EST"
        return {month: month, day: day, year: year, time: time, a: a, zone: zone}
    }


    /**
     * Returns a random list of articles
     */
    static getRandomArticles(articles, scope, type) {
        articles = [
            'pregame-report',
            //'in-game-report',
            //'postgame-report',
            'upcoming-games',
            'about-the-teams',
            'historical-team-statistics',
            'last-matchup',
            'starting-roster-home-offense',
            'starting-roster-home-defense',
            'starting-roster-home-special-teams',
            'starting-roster-away-offense',
            'starting-roster-away-defense',
            'starting-roster-away-special-teams',
            'quarterback-player-comparison',
            'running-back-player-comparison',
            'wide-receiver-player-comparison',
            'tight-end-player-comparison',
            'defense-player-comparison',
            'player-fantasy'
        ];
        if (scope == "nfl") {
            articles.push('injuries-home', 'injuries-away');
        }
        var findCurrent = articles.indexOf(type);
        articles.splice(findCurrent, 1);
        articles.sort(function () {
            return 0.5 - Math.random()
        });
        return articles;
    }

    static getApiArticleType(type) {
        var articleType;
        switch (type) {
            case "pregame-report":
                return articleType = "articleType=pregame-report";
            case "in-game-report":
                return articleType = "articleType=in-game-report";
            case "postgame-report":
                return articleType = "articleType=postgame-report";
            case "upcoming-games":
                return articleType = "articleType=upcoming-games";
            case "about-the-teams":
                return articleType = "articleType=about-the-teams";
            case "historical-team-statistics":
                return articleType = "articleType=historical-team-statistics";
            case "last-matchup":
                return articleType = "articleType=last-matchup";
            case "rosters":
                return articleType = "articleType=player-fantasy";
            case "injuries":
                return articleType = "articleType=player-fantasy";
            case "player-comparisons":
                return articleType = "articleType=player-fantasy";
            case "player-daily-udate":
                return articleType = "articleType=player-fantasy";
            case "player-fantasy":
                return articleType = "articleType=player-fantasy";
            case "starting-roster-home-offense":
                return articleType = "articleSubType=starting-roster-home-offense";
            case "starting-roster-home-defense":
                return articleType = "articleSubType=starting-roster-home-defense";
            case "starting-roster-home-special-teams":
                return articleType = "articleSubType=starting-roster-home-special-teams";
            case "starting-roster-away-offense":
                return articleType = "articleSubType=starting-roster-away-offense";
            case "starting-roster-away-defense":
                return articleType = "articleSubType=starting-roster-away-defense";
            case "starting-roster-away-special-teams":
                return articleType = "articleSubType=starting-roster-away-special-teams";
            case "injuries-home":
                return articleType = "articleSubType=injuries-home";
            case "injuries-away":
                return articleType = "articleSubType=injuries-away";
            case "quarterback-player-comparison":
                return articleType = "articleSubType=quarterback-player-comparison";
            case "running-back-player-comparison":
                return articleType = "articleSubType=running-back-player-comparison";
            case "wide-receiver-player-comparison":
                return articleType = "articleSubType=wide-receiver-player-comparison";
            case "tight-end-player-comparison":
                return articleType = "articleSubType=tight-end-player-comparison";
            case "defense-player-comparison":
                return articleType = "articleSubType=defense-player-comparison";
        }
    }

    static getArticleType(articleType) {
        var articleInformation = [];
        switch (articleType) {
            case "pregame-report":
                return articleInformation = ["pregame-report", "gameReport", "null"];
            case "in-game-report":
                return articleInformation = ["in-game-report", "gameReport", "null"];
            case "postgame-report":
                return articleInformation = ["postgame-report", "gameReport", "null"];
            case "upcoming-games":
                return articleInformation = ["upcoming-games", "game_module", "null"];
            case "about-the-teams":
                return articleInformation = ["about-the-teams", "teamRecord", "about"];
            case "historical-team-statistics":
                return articleInformation = ["historical-team-statistics", "teamRecord", "history"];
            case "last-matchup":
                return articleInformation = ["last-matchup", "teamRecord", "last"];
            case "player-fantasy":
                return articleInformation = ["player-fantasy", "gameReport", "null"];
            case "starting-roster-home-offense":
                return articleInformation = ["starting-roster-home-offense", "playerRoster", "null"];
            case "starting-roster-home-defense":
                return articleInformation = ["starting-roster-home-defense", "playerRoster", "null"];
            case "starting-roster-home-special-teams":
                return articleInformation = ["starting-roster-home-special-teams", "playerRoster", "null"];
            case "starting-roster-away-offense":
                return articleInformation = ["starting-roster-away-offense", "playerRoster", "null"];
            case "starting-roster-away-defense":
                return articleInformation = ["starting-roster-away-defense", "playerRoster", "null"];
            case "starting-roster-away-special-teams":
                return articleInformation = ["starting-roster-away-special-teams", "playerRoster", "null"];
            case "injuries-home":
                return articleInformation = ["injuries-home", "playerRoster", "null"];
            case "injuries-away":
                return articleInformation = ["injuries-away", "playerRoster", "null"];
            case "quarterback-player-comparison":
                return articleInformation = ["quarterback-player-comparison", "playerComparison", "null"];
            case "running-back-player-comparison":
                return articleInformation = ["running-back-player-comparison", "playerComparison", "null"];
            case "wide-receiver-player-comparison":
                return articleInformation = ["wide-receiver-player-comparison", "playerComparison", "null"];
            case "tight-end-player-comparison":
                return articleInformation = ["tight-end-player-comparison", "playerComparison", "null"];
            case "defense-player-comparison":
                return articleInformation = ["defense-player-comparison", "playerComparison", "null"];
        }

    }

    static capitalizeFirstLetter(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    static lazyLoadOnScroll(event, batchLoadIndex) {
      if(isBrowser){
        if(batchLoadIndex == 1){
          GlobalFunctions.documentHeight = 0;
        }
        if (jQuery(document).height() - window.innerHeight - jQuery("footer").height() <= jQuery(window).scrollTop()) {
          //fire when scrolled into footer
          if(jQuery(document).height() > GlobalFunctions.documentHeight){
            GlobalFunctions.documentHeight = jQuery(document).height();
            batchLoadIndex = batchLoadIndex + 1;
          }
        }
        return batchLoadIndex;
      }
    } //onScroll
}
