import React from 'react';
import './Loading.scss';

const Loading: React.FunctionComponent = () => (
  <div className="is-loading">
    <i className="fa fa-spinner fa-spin fa-5x fa-fw"></i>
  </div>
);

export default Loading;
