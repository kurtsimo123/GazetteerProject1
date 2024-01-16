var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'TomTom, 2012'
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; the GIS User Community'
});

var basemaps = {
    "Streets": streets,
    "Satellite": satellite
};

var map = L.map('map', {
    layers: [streets]
}).setView([54.5, -4], 6);

var airports = L.markerClusterGroup({
    polygonOptions: {
        fillColor: 'black',
        color: 'black',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
}).addTo(map);


var overlays = {
    "Airports": airports
};

var layerControl = L.control.layers(basemaps, overlays).addTo(map);

var airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-plane',
    iconColor: 'black',
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
});

// pin
var myIcon = L.icon({
    iconUrl: 'libs/img/pin.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -35]
});

// markers
var born = L.marker([53.744599, -0.332243], {
    icon: myIcon
}).addTo(map);
var popup = born.bindPopup('I was born here!').closePopup();
popup.addTo(map);

var huelva = L.marker([37.261421, -6.944722], {
    icon: myIcon
}).addTo(map);
var popup = huelva.bindPopup('I have lived here!').closePopup();
popup.addTo(map);

var vienna = L.marker([48.2082, 16.3738], {
    icon: myIcon
}).addTo(map);
var popup = vienna.bindPopup('I have also lived here!').closePopup();
popup.addTo(map);

//buttons//
var infoButton = L.easyButton({
    states: [{
        stateName: 'info-button',
        icon: '<i class="fa fa-info-circle"></i>',
        title: 'Info Button',
        onClick: function() {
            $('#countryModal').modal("show");
        }
    }]
});
infoButton.addTo(map);

var wikiButton = L.easyButton({
    states: [{
        stateName: 'wiki-button',
        icon: '<i class="fa-brands fa-wikipedia-w"></i>',
        title: 'Wiki Button',
        onClick: function() {
            $('#wikiModal').modal("show");
        }
    }]
});
wikiButton.addTo(map);


var weatherButton = L.easyButton({
    states: [{
        stateName: 'weather-button',
        icon: '<i class="fa fa-cloud-sun"></i>',
        title: 'Weather Button',
        onClick: function() {
            $('#weatherModal').modal("show");
        }
    }],
});
weatherButton.addTo(map);


var currencyButton = L.easyButton({
    states: [{
        stateName: 'currency-button',
        icon: '<i class="fa fa-coins"></i>',
        title: 'Currency Button',
        onClick: function() {
            $('#currencyModal').modal("show");
        }
    }]
});
currencyButton.addTo(map);

var newsButton = L.easyButton({
    states: [{
        stateName: 'news-button',
        icon: '<i class="fa fa-newspaper"></i>',
        title: 'News Button',
        onClick: function() {
            $('#newsModal').modal("show");
        }

    }]
});

newsButton.addTo(map);

var holidayButton = L.easyButton({
    states: [{
        stateName: 'holiday-button',
        icon: '<i class="fa-regular fa-calendar-days"></i>',
        title: 'Holidays Button',
        onClick: function() {
            $('#holidaysModal').modal("show");
        }
    }]
});
holidayButton.addTo(map);

//get current location
if ('geolocation' in navigator) {
    // Get the user's current location
    navigator.geolocation.getCurrentPosition(function(position) {
        // Add a marker to the map at the user's current location
        L.circle([position.coords.latitude, position.coords.longitude]).addTo(map);
    }, function(error) {
        // Handle any errors that occur while getting the user's location
        console.error('Error getting location:', error);
    });
}

//country names api
$.ajax({
    url: "libs/php/getCountryNames.php",
    type: 'POST',
    dataType: 'json',
    success: function(result) {
        $.each(result, function(key, value) {
            $('#selCountry').append("<option value='" + value['iso_a2'] + "'>" + value['name'] + "</option>");
        });
    },
    error: function(err) {
        console.log('Error getting country names: ', err, );
    }
});

//current border api

function success(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    $.ajax({
        url: "libs/php/getCurrentBorder.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng
        },
        success: function(result) {
            var countryCode = result['data'];
            $('#selCountry').val(countryCode).change();
        },
        error: function(err) {
            console.log(err);
        }
    });
}
navigator.geolocation.getCurrentPosition(success, error);
function error(err) {
    console.log(err);
}

//global variable
var geometry;
var markers;
var capitalMarkers;
var flagCountry = document.getElementById('txtCountry').textContent

//border api
$('#selCountry').change(function() {
    $.ajax({
        url: "libs/php/getCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        data: {
            iso_a2: $('#selCountry').val()
        },
        success: function(result) {
            if (geometry) {
                geometry.clearLayers();
            }
            geometry = L.geoJSON(result, {
                style: function(feature) {
                    return {
                        color: "black",
                        weight: 2,
                        fillOpacity: 0.1
                    }
                }
            }).addTo(map);
            // Fit the map to the bounds of the GeoJSON layer
            map.fitBounds(geometry.getBounds());
        },
        error: function(err) {
            console.log("Error getting GeoJSON data:", err);
        }

    });
});

//country info api
$('#selCountry').on('change', function() {
    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#selCountry').val()
        },
        success: function(result) {
            if (result.status.name == "ok") {
                var population = result['data'][0]['population'];
                var population_format = new Intl.NumberFormat().format(population);

                $('#txtCountry').html(result['data'][0]['countryName']);
                $('#txtContinent').html(result['data'][0]['continentName']);
                $('#txtCapital').html(result['data'][0]['capital']);
                $('#txtPopulation').html(population_format);
                $('#txtCurrency').html(result['data'][0]['currencyCode']);
            }

            /////////////////////////////////////////////////////holidays/////////////////////////////////////////////
            $.ajax({
                url: 'libs/php/getHolidays.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    countryCode: $('#selCountry').val()
                },
                success: function(response) {
                    $('#txtHolidaysName').empty();
                    $('#txtHolidaysDate').empty();
                    response.forEach(function(holidays) {
                        var date = new Date(holidays.date);

                        // Format the date as dd/mm/yyyy
                        var formattedDate = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
                        $('#txtHolidaysName').append(holidays.name + ': ' + '<br>');
                        $('#txtHolidaysDate').append(formattedDate + '<br>');
                    });
                },
                error: function(error) {
                    $('#txtHolidaysName').html("Holiday data not available");
                    console.log(error);
                }
            });

            //-----------------------------------------------------FLAGS-------------------------------------------------------------------//
            var flagCountry = $('#selCountry').val()
            $.ajax({
                url: "libs/php/getFlags.php",
                method: 'POST',
                dataType: 'json',
                data: {
                    countryCode: flagCountry
                },
                success: function(data) {
                    var flagUrl = data[0].flags.svg;
                    $('#txtFlag').html("Flag:");
                    $('#flag-result').html(`<img src="${flagUrl}" class="flag-img img-fluid" width="100" height="80"></div>`);
                },
                error: function(xhr, status, error) {
                    console.log(xhr);
                    console.error(error);
                }
            });

            //---------------------------------------------------------WIKI----------------------------------------------------------------------//                  
            var capitalMarker = L.ExtraMarkers.icon({
                icon: 'fa-solid fa-landmark-flag',
                markerColor: 'gold',
                shape: 'penta',
            });
            $.ajax({
                url: "libs/php/getWiki.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    q: document.getElementById('txtCapital').textContent
                },
                success: function(result) {
                    if (capitalMarkers) {
                        map.removeLayer(capitalMarkers);
                    }

                    if (result.status.name == "ok") {
                        const link = result['data'][0]['wikipediaUrl'];
                        var lat = result['data'][0]['lat'];
                        var lng = result['data'][0]['lng'];
                        const summary = result['data'][0]['summary'];
                        const popupExtraMarker =
                            "<h1>" + $('#txtCapital').text() + "</h1><p class='summaryPopup'>" + summary + "</p><button id='btnPopup'><a id='linkWiki' target ='_blank' href='https://" + link + "'>More Information</a></button>"

                        capitalMarkers = L.marker([lat, lng], {
                            icon: capitalMarker
                        }).bindPopup(popupExtraMarker).addTo(map);
                    }
                },
                error: function(err) {
                    console.log("Error getting wiki data:", err);
                }
            });
            $.ajax({
                url: "libs/php/getWikipedia.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    q: encodeURI($('#selCountry option:selected').text())
                },
                success: function(result) {
                    if (result.status.name == "ok") {
                        const link = result['data'][0]['wikipediaUrl'];
                        const summary = result['data'][0]['summary'];
                        $('#txtWikiCountrySummary').html(summary);
                        $('#txtWikiCountryLink').html("<button id='btnLink'><a id='linkCountryWiki' target ='_blank' href='https://" + link + "'>More Information</a></button>");
                    }
                },
                error: function(err) {
                    console.log("Error getting wikipedia country data:", err);
                }
            });

            //-------------------------------------------------------------NEWS--------------------------------------------------------------//
            $.ajax({
                url: "libs/php/getNews.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    countryCode: $('#selCountry').val()
                },

                success: function(result) {
                    var title1 = result['data'][0]['title'];
                    var title2 = result['data'][1]['title'];
                    var title3 = result['data'][2]['title'];
                    var title4 = result['data'][3]['title'];
                    var title5 = result['data'][4]['title'];

                    var link1 = result['data'][0]['url'];
                    var link2 = result['data'][1]['url'];
                    var link3 = result['data'][2]['url'];
                    var link4 = result['data'][3]['url'];
                    var link5 = result['data'][4]['url'];

                    if (result.status.name == "ok") {
                        $('#txtNews1').html(title1);
                        $('#txtLink1').html("<button id='btnNews'><a class='link1' target='_blank' href='" + link1 + "'>Read More<i class='fa-solid fa-up-right-from-square'></i></a></button>");
                        $('#txtNews2').html(title2);
                        $('#txtLink2').html("<button id='btnNews'><a class='link2' target='_blank' href='" + link2 + "'>Read More<i class='fa-solid fa-up-right-from-square'></i></a></button>");
                        $('#txtNews3').html(title3);
                        $('#txtLink3').html("<button id='btnNews'><a class='link3' target='_blank' href='" + link3 + "'>Read More<i class='fa-solid fa-up-right-from-square'></i></a></button>");
                        $('#txtNews4').html(title4);
                        $('#txtLink4').html("<button id='btnNews'><a class='link4' target='_blank' href='" + link4 + "'>Read More<i class='fa-solid fa-up-right-from-square'></i></a></button>");
                        $('#txtNews5').html(title5);
                        $('#txtLink5').html("<button id='btnNews'><a class='link5' target='_blank' href='" + link5 + "'>Read More<i class='fa-solid fa-up-right-from-square'></i></a></button>");
                    }
                },
                error: function(err) {
                    console.log("Error getting News data:", err);
                }
            });

            //----------------------------------------------------------WEATHER-----------------------------------------------------------------//
            $.ajax({
                url: "libs/php/getWeather.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    city: document.getElementById('txtCapital').textContent
                },
                success: function(result) {
                    var tempF = result['data'][0]['temp'];
                    var tempFF = Math.ceil(tempF);
                    var tempC = Math.ceil((tempFF - 32) * (5 / 9));
                    var description = result['data'][0]['description'];
                    var icon = result['data'][0]['icon'];

                    if (icon === 'clear-day') {
                        $('#weatherIcon').html('<img src="libs/img/clear-day.png">');
                    } else if (icon === 'clear-night') {
                        $('#weatherIcon').html('<img src="libs/img/clear-night.png">');
                    } else if (icon === 'partly-cloudy-day') {
                        $('#weatherIcon').html('<img src="libs/img/partly-cloudy-day.png">');
                    } else if (icon === 'partly-cloudy-night') {
                        $('#weatherIcon').html('<img src="libs/img/partly-cloudy-night.png">');
                    } else if (icon === 'cloudy') {
                        $('#weatherIcon').html('<img src="libs/img/cloudy.png">');
                    } else if (icon === 'wind') {
                        $('#weatherIcon').html('<img src="libs/img/wind.png">');
                    } else if (icon === 'fog') {
                        $('#weatherIcon').html('<img src="libs/img/fog.png">');
                    } else if (icon === 'showers-day') {
                        $('#weatherIcon').html('<img src="libs/img/showers-day.png">');
                    } else if (icon === 'showers-night') {
                        $('#weatherIcon').html('<img src="libs/img/showers-night.png">');
                    } else if (icon === 'rain') {
                        $('#weatherIcon').html('<img src="libs/img/rain.png">');
                    } else if (icon === 'thunder-showers-day') {
                        $('#weatherIcon').html('<img src="libs/img/thunder-showers-day.png">');
                    } else if (icon === 'thunder-showers-night') {
                        $('#weatherIcon').html('<img src="libs/img/thunder-showers-night.png">');
                    } else if (icon === 'thunder-rain') {
                        $('#weatherIcon').html('<img src="libs/img/thunder-rain.png">');
                    } else if (icon === 'snow') {
                        $('#weatherIcon').html('<img src="libs/img/snow.png">');
                    } else if (icon === 'snow-showers-day') {
                        $('#weatherIcon').html('<img src="libs/img/snow-showers-day.png">');
                    } else if (icon === 'snow-showers-night') {
                        $('#weatherIcon').html('<img src="libs/img/snow-showers-night.png">');
                    }                 

                    if (result.status.name == "ok") {
                        $('#txtCurrentWeather').html(tempC + "&#176;C");
                        $('#txtWeatherDescription').html(description);
                    }
                },
                error: function(err) {
                    console.log("Error getting Weather data:", err);
                }
            });
            //------------------------------------------------------------------currency---------------------------------------------------//
            $.ajax({
                url: "libs/php/getCurrency.php",
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    var currencyCode = document.getElementById('txtCurrency').textContent;
                    $('#txtCurrencyRate').html("1 US Dollar is " + data.rates[currencyCode].toFixed(2) + " " + currencyCode);
                    var currentRate = data.rates[currencyCode];

                    function convert() {
                        var convertAmount = document.getElementById("convertAmount").value;
                        let currencyTotal = currentRate * convertAmount;                        

                        $('#convertResult').html(convertAmount + " USD is " + (currencyTotal.toFixed(2)) + " " + currencyCode);
                    }

                    $('#convertCurrency').click(function() {
                        convert();
                    });
                },
                error: function(err) {
                    console.log("Error getting currency data:", err);
                }
            });

            //-------------------------------------------------------------AIRPORT----------------------------------------------    ----//
            var airportIcon = L.ExtraMarkers.icon({
                icon: 'fa-plane',
                iconColor: 'black',
                markerColor: 'white',
                shape: 'square',
                prefix: 'fa'
            });

            var airportLand = $('#selCountry').val();

            $.ajax({
                method: 'GET',
                url: 'libs/php/getAirports.php',
                contentType: 'application/json',
                data: {
                    countryCode: airportLand
                },
                success: function(result) {
                    if (!markers) {
                        markers = airports;
                        map.addLayer(markers);
                    } else {
                        markers.clearLayers();
                    }

                    for (var i = 0; i < 28; i++) {
                        var lat = result['data'][i]['lat'];
                        var lng = result['data'][i]['lng'];
                        var name = result['data'][i]['name'];
                        var iataCode = result['data'][i]['iata_code'];
                        var countryC = result['data'][i]['country_code'];
                        var marker = L.marker([lat, lng], {
                            icon: airportIcon
                        });
                        marker.bindPopup(name + '<br>' + iataCode + '<br>' + countryC);
                        markers.addLayer(marker);
                    }
                },
                error: function ajaxError(jqXHR) {
                    console.error('Error: ', jqXHR.responseText);
                }
            });

            //---------------------------------------------------------WEATHER FORECAST--------------------------------------------------//
            $.ajax({
                url: "libs/php/getWeatherForecast.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    city: document.getElementById('txtCapital').textContent
                },
                success: function(result) {
                    if (result.status.name == "ok") {
                        var forecast1 = Date.parse(result['data'][1]['datetime']).toString("ddd dS");
                        var forecast2 = Date.parse(result['data'][2]['datetime']).toString("ddd dS");
                        var forecast3 = Date.parse(result['data'][3]['datetime']).toString("ddd dS");
                        var forecast4 = Date.parse(result['data'][4]['datetime']).toString("ddd dS");
                        var forecast5 = Date.parse(result['data'][5]['datetime']).toString("ddd dS");

                        $('#forecast1').html(forecast1);
                        $('#forecast2').html(forecast2);
                        $('#forecast3').html(forecast3);
                        $('#forecast4').html(forecast4);
                        $('#forecast5').html(forecast5);

                        $('#txtDay1').html(result['data'][1]['temp'] + "&#176;C");
                        $('#txtDay2').html(result['data'][2]['temp'] + "&#176;C");
                        $('#txtDay3').html(result['data'][3]['temp'] + "&#176;C");
                        $('#txtDay4').html(result['data'][4]['temp'] + "&#176;C");
                        $('#txtDay5').html(result['data'][5]['temp'] + "&#176;C");

                    }
                },
                error: function(err) {
                    console.log("Error getting forecast data:", err);
                }
            });
        },
        error: function(err) {
            console.log("Error getting countryInfo data:", err);
        }
    });
});