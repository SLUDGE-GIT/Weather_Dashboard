//this is the access key for the weather api

let weatherAPIKey = "e50f5eef17de58fe896d72b5911316a6";


// this will be the  array that will hold the locations
let locations = [];

function fetchWeatherData(lat, lon, city) {

    var searchUrl1 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + weatherAPIKey;


    $.ajax({

        url: searchUrl1,
        method: "GET"

    })

        .then(function (response) {


            displayWeatherData(response, city);

        });           
 }



function loadWeatherZip(zipCode, isClicked) {

    let searchUrl2 = "https://api.openweathermap.org/data/2.5/forecast?zip=" + zipCode + ",us&appid=" + weatherAPIKey;

    $.ajax({
        url: searchUrl2,
        method: "GET"
    })

        .then(function (response) { 

  

            if (!isClicked)
            {
                saveLocations(response); 
                renderLocations();
            }



            fetchWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function (response){
            alert("Not a vaild Zip Code")
        });
}

function loadWeatherCity(city, isClicked) {
    
    let searchUrl3 = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + weatherAPIKey;



    $.ajax({
        url: searchUrl3,
        method: "GET"
    })
     
        .then(function (response) {


            if (!isClicked)
            {
                saveLocations(response); 
                renderLocations();
            }

            
            fetchWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function(response){
            alert("Please enter a valid City in the U.S. .");
        });
}

function displayWeatherData(weatherData, city){
 
    let iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png"; 
    $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");

    let temp = parseInt(weatherData.current.temp);
    temp = Math.round(((temp-273.15)*1.8) + 32);
    $("#currentTemp").html(" " + temp +  "  &degF");
    $("#currentHumidity").html(weatherData.current.humidity + "%");
    $("#currentWindSpeed").html(weatherData.current.wind_speed + " MPH");



    // UV color changer ------   not working atm I guess or every city I search so far has a uv index of 0 - not a big deal come back to later
    // okay after looking into it - it seems the uv index thing for this weather api is getting phased out as of april 2021 idk if this isnt why its not working
    // ive searched through the one-call-api at https://openweathermap.org/api/one-call-api and it really feels like I did this right.. 
    // lol okay I'm an idiot -- I really think it is as simple as I started this project at 11pm... no sun out = 0 uv index. commiting and going to bed at 6am... and when i wake up will see if it changes

    let uvIndex = weatherData.current.uvi;

    let bgColor = "";  
    let textColor = ""; 

    if (uvIndex < 3) 
    {
        bgColor = "bg-success";
        textColor = "text-white";  
    }
    else if (uvIndex > 2 && uvIndex < 6) 
    {
        bgColor = "bg-warning";
        textColor = "text-white";             
    }
    else 
    {
        bgColor = "bg-danger";
        textColor = "text-white";            
    }

    $("#currentUVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor); 




    // FIVE DAY FORCAST --------------- figure out how to space them like the demo pic (prolly some margin thing)

    let forecastList = $("#forecast");
    forecastList.empty();

    for (let i=1; i < 6; i++)  
    {
  
        let div = $("<div>").addClass("bg-primary");

        let dateTime = parseInt(weatherData.daily[i].dt); 
        let dateHeading = $("<h6>").text(new Date(dateTime * 1000).toLocaleDateString()); 
        let iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  
        let icon = $("<img>").attr("src", iconDayURL);

        temp = parseInt(weatherData.daily[i].temp.day);  
        temp = Math.round(((temp-273.15)*1.8) + 32); 

        let forecastTemp = $("<p>").html("Temp: " + temp +  "  &degF");

        let forecastHumidity = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");

        div.append(dateHeading);
        div.append(icon);
        div.append(forecastTemp);
        div.append(forecastHumidity);
        forecastList.append(div);

    }

    $("#weatherData").show();
}


function loadLocations()
{
    let locationsArray = localStorage.getItem("locations");
    if (locationsArray) 
    {
      locations = JSON.parse(locationsArray);  
      renderLocations();
    }
    else {
      localStorage.setItem("locations", JSON.stringify(locations)); 
    }
}

function renderLocations()
{
    let divLocations = $("#locationHistory");
    divLocations.empty(); 

    $.each(locations, function(index, item){
        let a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", locations[index]).text(locations[index]);
        divLocations.append(a);
    });

    $("#locationHistory > a").off();

    $("#locationHistory > a").click(function (event)
    {   
        let element = event.target;
        let city = $(element).attr("data-city");

        loadWeatherCity(city, true);
    });

}


function saveLocations(data)
{

    let city = data.city.name; 

    locations.unshift(city);
    localStorage.setItem("locations", JSON.stringify(locations)); 

}

$(document).ready(function () {

    $("#weatherData").hide();  
    loadLocations();  

    $("#searchBtn").click(function (event) { 
 
        let searchCriteria = $("#citySearchForm").val(); 
        
        if (searchCriteria !== "")  
        {
            let zip = parseInt(searchCriteria); 

            if (!isNaN(zip))
            {
                loadWeatherZip(zip, false);
            }
            else
            {
                loadWeatherCity(searchCriteria, false); 
            }
        }
    });
});

function clearForm(){

localStorage.clear();
window.location.reload();

};







// to do still
//search button also takes in enter key ?? 
//uv index - done but I cant check if i actually did it right until the sun is up I think pretty sure its correct though






// ------------------------------------------------------------------------------------------
//figure out AJAX            ----------- okay that was alot easier than when it was explained 
//search button event listener on click -- highlighter when hovered -- done
//save local storage recent searches -- done
// clear search button? ----- EEEEEEEEEEASiest thing i did all night
//search by zip and or city name -- handle exceptions etc
