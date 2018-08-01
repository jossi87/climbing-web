module.exports = {
  getImageUrl(id, maxHeight) {
    if (maxHeight) {
      return encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v2/images?id=${id}&targetHeight=${maxHeight}`);
    }
    return encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v2/images?id=${id}`);
  },

  convertFromDateToString(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }
}
