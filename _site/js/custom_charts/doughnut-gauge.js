function DoughnutGauge(elementId, options) {
    // Merge the default settings with the provided options.
    var settings = $.extend({
        width: 165,
        height: 165,
        innerRadius: 55,
        outerRadius: 75,
        minValue: 0,
        maxValue: 100,
        gaugeValue: 0,
        gaugeExtraRadius: 5,
        warningPercent: 25,
        baseColor: "#00F",
        backdropColor: "#333",
        warningColor: "#F00"
    }, options);

    var triggerWarning = ((settings.gaugeValue/settings.maxValue)*100 <= settings.warningPercent);

    /** Begin Segments **/
    // Array to hold the relevant data for the graph.
    var graphData = [];

    // There are seven segments of the doughnut that span 36 degrees.
    var arcSpan = 36;
    // So, create 7 data items for the gauge itself.
    var numSegments = 7;
    // Calculate the color for each sector.
    for (var i = 0; i < numSegments; i++){
        // Calculate the segment's starting angle.
        var startAngle = i * arcSpan;
        // Calculate the segment's end angle.
        var endAngle = (i+1) * arcSpan;
        // Calculate the color of this segment (lighter to darker), using the functions provided in js/utils/alterColor.js.
        var segmentColor = lightenRgb(settings.baseColor, 100, (100/numSegments)*(numSegments - (i+1)));

        // Put the data together.
        graphData.push({
            From: startAngle,
            To: endAngle,
            Color: segmentColor,
            Ignore: false
        });
    }

    // Append the backdrop gray segment.
    // Calculate the segment's starting angle.
    var startAngle = numSegments*arcSpan;//(i + numSegments) * arcSpan;
    // Calculate the segment's end angle.
    var endAngle = (numSegments+3)*arcSpan;//(i + numSegments + 1) * arcSpan;

    // Put the data together.
    graphData.push({
        From: startAngle,
        To: endAngle,
        Color: settings.backdropColor,
        Ignore: true
    });
    /** End Segments **/

    var maxLimit = 0;
    var minLimit = 9999999;
    var d3DataSource = [];
    var d3TickSource = [];

    //Data Generation
    $.each(graphData, function (index, value) {
        d3DataSource.push([value.From, value.To, value.Color]);
        if (!value.Ignore) {
            if (value.To > maxLimit) maxLimit = value.To;
            if (value.From < minLimit) minLimit = value.From;
        }
    });

    if (minLimit > 0) {
        d3DataSource.push([0, minLimit, "#d7d7d7"]);
    }

    var pi = Math.PI;

    //Control Genration
    //var vis = d3.select(elementId);
    // Create the SVG.
    var svg = d3.select(elementId)
                .append("svg")
                .attr("class", "doughnut-gauge")
                .attr("width", settings.width)
                .attr("height", settings.height)
                .append("g");

    var translate = "translate(" + settings.width / 2 + "," + settings.width / 2 + ")";
    // Set the range of the meter to be from -145 degrees to 145 degrees (0 degrees is where 90 ususally is).
    var gaugeRangeScale = d3.scale.linear().domain([0, maxLimit]).range([-126 * (pi / 180), 126 * (pi / 180)]);

    // Draw the backdrop.
    var backdrop = d3.svg.arc()
        .innerRadius(settings.innerRadius)
        .outerRadius(settings.outerRadius)
        .startAngle(0)
        .endAngle(360);

    // Draw the segments.
    var arc = d3.svg.arc()
        .innerRadius(settings.innerRadius)
        .outerRadius(settings.outerRadius)
        .startAngle(function (d) { return gaugeRangeScale(d[0]); })
        .endAngle(function (d) { return gaugeRangeScale(d[1]); });


    // Tick marks...
    var tickArc = d3.svg.arc()
        .innerRadius(settings.innerRadius - 20)
        .outerRadius(settings.innerRadius - 2)
        .startAngle(function (d) { return gaugeRangeScale(d[0]); })
        .endAngle(function (d) { return gaugeRangeScale(d[1]); });

    for (var i = 0; i < 10; i++) {
        var point = (i * maxLimit) / 10.0;
        d3TickSource.push([point, point +1, "#d7d7d7"]);
    }

    svg.selectAll("path")
        .data(d3DataSource)
        .enter()
        .append("path")
        .attr("d", arc)
        .style("fill", function (d) { return d[2]; })
        .attr("transform", translate);

    // Add a circle as the gauge.
    var distanceFromCenter = settings.outerRadius - (settings.outerRadius - settings.innerRadius)/2;

    // Start circle.
    // Start circle position.
    var startCircle = adjustGaugeValue(maxLimit, settings.minValue, settings.maxValue);
    startCircle = gaugeRangeScale(startCircle);
    svg.append('circle')
        .attr('fill', graphData[0].Color)
        .attr('cx', Math.cos(startCircle) * distanceFromCenter)
        .attr('cy', Math.sin(startCircle) * distanceFromCenter)
        .attr('r', (settings.outerRadius-settings.innerRadius)/2)
        .attr("transform", translate);

    // End circle.
    // End circle position.
    var endCircle = adjustGaugeValue(maxLimit, settings.maxValue, settings.maxValue);
    endCircle = gaugeRangeScale(endCircle);
    svg.append('circle')
        .attr('fill', graphData[numSegments-1].Color)
        .attr('cx', Math.cos(endCircle) * distanceFromCenter)
        .attr('cy', Math.sin(endCircle) * distanceFromCenter)
        .attr('r', (settings.outerRadius-settings.innerRadius)/2)
        .attr("transform", translate);

    // Gauge position.
    var gaugeValue = adjustGaugeValue(maxLimit, settings.gaugeValue, settings.maxValue);
    // Figure out which color the gauge circle should be, defaulting to the base color.
    var gaugeColor = settings.baseColor;
    // If the gaugeValue is under the warning threshold.
    if (triggerWarning) {
        // Set the color to the warning color.
        gaugeColor = settings.warningColor;
    } else {
        for (var i = 0; i < graphData.length-1; i++){
            // If the gaugeValue is betewen the to and from of this data item.
            if ((gaugeValue+90) >= graphData[i].From && (gaugeValue+90) < graphData[i].To){
                // Set the gauge color to this segment's color.
                gaugeColor = graphData[i].Color;
                // Break out of the loop.
                break;
            }
        }
    }
    // Adjust the gauge value to the gauge's range.
    gaugeValue = gaugeRangeScale(gaugeValue);
    // Gauge outer circle.
    svg.append('circle')
        .attr('fill', gaugeColor)
        .attr('cx', Math.cos(gaugeValue) * distanceFromCenter)
        .attr('cy', Math.sin(gaugeValue) * distanceFromCenter)
        .attr('r', ((settings.outerRadius+settings.gaugeExtraRadius)-settings.innerRadius)/2)
        .attr("transform", translate);

    // Gauge inner circle.
    svg.append('circle')
        .attr("class", "doughnut-gauge-inner-circle")
        .attr('cx', Math.cos(gaugeValue) * distanceFromCenter)
        .attr('cy', Math.sin(gaugeValue) * distanceFromCenter)
        .attr('r', (settings.outerRadius-settings.innerRadius)/2)
        .attr("transform", translate);

    // If the gauge value is under the warning threshold.
    if (triggerWarning){
        // Show the active value.
        svg.append("text")
           .attr("class", "doughnut-gauge-number-warning")
           .attr("y", 10)
           .text(settings.gaugeValue)
           .attr("transform", translate);
    } else {
        // Show the active value.
        svg.append("text")
           .attr("class", "doughnut-gauge-number")
           .attr("y", 10)
           .text(settings.gaugeValue)
           .attr("transform", translate);
    }
}

function adjustGaugeValue (scaleMax, gaugeValue, gaugeMax){
    // Subtract 90 because of the start being at the -90 degree point on a clockwise circle.
    return ((gaugeValue*scaleMax)/gaugeMax)-90;
}