var geojson = [
  { "geometry": { "type": "Point", "coordinates": [-120.4657, 40.5695] },
    "properties": { "id": "cover", "zoom": 5 } },
  { "geometry": { "type": "Point", "coordinates": [-118.5140, 34.8576] },
    "properties": { "id": "mojave" } },
  { "geometry": { "type": "Point", "coordinates": [-118.2108, 36.4425] },
    "properties": { "id": "meadows" } },
  { "geometry": { "type": "Point", "coordinates": [-119.3500, 37.8763] },
    "properties": { "id": "mirror" } },
  { "geometry": { "type": "Point", "coordinates": [-121.5222, 40.9253] },
    "properties": { "id": "cassel" } },
  { "geometry": { "type": "Point", "coordinates": [-122.0800, 41.1411] },
    "properties": { "id": "mccloud" } },
  { "geometry": { "type": "Point", "coordinates": [-122.2004, 42.9729] },
    "properties": { "id": "crater" } },
  { "geometry": { "type": "Point", "coordinates": [-121.4240, 46.5427] },
    "properties": { "id": "goatrocks" } }
];
var tiles = mapbox.layer().tilejson({
  tiles: [ "https://s3.amazonaws.com/geosprocket-basemap/{z}/{x}/{y}.png" ]
});

var pct = mapbox.layer().tilejson({
  tiles: [ "http://c.tiles.mapbox.com/v3/landplanner.pct/{z}/{x}/{y}.png" ]
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

/*map.addLayer(mapbox.layer().tilejson({
  tiles: [ 'http://c.tiles.mapbox.com/v3/landplanner.map-clhq1tp6/{z}/{x}/{y}.png' ]
}));*/

// Array of story section elements.
var sections = document.getElementsByTagName('section');

// Array of marker elements with order matching section elements.
var markers = _(sections).map(function(section) {
  return _(spots.markers()).find(function(m) {
    return m.data.properties.id === section.id;
  });
});

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