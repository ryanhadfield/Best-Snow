$(window).on("load", function() {
    var queryURL = "stations.json";
    var map;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        powderResponse = response;
    }).then(function GetMap() {
        var navigationBarMode = Microsoft.Maps.NavigationBarMode;
        map = new Microsoft.Maps.Map('#myMap', {
            navigationBarMode: navigationBarMode.square,
            supportedMapTypes: [Microsoft.Maps.MapTypeId.road, Microsoft.Maps.MapTypeId.aerial]
        });

        // Sets zoom level at startup
        map.setView({
            zoom: 6
        })

        // Search bar functionality
        Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
            var manager = new Microsoft.Maps.AutosuggestManager({ map: map });
            manager.attachAutosuggest('#search', '.input-field', suggestionSelected);
        });
        
        function suggestionSelected(result) {
            map.setView({ bounds: result.bestView });
        }

        // sets to false as default
        var isAboveAverage = false;
        var isBelowAverage = false;
        var isAverage = false;

        // creates URL to pull from saved json files
        for (let i = 0; i < powderResponse.length; i++) {
            var pinURL = "data/input" + powderResponse[i].name + ".json";
            $.ajax({
                url: pinURL,
                method: "GET"
            }).then(function (averageSnow) {
                var totalSnow = 0;
                var numberOfInstances = 0;
                // iterates through each station json file
                for (let k = 0; k < averageSnow.data.length; k++) {
                    // if date from json file equals date from yesterday (no year)
                    if (averageSnow.data[k].Date.slice(5) == averageSnow.data[averageSnow.data.length - 1].Date.slice(5)) {
                        totalSnow = totalSnow + parseInt(averageSnow.data[k]["Snow Depth (in)"]);
                        numberOfInstances = numberOfInstances + 1;
                    };
                }

                // snow depth from yesterday
                var todaySnow = 0;
                if (averageSnow.data[averageSnow.data.length - 1]["Snow Depth (in)"] === null) {
                    todaySnow = 0;
                } else {
                    todaySnow = averageSnow.data[averageSnow.data.length - 1]["Snow Depth (in)"];
                }

                // compares yesterday snow to historical snow averages then calls setPin function to set color
                var average = totalSnow / numberOfInstances;
                var aboveAverage = average * 1.1;
                var belowAverage = average * .9;
                if (todaySnow > aboveAverage) {
                    isAboveAverage = true;
                    isBelowAverage = false;
                    isAverage = false;
                    setPin(isAboveAverage, isBelowAverage, isAverage); 

                } else if (todaySnow < belowAverage) {
                    isBelowAverage = true;
                    isAboveAverage = false;
                    isAverage = false;
                    setPin(isAboveAverage, isBelowAverage, isAverage); 
                } else {
                    isBelowAverage = false;
                    isAboveAverage = false;
                    isAverage = true;
                    setPin(isAboveAverage, isBelowAverage, isAverage);
                }
            })

            // sets pin color
            function setPin(isAboveAverage, isBelowAverage, isAverage) {
                if (isAboveAverage === true) { 
                    var pin = new Microsoft.Maps.Pushpin({
                        latitude: powderResponse[i].location.lat,
                        longitude: powderResponse[i].location.lng,
                    },
                        {
                            icon: './img/aboveAverage.png'
                        });
                    // meta data stored in each pin
                    pin.metadata = {
                        title: powderResponse[i].name,
                        elevation: powderResponse[i].elevation,
                        id: powderResponse[i].triplet,
                        lat: powderResponse[i].location.lat,
                        lng: powderResponse[i].location.lng,
                    }
                    // adds event handler function to each pin
                    Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                    // pushes pin to map
                    map.entities.push(pin);
                }
                else if (isBelowAverage === true) { 
                    var pin = new Microsoft.Maps.Pushpin({
                        latitude: powderResponse[i].location.lat,
                        longitude: powderResponse[i].location.lng,
                    },
                        {
                            icon: './img/belowAverage.png'
                        });
                    // meta data stored in each pin
                    pin.metadata = {
                        title: powderResponse[i].name,
                        elevation: powderResponse[i].elevation,
                        id: powderResponse[i].triplet,
                        lat: powderResponse[i].location.lat,
                        lng: powderResponse[i].location.lng,
                    }
                    // adds event handler function to each pin
                    Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                    // pushes pin to map
                    map.entities.push(pin);
                }
                else if (isAverage === true) { 
                    var pin = new Microsoft.Maps.Pushpin({
                        latitude: powderResponse[i].location.lat,
                        longitude: powderResponse[i].location.lng,
                    },
                        {
                            icon: './img/average.png'
                        });
                    // meta data stored in each pin
                    pin.metadata = {
                        title: powderResponse[i].name,
                        elevation: powderResponse[i].elevation,
                        id: powderResponse[i].triplet,
                        lat: powderResponse[i].location.lat,
                        lng: powderResponse[i].location.lng,
                    }
                    // adds event handler function to each pin
                    Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);
                    // pushes pin to map
                    map.entities.push(pin);
                }
            }
        }

    })

    // Searchbar Event listener
    $(".searchBarX").on("click", function() {
        $("#search").val("");
    })

    // Event Listener
    function pushpinClicked(e) {

        // API call for station pin that was clicked
        var snowURL = "data/input" + e.target.metadata.title + ".json"
        $.ajax({
            url: snowURL,
            method: "GET"
        }).then(function (stationResponse) {
            
            // Creates data arrays for charts
            var dataArray2015 = [];
            var dataArray2016 = [];
            var dataArray2017 = [];
            var dataArray2018 = [];
            var dataArray2019 = [];
            var dataArray2020 = [];
            var current2015 = 0;
            var current2016 = 0;
            var current2017 = 0;
            var current2018 = 0;
            var current2019 = 0;

            for (let i = 0; i < stationResponse.data.length; i++) {
                if (moment(stationResponse.data[i].Date).isBetween('2015-10-01', '2016-06-30')) {
                    if (moment(stationResponse.data[i].Date).isBetween('2015-10-01', '2016-01-01')) {
                        dataArray2015.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) }) //removed year then added 2001 or 2002 so all data aligns on graph.
                    }
                    else {
                        dataArray2015.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                    };
                    if (stationResponse.data[i].Date.slice(5) == stationResponse.data[stationResponse.data.length -1].Date.slice(5)) {
                        current2015 = stationResponse.data[i]["Snow Depth (in)"];
                    }
                }
                else if (moment(stationResponse.data[i].Date).isBetween('2016-10-01', '2017-06-30')) {
                    if (moment(stationResponse.data[i].Date).isBetween('2016-10-01', '2017-01-01')) {
                        dataArray2016.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                    }
                    else {
                        dataArray2016.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                    };
                    if (stationResponse.data[i].Date.slice(5) == stationResponse.data[stationResponse.data.length -1].Date.slice(5)) {
                        current2016 = stationResponse.data[i]["Snow Depth (in)"];
                    }

                }
                else if (moment(stationResponse.data[i].Date).isBetween('2020-10-01', '2021-06-30')) {
                    if (moment(stationResponse.data[i].Date).isBetween('2020-10-01', '2021-01-01')) {
                        dataArray2020.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                    }
                    else {
                        dataArray2020.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                    }
                }
                else if (moment(stationResponse.data[i].Date).isBetween('2017-10-01', '2018-06-30')) {
                    if (moment(stationResponse.data[i].Date).isBetween('2017-10-01', '2018-01-01')) {
                        dataArray2017.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                    }
                    else {
                        dataArray2017.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                    };
                    if (stationResponse.data[i].Date.slice(5) == stationResponse.data[stationResponse.data.length -1].Date.slice(5)) {
                        current2017 = stationResponse.data[i]["Snow Depth (in)"];
                    }
                }
                else if (moment(stationResponse.data[i].Date).isBetween('2018-10-01', '2019-06-30')) {
                    if (moment(stationResponse.data[i].Date).isBetween('2018-10-01', '2019-01-01')) {
                        dataArray2018.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                    }
                    else {
                        dataArray2018.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                    };
                    if (stationResponse.data[i].Date.slice(5) == stationResponse.data[stationResponse.data.length -1].Date.slice(5)) {
                        current2018 = stationResponse.data[i]["Snow Depth (in)"];
                    }
                }
                else if (moment(stationResponse.data[i].Date).isBetween('2019-10-01', '2020-06-30')) {
                    if (moment(stationResponse.data[i].Date).isBetween('2019-10-01', '2020-01-01')) {
                        dataArray2019.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2001-" + stationResponse.data[i].Date.slice(5)) })
                    }
                    else {
                        dataArray2019.push({ y: parseInt(stationResponse.data[i]["Snow Depth (in)"]), x: new Date("2002-" + stationResponse.data[i].Date.slice(5)) })
                    };
                    if (stationResponse.data[i].Date.slice(5) == stationResponse.data[stationResponse.data.length -1].Date.slice(5)) {
                        current2019 = stationResponse.data[i]["Snow Depth (in)"];
                    }
                };
            }

            var currentSnowDepth = 0;
            if (stationResponse.data[stationResponse.data.length - 1]["Snow Depth (in)"] == null) {
                if (stationResponse.data[stationResponse.data.length - 2]["Snow Depth (in)"] == null) {
                    currentSnowDepth = "0";
                }
                else {
                    currentSnowDepth = stationResponse.data[stationResponse.data.length - 2]["Snow Depth (in)"];
                }
            } else {
                    currentSnowDepth = stationResponse.data[stationResponse.data.length - 1]["Snow Depth (in)"];
            }

            //Create Line Chart
            var chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,
                theme: "light2",
                title: {
                    text: stationResponse.station_information.name + " - Elevation: " + e.target.metadata.elevation + " ft"
                },
                subtitles:[{
                    text: "Current snow depth: " + currentSnowDepth + " inches"
                }],
                axisY: {
                    title: "Seasonal Snow Depth",
                    suffix: " inches"
                },
                axisX: {
                    labelFormatter: function (e) {
                        return CanvasJS.formatDate(e.value, "DD MMM");
                    },
                    intervalType: "month"
                },
                data: [{
                    type: "spline",
                    indexLabelFontSize: 16,
                    name: "2015-2016",
                    showInLegend: true,
                    dataPoints: dataArray2015,
                    xValueFormatString: "DD-MMM"

                },
                {
                    type: "spline",
                    indexLabelFontSize: 16,
                    name: "2016-2017",
                    showInLegend: true,
                    dataPoints: dataArray2016,
                    xValueFormatString: "DD-MMM",
                },
                {
                    type: "spline",
                    indexLabelFontSize: 16,
                    name: "2017-2018",
                    showInLegend: true,
                    dataPoints: dataArray2017,
                    xValueFormatString: "DD-MMM",
                },
                {
                    type: "spline",
                    indexLabelFontSize: 16,
                    name: "2018-2019",
                    showInLegend: true,
                    dataPoints: dataArray2018,
                    xValueFormatString: "DD-MMM",
                },
                {
                    type: "spline",
                    indexLabelFontSize: 16,
                    name: "2019-2020",
                    showInLegend: true,
                    dataPoints: dataArray2019,
                    xValueFormatString: "DD-MMM",
                },
                {
                    type: "spline",
                    indexLabelFontSize: 16,
                    name: "2020-2021",
                    showInLegend: true,
                    dataPoints: dataArray2020,
                    xValueFormatString: "DD-MMM",
                }
                ]
            });

            // bar graph
            var barGraph = new CanvasJS.Chart("barGraphContainer",
            {
                animationEnabled: true,
                theme: "light2",
                title: {
                    text: stationResponse.station_information.name + " - Elevation: " + e.target.metadata.elevation
                },
                axisY: {
                    title: "Snow depth on " + stationResponse.data[stationResponse.data.length -1].Date.slice(5),
                    suffix: " inches",
                    minimum: 0
                },
                axisX: {
                    title: "Winter Season",
                },
                data: [{
                    type: "column",
                    dataPoints: [
                        {x: 1, y: parseInt(current2015), label: "2015-2016" },
                        {x: 2, y: parseInt(current2016), label: "2016-2017" },
                        {x: 3, y: parseInt(current2017), label: "2017-2018" },
                        {x: 4, y: parseInt(current2018), label: "2018-2019" },
                        {x: 5, y: parseInt(current2019), label: "2019-2020" },
                        {x: 6, y: parseInt(stationResponse.data[stationResponse.data.length - 1]["Snow Depth (in)"]), label: "2020-2021"}

                    ]
                }]
            });
            chart.render();
            barGraph.render();
        })
    }
})

