
// A place for our globals
window.MinnPost = window.MinnPost || {};

(function(window, $, undefined) {
  var MapView = window.MinnPost.MapView = Backbone.View.extend({
    // Easy place for options
    options: {
      'dataPath': './data/',
      'proxyPrefix': 'https://mp-jsonproxy.herokuapp.com/proxy?callback=?&url=',
      'mapOptions': {
        'minZoom': 3,
        'maxZoom': 11
      },
      'mapID': 'map',
      'mapDefaultCenter': new L.LatLng(46.49839225859763, -93.6474609375),
      'mapDefaultZoom': 6,
      'mapDefaultLayer': 'Minnesota State House Districts',
      'mapMNBounds': [43.499356, -97.239209, 49.384358, -89.489226],
      'mapGeocodeURL': 'https://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=?&countrycodes=us&limit=1&q=',
      'applicationSelector': '#minnpost-election-map-2012-application',
      'boundaryURL': 'https://boundaries.minnpost.com/1.0/boundary/?sets=state-house-districts-2012,state-senate-districts-2012&callback=?&contains=',
      'translateLayerToBoundary': {
        'Minnesota State House Districts': 'Minnesota State House district',
        'Minnesota State Senate Districts': 'Minnesota State Senate district'
      },
      'translateLayerToDistrict': {
        'Minnesota State House Districts': 'State Representative District ',
        'Minnesota State Senate Districts': 'State Senator District '
      }
    },
    
    // Some placeholders
    candidates: {},
    mapLayers: {},
    mapOverlays: {},
    
    // Default marker
    marker: new L.CircleMarker(new L.LatLng(0, 0), {
      'color': '#4A9666',
      'weight': 1,
      'opacity': 0.9,
      'fillColor': '#63B2A7',
      'fillOpacity': 0.6,
      'radius': 8,
      'clickable': false
    }),
    
    // Init funciton
    initialize: function(options) {
      this.options = _.extend(this.options, options);
    
      if (this.isIE7()) {
        this.options.mapOptions.doubleClickZoom = false;
      }
    
      this.loadCandidates();
      this.drawMap();
      this.drawSide();
      this.drawLayerSwitcher();
      this.initAddressSearch();
      
    },
    
    // IE7 test.  Ran into some serious issues with IE7 so
    // need to turn off things.  :(
    isIE7: function() {
      return ($.browser.msie && $.browser.version == 7);
    },
    
    // Clear marker off map
    clearMarker: function() {
      if (this.marker !== undefined && this.map !== undefined) {
        this.map.removeLayer(this.marker);
      }
    },
    
    // Address found
    renderAddressFound: function() {
      if (this.addressFound === undefined || _.isEmpty(this.addressFound)) {
        return this;
      }
      var point = new L.LatLng(this.addressFound.lat, this.addressFound.lon);
      var b;
      var boundary;
      var district;
      var template;
      var $popup = $('.map-popup-container');
      
      // Place marker
      this.lastFound = 'address';
      this.marker.setLatLng(point);
      this.map.setView(point, 10);
      this.map.addLayer(this.marker);
      
      // Determine district
      boundary = this.options.translateLayerToBoundary[this.currentLayer];
      district = this.options.translateLayerToDistrict[this.currentLayer];
      for (b in this.addressFound.boundaries.objects) {
        if (this.addressFound.boundaries.objects[b].kind == boundary) {
          template = _.template($("#template-popup-contents").html(), {
            tileData: {},
            cands: this.getCandidates(district + this.addressFound.boundaries.objects[b].name),
            title: district + this.addressFound.boundaries.objects[b].name
          });
          
          $popup.html(template);
          $popup.fadeIn('fast');
        }
      }
      
      return this;
    },
    
    // Load candidates
    initAddressSearch: function() {
      var thisView = this;
        
      $('form#search-address-form').submit(function(e) {
        e.preventDefault();
        var address = $('input#search-address-input').val();
        if (address === '') {
          return;
        }
        
        $('.search-status').removeClass('error').html('Searching...');
      
        // Geocode address using Mapquest becuase its terms of service are more open,
        // though its geocoding is not the best.
        $.getJSON(thisView.options.mapGeocodeURL + encodeURI(address), function(value) {
          var mnBounds = thisView.options.mapMNBounds;
          value = value[0];
          if (value === undefined) {
            thisView.showAddressStatus('error', 'We were unable turn your search terms, ' + address + 
              ', into a geographical location.  Please be more specific, such as including ZIP code.');
          }
          // Check we are still mostly in Minnesota
          else if (value.lat < mnBounds[0] || value.lat > mnBounds[2] || 
            value.lon < mnBounds[1] || value.lon > mnBounds[3]) {
            thisView.showAddressStatus('error', 'Sorry, but what you are looking for is outside of Minnesota.');
          }
          else {
            // Use boundary service
            $.getJSON(thisView.options.boundaryURL + encodeURI(value.lat) + ',' + encodeURI(value.lon), function(data) {
              if (data.meta.total_count === undefined || data.meta.total_count === 0) {
                thisView.showAddressStatus('error', 'Sorry, we were unable to determine the district from that address.');
              }
              else {
                $('.search-status').fadeOut('fast');
                thisView.addressFound = {
                  lat: value.lat,
                  lon: value.lon,
                  boundaries: data
                };
                thisView.clearMarker();
                thisView.renderAddressFound();
              }
            });
          }
        });
        
        return this;
      });
    },
    
    // Status and erros for address search
    showAddressStatus: function(type, status) {
      $('.search-status').html(status);
      $('.search-status').fadeIn('fast');
      if (type == 'error') {
        $('.search-status').addClass('error');
      }
      else {
        $('.search-status').removeClass('error');
      }
      return this;
    },
    
    // Load candidates
    loadCandidates: function() {
      var thisView = this;
      var dataSource = this.options.dataPath + 'minnesota_registered_candidates.json';
      
      // If the data path is not relative, then use JSONP
      if (dataSource.indexOf('http') === 0) {
        dataSource = this.options.proxyPrefix + encodeURI(dataSource);
      }
      
      $.getJSON(dataSource, function(candData) {
        thisView.candidates = candData;
      });
      
      return this;
    },
    
    // Get Candidates
    getCandidates: function(office) {
      var found = [];
    
      if (!_.isEmpty(this.candidates)) {
        found = _.filter(this.candidates, function(cand) {
          return (cand.office == office) ? true : false;
        });
      }
      return found;
    },
    
    // Handles drawing layer switcher content.  Note that Wax does not really
    // support multiple interactions on the map, so we have to rebuild it
    // each time (mostly it was IE7 that did not like this)
    drawLayerSwitcher: function() {
      var thisView = this;
      var s;
      
      // For each data layer, add link
      var template = _.template($("#template-layer-switcher").html(), {
        layers: this.mapOverlays,
        defaultLayer: this.options.mapDefaultLayer
      });
      
      $('.layer-switcher-container').append(template);
      
      // Click events
      $('.layer-switcher-container li a').click(function(e) {
        e.preventDefault();
        var thisLayer = $(this).attr('data-id');
        var l;
        
        if (thisLayer == thisView.currentLayer) {
          return;
        }
        thisView.currentLayer = thisLayer;
        
        // Hide popup
        $('.map-popup-container').fadeOut('fast');
        
        // Handle list classes
        $('.layer-switcher-container li a').removeClass('active');
        $(this).addClass('active');
        
        // Go through layers and hide others and remove interactions
        for (l in thisView.mapOverlays) {
          if (l != thisLayer) {
            thisView.map.removeLayer(thisView.mapOverlays[l]);
          }
        }
        
        // Show the one we want;
        thisView.map.addLayer(thisView.mapOverlays[thisLayer]);
        
        // If last found is address, re-render address, otherwise
        // remove marker
        if (thisView.lastFound !== undefined && thisView.lastFound == 'address') {
          thisView.renderAddressFound();
        }
        else {
          thisView.clearMarker();
        }
      });
      
      return this;
    },
    
    // Create interaction object
    createInteraction: function(layer, name) {
      var thisView = this;
      
      layer
        .on('mousemove', function(e) {
          // Remove leading zero
          if (e.data.DISTRICT.indexOf('0') === 0) {
            e.data.DISTRICT = e.data.DISTRICT.slice(1);
          }
          
          var prefx = thisView.options.translateLayerToDistrict[name];
          var $popup = $('.map-popup-container');
          var template = _.template($("#template-popup-contents").html(), {
            tileData: e.data,
            cands: thisView.getCandidates(prefx + e.data.DISTRICT),
            title: prefx + e.data.DISTRICT
          });
          
          $popup.html(template);
          $popup.fadeIn('fast');
        })
        .on('mouseout', function(e) {
          thisView.map._container.style.cursor = 'default';
        });
    },
    
    // Handles drawing side view
    drawSide: function() {
      var data = (this.isIE7()) ? { 'isIE7': true } : { 'isIE7': false };
      var template = _.template($("#template-side-column").html(), data);
      $(this.options.applicationSelector).append(template);
      
      // Move map over, and append
      $('#map').css({ width: '60%' });
      $('.side-column').css({ width: '40%', float: 'left' });
      this.map.invalidateSize();
      
      return this;
    },
    
    // Handles drawing map
    drawMap: function() {
      var thisView = this;
      this.clickCount = 0;
      
      this.map = new L.Map(this.options.mapID, this.options.mapOptions);
      this.addMapLayers();
      this.map.setView(this.options.mapDefaultCenter, this.options.mapDefaultZoom);
      //this.map.addControl(new L.Control.Fullscreen());
      
      // Move attributioin to footnotes
      this.map.attributionControl.setPrefix('');
      $('.footnote').eq(0).html($('.footnote').html() + ' ' + this.map.attributionControl._container.innerHTML);
      this.map.removeControl(this.map.attributionControl);
      
      // Add a marker on click.  Hack around double click
      if (!this.isIE7()) {
        this.map.on('click', function(e) {
          thisView.clickCount += 1;
          if (thisView.clickCount <= 1) {
            _.delay(function() {
              if (thisView.clickCount <= 1) {
                thisView.lastFound = 'click';
                thisView.clearMarker();
                thisView.marker.setLatLng(e.latlng);
                thisView.map.addLayer(thisView.marker);
              }
              thisView.clickCount = 0;
            }, 500);
          }
        });
      }
      
      return this;
    },
    
    // Map layers
    addMapLayers: function() {
      var thisView = this;
      var baselayers = {};
      var overlays = {};
      
      
      // Mapbox base layer
      this.mapLayers.mapboxBase = L.mapbox.tileLayer('minnpost.map-wi88b700', {
        attribution: 'Some map imagery from <a target="_blank" href="https://mapbox.com">Mapbox</a>'
      });
      this.map.addLayer(this.mapLayers.mapboxBase);
      
      this.mapOverlays['Minnesota State House Districts'] = L.mapbox.tileLayer('minnpost.mn-2012-state-leg-leaning');
      this.mapOverlays['Minnesota State Senate Districts'] = L.mapbox.tileLayer('minnpost.mn-2012-state-sen-leaning');
      
      // Activate the default interactions
      thisView.createInteraction(this.mapOverlays['Minnesota State House Districts'], 'Minnesota State House Districts');
      thisView.createInteraction(this.mapOverlays['Minnesota State Senate Districts'], 'Minnesota State Senate Districts');
      
      this.map.addLayer(this.mapOverlays['Minnesota State House Districts']);
      this.currentLayer = this.mapOverlays['Minnesota State House Districts'];
      
      return this;
    }
  });
})(window, jQuery);