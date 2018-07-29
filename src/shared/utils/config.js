module.exports = {
  getUrl(str) {
    let base = '';
    if (typeof window !== 'undefined') {
        base = window.location.protocol + '//' + window.location.host;
    } else if (this.props && this.props.serverRequest) {
        base = this.props.serverRequest.headers.host;
    }

    if (base=='https://buldring.bergen-klatreklubb.no') {
      return "https://buldring.bergen-klatreklubb.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base=='https://buldring.fredrikstadklatreklubb.org') {
      return "https://buldring.fredrikstadklatreklubb.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base=='https://brattelinjer.no') {
      return "https://brattelinjer.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base=='https://buldring.jotunheimenfjellsport.com') {
      return "https://buldring.jotunheimenfjellsport.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base=='https://klatring.jotunheimenfjellsport.com') {
      return "https://klatring.jotunheimenfjellsport.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base=='https://dev.jossi.org') {
      return "https://dev.jossi.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else {
      return "https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    }
  },

  getTitle(str) {
    let base = '';
    if (typeof window !== 'undefined') {
        base = window.location.protocol + '//' + window.location.host;
    } else if (this.props && this.props.serverRequest) {
        base = this.props.serverRequest.headers.host;
    }

    if (base=='https://buldring.bergen-klatreklubb.no') {
      return (str && str + " | ") + "Buldring i Hordaland";
    } else if (base=='https://buldring.fredrikstadklatreklubb.org') {
      return (str && str + " | ") + "Buldring i Fredrikstad";
    } else if (base=='https://brattelinjer.no') {
      return (str && str + " | ") + "Bratte Linjer";
    } else if (base=='https://buldring.jotunheimenfjellsport.com') {
      return (str && str + " | ") + "Buldring i Jotunheimen";
    } else if (base=='https://klatring.jotunheimenfjellsport.com') {
      return (str && str + " | ") + "Klatring i Jotunheimen";
    } else if (base=='https://dev.jossi.org') {
      return (str && str + " | ") + "dev.jossi.org";
    } else {
      return (str && str + " | ") + "Buldreinfo";
    }
  },

  getDefaultCenter() {
    let base = '';
    if (typeof window !== 'undefined') {
        base = window.location.protocol + '//' + window.location.host;
    } else if (this.props && this.props.serverRequest) {
        base = this.props.serverRequest.headers.host;
    }

    if (base=='https://buldring.bergen-klatreklubb.no') {
      return {lat: 60.47521, lng: 6.83169};
    } else if (base=='https://buldring.fredrikstadklatreklubb.org') {
      return {lat: 59.22844, lng: 10.91722};
    } else if (base=='https://buldring.jotunheimenfjellsport.com') {
      return {lat: 61.60500, lng: 8.47750};
    } else if (base=='https://klatring.jotunheimenfjellsport.com') {
      return {lat: 61.60500, lng: 8.47750};
    } else {
      return {lat: 58.78119, lng: 5.86361};
    }
  },

  getDefaultZoom() {
    let base = '';
    if (typeof window !== 'undefined') {
        base = window.location.protocol + '//' + window.location.host;
    } else if (this.props && this.props.serverRequest) {
        base = this.props.serverRequest.headers.host;
    }

    if (base=='https://brattelinjer.no') {
      return 9;
    } else if (base=='https://klatring.jotunheimenfjellsport.com') {
      return 9;
    } else if (base=='https://dev.jossi.org') {
      return 9;
    } else {
      return 7;
    }
  },

  isBouldering() {
    let base = '';
    if (typeof window !== 'undefined') {
        base = window.location.protocol + '//' + window.location.host;
    } else if (this.props && this.props.serverRequest) {
        base = this.props.serverRequest.headers.host;
    }

    if (base=='https://buldring.bergen-klatreklubb.no') {
      return true;
    } else if (base=='https://buldring.fredrikstadklatreklubb.org') {
      return true;
    } else if (base=='https://brattelinjer.no') {
      return false;
    } else if (base=='https://buldring.jotunheimenfjellsport.com') {
      return true;
    } else if (base=='https://klatring.jotunheimenfjellsport.com') {
      return false;
    } else if (base=='https://dev.jossi.org') {
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
