'use strict';

/* Services */

angular.module('app.services', [])

.constant('swbCategories', [
  'big_picture_f',
  'civic_f',
  'healthy_habits_f',
  'health_conditions_f',
  'family_life_f',
  'family_stress_f',
  'summer_leisure_f',
  'job_market_f',
  'job_search_f',
  'personal_security_f',
  'fin_security_f',
  'home_finance_f'
])

.constant('swbSeries', [
  'life_eval',
  'life_eval_5',
  'happiness',
  'learn',
  'respect',
  'anger',
  'stress',
  'worry',
  'sadness',
  'laugh'
])

.constant('wellBeingAspects', [
  'current_life',
  'leisure',
  'housing',
  'loved_ones'
])

.constant('regionsMetadata', {
  USA: {
    name: 'États-Unis',
    prefix: 'US',
    label: 'All USA states + DC',
    values: {
      "DC": "District de Columbia",
      "AK": "Alaska",
      "AL": "Alabama",
      "AR": "Arkansas",
      "AZ": "Arizona",
      "CA": "Californie",
      "CO": "Colorado",
      "CT": "Connecticut",
      "DE": "Delaware",
      "FL": "Floride",
      "GA": "Géorgie",
      "HI": "Hawaï",
      "IA": "Iowa",
      "ID": "Idaho",
      "IL": "Illinois",
      "IN": "Indiana",
      "KS": "Kansas",
      "KY": "Kentucky",
      "LA": "Louisiane",
      "MA": "Massachusetts",
      "MD": "Maryland",
      "ME": "Maine",
      "MI": "Michigan",
      "MN": "Minnesota",
      "MO": "Missouri",
      "MS": "État du Mississippi",
      "MT": "Montana",
      "NC": "Caroline du Nord",
      "ND": "Dakota du Nord",
      "NE": "Nebraska",
      "NH": "New Hampshire",
      "NJ": "New Jersey",
      "NM": "Nouveau-Mexique",
      "NV": "Nevada",
      "NY": "État de New York",
      "OH": "Ohio",
      "OK": "Oklahoma",
      "OR": "Oregon",
      "PA": "Pennsylvanie",
      "RI": "Rhode Island",
      "SC": "Caroline du Sud",
      "SD": "Dakota du Sud",
      "TN": "Tennessee",
      "TX": "Texas",
      "UT": "Utah",
      "VA": "Virginie",
      "VT": "Vermont",
      "WA": "État de Washington",
      "WI": "Wisconsin",
      "WV": "Virginie-Occidentale",
      "WY": "Wyoming"
    }
  },
  FR: {
    name: 'France',
    prefix: 'FR',
    label: 'All France regions',
    values: {
      "A": "Alsace",
      "B": "Aquitaine",
      "C": "Auvergne",
      "D": "Bourgogne",
      "E": "Bretagne",
      "F": "Centre",
      "G": "Champagne-Ardenne",
      "H": "Corse",
      "I": "Franche-Comté",
      "J": "Île-de-France",
      "K": "Languedoc-Roussillon",
      "L": "Limousin",
      "M": "Lorraine",
      "N": "Midi-Pyrénées",
      "O": "Nord-Pas-de-Calais",
      "P": "Basse-Normandie",
      "Q": "Haute-Normandie",
      "R": "Pays-de-la-Loire",
      "S": "Picardie",
      "T": "Poitou-Charentes",
      "U": "Provence-Alpes-Côte d'Azur",
      "V": "Rhône-Alpes",
    }
  }
})

// Facets declaration
.factory('Facets', ['wellBeingAspects', 'regionsMetadata'
,         function ( wellBeingAspects ,  regionsMetadata ) {
  // Namespace
  var ns = {};
  
  Facettage.debug = true;

  // Retrieve data from cache
  ns.coeffs = Facettage.newFacet('coefficients.csv', {
    cached: true,
    type: 'csv',
    unserialize: function (data) {
      return data.map( function (d) {
        wellBeingAspects.forEach( function (key) {
          d[key] = Number(d[key]);
        });
        return d;
      })
    }
  })

  ns.getSeries = function (country, region, topic) {
    // The name is an id as well as the path in the data cache
    // FIXME: the '/'' may not be the right path separator
    var name = region + '_' + topic + '.csv';
    // Require a facet (ie. create or get already created)
    return Facettage.requireFacet(name, {
      cached: true,
      /**
       * We use csvRows instead of csv because the first line
       * is not a header
       */
      type: 'csvRows',
      unserialize: function (data) {
        // Remove header
        data.shift();
        // Parse as numbers
        return data.map(Number);
      }
    });
  }

  return ns;

}])