var geojson = [
{"properties":{"name":"pneumatic-tube-terminus","fullname":"Queen City Pneumatic Terminus","zoom":20},"geometry":{"type":"Point","coordinates":[-73.21471452713013,44.467371477963596]}},
{"properties":{"name":"howard-opera-house","fullname":"Howard Opera House","zoom":20},"geometry":{"type":"Point","coordinates":[-73.2128088176,44.47788212]}},
{"properties":{"name":"masonic-temple","fullname":"Masonic Temple","zoom":20},"geometry":{"type":"Point","coordinates":[-73.2130515575409,44.48023319621741]}},
{"properties":{"name":"city-hall","fullname":"City Hall","zoom":20},"geometry":{"type":"Point","coordinates":[-73.21285843849182,44.47632139022349]}},
{"properties":{"name":"juniper-island","fullname":"Juniper Island","zoom":15},"geometry":{"type":"Point","coordinates":[-73.27657699584961,44.45057041820037]}},
{"properties":{"name":"crescent-beach-country-club","fullname":"Crescent Beach Country Club","zoom":17},"geometry":{"type":"Point","coordinates":[-73.22370529174805,44.45764675005933]}},
{"properties":{"name":"steamboat-wharf","fullname":"Steamboat Wharf","zoom":17},"geometry":{"type":"Point","coordinates":[-73.22091579437256,44.47341990093129]}},
{"properties":{"name":"union-station","fullname":"Union Station","zoom":20},"geometry":{"type":"Point","coordinates":[-73.22064355,44.477482136]}},
{"properties":{"name":"battery-park","fullname":"Battery Park","zoom":20},"geometry":{"type":"Point","coordinates":[-73.21960687637329,44.48060063222989]}},
{"properties":{"name":"northern-lake","fullname":"Lake Champlain North of Juniper Island","zoom":15},"geometry":{"type":"Point","coordinates":[-73.25700759887695,44.47421610232863]}},
{"properties":{"name":"southern-lake","fullname":"Lake Champlain South of Juniper Island","zoom":15},"geometry":{"type":"Point","coordinates":[-73.25082778930664,44.44897735945844]}},
{"properties":{"name":"burlington","fullname":"Burlington","zoom":13},"geometry":{"type":"Point","coordinates":[-73.21512222290038,44.47556349533111]}}
];

var tilebase = mapbox.layer().tilejson({
  tiles: [ "https://s3.amazonaws.com/geosprocket/tiles/btv1894-4/{z}/{x}/{y}.png" ]
  //tiles: [ "http://tile.stamen.com/toner/{z}/{x}/{y}.png" ]
  // tiles: [ "http://tiles.mapbox.com/v3/brettchalupa.map-dnpsh1y1/{z}/{x}/{y}.png" ]
  //tiles: [ "http://a.tiles.mapbox.com/v3/gahlord.bm,landplanner.sanborn-1894/{z}/{x}/{y}.png" ]
  //tiles: [ "https://s3.amazonaws.com/btv-1894/{z}/{x}/{y}.png" ]
});

var sanborn = mapbox.layer().tilejson({
  //tiles: [ "http://tiles.mapbox.com/v3/landplanner.sanborn-1894/{z}/{x}/{y}.png" ]
//  tiles: [ "http://tile.stamen.com/toner/{z}/{x}/{y}.png" ]
  // tiles: [ "http://tiles.mapbox.com/v3/brettchalupa.map-dnpsh1y1/{z}/{x}/{y}.png" ]
  //tiles: [ "http://a.tiles.mapbox.com/v3/gahlord.bm/{z}/{x}/{y}.png" ]
  tiles: [ "https://s3.amazonaws.com/geosprocket/tiles/btv1894-5/{z}/{x}/{y}.png" ]

});

var spots = mapbox.markers.layer()
  // Load up markers from geojson data.
  .features(geojson)
  // Define a new factory function. Takes geojson input and returns a
  // DOM element that represents the point.
  .factory(function(f) {
    var el = document.createElement('div');
    el.className = 'spot spot-' + f.properties.name;
    return el;
  });

// Creates the map with tile and marker layers and
// no input handlers (mouse drag, scrollwheel, etc).
var map = mapbox.map('map', [tilebase, sanborn, spots], null, []);
map.setZoomRange(3, 20);
        

// Array of story section elements.
var sections = $('.card');

// Array of marker elements with order matching section elements.
var markers = _(sections).map(function(section) {
  return _(spots.markers()).find(function(m) {
    var n = section.className.indexOf(m.data.properties.name);
    if (n === -1) {
      return false
    } else {
      return true
    }
  });
});

// create a section cache2
var previousSection = sections[0]

// Helper to set the active section.
var setActive = function(index, ease) {
  // Set active class on sections, markers.
  _(sections).each(function(s) { s.className = s.className.replace(' active', '') });
  _(markers).each(function(m) {
    m.element.className = m.element.className.replace(' active', '');
  });

  sections[index].className += ' active';
  markers[index].element.className += ' active';


  // for (var i=0; i < markerLayer.markers().length; i++) {
  //   if (markerLayer.markers()[i].data.properties.name === markers[index].data.properties.name) {
  //     markerLayer.markers()[i].showTooltip();
  //   }
  // }


  // Set a body class for the active section.
  document.body.className = 'section-' + index;

  // Ease map to active marker.
  if (!ease) {
    map.centerzoom(markers[index].location, markers[index].data.properties.zoom||13);
  } else {
    // original
    //map.ease.location(markers[index].location).zoom(markers[index].data.properties.zoom||13).optimal(0.5, 1.00);
    map.ease.location(markers[index].location).zoom(markers[index].data.properties.zoom||13).optimal(1.2, 1.4);
  }

  // in setActive() we need to see if there is audio in that section
  // if there is audio and it has not been played then play it
  // if it is currently playing then pause it
  var previousSectionAudios = $(previousSection).find("audio");

  _(previousSectionAudios).each(function(a) {
    if (a.playing) {
      a.pause();
    }
  });

  var audio = $(sections[index]).find("audio")[0];
  if (audio != undefined) {
    if (audio.currentTime == 0.0) {
      var delay = $(audio).data("delay");

      if (delay != undefined) {
        setTimeout(function() { audio.play(); }, delay)
      } else {
        audio.play();
      }
    }
  }

  // also loop through and pause other audio when a new one starts
  // i could cache the current playing one and pause that, that would be best
  if (sections[index].id != previousSection.id) {
    previousSection = sections[index];
  }

  return true;
};

// Bind to scroll events to find the active section.
window.onscroll = _(function() {
  // IE 8
  if (window.pageYOffset === undefined) {
    var y = document.documentElement.scrollTop;
    var h = document.documentElement.clientHeight;
  } else {
    var y = window.pageYOffset;
    var h = window.innerHeight;
  }

  // If scrolled to the very top of the page set the first section active.
  if (y === 0) return setActive(0, true);

  // Otherwise, conditionally determine the extent to which page must be
  // scrolled for each section. The first section that matches the current
  // scroll position wins and exits the loop early.
  var memo = 0;
  var buffer = (h * 0.3333);
  var active = _(sections).any(function(el, index) {
    memo += el.offsetHeight;
    return y < (memo-buffer) ? setActive(index, true) : false;
  });

  // If no section was set active the user has scrolled past the last section.
  // Set the last section active.
  if (!active) setActive(sections.length - 1, true);
}).debounce(10);

// Set map to first section.
setActive(0, false);

$(document).ready( function(){
  var browser_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var browser_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  var section_padding = parseInt($(".cover").css("padding"));

  function setCoverSize() {
    var cover_content_height = $(".cover .content").height();
    var fin_content_height = $(".fin .content").height();
    $(".cover").css("height", browser_height - section_padding * 2);
    $(".cover").css("width", browser_width - section_padding * 2);
    $(".fin").css("width", browser_width - section_padding * 2);
    $(".cover .content").css("padding", browser_height / 2 - cover_content_height / 2 + "px 0");
    // $(".fin .content").css("padding", browser_height / 2 - fin_content_height + "px 0");
  }

  setCoverSize();

  $(window).resize(function() {
    browser_width = window.innerWidth ||document.documentElement.clientWidth || document.body.clientWidth;
    browser_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    setCoverSize();
  });
});