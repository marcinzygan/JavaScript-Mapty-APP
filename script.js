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

// CLASS APP
class App {
  #map;
  #mapEvent;
  constructor() {
    //call the get position function as soon the object is created
    this._getPosition();
    //FORM EVENT LISTNER to display marker , bind this keyword to App object
    form.addEventListener('submit', this._newWorkout.bind(this));
    //Event for form input select options
    inputType.addEventListener('change', this._toggleElevationField);
  }
  // SETTING GEOLOCATION request and check if that is supported by older web browsers with if statement
  _getPosition() {
    if (navigator.geolocation) {
      // call the load map function with current position from navigator.geolocation , bind the this keyword to App object
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your location');
        }
      );
    }
  }
  _loadMap(position) {
    //destructure the position.coords.latitude and save is as a varible .
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}`);

    //USE LEAFLET    external library to show map based on our geo location
    // need id map in our HTML("map")
    //Create array of coordinates
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Add event listener to map with mapE to get clicked lat and lng and assign it to global varible so we can use it outisde function , bind this keyword to App object
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    //select closest parent element to toggle hidden class
    inputElevation.closest('.form__row ').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row ').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    //prevent default to not reload page
    e.preventDefault();

    //Clear input fields
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    // DISPLAY MAP MARKER
    //destructure coordinates from click event
    const { lat, lng } = this.#mapEvent.latlng;

    //add coords here
    // set options to popup L.popup (object of options from documentation)
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}
const app = new App();
