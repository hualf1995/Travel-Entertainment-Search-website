var hereLat = 0;
var hereLon = 0;
var getCurrentLoc = false;
var otherLocationStatus = false;
var keywordStatus = false;

//get local location
$(document).ready(function () {
    $.get("http://ip-api.com/json",function (data,status) {
        if (status == "success") {
            hereLat = data.lat;
            hereLon = data.lon;
            getCurrentLoc = true;
        }
        console.log("currentLocation: " + hereLat + "," + hereLon + ", status: " + status);
    })
});

// check whether the submit button should be enabled
function checkSubmit() {
    if ($('#here').attr("checked") == "checked") {
        if(keywordStatus == true && getCurrentLoc == true) {
            $('#submit').attr("disabled",false);
        } else {
            $('#submit').attr("disabled",true);
        }
    } else {
        if(keywordStatus == true && getCurrentLoc == true && otherLocationStatus == true) {
            $('#submit').attr("disabled",false);
        } else {
            $('#submit').attr("disabled",true);
        }
    }
}

//click on here
$('#here').click(function() {
    $('#here').attr("checked",true);
    $('#other').attr("checked",false);
    $('#fromOther').attr("disabled","disabled");
    $('#fromOther').val("");
    $('#fromOther').removeClass('is-invalid');
    otherLocationStatus = false;
    checkSubmit();
});

//click on other
$('#other').click(function() {
    $('#here').attr("checked",false);
    $('#other').attr("checked",true);
    $('#fromOther').attr("disabled",false);
    $('#submit').attr("disabled","disabled");
    checkSubmit();
});

//validate keyword
$('#keyword').focusout(function () {
    if($('#keyword').val() == "" || $.trim($('#keyword').val()) == "") {
        $('#keyword').addClass('is-invalid');
    } else {
        $('#keyword').removeClass('is-invalid');
    }
});
$('#keyword').keyup(function () {
    if($('#keyword').val() == "" || $.trim($('#keyword').val()) == "") {
        $('#keyword').addClass('is-invalid');
        keywordStatus = false;
        $('#submit').attr("disabled",true);
    } else {
        $('#keyword').removeClass('is-invalid');
        keywordStatus = true;
        checkSubmit();
    }
});

//validate fromOther
$('#fromOther').focusout(function () {
    if($('#fromOther').val() == "" || $.trim($('#fromOther').val()) == "") {
        $('#fromOther').addClass('is-invalid');
    } else {
        $('#fromOther').removeClass('is-invalid');
    }
});
$('#fromOther').keyup(function () {
    if($('#fromOther').val() == "" || $.trim($('#fromOther').val()) == "") {
        $('#fromOther').addClass('is-invalid');
        otherLocationStatus = false;
        $('#submit').attr("disabled",true);
    } else {
        $('#fromOther').removeClass('is-invalid');
        otherLocationStatus = true;
        checkSubmit();
    }
});

//reset button
$('#reset').click(function () {
    otherLocationStatus = false;
    keywordStatus = false;
    $('#here').attr("checked",true);
    $('#other').attr("checked",false);
    $('#fromOther').attr("disabled","disabled");
    $('#fromOther').removeClass('is-invalid');
    $('#keyword').removeClass('is-invalid');
    if (document.getElementById("result")) {
        document.getElementById("result").style.display = "none";
    }
    if (document.getElementById("tabs")) {
        document.getElementById("tabs").style.display = "none";
    }
    if (document.getElementById("progress")) {
        document.getElementById("progress").style.display = "none";
    }
    if (document.getElementById("noSearchRecord")) {
        document.getElementById("noSearchRecord").style.display = "none";
    }
    if (document.getElementById("noFavRecord")) {
        document.getElementById("noFavRecord").style.display = "none";
    }
    $(".rowForResult").removeClass("alert alert-warning");
    document.getElementById("details").setAttribute("disabled","disabled");
    checkSubmit();
});

//autocomplete for fromOther
function autoComplete() {
    var input = document.getElementById("fromOther");
    autocomplete = new google.maps.places.Autocomplete(input);
    var mapInput = document.getElementById("mapLocation");
    autocomplete1 = new google.maps.places.Autocomplete(mapInput);
    // autocomplete.addListener('place_changed', assign);
}
//
// function assign() {
//     var address = autocomplete.getPlace().formatted_address;
//     $('#fromOther').val(address);
// }

//Angular

var app = angular.module('myApp', ['ngAnimate']);
app.controller('myCtrl', function($scope, $http,$sce) {
    $scope.keyword = "";
    $scope.category = "default";
    $scope.from = "here";
    $scope.fromOther = "";
    $scope.noFavRecord = false;
    $scope.noSearchRecord = false;
    var resultPage;
    var page;
    var pagetoken;
    //submit button
    $scope.submit = function () {
        $scope.progressbar = true;
        var dis;
        if ($scope.distance == undefined || $scope.distance == "") {
            dis = 10;
        } else {
            dis = $scope.distance;
        }
        dis *= 1609.344;
        var req = "http://hlfhw8.us-east-2.elasticbeanstalk.com/table?";
        if ($scope.from == 'here') {
            req += "keyword=" + $scope.keyword.replace(/ /g, "+");
            req += "&category=" + $scope.category.replace(/ /g, "+");
            req += "&from=" + $scope.from;
            req += "&lat=" + hereLat;
            req += "&lon=" + hereLon;
             req += "&distance=" + dis;
        } else {
            req += "keyword=" + $scope.keyword.replace(/ /g, "+");
            req += "&category=" + $scope.category.replace(/ /g, "+");
            req += "&from=" + $scope.from;
            req += "&location=" + $('#fromOther').val().replace(/ /g, "+");
            req += "&distance=" + dis;
        }
        console.log(req);
        $http.get(req).then(function (response) {
            $scope.progressbar = false;
            resultPage = [];
            page = 1;
            pagetoken = "";
            var data = response.data;
            if (data.results.length == 0) {
                $scope.table = false;
                $scope.noSearchRecord = true;
                document.getElementById("noSearchRecord").style.display = "block";
            } else {
                resultPage.push(data.results);
                $scope.noRecord = false;
                $scope.table = true;
                document.getElementById("result").style.display = "block";
                $scope.tabs = false;
                $scope.results = resultPage[page - 1];
                var tempResult = resultPage[page - 1];
                for (var i = 0; i < tempResult.length;i++) {
                    var temp = tempResult[i];
                    var id = "#favButton" + temp.place_id;
                    // console.log(localStorage.getItem(temp.place_id));
                    if (localStorage.getItem(temp.place_id) != undefined) {
                        $(id).removeClass("far");
                        $(id).addClass("fas");
                        $(id).css({"color":"#f8ce0b"});
                    }
                }
                $scope.previous = false;
                if (data.next_page_token) {
                    $scope.next = true;
                    pagetoken = data.next_page_token;
                } else {
                    $scope.next = false;
                    pagetoken = "";
                }
                // console.log(pagetoken);
            }
        });
    };
    //nextPage button
    $scope.nextPage = function() {
        $scope.progressbar = true;
        if (page == resultPage.length) {
            var req = "http://hlfhw8.us-east-2.elasticbeanstalk.com/nextPage?";
            req += "pagetoken=" + pagetoken;
            $http.get(req).then(function (response) {
                var data = response.data;
                if (data.status == "OK") {
                    $scope.table = true;
                    resultPage.push(data.results);
                    page++;
                    $scope.results = resultPage[page - 1];
                    $scope.previous = true;
                    if (data.next_page_token != undefined) {
                        pagetoken = data.next_page_token;
                        $scope.next = true;
                    } else {
                        pagetoken = "";
                        $scope.next = false;
                    }
                } else {
                    alert("Google API has errors. Please have a try on NEXT again!");
                    $scope.table = true;
                    $scope.results = resultPage[page - 1];
                    if (page == 1) {
                        $scope.previous = false;
                    } else {
                        $scope.previous = true;
                    }
                    $scope.next = true;
                }
            });
        } else  {
            page++;
            $scope.results = resultPage[page - 1];
            $scope.table = true;
            $scope.previous = true;
            if(page != resultPage.length || pagetoken != "") {
                $scope.next = true;
            } else {
                $scope.next = false;
            }
        }
        $scope.progressbar = false;
    };
    //previousPage button
    $scope.previousPage = function () {
        $scope.progressbar = true;
        $scope.next = true;
        $scope.table = true;
        page--;
        if (page == 1) {
            $scope.previous = false;
        } else {
            $scope.previous = true;
        }
        $scope.results = resultPage[page - 1];
        $scope.progressbar = false;
    };
    // var detailFavFlag = 0;
    //listFAV button
    $scope.listFavButton = function (x) {
        var id = "#favButton" + x.place_id;
        if ($(id).attr("data-prefix") == "far") {
            $(id).removeClass("far");
            $(id).addClass("fas");
            $(id).css({"color":"#f8ce0b"});
            localStorage.setItem(x.place_id, JSON.stringify(x));
        } else {
            $(id).removeClass("fas");
            $(id).addClass("far");
            $(id).css({"color":"black"});
            localStorage.removeItem(x.place_id);
        }
    };

    //delete fav button
    $scope.deleteFav = function (placeid) {
        localStorage.removeItem(placeid);
        var favList = [];
        for (var i = 0; i < localStorage.length; i++){
            favList.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
        }
        $scope.favList = favList;
        $scope.table = true;
        $scope.searchTable = false;
        $scope.favorite = true;

        var id = "#favButton" + placeid;
        $(id).removeClass("fas");
        $(id).addClass("far");
        $(id).css({"color":"black"});

        if (favList.length == 0) {
            $scope.table = false;
            $scope.searchTable = false;
            $scope.noFavRecord = true;
            $scope.favorite = false;
        }
    }
    //results button
    $scope.turnToResults = function () {
        switchBetweenTwoButtons($("#resultButton"),$("#favoriteButton"));
        $scope.table = true;
        $scope.searchTable = true;
        $scope.favorite = false;
        $scope.noFavRecord = false;
    };
    //favorite button
    $scope.turnTOFavorite = function () {
        switchBetweenTwoButtons($("#favoriteButton"),$("#resultButton"));
        $scope.noSearchRecord = false;
        var favList = [];
        for (var i = 0; i < localStorage.length; i++){
            favList.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
        }
        $scope.favList = favList;
        document.getElementById("result").style.display = "block";
        $scope.table = true;
        $scope.searchTable = false;
        $scope.favorite = true;
        $scope.tabs = false;
        if (favList.length == 0) {
            $scope.table = false;
            $scope.searchTable = false;
            $scope.noFavRecord = true;
            $scope.favorite = false;
        }
    };

    function switchBetweenTwoButtons (clickButton,unClickButton) {
        clickButton.removeClass();
        clickButton.addClass("btn btn-primary");
        clickButton.attr("style",  "color: white");

        unClickButton.removeClass();
        unClickButton.addClass("btn btn-outline-light");
        unClickButton.attr("style",  "color: rgb(44,125,246)");
    };


    //details> button   default is info tab
    $scope.details = function(x) {
        $scope.progressbar = true;
        $scope.table = false;
        $scope.tabs = true;
        document.getElementById("tabs").style.display = "block";

        //highlight one line
        var highlightID = "#" + x.place_id;
        $(".rowForResult").removeClass("alert alert-warning");
        $(highlightID).addClass("alert alert-warning");

        //tabs details
        $('#infoTab1').attr("aria-selected","true");
        $('#infoTab2').attr("aria-selected","false");
        $('#infoTab3').attr("aria-selected","false");
        $('#infoTab4').attr("aria-selected","false");
        $('#infoTab1').attr("class","nav-link active");
        $('#infoTab2').attr("class","nav-link");
        $('#infoTab3').attr("class","nav-link");
        $('#infoTab4').attr("class","nav-link");
        $('#icon').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");
        $scope.name = x.name;
        $scope.map = false;
        $scope.info = true;
        $scope.photos = false;
        $scope.reviews = false;
        $scope.noRecord = false;
        //map initial
        $scope.mode = "DRIVING";
        if ($scope.from == "here") {
            $scope.mapLocation = "Your location";
        } else {
            $scope.mapLocation = $('#fromOther').val();
        }
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: x.geometry.location.lat, lng: x.geometry.location.lng},
            zoom: 15,
        });

        var place_id = x.place_id;
        var service = new google.maps.places.PlacesService(map);
        var request = {
            placeId: place_id
        };
        service.getDetails(request, function (place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(place);
                // console.log(x);
                // console.log(x.geometry);

                //place marker on the map
                var marker = new google.maps.Marker({
                    map: map,
                    position: x.geometry.location
                });

                // twitter button
                $scope.addTwitter = function () {
                    var urlTW = "https://twitter.com/intent/tweet?text=";
                    urlTW += "Check out " + place.name + " at " + place.formatted_address + ".";
                    urlTW += " Website: " + place.website;
                    urlTW += "&hashtags=TravelAndEntertainmentSearch";
                    urlTW += "&url=" + place.website;
                    window.open(urlTW,"twitter","width=400px,height=300px");
                }

                //details of info table
                $scope.$apply(function () {
                    if (place.formatted_address) {
                        $scope.address = place.formatted_address;
                        $scope.row1 = true;
                    } else {
                        $scope.row1 = false;
                    }
                    if (place.international_phone_number) {
                        $scope.phone = place.international_phone_number;
                        $scope.row2 = true;
                    } else {
                        $scope.row2 = false;
                    }
                    if (place.price_level) {
                        var count = place.price_level;
                        var val = "";
                        while (count > 0) {
                            val += "$";
                            count--;
                        }
                        $scope.price = val;
                        $scope.row3 = true;
                    } else {
                        $scope.row3 = false;
                    }
                    if (place.rating) {
                        $scope.rate = place.rating;
                        var rateStarText = "";
                        rateStarText += (place.rating)*20;
                        rateStarText += "%";
                        $scope.rateStar = rateStarText;
                        $scope.row4 = true;
                    } else {
                        $scope.row4 = false;
                    }
                    if (place.url) {
                        $scope.google = place.url;
                        $scope.row5 = true;
                    } else {
                        $scope.row5 = false;
                    }
                    if (place.website) {
                        $scope.website = place.website;
                        $scope.row6 = true;
                    } else {
                        $scope.row6 = false;
                    }
                    //open hours for row7
                    if (place.opening_hours) {
                        var hours = place.opening_hours;
                        var date = new Date();
                        var today = date.getDay();
                        if (today == 0) {
                            today = 7;
                        }
                        if (hours.open_now == true) {
                            $scope.hour = "Open now: ";
                            var todayIndex = hours.weekday_text[today-1].indexOf(":");
                            $scope.hour += hours.weekday_text[today-1].substring(todayIndex+1)
                        } else {
                            $scope.hour = "Closed "
                        }
                        $scope.row7 = true;
                        var todayIndex = hours.weekday_text[today-1].indexOf(":");
                        var todayTime = {day:hours.weekday_text[today-1].substring(0, todayIndex), time:hours.weekday_text[today-1].substring(todayIndex+1)};
                        $scope.today = todayTime;
                        var timeTable = [];
                        for (var i = today,count = 0; count < 6; i++,count++) {
                            if (i > 6) {
                                i = i - 7;
                            }
                            var index = hours.weekday_text[i].indexOf(":");
                            var timeobj = {day:hours.weekday_text[i].substring(0, index), time:hours.weekday_text[i].substring(index+1)};
                            timeTable.push(timeobj);
                        }
                        $scope.timeTable = timeTable;
                    } else {
                        $scope.row7 = false;
                    }
                });

                //photos tab details
                if (place.photos) {
                    $scope.noPhotoRecord = false;
                    var photos = place.photos;
                    var url = [];
                    for (var i = 0; i < photos.length; i++) {
                        var photo = photos[i];
                        url.push(photo.getUrl({'maxWidth': photo.width, 'maxHeight': photo.height}));
                    }
                    $scope.url = url;
                } else {
                    $scope.url = [];
                    console.log("no photos");
                    $scope.noPhotoRecord = true;
                }

                //map tab details
                $scope.streetView = function () {
                    $('#map').html("");
                    $('#direct').html("");
                    var map = new google.maps.Map(document.getElementById('map'), {
                        center: {lat: x.geometry.location.lat, lng: x.geometry.location.lng},
                        zoom: 15,
                    });
                    var panorama = map.getStreetView();
                    panorama.setPosition({lat: x.geometry.location.lat, lng: x.geometry.location.lng});
                    panorama.setPov(/** @type {google.maps.StreetViewPov} */({
                        heading: 265,
                        pitch: 0
                    }));

                    var toggle = panorama.getVisible();
                    if ($('#icon').attr("src") == "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png") {
                        $('#icon').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Map.png");
                        panorama.setVisible(true);
                    } else {
                        $('#icon').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");
                        panorama.setVisible(false);
                    }
                }
                $scope.des = place.name + ", " + place.formatted_address;
                var des = $scope.des;
                $scope.showDirection = function () {
                    $('#map').html("");
                    $('#direct').html("");
                    $('#icon').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");
                    var start = $('#mapLocation').val();
                    if (start == "Your location" || start == "My location") {
                        start = {lat:hereLat , lng:hereLon};
                    }
                    var mode = $('#mode').val();
                    console.log(start + "++++" + des + "++++" + mode);
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 15,
                        center: {lat:hereLat , lng:hereLon}
                    });
                    var directionsService = new google.maps.DirectionsService;
                    var directionsDisplay = new google.maps.DirectionsRenderer;
                    directionsDisplay.setMap(map);
                    directionsDisplay.setPanel(document.getElementById('direct'));
                    directionsService.route({
                        origin: start,
                        destination: des,
                        travelMode: mode,
                        provideRouteAlternatives: true
                    }, function(response, status) {
                        if (status === 'OK') {
                            console.log(response);
                            directionsDisplay.setDirections(response);
                        } else {
                            window.alert('Directions request failed due to ' + status);
                        }
                    });
                }
                //reviews tab details
                //default review
                $('#reviewChoice').html("Google Reviews");
                $scope.googleReview = true;
                $scope.yelpReview = false;
                $scope.noReviewRecord = false;
                $('#orderChoice').html("Default Order");

                var googleRev = place.reviews;
                console.log(googleRev);
                if (googleRev != undefined && googleRev.length > 0) {
                    $scope.googleReview = true;
                    $scope.noReviewRecord = false;
                    $scope.reviewsList = googleRev;
                    $scope.order1 = true;
                    $scope.order2 = false;
                    $scope.order3 = false;
                    $scope.order4 = false;
                    $scope.order5 = false;
                } else {
                    $scope.googleReview = false;
                    $scope.noReviewRecord = true;
                }

                //change button
                $scope.googleReviewButton = function () {
                    $('#reviewChoice').html("Google Reviews");
                    $scope.yelpReview = false;
                    if (googleRev != undefined && googleRev.length > 0) {
                        $scope.googleReview = true;
                        $scope.noReviewRecord = false;
                        $scope.reviewsList = googleRev;
                    } else {
                        $scope.googleReview = false;
                        $scope.noReviewRecord = true;
                    }
                }

                $scope.yelpReviewButton = function () {
                    $('#reviewChoice').html("Yelp Reviews");
                    $scope.googleReview = false;
                    $scope.progressbar = true;

                    var addressPart = place.address_components;
                    var flag = 0;
                    var zipcode = "";
                    var req = "http://hlfhw8.us-east-2.elasticbeanstalk.com/yelpMatch?"
                    req += "name=" + place.name;
                    for (var i = 0; i < addressPart.length; i++) {
                        if(addressPart[i].types[0] == "street_number") {
                            req += "&address1=" + addressPart[i].long_name;
                            flag = 1;
                        }
                        if(flag == 1 && addressPart[i].types[0] == "route") {
                            req += "," + addressPart[i].long_name;
                        }
                        if(flag == 0 && addressPart[i].types[0] == "route") {
                            req += "&address1=" + addressPart[i].long_name;
                            flag = 1;
                        }
                        if(flag == 1 && addressPart[i].types[0] == "locality") {
                            req += "," + addressPart[i].long_name;
                        }
                        if(flag == 0 && addressPart[i].types[0] == "locality") {
                            req += "&address1=" + addressPart[i].long_name;
                            flag = 1;
                        }
                        if (addressPart[i].types[0] == "administrative_area_level_2") {
                            req += "&city=" + addressPart[i].long_name;
                        }
                        if (addressPart[i].types[0] == "administrative_area_level_1") {
                            req += "&state=" + addressPart[i].short_name;
                        }
                        if (addressPart[i].types[0] == "country") {
                            req += "&country=" + addressPart[i].short_name;
                        }
                        if (addressPart[i].types[0] == "postal_code") {
                            req += "&zipcode=" + addressPart[i].short_name;
                            zipcode = addressPart[i].short_name;
                        }
                    }
                    req = req.replace(/ /g,"+");
                    console.log(req);
                    $http.get(req).then(function(response) {
                        var data = response.data;
                        // console.log(data);
                        $scope.progressbar = false;
                        if (data.businesses.length != 0) {
                            $scope.noReviewRecord = false;
                            if (data.businesses[0].location.zip_code == zipcode) {
                                var id = data.businesses[0].id;
                                // console.log(id);
                                var reviewReq = "http://hlfhw8.us-east-2.elasticbeanstalk.com/yelpReview?id=" + id;
                                console.log(reviewReq);
                                $http.get(reviewReq).then(function(response) {
                                    $scope.yelpReview = true;
                                    console.log(response.data);
                                    var yelpReview = response.data.jsonBody.reviews;
                                    console.log(yelpReview);
                                    if (yelpReview.length != 0) {
                                        $scope.yelpReview = yelpReview;
                                        $scope.order1 = true;
                                        $scope.order2 = false;
                                        $scope.order3 = false;
                                        $scope.order4 = false;
                                        $scope.order5 = false;
                                    } else {
                                        $scope.yelpReview = false;
                                        $scope.noReviewRecord = true;
                                    }
                                });
                            } else {
                                $scope.yelpReview = false;
                                $scope.noReviewRecord = true;
                            }
                        } else {
                            $scope.yelpReview = false;
                            $scope.noReviewRecord = true;
                        }
                    });
                }
                $scope.defaultOrderButton = function () {
                    $('#orderChoice').html("Default Order");
                    $scope.order1 = true;
                    $scope.order2 = false;
                    $scope.order3 = false;
                    $scope.order4 = false;
                    $scope.order5 = false;
                }
                $scope.highestRatingButton = function () {
                    $('#orderChoice').html("Highest Rating");
                    $scope.order1 = false;
                    $scope.order2 = true;
                    $scope.order3 = false;
                    $scope.order4 = false;
                    $scope.order5 = false;
                }
                $scope.lowestRatingButton = function () {
                    $('#orderChoice').html("Lowest Rating");
                    $scope.order1 = false;
                    $scope.order2 = false;
                    $scope.order3 = true;
                    $scope.order4 = false;
                    $scope.order5 = false;
                }
                $scope.mostRecentButton = function () {
                    $('#orderChoice').html("Most Recent");
                    $scope.order1 = false;
                    $scope.order2 = false;
                    $scope.order3 = false;
                    $scope.order4 = true;
                    $scope.order5 = false;
                }
                $scope.leastRecentButton = function () {
                    $('#orderChoice').html("Least Recent");
                    $scope.order1 = false;
                    $scope.order2 = false;
                    $scope.order3 = false;
                    $scope.order4 = false;
                    $scope.order5 = true;
                }
            }
        });
        $scope.progressbar = false;
        document.getElementById("details").removeAttribute("disabled");
        document.getElementById("details1").removeAttribute("disabled");
    }

    //click on info tab
    $scope.showInfo = function () {
        $scope.info = true;
        $scope.photos = false;
        $scope.map = false;
        $scope.reviews = false;
    }
    //click on photos tab
    $scope.showPhotos = function () {
        $scope.info = false;
        $scope.photos = true;
        $scope.map = false;
        $scope.reviews = false;

    }
    //click on map tab
    $scope.showMap = function () {
        $scope.info = false;
        $scope.photos = false;
        $scope.map = true;
        $scope.reviews = false;

    }
    //click on reviews tab
    $scope.showReviews = function () {
        $scope.info = false;
        $scope.photos = false;
        $scope.map = false;
        $scope.reviews = true;
    }

    //click on list button
    $scope.list = function () {
        $scope.table = true;
        $scope.tabs = false;
    }

    //click on the details button
    $scope.goDetail = function () {
        $scope.table = false;
        $scope.tabs = true;
    }


    //Plot the star in the google review
    $scope.plotOuterStar = function (outerStar) {
        var text = "";
        for(var i=0 ;i < outerStar; i++){
            text += "<i class=\"far fa-star\" style=\"color:rgba(255,255,255,0); \"></i>";
        }
        text += "<div class=\"stars-inner2\" style=\"width:100%\" >";
        for(var i=0 ;i < outerStar; i++){
            text += "<i class=\"fas fa-star\" style=\"color: rgb(221,116,45);\"></i>";
        }
        text +="</div>";

        return $sce.trustAsHtml(text);

    };





});


