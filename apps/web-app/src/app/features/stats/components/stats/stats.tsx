import React, { useState } from 'react';
import {connect, ConnectedProps} from 'react-redux';
import styled from 'styled-components';
import {TextField} from '@material-ui/core';
import {AppState} from '../../../../state/app-state';

const currentMonth = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 7);

const Header = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatRow = styled.div`
  display: flex;
`;

const StatKey = styled.div`
  flex-basis: 100px;
`;

const StatsView = ({stats}: ViewProps) => {
  const [state, setState] = useState({
    username: '',
});
  const handleChange = event => {
    setState({
      ...state,
      username: event.target.value
  });
    };
  return <div>
    <TextField id="stats-username" label="Username" onChange={handleChange}/>
    <Header>
      {JSON.stringify(stats)}...
      {state.username}
    </Header>
    <div>
    </div>
  </div>;
};

interface ViewProps extends ConnectedProps<typeof connector> {
}

const connector = connect(
  (state: AppState) => ({
    stats: state.stats?.months?.[currentMonth]
  }),
  {}
);

export const Stats = connector(StatsView);
