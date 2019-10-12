import React from 'react';

// Libraries
import axios from 'axios';

// components
import Person from '../person/Person';

// models
import PersonModel from '../../models/Person';

// Styles
import './App.scss';

// Interface for initial state
interface State {
  people: PersonModel[]; // Array of all people in the database
  originalOrder: PersonModel[]; // Preserve the original order of the people
  humanLink: string; // Link to check if person is human
  droidLink: string; // Link to check if person is a droid
  isLoading: boolean; // isLoading flag
  lowerLimit: number; // Lower limit for pagination
  upperLimit: number; // Upper Limit for pagination
  filteredPeople: string; // String for filtering people
  noFilterMatches: boolean; // Flag if there are no filtered matches
  sortingOrder: string; // Selected sorting order
}

/**
 * Get all the people from the api at once
 */
async function getAllPeople(): Promise<PersonModel[]> {
  let people: PersonModel[] = [];

  // Get the first page of data
  const res = await axios.get('https://swapi.co/api/people/');
  people = res.data.results;
  // Get the number of pages left in the api
  const numPages = Math.ceil((res.data.count - 1) / 10);
  // Set up the Promise.all array to get the rest of the pages at once
  let promises = [];
  for (let i = 2; i <= numPages; i++) {
    promises.push(axios.get(`https://swapi.co/api/people?page=${i}`));
  }
  const promiseResults = await Promise.all(promises);
  promiseResults.forEach(res => {
    people = [...people, ...res.data.results];
  });

  return people;
}

export default class App extends React.Component<{}, State> {
  // Initialize state
  state: State = {
    people: [],
    originalOrder: [],
    humanLink: '',
    droidLink: '',
    isLoading: true,
    lowerLimit: 0,
    upperLimit: 10,
    filteredPeople: '',
    noFilterMatches: false,
    sortingOrder: ''
  };
  async componentDidMount() {
    // Get API data
    const people = await getAllPeople();
    const human = await axios.get(`https://swapi.co/api/species?search=Human`);
    const droid = await axios.get(`https://swapi.co/api/species?search=Droid`);

    // Set the initial state after loading the api data
    const initialState = {
      people,
      originalOrder: people,
      humanLink: human.data.results[0].url,
      droidLink: droid.data.results[0].url,
      isLoading: false
    };

    this.setState(initialState);
  }

  /**
   * Function that takes in a person and builds a Person component with the passed in data
   * @param person
   */
  private personElement(person: PersonModel) {
    return (
      <Person
        key={person.name}
        person={person}
        isHuman={person.species.indexOf(this.state.humanLink) !== -1}
        isDroid={person.species.indexOf(this.state.droidLink) !== -1}
      ></Person>
    );
  }

  /**
   * Handles filtering people from the search bar
   * @param e event
   */
  private handleFilterChange(e: React.ChangeEvent<HTMLInputElement>): void {
    // Set the filteredPeople state to the current input
    this.setState({ filteredPeople: e.target.value.toLowerCase() });
  }

  /**
   * Handles sorting of the people array when changed
   * @param e event
   */
  private handleSortingChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    let sorted;
    // If set to ascending, sort people by name in ascending order
    if (e.target.value === 'ascending') {
      sorted = [...this.state.people].sort(
        (a: PersonModel, b: PersonModel): number => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        }
      );
      // If set to descending, sort people by name in desscending order
    } else if (e.target.value === 'descending') {
      sorted = [...this.state.people].sort(
        (a: PersonModel, b: PersonModel): number => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
          return 0;
        }
      );
      // If set back to the default option set the people back to their original order
    } else {
      sorted = this.state.originalOrder;
    }

    // Set the people state to the current sorted array value
    this.setState({ people: sorted });
  }

  /**
   * Decreases the limit of the currently shown people
   */
  private decreaseLimit(): void {
    let upperLimit;

    // If the length is an odd number we need to round down to the nearest 10
    const lengthRoundedDown = Math.floor(this.state.people.length / 10) * 10;

    // Set the upper limit to the length rounded down if the upper limit is greater
    if (this.state.upperLimit > lengthRoundedDown) {
      upperLimit = lengthRoundedDown;
    } else {
      // Else decrease the upper limit by 10 since we're only showing 10 people at a time
      upperLimit = this.state.upperLimit - 10;
    }
    // Set the lower limit to 10 less than the upper limit
    const lowerLimit = upperLimit - 10;

    this.setState({ upperLimit, lowerLimit });
  }

  /**
   * Increases the limit of the currently shown people
   */
  private increaseLimit(): void {
    // Set the new lower limit to the current upper limit
    const lowerLimit = this.state.upperLimit;
    // Increase the upper limit by 10
    let upperLimit = this.state.upperLimit + 10;
    // If we've gone past the length of the array set the upper limit to the array length
    if (upperLimit > this.state.people.length) {
      upperLimit = this.state.people.length;
    }

    this.setState({ upperLimit, lowerLimit });
  }

  render() {
    // If we're still loading data show the spinner
    if (this.state.isLoading) {
      return (
        <div className="is-loading">
          <i className="fa fa-spinner fa-spin fa-5x fa-fw"></i>
        </div>
      );
    }

    // Current people to display on the screen
    let peopleToDisplay;
    // If we're filtering, filter for people with names that have indexOf(searchPhrase)
    if (this.state.filteredPeople) {
      peopleToDisplay = this.state.people
        .filter(person => {
          if (
            person.name.toLowerCase().indexOf(this.state.filteredPeople) > -1
          ) {
            return person;
          }
        })
        .map(person => this.personElement(person));
    } else {
      // Else display all people
      peopleToDisplay = this.state.people
        // Slice the people array by the current upper and lower limit for pagination
        .slice(this.state.lowerLimit, this.state.upperLimit)
        .map(person => this.personElement(person));
    }

    return (
      <div className="App">
        <div className="heading">
          <h1>People of Star Wars</h1>
        </div>
        <div className="controls">
          <div className="search">
            <input
              type="text"
              placeholder="Search..."
              onChange={this.handleFilterChange.bind(this)}
            />

            <span>
              <i className="fa fa-search"></i>
            </span>
          </div>

          <div className="sort">
            <select
              className="select-list"
              onChange={this.handleSortingChange.bind(this)}
            >
              <option value="none">Select Sorting</option>
              <option value="ascending">Sort By Name (A-Z)</option>
              <option value="descending">Sort By Name (Z-A)</option>
            </select>
          </div>
        </div>

        {!peopleToDisplay.length && (
          <div className="no-matches">
            <div className="icon">
              <i className="fa fa-exclamation-circle fa-5x"></i>
            </div>
            <div className="message">
              <p>There aren't any matches for your search.</p>
            </div>
          </div>
        )}

        <div className="people">{peopleToDisplay}</div>

        <div className="pagination">
          <div className="back-button">
            {this.state.lowerLimit !== 0 ? (
              <button
                className="button"
                onClick={this.decreaseLimit.bind(this)}
              >
                Previous Page
              </button>
            ) : null}
          </div>
          <div className="current-page">
            <p>
              {this.state.upperLimit} of {this.state.people.length}
            </p>
          </div>
          <div className="next-button">
            {this.state.people.length !== this.state.upperLimit ? (
              <button
                className="button"
                onClick={this.increaseLimit.bind(this)}
              >
                Next Page
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
