'use strict';

// CLASS WORKOUT
class Workout {
  date = new Date();
  // current time stamp
  id = (Date.now() + '').slice(-10);
  ///// CONSTRUCTOR //////
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat ,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} on ${this.date.getDate()} ${
      //get day
      months[this.date.getMonth()] // get.Month returns number use it to get month from array as index
    } `;
  }
}
//CLASS RUNNING
class Running extends Workout {
  type = 'running';
  ///// CONSTRUCTOR //////
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  //METHODS
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
// CLASS CYCLING
class Cycling extends Workout {
  type = 'cycling';
  ///// CONSTRUCTOR //////
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }
  //METHODS
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const run = new Running([34, -12], 5.2, 24, 178);
// const cycle = new Cycling([34, -12], 3.2, 64, 122);
// console.log(run, cycle);

////////////////////////////////////////// APPLICATION ARCHITECTURE /////////////////////////////////////////

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
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  ///// CONSTRUCTOR ////// THIS WILL EXECUTE AS APPLICATION LOADS
  constructor() {
    //call the get position function as soon the object is created
    this._getPosition();

    //EVENT HANDLERS
    //FORM EVENT LISTNER to display marker , bind this keyword to App object
    form.addEventListener('submit', this._newWorkout.bind(this));
    //Event for form input select options
    inputType.addEventListener('change', this._toggleElevationField);
    //add event listner to workouts container
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
    //GET LOCAL STORAGE
    this._getLocalStorage();
  }
  ///// METHODS //////
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

    //USE LEAFLET    external library to show map based on our geo location
    // need id map in our HTML("map")
    //Create array of coordinates
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Add event listener to map with mapE to get clicked lat and lng and assign it to global varible so we can use it outisde function , bind this keyword to App object
    this.#map.on('click', this._showForm.bind(this));
    //RENDER MARKERS FROM LOCAL STORAGE AFTER MAP IS LOADED
    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _toggleElevationField() {
    //select closest parent element to toggle hidden class
    inputElevation.closest('.form__row ').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row ').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    //helper function to validate if number is not infinity
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    // helper function to check if number is not a negative number
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    //prevent default to not reload page
    e.preventDefault();
    //GET DATA FROM FORM
    const type = inputType.value;
    // the value is a string conver it to number +
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //If workout is running create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid (number is not infinity)
      console.log(!allPositive(distance, duration, cadence));
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('inputs have to be a positive numbers !');
      //Add new object to workouts array
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //If workout is cycling create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('inputs have to be a positive numbers !');
      //Add new object to workouts array
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    //CLEAR INPUT FIELDS AND HIDE FORM
    this._hideForm();
    //SET LOCAL STORAGE TO ALL WORKOUTS
    this._setLocalStorage();
  }

  //RENDER WORKOUT ON A MAP AS A MARKER
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  // RENDER WOURKOUT IN FORM
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running')
      html =
        html +
        `
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`;
    if (workout.type === 'cycling')
      html =
        html +
        `  <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToWorkout(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workout', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workout'));

    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }
  reset() {
    localStorage.removeItem('workout');
    location.reload(); //reloads page
  }
}

const app = new App();
