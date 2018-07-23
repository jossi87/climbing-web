module.exports = {
  getUrl(str) {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return "https://buldring.bergen-klatreklubb.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return "https://buldring.fredrikstadklatreklubb.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='brattelinjer.no') {
      return "https://brattelinjer.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='buldring.jotunheimenfjellsport.com') {
      return "https://buldring.jotunheimenfjellsport.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return "https://klatring.jotunheimenfjellsport.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='dev.jossi.org') {
      return "https://dev.jossi.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else {
      return "https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    }
  },

  getTitle(str) {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return (str? str : "Buldring i Hordaland") + " | buldring.bergen-klatreklubb.no";
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return (str? str : "Buldring i Fredrikstad") + " | buldring.fredrikstadklatreklubb.org";
    } else if (window.location.hostname=='brattelinjer.no') {
      return (str? str : "Klatring i Rogaland") + " | Bratte linjer";
    } else if (window.location.hostname=='buldring.jotunheimenfjellsport.com') {
      return (str? str : "Buldring i Jotunheimen") + " | buldring.jotunheimenfjellsport.com";
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return (str? str : "Klatring i Jotunheimen") + " | klatring.jotunheimenfjellsport.com";
    } else if (window.location.hostname=='dev.jossi.org') {
      return (str? str : "DEV") + " | dev.jossi.org";
    } else {
      return (str? str : "Buldring i Rogaland") + " | Buldreinfo";
    }
  },

  getIndexMetaDescription() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return "Official page for bouldering in the Hordaland area (Bergen, Western Norway). The site contains detailed topos (with images and videos), where logged in users can tick problems (log ascents).";
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return "Official page for bouldering in the Fredrikstad area (Eastern Norway). The site contains detailed topos (with images and videos), where logged in users can tick problems (log ascents).";
    } else if (window.location.hostname=='brattelinjer.no') {
      return "BRV's (Bratte Rogalands Venner) official page for climbing in the Rogaland area (Stavanger, Western Norway). The site contains detailed topos (with images and videos), where logged in users can tick routes (log ascents).";
    } else if (window.location.hostname=='buldring.jotunheimenfjellsport.com') {
      return "Official page for bouldering in the Jotunheimen area (Norway). The site contains detailed topos (with images and videos), where logged in users can tick problems (log ascents).";
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return "Official page for climbing in the Jotunheimen area (Norway). The site contains detailed topos (with images and videos), where logged in users can tick routes (log ascents).";
    } else if (window.location.hostname=='dev.jossi.org') {
      return "DEV PAGE";
    } else {
      return "Official page for bouldering in the Rogaland area (Stavanger, Western Norway). The site contains detailed topos (with images and videos), where logged in users can tick problems (log ascents).";
    }
  },

  getRegion() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return "2";
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return "3";
    } else if (window.location.hostname=='brattelinjer.no') {
      return "4";
    } else if (window.location.hostname=='buldring.jotunheimenfjellsport.com') {
      return "5";
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return "6";
    } else if (window.location.hostname=='dev.jossi.org') {
      return "4";
    } else {
      return "1";
    }
  },

  getDefaultCenter() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return {lat: 60.47521, lng: 6.83169};
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return {lat: 59.22844, lng: 10.91722};
    } else if (window.location.hostname=='buldring.jotunheimenfjellsport.com') {
      return {lat: 61.60500, lng: 8.47750};
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return {lat: 61.60500, lng: 8.47750};
    } else {
      return {lat: 58.78119, lng: 5.86361};
    }
  },

  getDefaultZoom() {
    if (window.location.hostname=='brattelinjer.no') {
      return 9;
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return 9;
    } else if (window.location.hostname=='dev.jossi.org') {
      return 9;
    } else {
      return 7;
    }
  },

  isBouldering() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return true;
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return true;
    } else if (window.location.hostname=='brattelinjer.no') {
      return false;
    } else if (window.location.hostname=='buldring.jotunheimenfjellsport.com') {
      return true;
    } else if (window.location.hostname=='klatring.jotunheimenfjellsport.com') {
      return false;
    } else if (window.location.hostname=='dev.jossi.org') {
      return true;
    } else {
      return true;
    }
  },

  convertFromDateToString(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }
}
