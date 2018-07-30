/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 23);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("react-bootstrap");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  getUrl: function getUrl(str) {
    var base = '';
    if (typeof window !== 'undefined') {
      base = window.location.protocol + '//' + window.location.host;
    } else if (this.props && this.props.serverRequest) {
      base = this.props.serverRequest.headers.host;
    }

    if (base == 'https://buldring.bergen-klatreklubb.no') {
      return "https://buldring.bergen-klatreklubb.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base == 'https://buldring.fredrikstadklatreklubb.org') {
      return "https://buldring.fredrikstadklatreklubb.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base == 'https://brattelinjer.no') {
      return "https://brattelinjer.no/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base == 'https://buldring.jotunheimenfjellsport.com') {
      return "https://buldring.jotunheimenfjellsport.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base == 'https://klatring.jotunheimenfjellsport.com') {
      return "https://klatring.jotunheimenfjellsport.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else if (base == 'https://dev.jossi.org') {
      return "https://dev.jossi.org/com.buldreinfo.jersey.jaxb/v1/" + str;
    } else {
      return "https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/" + str;
    }
  }
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("superagent");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("react-router-dom");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/react-fontawesome");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _reactCookie = __webpack_require__(16);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  login: function login(username, password, cb) {},


  getToken: function getToken() {
    return "asd";
  },

  logout: function logout(cb) {},

  loggedIn: function loggedIn() {

    return false;
  },

  isAdmin: function isAdmin() {

    return false;
  },

  isSuperAdmin: function isSuperAdmin() {
    return false;
  },

  onChange: function onChange() {}
};

function tryLogin(username, password, cb) {}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("react-router");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("react-meta-tags");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("react-router-bootstrap");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouter = __webpack_require__(7);

var _reactGoogleMaps = __webpack_require__(11);

var _MarkerClusterer = __webpack_require__(32);

var _MarkerClusterer2 = _interopRequireDefault(_MarkerClusterer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Map = function (_Component) {
  _inherits(Map, _Component);

  function Map(props) {
    _classCallCheck(this, Map);

    return _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));
  }

  _createClass(Map, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      navigator.geolocation.getCurrentPosition(function (position) {
        _this2.setState({ currLat: position.coords.latitude, currLng: position.coords.longitude });
      });
    }
  }, {
    key: 'handleOnClick',
    value: function handleOnClick(pushUrl) {
      this.setState({ pushUrl: pushUrl });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      if (this.state && this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }

      var GettingStartedGoogleMap = (0, _reactGoogleMaps.withScriptjs)((0, _reactGoogleMaps.withGoogleMap)(function (props) {
        var markers = null;
        if (_this3.props.markers) {
          markers = _this3.props.markers.map(function (m, i) {
            var myIcon = null;
            if (m.icon) {
              myIcon = {};
              if (m.icon.url) {
                myIcon.url = m.icon.url;
              }
              if (m.icon.scaledSizeW && m.icon.scaledSizeH) {
                myIcon.scaledSize = new google.maps.Size(m.icon.scaledSizeW, m.icon.scaledSizeH);
              }
              if (m.icon.labelOriginX && m.icon.labelOriginY) {
                myIcon.labelOrigin = new google.maps.Point(m.icon.labelOriginX, m.icon.labelOriginY);
              }
            }
            return _react2.default.createElement(_reactGoogleMaps.Marker, {
              icon: myIcon,
              key: i,
              position: { lat: m.lat, lng: m.lng },
              label: m.label,
              title: m.title,
              clickable: true,
              onClick: _this3.handleOnClick.bind(_this3, m.url) });
          });
        }
        if (_this3.state && _this3.state.currLat && _this3.state.currLng && _this3.state.currLat > 0 && _this3.state.currLng > 0) {
          markers.push(_react2.default.createElement(_reactGoogleMaps.Marker, {
            key: -1,
            icon: 'https://maps.gstatic.com/mapfiles/markers2/measle_blue.png',
            position: { lat: _this3.state.currLat, lng: _this3.state.currLng } }));
        }
        var polygons = null;
        if (_this3.props.polygons) {
          polygons = _this3.props.polygons.map(function (p, i) {
            return _react2.default.createElement(_reactGoogleMaps.Polygon, {
              key: i,
              paths: p.triangleCoords,
              options: { strokeColor: '#FF3300', strokeOpacity: '0.5', strokeWeight: '2', fillColor: '#FF3300', fillOpacity: '0.15' },
              onClick: _this3.handleOnClick.bind(_this3, p.url) });
          });
        }

        return _react2.default.createElement(
          _reactGoogleMaps.GoogleMap,
          {
            defaultZoom: _this3.props.defaultZoom,
            defaultCenter: _this3.props.defaultCenter,
            defaultMapTypeId: google.maps.MapTypeId.TERRAIN
          },
          _react2.default.createElement(
            _MarkerClusterer2.default,
            {
              averageCenter: false,
              minimumClusterSize: 60,
              enableRetinaIcons: false,
              imagePath: "https://raw.githubusercontent.com/googlemaps/js-marker-clusterer/gh-pages/images/m",
              gridSize: 60 },
            markers,
            polygons
          )
        );
      }));

      return _react2.default.createElement(
        'section',
        { style: { height: '600px' } },
        _react2.default.createElement(GettingStartedGoogleMap, {
          googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp',
          loadingElement: _react2.default.createElement('div', { style: { height: '100%' } }),
          containerElement: _react2.default.createElement('div', { style: { height: '100%' } }),
          mapElement: _react2.default.createElement('div', { style: { height: '100%' } })
        })
      );
    }
  }]);

  return Map;
}(_react.Component);

exports.default = Map;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("react-google-maps");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDropzone = __webpack_require__(37);

var _reactDropzone2 = _interopRequireDefault(_reactDropzone);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _reactBootstrap = __webpack_require__(1);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Text = function (_Component) {
  _inherits(Text, _Component);

  function Text(props) {
    _classCallCheck(this, Text);

    var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, props));

    _this.state = { searchResults: [], value: '' };
    return _this;
  }

  _createClass(Text, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState({ value: nextProps.value });
    }
  }, {
    key: 'inputChange',
    value: function inputChange(e) {
      var _this2 = this;

      var value = e.target.value;
      this.props.onValueChanged(this.props.m, value);
      if (value.length > 0) {
        _superagent2.default.get(_config2.default.getUrl("users/search?value=" + value)).withCredentials().end(function (err, res) {
          if (err) {
            console.log(err);
          }
          var sr = res.body.filter(function (u) {
            return u.name.toUpperCase() !== value.toUpperCase();
          });
          _this2.setState({ searchResults: sr });
        });
      } else {
        this.setState({ searchResults: [] });
      }
    }
  }, {
    key: 'menuItemSelect',
    value: function menuItemSelect(user, event) {
      this.setState({ searchResults: [] });
      this.props.onValueChanged(this.props.m, user.name);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var searchResults = null;
      if (this.state.searchResults.length > 0) {
        var rows = this.state.searchResults.map(function (u, i) {
          return _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: i, href: '#', onSelect: _this3.menuItemSelect.bind(_this3, u) },
            u.name
          );
        });
        searchResults = _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'ul',
            { className: 'dropdown-menu open', style: { position: 'absolute', display: 'inline' } },
            rows
          )
        );
      }

      return _react2.default.createElement(
        'div',
        { style: { position: 'relative', width: '100%' } },
        _react2.default.createElement(
          'div',
          { style: { width: '100%' } },
          _react2.default.createElement(_reactBootstrap.FormControl, { style: { display: 'inline-block' }, type: 'text', placeholder: this.props.placeholder, value: this.state.value, onChange: this.inputChange.bind(this) })
        ),
        searchResults
      );
    }
  }]);

  return Text;
}(_react.Component);

var ImageUpload = function (_Component2) {
  _inherits(ImageUpload, _Component2);

  function ImageUpload(props) {
    _classCallCheck(this, ImageUpload);

    var _this4 = _possibleConstructorReturn(this, (ImageUpload.__proto__ || Object.getPrototypeOf(ImageUpload)).call(this, props));

    _this4.state = { media: [] };
    return _this4;
  }

  _createClass(ImageUpload, [{
    key: 'onDrop',
    value: function onDrop(files) {
      var allMedia = this.state.media;
      files.forEach(function (f) {
        return allMedia.push({ file: f });
      });
      this.setState({ media: allMedia });
      this.props.onMediaChanged(allMedia);
    }
  }, {
    key: 'onPhotographerChanged',
    value: function onPhotographerChanged(m, name) {
      m.photographer = name;
      this.props.onMediaChanged(this.state.media);
    }
  }, {
    key: 'onInPhotoChanged',
    value: function onInPhotoChanged(m, name) {
      m.inPhoto = name;
      this.props.onMediaChanged(this.state.media);
    }
  }, {
    key: 'onRemove',
    value: function onRemove(toRemove) {
      var allMedia = this.state.media.filter(function (m) {
        return m != toRemove;
      });
      this.setState({ media: allMedia });
      this.props.onMediaChanged(allMedia);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        null,
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          'Upload image(s)'
        ),
        _react2.default.createElement('br', null),
        _react2.default.createElement(
          _reactDropzone2.default,
          {
            onDrop: this.onDrop.bind(this),
            style: { width: '220px', height: '75px', padding: '15px', borderWidth: '1px', borderColor: '#666', borderStyle: 'dashed', borderRadius: '5px' },
            accept: 'image/*' },
          _react2.default.createElement(
            'i',
            null,
            'Drop JPG-image(s) here or click to select files to upload.'
          )
        ),
        this.state.media.length > 0 ? _react2.default.createElement(
          _reactBootstrap.Grid,
          null,
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            this.state.media.map(function (m, i) {
              return _react2.default.createElement(
                _reactBootstrap.Col,
                { key: i, xs: 8, sm: 6, md: 4, lg: 2 },
                _react2.default.createElement(
                  _reactBootstrap.Thumbnail,
                  { src: m.file.preview },
                  _react2.default.createElement(Text, { m: m, placeholder: 'In photo', value: m ? m.inPhoto : '', onValueChanged: _this5.onInPhotoChanged.bind(_this5) }),
                  _react2.default.createElement(Text, { m: m, placeholder: 'Photographer', value: m ? m.photographer : '', onValueChanged: _this5.onPhotographerChanged.bind(_this5) }),
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { style: { width: '100%' }, bsStyle: 'danger', onClick: _this5.onRemove.bind(_this5, m) },
                    'Remove'
                  )
                )
              );
            })
          )
        ) : null
      );
    }
  }]);

  return ImageUpload;
}(_react.Component);

exports.default = ImageUpload;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactImageGallery = __webpack_require__(33);

var _reactImageGallery2 = _interopRequireDefault(_reactImageGallery);

var _reactBootstrap = __webpack_require__(1);

var _reactPlayer = __webpack_require__(34);

var _reactPlayer2 = _interopRequireDefault(_reactPlayer);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _svgPathParser = __webpack_require__(19);

var _reactRouterDom = __webpack_require__(4);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _reactRouter = __webpack_require__(7);

var _objectFitImages = __webpack_require__(35);

var _objectFitImages2 = _interopRequireDefault(_objectFitImages);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // objectFit does not work on IE and Edge http://caniuse.com/#search=object-fit


var Gallery = function (_Component) {
  _inherits(Gallery, _Component);

  function Gallery(props) {
    _classCallCheck(this, Gallery);

    var _this = _possibleConstructorReturn(this, (Gallery.__proto__ || Object.getPrototypeOf(Gallery)).call(this, props));

    _this.state = {
      mediaIndex: 0,
      hoverTrash: false,
      hoverEdit: false,
      showFullscreenButton: true,
      showGalleryFullscreenButton: true,
      showPlayButton: true,
      showGalleryPlayButton: false,
      showVideo: {},
      isFullscreen: false,
      pushUrl: null
    };
    return _this;
  }

  _createClass(Gallery, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState({
        mediaIndex: 0,
        hoverTrash: false,
        hoverEdit: false,
        showFullscreenButton: true,
        showGalleryFullscreenButton: true,
        showPlayButton: true,
        showGalleryPlayButton: false,
        showVideo: {},
        isFullscreen: false,
        pushUrl: null
      });
      if (this.imageGallery) {
        this.imageGallery.slideToIndex(0);
      }
    }
  }, {
    key: 'toggleHoverTrash',
    value: function toggleHoverTrash() {
      this.setState({ hoverTrash: !this.state.hoverTrash });
    }
  }, {
    key: 'toggleHoverEdit',
    value: function toggleHoverEdit() {
      this.setState({ hoverEdit: !this.state.hoverEdit });
    }
  }, {
    key: 'onDeleteImage',
    value: function onDeleteImage(event) {
      var _this2 = this;

      if (confirm('Are you sure you want to delete this image?')) {
        var idMedia = this.props.media[this.state.mediaIndex].id;
        _superagent2.default.delete(_config2.default.getUrl("media?id=" + idMedia)).withCredentials().end(function (err, res) {
          if (err) {
            alert(err.toString());
          } else {
            if (_this2.props.media.length > 1 && _this2.state.mediaIndex >= _this2.props.media.length - 1) {
              var nextMediaIndex = _this2.state.mediaIndex - 1;
              _this2.setState({ mediaIndex: nextMediaIndex });
              _this2.imageGallery.slideToIndex(nextMediaIndex);
            }
            _this2.props.removeMedia(idMedia);
          }
        });
      }
    }
  }, {
    key: 'onSlide',
    value: function onSlide(index) {
      this.resetVideo();
      this.setState({ mediaIndex: index });
    }
  }, {
    key: 'onScreenChange',
    value: function onScreenChange(fullscreenElement) {
      this.setState({ isFullscreen: fullscreenElement });
    }
  }, {
    key: 'resetVideo',
    value: function resetVideo() {
      this.setState({ showVideo: {} });

      if (this.state.showPlayButton) {
        this.setState({ showGalleryPlayButton: true });
      }

      if (this.state.showFullscreenButton) {
        this.setState({ showGalleryFullscreenButton: true });
      }
    }
  }, {
    key: 'toggleShowVideo',
    value: function toggleShowVideo(url) {
      this.state.showVideo[url] = !Boolean(this.state.showVideo[url]);
      this.setState({
        showVideo: this.state.showVideo
      });

      if (this.state.showVideo[url]) {
        if (this.state.showPlayButton) {
          this.setState({ showGalleryPlayButton: false });
        }

        if (this.state.showFullscreenButton) {
          this.setState({ showGalleryFullscreenButton: false });
        }
      }
    }
  }, {
    key: 'renderVideo',
    value: function renderVideo(item) {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        { className: 'image-gallery-image' },
        this.state.showVideo[item.embedUrl] ? _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement('a', { className: 'gallery-close-video', onClick: this.toggleShowVideo.bind(this, item.embedUrl) }),
          _react2.default.createElement(_reactPlayer2.default, {
            ref: function ref(player) {
              _this3.player = player;
            },
            className: 'react-player',
            width: '100%',
            height: '100%',
            url: item.embedUrl,
            onDuration: function onDuration(duration) {
              return _this3.setState({ duration: duration });
            },
            onStart: function onStart() {
              return _this3.player.seekTo(parseFloat(item.seekTo / _this3.state.duration));
            },
            controls: true,
            playing: true })
        ) : _react2.default.createElement(
          'a',
          { onClick: this.toggleShowVideo.bind(this, item.embedUrl) },
          _react2.default.createElement('div', { className: 'gallery-play-button' }),
          _react2.default.createElement('img', { src: item.original, alt: this.props.alt })
        )
      );
    }
  }, {
    key: 'pushUrl',
    value: function pushUrl(url) {
      this.setState({ pushUrl: url });
    }
  }, {
    key: 'generateShapes',
    value: function generateShapes(svgs, svgProblemId, w, h) {
      var _this4 = this;

      return svgs.map(function (svg, key) {
        var path = (0, _svgPathParser.parseSVG)(svg.path);
        (0, _svgPathParser.makeAbsolute)(path); // Note: mutates the commands in place!
        var ixNr;
        var maxY = 0;
        var ixAnchor;
        var minY = 99999999;
        for (var i = 0, len = path.length; i < len; i++) {
          if (path[i].y > maxY) {
            ixNr = i;
            maxY = path[i].y;
          }
          if (path[i].y < minY) {
            ixAnchor = i;
            minY = path[i].y;
          }
        }
        var x = path[ixNr].x;
        var y = path[ixNr].y;
        var r = 0.012 * w;
        if (x < r) x = r;
        if (x > w - r) x = w - r;
        if (y < r) y = r;
        if (y > h - r) y = h - r;
        var anchor = null;
        if (svg.hasAnchor) {
          anchor = _react2.default.createElement('circle', { className: 'buldreinfo-svg-ring', cx: path[ixAnchor].x, cy: path[ixAnchor].y, r: 0.006 * w });
        }
        return _react2.default.createElement(
          'g',
          { className: "buldreinfo-svg-pointer buldreinfo-svg-hover" + (svgProblemId === 0 || svg.problemId === svgProblemId ? "" : " buldreinfo-svg-opacity"), key: key, onClick: _this4.pushUrl.bind(_this4, "/problem/" + svg.problemId) },
          _react2.default.createElement('path', { d: svg.path, className: 'buldreinfo-svg-route', strokeWidth: 0.003 * w, strokeDasharray: 0.006 * w }),
          _react2.default.createElement('circle', { className: 'buldreinfo-svg-ring', cx: x, cy: y, r: r }),
          _react2.default.createElement(
            'text',
            { className: 'buldreinfo-svg-routenr', x: x, y: y, fontSize: 0.02 * w, dy: '.3em' },
            svg.nr
          ),
          anchor
        );
      });
    }
  }, {
    key: 'renderImage',
    value: function renderImage(m) {
      if (m.svgs) {
        return _react2.default.createElement(
          'div',
          { className: 'image-gallery-image' },
          _react2.default.createElement('canvas', { className: 'buldreinfo-svg-canvas-ie-hack', width: m.width, height: m.height }),
          _react2.default.createElement(
            'svg',
            { className: 'buldreinfo-svg', viewBox: "0 0 " + m.width + " " + m.height, preserveAspectRatio: 'xMidYMid meet' },
            _react2.default.createElement('image', { xlinkHref: _config2.default.getUrl('images?id=' + m.id), width: '100%', height: '100%' }),
            this.generateShapes(m.svgs, m.svgProblemId, m.width, m.height)
          )
        );
      }
      return _react2.default.createElement(
        'div',
        { className: 'image-gallery-image' },
        _react2.default.createElement('img', { src: _config2.default.getUrl('images?id=' + m.id), className: 'buldreinfo-scale-img', alt: this.props.alt })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      (0, _objectFitImages2.default)(null, { watchMQ: true });
      if (this.state && this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }
      var caruselItems = this.props.media.map(function (m, i) {
        if (m.idType == 1) {
          return {
            original: _config2.default.getUrl('images?id=' + m.id),
            thumbnail: _config2.default.getUrl('images?id=' + m.id),
            originalClass: 'featured-slide',
            thumbnailClass: 'featured-thumb',
            originalAlt: 'original-alt',
            thumbnailAlt: 'thumbnail-alt',
            renderItem: _this5.renderImage.bind(_this5, m)
          };
        } else {
          return {
            original: _config2.default.getUrl('images?id=' + m.id),
            thumbnail: _config2.default.getUrl('images?id=' + m.id),
            originalClass: 'featured-slide',
            thumbnailClass: 'featured-thumb',
            originalAlt: 'original-alt',
            thumbnailAlt: 'thumbnail-alt',
            embedUrl: 'https://buldreinfo.com/buldreinfo_media/mp4/' + Math.floor(m.id / 100) * 100 + "/" + m.id + '.mp4',
            seekTo: m.t,
            renderItem: _this5.renderVideo.bind(_this5)
          };
        }
      });

      var button = "";
      var m = this.props.media[this.state.mediaIndex];
      if (!this.state.isFullscreen && m.idType == 1 && _auth2.default.isAdmin()) {
        if (m.svgProblemId > 0) {
          button = _react2.default.createElement(
            'span',
            { style: { position: 'absolute', zIndex: '4', background: 'rgba(0, 0, 0, 0.4)', padding: '8px 20px' } },
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/problem/svg-edit/' + m.svgProblemId + '/' + m.id, onMouseEnter: this.toggleHoverEdit.bind(this), onMouseLeave: this.toggleHoverEdit.bind(this) },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'edit', style: this.state.hoverEdit ? { transform: 'scale(1.1)', color: '#fff' } : { color: '#fff' } })
            )
          );
        } else if (!m.svgs) {
          button = _react2.default.createElement(
            'span',
            { style: { position: 'absolute', zIndex: '4', background: 'rgba(0, 0, 0, 0.4)', padding: '8px 20px' } },
            _react2.default.createElement(
              'a',
              { href: '#', onMouseEnter: this.toggleHoverTrash.bind(this), onMouseLeave: this.toggleHoverTrash.bind(this) },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'trash', style: this.state.hoverTrash ? { transform: 'scale(1.1)', color: '#fff' } : { color: '#fff' }, onClick: this.onDeleteImage.bind(this) })
            )
          );
        }
      }

      return _react2.default.createElement(
        _reactBootstrap.Well,
        { className: 'app' },
        button,
        _react2.default.createElement(_reactImageGallery2.default, {
          ref: function ref(i) {
            return _this5.imageGallery = i;
          },
          items: caruselItems,
          onSlide: this.onSlide.bind(this),
          onScreenChange: this.onScreenChange.bind(this),
          showThumbnails: this.props.showThumbnails,
          showBullets: this.state.showFullscreenButton && this.state.showGalleryFullscreenButton && this.props.media.length > 1,
          showIndex: this.state.showFullscreenButton && this.state.showGalleryFullscreenButton,
          showPlayButton: false,
          showFullscreenButton: this.state.showFullscreenButton && this.state.showGalleryFullscreenButton })
      );
    }
  }]);

  return Gallery;
}(_react.Component);

exports.default = Gallery;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("react-bootstrap-table");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("react-cookie");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("react-dom");

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _area = __webpack_require__(31);

var _area2 = _interopRequireDefault(_area);

var _areaEdit = __webpack_require__(36);

var _areaEdit2 = _interopRequireDefault(_areaEdit);

var _browse = __webpack_require__(38);

var _browse2 = _interopRequireDefault(_browse);

var _ethics = __webpack_require__(39);

var _ethics2 = _interopRequireDefault(_ethics);

var _finder = __webpack_require__(40);

var _finder2 = _interopRequireDefault(_finder);

var _index = __webpack_require__(41);

var _index2 = _interopRequireDefault(_index);

var _login = __webpack_require__(45);

var _login2 = _interopRequireDefault(_login);

var _logout = __webpack_require__(46);

var _logout2 = _interopRequireDefault(_logout);

var _problem = __webpack_require__(47);

var _problem2 = _interopRequireDefault(_problem);

var _problemEdit = __webpack_require__(49);

var _problemEdit2 = _interopRequireDefault(_problemEdit);

var _problemEditMedia = __webpack_require__(53);

var _problemEditMedia2 = _interopRequireDefault(_problemEditMedia);

var _recover = __webpack_require__(54);

var _recover2 = _interopRequireDefault(_recover);

var _register = __webpack_require__(55);

var _register2 = _interopRequireDefault(_register);

var _sector = __webpack_require__(56);

var _sector2 = _interopRequireDefault(_sector);

var _sectorEdit = __webpack_require__(57);

var _sectorEdit2 = _interopRequireDefault(_sectorEdit);

var _svgEdit = __webpack_require__(58);

var _svgEdit2 = _interopRequireDefault(_svgEdit);

var _user = __webpack_require__(59);

var _user2 = _interopRequireDefault(_user);

var _userEdit = __webpack_require__(61);

var _userEdit2 = _interopRequireDefault(_userEdit);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = [{ path: '/', exact: true, component: _index2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getFrontpage)();
  } }, { path: '/browse', exact: false, component: _browse2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getBrowse)();
  } }, { path: '/ethics', exact: false, component: _ethics2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getMeta)();
  } }, { path: '/area/:areaId', exact: true, component: _area2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getArea)(path.split('/').pop());
  } }, { path: '/area/edit/:areaId', exact: true, component: _areaEdit2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getAreaEdit)(path.split('/').pop());
  } }, { path: '/sector/:sectorId', exact: true, component: _sector2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getSector)(path.split('/').pop());
  } }, { path: '/sector/edit/:sectorId', exact: true, component: _sectorEdit2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getSectorEdit)(path.split('/').pop());
  } }, { path: '/problem/:problemId', exact: true, component: _problem2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getProblem)(path.split('/').pop());
  } }, { path: '/problem/edit/:problemId', exact: true, component: _problemEdit2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getProblemEdit)(path.split('/').pop());
  } }, { path: '/problem/edit/media/:problemId', exact: true, component: _problemEditMedia2.default }, { path: '/problem/svg-edit/:problemId/:mediaId', exact: true, component: _svgEdit2.default }, { path: '/finder/:grade', exact: true, component: _finder2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getFinder)(path.split('/').pop());
  } }, { path: '/user', exact: true, component: _user2.default }, { path: '/user/:userId', exact: true, component: _user2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getUser)(path.split('/').pop());
  } }, { path: '/user/:userId/edit', exact: true, component: _userEdit2.default }, { path: '/login', exact: false, component: _login2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getMeta)();
  } }, { path: '/register', exact: false, component: _register2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getMeta)();
  } }, { path: '/recover/:token', exact: true, component: _recover2.default, fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return (0, _api.getMeta)();
  } }, { path: '/logout', exact: false, component: _logout2.default }];

exports.default = routes;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("svg-path-parser");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = __webpack_require__(1);

var _reactInputCalendar = __webpack_require__(21);

var _reactInputCalendar2 = _interopRequireDefault(_reactInputCalendar);

var _reactFontawesome = __webpack_require__(5);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TickModal = function (_Component) {
  _inherits(TickModal, _Component);

  function TickModal(props) {
    _classCallCheck(this, TickModal);

    return _possibleConstructorReturn(this, (TickModal.__proto__ || Object.getPrototypeOf(TickModal)).call(this, props));
  }

  _createClass(TickModal, [{
    key: 'refresh',
    value: function refresh(props) {
      var date = null;
      if (props.date) {
        date = props.date;
      } else if (props.idTick == -1) {
        date = this.convertFromDateToString(new Date());
      }

      this.setState({
        idTick: props.idTick,
        idProblem: props.idProblem,
        date: date,
        comment: props.comment ? props.comment : "",
        grade: props.grade,
        stars: props.stars ? props.stars : 0,
        grades: props.grades
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.refresh(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.refresh(nextProps);
    }
  }, {
    key: 'onDateChanged',
    value: function onDateChanged(newDate) {
      this.setState({ date: newDate });
    }
  }, {
    key: 'onCommentChanged',
    value: function onCommentChanged(e) {
      this.setState({ comment: e.target.value });
    }
  }, {
    key: 'onStarsChanged',
    value: function onStarsChanged(stars, e) {
      this.setState({ stars: stars });
    }
  }, {
    key: 'onGradeChanged',
    value: function onGradeChanged(grade, e) {
      this.setState({ grade: grade });
    }
  }, {
    key: 'delete',
    value: function _delete(e) {
      var _this2 = this;

      (0, _api.postTicks)(true, this.state.idTick, this.state.idProblem, this.state.comment, this.state.date, this.state.stars, this.state.grade).then(function (response) {
        _this2.props.onHide();
      }).catch(function (error) {
        console.warn(error);
        alert(error.toString());
      });
    }
  }, {
    key: 'save',
    value: function save(e) {
      var _this3 = this;

      (0, _api.postTicks)(false, this.state.idTick, this.state.idProblem, this.state.comment, this.state.date, this.state.stars, this.state.grade).then(function (response) {
        _this3.props.onHide();
      }).catch(function (error) {
        console.warn(error);
        alert(error.toString());
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      var stars = "No stars";
      if (this.state) {
        if (this.state.stars === 1) {
          stars = _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Nice'
          );
        } else if (this.state.stars === 2) {
          stars = _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Very nice'
          );
        } else if (this.state.stars === 3) {
          stars = _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Fantastic!'
          );
        }
      }

      return _react2.default.createElement(
        _reactBootstrap.Modal,
        { show: this.props.show, onHide: this.props.onHide.bind(this) },
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          { closeButton: true },
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            null,
            'Tick'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          null,
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Date (yyyy-mm-dd)'
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(_reactInputCalendar2.default, { format: 'YYYY-MM-DD', computableFormat: 'YYYY-MM-DD', date: this.state && this.state.date, onChange: this.onDateChanged.bind(this) }),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { onClick: this.onDateChanged.bind(this, this.convertFromDateToString(yesterday)) },
                'Yesterday'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { onClick: this.onDateChanged.bind(this, this.convertFromDateToString(new Date())) },
                'Today'
              )
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Grade'
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
              _reactBootstrap.DropdownButton,
              { title: this.state && this.state.grade, id: 'bg-nested-dropdown' },
              this.state && this.state.grades && this.state.grades.map(function (g, i) {
                return _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { key: i, eventKey: i, onSelect: _this4.onGradeChanged.bind(_this4, g.grade) },
                  g.grade
                );
              })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Stars'
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
              _reactBootstrap.DropdownButton,
              { title: stars, id: 'bg-nested-dropdown' },
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: '0', onSelect: this.onStarsChanged.bind(this, 0) },
                'No stars'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: '1', onSelect: this.onStarsChanged.bind(this, 1) },
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                ' Nice'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: '2', onSelect: this.onStarsChanged.bind(this, 2) },
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                ' Very nice'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: '3', onSelect: this.onStarsChanged.bind(this, 3) },
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                ' Fantastic!'
              )
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Comment'
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, _defineProperty({ componentClass: 'textarea', placeholder: 'textarea', style: { height: '100px' }, value: this.state && this.state.comment, onChange: this.onCommentChanged.bind(this) }, 'placeholder', 'Comment'))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          null,
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.save.bind(this), bsStyle: 'success' },
              'Save'
            ),
            this.state && this.state.idTick > 1 ? _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.delete.bind(this), bsStyle: 'warning' },
              'Delete tick'
            ) : "",
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.props.onHide.bind(this) },
              'Close'
            )
          )
        )
      );
    }
  }, {
    key: 'convertFromDateToString',
    value: function convertFromDateToString(date) {
      var d = date.getDate();
      var m = date.getMonth() + 1;
      var y = date.getFullYear();
      return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }
  }]);

  return TickModal;
}(_react.Component);

exports.default = TickModal;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("react-input-calendar");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("create-react-class");

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(24);

var _express2 = _interopRequireDefault(_express);

var _cors = __webpack_require__(25);

var _cors2 = _interopRequireDefault(_cors);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _server = __webpack_require__(26);

var _reactRouterDom = __webpack_require__(4);

var _reactCookie = __webpack_require__(16);

var _serializeJavascript = __webpack_require__(27);

var _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);

var _App = __webpack_require__(28);

var _App2 = _interopRequireDefault(_App);

var _routes = __webpack_require__(18);

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.use((0, _cors2.default)());
app.use(_express2.default.static("public"));

app.get("*", function (req, res, next) {
  var activeRoute = _routes2.default.find(function (route) {
    return (0, _reactRouterDom.matchPath)(req.url, route);
  }) || {};

  var promise = activeRoute.fetchInitialData ? activeRoute.fetchInitialData(req.path) : Promise.resolve();

  promise.then(function (data) {
    var context = { data: data };

    var markup = (0, _server.renderToString)(_react2.default.createElement(
      _reactCookie.CookiesProvider,
      { cookies: req.universalCookies },
      _react2.default.createElement(
        _reactRouterDom.StaticRouter,
        { location: req.url, context: context },
        _react2.default.createElement(_App2.default, null)
      )
    ));

    res.send("\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <meta charset=\"utf-8\">\n          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n          <link rel=\"icon\" href=\"/favicon.ico\">\n          <meta name=\"author\" content=\"Jostein \xD8ygarden\">\n          <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/bootstrap.min.css\">\n          <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/react-input-calendar.css\">\n          <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/image-gallery.css\">\n          <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/react-bootstrap-table.css\">\n          <link rel=\"stylesheet\" type=\"text/css\" href=\"/css/buldreinfo.css\">\n          <script src=\"/bundle.js\" defer></script>\n          <script>window.__INITIAL_DATA__ = " + (0, _serializeJavascript2.default)(data) + "</script>\n        </head>\n\n        <body>\n          <div id=\"app\">" + markup + "</div>\n        </body>\n      </html>\n    ");
  }).catch(next);
});

app.listen(3000, function () {
  console.log("Server is listening on port: 3000");
});

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("react-dom/server");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("serialize-javascript");

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(17);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = __webpack_require__(4);

var _reactLoadable = __webpack_require__(29);

var _reactLoadable2 = _interopRequireDefault(_reactLoadable);

var _loading = __webpack_require__(30);

var _loading2 = _interopRequireDefault(_loading);

var _routes = __webpack_require__(18);

var _routes2 = _interopRequireDefault(_routes);

var _navigation = __webpack_require__(64);

var _navigation2 = _interopRequireDefault(_navigation);

var _fontawesomeSvgCore = __webpack_require__(68);

var _reactFontawesome = __webpack_require__(5);

var _freeSolidSvgIcons = __webpack_require__(69);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Used for navbar hack


_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faCamera);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faCheck);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faComment);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faEdit);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faHashtag);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faImage);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faLock);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faMapMarker);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faPlane);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faPlusSquare);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faSpinner);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faStar);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faStarHalf);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faTrash);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faUserSecret);
_fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faVideo);

var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'componentDidMount',

    // Temp fix to collapse nav-button on devices: https://github.com/lefant/react-bootstrap/commit/c68b46baea + https://github.com/react-bootstrap/react-router-bootstrap/issues/112#issuecomment-142599003
    value: function componentDidMount() {
      var navBar = _reactDom2.default.findDOMNode(this).querySelector('nav.navbar');
      var collapsibleNav = navBar.querySelector('div.navbar-collapse');
      var btnToggle = navBar.querySelector('button.navbar-toggle');

      navBar.addEventListener('click', function (evt) {
        if (evt.target.tagName !== 'A' || evt.target.classList.contains('dropdown-toggle') || !collapsibleNav.classList.contains('in')) {
          return;
        }
        btnToggle.click();
      }, false);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(_navigation2.default, null),
        _react2.default.createElement(
          'div',
          { className: 'container' },
          _react2.default.createElement(
            _reactRouterDom.Switch,
            null,
            _routes2.default.map(function (_ref) {
              var path = _ref.path,
                  exact = _ref.exact,
                  Component = _ref.component,
                  rest = _objectWithoutProperties(_ref, ['path', 'exact', 'component']);

              return _react2.default.createElement(_reactRouterDom.Route, { key: path, path: path, exact: exact, render: function render(props) {
                  return _react2.default.createElement(Component, _extends({}, props, rest));
                } });
            })
          ),
          _react2.default.createElement(
            'footer',
            { style: { paddingTop: '10px', marginTop: '40px', color: '#777', textAlign: 'center', borderTop: '1px solid #e5e5e5' } },
            'buldreinfo.com & brattelinjer.no \xA9 2006-2018'
          )
        )
      );
    }
  }]);

  return App;
}(_react.Component);

exports.default = App;

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("react-loadable");

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Loading = function (_Component) {
  _inherits(Loading, _Component);

  function Loading() {
    _classCallCheck(this, Loading);

    return _possibleConstructorReturn(this, (Loading.__proto__ || Object.getPrototypeOf(Loading)).apply(this, arguments));
  }

  _createClass(Loading, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'center',
        null,
        _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
      );
    }
  }]);

  return Loading;
}(_react.Component);

exports.default = Loading;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactBootstrap = __webpack_require__(1);

var _reactRouterBootstrap = __webpack_require__(9);

var _map = __webpack_require__(10);

var _map2 = _interopRequireDefault(_map);

var _gallery = __webpack_require__(13);

var _gallery2 = _interopRequireDefault(_gallery);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableRow = function (_Component) {
  _inherits(TableRow, _Component);

  function TableRow() {
    _classCallCheck(this, TableRow);

    return _possibleConstructorReturn(this, (TableRow.__proto__ || Object.getPrototypeOf(TableRow)).apply(this, arguments));
  }

  _createClass(TableRow, [{
    key: 'render',
    value: function render() {
      var comment = "";
      if (this.props.sector.comment) {
        if (this.props.sector.comment.length > 100) {
          var tooltip = _react2.default.createElement(
            _reactBootstrap.Tooltip,
            { id: this.props.sector.id },
            this.props.sector.comment
          );
          comment = _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            { key: this.props.sector.id, placement: 'top', overlay: tooltip },
            _react2.default.createElement(
              'span',
              null,
              this.props.sector.comment.substring(0, 100) + "..."
            )
          );
        } else {
          comment = this.props.sector.comment;
        }
      }
      return _react2.default.createElement(
        'tr',
        null,
        _react2.default.createElement(
          'td',
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/sector/' + this.props.sector.id },
            this.props.sector.name
          ),
          ' ',
          this.props.sector.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          this.props.sector.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
        ),
        _react2.default.createElement(
          'td',
          null,
          comment
        ),
        _react2.default.createElement(
          'td',
          null,
          this.props.sector.numProblems
        )
      );
    }
  }]);

  return TableRow;
}(_react.Component);

var Area = function (_Component2) {
  _inherits(Area, _Component2);

  function Area(props) {
    _classCallCheck(this, Area);

    var _this2 = _possibleConstructorReturn(this, (Area.__proto__ || Object.getPrototypeOf(Area)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this2.state = { data: data, tabIndex: 1 };
    return _this2;
  }

  _createClass(Area, [{
    key: 'refresh',
    value: function refresh(id) {
      var _this3 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this3.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.areaId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.areaId !== this.props.match.params.areaId) {
        this.refresh(this.props.match.params.areaId);
      }
    }
  }, {
    key: 'handleTabsSelection',
    value: function handleTabsSelection(key) {
      this.setState({ tabIndex: key });
    }
  }, {
    key: 'onRemoveMedia',
    value: function onRemoveMedia(idMediaToRemove) {
      var allMedia = this.state.data.media.filter(function (m) {
        return m.id != idMediaToRemove;
      });
      this.setState({ media: allMedia });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }
      var rows = this.state.data.sectors.map(function (sector, i) {
        return _react2.default.createElement(TableRow, { sector: sector, key: i });
      });
      var markers = this.state.data.sectors.filter(function (s) {
        return s.lat != 0 && s.lng != 0;
      }).map(function (s) {
        return {
          lat: s.lat,
          lng: s.lng,
          title: s.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
            scaledSizeW: 32,
            scaledSizeH: 32
          },
          url: '/sector/' + s.id
        };
      });
      var polygons = this.state.data.sectors.filter(function (s) {
        return s.polygonCoords;
      }).map(function (s) {
        var triangleCoords = s.polygonCoords.split(";").map(function (p, i) {
          var latLng = p.split(",");
          return { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
        });
        return {
          triangleCoords: triangleCoords,
          url: '/sector/' + s.id
        };
      });
      var defaultCenter = this.state.data.lat && this.state.data.lat > 0 ? { lat: this.state.data.lat, lng: this.state.data.lng } : this.state.data.metadata.defaultCenter;
      var defaultZoom = this.state.data.lat && this.state.data.lat > 0 ? 14 : this.state.data.metadata.defaultZoom;
      var map = markers.length > 0 || polygons.length > 0 ? _react2.default.createElement(_map2.default, { markers: markers, polygons: polygons, defaultCenter: defaultCenter, defaultZoom: defaultZoom }) : null;
      var gallery = this.state.data.media && this.state.data.media.length > 0 ? _react2.default.createElement(_gallery2.default, { alt: this.state.data.name, media: this.state.data.media, showThumbnails: this.state.data.media.length > 1, removeMedia: this.onRemoveMedia.bind(this) }) : null;
      var topoContent = null;
      if (map && gallery) {
        topoContent = _react2.default.createElement(
          _reactBootstrap.Tabs,
          { activeKey: this.state.tabIndex, animation: false, onSelect: this.handleTabsSelection.bind(this), id: 'area_tab', unmountOnExit: true },
          _react2.default.createElement(
            _reactBootstrap.Tab,
            { eventKey: 1, title: 'Topo' },
            this.state.tabIndex == 1 ? gallery : false
          ),
          _react2.default.createElement(
            _reactBootstrap.Tab,
            { eventKey: 2, title: 'Map' },
            this.state.tabIndex == 2 ? map : false
          )
        );
      } else if (map) {
        topoContent = map;
      } else if (gallery) {
        topoContent = gallery;
      }

      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'script',
            { type: 'application/ld+json' },
            JSON.stringify(this.state.data.metadata.jsonLd)
          ),
          _react2.default.createElement(
            'title',
            null,
            this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: this.state.data.metadata.description })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _auth2.default.isAdmin() ? _react2.default.createElement(
            'div',
            { style: { float: 'right' } },
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.OverlayTrigger,
                { placement: 'top', overlay: _react2.default.createElement(
                    _reactBootstrap.Tooltip,
                    { id: -1 },
                    'Add sector'
                  ) },
                _react2.default.createElement(
                  _reactRouterBootstrap.LinkContainer,
                  { to: { pathname: '/sector/edit/-1', query: { idArea: this.state.data.id, lat: this.state.data.lat, lng: this.state.data.lng } } },
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsStyle: 'primary', bsSize: 'xsmall' },
                    _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'plus-square', inverse: true })
                  )
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.OverlayTrigger,
                { placement: 'top', overlay: _react2.default.createElement(
                    _reactBootstrap.Tooltip,
                    { id: this.state.data.id },
                    'Edit area'
                  ) },
                _react2.default.createElement(
                  _reactRouterBootstrap.LinkContainer,
                  { to: { pathname: '/area/edit/' + this.state.data.id, query: { lat: this.state.data.lat, lng: this.state.data.lng } } },
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsStyle: 'primary', bsSize: 'xsmall' },
                    _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'edit', inverse: true })
                  )
                )
              )
            )
          ) : null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/browse' },
            'Browse'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            this.state.data.name
          ),
          ' ',
          this.state.data.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          this.state.data.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
        ),
        topoContent,
        this.state.data.comment ? _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: this.state.data.comment } })
        ) : null,
        _react2.default.createElement(
          _reactBootstrap.Table,
          { striped: true, condensed: true, hover: true },
          _react2.default.createElement(
            'thead',
            null,
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement(
                'th',
                null,
                'Name'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Description'
              ),
              _react2.default.createElement(
                'th',
                null,
                '#problems'
              )
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            rows
          )
        )
      );
    }
  }]);

  return Area;
}(_react.Component);

exports.default = Area;

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = require("react-google-maps/lib/components/addons/MarkerClusterer");

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = require("react-image-gallery");

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = require("react-player");

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = require("object-fit-images");

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouter = __webpack_require__(7);

var _reactBootstrap = __webpack_require__(1);

var _imageUpload = __webpack_require__(12);

var _imageUpload2 = _interopRequireDefault(_imageUpload);

var _reactGoogleMaps = __webpack_require__(11);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GettingStartedGoogleMap = (0, _reactGoogleMaps.withScriptjs)((0, _reactGoogleMaps.withGoogleMap)(function (props) {
  return _react2.default.createElement(
    _reactGoogleMaps.GoogleMap,
    {
      defaultZoom: props.defaultZoom,
      defaultCenter: props.defaultCenter,
      defaultMapTypeId: google.maps.MapTypeId.TERRAIN,
      onClick: props.onClick.bind(undefined) },
    props.markers
  );
}));

var AreaEdit = function (_Component) {
  _inherits(AreaEdit, _Component);

  function AreaEdit(props) {
    _classCallCheck(this, AreaEdit);

    var _this = _possibleConstructorReturn(this, (AreaEdit.__proto__ || Object.getPrototypeOf(AreaEdit)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(AreaEdit, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      if (!_auth2.default.isAdmin()) {
        this.setState({ pushUrl: "/login", error: null });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.areaId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.areaId !== this.props.match.params.areaId) {
        this.refresh(this.props.match.params.areaId);
      }
    }
  }, {
    key: 'refresh',
    value: function refresh(id) {
      var _this2 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this2.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'onNameChanged',
    value: function onNameChanged(e) {
      this.setState({ name: e.target.value });
    }
  }, {
    key: 'onVisibilityChanged',
    value: function onVisibilityChanged(visibility, e) {
      this.setState({ visibility: visibility });
    }
  }, {
    key: 'onCommentChanged',
    value: function onCommentChanged(e) {
      this.setState({ comment: e.target.value });
    }
  }, {
    key: 'onNewMediaChanged',
    value: function onNewMediaChanged(newMedia) {
      this.setState({ newMedia: newMedia });
    }
  }, {
    key: 'save',
    value: function save(event) {
      var _this3 = this;

      event.preventDefault();
      this.setState({ isSaving: true });
      var newMedia = this.state.data.newMedia.map(function (m) {
        return { name: m.file.name.replace(/[^-a-z0-9.]/ig, '_'), photographer: m.photographer, inPhoto: m.inPhoto };
      });
      (0, _api.postArea)(this.state.data.id, this.state.data.visibility, this.state.data.name, this.state.data.comment, this.state.data.lat, this.state.data.lng, newMedia).then(function (response) {
        _this3.setState({ pushUrl: "/area/" + response.id });
      }).catch(function (error) {
        console.warn(error);
        _this3.setState({ error: error });
      });
    }
  }, {
    key: 'onMarkerClick',
    value: function onMarkerClick(event) {
      this.setState({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  }, {
    key: 'onCancel',
    value: function onCancel() {
      window.history.back();
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.error) {
        return _react2.default.createElement(
          'h3',
          null,
          this.state.error.toString()
        );
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.areaId) {
        return _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(
            'h3',
            null,
            'Invalid action...'
          )
        );
      } else if (!this.state.data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }

      var visibilityText = 'Visible for everyone';
      if (this.state.data.visibility === 1) {
        visibilityText = 'Only visible for administrators';
      } else if (this.state.data.visibility === 2) {
        visibilityText = 'Only visible for super administrators';
      }
      var defaultCenter = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat) > 0 ? { lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng) } : this.state.data.metadata.defaultCenter;
      var defaultZoom = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat) > 0 ? 8 : this.state.data.metadata.defaultZoom;
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            this.state.data.metadata.title
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement(
            'form',
            { onSubmit: this.save.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsName' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Area name'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.data.name, placeholder: 'Enter name', onChange: this.onNameChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsComment' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Comment'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { style: { height: '100px' }, componentClass: 'textarea', placeholder: 'Enter comment', value: this.state.data.comment, onChange: this.onCommentChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsVisibility' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Visibility'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                _reactBootstrap.DropdownButton,
                { title: visibilityText, id: 'bg-nested-dropdown' },
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '0', onSelect: this.onVisibilityChanged.bind(this, 0) },
                  'Visible for everyone'
                ),
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '1', onSelect: this.onVisibilityChanged.bind(this, 1) },
                  'Only visible for administrators'
                ),
                _auth2.default.isSuperAdmin() && _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '2', onSelect: this.onVisibilityChanged.bind(this, 2) },
                  'Only visible for super administrators'
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMedia' },
              _react2.default.createElement(_imageUpload2.default, { onMediaChanged: this.onNewMediaChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMap' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Click to mark area center on map'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                'section',
                { style: { height: '600px' } },
                _react2.default.createElement(GettingStartedGoogleMap, {
                  googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp',
                  loadingElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  containerElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  mapElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  defaultZoom: defaultZoom,
                  defaultCenter: defaultCenter,
                  onClick: this.onMarkerClick.bind(this),
                  markers: this.state.data.lat != 0 && this.state.data.lng != 0 ? _react2.default.createElement(_reactGoogleMaps.Marker, { position: { lat: this.state.data.lat, lng: this.state.data.lng } }) : ""
                })
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', onClick: this.onCancel.bind(this) },
                'Cancel'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success', disabled: this.state.isSaving },
                this.state.isSaving ? 'Saving...' : 'Save area'
              )
            )
          )
        )
      );
    }
  }]);

  return AreaEdit;
}(_react.Component);

exports.default = AreaEdit;

/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = require("react-dropzone");

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactBootstrap = __webpack_require__(1);

var _reactBootstrapTable = __webpack_require__(14);

var _reactRouterBootstrap = __webpack_require__(9);

var _map = __webpack_require__(10);

var _map2 = _interopRequireDefault(_map);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Browse = function (_Component) {
  _inherits(Browse, _Component);

  function Browse(props) {
    _classCallCheck(this, Browse);

    var _this = _possibleConstructorReturn(this, (Browse.__proto__ || Object.getPrototypeOf(Browse)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(Browse, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      navigator.geolocation.getCurrentPosition(function (position) {
        _this2.setState({ currLat: position.coords.latitude, currLng: position.coords.longitude });
      });
      if (!this.state.data) {
        this.props.fetchInitialData().then(function (data) {
          return _this2.setState(function () {
            return { data: data };
          });
        });
      }
    }
  }, {
    key: 'formatName',
    value: function formatName(cell, row) {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/area/' + row.id },
          row.name
        ),
        ' ',
        row.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
        row.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
      );
    }
  }, {
    key: 'toRad',
    value: function toRad(value) {
      return value * Math.PI / 180;
    }
  }, {
    key: 'calcCrow',
    value: function calcCrow(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = this.toRad(lat2 - lat1);
      var dLon = this.toRad(lon2 - lon1);
      var lat1 = this.toRad(lat1);
      var lat2 = this.toRad(lat2);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d;
    }
  }, {
    key: 'formatDistance',
    value: function formatDistance(cell, row) {
      if (this.state.currLat > 0 && this.state.currLng > 0 && row.lat > 0 && row.lng > 0) {
        return this.calcCrow(this.state.currLat, this.state.currLng, row.lat, row.lng).toFixed(1) + " km";
      }
      return "";
    }
  }, {
    key: 'sortDistance',
    value: function sortDistance(a, b, order) {
      var x = this.state.currLat > 0 && this.state.currLng > 0 && a.lat > 0 && a.lng > 0 ? this.calcCrow(this.state.currLat, this.state.currLng, a.lat, a.lng) : 0;
      var y = this.state.currLat > 0 && this.state.currLng > 0 && b.lat > 0 && b.lng > 0 ? this.calcCrow(this.state.currLat, this.state.currLng, b.lat, b.lng) : 0;
      if (order === 'asc') {
        if (x < y) return -1;else if (x > y) return 1;
        return 0;
      } else {
        if (x < y) return 1;else if (x > y) return -1;
        return 0;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state || !this.state.data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }
      var markers = this.state.data.areas.filter(function (a) {
        return a.lat != 0 && a.lng != 0;
      }).map(function (a) {
        return {
          lat: a.lat,
          lng: a.lng,
          title: a.name,
          label: a.name.charAt(0),
          url: '/area/' + a.id
        };
      });
      var map = markers.length > 0 ? _react2.default.createElement(_map2.default, { markers: markers, defaultCenter: this.state.data.metadata.defaultCenter, defaultZoom: this.state.data.metadata.defaultZoom }) : null;
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: this.state.data.metadata.description })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _auth2.default.isAdmin() ? _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            { placement: 'top', overlay: _react2.default.createElement(
                _reactBootstrap.Tooltip,
                { id: -1 },
                'Add area'
              ) },
            _react2.default.createElement(
              'div',
              { style: { float: 'right' } },
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/area/edit/-1' },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsStyle: 'primary', bsSize: 'xsmall' },
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'plus-square', inverse: true })
                )
              )
            )
          ) : null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            'Browse'
          )
        ),
        map,
        _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          {
            data: this.state.data.areas,
            condensed: true,
            hover: true,
            columnFilter: false },
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'id', isKey: true, hidden: true },
            'id'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'name', dataSort: true, dataFormat: this.formatName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Name'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numSectors', dataSort: true, dataAlign: 'center', width: '50' },
            '#sectors'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numProblems', dataSort: true, dataAlign: 'center', width: '50' },
            '#problems'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'distance', dataSort: true, dataFormat: this.formatDistance.bind(this), sortFunc: this.sortDistance.bind(this), dataAlign: 'center', width: '60' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'plane' })
          )
        )
      );
    }
  }]);

  return Browse;
}(_react.Component);

exports.default = Browse;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactBootstrap = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Ethics = function (_Component) {
  _inherits(Ethics, _Component);

  function Ethics(props) {
    _classCallCheck(this, Ethics);

    var _this = _possibleConstructorReturn(this, (Ethics.__proto__ || Object.getPrototypeOf(Ethics)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(Ethics, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (!this.state.data) {
        this.props.fetchInitialData().then(function (data) {
          return _this2.setState(function () {
            return { data: data };
          });
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          this.state.data && _react2.default.createElement(
            'title',
            null,
            "Ethics | " + this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: "Ethics and privacy policy" })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            'Ethics'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          'If you\'re going out climbing, we ask you to please follow these guidelines for the best possible bouldering experience now, and for the future generations of climbers.',
          _react2.default.createElement('br', null),
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'ul',
            null,
            _react2.default.createElement(
              'li',
              null,
              'Show respect for the landowners, issue care and be polite.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Follow paths where possible, and do not cross cultivated land.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Take your trash back with you.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Park with reason, and think of others. Make room for potential tractors and such if necessary.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Start where directed, and don\'t hesitate to ask if your unsure.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Sit start means that the behind should be the last thing to leave the ground/crashpad.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'No chipping allowed.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Remember climbing can be dangerous and always involves risk. Your safety is your own responsibility.'
            ),
            _react2.default.createElement(
              'li',
              null,
              'Use common sense!'
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement(
            'h3',
            null,
            'Privacy Policy'
          ),
          'We respect your privacy and handle your data with the care that we would expect our own data to be handled. We will never sell or pass on your information to any third party. You can delete any of your profile information at any time, ',
          _react2.default.createElement(
            'a',
            { href: 'mailto:jostein.oygarden@gmail.com' },
            'send us an e-mail'
          ),
          ' with the data you want to delete. The Android app requests permissions like accounts and camera. Accounts are used to give you correct data according to your permissions in buldreinfo. The camera can be used inside the app to append new images to existing bouldering problems (pending approval by an administrator).'
        )
      );
    }
  }]);

  return Ethics;
}(_react.Component);

exports.default = Ethics;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactRouterBootstrap = __webpack_require__(9);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _map = __webpack_require__(10);

var _map2 = _interopRequireDefault(_map);

var _reactBootstrap = __webpack_require__(1);

var _reactBootstrapTable = __webpack_require__(14);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Finder = function (_Component) {
  _inherits(Finder, _Component);

  function Finder(props) {
    _classCallCheck(this, Finder);

    var _this = _possibleConstructorReturn(this, (Finder.__proto__ || Object.getPrototypeOf(Finder)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = {
      data: data,
      tabIndex: 1,
      currLat: 0,
      currLng: 0
    };
    return _this;
  }

  _createClass(Finder, [{
    key: 'toRad',
    value: function toRad(value) {
      return value * Math.PI / 180;
    }
  }, {
    key: 'calcCrow',
    value: function calcCrow(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = this.toRad(lat2 - lat1);
      var dLon = this.toRad(lon2 - lon1);
      var lat1 = this.toRad(lat1);
      var lat2 = this.toRad(lat2);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d;
    }
  }, {
    key: 'refresh',
    value: function refresh(grade) {
      var _this2 = this;

      this.props.fetchInitialData(grade).then(function (data) {
        return _this2.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      if (!this.state.data) {
        this.refresh(this.props.match.params.grade);
      }
      navigator.geolocation.getCurrentPosition(function (position) {
        _this3.setState({ currLat: position.coords.latitude, currLng: position.coords.longitude });
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.grade !== this.props.match.params.grade) {
        this.refresh(this.props.match.params.grade);
      }
    }
  }, {
    key: 'handleTabsSelection',
    value: function handleTabsSelection(key) {
      this.setState({ tabIndex: key });
    }
  }, {
    key: 'trClassFormat',
    value: function trClassFormat(rowData, rIndex) {
      return rowData.ticked ? 'success' : '';
    }
  }, {
    key: 'formatAreaName',
    value: function formatAreaName(cell, row) {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/area/' + row.areaId },
          row.areaName
        ),
        ' ',
        row.areaVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
        row.areaVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
      );
    }
  }, {
    key: 'formatSectorName',
    value: function formatSectorName(cell, row) {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/sector/' + row.sectorId },
          row.sectorName
        ),
        ' ',
        row.sectorVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
        row.sectorVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
      );
    }
  }, {
    key: 'formatName',
    value: function formatName(cell, row) {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/problem/' + row.id },
          row.name
        ),
        ' ',
        row.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
        row.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
      );
    }
  }, {
    key: 'formatType',
    value: function formatType(cell, row) {
      var typeImg;
      switch (row.t.id) {
        case 2:
          typeImg = _react2.default.createElement('img', { height: '20', src: '/jpg/bolt.jpg', alt: 'Bolt' });break;
        case 3:
          typeImg = _react2.default.createElement('img', { height: '20', src: '/jpg/trad.jpg', alt: 'Trad' });break;
        case 4:
          typeImg = _react2.default.createElement('img', { height: '20', src: '/jpg/mixed.jpg', alt: 'Mixed' });break;
      }
      return _react2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: 'top', overlay: _react2.default.createElement(
            _reactBootstrap.Popover,
            { id: row.t.id, title: 'Type' },
            ' ',
            row.t.type + " - " + row.t.subType
          ) },
        typeImg
      );
    }
  }, {
    key: 'formatFa',
    value: function formatFa(cell, row) {
      var fa = row.fa ? row.fa.map(function (u, i) {
        var tooltip = _react2.default.createElement(
          _reactBootstrap.Tooltip,
          { id: i },
          u.firstname,
          ' ',
          u.surname
        );
        return _react2.default.createElement(
          _reactBootstrap.OverlayTrigger,
          { key: i, placement: 'top', overlay: tooltip },
          _react2.default.createElement(
            _reactRouterBootstrap.LinkContainer,
            { key: i, to: '/user/' + u.id },
            _react2.default.createElement(
              _reactBootstrap.Button,
              { key: i, bsStyle: 'default' },
              u.initials
            )
          )
        );
      }) : [];
      return _react2.default.createElement(
        _reactBootstrap.ButtonToolbar,
        null,
        _react2.default.createElement(
          _reactBootstrap.ButtonGroup,
          { bsSize: 'xsmall' },
          fa
        )
      );
    }
  }, {
    key: 'formatStars',
    value: function formatStars(cell, row) {
      var stars = null;
      if (row.stars === 0.5) {
        stars = _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' });
      } else if (row.stars === 1.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 2 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else if (row.stars === 1.5) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 3 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
        );
      } else if (row.stars === 2.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 4 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else if (row.stars === 2.5) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 5 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
        );
      } else if (row.stars === 3.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 6 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else {
        return "";
      }
      return _react2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: 'top', overlay: _react2.default.createElement(
            _reactBootstrap.Popover,
            { id: 0, title: 'Guidelines' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Nice',
            _react2.default.createElement('br', null),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Very nice',
            _react2.default.createElement('br', null),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Fantastic!'
          ) },
        stars
      );
    }
  }, {
    key: 'formatNumImages',
    value: function formatNumImages(cell, row) {
      return row.media ? row.media.filter(function (m) {
        return m.idType === 1;
      }).length : 0;
    }
  }, {
    key: 'formatNumMovies',
    value: function formatNumMovies(cell, row) {
      return row.media ? row.media.filter(function (m) {
        return m.idType === 2;
      }).length : 0;
    }
  }, {
    key: 'formatDistance',
    value: function formatDistance(cell, row) {
      if (this.state.currLat > 0 && this.state.currLng > 0 && row.lat > 0 && row.lng > 0) {
        return this.calcCrow(this.state.currLat, this.state.currLng, row.lat, row.lng).toFixed(1) + " km";
      }
      return "";
    }
  }, {
    key: 'sortFa',
    value: function sortFa(a, b, order) {
      var x = a.fa ? a.fa[0].initials : "";
      var y = b.fa ? b.fa[0].initials : "";
      if (order === 'asc') return x.localeCompare(y);
      return y.localeCompare(x);
    }
  }, {
    key: 'sortNumImages',
    value: function sortNumImages(a, b, order) {
      var x = a.media ? a.media.filter(function (m) {
        return m.idType === 1;
      }).length : 0;
      var y = b.media ? b.media.filter(function (m) {
        return m.idType === 1;
      }).length : 0;
      if (order === 'asc') {
        if (x < y) return -1;else if (x > y) return 1;
        return 0;
      } else {
        if (x < y) return 1;else if (x > y) return -1;
        return 0;
      }
    }
  }, {
    key: 'sortNumMovies',
    value: function sortNumMovies(a, b, order) {
      var x = a.media ? a.media.filter(function (m) {
        return m.idType === 2;
      }).length : 0;
      var y = b.media ? b.media.filter(function (m) {
        return m.idType === 2;
      }).length : 0;
      if (order === 'asc') {
        if (x < y) return -1;else if (x > y) return 1;
        return 0;
      } else {
        if (x < y) return 1;else if (x > y) return -1;
        return 0;
      }
    }
  }, {
    key: 'sortDistance',
    value: function sortDistance(a, b, order) {
      var x = this.state.currLat > 0 && this.state.currLng > 0 && a.lat > 0 && a.lng > 0 ? this.calcCrow(this.state.currLat, this.state.currLng, a.lat, a.lng) : 0;
      var y = this.state.currLat > 0 && this.state.currLng > 0 && b.lat > 0 && b.lng > 0 ? this.calcCrow(this.state.currLat, this.state.currLng, b.lat, b.lng) : 0;
      if (order === 'asc') {
        if (x < y) return -1;else if (x > y) return 1;
        return 0;
      } else {
        if (x < y) return 1;else if (x > y) return -1;
        return 0;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.data || !this.state.data.problems) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }
      var markers = this.state.data.problems.filter(function (p) {
        return p.lat != 0 && p.lng != 0;
      }).map(function (p) {
        return {
          lat: p.lat,
          lng: p.lng,
          title: p.nr + " - " + p.name + " [" + p.grade + "]",
          label: p.name.charAt(0),
          url: '/problem/' + p.id,
          icon: {
            url: p.ticked ? 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-a.png' : 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png',
            labelOriginX: 11,
            labelOriginY: 13
          }
        };
      });
      var map = markers.length > 0 ? _react2.default.createElement(_map2.default, { markers: markers, defaultCenter: this.state.data.metadata.defaultCenter, defaultZoom: 7 }) : null;
      var table = null;
      if (!this.state.data.metadata.isBouldering) {
        table = _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          {
            data: this.state.data.problems,
            trClassName: this.trClassFormat.bind(this),
            condensed: true,
            hover: true,
            columnFilter: false },
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'id', isKey: true, hidden: true },
            'id'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'areaName', dataSort: true, dataFormat: this.formatAreaName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Area'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'sectorName', dataSort: true, dataFormat: this.formatSectorName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Sector'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'name', dataSort: true, dataFormat: this.formatName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Name'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'type', dataFormat: this.formatType.bind(this), dataAlign: 'center', width: '70' },
            'Type'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'grade', dataSort: true, dataAlign: 'center', width: '70' },
            'Grade'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'fa', dataSort: true, dataFormat: this.formatFa.bind(this), sortFunc: this.sortFa.bind(this), dataAlign: 'center', width: '70' },
            'FA'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numTicks', dataSort: true, dataAlign: 'center', width: '50' },
            'Ticks'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'stars', dataSort: true, dataFormat: this.formatStars.bind(this), dataAlign: 'center', width: '70' },
            'Stars'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numImages', dataSort: true, dataFormat: this.formatNumImages.bind(this), sortFunc: this.sortNumImages.bind(this), dataAlign: 'center', width: '50' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'camera' })
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numMovies', dataSort: true, dataFormat: this.formatNumMovies.bind(this), sortFunc: this.sortNumMovies.bind(this), dataAlign: 'center', width: '50' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'video' })
          )
        );
      } else {
        table = _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          {
            data: this.state.data.problems,
            trClassName: this.trClassFormat.bind(this),
            condensed: true,
            hover: true,
            columnFilter: false },
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'id', isKey: true, hidden: true },
            'id'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'areaName', dataSort: true, dataFormat: this.formatAreaName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Area'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'sectorName', dataSort: true, dataFormat: this.formatSectorName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Sector'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'name', dataSort: true, dataFormat: this.formatName.bind(this), width: '150', filter: { type: "TextFilter", placeholder: "Filter" } },
            'Name'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'grade', dataSort: true, dataAlign: 'center', width: '70' },
            'Grade'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'fa', dataSort: true, dataFormat: this.formatFa.bind(this), sortFunc: this.sortFa.bind(this), dataAlign: 'center', width: '70' },
            'FA'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numTicks', dataSort: true, dataAlign: 'center', width: '50' },
            'Ticks'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'stars', dataSort: true, dataFormat: this.formatStars.bind(this), dataAlign: 'center', width: '70' },
            'Stars'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numImages', dataSort: true, dataFormat: this.formatNumImages.bind(this), sortFunc: this.sortNumImages.bind(this), dataAlign: 'center', width: '50' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'camera' })
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'numMovies', dataSort: true, dataFormat: this.formatNumMovies.bind(this), sortFunc: this.sortNumMovies.bind(this), dataAlign: 'center', width: '50' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'video' })
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'distance', dataSort: true, dataFormat: this.formatDistance.bind(this), sortFunc: this.sortDistance.bind(this), dataAlign: 'center', width: '60' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'plane' })
          )
        );
      }

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: this.state.data.metadata.description })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            'Finder [',
            this.state.data.grade,
            '] (problems: ',
            this.state.data.problems.length,
            ')'
          )
        ),
        map,
        table
      );
    }
  }]);

  return Finder;
}(_react.Component);

exports.default = Finder;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactBootstrap = __webpack_require__(1);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _textbox = __webpack_require__(42);

var _textbox2 = _interopRequireDefault(_textbox);

var _imagebox = __webpack_require__(43);

var _imagebox2 = _interopRequireDefault(_imagebox);

var _linkbox = __webpack_require__(44);

var _linkbox2 = _interopRequireDefault(_linkbox);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var style = { padding: 0, textAlign: 'left' };
var styleNw = { padding: 0, textAlign: 'left', whiteSpace: 'nowrap' };

var Index = function (_Component) {
  _inherits(Index, _Component);

  function Index(props) {
    _classCallCheck(this, Index);

    var _this = _possibleConstructorReturn(this, (Index.__proto__ || Object.getPrototypeOf(Index)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(Index, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (!this.state.data) {
        this.props.fetchInitialData().then(function (data) {
          return _this2.setState(function () {
            return { data: data };
          });
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state || !this.state.data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }

      var newestProblems = this.state.data.fas.map(function (x, i) {
        return _react2.default.createElement(
          'p',
          { key: i },
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + x.idProblem },
            x.problem
          ),
          ' ',
          x.grade,
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'small',
            { style: { color: '#777' } },
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/area/' + x.idArea, style: { color: '#777' } },
              x.area
            ),
            ' / ',
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/sector/' + x.idSector, style: { color: '#777' } },
              x.sector
            ),
            ' ',
            x.date
          )
        );
      });

      var latestAscents = this.state.data.ascents.map(function (x, i) {
        return _react2.default.createElement(
          'p',
          { key: i },
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + x.idProblem },
            x.problem
          ),
          ' ',
          x.grade,
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'small',
            { style: { color: '#777' } },
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/user/' + x.idUser, style: { color: '#777' } },
              x.user
            ),
            ' ',
            x.date
          )
        );
      });

      var newestMedia = this.state.data.medias.map(function (x, i) {
        var icon = x.type === 'image' ? _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'camera' }) : _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'video' });
        return _react2.default.createElement(
          'p',
          { key: i },
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + x.idProblem },
            x.problem
          ),
          ' ',
          _react2.default.createElement(
            'small',
            null,
            x.grade
          ),
          ' ',
          icon
        );
      });

      var latestComments = this.state.data.comments.map(function (x, i) {
        return _react2.default.createElement(
          'p',
          { key: i },
          _react2.default.createElement(
            'small',
            null,
            x.date
          ),
          ' ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + x.idProblem },
            x.problem
          )
        );
      });

      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: this.state.data.metadata.description })
        ),
        _react2.default.createElement(
          _reactBootstrap.Grid,
          null,
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            _react2.default.createElement(
              _reactBootstrap.Well,
              { style: { textAlign: 'center' } },
              'Total: ',
              this.state.data.numProblems,
              ' (',
              this.state.data.numProblemsWithCoordinates,
              ' with coordinates',
              this.state.data.numProblemsWithTopo > 0 ? ", " + this.state.data.numProblemsWithTopo + " on topo" : "",
              ') | Public ascents: ',
              this.state.data.numTicks,
              ' | Images: ',
              this.state.data.numImages,
              ' | Ascents on video: ',
              this.state.data.numMovies
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 8, md: 9, style: { paddingLeft: '3px', paddingRight: '3px' } },
              _react2.default.createElement(_imagebox2.default, { data: this.state.data.randomMedia })
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 4, md: 3, style: { paddingLeft: '3px', paddingRight: '3px' } },
              _react2.default.createElement(_linkbox2.default, { showLogoPlay: this.state.data.showLogoPlay, showLogoSis: this.state.data.showLogoSis, showLogoBrv: this.state.data.showLogoBrv })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6, lg: 3, style: { paddingLeft: '3px', paddingRight: '3px' } },
              _react2.default.createElement(_textbox2.default, { title: 'Newest', data: newestProblems })
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6, lg: 3, style: { paddingLeft: '3px', paddingRight: '3px' } },
              _react2.default.createElement(_textbox2.default, { title: 'Latest ascents', data: latestAscents })
            ),
            _react2.default.createElement(_reactBootstrap.Clearfix, { visibleXsBlock: true }),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6, lg: 3, style: { paddingLeft: '3px', paddingRight: '3px' } },
              _react2.default.createElement(_textbox2.default, { title: 'Newest media', data: newestMedia })
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6, lg: 3, style: { paddingLeft: '3px', paddingRight: '3px' } },
              _react2.default.createElement(_textbox2.default, { title: 'Latest comments', data: latestComments })
            )
          )
        )
      );
    }
  }]);

  return Index;
}(_react.Component);

exports.default = Index;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextBox = function (_Component) {
  _inherits(TextBox, _Component);

  function TextBox(props) {
    _classCallCheck(this, TextBox);

    var _this = _possibleConstructorReturn(this, (TextBox.__proto__ || Object.getPrototypeOf(TextBox)).call(this, props));

    _this.state = {
      showAll: false,
      btnLabel: 'More'
    };
    return _this;
  }

  _createClass(TextBox, [{
    key: 'handleOnClick',
    value: function handleOnClick(e) {
      e.preventDefault();
      if (this.state.showAll === true) {
        this.setState({ showAll: false, btnLabel: 'More' });
      } else {
        this.setState({ showAll: true, btnLabel: 'Less' });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var content = this.state.showAll === true ? this.props.data : this.props.data.map(function (x, i) {
        if (i < 10) return x;
      });
      return _react2.default.createElement(
        'div',
        { style: {
            backgroundColor: '#FFF',
            position: 'relative',
            padding: '45px 15px 15px',
            borderColor: '#e3e3e3',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '4px'
          } },
        content,
        _react2.default.createElement(
          'div',
          { style: {
              position: 'absolute',
              top: '15px',
              left: '15px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#959595',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            } },
          this.props.title
        ),
        _react2.default.createElement(
          'a',
          { style: {
              float: 'right',
              display: 'inline-block',
              position: 'relative',
              right: '-16px',
              top: '15px',
              background: '#FFF',
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
              border: '1px solid #e3e3e3',
              borderTop: 'none',
              padding: '4px 8px',
              marginBottom: '20px'
            }, href: '#', onClick: this.handleOnClick.bind(this) },
          this.state.btnLabel
        )
      );
    }
  }]);

  return TextBox;
}(_react.Component);

exports.default = TextBox;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(4);

var _reactBootstrap = __webpack_require__(1);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageBox = function (_Component) {
  _inherits(ImageBox, _Component);

  function ImageBox(props) {
    _classCallCheck(this, ImageBox);

    return _possibleConstructorReturn(this, (ImageBox.__proto__ || Object.getPrototypeOf(ImageBox)).call(this, props));
  }

  _createClass(ImageBox, [{
    key: 'render',
    value: function render() {
      var txt = null;
      if (!this.props || !this.props.data) {
        return _react2.default.createElement(
          _reactBootstrap.Well,
          { style: {
              marginBottom: '15px',
              textAlign: 'center'
            } },
          'No data'
        );
      }
      if (this.props.data.inPhoto) {
        txt = _react2.default.createElement(
          'i',
          null,
          'Photographer: ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/user/' + this.props.data.idCreator },
            this.props.data.creator
          ),
          ', in photo: ',
          this.props.data.inPhoto
        );
      } else {
        txt = _react2.default.createElement(
          'i',
          null,
          'Photographer: ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/user/' + this.props.data.idCreator },
            this.props.data.creator
          )
        );
      }
      return _react2.default.createElement(
        _reactBootstrap.Well,
        { style: {
            marginBottom: '15px',
            textAlign: 'center'
          } },
        _react2.default.createElement(
          'h4',
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + this.props.data.idProblem },
            this.props.data.problem
          ),
          ' ',
          this.props.data.grade
        ),
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/problem/' + this.props.data.idProblem },
          _react2.default.createElement('img', { style: { maxWidth: '100%' }, src: _config2.default.getUrl('images?id=' + this.props.data.idMedia + '&targetHeight=480'), alt: this.props.data.problem })
        ),
        _react2.default.createElement('br', null),
        txt
      );
    }
  }]);

  return ImageBox;
}(_react.Component);

exports.default = ImageBox;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(4);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LinkBox = function (_Component) {
  _inherits(LinkBox, _Component);

  function LinkBox(props) {
    _classCallCheck(this, LinkBox);

    return _possibleConstructorReturn(this, (LinkBox.__proto__ || Object.getPrototypeOf(LinkBox)).call(this, props));
  }

  _createClass(LinkBox, [{
    key: 'render',
    value: function render() {
      var styleSis = {
        marginBottom: '10px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        paddingLeft: '10px',
        paddingRight: '10px',
        maxWidth: '100%',
        backgroundColor: '#00A0E0'
      };
      var styleBrv = {
        marginBottom: '10px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        paddingLeft: '10px',
        paddingRight: '10px',
        maxWidth: '100%',
        backgroundColor: '#FFFFFF'
      };
      var styleGoogle = { maxWidth: '100%' };
      return _react2.default.createElement(
        'div',
        null,
        this.props.showLogoPlay && _react2.default.createElement(
          'a',
          { href: 'https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1', rel: 'noopener', target: '_blank' },
          _react2.default.createElement('img', { style: styleGoogle, alt: 'Get it on Google Play', src: 'https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png' })
        ),
        this.props.showLogoSis && _react2.default.createElement(
          'a',
          { href: "http://sissportssenter.no/", rel: 'noopener', target: '_blank' },
          _react2.default.createElement('img', { style: styleSis, src: "/png/sis-sportssenter.png", alt: 'SiS Sportssenter' })
        ),
        this.props.showLogoBrv && _react2.default.createElement(
          'a',
          { href: "http://brv.no/", rel: 'noopener', target: '_blank' },
          _react2.default.createElement('img', { style: styleBrv, src: "/png/brv.png", alt: 'Bratte Rogalands venner' })
        )
      );
    }
  }]);

  return LinkBox;
}(_react.Component);

exports.default = LinkBox;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _propTypes = __webpack_require__(15);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _reactRouterBootstrap = __webpack_require__(9);

var _reactBootstrap = __webpack_require__(1);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Login = function (_Component) {
  _inherits(Login, _Component);

  function Login(props) {
    _classCallCheck(this, Login);

    var _this = _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data, message: null, username: '', password: '' };
    return _this;
  }

  _createClass(Login, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (!this.state.data) {
        this.props.fetchInitialData().then(function (data) {
          return _this2.setState(function () {
            return { data: data };
          });
        });
      }
    }
  }, {
    key: 'validateEmail',
    value: function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
  }, {
    key: 'forgotPasswordClick',
    value: function forgotPasswordClick(event) {
      var _this3 = this;

      if (!this.state.username) {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Please fill username and click Forgot password again.'
          ) });
      } else if (!this.validateEmail(this.state.username)) {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'No email address registered on "',
            this.state.username,
            '". Contact Jostein (jostein.oygarden@gmail.com) to recover password.'
          ) });
      } else {
        (0, _api.getUserForgotPassword)(this.state.username).then(function (response) {
          _this3.setState({ message: _react2.default.createElement(
              _reactBootstrap.Panel,
              { bsStyle: 'success' },
              'An e-mail with instructions to reset your password is sent to "',
              _this3.state.username,
              '".'
            ) });
        }).catch(function (error) {
          console.warn(error);
          _this3.setState({ message: _react2.default.createElement(
              _reactBootstrap.Panel,
              { bsStyle: 'danger' },
              error.toString()
            ) });
        });
      }
    }
  }, {
    key: 'login',
    value: function login(event) {
      var _this4 = this;

      event.preventDefault();
      _auth2.default.login(this.state.username, this.state.password, function (loggedIn) {
        var location = _this4.props.location;

        if (!loggedIn) {
          return _this4.setState({ message: _react2.default.createElement(
              _reactBootstrap.Panel,
              { bsStyle: 'danger' },
              'Invalid username and/or password.'
            ) });
        } else {
          return _this4.setState({ message: null, pushUrl: "/" });
        }
      });
    }
  }, {
    key: 'onUsernameChanged',
    value: function onUsernameChanged(e) {
      this.setState({ username: e.target.value });
    }
  }, {
    key: 'onPasswordChanged',
    value: function onPasswordChanged(e) {
      this.setState({ password: e.target.value });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state && this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          this.state.data && _react2.default.createElement(
            'title',
            null,
            "Sign in | " + this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: "Sign in using username and password" })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            'Sign in'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          this.state.message,
          _react2.default.createElement(
            'form',
            { onSubmit: this.login.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsText' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Username'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', placeholder: 'Enter username', onChange: this.onUsernameChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsPassword' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Enter password', onChange: this.onPasswordChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/register' },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsStyle: 'default' },
                  'Register new user'
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'default', onClick: this.forgotPasswordClick.bind(this) },
                'Forgot password'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success' },
                'Login'
              )
            )
          )
        )
      );
    }
  }]);

  return Login;
}(_react.Component);

exports.default = Login;


Login.contextTypes = {
  router: _propTypes2.default.object
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactBootstrap = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Logout = function (_Component) {
  _inherits(Logout, _Component);

  function Logout() {
    _classCallCheck(this, Logout);

    return _possibleConstructorReturn(this, (Logout.__proto__ || Object.getPrototypeOf(Logout)).apply(this, arguments));
  }

  _createClass(Logout, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      _auth2.default.logout();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Panel,
        { bsStyle: 'success' },
        'Logged out'
      );
    }
  }]);

  return Logout;
}(_react.Component);

exports.default = Logout;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _map = __webpack_require__(10);

var _map2 = _interopRequireDefault(_map);

var _gallery = __webpack_require__(13);

var _gallery2 = _interopRequireDefault(_gallery);

var _reactRouterBootstrap = __webpack_require__(9);

var _reactBootstrap = __webpack_require__(1);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _tickModal = __webpack_require__(20);

var _tickModal2 = _interopRequireDefault(_tickModal);

var _commentModal = __webpack_require__(48);

var _commentModal2 = _interopRequireDefault(_commentModal);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Problem = function (_Component) {
  _inherits(Problem, _Component);

  function Problem(props) {
    _classCallCheck(this, Problem);

    var _this = _possibleConstructorReturn(this, (Problem.__proto__ || Object.getPrototypeOf(Problem)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = {
      data: data,
      tabIndex: 1,
      showTickModal: false,
      showCommentModal: false
    };
    return _this;
  }

  _createClass(Problem, [{
    key: 'refresh',
    value: function refresh(id) {
      var _this2 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this2.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.problemId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.problemId !== this.props.match.params.problemId) {
        this.refresh(this.props.match.params.problemId);
      }
    }
  }, {
    key: 'handleTabsSelection',
    value: function handleTabsSelection(key) {
      this.setState({ tabIndex: key });
    }

    /* intersperse: Return an array with the separator interspersed between
     * each element of the input array.
     *
     * > _([1,2,3]).intersperse(0)
     * [1,0,2,0,3]
    */

  }, {
    key: 'intersperse',
    value: function intersperse(arr, sep) {
      if (arr.length === 0) {
        return [];
      }
      return arr.slice(1).reduce(function (xs, x, i) {
        return xs.concat([sep, x]);
      }, [arr[0]]);
    }
  }, {
    key: 'closeTickModal',
    value: function closeTickModal(event) {
      this.setState({ showTickModal: false });
      this.refresh(this.props.match.params.problemId);
    }
  }, {
    key: 'openTickModal',
    value: function openTickModal(event) {
      this.setState({ showTickModal: true });
    }
  }, {
    key: 'closeCommentModal',
    value: function closeCommentModal(event) {
      this.setState({ showCommentModal: false });
      this.refresh(this.props.match.params.problemId);
    }
  }, {
    key: 'openCommentModal',
    value: function openCommentModal(event) {
      this.setState({ showCommentModal: true });
    }
  }, {
    key: 'onRemoveMedia',
    value: function onRemoveMedia(idMediaToRemove) {
      var allMedia = this.state.data.media.filter(function (m) {
        return m.id != idMediaToRemove;
      });
      this.setState({ media: allMedia });
    }
  }, {
    key: 'render',
    value: function render() {
      var data = this.state.data;

      if (!data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }

      var markers = [];
      if (data.lat > 0 && data.lng > 0) {
        markers.push({
          lat: data.lat,
          lng: data.lng,
          title: data.name + ' [' + data.grade + ']',
          label: data.name.charAt(0),
          url: '/problem/' + data.id,
          icon: {
            url: data.ticks && data.ticks.filter(function (t) {
              return t.writable;
            }).length > 0 ? 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-a.png' : 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png',
            labelOriginX: 11,
            labelOriginY: 13
          }
        });
      }
      if (data.sectorLat > 0 && data.sectorLng > 0) {
        markers.push({
          lat: data.sectorLat,
          lng: data.sectorLng,
          title: 'Parking',
          labelContent: data.sectorName,
          icon: {
            url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
            scaledSizeW: 32,
            scaledSizeH: 32
          },
          url: '/sector/' + data.sectorId
        });
      }
      var map = markers.length > 0 ? _react2.default.createElement(_map2.default, { markers: markers, defaultCenter: { lat: markers[0].lat, lng: markers[0].lng }, defaultZoom: 16 }) : null;
      var gallery = data.media && data.media.length > 0 ? _react2.default.createElement(_gallery2.default, { alt: data.name + ' ' + data.grade + ' (' + data.areaName + " - " + data.sectorName + ')', media: data.media, showThumbnails: false, removeMedia: this.onRemoveMedia.bind(this) }) : null;
      var topoContent = null;
      if (map && gallery) {
        topoContent = _react2.default.createElement(
          _reactBootstrap.Tabs,
          { activeKey: this.state.tabIndex, animation: false, onSelect: this.handleTabsSelection.bind(this), id: 'problem_tab', unmountOnExit: true },
          _react2.default.createElement(
            _reactBootstrap.Tab,
            { eventKey: 1, title: 'Media' },
            this.state.tabIndex == 1 ? gallery : false
          ),
          _react2.default.createElement(
            _reactBootstrap.Tab,
            { eventKey: 2, title: 'Map' },
            this.state.tabIndex == 2 ? map : false
          )
        );
      } else if (map) {
        topoContent = map;
      } else if (gallery) {
        topoContent = gallery;
      }
      var fa = data.fa ? data.fa.map(function (u, i) {
        return _react2.default.createElement(
          _reactRouterDom.Link,
          { key: i, to: '/user/' + u.id },
          u.firstname,
          ' ',
          u.surname
        );
      }) : [];
      fa = this.intersperse(fa, ", ");

      var table = null;
      if (data.ticks) {
        var rows = data.ticks.map(function (t, i) {
          var isTickedClassName = t.writable ? 'success' : '';
          var stars = null;
          if (t.stars === 0.5) {
            stars = _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' });
          } else if (t.stars === 1.0) {
            stars = _react2.default.createElement(
              'div',
              { style: { whiteSpace: 'nowrap' }, id: 2 },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
            );
          } else if (t.stars === 1.5) {
            stars = _react2.default.createElement(
              'div',
              { style: { whiteSpace: 'nowrap' }, id: 3 },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
            );
          } else if (t.stars === 2.0) {
            stars = _react2.default.createElement(
              'div',
              { style: { whiteSpace: 'nowrap' }, id: 4 },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
            );
          } else if (t.stars === 2.5) {
            stars = _react2.default.createElement(
              'div',
              { style: { whiteSpace: 'nowrap' }, id: 5 },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
            );
          } else if (t.stars === 3.0) {
            stars = _react2.default.createElement(
              'div',
              { style: { whiteSpace: 'nowrap' }, id: 6 },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
            );
          }
          if (stars) {
            stars = _react2.default.createElement(
              _reactBootstrap.OverlayTrigger,
              { placement: 'top', overlay: _react2.default.createElement(
                  _reactBootstrap.Popover,
                  { id: 0, title: 'Guidelines' },
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                  ' Nice',
                  _react2.default.createElement('br', null),
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                  ' Very nice',
                  _react2.default.createElement('br', null),
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
                  ' Fantastic!'
                ) },
              stars
            );
          }
          return _react2.default.createElement(
            'tr',
            { className: isTickedClassName, key: i },
            _react2.default.createElement(
              'td',
              null,
              t.date
            ),
            _react2.default.createElement(
              'td',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/user/' + t.idUser },
                t.name
              )
            ),
            _react2.default.createElement(
              'td',
              null,
              t.suggestedGrade
            ),
            _react2.default.createElement(
              'td',
              null,
              t.comment
            ),
            _react2.default.createElement(
              'td',
              null,
              stars
            )
          );
        });
        table = _react2.default.createElement(
          _reactBootstrap.Table,
          { striped: true, condensed: true, hover: true },
          _react2.default.createElement(
            'thead',
            null,
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement(
                'th',
                null,
                'When'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Name'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Grade'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Comment'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Stars'
              )
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            rows
          )
        );
      }

      var comment = null;
      if (data.comments) {
        var comments = data.comments.map(function (c, i) {
          var header = _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/user/' + c.idUser },
              c.name
            ),
            ' ',
            _react2.default.createElement(
              'small',
              null,
              _react2.default.createElement(
                'i',
                null,
                c.date
              )
            )
          );
          return _react2.default.createElement(
            _reactBootstrap.Panel,
            { key: i },
            _react2.default.createElement(
              _reactBootstrap.Panel.Heading,
              null,
              header
            ),
            _react2.default.createElement(
              _reactBootstrap.Panel.Body,
              null,
              c.message
            )
          );
        });
        comment = _react2.default.createElement(
          'span',
          null,
          comments
        );
      };

      var section = null;
      if (data.sections) {
        var sections = data.sections.map(function (s, i) {
          return _react2.default.createElement(
            'tr',
            { key: i },
            _react2.default.createElement(
              'td',
              null,
              s.nr
            ),
            _react2.default.createElement(
              'td',
              null,
              s.grade
            ),
            _react2.default.createElement(
              'td',
              null,
              s.description
            )
          );
        });
        section = _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(
            'strong',
            null,
            'Sections:'
          ),
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            _reactBootstrap.Table,
            { striped: true, bordered: true, condensed: true, hover: true },
            _react2.default.createElement(
              'thead',
              null,
              _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                  'td',
                  null,
                  '#'
                ),
                _react2.default.createElement(
                  'td',
                  null,
                  'Grade'
                ),
                _react2.default.createElement(
                  'td',
                  null,
                  'Description'
                )
              )
            ),
            _react2.default.createElement(
              'tbody',
              null,
              sections
            )
          )
        );
      };

      var headerButtons = null;
      if (_auth2.default.loggedIn()) {
        headerButtons = _react2.default.createElement(
          'div',
          { style: { float: 'right' } },
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.OverlayTrigger,
              { placement: 'top', overlay: _react2.default.createElement(
                  _reactBootstrap.Tooltip,
                  { id: -1 },
                  'Tick problem'
                ) },
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'primary', bsSize: 'xsmall', onClick: this.openTickModal.bind(this) },
                'Tick'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.OverlayTrigger,
              { placement: 'top', overlay: _react2.default.createElement(
                  _reactBootstrap.Tooltip,
                  { id: -2 },
                  'Add comment'
                ) },
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'primary', bsSize: 'xsmall', onClick: this.openCommentModal.bind(this) },
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'comment', inverse: true })
              )
            ),
            _auth2.default.isAdmin() && _react2.default.createElement(
              _reactBootstrap.OverlayTrigger,
              { placement: 'top', overlay: _react2.default.createElement(
                  _reactBootstrap.Tooltip,
                  { id: data.id },
                  'Edit problem'
                ) },
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: { pathname: '/problem/edit/' + data.id, query: { idSector: data.sectorId, lat: data.sectorLat, lng: data.sectorLng } } },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsStyle: 'primary', bsSize: 'xsmall' },
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'edit', inverse: true })
                )
              )
            ),
            !_auth2.default.isAdmin() && _react2.default.createElement(
              _reactBootstrap.OverlayTrigger,
              { placement: 'top', overlay: _react2.default.createElement(
                  _reactBootstrap.Tooltip,
                  { id: data.id },
                  'Add image(s)'
                ) },
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: { pathname: '/problem/edit/media/' + data.id } },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsStyle: 'primary', bsSize: 'xsmall' },
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'image', inverse: true })
                )
              )
            )
          )
        );
      }

      var tickModal = null;
      if (data.ticks) {
        var userTicks = data.ticks.filter(function (t) {
          return t.writable;
        });
        if (userTicks && userTicks.length > 0) {
          tickModal = _react2.default.createElement(_tickModal2.default, { idTick: userTicks[0].id, idProblem: data.id, date: userTicks[0].date, comment: userTicks[0].comment, grade: userTicks[0].suggestedGrade, grades: data.metadata.grades, stars: userTicks[0].stars, show: this.state.showTickModal, onHide: this.closeTickModal.bind(this) });
        }
      }
      if (!tickModal) {
        tickModal = _react2.default.createElement(_tickModal2.default, { idTick: -1, idProblem: data.id, grade: data.originalGrade, show: this.state.showTickModal, onHide: this.closeTickModal.bind(this) });
      }

      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'script',
            { type: 'application/ld+json' },
            JSON.stringify(data.metadata.jsonLd)
          ),
          _react2.default.createElement(
            'title',
            null,
            data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: data.metadata.description })
        ),
        tickModal,
        _react2.default.createElement(_commentModal2.default, { idProblem: data.id, show: this.state.showCommentModal, onHide: this.closeCommentModal.bind(this) }),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          headerButtons,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/browse' },
            'Browse'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/area/' + data.areaId },
            data.areaName
          ),
          ' ',
          data.areaVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          data.areaVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' }),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/sector/' + data.sectorId },
            data.sectorName
          ),
          ' ',
          data.sectorVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          data.sectorVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' }),
          ' / ',
          data.nr,
          ' ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            data.name
          ),
          ' ',
          data.grade,
          ' ',
          data.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          data.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
        ),
        topoContent,
        _react2.default.createElement(
          _reactBootstrap.Well,
          { bsSize: 'small' },
          !data.metadata.isBouldering && _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'strong',
              null,
              'Type:'
            ),
            ' ',
            data.t.type + " - " + data.t.subType,
            _react2.default.createElement('br', null)
          ),
          _react2.default.createElement(
            'strong',
            null,
            'Comment:'
          ),
          ' ',
          data.comment,
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'strong',
            null,
            'FA:'
          ),
          ' ',
          fa,
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'strong',
            null,
            'FA date:'
          ),
          ' ',
          data.faDateHr,
          _react2.default.createElement('br', null),
          _react2.default.createElement(
            'strong',
            null,
            'Original grade:'
          ),
          ' ',
          data.originalGrade,
          _react2.default.createElement('br', null),
          data.sectorLat > 0 && data.sectorLng > 0 && _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'a',
              { href: 'http://maps.google.com/maps?q=loc:' + data.sectorLat + ',' + data.sectorLng + '&navigate=yes', rel: 'noopener', target: '_blank' },
              'Start navigation'
            ),
            _react2.default.createElement('br', null)
          ),
          section
        ),
        table,
        comment
      );
    }
  }]);

  return Problem;
}(_react.Component);

exports.default = Problem;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = __webpack_require__(1);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommentModal = function (_Component) {
  _inherits(CommentModal, _Component);

  function CommentModal(props) {
    _classCallCheck(this, CommentModal);

    return _possibleConstructorReturn(this, (CommentModal.__proto__ || Object.getPrototypeOf(CommentModal)).call(this, props));
  }

  _createClass(CommentModal, [{
    key: 'refresh',
    value: function refresh(props) {
      this.setState({
        idProblem: props.idProblem,
        comment: ''
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.refresh(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.refresh(nextProps);
    }
  }, {
    key: 'onCommentChanged',
    value: function onCommentChanged(e) {
      this.setState({ comment: e.target.value });
    }
  }, {
    key: 'save',
    value: function save(e) {
      var _this2 = this;

      if (this.state.comment) {
        (0, _api.postComment)(this.state.idProblem, this.state.comment).then(function (response) {
          _this2.props.onHide();
        }).catch(function (error) {
          console.warn(error);
          alert(error.toString());
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Modal,
        { show: this.props.show, onHide: this.props.onHide.bind(this) },
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          { closeButton: true },
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            null,
            'Add comment'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          null,
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            { controlId: 'formControlsTextArea' },
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Comment'
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, { style: { height: '100px' }, componentClass: 'textarea', placeholder: 'Comment', value: this.state && this.state.comment, onChange: this.onCommentChanged.bind(this) })
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          null,
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.save.bind(this), bsStyle: 'success' },
              'Save'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this.props.onHide.bind(this) },
              'Close'
            )
          )
        )
      );
    }
  }]);

  return CommentModal;
}(_react.Component);

exports.default = CommentModal;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _reactBootstrap = __webpack_require__(1);

var _reactGoogleMaps = __webpack_require__(11);

var _userSelector = __webpack_require__(50);

var _userSelector2 = _interopRequireDefault(_userSelector);

var _problemSection = __webpack_require__(52);

var _problemSection2 = _interopRequireDefault(_problemSection);

var _imageUpload = __webpack_require__(12);

var _imageUpload2 = _interopRequireDefault(_imageUpload);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactInputCalendar = __webpack_require__(21);

var _reactInputCalendar2 = _interopRequireDefault(_reactInputCalendar);

var _reactFontawesome = __webpack_require__(5);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GettingStartedGoogleMap = (0, _reactGoogleMaps.withScriptjs)((0, _reactGoogleMaps.withGoogleMap)(function (props) {
  return _react2.default.createElement(
    _reactGoogleMaps.GoogleMap,
    {
      defaultZoom: props.defaultZoom,
      defaultCenter: props.defaultCenter,
      defaultMapTypeId: google.maps.MapTypeId.TERRAIN,
      onClick: props.onClick.bind(undefined) },
    props.markers
  );
}));

var ProblemEdit = function (_Component) {
  _inherits(ProblemEdit, _Component);

  function ProblemEdit(props) {
    _classCallCheck(this, ProblemEdit);

    var _this = _possibleConstructorReturn(this, (ProblemEdit.__proto__ || Object.getPrototypeOf(ProblemEdit)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(ProblemEdit, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      if (!_auth2.default.isAdmin()) {
        this.setState({ pushUrl: "/login", error: null });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.problemId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.problemId !== this.props.match.params.problemId) {
        this.refresh(this.props.match.params.problemId);
      }
    }
  }, {
    key: 'refresh',
    value: function refresh(id) {
      var _this2 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this2.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'onNameChanged',
    value: function onNameChanged(e) {
      this.setState({ name: e.target.value });
    }
  }, {
    key: 'onNrChanged',
    value: function onNrChanged(e) {
      this.setState({ nr: parseInt(e.target.value) });
    }
  }, {
    key: 'onLatChanged',
    value: function onLatChanged(e) {
      this.setState({ lat: parseFloat(e.target.value) });
    }
  }, {
    key: 'onLngChanged',
    value: function onLngChanged(e) {
      this.setState({ lng: parseFloat(e.target.value) });
    }
  }, {
    key: 'onVisibilityChanged',
    value: function onVisibilityChanged(visibility, e) {
      this.setState({ visibility: visibility });
    }
  }, {
    key: 'onCommentChanged',
    value: function onCommentChanged(e) {
      this.setState({ comment: e.target.value });
    }
  }, {
    key: 'onFaDateChanged',
    value: function onFaDateChanged(newFaDate) {
      this.setState({ faDate: newFaDate });
    }
  }, {
    key: 'onOriginalGradeChanged',
    value: function onOriginalGradeChanged(originalGrade, e) {
      this.setState({ originalGrade: originalGrade });
    }
  }, {
    key: 'onTypeIdChanged',
    value: function onTypeIdChanged(typeId, e) {
      this.setState({ typeId: typeId });
    }
  }, {
    key: 'onNewMediaChanged',
    value: function onNewMediaChanged(newMedia) {
      this.setState({ newMedia: newMedia });
    }
  }, {
    key: 'save',
    value: function save(event) {
      var _this3 = this;

      event.preventDefault();
      this.setState({ isSaving: true });
      var newMedia = this.state.data.newMedia.map(function (m) {
        return { name: m.file.name.replace(/[^-a-z0-9.]/ig, '_'), photographer: m.photographer, inPhoto: m.inPhoto };
      });
      var data = this.state.data;

      postSector(this.props.location.query.idSector, data.id, data.visibility, data.name, data.comment, data.originalGrade, data.fa, data.faDate, data.nr, data.typeId ? data.types.find(function (t) {
        return t.id === data.typeId;
      }) : data.types[0], data.lat, data.lng, data.sections, newMedia).then(function (response) {
        _this3.setState({ pushUrl: "/problem/" + response.id });
      }).catch(function (error) {
        console.warn(error);
        _this3.setState({ error: error });
      });
    }
  }, {
    key: 'onMapClick',
    value: function onMapClick(event) {
      this.setState({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  }, {
    key: 'onUsersUpdated',
    value: function onUsersUpdated(newUsers) {
      var fa = newUsers.map(function (u) {
        return { id: typeof u.value === 'string' || u.value instanceof String ? -1 : u.value, firstname: u.label, surname: null };
      });
      this.setState({ fa: fa });
    }
  }, {
    key: 'onSectionsUpdated',
    value: function onSectionsUpdated(sections) {
      this.setState({ sections: sections });
    }
  }, {
    key: 'onCancel',
    value: function onCancel() {
      window.history.back();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var data = this.state.data;

      if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.problemId || !this.props.location || !this.props.location.query || !this.props.location.query.idSector) {
        return _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(
            'h3',
            null,
            'Invalid action...'
          )
        );
      } else if (!data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }

      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      var visibilityText = 'Visible for everyone';
      if (data.visibility === 1) {
        visibilityText = 'Only visible for administrators';
      } else if (data.visibility === 2) {
        visibilityText = 'Only visible for super administrators';
      }

      var selectedType = data.typeId ? data.types.find(function (t) {
        return t.id === data.typeId;
      }) : data.types[0];
      var defaultCenter;
      var defaultZoom;
      if (data.lat != 0 && data.lng != 0) {
        defaultCenter = { lat: data.lat, lng: data.lng };
        defaultZoom = 15;
      } else if (this.props.location.query.lat && parseFloat(this.props.location.query.lat) > 0) {
        defaultCenter = { lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng) };
        defaultZoom = 14;
      } else {
        defaultCenter = data.metadata.defaultCenter;
        defaultZoom = data.metadata.defaultZoom;
      }

      var sections = null;
      if (!data.metadata.isBouldering) {
        sections = _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: 'formControlsSections' },
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Section(s)'
          ),
          _react2.default.createElement('br', null),
          _react2.default.createElement(_problemSection2.default, { sections: data.sections, grades: data.grades, onSectionsUpdated: this.onSectionsUpdated.bind(this) })
        );
      }
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            data.metadata.title
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement(
            'form',
            { onSubmit: this.save.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsName' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Problem name'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: data.name, placeholder: 'Enter name', onChange: this.onNameChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsFaDate' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'FA date (yyyy-mm-dd)'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(_reactInputCalendar2.default, { format: 'YYYY-MM-DD', computableFormat: 'YYYY-MM-DD', date: data.faDate, onChange: this.onFaDateChanged.bind(this) }),
              _react2.default.createElement(
                _reactBootstrap.ButtonGroup,
                null,
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { onClick: this.onFaDateChanged.bind(this, this.convertFromDateToString(yesterday)) },
                  'Yesterday'
                ),
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { onClick: this.onFaDateChanged.bind(this, this.convertFromDateToString(new Date())) },
                  'Today'
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsTypeId' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Type'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                _reactBootstrap.DropdownButton,
                { title: selectedType.type + (selectedType.subType ? " - " + selectedType.subType : ""), id: 'bg-nested-dropdown' },
                data.types.map(function (t, i) {
                  return _react2.default.createElement(
                    _reactBootstrap.MenuItem,
                    { key: i, eventKey: i, onSelect: _this4.onTypeIdChanged.bind(_this4, t.id) },
                    t.type,
                    ' ',
                    t.subType ? " - " + t.subType : ""
                  );
                })
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsGrade' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Grade'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                _reactBootstrap.DropdownButton,
                { title: data.originalGrade, id: 'bg-nested-dropdown' },
                data.grades.map(function (g, i) {
                  return _react2.default.createElement(
                    _reactBootstrap.MenuItem,
                    { key: i, eventKey: i, onSelect: _this4.onOriginalGradeChanged.bind(_this4, g.grade) },
                    g.grade
                  );
                })
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsFA' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'FA'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(_userSelector2.default, { users: data.fa ? data.fa.map(function (u) {
                  return { value: u.id, label: u.firstname + " " + u.surname };
                }) : [], onUsersUpdated: this.onUsersUpdated.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsVisibility' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Visibility'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                _reactBootstrap.DropdownButton,
                { title: visibilityText, id: 'bg-nested-dropdown' },
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '0', onSelect: this.onVisibilityChanged.bind(this, 0) },
                  'Visible for everyone'
                ),
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '1', onSelect: this.onVisibilityChanged.bind(this, 1) },
                  'Only visible for administrators'
                ),
                _auth2.default.isSuperAdmin() && _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '2', onSelect: this.onVisibilityChanged.bind(this, 2) },
                  'Only visible for super administrators'
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsSectorNr' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Sector number'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: data.nr, placeholder: 'Enter sector number', onChange: this.onNrChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsComment' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Comment'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { style: { height: '100px' }, componentClass: 'textarea', placeholder: 'Enter comment', value: data.comment, onChange: this.onCommentChanged.bind(this) })
            ),
            sections,
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMedia' },
              _react2.default.createElement(_imageUpload2.default, { onMediaChanged: this.onNewMediaChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMap' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Click to mark problem on map'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                'section',
                { style: { height: '600px' } },
                _react2.default.createElement(GettingStartedGoogleMap, {
                  googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp',
                  loadingElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  containerElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  mapElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  defaultZoom: defaultZoom,
                  defaultCenter: defaultCenter,
                  onClick: this.onMapClick.bind(this),
                  markers: data.lat != 0 && data.lng != 0 ? _react2.default.createElement(_reactGoogleMaps.Marker, { position: { lat: data.lat, lng: data.lng } }) : ""
                })
              ),
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Latitude'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: data.lat, placeholder: 'Latitude', onChange: this.onLatChanged.bind(this) }),
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Longitude'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: data.lng, placeholder: 'Longitude', onChange: this.onLngChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', onClick: this.onCancel.bind(this) },
                'Cancel'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success', disabled: this.state.isSaving },
                this.state.isSaving ? 'Saving...' : 'Save problem'
              )
            )
          )
        )
      );
    }
  }, {
    key: 'convertFromDateToString',
    value: function convertFromDateToString(date) {
      var d = date.getDate();
      var m = date.getMonth() + 1;
      var y = date.getFullYear();
      return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }
  }]);

  return ProblemEdit;
}(_react.Component);

exports.default = ProblemEdit;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _createReactClass = __webpack_require__(22);

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = __webpack_require__(15);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Creatable = __webpack_require__(51);

var _Creatable2 = _interopRequireDefault(_Creatable);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserSelector = (0, _createReactClass2.default)({
  displayName: 'UserSelector',
  propTypes: {
    label: _propTypes2.default.string
  },
  getInitialState: function getInitialState() {
    var _this = this;

    _superagent2.default.get(_config2.default.getUrl("users/search?value=")).withCredentials().end(function (err, res) {
      if (err) {
        console.log(err);
      } else {
        _this.setState({ options: res.body.map(function (u) {
            return { value: u.id, label: u.name };
          }) });
      }
    });
    return {
      multiValue: this.props.users,
      options: []
    };
  },
  handleOnChange: function handleOnChange(value) {
    this.props.onUsersUpdated(value);
    this.setState({ multiValue: value });
  },
  isValidNewOption: function isValidNewOption(inputValue) {
    return this.state.options.filter(function (u) {
      return inputValue.toLowerCase() === u.label.toLowerCase();
    }).length == 0;
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      { style: { position: 'relative', width: '100%' } },
      _react2.default.createElement(
        'div',
        { style: { width: '100%' } },
        _react2.default.createElement(_Creatable2.default, {
          isMulti: true,
          options: this.state.options,
          onChange: this.handleOnChange,
          isValidNewOption: this.isValidNewOption,
          value: this.state.multiValue
        })
      )
    );
  }
});

module.exports = UserSelector;

/***/ }),
/* 51 */
/***/ (function(module, exports) {

module.exports = require("react-select/lib/Creatable");

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _createReactClass = __webpack_require__(22);

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = __webpack_require__(15);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProblemSection = (0, _createReactClass2.default)({
  displayName: 'ProblemSection',
  propTypes: {
    label: _propTypes2.default.string
  },
  getInitialState: function getInitialState() {
    return {
      sections: this.props.sections,
      grades: this.props.grades
    };
  },
  onNumberOfSectionsChange: function onNumberOfSectionsChange(num) {
    var sections = null;
    if (num > 1) {
      sections = this.state.sections ? this.state.sections : [];
      while (num > sections.length) {
        sections.push({ id: sections.length * -1, nr: sections.length + 1, grade: 'n/a', description: null });
      }
      while (num < sections.length) {
        sections.pop();
      }
    }
    this.props.onSectionsUpdated(sections);
    this.setState({ sections: sections });
  },
  onNrChanged: function onNrChanged(id, e) {
    var sections = this.state.sections;
    var section = sections.find(function (s) {
      return s.id === id;
    });
    section.nr = e.target.value;
    this.props.onSectionsUpdated(sections);
    this.setState({ sections: sections });
  },
  onGradeChanged: function onGradeChanged(id, grade) {
    var sections = this.state.sections;
    var section = sections.find(function (s) {
      return s.id === id;
    });
    section.grade = grade;
    this.props.onSectionsUpdated(sections);
    this.setState({ sections: sections });
  },
  onDescriptionChanged: function onDescriptionChanged(id, e) {
    var sections = this.state.sections;
    var section = sections.find(function (s) {
      return s.id === id;
    });
    section.description = e.target.value;
    this.props.onSectionsUpdated(sections);
    this.setState({ sections: sections });
  },
  render: function render() {
    var _this = this;

    var sections = this.state.sections && this.state.sections.length > 1 && this.state.sections.map(function (s, i) {
      return _react2.default.createElement(
        _reactBootstrap.Form,
        { componentClass: 'fieldset', inline: true, key: i },
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: 'formNr' },
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'number', value: s.nr, onChange: _this.onNrChanged.bind(_this, s.id), style: { width: '50px' } })
        ),
        ' ',
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: 'formGrade' },
          _react2.default.createElement(
            _reactBootstrap.DropdownButton,
            { title: s.grade, id: 'bg-nested-dropdown' },
            _this.state.grades.map(function (g, i) {
              return _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { key: i, eventKey: i, onSelect: _this.onGradeChanged.bind(_this, s.id, g.grade) },
                g.grade
              );
            })
          )
        ),
        ' ',
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { controlId: 'formDescription' },
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: s.description ? s.description : "", onChange: _this.onDescriptionChanged.bind(_this, s.id), style: { width: '500px' } })
        )
      );
    });

    return _react2.default.createElement(
      _reactBootstrap.Well,
      null,
      _react2.default.createElement(
        _reactBootstrap.FormGroup,
        { controlId: 'formControlsNumSections' },
        _react2.default.createElement(
          _reactBootstrap.DropdownButton,
          { title: this.state.sections ? this.state.sections.length : 1, id: 'bg-nested-dropdown' },
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 1, eventKey: 1, onSelect: this.onNumberOfSectionsChange.bind(this, 1) },
            '1'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 2, eventKey: 2, onSelect: this.onNumberOfSectionsChange.bind(this, 2) },
            '2'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 3, eventKey: 3, onSelect: this.onNumberOfSectionsChange.bind(this, 3) },
            '3'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 4, eventKey: 4, onSelect: this.onNumberOfSectionsChange.bind(this, 4) },
            '4'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 5, eventKey: 5, onSelect: this.onNumberOfSectionsChange.bind(this, 5) },
            '5'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 6, eventKey: 6, onSelect: this.onNumberOfSectionsChange.bind(this, 6) },
            '6'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 7, eventKey: 7, onSelect: this.onNumberOfSectionsChange.bind(this, 7) },
            '7'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 8, eventKey: 8, onSelect: this.onNumberOfSectionsChange.bind(this, 8) },
            '8'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 9, eventKey: 9, onSelect: this.onNumberOfSectionsChange.bind(this, 9) },
            '9'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 10, eventKey: 10, onSelect: this.onNumberOfSectionsChange.bind(this, 10) },
            '10'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 11, eventKey: 11, onSelect: this.onNumberOfSectionsChange.bind(this, 11) },
            '11'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 12, eventKey: 12, onSelect: this.onNumberOfSectionsChange.bind(this, 12) },
            '12'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 13, eventKey: 13, onSelect: this.onNumberOfSectionsChange.bind(this, 13) },
            '13'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 14, eventKey: 14, onSelect: this.onNumberOfSectionsChange.bind(this, 14) },
            '14'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 15, eventKey: 15, onSelect: this.onNumberOfSectionsChange.bind(this, 15) },
            '15'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 16, eventKey: 16, onSelect: this.onNumberOfSectionsChange.bind(this, 16) },
            '16'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 17, eventKey: 17, onSelect: this.onNumberOfSectionsChange.bind(this, 17) },
            '17'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 18, eventKey: 18, onSelect: this.onNumberOfSectionsChange.bind(this, 18) },
            '18'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 19, eventKey: 19, onSelect: this.onNumberOfSectionsChange.bind(this, 19) },
            '19'
          ),
          _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: 20, eventKey: 20, onSelect: this.onNumberOfSectionsChange.bind(this, 20) },
            '20'
          )
        )
      ),
      sections
    );
  }
});

module.exports = ProblemSection;

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _reactBootstrap = __webpack_require__(1);

var _imageUpload = __webpack_require__(12);

var _imageUpload2 = _interopRequireDefault(_imageUpload);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProblemEditMedia = function (_Component) {
  _inherits(ProblemEditMedia, _Component);

  function ProblemEditMedia() {
    _classCallCheck(this, ProblemEditMedia);

    return _possibleConstructorReturn(this, (ProblemEditMedia.__proto__ || Object.getPrototypeOf(ProblemEditMedia)).apply(this, arguments));
  }

  _createClass(ProblemEditMedia, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _superagent2.default.get(_config2.default.getUrl("problems?id=" + this.props.match.params.problemId)).withCredentials().end(function (err, res) {
        if (err) {
          _this2.setState({ error: err });
        } else {
          _this2.setState({
            id: res.body[0].id,
            newMedia: []
          });
        }
      });
    }
  }, {
    key: 'onNewMediaChanged',
    value: function onNewMediaChanged(newMedia) {
      this.setState({ newMedia: newMedia });
    }
  }, {
    key: 'save',
    value: function save(event) {
      var _this3 = this;

      event.preventDefault();
      this.setState({ isSaving: true });
      var newMedia = this.state.newMedia.map(function (m) {
        return { name: m.file.name.replace(/[^-a-z0-9.]/ig, '_'), photographer: m.photographer, inPhoto: m.inPhoto };
      });
      var req = _superagent2.default.post(_config2.default.getUrl("problems/media")).withCredentials().field('json', JSON.stringify({ id: this.state.id, newMedia: newMedia })).set('Accept', 'application/json');
      this.state.newMedia.forEach(function (m) {
        return req.attach(m.file.name.replace(/[^-a-z0-9.]/ig, '_'), m.file);
      });
      req.end(function (err, res) {
        if (err) {
          _this3.setState({ error: err });
        } else {
          _this3.setState({ pushUrl: "/problem/" + res.body.id });
        }
      });
    }
  }, {
    key: 'onCancel',
    value: function onCancel() {
      window.history.back();
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state || !this.state.id) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      } else if (this.state.error) {
        return _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(
            'h3',
            null,
            this.state.error.status
          ),
          this.state.error.toString()
        );
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }

      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement(
            'form',
            { onSubmit: this.save.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMedia' },
              _react2.default.createElement(_imageUpload2.default, { onMediaChanged: this.onNewMediaChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', onClick: this.onCancel.bind(this) },
                'Cancel'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success', disabled: this.state.isSaving },
                this.state.isSaving ? 'Saving...' : 'Save'
              )
            )
          )
        )
      );
    }
  }]);

  return ProblemEditMedia;
}(_react.Component);

exports.default = ProblemEditMedia;

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _reactBootstrap = __webpack_require__(1);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Recover = function (_Component) {
  _inherits(Recover, _Component);

  function Recover(props) {
    _classCallCheck(this, Recover);

    var _this = _possibleConstructorReturn(this, (Recover.__proto__ || Object.getPrototypeOf(Recover)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(Recover, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (!this.state.data) {
        this.props.fetchInitialData().then(function (data) {
          return _this2.setState(function () {
            return { data: data, password: '', password2: '' };
          });
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setState({ token: this.props.match.params.token });
    }
  }, {
    key: 'recover',
    value: function recover(event) {
      var _this3 = this;

      event.preventDefault();
      if (this.validatePassword(null) === 'error' || this.validatePassword2(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid password.'
          ) });
      } else {
        (0, _api.getUserPassword)(this.state.token, this.state.password).then(function (response) {
          _this3.setState({ pushUrl: "/login" });
        }).catch(function (error) {
          console.warn(error);
        });
      }
    }
  }, {
    key: 'onPasswordChanged',
    value: function onPasswordChanged(e) {
      this.setState({ password: e.target.value });
    }
  }, {
    key: 'onConfirmPasswordChanged',
    value: function onConfirmPasswordChanged(e) {
      this.setState({ password2: e.target.value });
    }
  }, {
    key: 'validatePassword',
    value: function validatePassword() {
      if (this.state.password.length < 8) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validatePassword2',
    value: function validatePassword2() {
      if (this.state.password2.length < 8 || this.state.password != this.state.password2) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.token) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          this.state.data && _react2.default.createElement(
            'title',
            null,
            "Recover password | " + this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: "Recover password" })
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement(
            'form',
            { onSubmit: this.recover.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsPassword', validationState: this.validatePassword() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'New password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Enter new password', onChange: this.onPasswordChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'At least 8 characters.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsPassword2', validationState: this.validatePassword2() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Confirm new password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Confirm new password', onChange: this.onConfirmPasswordChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'Must match password field.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success' },
                'Reset password'
              )
            )
          )
        )
      );
    }
  }]);

  return Recover;
}(_react.Component);

exports.default = Recover;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _reactBootstrap = __webpack_require__(1);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Register = function (_Component) {
  _inherits(Register, _Component);

  function Register(props) {
    _classCallCheck(this, Register);

    var _this = _possibleConstructorReturn(this, (Register.__proto__ || Object.getPrototypeOf(Register)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(Register, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (!this.state.data) {
        this.props.fetchInitialData().then(function (data) {
          return _this2.setState(function () {
            return {
              data: data,
              message: null,
              firstname: '',
              lastname: '',
              username: '',
              password: '',
              password2: ''
            };
          });
        });
      }
    }
  }, {
    key: 'register',
    value: function register(event) {
      var _this3 = this;

      event.preventDefault();
      if (this.validateFirstname(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid firstname.'
          ) });
      } else if (this.validateLastname(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid lastname.'
          ) });
      } else if (this.validateUsername(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid username.'
          ) });
      } else if (this.validatePassword(null) === 'error' || this.validatePassword2(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid password.'
          ) });
      } else {
        (0, _api.postUserRegister)(this.state.firstname, this.state.lastname, this.state.username, this.state.password).then(function (response) {
          _this3.setState({ message: _react2.default.createElement(
              _reactBootstrap.Panel,
              { bsStyle: 'success' },
              'User registered'
            ), pushUrl: "/login" });
        }).catch(function (error) {
          console.warn(error);
          _this3.setState({ message: _react2.default.createElement(
              _reactBootstrap.Panel,
              { bsStyle: 'danger' },
              error.toString()
            ) });
        });
      }
    }
  }, {
    key: 'onFirstnameChanged',
    value: function onFirstnameChanged(e) {
      this.setState({ firstname: e.target.value });
    }
  }, {
    key: 'onLastnameChanged',
    value: function onLastnameChanged(e) {
      this.setState({ lastname: e.target.value });
    }
  }, {
    key: 'onUsernameChanged',
    value: function onUsernameChanged(e) {
      this.setState({ username: e.target.value });
    }
  }, {
    key: 'onPasswordChanged',
    value: function onPasswordChanged(e) {
      this.setState({ password: e.target.value });
    }
  }, {
    key: 'onConfirmPasswordChanged',
    value: function onConfirmPasswordChanged(e) {
      this.setState({ password2: e.target.value });
    }
  }, {
    key: 'validateFirstname',
    value: function validateFirstname() {
      if (this.state.firstname.length < 1) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validateLastname',
    value: function validateLastname() {
      if (this.state.lastname.length < 1) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validateUsername',
    value: function validateUsername() {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(this.state.username)) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validatePassword',
    value: function validatePassword() {
      if (this.state.password.length < 8) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validatePassword2',
    value: function validatePassword2() {
      if (this.state.password2.length < 8 || this.state.password != this.state.password2) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state && this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          this.state.data && _react2.default.createElement(
            'title',
            null,
            "Register | " + this.state.data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: "Register new user" })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            'Register'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          this.state.message,
          _react2.default.createElement(
            'form',
            { onSubmit: this.register.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsFirstname', validationState: this.validateFirstname() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Firstname'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', placeholder: 'Enter firstname', onChange: this.onFirstnameChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsLastname', validationState: this.validateLastname() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Lastname'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', placeholder: 'Enter lastname', onChange: this.onLastnameChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsUsername', validationState: this.validateUsername() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Username'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'email', placeholder: 'Enter username', onChange: this.onUsernameChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'You must enter a valid email address.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsPassword', validationState: this.validatePassword() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Enter password', onChange: this.onPasswordChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'At least 8 characters.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsPassword2', validationState: this.validatePassword2() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Confirm password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Confirm password', onChange: this.onConfirmPasswordChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'Must match password field.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success' },
                'Register'
              )
            )
          )
        )
      );
    }
  }]);

  return Register;
}(_react.Component);

exports.default = Register;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _map = __webpack_require__(10);

var _map2 = _interopRequireDefault(_map);

var _gallery = __webpack_require__(13);

var _gallery2 = _interopRequireDefault(_gallery);

var _reactBootstrap = __webpack_require__(1);

var _reactRouterBootstrap = __webpack_require__(9);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableRow = function (_Component) {
  _inherits(TableRow, _Component);

  function TableRow() {
    _classCallCheck(this, TableRow);

    return _possibleConstructorReturn(this, (TableRow.__proto__ || Object.getPrototypeOf(TableRow)).apply(this, arguments));
  }

  _createClass(TableRow, [{
    key: 'intersperse',

    /* intersperse: Return an array with the separator interspersed between
     * each element of the input array.
     *
     * > _([1,2,3]).intersperse(0)
     * [1,0,2,0,3]
    */
    value: function intersperse(arr, sep) {
      if (arr.length === 0) {
        return [];
      }
      return arr.slice(1).reduce(function (xs, x, i) {
        return xs.concat([sep, x]);
      }, [arr[0]]);
    }
  }, {
    key: 'render',
    value: function render() {
      var comment = "";
      if (this.props.problem.comment) {
        if (this.props.problem.comment.length > 40) {
          var tooltip = _react2.default.createElement(
            _reactBootstrap.Tooltip,
            { id: this.props.problem.id },
            this.props.problem.comment
          );
          comment = _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            { key: this.props.problem.id, placement: 'top', overlay: tooltip },
            _react2.default.createElement(
              'span',
              null,
              this.props.problem.comment.substring(0, 40) + "..."
            )
          );
        } else {
          comment = this.props.problem.comment;
        }
      }
      var fa = this.props.problem.fa ? this.props.problem.fa.map(function (u, i) {
        return _react2.default.createElement(
          _reactRouterDom.Link,
          { key: i, to: '/user/' + u.id },
          u.firstname,
          ' ',
          u.surname
        );
      }) : [];
      fa = this.intersperse(fa, ", ");
      var isTickedClassName = this.props.problem.ticked ? 'success' : '';

      var stars = null;
      if (this.props.problem.stars === 0.5) {
        stars = _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' });
      } else if (this.props.problem.stars === 1.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 2 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else if (this.props.problem.stars === 1.5) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 3 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
        );
      } else if (this.props.problem.stars === 2.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 4 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else if (this.props.problem.stars === 2.5) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 5 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
        );
      } else if (this.props.problem.stars === 3.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 6 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      }
      if (stars) {
        stars = _react2.default.createElement(
          _reactBootstrap.OverlayTrigger,
          { placement: 'top', overlay: _react2.default.createElement(
              _reactBootstrap.Popover,
              { id: 0, title: 'Guidelines' },
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              ' Nice',
              _react2.default.createElement('br', null),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              ' Very nice',
              _react2.default.createElement('br', null),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
              ' Fantastic!'
            ) },
          stars
        );
      }

      var type;
      if (this.state && this.state.data && !this.state.data.metadata.isBouldering) {
        var typeImg;
        switch (this.props.problem.t.id) {
          case 2:
            typeImg = _react2.default.createElement('img', { height: '20', src: '/jpg/bolt.jpg' });break;
          case 3:
            typeImg = _react2.default.createElement('img', { height: '20', src: '/jpg/trad.jpg' });break;
          case 4:
            typeImg = _react2.default.createElement('img', { height: '20', src: '/jpg/mixed.jpg' });break;
        }
        type = _react2.default.createElement(
          'td',
          null,
          _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            { placement: 'top', overlay: _react2.default.createElement(
                _reactBootstrap.Popover,
                { id: this.props.problem.t.id, title: 'Type' },
                this.props.problem.t.type + " - " + this.props.problem.t.subType
              ) },
            typeImg
          )
        );
      }

      return _react2.default.createElement(
        'tr',
        { className: isTickedClassName },
        _react2.default.createElement(
          'td',
          null,
          this.props.problem.nr
        ),
        _react2.default.createElement(
          'td',
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + this.props.problem.id },
            this.props.problem.name
          ),
          ' ',
          this.props.problem.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          this.props.problem.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
        ),
        _react2.default.createElement(
          'td',
          null,
          comment
        ),
        type,
        _react2.default.createElement(
          'td',
          null,
          this.props.problem.grade
        ),
        _react2.default.createElement(
          'td',
          null,
          fa
        ),
        _react2.default.createElement(
          'td',
          null,
          this.props.problem.numTicks
        ),
        _react2.default.createElement(
          'td',
          null,
          stars
        ),
        _react2.default.createElement(
          'td',
          null,
          this.props.problem.numImages
        ),
        _react2.default.createElement(
          'td',
          null,
          this.props.problem.numMovies
        ),
        _react2.default.createElement(
          'td',
          null,
          (this.props.problem.lat > 0 && this.props.problem.lng > 0 || this.props.problemsInTopo.indexOf(this.props.problem.id) >= 0) && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'check' })
        )
      );
    }
  }]);

  return TableRow;
}(_react.Component);

var Sector = function (_Component2) {
  _inherits(Sector, _Component2);

  function Sector(props) {
    _classCallCheck(this, Sector);

    var _this2 = _possibleConstructorReturn(this, (Sector.__proto__ || Object.getPrototypeOf(Sector)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this2.state = { data: data, tabIndex: 1 };
    return _this2;
  }

  _createClass(Sector, [{
    key: 'refresh',
    value: function refresh(id) {
      var _this3 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this3.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.sectorId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.sectorId !== this.props.match.params.sectorId) {
        this.refresh(this.props.match.params.sectorId);
      }
    }
  }, {
    key: 'handleTabsSelection',
    value: function handleTabsSelection(key) {
      this.setState({ tabIndex: key });
    }
  }, {
    key: 'onRemoveMedia',
    value: function onRemoveMedia(idMediaToRemove) {
      var allMedia = this.state.data.media.filter(function (m) {
        return m.id != idMediaToRemove;
      });
      this.setState({ media: allMedia });
    }
  }, {
    key: 'render',
    value: function render() {
      var data = this.state.data;

      if (!data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }
      var problemsInTopo = [];
      if (data.media) {
        data.media.forEach(function (m) {
          if (m.svgs) {
            m.svgs.forEach(function (svg) {
              return problemsInTopo.push(svg.problemId);
            });
          }
        });
      }

      var rows = data.problems.map(function (problem, i) {
        return _react2.default.createElement(TableRow, { problem: problem, problemsInTopo: problemsInTopo, key: i });
      });

      var markers = data.problems.filter(function (p) {
        return p.lat != 0 && p.lng != 0;
      }).map(function (p) {
        return {
          lat: p.lat,
          lng: p.lng,
          title: p.nr + " - " + p.name + " [" + p.grade + "]",
          label: p.name.charAt(0),
          url: '/problem/' + p.id,
          icon: {
            url: p.ticked ? 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-a.png' : 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png',
            labelOriginX: 11,
            labelOriginY: 13
          }
        };
      });
      if (data.lat > 0 && data.lng > 0) {
        markers.push({
          lat: data.lat,
          lng: data.lng,
          title: 'Parking',
          icon: {
            url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
            scaledSizeW: 32,
            scaledSizeH: 32
          },
          url: '/sector/' + data.id
        });
      }
      var defaultCenter = data.lat && data.lat > 0 ? { lat: data.lat, lng: data.lng } : data.metadata.defaultCenter;
      var defaultZoom = data.lat && data.lat > 0 ? 15 : data.metadata.defaultZoom;
      var map = markers.length > 0 ? _react2.default.createElement(_map2.default, { markers: markers, defaultCenter: defaultCenter, defaultZoom: defaultZoom }) : null;
      var gallery = data.media && data.media.length > 0 ? _react2.default.createElement(_gallery2.default, { alt: data.name + " (" + data.areaName + ")", media: data.media, showThumbnails: data.media.length > 1, removeMedia: this.onRemoveMedia.bind(this) }) : null;
      var topoContent = null;
      if (map && gallery) {
        topoContent = _react2.default.createElement(
          _reactBootstrap.Tabs,
          { activeKey: this.state.tabIndex, animation: false, onSelect: this.handleTabsSelection.bind(this), id: 'sector_tab', unmountOnExit: true },
          _react2.default.createElement(
            _reactBootstrap.Tab,
            { eventKey: 1, title: 'Topo' },
            this.state.tabIndex == 1 ? gallery : false
          ),
          _react2.default.createElement(
            _reactBootstrap.Tab,
            { eventKey: 2, title: 'Map' },
            this.state.tabIndex == 2 ? map : false
          )
        );
      } else if (map) {
        topoContent = map;
      } else if (gallery) {
        topoContent = gallery;
      }
      var nextNr = data.problems.length > 0 ? data.problems[data.problems.length - 1].nr + 1 : 1;

      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'script',
            { type: 'application/ld+json' },
            JSON.stringify(data.metadata.jsonLd)
          ),
          _react2.default.createElement(
            'title',
            null,
            data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: data.metadata.description })
        ),
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _auth2.default.isAdmin() ? _react2.default.createElement(
            'div',
            { style: { float: 'right' } },
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.OverlayTrigger,
                { placement: 'top', overlay: _react2.default.createElement(
                    _reactBootstrap.Tooltip,
                    { id: -1 },
                    'Add problem'
                  ) },
                _react2.default.createElement(
                  _reactRouterBootstrap.LinkContainer,
                  { to: { pathname: '/problem/edit/-1', query: { idSector: data.id, nr: nextNr, lat: data.lat, lng: data.lng } } },
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsStyle: 'primary', bsSize: 'xsmall' },
                    _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'plus-square', inverse: true })
                  )
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.OverlayTrigger,
                { placement: 'top', overlay: _react2.default.createElement(
                    _reactBootstrap.Tooltip,
                    { id: data.id },
                    'Edit sector'
                  ) },
                _react2.default.createElement(
                  _reactRouterBootstrap.LinkContainer,
                  { to: { pathname: '/sector/edit/' + data.id, query: { idArea: data.areaId, lat: data.lat, lng: data.lng } } },
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    { bsStyle: 'primary', bsSize: 'xsmall' },
                    _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'edit', inverse: true })
                  )
                )
              )
            )
          ) : null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/browse' },
            'Browse'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/area/' + data.areaId },
            data.areaName
          ),
          ' ',
          data.areaVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          data.areaVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' }),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            data.name
          ),
          ' ',
          data.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          data.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
        ),
        topoContent,
        data.comment ? _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          data.comment
        ) : null,
        _react2.default.createElement(
          _reactBootstrap.Table,
          { striped: true, condensed: true, hover: true },
          _react2.default.createElement(
            'thead',
            null,
            _react2.default.createElement(
              'tr',
              null,
              _react2.default.createElement(
                'th',
                null,
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'hashtag' })
              ),
              _react2.default.createElement(
                'th',
                null,
                'Name'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Description'
              ),
              !data.metadata.isBouldering && _react2.default.createElement(
                'th',
                null,
                'Type'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Grade'
              ),
              _react2.default.createElement(
                'th',
                null,
                'FA'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Ticks'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Stars'
              ),
              _react2.default.createElement(
                'th',
                null,
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'camera' })
              ),
              _react2.default.createElement(
                'th',
                null,
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'video' })
              ),
              _react2.default.createElement(
                'th',
                null,
                _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'map-marker' })
              )
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            rows
          )
        )
      );
    }
  }]);

  return Sector;
}(_react.Component);

exports.default = Sector;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _reactBootstrap = __webpack_require__(1);

var _reactGoogleMaps = __webpack_require__(11);

var _imageUpload = __webpack_require__(12);

var _imageUpload2 = _interopRequireDefault(_imageUpload);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GettingStartedGoogleMap = (0, _reactGoogleMaps.withScriptjs)((0, _reactGoogleMaps.withGoogleMap)(function (props) {
  return _react2.default.createElement(
    _reactGoogleMaps.GoogleMap,
    {
      defaultZoom: props.defaultZoom,
      defaultCenter: props.defaultCenter,
      defaultMapTypeId: google.maps.MapTypeId.TERRAIN,
      onClick: props.onClick.bind(undefined),
      onRightClick: props.onRightClick.bind(undefined) },
    props.markers,
    props.outline
  );
}));

var SectorEdit = function (_Component) {
  _inherits(SectorEdit, _Component);

  function SectorEdit(props) {
    _classCallCheck(this, SectorEdit);

    var _this = _possibleConstructorReturn(this, (SectorEdit.__proto__ || Object.getPrototypeOf(SectorEdit)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  _createClass(SectorEdit, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      if (!_auth2.default.isAdmin()) {
        this.setState({ pushUrl: "/login", error: null });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.sectorId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.sectorId !== this.props.match.params.sectorId) {
        this.refresh(this.props.match.params.sectorId);
      }
    }
  }, {
    key: 'refresh',
    value: function refresh(id) {
      var _this2 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this2.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'onNameChanged',
    value: function onNameChanged(e) {
      this.setState({ name: e.target.value });
    }
  }, {
    key: 'onVisibilityChanged',
    value: function onVisibilityChanged(visibility, e) {
      this.setState({ visibility: visibility });
    }
  }, {
    key: 'onCommentChanged',
    value: function onCommentChanged(e) {
      this.setState({ comment: e.target.value });
    }
  }, {
    key: 'onNewMediaChanged',
    value: function onNewMediaChanged(newMedia) {
      this.setState({ newMedia: newMedia });
    }
  }, {
    key: 'save',
    value: function save(event) {
      var _this3 = this;

      event.preventDefault();
      this.setState({ isSaving: true });
      var newMedia = this.state.data.newMedia.map(function (m) {
        return { name: m.file.name.replace(/[^-a-z0-9.]/ig, '_'), photographer: m.photographer, inPhoto: m.inPhoto };
      });
      (0, _api.postSector)(this.props.location.query.idArea, this.state.data.id, this.state.data.visibility, this.state.data.name, this.state.data.comment, this.state.data.lat, this.state.data.lng, newMedia).then(function (response) {
        _this3.setState({ pushUrl: "/sector/" + response.id });
      }).catch(function (error) {
        console.warn(error);
        _this3.setState({ error: error });
      });
    }
  }, {
    key: 'onMapClick',
    value: function onMapClick(event) {
      this.setState({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  }, {
    key: 'onMapRightClick',
    value: function onMapRightClick(event) {
      if (this.state.data.polygonCoords) {
        this.setState({
          polygonCoords: this.state.data.polygonCoords + ";" + event.latLng.lat() + "," + event.latLng.lng()
        });
      } else {
        this.setState({ polygonCoords: event.latLng.lat() + "," + event.latLng.lng() });
      }
    }
  }, {
    key: 'resetMapPolygon',
    value: function resetMapPolygon(event) {
      this.setState({ polygonCoords: null });
    }
  }, {
    key: 'onCancel',
    value: function onCancel() {
      window.history.back();
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.error) {
        return _react2.default.createElement(
          'h3',
          null,
          this.state.error.toString()
        );
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.sectorId || !this.props.location || !this.props.location.query || !this.props.location.query.idArea) {
        return _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(
            'h3',
            null,
            'Invalid action...'
          )
        );
      } else if (!this.state.data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }
      var triangleCoords = this.state.data.polygonCoords ? this.state.data.polygonCoords.split(";").map(function (p, i) {
        var latLng = p.split(",");
        return { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
      }) : [];
      var outline = "";
      if (triangleCoords.length == 1) {
        outline = _react2.default.createElement(_reactGoogleMaps.Marker, { position: { lat: triangleCoords[0].lat, lng: triangleCoords[0].lng } });
      } else if (triangleCoords.length > 1) {
        outline = _react2.default.createElement(_reactGoogleMaps.Polygon, { paths: triangleCoords, options: { strokeColor: '#FF3300', strokeOpacity: '0.5', strokeWeight: '2', fillColor: '#FF3300', fillOpacity: '0.15' }, onClick: this.onMapClick.bind(this), onRightclick: this.onMapRightClick.bind(this) });
      }

      var visibilityText = 'Visible for everyone';
      if (this.state.data.visibility === 1) {
        visibilityText = 'Only visible for administrators';
      } else if (this.state.data.visibility === 2) {
        visibilityText = 'Only visible for super administrators';
      }
      var defaultCenter = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat) > 0 ? { lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng) } : this.state.data.metadata.defaultCenter;
      var defaultZoom = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat) > 0 ? 14 : this.state.data.metadata.defaultZoom;
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            this.state.data.metadata.title
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          _react2.default.createElement(
            'form',
            { onSubmit: this.save.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsName' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Sector name'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.data.name, placeholder: 'Enter name', onChange: this.onNameChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsComment' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Comment'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { style: { height: '100px' }, componentClass: 'textarea', placeholder: 'Enter comment', value: this.state.data.comment, onChange: this.onCommentChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsVisibility' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Visibility'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                _reactBootstrap.DropdownButton,
                { title: visibilityText, id: 'bg-nested-dropdown' },
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '0', onSelect: this.onVisibilityChanged.bind(this, 0) },
                  'Visible for everyone'
                ),
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '1', onSelect: this.onVisibilityChanged.bind(this, 1) },
                  'Only visible for administrators'
                ),
                _auth2.default.isSuperAdmin() && _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: '2', onSelect: this.onVisibilityChanged.bind(this, 2) },
                  'Only visible for super administrators'
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMedia' },
              _react2.default.createElement(_imageUpload2.default, { onMediaChanged: this.onNewMediaChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsMap' },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Left mouse button to position parking coordinate, right mouse button to add polygon points (sector outline)'
              ),
              _react2.default.createElement('br', null),
              _react2.default.createElement(
                'section',
                { style: { height: '600px' } },
                _react2.default.createElement(GettingStartedGoogleMap, {
                  googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp',
                  loadingElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  containerElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  mapElement: _react2.default.createElement('div', { style: { height: '100%' } }),
                  defaultZoom: defaultZoom,
                  defaultCenter: defaultCenter,
                  onClick: this.onMapClick.bind(this),
                  onRightClick: this.onMapRightClick.bind(this),
                  markers: this.state.data.lat != 0 && this.state.data.lng != 0 ? _react2.default.createElement(_reactGoogleMaps.Marker, { position: { lat: this.state.data.lat, lng: this.state.data.lng }, icon: { url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png', scaledSize: new google.maps.Size(32, 32) } }) : "",
                  outline: outline
                })
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'warning', onClick: this.resetMapPolygon.bind(this) },
                'Clear polygon'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', onClick: this.onCancel.bind(this) },
                'Cancel'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success', disabled: this.state.isSaving },
                this.state.isSaving ? 'Saving...' : 'Save sector'
              )
            )
          )
        )
      );
    }
  }]);

  return SectorEdit;
}(_react.Component);

exports.default = SectorEdit;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(17);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = __webpack_require__(4);

var _reactBootstrap = __webpack_require__(1);

var _svgPathParser = __webpack_require__(19);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _reactRouter = __webpack_require__(7);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SvgEdit = function (_Component) {
  _inherits(SvgEdit, _Component);

  function SvgEdit() {
    _classCallCheck(this, SvgEdit);

    return _possibleConstructorReturn(this, (SvgEdit.__proto__ || Object.getPrototypeOf(SvgEdit)).apply(this, arguments));
  }

  _createClass(SvgEdit, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _superagent2.default.get(_config2.default.getUrl("problems?id=" + this.props.match.params.problemId)).withCredentials().end(function (err, res) {
        if (err) {
          _this2.setState({ error: err });
        } else {
          var m = res.body[0].media.filter(function (x) {
            return x.id == _this2.props.match.params.mediaId;
          })[0];
          var readOnlySvgs = [];
          var svgId = 0;
          var points = [];
          if (m.svgs) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = m.svgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var svg = _step.value;

                if (svg.problemId === res.body[0].id) {
                  svgId = svg.id;
                  points = _this2.parsePath(svg.path);
                } else {
                  readOnlySvgs.push({ nr: svg.nr, hasAnchor: svg.hasAnchor, path: svg.path });
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }
          _this2.setState({
            mediaId: m.id,
            nr: res.body[0].nr,
            w: m.width,
            h: m.height,
            ctrl: false,
            svgId: svgId,
            points: points,
            readOnlySvgs: readOnlySvgs,
            activePoint: 0,
            draggedPoint: false,
            draggedCubic: false,
            hasAnchor: true,
            areaId: res.body[0].areaId,
            areaName: res.body[0].areaName,
            areaVisibility: res.body[0].areaVisibility,
            sectorId: res.body[0].sectorId,
            sectorName: res.body[0].sectorName,
            sectorVisibility: res.body[0].sectorVisibility,
            id: res.body[0].id,
            name: res.body[0].name,
            grade: res.body[0].grade,
            visibility: res.body[0].visibility
          });
        }
      });
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
      document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
      document.removeEventListener("keyup", this.handleKeyUp.bind(this));
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(e) {
      if (e.ctrlKey) this.setState({ ctrl: true });
    }
  }, {
    key: 'handleKeyUp',
    value: function handleKeyUp(e) {
      if (!e.ctrlKey) this.setState({ ctrl: false });
    }
  }, {
    key: 'setHasAnchor',
    value: function setHasAnchor(anchor) {
      this.setState({ hasAnchor: anchor });
    }
  }, {
    key: 'onCancel',
    value: function onCancel() {
      window.history.back();
    }
  }, {
    key: 'save',
    value: function save(event) {
      var _this3 = this;

      event.preventDefault();
      _superagent2.default.post(_config2.default.getUrl("problems/svg?problemId=" + this.state.id + "&mediaId=" + this.state.mediaId)).withCredentials().send({ delete: this.state.points.length < 2, id: this.state.svgId, path: this.generatePath(), hasAnchor: this.state.hasAnchor }).end(function (err, res) {
        if (err) {
          _this3.setState({ error: err });
        } else {
          _this3.setState({ pushUrl: "/problem/" + _this3.state.id });
        }
      });
    }
  }, {
    key: 'cancelDragging',
    value: function cancelDragging(e) {
      this.setState({
        draggedPoint: false,
        draggedCubic: false
      });
    }
  }, {
    key: 'getMouseCoords',
    value: function getMouseCoords(e) {
      var dim = this.refs["buldreinfo-svg-edit-img"].getBoundingClientRect();
      var dx = this.state.w / dim.width;
      var dy = this.state.h / dim.height;
      var x = Math.round((e.clientX - dim.left) * dx);
      var y = Math.round((e.clientY - dim.top) * dy);
      return { x: x, y: y };
    }
  }, {
    key: 'addPoint',
    value: function addPoint(e) {
      if (this.state.ctrl) {
        var coords = this.getMouseCoords(e);
        var points = this.state.points;
        points.push(coords);
        this.setState({
          points: points,
          activePoint: points.length - 1
        });
      }
    }
  }, {
    key: 'generatePath',
    value: function generatePath() {
      var d = "";
      this.state.points.forEach(function (p, i) {
        if (i === 0) {
          // first point
          d += "M ";
        } else if (p.q) {
          // quadratic
          d += 'Q ' + p.q.x + ' ' + p.q.y + ' ';
        } else if (p.c) {
          // cubic
          d += 'C ' + p.c[0].x + ' ' + p.c[0].y + ' ' + p.c[1].x + ' ' + p.c[1].y + ' ';
        } else if (p.a) {
          // arc
          d += 'A ' + p.a.rx + ' ' + p.a.ry + ' ' + p.a.rot + ' ' + p.a.laf + ' ' + p.a.sf + ' ';
        } else {
          d += "L ";
        }
        d += p.x + ' ' + p.y + ' ';
      });
      return d;
    }
  }, {
    key: 'handleMouseMove',
    value: function handleMouseMove(e) {
      e.preventDefault();
      if (!this.state.ctrl) {
        if (this.state.draggedPoint) {
          this.setPointCoords(this.getMouseCoords(e));
        } else if (this.state.draggedCubic !== false) {
          this.setCubicCoords(this.getMouseCoords(e), this.state.draggedCubic);
        }
      }
      return false;
    }
  }, {
    key: 'setPointCoords',
    value: function setPointCoords(coords) {
      var points = this.state.points;
      var active = this.state.activePoint;
      points[active].x = coords.x;
      points[active].y = coords.y;
      this.setState({ points: points });
    }
  }, {
    key: 'setCubicCoords',
    value: function setCubicCoords(coords, anchor) {
      var points = this.state.points;
      var active = this.state.activePoint;
      points[active].c[anchor].x = coords.x;
      points[active].c[anchor].y = coords.y;
      this.setState({ points: points });
    }
  }, {
    key: 'setDraggedPoint',
    value: function setDraggedPoint(index) {
      if (!this.state.ctrl) {
        this.setState({ activePoint: index, draggedPoint: true });
      }
    }
  }, {
    key: 'setDraggedCubic',
    value: function setDraggedCubic(index, anchor) {
      if (!this.state.ctrl) {
        this.setState({ activePoint: index, draggedCubic: anchor });
      }
    }
  }, {
    key: 'setPointType',
    value: function setPointType(v) {
      var points = this.state.points;
      var active = this.state.activePoint;
      if (active !== 0) {
        // not the first point
        switch (v) {
          case "L":
            points[active] = { x: points[active].x, y: points[active].y };
            break;
          case "C":
            points[active] = {
              x: points[active].x,
              y: points[active].y,
              c: [{
                x: (points[active].x + points[active - 1].x - 50) / 2,
                y: (points[active].y + points[active - 1].y) / 2
              }, {
                x: (points[active].x + points[active - 1].x + 50) / 2,
                y: (points[active].y + points[active - 1].y) / 2
              }]
            };
            break;
        }
        this.setState({ points: points });
      }
    }
  }, {
    key: 'removeActivePoint',
    value: function removeActivePoint(e) {
      var points = this.state.points;
      var active = this.state.activePoint;
      if (points.length > 1 && active !== 0) {
        points.splice(active, 1);
        this.setState({ points: points, activePoint: points.length - 1 });
      }
    }
  }, {
    key: 'reset',
    value: function reset(e) {
      this.setState({
        ctrl: false,
        points: [],
        activePoint: 0,
        draggedPoint: false,
        draggedCubic: false,
        hasAnchor: false
      });
    }
  }, {
    key: 'parseReadOnlySvgs',
    value: function parseReadOnlySvgs() {
      var shapes = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.state.readOnlySvgs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var svg = _step2.value;

          shapes.push(_react2.default.createElement('path', { key: shapes.length, d: svg.path, className: 'buldreinfo-svg-opacity buldreinfo-svg-route', strokeWidth: 0.003 * this.state.w, strokeDasharray: 0.006 * this.state.w }));
          var commands = (0, _svgPathParser.parseSVG)(svg.path);
          (0, _svgPathParser.makeAbsolute)(commands); // Note: mutates the commands in place!
          shapes.push(this.generateSvgNrAndAnchor(commands, svg.nr, svg.hasAnchor));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return shapes;
    }
  }, {
    key: 'generateSvgNrAndAnchor',
    value: function generateSvgNrAndAnchor(path, nr, hasAnchor) {
      var ixNr;
      var maxY = 0;
      var ixAnchor;
      var minY = 99999999;
      for (var i = 0, len = path.length; i < len; i++) {
        if (path[i].y > maxY) {
          ixNr = i;
          maxY = path[i].y;
        }
        if (path[i].y < minY) {
          ixAnchor = i;
          minY = path[i].y;
        }
      }
      var x = path[ixNr].x;
      var y = path[ixNr].y;
      var r = 0.012 * this.state.w;
      if (x < r) x = r;
      if (x > this.state.w - r) x = this.state.w - r;
      if (y < r) y = r;
      if (y > this.state.h - r) y = this.state.h - r;
      var anchor = null;
      if (hasAnchor === true) {
        anchor = _react2.default.createElement('circle', { className: 'buldreinfo-svg-ring', cx: path[ixAnchor].x, cy: path[ixAnchor].y, r: 0.006 * this.state.w });
      }
      return _react2.default.createElement(
        'g',
        { className: 'buldreinfo-svg-opacity' },
        _react2.default.createElement('circle', { className: 'buldreinfo-svg-ring', cx: x, cy: y, r: r }),
        _react2.default.createElement(
          'text',
          { className: 'buldreinfo-svg-routenr', x: x, y: y, fontSize: 0.02 * this.state.w },
          nr
        ),
        anchor
      );
    }
  }, {
    key: 'parsePath',
    value: function parsePath(d) {
      if (d) {
        var commands = (0, _svgPathParser.parseSVG)(d);
        (0, _svgPathParser.makeAbsolute)(commands); // Note: mutates the commands in place!
        return commands.map(function (c) {
          switch (c.code) {
            case "L":case "M":
              return { x: Math.round(c.x), y: Math.round(c.y) };
            case "C":
              return { x: Math.round(c.x), y: Math.round(c.y), c: [{ x: Math.round(c.x1), y: Math.round(c.y1) }, { x: Math.round(c.x2), y: Math.round(c.y2) }] };
            case "S":
              return { x: Math.round(c.x), y: Math.round(c.y), c: [{ x: Math.round(c.x0), y: Math.round(c.y0) }, { x: Math.round(c.x2), y: Math.round(c.y2) }] };
          }
        });
      }
      return [];
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      if (!this.state) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      } else if (this.state.error) {
        return _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(
            'h3',
            null,
            this.state.error.status
          ),
          this.state.error.toString()
        );
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }

      var circles = this.state.points.map(function (p, i, a) {
        var anchors = [];
        if (p.c) {
          anchors.push(_react2.default.createElement(
            'g',
            { className: 'buldreinfo-svg-edit-opacity' },
            _react2.default.createElement('line', { className: 'buldreinfo-svg-pointer buldreinfo-svg-route', x1: a[i - 1].x, y1: a[i - 1].y, x2: p.c[0].x, y2: p.c[0].y, strokeWidth: 0.0026 * _this4.state.w, strokeDasharray: 0.003 * _this4.state.w }),
            _react2.default.createElement('line', { className: 'buldreinfo-svg-pointer buldreinfo-svg-route', x1: p.x, y1: p.y, x2: p.c[1].x, y2: p.c[1].y, strokeWidth: 0.0026 * _this4.state.w, strokeDasharray: 0.003 * _this4.state.w }),
            _react2.default.createElement('circle', { className: 'buldreinfo-svg-pointer buldreinfo-svg-ring', cx: p.c[0].x, cy: p.c[0].y, r: 0.003 * _this4.state.w, onMouseDown: _this4.setDraggedCubic.bind(_this4, i, 0) }),
            _react2.default.createElement('circle', { className: 'buldreinfo-svg-pointer buldreinfo-svg-ring', cx: p.c[1].x, cy: p.c[1].y, r: 0.003 * _this4.state.w, onMouseDown: _this4.setDraggedCubic.bind(_this4, i, 1) })
          ));
        }
        return _react2.default.createElement(
          'g',
          { className: "buldreinfo-svg-ring-group" + (_this4.state.activePoint === i ? "  is-active" : "") },
          anchors,
          _react2.default.createElement('circle', { className: 'buldreinfo-svg-pointer buldreinfo-svg-ring', cx: p.x, cy: p.y, r: 0.003 * _this4.state.w, onMouseDown: _this4.setDraggedPoint.bind(_this4, i) })
        );
      });
      var path = this.generatePath();
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/browse' },
            'Browse'
          ),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/area/' + this.state.areaId },
            this.state.areaName
          ),
          ' ',
          this.state.areaVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          this.state.areaVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' }),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/sector/' + this.state.sectorId },
            this.state.sectorName
          ),
          ' ',
          this.state.sectorVisibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          this.state.sectorVisibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' }),
          ' / ',
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/problem/' + this.state.id },
            this.state.nr,
            ' ',
            this.state.name,
            ' ',
            this.state.grade
          ),
          ' ',
          this.state.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
          this.state.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          { bsSize: 'small', onMouseUp: this.cancelDragging.bind(this), onMouseLeave: this.cancelDragging.bind(this) },
          _react2.default.createElement(
            'form',
            { onSubmit: this.save.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsInfo' },
              _react2.default.createElement(
                _reactBootstrap.Alert,
                { bsStyle: 'info' },
                _react2.default.createElement(
                  'center',
                  null,
                  _react2.default.createElement(
                    'strong',
                    null,
                    'CTRL + CLICK'
                  ),
                  ' to add a point | ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'CLICK'
                  ),
                  ' to select a point | ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'CLICK AND DRAG'
                  ),
                  ' to move a point',
                  _react2.default.createElement('br', null),
                  _react2.default.createElement(
                    _reactBootstrap.ButtonGroup,
                    null,
                    this.state.activePoint !== 0 && _react2.default.createElement(
                      _reactBootstrap.DropdownButton,
                      { title: !!this.state.points[this.state.activePoint].c ? "Selected point: Curve to" : "Selected point: Line to", id: 'bg-nested-dropdown' },
                      _react2.default.createElement(
                        _reactBootstrap.MenuItem,
                        { eventKey: '0', onSelect: this.setPointType.bind(this, "L") },
                        'Selected point: Line to'
                      ),
                      _react2.default.createElement(
                        _reactBootstrap.MenuItem,
                        { eventKey: '1', onSelect: this.setPointType.bind(this, "C") },
                        'Selected point: Curve to'
                      )
                    ),
                    this.state.activePoint !== 0 && _react2.default.createElement(
                      _reactBootstrap.Button,
                      { onClick: this.removeActivePoint.bind(this) },
                      'Remove this point'
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.DropdownButton,
                      { title: this.state.hasAnchor === true ? "Route has anchor" : "No anchor on route", disabled: this.state.points.length === 0, id: 'bg-nested-dropdown' },
                      _react2.default.createElement(
                        _reactBootstrap.MenuItem,
                        { eventKey: '0', onSelect: this.setHasAnchor.bind(this, false) },
                        'No anchor on route'
                      ),
                      _react2.default.createElement(
                        _reactBootstrap.MenuItem,
                        { eventKey: '1', onSelect: this.setHasAnchor.bind(this, true) },
                        'Route has anchor'
                      )
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      { bsStyle: 'warning', disabled: this.state.points.length === 0, onClick: this.reset.bind(this) },
                      'Reset path'
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      { bsStyle: 'danger', onClick: this.onCancel.bind(this) },
                      'Cancel'
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      { type: 'submit', bsStyle: 'success' },
                      this.state.points.length >= 2 ? 'Save' : 'Delete path'
                    )
                  )
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsImage' },
              _react2.default.createElement(
                'svg',
                { viewBox: "0 0 " + this.state.w + " " + this.state.h, onClick: this.addPoint.bind(this), onMouseMove: this.handleMouseMove.bind(this) },
                _react2.default.createElement('image', { ref: 'buldreinfo-svg-edit-img', xlinkHref: _config2.default.getUrl('images?id=' + this.state.mediaId), width: '100%', height: '100%' }),
                this.parseReadOnlySvgs(),
                _react2.default.createElement('path', { className: 'buldreinfo-svg-route', d: path, strokeWidth: 0.002 * this.state.w }),
                circles
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsPath' },
              path
            )
          )
        )
      );
    }
  }]);

  return SvgEdit;
}(_react.Component);

exports.default = SvgEdit;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactMetaTags = __webpack_require__(8);

var _reactMetaTags2 = _interopRequireDefault(_reactMetaTags);

var _reactRouterDom = __webpack_require__(4);

var _reactRouterBootstrap = __webpack_require__(9);

var _reactBootstrap = __webpack_require__(1);

var _reactBootstrapTable = __webpack_require__(14);

var _chart = __webpack_require__(60);

var _chart2 = _interopRequireDefault(_chart);

var _tickModal = __webpack_require__(20);

var _tickModal2 = _interopRequireDefault(_tickModal);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var User = function (_Component) {
  _inherits(User, _Component);

  function User(props) {
    _classCallCheck(this, User);

    var _this = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this, props));

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data, showTickModal: false };
    return _this;
  }

  _createClass(User, [{
    key: 'refresh',
    value: function refresh(id) {
      var _this2 = this;

      this.props.fetchInitialData(id).then(function (data) {
        return _this2.setState(function () {
          return { data: data };
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.state.data) {
        this.refresh(this.props.match.params.userId);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.match.params.userId !== this.props.match.params.userId) {
        this.refresh(this.props.match.params.userId);
      }
    }
  }, {
    key: 'closeTickModal',
    value: function closeTickModal(event) {
      this.setState({ showTickModal: false });
      this.refresh(this.props.match.params.userId);
    }
  }, {
    key: 'openTickModal',
    value: function openTickModal(t, event) {
      this.setState({ currTick: t, showTickModal: true });
    }
  }, {
    key: 'formatName',
    value: function formatName(cell, row) {
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/problem/' + row.idProblem },
          row.name
        ),
        ' ',
        row.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
        row.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
      );
    }
  }, {
    key: 'formatComment',
    value: function formatComment(cell, row) {
      if (row.comment) {
        if (row.comment.length > 40) {
          var tooltip = _react2.default.createElement(
            _reactBootstrap.Tooltip,
            { id: row.idProblem },
            row.comment
          );
          return _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            { key: row.idProblem, placement: 'top', overlay: tooltip },
            _react2.default.createElement(
              'span',
              null,
              row.comment.substring(0, 40) + "..."
            )
          );
        } else {
          return row.comment;
        }
      }
      return "";
    }
  }, {
    key: 'formatStars',
    value: function formatStars(cell, row) {
      var stars = null;
      if (row.stars === 0.5) {
        stars = _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' });
      } else if (row.stars === 1.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 2 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else if (row.stars === 1.5) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 3 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
        );
      } else if (row.stars === 2.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 4 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else if (row.stars === 2.5) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 5 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star-half' })
        );
      } else if (row.stars === 3.0) {
        stars = _react2.default.createElement(
          'div',
          { style: { whiteSpace: 'nowrap' }, id: 6 },
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' })
        );
      } else {
        return "";
      }
      return _react2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: 'top', overlay: _react2.default.createElement(
            _reactBootstrap.Popover,
            { id: 0, title: 'Guidelines' },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Nice',
            _react2.default.createElement('br', null),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Very nice',
            _react2.default.createElement('br', null),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'star' }),
            ' Fantastic!'
          ) },
        stars
      );
    }
  }, {
    key: 'formatFa',
    value: function formatFa(cell, row) {
      if (cell) {
        return _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'check' });
      }
      return "";
    }
  }, {
    key: 'formatEdit',
    value: function formatEdit(cell, row) {
      if (this.state.data.readOnly == false && row.id != 0) {
        return _react2.default.createElement(
          _reactBootstrap.OverlayTrigger,
          { placement: 'top', overlay: _react2.default.createElement(
              _reactBootstrap.Tooltip,
              { id: row.id },
              'Edit tick'
            ) },
          _react2.default.createElement(
            _reactBootstrap.Button,
            { bsSize: 'xsmall', bsStyle: 'primary', onClick: this.openTickModal.bind(this, row) },
            _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'edit', inverse: true })
          )
        );
      }
      return "";
    }
  }, {
    key: 'sortDate',
    value: function sortDate(a, b, order) {
      var x = a.date ? (parseInt(a.date.substring(0, 2)) < 50 ? "20" : "19") + a.date : "";
      var y = b.date ? (parseInt(b.date.substring(0, 2)) < 50 ? "20" : "19") + b.date : "";
      if (order === 'asc') return x.localeCompare(y);
      return y.localeCompare(x);
    }
  }, {
    key: 'sortGrade',
    value: function sortGrade(a, b, order) {
      var x = a.gradeNumber ? a.gradeNumber : 0;
      var y = b.gradeNumber ? b.gradeNumber : 0;
      if (order === 'asc') {
        if (x < y) {
          return -1;
        } else if (x > y) {
          return 1;
        }
        return 0;
      }
      if (y < x) {
        return -1;
      } else if (y > x) {
        return 1;
      }
      return 0;
    }
  }, {
    key: 'sortComment',
    value: function sortComment(a, b, order) {
      var x = a.comment ? a.comment : "";
      var y = b.comment ? b.comment : "";
      if (order === 'asc') return x.localeCompare(y);
      return y.localeCompare(x);
    }
  }, {
    key: 'render',
    value: function render() {
      var data = this.state.data;

      if (!data) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      }

      var numTicks = data.ticks.filter(function (t) {
        return !t.fa;
      }).length;
      var numFas = data.ticks.filter(function (t) {
        return t.fa;
      }).length;

      var chart = data.ticks.length > 0 ? _react2.default.createElement(_chart2.default, { data: data.ticks }) : null;

      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactMetaTags2.default,
          null,
          _react2.default.createElement(
            'title',
            null,
            data.metadata.title
          ),
          _react2.default.createElement('meta', { name: 'description', content: data.metadata.description })
        ),
        this.state.currTick ? _react2.default.createElement(_tickModal2.default, { idTick: this.state.currTick.id, idProblem: this.state.currTick.idProblem, date: this.state.currTick.date, comment: this.state.currTick.comment, grade: this.state.currTick.grade, grades: data.metadata.grades, stars: this.state.currTick.stars, show: this.state.showTickModal, onHide: this.closeTickModal.bind(this) }) : "",
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _auth2.default.loggedIn() && currTick.user.readOnly == false ? _react2.default.createElement(
            'div',
            { style: { float: 'right' } },
            _react2.default.createElement(
              _reactBootstrap.OverlayTrigger,
              { placement: 'top', overlay: _react2.default.createElement(
                  _reactBootstrap.Tooltip,
                  { id: data.id },
                  'Edit user'
                ) },
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/user/' + data.id + '/edit' },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsStyle: 'primary', bsSize: 'xsmall' },
                  _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'edit', inverse: true })
                )
              )
            )
          ) : null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            data.name
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          { bsSize: 'small' },
          'First ascents: ',
          numFas,
          _react2.default.createElement('br', null),
          'Public ascents: ',
          numTicks,
          _react2.default.createElement('br', null),
          'Pictures taken: ',
          data.numImagesCreated,
          _react2.default.createElement('br', null),
          'Appearance in pictures: ',
          data.numImageTags,
          _react2.default.createElement('br', null),
          'Videos created: ',
          data.numVideosCreated,
          _react2.default.createElement('br', null),
          'Appearance in videos: ',
          data.numVideoTags
        ),
        chart,
        _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          {
            data: data.ticks,
            condensed: true,
            hover: true,
            columnFilter: false },
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'idProblem', isKey: true, hidden: true },
            'idProblem'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'dateHr', dataSort: true, sortFunc: this.sortDate.bind(this), dataAlign: 'center', width: '70' },
            'Date'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'name', dataSort: true, dataFormat: this.formatName.bind(this), width: '300' },
            'Name'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'grade', dataSort: true, sortFunc: this.sortGrade.bind(this), dataAlign: 'center', width: '70' },
            'Grade'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'comment', dataSort: true, sortFunc: this.sortComment.bind(this), dataFormat: this.formatComment.bind(this), width: '300' },
            'Comment'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'stars', dataSort: true, dataFormat: this.formatStars.bind(this), dataAlign: 'center', width: '70' },
            'Stars'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'fa', dataSort: true, dataFormat: this.formatFa.bind(this), dataAlign: 'center', width: '50' },
            'FA'
          ),
          _react2.default.createElement(
            _reactBootstrapTable.TableHeaderColumn,
            { dataField: 'edit', dataFormat: this.formatEdit.bind(this), dataAlign: 'center', width: '30' },
            ' '
          )
        )
      );
    }
  }]);

  return User;
}(_react.Component);

exports.default = User;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Chart = function (_Component) {
  _inherits(Chart, _Component);

  function Chart(props) {
    _classCallCheck(this, Chart);

    return _possibleConstructorReturn(this, (Chart.__proto__ || Object.getPrototypeOf(Chart)).call(this, props));
  }

  _createClass(Chart, [{
    key: 'render',
    value: function render() {
      var data = [];
      this.props.data.map(function (t) {
        var d = data.filter(function (val) {
          return val.gradeNumber === t.gradeNumber;
        });
        if (!d[0]) {
          data.push({ gradeNumber: t.gradeNumber, grade: t.grade, fa: t.fa ? 1 : 0, tick: t.fa ? 0 : 1 });
        } else {
          if (t.fa) {
            d[0].fa++;
          } else {
            d[0].tick++;
          }
        }
      });
      data.sort(function (a, b) {
        return b.gradeNumber - a.gradeNumber;
      });
      var maxValue = Math.max.apply(Math, data.map(function (d) {
        return d.fa + d.tick;
      }));

      var rows = data.map(function (d, i) {
        var faWidth = d.fa / maxValue * 100 + '%';
        var tickWidth = d.tick / maxValue * 100 + '%';
        var style = { padding: 0, textAlign: 'center' };
        return _react2.default.createElement(
          'tr',
          { key: i },
          _react2.default.createElement(
            'td',
            { style: style },
            d.grade
          ),
          _react2.default.createElement(
            'td',
            { style: style },
            d.fa
          ),
          _react2.default.createElement(
            'td',
            { style: style },
            d.tick
          ),
          _react2.default.createElement(
            'td',
            { style: style },
            _react2.default.createElement(
              'strong',
              null,
              d.fa + d.tick
            )
          ),
          _react2.default.createElement(
            'td',
            { style: { width: '100%', verticalAlign: 'middle' } },
            _react2.default.createElement('div', { style: { width: faWidth, height: '10px', backgroundColor: '#3182bd', float: 'left' } }),
            _react2.default.createElement('div', { style: { width: tickWidth, height: '10px', backgroundColor: '#6baed6', marginLeft: faWidth } })
          )
        );
      });

      return _react2.default.createElement(
        _reactBootstrap.Table,
        { responsive: true },
        _react2.default.createElement(
          'thead',
          null,
          _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement(
              'th',
              null,
              'Grade'
            ),
            _react2.default.createElement(
              'th',
              null,
              'FA'
            ),
            _react2.default.createElement(
              'th',
              null,
              'Tick'
            ),
            _react2.default.createElement(
              'th',
              null,
              'Total'
            ),
            _react2.default.createElement('th', null)
          )
        ),
        _react2.default.createElement(
          'tbody',
          null,
          rows
        )
      );
    }
  }]);

  return Chart;
}(_react.Component);

exports.default = Chart;

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(4);

var _reactRouter = __webpack_require__(7);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _reactBootstrap = __webpack_require__(1);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _reactFontawesome = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserEdit = function (_Component) {
  _inherits(UserEdit, _Component);

  function UserEdit(props) {
    _classCallCheck(this, UserEdit);

    return _possibleConstructorReturn(this, (UserEdit.__proto__ || Object.getPrototypeOf(UserEdit)).call(this, props));
  }

  _createClass(UserEdit, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      if (!_auth2.default.loggedIn()) {
        this.setState({ pushUrl: "/login" });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _superagent2.default.get(_config2.default.getUrl("users/edit?id=" + this.props.match.params.userId)).withCredentials().end(function (err, res) {
        if (err) {
          _this2.setState({ message: _react2.default.createElement(
              _reactBootstrap.Panel,
              { bsStyle: 'danger' },
              err.toString()
            ) });
        } else {
          _this2.setState({
            id: res.body.id,
            username: res.body.username,
            firstname: res.body.firstname,
            lastname: res.body.lastname,
            currentPassword: null,
            newPassword: null,
            newPassword2: null,
            message: null
          });
        }
      });
    }
  }, {
    key: 'save',
    value: function save(event) {
      var _this3 = this;

      event.preventDefault();
      if (this.validateFirstname(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid firstname.'
          ) });
      } else if (this.validateLastname(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid lastname.'
          ) });
      } else if (this.validateUsername(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid username.'
          ) });
      } else if (this.validateCurrentPassword(null) === 'error' || this.validateNewPassword(null) === 'error' || this.validateNewPassword2(null) === 'error') {
        this.setState({ message: _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'danger' },
            'Invalid password.'
          ) });
      } else {
        _superagent2.default.post(_config2.default.getUrl("users/edit")).withCredentials().send({ id: this.state.id, username: this.state.username, firstname: this.state.firstname, lastname: this.state.lastname, currentPassword: this.state.currentPassword, newPassword: this.state.newPassword }).set('Accept', 'application/json').end(function (err, res) {
          if (err) {
            _this3.setState({ message: _react2.default.createElement(
                _reactBootstrap.Panel,
                { bsStyle: 'danger' },
                err.toString()
              ) });
          } else {
            _this3.setState({ pushUrl: "/user" });
          }
        });
      }
    }
  }, {
    key: 'onCancel',
    value: function onCancel() {
      window.history.back();
    }
  }, {
    key: 'onFirstnameChanged',
    value: function onFirstnameChanged(e) {
      this.setState({ firstname: e.target.value });
    }
  }, {
    key: 'onLastnameChanged',
    value: function onLastnameChanged(e) {
      this.setState({ lastname: e.target.value });
    }
  }, {
    key: 'onUsernameChanged',
    value: function onUsernameChanged(e) {
      this.setState({ username: e.target.value });
    }
  }, {
    key: 'onCurrentPasswordChanged',
    value: function onCurrentPasswordChanged(e) {
      this.setState({ currentPassword: e.target.value });
    }
  }, {
    key: 'onNewPasswordChanged',
    value: function onNewPasswordChanged(e) {
      this.setState({ newPassword: e.target.value });
    }
  }, {
    key: 'onConfirmNewPasswordChanged',
    value: function onConfirmNewPasswordChanged(e) {
      this.setState({ newPassword2: e.target.value });
    }
  }, {
    key: 'validateFirstname',
    value: function validateFirstname() {
      if (this.state.firstname.length < 1) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validateLastname',
    value: function validateLastname() {
      if (this.state.lastname.length < 1) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validateUsername',
    value: function validateUsername() {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(this.state.username)) {
        return 'error';
      }
      return 'success';
    }
  }, {
    key: 'validateCurrentPassword',
    value: function validateCurrentPassword() {
      return 'success';
    }
  }, {
    key: 'validateNewPassword',
    value: function validateNewPassword() {
      if ((this.state.currentPassword || this.state.newPassword2) && !this.state.newPassword) return 'error';else if (this.state.newPassword && this.state.newPassword.length < 8) return 'error';
      return 'success';
    }
  }, {
    key: 'validateNewPassword2',
    value: function validateNewPassword2() {
      if ((this.state.currentPassword || this.state.newPassword) && !this.state.newPassword2) return 'error';else if (this.state.newPassword2 && this.state.newPassword2.length < 8) return 'error';else if (this.state.newPassword2 && this.state.newPassword != this.state.newPassword2) return 'error';
      return 'success';
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state) {
        return _react2.default.createElement(
          'center',
          null,
          _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'spinner', spin: true, size: '3x' })
        );
      } else if (this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }
      return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          _reactBootstrap.Breadcrumb,
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/' },
            'Home'
          ),
          ' / ',
          _react2.default.createElement(
            'font',
            { color: '#777' },
            'User edit'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Well,
          null,
          this.state.message,
          _react2.default.createElement(
            'form',
            { onSubmit: this.save.bind(this) },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsFirstname', validationState: this.validateFirstname() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Firstname'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.firstname, placeholder: 'Enter firstname', onChange: this.onFirstnameChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsLastname', validationState: this.validateLastname() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Lastname'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.lastname, placeholder: 'Enter lastname', onChange: this.onLastnameChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null)
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsUsername', validationState: this.validateUsername() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Username'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'email', value: this.state.username, placeholder: 'Enter username', onChange: this.onUsernameChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'You must enter a valid email address.'
              )
            ),
            _react2.default.createElement('hr', null),
            _react2.default.createElement(
              'h4',
              null,
              'Only fill following fields if you want to change your password'
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsCurrentPassword', validationState: this.validateCurrentPassword() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Current password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Enter current password', onChange: this.onCurrentPasswordChanged.bind(this) })
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsNewPassword', validationState: this.validateNewPassword() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'New password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Enter new password', onChange: this.onNewPasswordChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'At least 8 characters.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { controlId: 'formControlsNewPassword2', validationState: this.validateNewPassword2() },
              _react2.default.createElement(
                _reactBootstrap.ControlLabel,
                null,
                'Confirm new password'
              ),
              _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', placeholder: 'Confirm new password', onChange: this.onConfirmNewPasswordChanged.bind(this) }),
              _react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
              _react2.default.createElement(
                _reactBootstrap.HelpBlock,
                null,
                'Must match new password.'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.ButtonGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', onClick: this.onCancel.bind(this) },
                'Cancel'
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                { type: 'submit', bsStyle: 'success' },
                'Save'
              )
            )
          )
        )
      );
    }
  }]);

  return UserEdit;
}(_react.Component);

exports.default = UserEdit;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArea = getArea;
exports.getAreaEdit = getAreaEdit;
exports.getBrowse = getBrowse;
exports.getFinder = getFinder;
exports.getFrontpage = getFrontpage;
exports.getGrades = getGrades;
exports.getMeta = getMeta;
exports.getProblem = getProblem;
exports.getProblemEdit = getProblemEdit;
exports.getSector = getSector;
exports.getSectorEdit = getSectorEdit;
exports.getUser = getUser;
exports.getUserPassword = getUserPassword;
exports.getUserForgotPassword = getUserForgotPassword;
exports.postArea = postArea;
exports.postComment = postComment;
exports.postProblem = postProblem;
exports.postSearch = postSearch;
exports.postSector = postSector;
exports.postTicks = postTicks;
exports.postUserRegister = postUserRegister;

var _isomorphicFetch = __webpack_require__(63);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

__webpack_require__(70).polyfill();

function getArea(id) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas?id=' + id), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getAreaEdit(id) {
  if (id === -1) {
    return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta')).then(function (data) {
      return data.json();
    }).then(function (json) {
      return { id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: { title: 'New area | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter } };
    }).catch(function (error) {
      console.warn(error);
      return null;
    });
  } else {
    return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas?id=' + id), { credentials: 'include' }).then(function (data) {
      return data.json();
    }).then(function (json) {
      return { id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, newMedia: [], metadata: res.metadata };
    }).catch(function (error) {
      console.warn(error);
      return null;
    });
  }
}

function getBrowse() {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/browse'), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getFinder(grade) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/finder?grade=' + grade), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getFrontpage() {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/frontpage'), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getGrades() {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/grades')).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getMeta() {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta')).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getProblem(id) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/problems?id=' + id), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).then(function (json) {
    return json[0];
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getProblemEdit(id) {
  if (id === -1) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var faDate = y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta')).then(function (data) {
      return data.json();
    }).then(function (json) {
      return { id: -1, visibility: 0, name: '', comment: '', originalGrade: 'n/a', fa: [], faDate: faDate, nr: 0, lat: 0, lng: 0, newMedia: [], metadata: { title: 'New problem | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, grades: res.metadata.grades, types: res.metadata.types } };
    }).catch(function (error) {
      console.warn(error);
      return null;
    });
  } else {
    return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/problems?id=' + id), { credentials: 'include' }).then(function (data) {
      return data.json();
    }).then(function (json) {
      return { id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, originalGrade: res.originalGrade, fa: res.fa, faDate: res.faDate, nr: res.nr, typeId: res.t.id, lat: res.lat, lng: res.lng, sections: res.sections, metadata: res.metadata };
    }).catch(function (error) {
      console.warn(error);
      return null;
    });
  }
}

function getSector(id) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/sectors?id=' + id), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getSectorEdit(id) {
  if (id === -1) {
    return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta')).then(function (data) {
      return data.json();
    }).then(function (json) {
      return { id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: { title: 'New sector | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter } };
    }).catch(function (error) {
      console.warn(error);
      return null;
    });
  } else {
    return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/sectors?id=' + id), { credentials: 'include' }).then(function (data) {
      return data.json();
    }).then(function (json) {
      return { id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, newMedia: [], metadata: res.metadata };
    }).catch(function (error) {
      console.warn(error);
      return null;
    });
  }
}

function getUser(id) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users?id=' + id), { credentials: 'include' }).then(function (data) {
    return data.json();
  }).catch(function (error) {
    console.warn(error);
    return null;
  });
}

function getUserPassword(token, password) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/password?token=' + token + '&password=' + password));
}

function getUserForgotPassword(username) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/forgotPassword?username=' + username));
}

function postArea(id, visibility, name, comment, lat, lng, newMedia) {
  var formData = new FormData();
  formData.append('json', JSON.stringify({ id: id, visibility: visibility, name: name, comment: comment, lat: lat, lng: lng, newMedia: newMedia }));
  newMedia.forEach(function (m) {
    return formData.append(m.file.name.replace(/[^-a-z0-9.]/ig, '_'), m.file);
  });
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas'), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then(function (data) {
    return data.json();
  });
}

function postComment(idProblem, comment) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/comments'), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ idProblem: idProblem, comment: comment }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function postProblem(sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia) {
  var formData = new FormData();
  formData.append('json', JSON.stringify({ sectorId: sectorId, id: id, visibility: visibility, name: name, comment: comment, originalGrade: originalGrade, fa: fa, faDate: faDate, nr: nr, t: t, lat: lat, lng: lng, sections: sections, newMedia: newMedia }));
  newMedia.forEach(function (m) {
    return formData.append(m.file.name.replace(/[^-a-z0-9.]/ig, '_'), m.file);
  });
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/problems'), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then(function (data) {
    return data.json();
  });
}

function postSearch(value) {
  return (0, _isomorphicFetch2.default)("https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/search", {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ value: value }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then(function (data) {
    return data.json();
  });
}

function postSector(areaId, id, visibility, name, comment, lat, lng, newMedia) {
  var formData = new FormData();
  formData.append('json', JSON.stringify({ areaId: areaId, id: id, visibility: visibility, name: name, comment: comment, lat: lat, lng: lng, newMedia: newMedia }));
  newMedia.forEach(function (m) {
    return formData.append(m.file.name.replace(/[^-a-z0-9.]/ig, '_'), m.file);
  });
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/sectors'), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then(function (data) {
    return data.json();
  });
}

function postTicks(del, id, idProblem, comment, date, stars, grade) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/ticks'), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ delete: del, id: id, idProblem: idProblem, comment: comment, date: date, stars: stars, grade: grade }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function postUserRegister(firstname, lastname, username, password) {
  return (0, _isomorphicFetch2.default)(encodeURI('https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/register'), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ firstname: firstname, lastname: lastname, username: username, password: password }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/***/ }),
/* 63 */
/***/ (function(module, exports) {

module.exports = require("isomorphic-fetch");

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = __webpack_require__(1);

var _reactRouterBootstrap = __webpack_require__(9);

var _superagent = __webpack_require__(3);

var _superagent2 = _interopRequireDefault(_superagent);

var _auth = __webpack_require__(6);

var _auth2 = _interopRequireDefault(_auth);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _Async = __webpack_require__(65);

var _Async2 = _interopRequireDefault(_Async);

var _reactSelect = __webpack_require__(66);

var _reactRouter = __webpack_require__(7);

var _reactAvatar = __webpack_require__(67);

var _reactAvatar2 = _interopRequireDefault(_reactAvatar);

var _reactFontawesome = __webpack_require__(5);

var _api = __webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CustomOption = function CustomOption(props) {
  var bg = "#4caf50";
  if (props.value.avatar === 'A') {
    bg = "#ff5722";
  } else if (props.value.avatar === 'S') {
    bg = "#673ab7";
  }
  return _react2.default.createElement(
    _reactSelect.components.Option,
    props,
    _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(_reactAvatar2.default, { value: props.value.avatar ? props.value.avatar : "7A", size: 25, color: bg, round: true, textSizeRatio: 2.25, style: { marginRight: '10px' } }),
      props.label,
      ' ',
      props.value.visibility === 1 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'lock' }),
      props.value.visibility === 2 && _react2.default.createElement(_reactFontawesome.FontAwesomeIcon, { icon: 'user-secret' })
    )
  );
};

var Navigation = function (_Component) {
  _inherits(Navigation, _Component);

  function Navigation(props) {
    _classCallCheck(this, Navigation);

    var _this = _possibleConstructorReturn(this, (Navigation.__proto__ || Object.getPrototypeOf(Navigation)).call(this, props));

    _this.state = {
      logo: '/png/buldreinfo_logo_gray.png',
      loggedIn: _auth2.default.loggedIn()
    };
    return _this;
  }

  _createClass(Navigation, [{
    key: 'updateAuth',
    value: function updateAuth(loggedIn) {
      this.setState({ loggedIn: !!loggedIn });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState({ pushUrl: null });
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      _auth2.default.onChange = this.updateAuth.bind(this);
      _auth2.default.login();
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _superagent2.default.get(_config2.default.getUrl("grades")).end(function (err, res) {
        _this2.setState({
          error: err ? err : null,
          grades: err ? null : res.body
        });
      });
    }
  }, {
    key: 'hoverImage',
    value: function hoverImage(hover) {
      var logo = hover ? '/png/buldreinfo_logo_white.png' : '/png/buldreinfo_logo_gray.png';
      this.setState({ logo: logo });
    }
  }, {
    key: 'search',
    value: function search(input, callback) {
      if (input) {
        (0, _api.postSearch)(input).then(function (res) {
          var options = res.map(function (s) {
            return { value: s, label: s.value };
          });
          callback(options);
        });
      } else {
        callback(null);
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(props) {
      if (props && props.value && props.value.url) {
        this.setState({ pushUrl: props.value.url });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state && this.state.pushUrl) {
        return _react2.default.createElement(_reactRouter.Redirect, { to: this.state.pushUrl, push: true });
      }
      return _react2.default.createElement(
        _reactBootstrap.Navbar,
        { inverse: true },
        _react2.default.createElement(
          _reactBootstrap.Navbar.Header,
          null,
          _react2.default.createElement(
            _reactBootstrap.Navbar.Brand,
            null,
            _react2.default.createElement(
              _reactRouterBootstrap.LinkContainer,
              { to: '/' },
              _react2.default.createElement(
                'a',
                { href: '/', onMouseOver: this.hoverImage.bind(this, true), onMouseOut: this.hoverImage.bind(this, false) },
                _react2.default.createElement('img', { src: this.state.logo })
              )
            )
          ),
          _react2.default.createElement(_reactBootstrap.Navbar.Toggle, null)
        ),
        _react2.default.createElement(
          _reactBootstrap.Navbar.Collapse,
          null,
          _react2.default.createElement(
            _reactBootstrap.Nav,
            null,
            _react2.default.createElement(
              _reactRouterBootstrap.LinkContainer,
              { to: '/browse' },
              _react2.default.createElement(
                _reactBootstrap.NavItem,
                { eventKey: 1 },
                'Browse'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.NavDropdown,
              { eventKey: 2, title: 'Finder', id: 'basic-nav-dropdown' },
              _auth2.default.isSuperAdmin() && _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/finder/-1' },
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: 2.0 },
                  'Grade: ',
                  _react2.default.createElement(
                    'strong',
                    null,
                    'superadmin'
                  )
                )
              ),
              this.state && this.state.grades && this.state.grades.map(function (g, i) {
                return _react2.default.createElement(
                  _reactRouterBootstrap.LinkContainer,
                  { key: "2." + i, to: "/finder/" + g.id },
                  _react2.default.createElement(
                    _reactBootstrap.MenuItem,
                    { eventKey: "3." + i },
                    'Grade: ',
                    _react2.default.createElement(
                      'strong',
                      null,
                      g.grade
                    )
                  )
                );
              })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Navbar.Form,
            { pullLeft: true },
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              { style: { width: '350px' } },
              _react2.default.createElement(_Async2.default, {
                instanceId: 'buldreinfo-navigation-search',
                placeholder: 'Search',
                loadOptions: this.search.bind(this),
                filterOptions: function filterOptions(options, filter, currentValues) {
                  // Do no filtering, just return all options
                  return options;
                },
                ignoreAccents: false // Keep special characters ae, oe, aa. Don't substitute...
                , onChange: this.onChange.bind(this),
                components: { Option: CustomOption }
              })
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Nav,
            { pullRight: true },
            this.state.loggedIn ? _react2.default.createElement(
              _reactBootstrap.NavDropdown,
              { eventKey: 4, title: 'Logged in', id: 'basic-nav-dropdown' },
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/user' },
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: 4.1 },
                  'My profile'
                )
              ),
              _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/logout' },
                _react2.default.createElement(
                  _reactBootstrap.MenuItem,
                  { eventKey: 4.2 },
                  'Log out'
                )
              )
            ) : _react2.default.createElement(
              _reactRouterBootstrap.LinkContainer,
              { to: '/login' },
              _react2.default.createElement(
                _reactBootstrap.NavItem,
                { eventKey: 5 },
                'Sign in'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.NavDropdown,
              { eventKey: 6, title: 'More', id: 'basic-nav-dropdown' },
              _react2.default.createElement(
                _reactRouterBootstrap.LinkContainer,
                { to: '/ethics' },
                _react2.default.createElement(
                  _reactBootstrap.NavItem,
                  { eventKey: 6.0 },
                  'Ethics'
                )
              ),
              _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.1, href: 'mailto:jostein.oygarden@gmail.com' },
                'Contact'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.2, href: '/gpl-3.0.txt', rel: 'noopener', target: '_blank' },
                'GNU Public License'
              ),
              _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.3, href: 'https://buldreinfo.com', rel: 'noopener', target: '_blank' },
                'buldreinfo.com'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.4, href: 'https://buldring.bergen-klatreklubb.no', rel: 'noopener', target: '_blank' },
                'buldring.bergen-klatreklubb.no'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.5, href: 'https://buldring.fredrikstadklatreklubb.org', rel: 'noopener', target: '_blank' },
                'buldring.fredrikstadklatreklubb.org'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.6, href: 'https://buldring.jotunheimenfjellsport.com', rel: 'noopener', target: '_blank' },
                'buldring.jotunheimenfjellsport.com'
              ),
              _react2.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.7, href: 'https://brattelinjer.no', rel: 'noopener', target: '_blank' },
                'brattelinjer.no'
              ),
              _react2.default.createElement(
                _reactBootstrap.MenuItem,
                { eventKey: 6.7, href: 'https://klatring.jotunheimenfjellsport.com', rel: 'noopener', target: '_blank' },
                'klatring.jotunheimenfjellsport.com'
              )
            )
          )
        )
      );
    }
  }]);

  return Navigation;
}(_react.Component);

exports.default = Navigation;

/***/ }),
/* 65 */
/***/ (function(module, exports) {

module.exports = require("react-select/lib/Async");

/***/ }),
/* 66 */
/***/ (function(module, exports) {

module.exports = require("react-select");

/***/ }),
/* 67 */
/***/ (function(module, exports) {

module.exports = require("react-avatar");

/***/ }),
/* 68 */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/fontawesome-svg-core");

/***/ }),
/* 69 */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/free-solid-svg-icons");

/***/ }),
/* 70 */
/***/ (function(module, exports) {

module.exports = require("es6-promise");

/***/ })
/******/ ]);