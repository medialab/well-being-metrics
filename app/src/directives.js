'use strict';

/* Services */

angular.module('app.directives', [])
  
  .directive('hexus', function ($timeout, usStatesHex) {
    return {
      restrict: 'A',
    // , templateUrl: 'partials/navbar.html'
      scope: {
          data: '=',
          statuses: '='
      },
      link: function($scope, el, attrs) {

        el.html('<div class="simple-curve">Loading...</div>');
        
        $scope.$watch('statuses', function () {
          if ($scope.statuses !== undefined){
            $timeout(function () {
              console.log('redraw')
              el.html('');
      
              var states = usStatesHex.data;

              // Setup: dimensions
              var margin = {top: 10, right: 10, bottom: 10, left: 10};
              var width = el[0].offsetWidth - margin.left - margin.right;
              var height = el[0].offsetHeight - margin.top - margin.bottom;

              // Setup: scales
              var size = d3.scale.linear()
                  .range([0, height]);

              // Setup: SVG container
              var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // Binding: scales
              size.domain(d3.extent(
                states.map(function(d) { return d.yExtent[0]; })
                .concat(states.map(function(d) { return d.yExtent[1]; }))
              ));
              
              var lineFunction = d3.svg.line()
                .x(function(d) { return size(d[0]); })
                .y(function(d) { return size(d[1]); })
                .interpolate('linear');

              svg.selectAll('.hex')
                .data(states)
              .enter().append('path')
                .attr('d', function(d){return lineFunction(d.hex); })
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .attr('fill', function (d) {

                  if ($scope.statuses[d.abbr]) {
                    if ($scope.statuses[d.abbr].loading) {
                      return '#EEEEEE'
                    } else if ($scope.statuses[d.abbr].available) {
                      return 'steelblue'
                    } else {
                      return '#CCCCCC'
                    }
                  } else {
                    return '#EEEEEE'
                  }
                })

              svg.selectAll('.hextext')
                .data(states)
              .enter().append('text')
                .text(function (d) { return d.abbr })
                .attr('x', function(d){ return size(d.x) })
                .attr('y', function(d){ return size(d.y) })
                .attr('font-family', 'sans-serif')
                .attr('font-size', '14px')
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
              

            }, 0, false);
          }
        }, true);
      }
    }
  })
