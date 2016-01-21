'use strict';

/* Services */

angular.module('thisApp.services', [])

// Facets declaration
.factory('Facets', function () {
  // Namespace
  var ns = {};
  
  Facettage.debug = true;

  ns.coeffs = Facettage.newFacet('coefficients.csv', {
    cached: true,
    type: 'csv',
    unserialize: function (data) {
      return data.map( function (d) {
        [
          'current_life',
          'leisure',
          'housing',
          'loved_ones'
        ].forEach( function (key) {
          d[key] = Number(d[key]);
        });
        return d;
      })
    }
  })

  return ns;

})