var _ = require('underscore');
var Backbone = require('backbone');
var Ps = require('perfect-scrollbar');

var LayerLegendsView = require('./layer-legends-view');

var LegendsView = Backbone.View.extend({

  className: 'CDB-Legends',

  initialize: function (deps) {
    if (!deps.layersCollection) throw new Error('layersCollection is required');
    this._layersCollection = deps.layersCollection;

    this._isRendered = false;
    this._initBinds();
  },

  _initBinds: function () {
    this._layersCollection.on('add remove', this._onLayerAddedOrRemoved, this);
  },

  render: function () {
    var layerModelsWithLegends = this._layersCollection.getLayersWithLegends();
    _.each(layerModelsWithLegends.reverse(), this._renderLayerLegends, this);
    this._isRendered = true;
    this._renderScroll();

    return this;
  },

  _renderScroll: function () {
    Ps.initialize(this.el, {
      wheelSpeed: 1,
      wheelPropagation: false,
      swipePropagation: true,
      stopPropagationOnClick: false,
      minScrollbarLength: 20
    });
  },

  _renderLayerLegends: function (layerModel) {
    var layerLegendsView = new LayerLegendsView({ model: layerModel });
    this.$el.append(layerLegendsView.render().$el);
  },

  _onLayerAddedOrRemoved: function (layerModel) {
    // If view has already been rendered and a layer is added / removed
    if (this._isRendered && this._hasLegends(layerModel)) {
      this._clear();
      this.render();
    }
  },

  _hasLegends: function (layerModel) {
    return !!layerModel.legends;
  },

  _clear: function () {
    this.$el.html('');
  },

  show: function () {
    this.$el.show();
  },

  hide: function () {
    this.$el.hide();
  }
});

module.exports = LegendsView;
