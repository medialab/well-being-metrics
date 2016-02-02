'use strict';

/* Services */

angular.module('app.directives', [])
  
  .directive('hexus', function ($timeout) {
    return {
      restrict: 'E',
    // , templateUrl: 'partials/navbar.html'
      scope: {
          data: '='
      },
      link: function($scope, el, attrs) {
        var elId = el.attr('id')
        if (!elId) {console.log('Element id missing -> causes issues')};

        el.html('<div class="simple-curve">Loading...</div>');

        $scope.$watch('data', function () {
          if ($scope.data !== undefined){
            $timeout(function () {
              var data = $scope.data;

              


              // launchpad
              function initializeMap() {
                // creating base svg
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

                // hexagon shape variables
                var hex_di  = 100
                // radius
                var hex_rad = hex_di / 2
                // apothem
                var hex_apo = hex_rad * Math.cos(Math.PI / 6)
                // matrix defining state placement
                var states_grid = usStateMatrix()
                // data
                var states_names = usStateNames()
                // rows we'll generate
                var rows    = states_grid.length
                // columns we'll generate
                var cols    = states_grid[0].length
                // stroke width around hexagon
                var stroke  = 4
                // the hover state zoom scale
                var scale   = 2
                // initial x
                var x       = hex_rad * scale / 2 + stroke * scale
                // initial y
                var y       = hex_rad * scale + stroke * scale
                // side length in pixels
                var side    = Math.sin(Math.PI / 6) * hex_rad
                // height of map in pixels
                var height  = (hex_di - side) * rows + side + hex_rad * scale + stroke * scale
                // width of map in pixels
                var width   = (hex_apo * 2) * cols + hex_rad * scale + stroke * scale
                

                // svg attributes
                svg.setAttribute("class", "svg");
                svg.setAttribute("width", "100%");
                svg.setAttribute("height", "100%");
                svg.setAttribute("viewBox", "0 0 " + width + " " + height);
                
                // loop variables
                var offset = false,
                    // parsing state data
                    states = states_names,
                    // initial state index
                    state_index = 0;
                
                // draw grid
                for(var i = 0; i < states_grid.length; i++) {
                  var loop_x = offset ? hex_apo * 2 : hex_apo;
                  
                  var loc_x = x; 
                  for(var s = 0; s < states_grid[i].length; s++) {
                    // grid plot in 0 and 1 array
                    var grid_plot = states_grid[i][s];

                    // if we have a plot in the grid
                    if (grid_plot != 0) {
                      // get the state
                      var state = states[state_index];
                      
                      // lookup data for state
                      for(var d = 0; d < data.length; d++) {
                        if (data[d].state == state.abbr) {
                          state.data = data[d];
                        }
                      }

                      // ratio for fill on polygon
                      var ratio = 1;
                      
                      // create the hex group
                      var hexGroup = getHexGroup(svg, loc_x + loop_x , y, hex_rad, state, ratio, width, state.data);
                    
                      // have to reappend element on hover for stacking
                      hexGroup.addEventListener("mouseenter", function () {
                        var self = this;
                        self.setAttribute("class", "hover");
                        self.remove();
                        svg.appendChild(self);
                      });
                      // clear class
                      hexGroup.addEventListener("mouseleave", function () {
                        this.setAttribute("class", "");
                      });
                      
                      // append the hex to our svg
                      svg.appendChild(hexGroup);
                      // increase the state index reference
                      state_index++;
                    }

                    // move our x plot to next hex position
                    loc_x += hex_apo * 2; 
                  }
                  // move our y plot to next row position
                  y += hex_di * 0.75; 
                  // toggle offset per row
                  offset = !offset;
                }

                // add svg to DOM
                document.body.appendChild(svg);
              }

              // run the initialization script
              initializeMap();

              // individual hex calculations
              function getHexGroup(svg,x,y,r,state,ratio,width,data) {
                var svgNS  = svg.namespaceURI, // svgNS for creating svg elements
                    group  = document.createElementNS(svgNS, "g"),
                    hex    = document.createElementNS(svgNS, "polygon"),
                    abbr   = document.createElementNS(svgNS, "text"),
                    name   = document.createElementNS(svgNS, "text"),
                    pi_six = Math.PI/6,
                    cos_six = Math.cos(pi_six),
                    sin_six = Math.sin(pi_six);

                // hexagon polygon points
                var hex_points = [
                  [x, y - r].join(","),
                  [x + cos_six * r, y - sin_six * r].join(","),
                  [x + cos_six * r, y + sin_six * r].join(","),
                  [x, y + r].join(","),
                  [x - cos_six * r, y + sin_six * r].join(","),
                  [x - cos_six * r, y - sin_six * r].join(",")
                ]
                
                // hexagon fill based on ratio
                var fill = "hsl(180,60%," + ((1 - ratio) * 60 + 20) + "%)";
                  
                hex.setAttribute("points", hex_points.join(" "));
                hex.setAttribute("fill", fill);
                
                abbr.setAttribute("class", "state-abbr");
                abbr.setAttribute("x", x);
                abbr.setAttribute("y", y);
                abbr.textContent = state.abbr;
                
                name.setAttribute("class", "state-name");
                name.setAttribute("x", x);
                name.setAttribute("y", y);
                name.textContent = state.name;
                
                // loop through data points
                var index = 1,
                    // lineheight of data text
                    line_height = 20,
                    // starting y of data
                    start_y = 60;
                
                for(var key in data) {
                  var text = document.createElementNS(svgNS, "text");
                  text.setAttribute("x", width / 2);
                  text.setAttribute("y", index * line_height + start_y);
                  if(key != 'state') {
                    text.setAttribute("class", "data");
                    text.textContent = keyToName(key) + ": " + data[key];
                  } else {
                    text.setAttribute("class", "data title");
                    text.textContent = state.name;
                  }
                  group.appendChild(text);
                  index++;
                }
                
                group.appendChild(hex);  
                group.appendChild(abbr);  
                group.appendChild(name);  
                
                return group;
              }

              function keyToName(str) {
                return str.replace(/_/g,' ')
                  .replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
              }

              function usStateMatrix() {
                return [
                  [1,0,0,0,0,0,0,0,0,0,0,1],
                  [0,0,0,0,0,0,0,0,0,1,1,0],
                  [0,1,1,1,1,1,0,1,0,1,1,1],
                  [0,1,1,1,1,1,1,1,1,1,1,0],
                  [0,1,1,1,1,1,1,1,1,1,1,0],
                  [0,1,1,1,1,1,1,1,1,1,0,0],
                  [0,0,0,1,1,1,1,1,1,0,0,0],
                  [1,0,0,0,1,0,0,1,0,0,0,0]
                ]
              }

              function usStateNames() {
                return [
                  { abbr: "AK", name: "Alaska" },
                  { abbr: "ME", name: "Maine"},

                  { abbr: "VT", name: "Vermont" },
                  { abbr: "NH", name: "New Hampshire"},

                  { abbr: "WA", name: "Washington" },
                  { abbr: "MT", name: "Montana" },
                  { abbr: "ND", name: "North Dakota" },
                  { abbr: "MN", name: "Minnesota" },
                  { abbr: "WI", name: "Wisconsin" },
                  { abbr: "MI", name: "Michigan" },
                  { abbr: "NY", name: "New York" },
                  { abbr: "MA", name: "Massachusetts" },
                  { abbr: "RI", name: "Rhode Island"},

                  { abbr: "ID", name: "Idaho" },
                  { abbr: "WY", name: "Wyoming" },
                  { abbr: "SD", name: "South Dakota" },
                  { abbr: "IA", name: "Iowa" },
                  { abbr: "IL", name: "Illinois" },
                  { abbr: "IN", name: "Indiana" },
                  { abbr: "OH", name: "Ohio" },
                  { abbr: "PA", name: "Pennsylvania" },
                  { abbr: "NJ", name: "New Jersey" },
                  { abbr: "CT", name: "Connecticut"},

                  { abbr: "OR", name: "Oregon" },
                  { abbr: "NV", name: "Nevada" },
                  { abbr: "CO", name: "Colorado" },
                  { abbr: "NE", name: "Nebraska" },
                  { abbr: "MO", name: "Missouri" },
                  { abbr: "KY", name: "Kentucky" },
                  { abbr: "WV", name: "West Virgina" },
                  { abbr: "VA", name: "Virginia" },
                  { abbr: "MD", name: "Maryland" },
                  { abbr: "DE", name: "Delaware"},

                  { abbr: "CA", name: "California" },
                  { abbr: "UT", name: "Utah" },
                  { abbr: "NM", name: "New Mexico" },
                  { abbr: "KS", name: "Kansas" },
                  { abbr: "AR", name: "Arkansas" },
                  { abbr: "TN", name: "Tennessee" },
                  { abbr: "NC", name: "North Carolina" },
                  { abbr: "SC", name: "South Carolina" },
                  { abbr: "DC", name: "District of Columbia"},

                  { abbr: "AZ", name: "Arizona" },
                  { abbr: "OK", name: "Oklahoma" },
                  { abbr: "LA", name: "Louisiana" },
                  { abbr: "MS", name: "Mississippi" },
                  { abbr: "AL", name: "Alabama" },
                  { abbr: "GA", name: "Georgia"},

                  { abbr: "HI", name: "Hawaii" },
                  { abbr: "TX", name: "Texas" },
                  { abbr: "FL", name: "Florida" }
                ]
              }

            }, 0, false);
          }
        });
      }
    }
  })
