'use strict';

/* Services */

// FIXME: clean this dirty hack
var stickyModeHeight = 80;

angular.module('app.directives', [])

  .directive('hexUs', function ($timeout, usStatesHex, colors) {
    return {
      restrict: 'A',
      scope: {
          data: '=',
          statuses: '=',
          setRegion: '=',
          region: '=',
          month: '='
      },
      link: function($scope, el, attrs) {

        el.html('<div>Loading...</div>')

        $scope.$watch('statuses', redraw, true)
        $scope.$watch('region', redraw)
        $scope.$watch('month', redraw)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        function redraw() {
          if (el[0].offsetWidth > 0 && $scope.statuses !== undefined){
            $timeout(function () {
              el.html('');

              var regions = usStatesHex.data;

              // Setup: dimensions
              var margin = {top: 24, right: 0, bottom: 24, left: 0};
              var width = el[0].offsetWidth - margin.left - margin.right - 12;
              var height = el[0].offsetHeight - margin.top - margin.bottom;

              // Setup: scales
              var size = d3.scaleLinear()
                  .range([0, height]);

              var dotSize = d3.scaleLinear()
                  .range([0, 0.5 * (regions[0].xExtent[1] - regions[0].xExtent[0])])

              // Setup: SVG container
              var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // Binding: scales
              size.domain(d3.extent(
                regions.map(function(d) { return d.yExtent[0]; })
                .concat(regions.map(function(d) { return d.yExtent[1]; }))
              ));

              dotSize.domain(d3.extent(
                regions.map(function(d) { return d3.extent($scope.data[d.abbr] || [])[0] })
                .concat(regions.map(function(d) { return d3.extent($scope.data[d.abbr] || [])[1] }))
              ))

              var xExtent = d3.extent(
                regions.map(function(d) { return d.xExtent[0]; })
                .concat(regions.map(function(d) { return d.xExtent[1]; }))
              )
              var xOffset = -size(xExtent[0]) + (width / 2 - ( size(xExtent[1]) - size(xExtent[0]) ) / 2 )

              var lineFunction = d3.line()
                .x(function(d) { return xOffset + size(d[0]); })
                .y(function(d) { return size(d[1]); })
                .curve(d3.curveLinear);

              var regionGroups = svg.selectAll('.hex')
                .data(regions)
              .enter().append('g')
                .attr('class', 'hex')
                .style('cursor', function(d){
                  if (regionValid(d.abbr)) {
                    return 'pointer'
                  }
                  return 'default'
                })
                .on('mouseover', function(d) {
                  if (regionValid(d.abbr)) {
                    d3.select(this).select('path.hexagon')
                      .attr('fill', colors.mapItemHighlight)
                    d3.select(this).select('text.border')
                      .attr('stroke', colors.mapItemHighlight)
                      .attr('fill', colors.mapItemHighlight)
                  }
                })
                .on('mouseout', function(d) {
                  if (regionValid(d.abbr)) {
                    d3.select(this).select('path')
                      .attr('fill', regionColor)
                    d3.select(this).select('text.border')
                      .attr('stroke', regionColor)
                      .attr('fill', regionColor)
                  }
                })
                .on('click', function(d) {
                  d3.event.stopPropagation();
                  if (regionValid(d.abbr)) {
                    $scope.setRegion(d.abbr)
                  }
                })

              // Hexagons
              regionGroups.append('path')
                .attr('class', 'hexagon')
                .attr('d', function (d) { return lineFunction(d.hex); })
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .attr('fill', regionColor)

              // Dots
              regionGroups.append('circle')
                .attr('class', 'data-circle')
                .attr('r', function (d) {
                  if (regionValid(d.abbr)) {
                    return size(dotSize($scope.data[d.abbr][$scope.month]))
                  } else {
                    return 0
                  }
                })
                .attr('cx', function(d) {return xOffset + size(d.x)})
                .attr('cy', function(d) {return size(d.y)})
                .attr('stroke', 'none')
                .attr('fill', dotColor)
                .attr('opacity', .8)

              // Border text
              var yTextOffset = 6;
              regionGroups.append('text')
                .text(function (d) { return d.abbr })
                .attr('x', function(d){ return xOffset + size(d.x) })
                .attr('y', function(d){ return yTextOffset + size(d.y) })
                .attr('font-family', 'Roboto')
                .attr('font-weight', '300')
                .attr('font-size', '18px')
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .attr('opacity', 1)

              function regionValid(d) {
                return $scope.statuses[d] && $scope.statuses[d].available
              }

              function regionOpacity(d) {
                return 1
              }

              function regionColor(d) {
                if ($scope.region == d.abbr) {
                  return colors.mapItemHighlight
                } else if ($scope.statuses[d.abbr]) {
                  if ($scope.statuses[d.abbr].loading) {
                    return colors.mapItemLoading
                  } else if ($scope.statuses[d.abbr].available) {
                    return colors.mapItemReady
                  } else {
                    return colors.mapItemUnavailable
                  }
                } else {
                  return colors.mapItemLoading
                }
              }

              function dotColor(d) {
                if ($scope.region == d.abbr) {
                  return colors.mapDotHighlight
                } else {
                  return colors.mapDot
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
          region: '=',
          month: '=',
          summary: '='
      },
      link: function($scope, el, attrs) {

        el.html('<div>Loading...</div>')

        $scope.$watch('statuses', redraw, true)
        $scope.$watch('region', redraw)
        $scope.$watch('month', redraw)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        function redraw() {
          if (el[0].offsetWidth > 0 && $scope.statuses !== undefined){
            $timeout(function () {
              el.html('');

              var regions = usStatesHex.data;

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
              var margin = {top: 6, right: 12, bottom: 24, left: 300};
              var width = el[0].offsetWidth - margin.left - margin.right - 12;
              var height = el[0].offsetHeight - margin.top - margin.bottom;

              // Setup: scales
              var x = d3.scaleLinear()
                .domain([0, seriesLength - 1])
                .range([0, width])

              var y = d3.scaleLinear()
                .domain([-5, 5])
                // .domain(d3.extent(allValues))
                .range([height, 0])

              var yAxis = d3.axisLeft(y)

              // Setup: SVG container
              var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              var lineFunction = d3.line()
                .x(function(d, i) { return x(i); })
                .y(function(d) { return y(d); })
                .curve(d3.curveCardinal.tension(0.5));

              var curves = svg.selectAll('.curve')
                .data(regions)
              .enter().append('g')
                .attr('class', 'curve')
              .append("path")
                .attr('d', function (d) {
                  if (regionValid(d.abbr)) return lineFunction($scope.data[d.abbr])
                })
                .attr('stroke', colors.curve)
                .attr('stroke-width', .8)
                .attr('fill', 'none')
                .attr('opacity', .6)

              // Additional informations
              var overlay = svg.append('g')

              // Line of the selected date
              overlay.append("line")
                .attr("x1", x($scope.month))
                .attr("y1", 0)
                .attr("x2", x($scope.month))
                .attr("y2", height)
                .style("stroke-width", 2)
                .style("stroke", colors.time)
                .style("fill", "none");

              // Dot for min region
              if ($scope.summary.minRegion && $scope.data[$scope.summary.minRegion]) {
                overlay.append("circle")
                  .attr("cx", x($scope.month))
                  .attr("cy", y($scope.data[$scope.summary.minRegion][$scope.month]))
                  .attr("r", 4)
                  .style("fill", colors.curve);
              }

              // Dot for max region
              if ($scope.summary.maxRegion && $scope.data[$scope.summary.maxRegion]) {
                overlay.append("circle")
                  .attr("cx", x($scope.month))
                  .attr("cy", y($scope.data[$scope.summary.maxRegion][$scope.month]))
                  .attr("r", 4)
                  .style("fill", colors.curve);
              }

              // Curve of current region
              if ($scope.region && regionValid($scope.region)) {
                overlay.append("path")
                  .attr('d', lineFunction($scope.data[$scope.region]))
                  .attr('stroke', colors.regionHighlight)
                  .attr('stroke-width', 2)
                  .attr('fill', 'none')
                  .attr('opacity', 1)
              }

              // Dot for current region
              if ($scope.region && $scope.data[$scope.region]) {
                overlay.append("circle")
                  .attr("cx", x($scope.month))
                  .attr("cy", y($scope.data[$scope.region][$scope.month]))
                  .attr("r", 4)
                  .style("fill", colors.regionHighlight);
              }

            }, 0)
          }
        }

        function regionValid(d) {
          return $scope.statuses[d] && $scope.statuses[d].available
        }
      }
    }
  })

  .directive('simpleCurve', function ($timeout, colors) {
    return {
      restrict: 'A',
      scope: {
        data: '=',
        month: '=',
        status: '=',
        highlight: '='
      },
      link: function($scope, el, attrs) {

        el.html('<div><center>Loading...</center></div>')

        $scope.$watch('status', redraw, true)
        $scope.$watch('month', redraw)
        $scope.$watch('highlight', redraw)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        function redraw() {
          if ($scope.data !== undefined){
            $timeout(function () {
              el.html('');

              // Setup: dimensions
              var margin = {top: 0, right: 12, bottom: 0, left: 300};
              var width = el[0].offsetWidth - margin.left - margin.right - 12;
              var height = el[0].offsetHeight - margin.top - margin.bottom;

              // Setup: scales
              var x = d3.scaleLinear()
                .domain([0, $scope.data.length - 1])
                .range([0, width])

              var y = d3.scaleLinear()
                .domain([-5, 5])
                .range([height, 0])

              var yAxis = d3.axisLeft(y)

              // Setup: SVG container
              var svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              var lineFunction = d3.line()
                .x(function(d, i) { return x(i); })
                .y(function(d) { return y(d); })
                .curve(d3.curveCardinal.tension(0.5));

              var curveColor = $scope.highlight ? colors.regionHighlight : colors.topicCurve

              if ($scope.data) {
                svg
                  .append("path")
                    .attr('d', lineFunction($scope.data) )
                    .attr('stroke', curveColor)
                    .attr('stroke-width', 1)
                    .attr('fill', 'none')
              }

              // Additional informations
              var overlay = svg.append('g')

              // Line of the selected date
              overlay.append("line")
                .attr("x1", x($scope.month))
                .attr("y1", 0)
                .attr("x2", x($scope.month))
                .attr("y2", height)
                .style("stroke-width", 2)
                .style("stroke", colors.time)
                .style("fill", "none");

              // Dot
              overlay.append("circle")
                .attr("cx", x($scope.month))
                .attr("cy", y($scope.data[$scope.month]))
                .attr("r", 4)
                .style("fill", curveColor);

            }, 0)
          }
        }

        function regionValid(d) {
          return $scope.statuses[d] && $scope.statuses[d].available
        }
      }
    }
  })

  .directive('timeSlider', function ($timeout, $interval, colors, seriesMetadata) {
    return {
      restrict: 'A',
      scope: {
        month: '=',
        monthNames: '='
      },
      templateUrl: 'src/directives/timeSlider.html',
      link: function(scope, el, attrs) {
        var timeTick
        var timeIntervalMilliseconds = 180
        scope.colors = colors
        scope.sticking = false
        scope.startDate = new Date(seriesMetadata.us.startDate)
        scope.endDate = new Date(seriesMetadata.us.endDate)
        scope.monthMax = monthDiff(scope.startDate, scope.endDate) + 1
        scope.monthDate = ''
        scope.date = getDate()
        scope.timePlaying = false

        scope.$watch('month', getDate)
        scope.$watch('monthNames', getDate)

        scope.playPauseTime = function () {
          if (scope.timePlaying) {
            // Stop
            stopTimeTick()
          } else {
            // Play
            scope.timePlaying = true
            timeTick = $interval(function() {
              nextTimeTick()
            }, timeIntervalMilliseconds)
          }
        }

        scope.$on('$destroy', function() {
          // Make sure that the interval is destroyed
          stopTimeTick()
        });

        function getDate() {
          scope.date = addMonths(scope.startDate, scope.month)
          var d = new Date(scope.date)
          var monthName = scope.monthNames[d.getMonth()] || ''
          scope.monthDate = monthName + ' ' + d.getFullYear()
        }

        function nextTimeTick() {
          scope.month += 1
          if (scope.month > scope.monthMax) {
            scope.month = 0
            stopTimeTick()
          }
        }

        function stopTimeTick() {
          scope.timePlaying = false
          if (angular.isDefined(timeTick)) {
            $interval.cancel(timeTick);
            timeTick = undefined;
          }
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
        var top = document.querySelector('md-toolbar').offsetHeight + stickyModeHeight

        // initialize regions
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
          // NB: we care only if visible
          if (el[0].offsetHeight > 0) {
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
        }

        // window scroll listener
        function onscroll() {
          // NB: we care only if visible
          if (el[0].offsetHeight > 0) {
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
        }

        // window resize listener
        function onresize() {
          // NB: we care only if visible
          if (el[0].offsetHeight > 0) {
            // conditionally deactivate sticky
            if (activeTop || activeBottom) {
              deactivate();
            }

            // re-initialize sticky
            onscroll();
          }
        }

        // destroy listener
        function ondestroy() {
          onresize();
          document.querySelector('md-content').removeEventListener('scroll', onscroll);
          window.removeEventListener('resize', onresize);
        }

        // bind listeners TO MD CONTENT
        scope.$on('$destroy', ondestroy);
        $timeout(function(){
          document.querySelector('md-content').addEventListener('scroll', onscroll);
          window.addEventListener('resize', onresize);

          // initialize sticky
          onscroll();
        })

      }
    }
  })

  .directive('topicSelector', function ($timeout, colors, regionsMetadata) {
    return {
      restrict: 'A',
      scope: {
        topics: '=',
        topic: '=',
        regions: '=',
        region: '=',
        seriesMeasure: '=',
        seriesDomain: '='
      },
      templateUrl: 'src/directives/topicSelector.html',
      link: function(scope, el, attrs) {
        scope.stickyModeHeight = stickyModeHeight
        scope.sticking = false
        scope.topModifier = 1000
        scope.setTopic = function (topic) {
          scope.topic = topic
        }

        scope.regionName = function (r) {
          if (r === 'US') {
            return 'the United States'
          } else {
            return regionsMetadata.USA.values[r]
          }
        }

        // Update topModifier
        scope.$watch('seriesMeasure', updateTopModifier)
        scope.$watch('seriesDomain', updateTopModifier)

        function updateTopModifier() {
          $timeout(function() {
            scope.topModifier = el[0].offsetHeight - scope.stickyModeHeight
          }, 0)
        }

        // Custom sticky behavior
        var namespace = 'sticky-topics'
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

        // initialize regions
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

          // Hide / show elements
          element.querySelector('.display-when-sticky').style.display = ''
          element.querySelector('.display-before-sticky').style.display = 'none'

          // angular state
          $timeout(function () {
            scope.sticking = true
            scope.$apply()
          }, 0)
        }

        // deactivate sticky
        function deactivate() {
          // NB: we care only if visible
          if (el[0].offsetHeight > 0) {
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

            // Hide / show elements
            element.querySelector('.display-when-sticky').style.display = 'none'
            element.querySelector('.display-before-sticky').style.display = ''

            // angular state
            $timeout(function () {
              scope.sticking = false
              scope.$apply()
            }, 0)
          }
        }

        // window scroll listener
        function onscroll() {
          // NB: we care only if visible
          if (el[0].offsetHeight > 0) {
            // if activated
            if (activeTop || activeBottom) {
              // get wrapper offset
              offset = wrapper.getBoundingClientRect();

              // Modify offset
              offset = {top: offset.top + scope.topModifier}

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

              // Modify offset
              offset = {top: offset.top + scope.topModifier}

              activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - element.offsetHeight;
              activeTop = !isNaN(top) && offset.top < top;

              // activate if element is outside range
              if (activeTop || activeBottom) {
                activate();
              }
            }
          }
        }

        // window resize listener
        function onresize() {
          // NB: we care only if visible
          if (el[0].offsetHeight > 0) {
            // conditionally deactivate sticky
            if (activeTop || activeBottom) {
              deactivate();
            }

            // re-initialize sticky
            onscroll();
          }
        }

        // destroy listener
        function ondestroy() {
          onresize();

          document.querySelector('md-content').removeEventListener('scroll', onscroll);
          window.removeEventListener('resize', onresize);
        }

        // bind listeners TO MD CONTENT
        scope.$on('$destroy', ondestroy);
        $timeout(function(){
          document.querySelector('md-content').addEventListener('scroll', onscroll);
          window.addEventListener('resize', onresize);

          // initialize sticky
          onscroll();
        })

      }
    }
  })

  .directive('wizardBalloon', function ($timeout, colors) {
    return {
      restrict: 'A',
      scope: {
        text: '=',
        direction: '='
      },
      templateUrl: 'src/directives/wizardBalloon.html'
    }
  })

  .directive('profileLabel', function ($timeout, colors) {
    return {
      restrict: 'A',
      scope: {
        presets: '=',
        preset: '=',
        gender: '=',
        age: '=',
        work: '=',
        income: '=',
        diploma: '=',
        owner: '=',
        wedding: '=',
        children: '=',
        partnerWorks: '=',
        charity: '=',
        french: '='
      },
      templateUrl: 'src/directives/profileLabel.html',
      link: function($scope, el, attrs) {

        $scope.$watch('presets', update)
        $scope.$watch('gender', update)
        $scope.$watch('age', update)
        $scope.$watch('work', update)
        $scope.$watch('income', update)
        $scope.$watch('diploma', update)
        $scope.$watch('owner', update)
        $scope.$watch('wedding', update)
        $scope.$watch('children', update)
        $scope.$watch('partnerWorks', update)
        $scope.$watch('charity', update)
        $scope.$watch('french', update)
        $scope.$watch('preset', updateFromPreset)

        function updateFromPreset() {
          var k
          for (k in $scope.preset.data) {
            $scope[k] = $scope.preset.data[k]
          }
        }

        function update() {

          $scope.preset = false
          $scope.presets.forEach(function(preset){
            var k
            var match = true
            for(k in preset.data) {
              if (preset.data[k] !== $scope[k]) {
                match = false
              }
            }
            if (match) {
              $scope.preset = preset
            }
          })
        }

        $scope.choosePreset = function() {
          $scope.displayPresets = true;
        }
      }
    }
  })

  .directive('happinessDiagram', function ($timeout, colors, $translate, $translatePartialLoader, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        dimension: '=',
        happinessModel: '=',
        presets: '=',
        preset: '=',
        gender: '='
      },
      templateUrl: 'src/directives/populationDataVis.html',
      link: function($scope, directiveElement, attrs) {

        // D3 element
        var el = angular.element(directiveElement.children()[0])

        el.html('<div></div>')

        $scope.highlightedItem

        $scope.$watch('dimension', softUpdate)
        $scope.$watch('happinessModel', softUpdate)
        $scope.$watch('presets', redraw)
        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })
        redraw()

        function softUpdate() {
          $timeout(function(){
            updateValues()
            redrawText()
          })
        }

        // Translation
        var translations
        var textContents = [
          'TITLE current_life',
          'TITLE leisure',
          'TITLE housing',
          'TITLE loved_ones',
          'OF POPULATION',
          'IS HAPPIER',
          'IS LESS HAPPY',
          'OF HAPPINESS',
          'PREDICTED'
        ]
        $translatePartialLoader.addPart('populationData')
        $translate.refresh()
        $rootScope.$on('$translateChangeSuccess', updateTranslations)
        $timeout(updateTranslations)
        function updateTranslations() {
          $translate(textContents).then(function (t) {
            translations = t
            redrawText()
          })
        }

        // Visualization
        var widthHeightRatio = 0.54
        var personCount = 200
        var personMargin = 1.5
        var personRadius    // Computed from width and height
        var rectangleWidth  // Computed from width and height
        var xOffset = -55
        var youProfile
        var data
        var simulation
        var y // y scale
        var youColor = '#36827a'
        // var color = d3.interpolateHslLong(d3.hsl(d3.color('#DDD')), d3.hsl(d3.color('#ffca28')))
        var color = function(t){
          var hcl = d3.hcl('#AAA')
          hcl.h = (360 + -180 * (1-t) + 120 * t)%360
          hcl.c = 70 * t * t
          hcl.l = 82 * (1-t) + 78 * t
          return d3.rgb(hcl)
        }

        var margin = {top: 36, right: 24, bottom: 64, left: 24};
        var width
        var height

        // D3 elements
        var svg
        var g // SVG group for main graphical elements
        var gText
        var tooltip = d3.select(directiveElement.children()[1])

        function redraw() {
          // FIXME: use a relevant 'if' condition
          if (true || $scope.data !== undefined){
            $timeout(function () {
              el.html('');

              // Setup: dimensions
              width = el[0].offsetWidth - margin.left - margin.right - 12;
              height = el[0].offsetHeight - margin.top - margin.bottom - 12;

              // Vis settings
              personRadius = 0.95 * Math.sqrt( ( height * height * widthHeightRatio / personCount ) / Math.PI ) - personMargin
              rectangleWidth = widthHeightRatio * height
              xOffset = -50

              // SVG container
              svg = d3.select(el[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              // Patterns for images NB: ids have to check imageId from nodes generateData()
              var defs = svg.append('defs')
              $scope.presets.forEach(function(preset){
                addPattern(defs, preset.id, preset.avatar)
              })
              addPattern(defs, 'man', 'res/man.svg')
              addPattern(defs, 'woman', 'res/woman.svg')
              function addPattern(defs, id, url) {
                defs.append('pattern')
                  .attr('id', id)
                  .attr('x', '0%')
                  .attr('y', '0%')
                  .attr('height', '100%')
                  .attr('width', '100%')
                  .attr('viewBox', '0 0 64 64')
                .append('svg:image')
                  .attr('x', '0%')
                  .attr('y', '0%')
                  .attr('height', '64')
                  .attr('width', '64')
                  .attr('xlink:href', url)
              }
              // persons' SVG group
              g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // text's SVG group
              gText = svg.append("g")
                .attr("class", "text-layer")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // Draw text
              redrawText()

              // Draw main graphical elements

              // Scales
              y = d3.scaleLinear()
                .rangeRound([height, 0]);

              // Get data
              data = generateData()

              // Set scales domain
              y.domain(d3.extent(data, function(d) { return d.value; }));

              // Starting positions
              startingPositions(data, y)

              rebootSimulation()

              var cell = g.append("g")
                .attr("class", "cells")
              .selectAll("g").data(data)
              .enter().append("g");

              cell.append("circle")
                .attr("r", function(d) { return d.radius; })
                .attr("cx", function(d) { return width/2 + d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", profileFill)
                .attr("class", function(d){if(d.isPreset){return 'active'} return false})
                .on("click", function(d) {
                  d3.event.stopPropagation()
                  if (d.isPreset) {
                    $timeout(function(){
                      $scope.preset = d.preset
                    })
                  // } else {
                  //   displayTooltip(d, d3.event.layerX, d3.event.layerY)
                  }
                })
                // .on("mouseover", function(d) {
                //   d3.event.stopPropagation()
                //   displayTooltip(d, d3.event.layerX, d3.event.layerY)
                // })
                // .on("mouseout", function(d) {
                //   d3.event.stopPropagation()
                //   hideTooltip()
                // })

              directiveElement.on('click', function() {
                hideTooltip()
              })

              function displayTooltip(item, x, y) {
                $timeout(function(){
                  $scope.highlightedItem = item;

                  tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                  tooltip
                    .style("left", x + "px")
                    .style("top", y + "px");
                })
              }

              function hideTooltip() {
                $timeout(function(){
                  $scope.highlightedItem = {};

                  tooltip.transition()
                    .duration(200)
                    .style("opacity", .0);
                })
              }

              function generateData() {
                var persons = []

                // Artificial persons
                // Note: we generate layers for more pleasing aesthetics
                var layerCount = Math.floor( Math.sqrt(personCount * height / rectangleWidth ) )
                var layer_i
                var person_i
                var jitter = 0.6 // 0: exact position in grid, 1: each nodes varies in its square space

                for (layer_i = 0; layer_i<layerCount; layer_i++) {
                  var minValue = 1 + 9 * layer_i/layerCount
                  var maxValue = minValue + 10/layerCount
                  for (person_i = 0; person_i < personCount/layerCount; person_i++) {
                    var value = minValue + Math.random() * (maxValue - minValue)
                    persons.push({
                      id: layer_i + '-' + person_i,
                      positionWeight: 0.1,
                      value: value,
                      radius: personRadius,
                      offset: rectangleWidth * ( (person_i + jitter * (Math.random() - 0.5) ) / (personCount/layerCount) ) - rectangleWidth / 2,
                      happinessModel: {
                        current_life: {
                          score: getHappinessFromDecile(value, 'current_life'),
                          decile: value,
                          color: d3.color(color(getHappinessFromDecile(value, 'current_life')/10)).toString()
                        },
                        leisure: {
                          score: getHappinessFromDecile(value, 'leisure'),
                          decile: value,
                          color: d3.color(color(getHappinessFromDecile(value, 'leisure')/10)).toString()
                        },
                        housing: {
                          score: getHappinessFromDecile(value, 'housing'),
                          decile: value,
                          color: d3.color(color(getHappinessFromDecile(value, 'housing')/10)).toString()
                        },
                        loved_ones: {
                          score: getHappinessFromDecile(value, 'loved_ones'),
                          decile: value,
                          color: d3.color(color(getHappinessFromDecile(value, 'loved_ones')/10)).toString()
                        }
                      }
                    })
                  }
                }

                // Preset personas
                $scope.presets.forEach(function(p) {
                  persons.push({
                    id: p.id,
                    isPreset: true,
                    preset: p,
                    positionWeight: 0.1,
                    value: p.happinessModel[$scope.dimension].decile,
                    happinessModel: p.happinessModel,
                    radius: personRadius,
                    offset: 0.8 * ( rectangleWidth * Math.random() - rectangleWidth / 2 ),
                    imageId: p.id
                    // color: preset.color
                  })
                })

                // the "You" person
                youProfile = {
                  id: 'you',
                  positionWeight: .6,
                  value: $scope.happinessModel[$scope.dimension].decile,
                  happinessModel: $scope.happinessModel,
                  radius: personRadius * 2.4,
                  offset: 0,
                  // color: youColor,
                  imageId: ($scope.gender == 'gender_male') ? ('man') : ('woman')
                }
                persons.push(youProfile)

                return persons
              }

              function startingPositions(persons, yScale) {
                persons.forEach(function(p){
                  p.x = 8 * p.offset + (Math.random() - 0.5) * 2 * rectangleWidth
                  p.y = height - 0.1 * yScale(p.value)
                })
              }


            }, 0)
          }
        }

        function redrawText() {
          if (gText && translations) {

            gText.html('')

            var xText = width / 2 + xOffset + rectangleWidth / 2 + 35
            var yText
            var lineHeight
            var score = Math.round($scope.happinessModel[$scope.dimension].score * 10) / 10
            var decile = $scope.happinessModel[$scope.dimension].decile
            var above = 100 - 10 * Math.ceil(decile)
            var below = 10 * ( Math.floor(decile) - 1 )

            // Percents above
            yText = 30
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '48px')
              .attr('fill', color(1))
              .text(above + '%')

            lineHeight = 16
            yText += lineHeight
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '12px')
              .attr('fill', color(1))
              .text(translations['OF POPULATION'].toUpperCase())

            yText += lineHeight
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '12px')
              .attr('fill', color(1))
              .text(translations['IS HAPPIER'].toUpperCase())

            // Percents below
            yText = height - 30
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '48px')
              .attr('fill', color(0))
              .text(below + '%')

            lineHeight = 16
            yText += lineHeight
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '12px')
              .attr('fill', color(0))
              .text(translations['OF POPULATION'].toUpperCase())

            yText += lineHeight
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '12px')
              .attr('fill', color(0))
              .text(translations['IS LESS HAPPY'].toUpperCase())

            // Decile
            yText = height/2
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '48px')
              .attr('fill', youColor)
              .text(score)

            lineHeight = 16
            yText += lineHeight
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '12px')
              .attr('fill', youColor)
              .text(translations['OF HAPPINESS'].toUpperCase())

            yText += lineHeight
            gText.append("text")
              .attr('x', xText)
              .attr('y', yText)
              .attr('font-size', '12px')
              .attr('fill', youColor)
              .text(translations['PREDICTED'].toUpperCase())

            // Title
            var titleSize = 18
            gText.append("text")
              .attr('x', width / 2 + xOffset)
              .attr('y', height + titleSize + 30)
              .attr('text-anchor', 'middle')
              .attr('font-size', titleSize + 'px')
              .attr('fill', '#666')
              .text(translations['TITLE ' + $scope.dimension])
          }
        }

        function updateValues() {
          if (g && youProfile) {
            youProfile.value = $scope.happinessModel[$scope.dimension].decile
            youProfile.imageId = ($scope.gender == 'gender_male') ? ('man') : ('woman')
            youProfile.happinessModel = $scope.happinessModel
            rebootSimulation()

            // Update image
            d3.selectAll("circle")
              .style("fill", profileFill)
          }
        }

        function profileFill(d) {
          if (d.imageId) {
            if ($scope.preset && $scope.preset.id) {
              if (d.id == 'you') return 'url(#'+$scope.preset.id+')'
              if (d.imageId == $scope.preset.id) return color(d.happinessModel[$scope.dimension].score/10);
            }
            return 'url(#'+d.imageId+')'
          }
          else return d3.color(d.color) || color(d.happinessModel[$scope.dimension].score/10);
        }

        function rebootSimulation() {
          if (simulation) {
            simulation.stop()
          }
          simulation = d3.forceSimulation(data)
              .force("x", d3.forceX(function(d) { return d.offset; }).strength(function(d){
                return d.positionWeight || .1
              }))
              // .force("y", d3.forceY(function(d) { return y(d.value); }).strength(.1))
              .force("y", d3.forceY(function(d) { return y(d.value); }).strength(function(d){
                return d.positionWeight || .1
              }))
              .force("collide", d3.forceCollide(function(d) { return d.radius + personMargin; }).strength(0.8))
              .on("tick", ticked)
              .alphaMin(0.05)
        }

        function ticked() {
          svg.selectAll('circle')
            .attr("cx", function(d) { return width/2 + d.x + xOffset; })
            .attr("cy", function(d) { return d.y; })
        }

        var happinessDeciles = {
          current_life: [6.41, 6.8, 7.08, 7.29, 7.47, 7.61, 7.75, 7.89, 8.09],
          leisure: [5.8, 6.19, 6.45, 6.66, 6.85, 7.03, 7.23, 7.45, 7.76],
          housing: [6.98, 7.24, 7.51, 7.78, 7.92, 8.02, 8.1, 8.19, 8.3],
          loved_ones: [7.59, 7.79, 7.9, 8, 8.08, 8.16, 8.24, 8.35, 8.48]
        }

        function getHappinessFromDecile(decile, dimension) {
          var roundedDecile = Math.floor(decile)
          var deciles = happinessDeciles[dimension]
          var min
          var max
          if (roundedDecile <= 1) {
            min = 0
            max = deciles[0]
          } else if (roundedDecile >= 9) {
            min = deciles[8]
            max = 10
          } else {
            min = deciles[roundedDecile - 1]
            max = deciles[roundedDecile]
          }

          var restant = decile - roundedDecile
          if (restant < 0) { restant = 0 }
          if (restant > 1) { restant = 1 }
          var score = min + restant * (max - min)
          return score
        }
      }
    }
  })
  .directive('landingSlidesContainer', function($translatePartialLoader) {
    return {
      restrict: 'A',
      scope: {},
      templateUrl: 'src/directives/landingSlidesContainer.html',
      link: function($scope, directiveElement, attrs) {
        $scope.currentSlide = 0;

        var slidesContainer = directiveElement.children()[0],
            slides = Array.prototype.slice.call(slidesContainer.children),
            isDebouncing = false;

        window.addEventListener('mousewheel', function(e) {
          e.preventDefault()
          if (isDebouncing) return;

          isDebouncing = true;
          setTimeout(function() {
            isDebouncing = false;
          }, 1500);

          if (e.deltaY > 0){
            setSlide($scope.currentSlide + 1)
          } else {
            setSlide($scope.currentSlide - 1)
          }
        });

        window.addEventListener('resize', function(e) {
          e.preventDefault()
          setSlide($scope.currentSlide);
        });

        function setSlide(i) {
          if (i < 0 || i > slidesContainer.children.length - 1) return;

          $scope.currentSlide = i;

          var val = $scope.currentSlide * window.innerHeight;
          scrollTo(document.body, val, 500);
        }

        // see: https://coderwall.com/p/hujlhg/smooth-scrolling-without-jquery
        function scrollTo(element, target, duration) {
          target = Math.round(target);
          duration = Math.round(duration);
          if (duration < 0) {
              return Promise.reject("bad duration");
          }
          if (duration === 0) {
              element.scrollTop = target;
              return Promise.resolve();
          }

          var startTime = Date.now();
          var endTime = startTime + duration;

          var startTop = element.scrollTop;
          var distance = target - startTop;

          // based on http://en.wikipedia.org/wiki/Smoothstep
          var smooth_step = function(start, end, point) {
              if(point <= start) { return 0; }
              if(point >= end) { return 1; }
              var x = (point - start) / (end - start); // interpolation
              return x*x*(3 - 2*x);
          }

          return new Promise(function(resolve, reject) {
              // This is to keep track of where the element's scrollTop is
              // supposed to be, based on what we're doing
              var previous_top = element.scrollTop;

              // This is like a think function from a game loop
              var scroll_frame = function() {
                  if(element.scrollTop != previous_top) {
                      reject("interrupted");
                      return;
                  }

                  // set the scrollTop for this frame
                  var now = Date.now();
                  var point = smooth_step(startTime, endTime, now);
                  var frameTop = Math.round(startTop + (distance * point));
                  element.scrollTop = frameTop;

                  // check if we're done!
                  if(now >= endTime) {
                      resolve();
                      return;
                  }

                  // If we were supposed to scroll but didn't, then we
                  // probably hit the limit, so consider it done; not
                  // interrupted.
                  if(element.scrollTop === previous_top
                      && element.scrollTop !== frameTop) {
                      resolve();
                      return;
                  }
                  previous_top = element.scrollTop;

                  // schedule next frame for execution
                  setTimeout(scroll_frame, 0);
              }

              // boostrap the animation process
              setTimeout(scroll_frame, 0);
          });
      }
      }
    }
  })
  .directive('landingSlide', ['$sce', '$translatePartialLoader', function($sce, $translatePartialLoader) {
      return {
        restrict: 'A',
        scope: {
          question: '@',
          subtitle: '@',
          class: '@',
          cta: '@'
        },
        templateUrl: 'src/directives/landingSlide.html',
        link: function($scope, directiveElement, attrs) {
          $scope.videoUrl = $sce.trustAsResourceUrl(
            'https://player.vimeo.com/video/' +
            attrs.videoUrl +
            '?title=0&byline=0&portrait=0&rel=0&autoplay=1&loop=1&autopause=0&background=1'
          );
        }
      }
    }])
  .directive('toolBar', function ($timeout, $translate) {
    return {
      restrict: 'A',
      scope: {
        methodologyLink: '='
      },
      templateUrl: 'src/directives/toolBar.html',
      link: function($scope, el, attrs) {
        $scope.language = $translate.use().toUpperCase()

        $scope.toggleLanguage = function () {
          if ($translate.use() == 'fr') {
            $translate.use('en')
            $scope.language = 'EN'
          } else {
            $translate.use('fr')
            $scope.language = 'FR'
          }

        }

      }
    }
  })

