let weatherform = document.querySelector(".weatherform");
let countryselect = document.querySelector(".countryselect");
let cityselect = document.querySelector(".cityselect");
let card = document.querySelector(".card");
let apikey = "56a9c4cd78501dce0c689ea6cb41274d";

// Fetch country list (Using a faster API)
async function fetchCountries() {
    let apiurl = `https://restcountries.com/v3.1/all`;
    try {
        let response = await fetch(apiurl);
        let data = await response.json();

        countryselect.innerHTML = '<option value="">Select Country</option>';
        data.forEach(country => {
            let option = document.createElement("option");
            option.value = country.name.common;
            option.textContent = country.name.common;
            countryselect.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching countries:", error);
        displayerror("Failed to load countries.");
    }
}

// Fetch cities for selected country
async function fetchCities(country) {
    let apiurl = `https://countriesnow.space/api/v0.1/countries/cities`;
    
    // Show a loading placeholder
    cityselect.innerHTML = '<option>Loading cities...</option>';
    cityselect.disabled = true;

    try {
        let response = await fetch(apiurl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country })
        });

        let data = await response.json();
        if (!data.data || data.error) throw new Error("No cities found");

        cityselect.innerHTML = '<option value="">Select City</option>';
        data.data.forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            cityselect.appendChild(option);
        });

        cityselect.disabled = false;

    } catch (error) {
        console.error("Error fetching cities:", error);
        displayerror("Cities could not load.");
    }
}

// Handle country selection
countryselect.addEventListener("change", function() {
    let selectedCountry = this.value;
    if (selectedCountry) {
        fetchCities(selectedCountry);
    } else {
        cityselect.innerHTML = '<option value="">Select City</option>';
        cityselect.disabled = true;
    }
});

async function getWeatherdata(city) {
    let apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`;
    let response = await fetch(apiurl);
    if (!response.ok) throw new Error("Weather data unavailable");
    return await response.json();
}

weatherform.addEventListener("submit", async (event) => {
    event.preventDefault();
    let country = countryselect.value;
    let city = cityselect.value;

    if (country && city) {
        try {
            let weatherdata = await getWeatherdata(city);
            displayweatherinfo(weatherdata);
        } catch (error) {
            console.error("Weather API error:", error);
            displayerror("Weather data not available.");
        }
    } else {
        displayerror("Please select a country and a city.");
    }
});

function displayweatherinfo(data) {
    let {
        name: city,
        main: { temp, humidity, pressure },
        weather: [{ description, id }],
        wind: { speed }
    } = data;

    document.querySelector(".citydisplay").textContent = city;
    document.querySelector(".tempdisplay").textContent = `🌡️ Temperature: ${temp}°C`;
    document.querySelector(".humiditydisplay").textContent = `💧 Humidity: ${humidity}%`;
    document.querySelector(".descdisplay").textContent = `📖 Description: ${description}`;
    document.querySelector(".winddisplay").textContent = `💨 Wind Speed: ${speed} m/s`;
    document.querySelector(".pressuredisplay").textContent = `⚖️ Pressure: ${pressure} hPa`;
    document.querySelector(".weatheremoji").textContent = getweatheremoji(id);

    
    // Hide error message
    document.querySelector(".errordisplay").classList.add("hidden");
    card.classList.remove("hidden");
}

function getweatheremoji(weatherid) {
    switch (true) {
        case (weatherid >= 200 && weatherid < 300): return "⛈️";
        case (weatherid >= 300 && weatherid < 500): return "🌧️";
        case (weatherid >= 500 && weatherid < 600): return "🌦️";
        case (weatherid >= 600 && weatherid < 700): return "❄️";
        case (weatherid >= 700 && weatherid < 800): return "🌫️";
        case (weatherid === 800): return "☀️";
        case (weatherid >= 801 && weatherid < 810): return "☁️";
        default: return "❓";
    }
}

function displayerror(message) {
    document.querySelector(".errordisplay").textContent = message;
}

fetchCountries();
