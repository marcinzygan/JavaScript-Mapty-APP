'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// SETTING GEOLOCATION request and check if that is supported by older web browsers with if statement
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //destructure the position.coords.latitude and save is as a varible .
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}`);

      //USE LEAFLET    external library to show map based on our geo location
      // need id map in our HTML("map")
      //Create array of coordinates
      const coords = [latitude, longitude];
      const map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //Add event listener to map
      map.on('click', function (mapEvent) {
        console.log(mapEvent);
        //destructure coordinates from click event
        const { lat, lng } = mapEvent.latlng;

        //add coords here
        // set options to popup L.popup (object of options from documentation)
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('Workout')
          .openPopup();
      });
    },
    function () {
      alert('Could not get your location');
    }
  );
}
// DISPLAY MAP MARKER
