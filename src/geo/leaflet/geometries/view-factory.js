var PointView = require('./point-view');
var PolygonView = require('./polygon-view');
var PolylineView = require('./polyline-view');

var GEOMETRY_VIEWS = {
  'point': PointView,
  'polyline': PolylineView,
  'polygon': PolygonView
};

var GeometryViewFactory = {
  createGeometryView: function (geometry, mapView) {
    var GeometryView = GEOMETRY_VIEWS[geometry.get('type')];
    if (GeometryView) {
      var geometryView = new GeometryView({
        model: geometry,
        mapView: mapView
      });
      this._newGeometryView = geometryView;
      geometryView.render();
    } else {
      throw new Error(geometry.get('type') + ' is not supported yet');
    }
  }
};

module.exports = GeometryViewFactory;
