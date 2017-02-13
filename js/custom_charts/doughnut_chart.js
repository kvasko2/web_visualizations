var data = [{
    value: 40,
    color: "#842613",
    label: "Dark Red"
}, {
    value: 38,
    color: "#C24429",
    label: "Red"
}, {
    value: 38,
    color: "#E08214",
    label: "Orange"
}, {
    value: 38,
    color: "#FFBF00",
    label: "Yellow"
}, {
    value: 38,
    color: "#97BF1C",
    label: "Yellow-Green"
}, {
    value: 38,
    color: "#30BE39",
    label: "Green"
}, {
    value: 40,
    color: "#12662A",
    label: "Dark Green"
}];

var options = {
    meterValue: 207,
    maxValue: 500,
    minValue: 0,

    // Responsiveness and scaling
    responsiveDoughnut: true,
    scaleShowLine: false,
    scaleOverride: true,
    scaleSteps: 20,
    scaleStepWidth: 5,
    scaleStartValue: 0,

    // Shape of the meter.
    meterShape: "circle",

    //Boolean - Whether we should show a stroke on each segment
    segmentShowStroke: false,

    //String - The colour of each segment stroke
    segmentStrokeColor: "#fff",

    //Number - The width of each segment stroke
    segmentStrokeWidth: 2,

    //Number - The percentage of the chart that we cut out of the middle
    percentageInnerCutout: 75, // This is 0 for Pie charts

    animationSteps: 100,

    //String - A legend template
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
};

var doughnutCanvas1 = $('#doughnut-chart-survey-end1').get(0);
if(doughnutCanvas1) {
    var ctx = doughnutCanvas1.getContext("2d");
    options.meterValue = 186;
    var myNewChart = new Chart(ctx).MeteredDoughnut(data, options);
}
