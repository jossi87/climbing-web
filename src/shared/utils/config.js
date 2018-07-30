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
  }
}
