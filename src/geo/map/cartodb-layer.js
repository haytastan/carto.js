var _ = require('underscore');
var config = require('../../cdb.config');
var LayerModelBase = require('./layer-model-base');
var InfowindowTemplate = require('./infowindow-template');
var TooltipTemplate = require('./tooltip-template');
var Legends = require('./legends/legends');

var CartoDBLayer = LayerModelBase.extend({
  defaults: {
    type: 'CartoDB',
    attribution: config.get('cartodb_attributions'),
    visible: true
  },

  ATTRIBUTES_THAT_TRIGGER_VIS_RELOAD: ['sql', 'source', 'sql_wrap', 'cartocss'],

  initialize: function (attrs, options) {
    attrs = attrs || {};
    options = options || {};
    if (!options.vis) throw new Error('vis is required');

    this._vis = options.vis;
    if (attrs && attrs.cartocss) {
      this.set('initialStyle', attrs.cartocss);
    }

    // PUBLIC PROPERTIES
    this.infowindow = new InfowindowTemplate(attrs.infowindow);
    this.tooltip = new TooltipTemplate(attrs.tooltip);
    this.unset('infowindow');
    this.unset('tooltip');

    this.legends = new Legends(attrs.legends, {
      visModel: this._vis
    });
    this.unset('legends');

    this.bind('change', this._onAttributeChanged, this);

    LayerModelBase.prototype.initialize.apply(this, arguments);
  },

  _onAttributeChanged: function () {
    var reloadVis = _.any(this.ATTRIBUTES_THAT_TRIGGER_VIS_RELOAD, function (attr) {
      if (this.hasChanged(attr)) {
        if (attr === 'cartocss' && this._dataProvider) {
          return false;
        }
        return true;
      }
    }, this);

    if (reloadVis) {
      this._reloadVis();
    }
  },

  _reloadVis: function () {
    this._vis.reload({
      sourceId: this.get('id')
    });
  },

  restoreCartoCSS: function () {
    this.set('cartocss', this.get('initialStyle'));
  },

  isVisible: function () {
    return this.get('visible');
  },

  hasInteraction: function () {
    return this.isVisible() && (this._hasInfowindowFields() || this._hasTooltipFields());
  },

  _hasInfowindowFields: function () {
    return this.infowindow.hasFields();
  },

  _hasTooltipFields: function () {
    return this.tooltip.hasFields();
  },

  getGeometryType: function () {
    if (this._dataProvider) {
      var index = this._dataProvider._layerIndex;
      var sublayer = this._dataProvider._vectorLayerView.renderers[index];
      return sublayer.inferGeometryType();
    }
    return null;
  },

  getInteractiveColumnNames: function () {
    var fieldNames = _.union(
      this.infowindow.getFieldNames(),
      this.tooltip.getFieldNames()
    );
    if (fieldNames.length) {
      fieldNames.unshift('cartodb_id');
    }
    return _.uniq(fieldNames);
  },

  // Layers inside a "layergroup" layer have the layer_name defined in options.layer_name
  // Layers inside a "namedmap" layer have the layer_name defined in the root of their definition
  getName: function () {
    return this.get('options') && this.get('options').layer_name || this.get('layer_name');
  },

  setDataProvider: function (dataProvider) {
    this._dataProvider = dataProvider;
  },

  getDataProvider: function () {
    return this._dataProvider;
  }
});

module.exports = CartoDBLayer;
