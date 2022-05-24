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
      //add coords here
      L.marker(coords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    },
    function () {
      alert('Could not get your location');
    }
  );
}
