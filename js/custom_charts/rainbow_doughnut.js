(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        //Cache a local reference to Chart.helpers
        helpers = Chart.helpers;

    var defaultConfig = {
        // Meter attributes.
        meterRadius: 20,
        meterColor: "#00F",
        meterInnerRadius: 10,
        meterInnerColor: "#fff",
        meterValue: 0, // Measured in degrees from the start.
        meterStartAngle: Math.PI * -1.25,
        meterEndAngle: Math.PI * 0.25,
        textColor: "#5E5E5E",
        backgroundColor: "#E9E9E9",
        includeBackground: true,
        responsive: true,

        animationSteps: 100,

        // Doughnut Scale Min
        minValue: 0,
        // Doughnut Scale Max
        maxValue: 100,

        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,

        //The percentage of the chart that we cut out of the middle.
        percentageInnerCutout: 50,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

    };


    Chart.MeteredDoughnut = Chart.Type.extend({
        //Passing in a name registers this chart in the Chart namespace
        name: "MeteredDoughnut",
        //Providing a defaults will also register the deafults in the chart namespace
        defaults: defaultConfig,
        //Initialize is fired when the chart is initialized - Data is passed in as a parameter
        //Config is automatically merged by the core of Chart.js, and is available at this.options
        initialize: function(data) {
            this.meterValue = 0;
            //Declare segments as a static property to prevent inheriting across the Chart type prototype
            this.segments = [];
            this.outerRadius = (helpers.min([this.chart.width - (this.chart.width * 0.12), this.chart.height - (this.chart.height * 0.12)]) - this.options.segmentStrokeWidth / 2) / 2;

            this.SegmentArc = Chart.Arc.extend({
                ctx: this.chart.ctx,
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];

                    helpers.each(this.segments, function(segment) {
                        segment.restore(["fillColor"]);
                    });
                    helpers.each(activeSegments, function(activeSegment) {
                        activeSegment.fillColor = activeSegment.highlightColor;
                    });
                    this.showTooltip(activeSegments);
                });
            }
            this.calculateTotal(data);

            helpers.each(data, function(datapoint, index) {
                this.addData(datapoint, index, true);
            }, this);

            this.render();
        },
        getSegmentsAtEvent: function(e) {
            var segmentsArray = [];

            var location = helpers.getRelativePosition(e);

            helpers.each(this.segments, function(segment) {
                if (segment.inRange(location.x, location.y)) segmentsArray.push(segment);
            }, this);
            return segmentsArray;
        },
        addData: function(segment, atIndex, silent) {
            var index = atIndex || this.segments.length;
            this.segments.splice(index, 0, new this.SegmentArc({
                value: segment.value,
                outerRadius: (this.options.animateScale) ? 0 : this.outerRadius,
                innerRadius: (this.options.animateScale) ? 0 : (this.outerRadius / 100) * this.options.percentageInnerCutout,
                fillColor: segment.color,
                highlightColor: segment.highlight || segment.color,
                showStroke: this.options.segmentShowStroke,
                strokeWidth: this.options.segmentStrokeWidth,
                strokeColor: this.options.segmentStrokeColor,
                startAngle: Math.PI * -1.25,
                circumference: (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
                label: segment.label
            }));
            if (!silent) {
                this.reflow();
                this.update();
            }
        },
        calculateCircumference: function(value) {
            return (Math.PI * 1.5) * (value / this.total);
        },
        calculateTotal: function(data) {
            this.total = 0;
            helpers.each(data, function(segment) {
                this.total += segment.value;
            }, this);
        },
        update: function() {
            this.calculateTotal(this.segments);

            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore(['fillColor']);
            });

            helpers.each(this.segments, function(segment) {
                segment.save();
            });
            this.render();
        },

        removeData: function(atIndex) {
            var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length - 1;
            this.segments.splice(indexToDelete, 1);
            this.reflow();
            this.update();
        },

        reflow: function() {
            helpers.extend(this.SegmentArc.prototype, {
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });
            this.outerRadius = (helpers.min([this.chart.width - (this.chart.width * 0.12), this.chart.height - (this.chart.height * 0.12)]) - this.options.segmentStrokeWidth / 2) / 2;
            helpers.each(this.segments, function(segment) {
                segment.update({
                    outerRadius: this.outerRadius,
                    innerRadius: (this.outerRadius / 100) * this.options.percentageInnerCutout
                });
            }, this);
        },

        /****** Meter Mutator Methods *******/
        setMeterValue: function(newMeterValue) {
            // Constrain the value to the limits.
            if (newMeterValue > this.options.maxValue) {
                // Set it to the max.
                this.options.meterValue = this.options.maxValue;
            } else if (newMeterValue < this.options.minValue) {
                // Set it to the min.
                this.options.meterValue = this.options.minValue;
            } else {
                // Otherwise, just set it to the new value.
                this.options.meterValue = newMeterValue;
            }

            // Set the color.
            this.setMeterColor();
        },

        setMeterColor: function() {
            // Calculate the different between the min and max values of the scale.
            var diff = this.options.maxValue - this.options.minValue;
            // Divide the difference by the number of segments.
            var rangeOfOneSegment = diff / this.segments.length;

            // Divide the current meter value by the range of one segment, and computer by modulus 7 to get the corresponding segment.
            var correspondingSegment = Math.floor(this.meterValue / rangeOfOneSegment);

            // Constrain the value.
            if (correspondingSegment >= this.segments.length) {
                // Set the value to the length minus 1.
                correspondingSegment = this.segments.length - 1;
            } else if (correspondingSegment < 0) {
                // Set it to zero.
                correspondingSegment = 0;
            }

            // Set the current color.
            this.options.meterColor = this.segments[correspondingSegment].fillColor;
        },

        calculateMeterAngle: function(objectPosition) {
            // Calculate the percent the meter is on the actual current value scale of the meter.
            var neutralPercent = objectPosition / (this.options.maxValue - this.options.minValue);
            // Calculate the corresponding value on the scale of the start and end angles.
            var totalRangeDegrees = (Math.abs(this.options.meterStartAngle * 180 / Math.PI)) + (this.options.meterEndAngle * 180 / Math.PI);
            // Get the meters position in degrees.
            var meterPosDegrees = neutralPercent * totalRangeDegrees;
            // Adjust the degrees to radians.
            var meterPosRadians = (meterPosDegrees * Math.PI / 180) + this.options.meterStartAngle;
            return meterPosRadians;
        },
        /****** Meter Mutator Methods *******/

        /****** Shape Functions *******/
        ellipse: function(originX, originY, radiusX, radiusY, angle) {
            var x = (Math.cos(angle) * radiusX) + originX;
            var y = (Math.sin(angle) * radiusY) + originY;
            return [x, y];
        },

        circle: function(originX, originY, radius, angle) {
            var x = (Math.cos(angle) * radius) + originX;
            var y = (Math.sin(angle) * radius) + originY;
            return [x, y];
        },

        /****** Shape Functions *******/

        /****** Drawing Functions *******/

        drawCircle: function(x, y, r, color, withBlur) {
            this.chart.ctx.beginPath();
            this.chart.ctx.arc(x, y, r, 0, Math.PI * 2, true);
            this.chart.ctx.fillStyle = color;
            if (withBlur) {
                this.chart.ctx.shadowColor = "#666";
                this.chart.ctx.shadowBlur = 10;
            } else {
                this.chart.ctx.shadowBlur = 0;
            }
            this.chart.ctx.fill();
        },

        drawCircleOnMeter: function(position, givenColor) {
            // Calculate the inner radius.
            var innerRadius = (this.outerRadius / 100) * this.options.percentageInnerCutout;
            // Get the difference between the inner and outer radii to use as the radius of this circle.
            var radiiDiff = this.outerRadius - innerRadius;
            // Calculate the middle radius.
            var middleRadius = (radiiDiff / 2) + innerRadius;
            // Set the origin of the circle to be the center of the chart.
            var circleX = this.chart.width / 2;
            var circleY = this.chart.height / 2;
            // Calculate the angle on the graph at which to display the circle.
            var circleAngle = this.calculateMeterAngle(position);
            // Calculate the position to place the meter on the graph.
            var updatedPos = this.circle(circleX, circleY, middleRadius, circleAngle);
            // Draw circle.
            this.drawCircle(updatedPos[0], updatedPos[1], radiiDiff*.5, givenColor, false);
        },

        drawText: function() {
            var fontSize = 65 * this.chart.width/218; // The tested size of the chart.
            this.chart.ctx.font = fontSize + "px Helvetica";
            this.chart.ctx.fillStyle = this.options.textColor;
            this.chart.ctx.textAlign = "center";
            this.chart.ctx.fillText(Math.floor(this.meterValue), this.chart.width / 2, this.chart.height * .6);
        },

        drawDoughnut: function(x, y, radius, thickness, color) {
            this.chart.ctx.beginPath();
            this.chart.ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
            this.chart.ctx.lineWidth = thickness;
            this.chart.ctx.strokeStyle = color;
            this.chart.ctx.stroke();
            this.chart.ctx.closePath();
        },

        drawSegment : function (x, y, radius, startAngle, endAngle, thickness, color){
            this.chart.ctx.beginPath();
            this.chart.ctx.arc(x, y, radius, startAngle, endAngle, false);
            this.chart.ctx.lineWidth = thickness;
            this.chart.ctx.strokeStyle = color;
            this.chart.ctx.stroke();
            this.chart.ctx.closePath();
        },

        drawMeter: function() {
            // Calculate the inner radius.
            var innerRadius = (this.outerRadius / 100) * this.options.percentageInnerCutout;
            // Calculate the middle radius.
            var middleRadius = ((this.outerRadius - innerRadius) / 2) + innerRadius;
            // Set the origin of the meter to be the center of the chart.
            var meterX = this.chart.width / 2;
            var meterY = this.chart.height / 2;
            // Calculate the angle on the graph at which to display the meter.
            var meterAngle = this.calculateMeterAngle(this.meterValue);
            // Calculate the position to place the meter on the graph.
            var updatedPos = this.circle(meterX, meterY, middleRadius, meterAngle);
            // Set the color.
            this.setMeterColor();
            // Draw outer circle.
            this.drawCircle(updatedPos[0], updatedPos[1],
                            (this.options.meterRadius * this.chart.width/218),
                            this.options.meterColor, true);
            // Draw inner circle.
            this.drawCircle(updatedPos[0], updatedPos[1],
                            (this.options.meterInnerRadius * this.chart.width/218),
                            this.options.meterInnerColor, false);
            // Draw text.
            this.drawText();
        },

        draw: function(easeDecimal) {
                var animDecimal = (easeDecimal) ? easeDecimal : 1;
                this.clear();

                if (this.options.includeBackground) {
                    // Draw the background circle.
                    this.drawCircle(this.chart.width / 2, this.chart.height / 2, this.outerRadius, this.options.backgroundColor, true);

                    var innerRadius = (this.outerRadius / 100) * this.options.percentageInnerCutout;
                    var radiiDiff = this.outerRadius - innerRadius;
                    // Calculate the middle radius.
                    var middleRadius = (radiiDiff / 2) + innerRadius;

                    this.drawDoughnut(this.chart.width / 2, this.chart.height / 2, middleRadius, radiiDiff, this.options.backgroundColor);
                }

                helpers.each(this.segments, function(segment, index) {
                    segment.transition({
                        circumference: this.calculateCircumference(segment.value),
                        outerRadius: this.outerRadius,
                        innerRadius: (this.outerRadius / 100) * this.options.percentageInnerCutout
                    }, 100);

                    segment.endAngle = segment.startAngle + segment.circumference;

                    //segment.draw();
                    // Draw the segment using custom draw function.
                    this.drawSegment(this.chart.width / 2, this.chart.height / 2, middleRadius, segment.startAngle, segment.endAngle, radiiDiff, segment.fillColor);

                    if (index === 0) {
                        segment.startAngle = this.options.meterStartAngle;
                        this.drawSegment(this.chart.width / 2, this.chart.height / 2, middleRadius, segment.startAngle, segment.endAngle, radiiDiff, segment.fillColor);
                        this.drawCircleOnMeter(this.options.minValue, segment.fillColor);
                    } else if (index === this.segments.length-1){
                        this.drawCircleOnMeter(this.options.maxValue, segment.fillColor);
                    }
                    //Check to see if it's the last segment, if not get the next and update the start angle
                    if (index < this.segments.length - 1) {
                        this.segments[index + 1].startAngle = segment.endAngle;
                    }

                }, this);
                this.meterValue = animDecimal * this.options.meterValue;

                this.drawMeter();
            },
            /****** Drawing Functions *******/
    });

    Chart.types.MeteredDoughnut.extend({
        name: "Doughnut",
        defaults: helpers.merge(defaultConfig, {
            percentageInnerCutout: 0
        })
    });

}).call(this);
