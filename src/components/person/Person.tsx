import React from 'react';
import './Person.scss';
import PersonModel from '../../models/Person';

interface Props {
  person: PersonModel; // Person object
  isHuman: boolean; // Boolean for checking if person is a human
  isDroid: boolean; // Boolean for checking if person is a droid
}

const Person: React.FunctionComponent<Props> = ({
  person,
  isHuman,
  isDroid
}) => {
  return (
    <div className="person">
      <div className="icon">
        {isHuman && <i className="fa fa-user-circle-o"></i>}
        {isDroid && <i className="fa fa-android"></i>}
        {!isHuman && !isDroid && <i className="fa fa-question-circle"></i>}
      </div>
      <div className="information">
        <div className="name">
          <h1>{person.name}</h1>
        </div>
        <div className="stats">
          <p>
            <strong>Height:</strong> {person.height}
          </p>
          <p>
            <strong>Mass:</strong> {person.mass}
          </p>
          <p>
            <strong>Gender:</strong> {person.gender}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Person;
