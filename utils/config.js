module.exports = {
  getUrl(str) {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return "https://buldring.bergen-klatreklubb.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return "https://buldring.fredrikstadklatreklubb.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (window.location.hostname=='klatring.buldreinfo.com') {
      return "https://klatring.buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else {
      return "https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    }
  },

  getTitle() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return "Buldring i Hordaland";
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return "Buldring i Fredrikstad";
    } else if (window.location.hostname=='klatring.buldreinfo.com') {
      return "Klatring i Rogaland";
    } else {
      return "buldreinfo";
    }
  },

  getRegion() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return "2";
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return "3";
    } else if (window.location.hostname=='klatring.buldreinfo.com') {
      return "4";
    } else {
      return "1";
    }
  },

  showSisLogo() {
    return getRegion() == 1;
  },

  showGooglePlayLogo() {
    return getRegion() != 4;
  },

  getDefaultCenter() {
    if (window.location.hostname=='buldring.bergen-klatreklubb.no') {
      return {lat: 60.47521, lng: 6.83169};
    } else if (window.location.hostname=='buldring.fredrikstadklatreklubb.org') {
      return {lat: 59.22844, lng: 10.91722};
    } else {
      return {lat: 58.78119, lng: 5.86361};
    }
  }
}
