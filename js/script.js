// the geojson coordinates of the locations
var geojson = [
  { "geometry": { "type": "Point", "coordinates": [-120.4657, 40.5695] },
    "properties": { "name": "burlington", "zoom": 5 } },
  { "geometry": { "type": "Point", "coordinates": [-118.5140, 34.8576] },
    "properties": { "name": "union-station" } },
  { "geometry": { "type": "Point", "coordinates": [-118.2108, 36.4425] },
    "properties": { "name": "howard-opera-house" } },
  { "geometry": { "type": "Point", "coordinates": [-119.3500, 37.8763] },
    "properties": { "name": "masonic-temple" } },
  { "geometry": { "type": "Point", "coordinates": [-121.5222, 40.9253] },
    "properties": { "name": "steamboat-wharf" } },
  { "geometry": { "type": "Point", "coordinates": [-122.0800, 41.1411] },
    "properties": { "name": "pneumatic-tube-terminus" } },
  { "geometry": { "type": "Point", "coordinates": [-122.2004, 42.9729] },
    "properties": { "name": "battery-park" } },
  { "geometry": { "type": "Point", "coordinates": [-121.4240, 46.5427] },
    "properties": { "name": "northern-lake" } },
  { "geometry": { "type": "Point", "coordinates": [-121.4240, 46.5427] },
    "properties": { "name": "juniper-island" } },
  { "geometry": { "type": "Point", "coordinates": [-121.4240, 46.5427] },
    "properties": { "name": "southern-lake" } },
  { "geometry": { "type": "Point", "coordinates": [-121.4240, 46.5427] },
    "properties": { "name": "crescent-beach-country-club" } },
  { "geometry": { "type": "Point", "coordinates": [-121.4240, 46.5427] },
    "properties": { "name": "city-hall" } },
  { "geometry": { "type": "Point", "coordinates": [-120.4657, 40.5695] },
    "properties": { "name": "fin", "zoom": 5 } },
];

var tiles = mapbox.layer().tilejson({
  tiles: [ "https://s3.amazonaws.com/geosprocket-basemap/{z}/{x}/{y}.png" ]
});

var pct = mapbox.layer().tilejson({
  tiles: [ "http://c.tiles.mapbox.com/v3/landplanner.map-clhq1tp6/{z}/{x}/{y}.png" ]
});

var reference = mapbox.layer().tilejson({
  tiles: [ "http://c.tiles.mapbox.com/v3/landplanner.map-clhq1tp6/{z}/{x}/{y}.png" ]
});

var spots = mapbox.markers.layer()
  // Load up markers from geojson data.
  .features(geojson)
  // Define a new factory function. Takes geojson input and returns a
  // DOM element that represents the point.
  .factory(function(f) {
    var el = document.createElement('div');
    el.className = 'spot spot-' + f.properties.id;
    return el;
  });

// Creates the map with tile and marker layers and
// no input handlers (mouse drag, scrollwheel, etc).
var map = mapbox.map('map', [tiles, pct, reference, spots], null, []);

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

console.log(markers.length);

// create a section cache
var previousSection = sections[0]

// Helper to set the active section.
var setActive = function(index, ease) {
  // Set active class on sections, markers.
  _(sections).each(function(s) { s.className = s.className.replace(' active', '') });
  _(markers).each(function(m) { m.element.className = m.element.className.replace(' active', '') });
  sections[index].className += ' active';
  markers[index].element.className += ' active';

  // Set a body class for the active section.
  document.body.className = 'section-' + index;

  // Ease map to active marker.
  if (!ease) {
    map.centerzoom(markers[index].location, markers[index].data.properties.zoom||7);
  } else {
    map.ease.location(markers[index].location).zoom(markers[index].data.properties.zoom||7).optimal(0.5, 1.00);
  }

  // in setActive() we need to see if there is audio in that section
  // if there is audio and it has not been played then play it
  // if it is currently playing then pause it

  var previousSectionAudios = $(previousSection).find("audio")
  _(previousSectionAudios).each(function(a) {
    if (a.playing) {
      a.pause();
    }
  });

  var audio = $(sections[index]).find("audio")[0];
  if (audio != undefined) {
    if (audio.currentTime == 0.0) {
      audio.play();
    }
  }

  // also loop through and pause other audio when a new one starts
  // i could cache the current playing one and pause that, that would be best
  if (sections[index] != previousSection) {
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
    $(".fin").css("height", browser_height - section_padding * 2);
    $(".fin").css("width", browser_width - section_padding * 2);
    $(".cover .content").css("padding", browser_height / 2 - cover_content_height / 2 + "px 0");
    $(".fin .content").css("padding", browser_height / 2 - fin_content_height + "px 0");
  }

  setCoverSize();

  $(window).resize(function() {
    browser_width = window.innerWidth ||document.documentElement.clientWidth || document.body.clientWidth;
    browser_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    setCoverSize();
  });
});