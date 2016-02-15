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
              el.html('');
      
              var states = usStatesHex.data;
              // console.log('$scope.statuses', $scope.statuses)
              // console.log('$scope.data', $scope.data)
              // console.log('states', states)

              // Setup: dimensions
              var margin = {top: 24, right: 0, bottom: 24, left: 0};
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

              var xExtent = d3.extent(
                states.map(function(d) { return d.xExtent[0]; })
                .concat(states.map(function(d) { return d.xExtent[1]; }))
              )
              var xOffset = -size(xExtent[0]) + (width / 2 - ( size(xExtent[1]) - size(xExtent[0]) ) / 2 )
              
              var lineFunction = d3.svg.line()
                .x(function(d) { return xOffset + size(d[0]); })
                .y(function(d) { return size(d[1]); })
                .interpolate('linear');

              var stateGroups = svg.selectAll('.hex')
                .data(states)
              .enter().append('g')
                .attr('class', 'hex')
                .style('cursor', function(d){
                  if (regionValid(d)) {
                    return 'pointer'
                  }
                  return 'default'
                })
                .on('mouseover', function(d) {
                  if (regionValid(d)) {
                    d3.select(this).select('path.hexagon')
                      .attr('fill', 'red')
                    d3.select(this).select('text.border')
                      .attr('stroke', 'red')
                      .attr('fill', 'red')
                  }
                })                  
                .on('mouseout', function(d) {
                  if (regionValid(d)) {
                    d3.select(this).select('path')
                      .attr('fill', regionColor)
                    d3.select(this).select('text.border')
                      .attr('stroke', regionColor)
                      .attr('fill', regionColor)
                  }
                });

              stateGroups.append('path')
                .attr('class', 'hexagon')
                .attr('d', function (d) { return lineFunction(d.hex); })
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .attr('fill', regionColor)

              stateGroups.append('path')
                .attr('class', 'sparkline')
                .attr('d', function (d) {
                  if (regionValid(d)) {
                    var sparklineFunction = buildSparklineFunction(d)
                    return sparklineFunction($scope.data[d.abbr])
                  }
                })
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .attr('fill', 'none')
                .attr('opacity', .8)

              // Border text
              stateGroups.append('text')
                .attr('class', 'border')
                .text(function (d) { return d.abbr })
                .attr('x', function(d){ return xOffset + size(d.x) })
                .attr('y', function(d){ return 3 + size(d.y) })
                .attr('font-family', 'Roboto')
                .attr('font-weight', '100')
                .attr('font-size', '36px')
                .attr('stroke', regionColor)
                .attr('stroke-width', 6)
                .attr('fill', regionColor)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('opacity', 0.6)

              stateGroups.append('text')
                .text(function (d) { return d.abbr })
                .attr('x', function(d){ return xOffset + size(d.x) })
                .attr('y', function(d){ return 3 + size(d.y) })
                .attr('font-family', 'Roboto')
                .attr('font-weight', '100')
                .attr('font-size', '36px')
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('opacity', 1)

              function buildSparklineFunction(region) {
                // scales
                var x = d3.scale.linear()
                  .range([region.hex[4][0] + 1, region.hex[1][0] - 1])
                  .domain([0, $scope.data[region.abbr].length])
                var y = d3.scale.linear()
                  .range([region.hex[4][1], region.hex[1][1]])
                  .domain([-2, 2])
                  // .domain(d3.extent($scope.data[region.abbr]))
                return d3.svg.line()
                  .x(function(d, i) { return xOffset + size(x(i)); })
                  .y(function(d) { return size(y(d)); })
                  .interpolate('bundle');
              }

              function regionValid(d) {
                return $scope.statuses[d.abbr] && $scope.statuses[d.abbr].available
              }

              function regionOpacity(d) {
                if ($scope.statuses[d.abbr]) {
                  if ($scope.statuses[d.abbr].loading) {
                    return 1
                  } else if ($scope.statuses[d.abbr].available) {
                    return 1
                  } else {
                    return 0.9
                  }
                } else {
                  return 1
                }
              }

              function regionColor(d) {
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
              }
            }, 0, false);
          }
        }, true);
      }
    }
  })
