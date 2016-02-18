'use strict';

/* Services */

angular.module('app.directives', [])
  
  .directive('hexUs', function ($timeout, usStatesHex, colors) {
    return {
      restrict: 'A',
      scope: {
          data: '=',
          statuses: '=',
          setState: '=',
          state: '='
      },
      link: function($scope, el, attrs) {

        el.html('<div>Loading...</div>')
        
        $scope.$watch('statuses', redraw, true)
        $scope.$watch('state', redraw)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        function redraw() {
          if ($scope.statuses !== undefined){
            $timeout(function () {
              el.html('');
      
              var states = usStatesHex.data;

              // Semiotic settings
              var settings = {
                color: {
                  selected:     colors.mapItemHighlight,
                  hover:        colors.mapItemHighlight,
                  loading:      colors.mapItemLoading,
                  available:    colors.mapItemReady,
                  unavailable:  colors.mapItemUnavailable
                },
                opacity: {
                  selected: 1,
                  hover: 1,
                  loading: 1,
                  available: 1,
                  unavailable: 1
                }
              }

              // Setup: dimensions
              var margin = {top: 24, right: 0, bottom: 24, left: 0};
              var width = el[0].offsetWidth - margin.left - margin.right - 12;
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
                      .attr('fill', settings.color.hover)
                    d3.select(this).select('text.border')
                      .attr('stroke', settings.color.hover)
                      .attr('fill', settings.color.hover)
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
                })
                .on('click', function(d) {
                  d3.event.stopPropagation();
                  if (regionValid(d)) {
                    $scope.setState(d.abbr)
                  }
                })

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
              var yTextOffset = 10;
              stateGroups.append('text')
                .attr('class', 'border')
                .text(function (d) { return d.abbr })
                .attr('x', function(d){ return xOffset + size(d.x) })
                .attr('y', function(d){ return yTextOffset + size(d.y) })
                .attr('font-family', 'Roboto')
                .attr('font-weight', '100')
                .attr('font-size', '26px')
                .attr('stroke', regionColor)
                .attr('stroke-width', 8)
                .attr('fill', regionColor)
                .attr('text-anchor', 'middle')
                .attr('opacity', 0.6)

              stateGroups.append('text')
                .text(function (d) { return d.abbr })
                .attr('x', function(d){ return xOffset + size(d.x) })
                .attr('y', function(d){ return yTextOffset + size(d.y) })
                .attr('font-family', 'Roboto')
                .attr('font-weight', '100')
                .attr('font-size', '26px')
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
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
                if ($scope.state == d.abbr) {
                  return settings.opacity.selected
                } else if ($scope.statuses[d.abbr]) {
                  if ($scope.statuses[d.abbr].loading) {
                    return settings.opacity.loading
                  } else if ($scope.statuses[d.abbr].available) {
                    return settings.opacity.available
                  } else {
                    return settings.opacity.unavailable
                  }
                } else {
                  return settings.opacity.loading
                }
              }

              function regionColor(d) {
                if ($scope.state == d.abbr) {
                  return settings.color.selected
                } else if ($scope.statuses[d.abbr]) {
                  if ($scope.statuses[d.abbr].loading) {
                    return settings.color.loading
                  } else if ($scope.statuses[d.abbr].available) {
                    return settings.color.available
                  } else {
                    return settings.color.unavailable
                  }
                } else {
                  return settings.color.loading
                }
              }
            }, 0, false);
          }
        }
      }
    }
  })

  .directive('stackedCurvesUs', function ($timeout, usStatesHex, colors) {
    return {
      restrict: 'A',
      scope: {
          data: '=',
          statuses: '=',
          setState: '=',
          state: '=',
          month: '='
      },
      link: function($scope, el, attrs) {

        el.html('<div>Loading...</div>')
        
        $scope.$watch('statuses', redraw, true)
        $scope.$watch('state', redraw)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        function redraw() {
          if ($scope.statuses !== undefined){
            $timeout(function () {
              el.html('');
      
              var states = usStatesHex.data;

              // Preliminary data crunching
              var allValues = []
              var seriesLength = 0
              var region
              for (region in $scope.data) {
                var series = $scope.data[region]
                if ( series && series.length > 0 ) {
                  seriesLength = Math.max(seriesLength, series.length)
                  allValues = allValues.concat(series)
                }
              }

              // Semiotic settings
              var settings = {
                color: {
                }
              }

              // Setup: dimensions
              var margin = {top: 6, right: 12, bottom: 24, left: 200};
              var width = el[0].offsetWidth - margin.left - margin.right - 12;
              var height = el[0].offsetHeight - margin.top - margin.bottom;

              // Setup: scales
              var x = d3.scale.linear()
                // TODO: use time conversion for this
                .domain([0, seriesLength - 1])
                .range([0, width])
              
              var y = d3.scale.linear()
                .domain([-3, 3])
                // .domain(d3.extent(allValues))
                .range([height, 0])

              var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left");

              // Setup: SVG container
              var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
              
              var lineFunction = d3.svg.line()
                .x(function(d, i) { return x(i); })
                .y(function(d) { return y(d); })
                .interpolate('bundle');

              var curves = svg.selectAll('.curve')
                .data(states)
              .enter().append('g')
                .attr('class', 'curve')
              .append("path")
                .attr('d', function (d) {
                  if (regionValid(d)) return lineFunction($scope.data[d.abbr])
                })
                .attr('stroke', colors.curve)
                .attr('stroke-width', 1)
                .attr('fill', 'none')
                .attr('opacity', 0.4)
                 
            }, 0)
          }
        }

        function regionValid(d) {
          return $scope.statuses[d.abbr] && $scope.statuses[d.abbr].available
        }
      }
    }
  })

  // bar chart: Unused
  .directive('barChart', function ($timeout, colors) {
    return {
      restrict: 'A',
      scope: {
          data: '='
      },
      link: function($scope, el, attrs) {
        el.html('<div>Loading...</div>')

        $scope.$watch('data', redraw, true)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        function redraw() {
          if ($scope.data !== undefined) {
            $timeout(function () {
              el.html('')

              // Setup: dimensions
              var margin = {top: 12, right: 12, bottom: 12, left: 46};
              var width = el[0].offsetWidth - margin.left - margin.right - 12;
              var height = el[0].offsetHeight - margin.top - margin.bottom;

              // Setup: scales
              var x = d3.scale.ordinal()
                .domain(d3.keys($scope.data))
                .rangeRoundBands([0, width], .2);
    
              var y = d3.scale.linear()
                .domain(d3.extent($scope.data))
                .range([height, 0]);

              var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left");

              // Draw
              var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              svg.selectAll(".bar")
                .data($scope.data)
              .enter().append("rect")
                .attr("class", function(d) { return d < 0 ? "bar negative" : "bar positive"; })
                .attr('fill', function(d) { return d < 0 ? colors.barNegative : colors.barPositive; })
                .attr("x", function(d, i) { return x(i); })
                .attr("y", function(d) { return y(Math.max(0, d)); })
                .attr("width", x.rangeBand())
                .attr("height", function(d) { return Math.abs(y(d) - y(0)); })

              svg.append("g")
                  .attr("class", "x axis")
                .append("line")
                  .attr("y1", y(0))
                  .attr("y2", y(0))
                  .attr("x2", width);

              svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis);

            })
          }
        }
      }
    }
  })

  .directive('timeSlider', function ($timeout, colors, seriesMetadata) {
    return {
      restrict: 'A',
      scope: {
        month: '='
      },
      templateUrl: 'src/directives/timeSlider.html',
      link: function(scope, el, attrs) {
        scope.colors = colors
        scope.sticking = false
        scope.startDate = new Date(seriesMetadata.us.startDate)
        scope.endDate = new Date(seriesMetadata.us.endDate)
        scope.monthMax = monthDiff(scope.startDate, scope.endDate)
        scope.date = getDate()

        scope.$watch('month', getDate)

        function getDate() {
          scope.date = addMonths(scope.startDate, scope.month)
        }

        function addMonths(d, m) {
          return new Date(d.getTime()).setMonth(d.getMonth() + m)
        }

        function monthDiff(d1, d2) {
          var months;
          months = (d2.getFullYear() - d1.getFullYear()) * 12;
          months -= d1.getMonth() + 1;
          months += d2.getMonth();
          return months <= 0 ? 0 : months;
        }

        // Custom sticky behavior
        var namespace = 'sticky'
        // get element
        var element = el[0]
        // get document
        var document = element.ownerDocument
        // get window
        var window = document.defaultView
        // get wrapper
        var wrapper = document.createElement('span')
        // cache style
        var style = element.getAttribute('style')
        // get options
        var bottom = parseFloat(attrs[namespace + 'Bottom'])
        var media = window.matchMedia(attrs[namespace + 'Media'] || 'all')
        var top = document.querySelector('md-toolbar').offsetHeight

        // initialize states
        var activeBottom = false
        var activeTop = false
        var offset = {}

        // configure wrapper
        wrapper.className = 'is-' + namespace;

        // activate sticky
        function activate() {
          // get element computed style
          var computedStyle = getComputedStyle(element)
          var position = activeTop ? 'top:' + top : 'bottom:' + bottom
          var parentNode = element.parentNode
          var nextSibling = element.nextSibling

          // replace element with wrapper containing element
          wrapper.appendChild(element)

          if (parentNode) {
            parentNode.insertBefore(wrapper, nextSibling)
          }

          // style wrapper
          wrapper.setAttribute('style', 'display:' + computedStyle.display + ';height:' + element.offsetHeight + 'px;margin:' + computedStyle.margin + ';width:' + element.offsetWidth + 'px');

          // style element
          element.setAttribute('style', 'left:' + offset.left + 'px;margin:0;position:fixed;transition:none;' + position + 'px;width:' + computedStyle.width);

          // angular state
          $timeout(function () {
            scope.sticking = true
            scope.$apply()
          }, 0)
        }

        // deactivate sticky
        function deactivate() {
          var parentNode = wrapper.parentNode
          var nextSibling = wrapper.nextSibling

          // replace wrapper with element
          parentNode.removeChild(wrapper);

          parentNode.insertBefore(element, nextSibling);

          // unstyle element
          if (style === null) {
            element.removeAttribute('style');
          } else {
            element.setAttribute('style', style);
          }

          // unstyle wrapper
          wrapper.removeAttribute('style');

          activeTop = activeBottom = false;

          // angular state
          $timeout(function () {
            scope.sticking = false
            scope.$apply()
          }, 0)
        }

        // window scroll listener
        function onscroll() {
          // if activated
          if (activeTop || activeBottom) {
            // get wrapper offset
            offset = wrapper.getBoundingClientRect();

            activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - wrapper.offsetHeight;
            activeTop = !isNaN(top) && offset.top < top;

            // deactivate if wrapper is inside range
            if (!activeTop && !activeBottom) {
              deactivate();
            }
          }
          // if not activated
          else if (media.matches) {
            // get element offset
            offset = element.getBoundingClientRect();

            activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - element.offsetHeight;
            activeTop = !isNaN(top) && offset.top < top;

            // activate if element is outside range
            if (activeTop || activeBottom) {
              activate();
            }
          }
        }

        // window resize listener
        function onresize() {
          // conditionally deactivate sticky
          if (activeTop || activeBottom) {
            deactivate();
          }

          // re-initialize sticky
          onscroll();
        }

        // destroy listener
        function ondestroy() {
          onresize();

          document.querySelector('md-content').removeEventListener('scroll', onscroll);
          window.removeEventListener('resize', onresize);
        }

        // bind listeners TO MD CONTENT
        document.querySelector('md-content').addEventListener('scroll', onscroll);
        window.addEventListener('resize', onresize);

        scope.$on('$destroy', ondestroy);

        // initialize sticky
        onscroll();
      }
    }
  })
