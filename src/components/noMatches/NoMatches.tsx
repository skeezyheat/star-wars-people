import React from 'react';
import './NoMatches.scss';

const NoMatches: React.FunctionComponent = () => (
  <div className="no-matches">
    <div className="icon">
      <i className="fa fa-exclamation-triangle fa-5x"></i>
    </div>
    <div className="message">
      <h1>We couldn't find the droids you were looking for</h1>
      <p>
        <strong>Please try a different search query</strong>
      </p>
    </div>
  </div>
);

export default NoMatches;
