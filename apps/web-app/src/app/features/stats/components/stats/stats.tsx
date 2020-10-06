import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import styled from 'styled-components';
import {AppState} from '../../../../state/app-state';

const currentMonth = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 7);

const Header = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatRow = styled.div`
  flex-direction: column;
  display: flex;
`;

const StatSpacer = styled.div`
  height: 15px;
`;

const StatKey = styled.div`
  flex-basis: 10px;
`;

const StatsView = ({stats}: ViewProps) =>
  <div>
    <Header>
      Summary for users:
    </Header>
    <div>
      {(stats)?.map(stat => <StatRow key={stat.name}>
        <StatKey>{stat.name}:</StatKey>
        <StatSpacer></StatSpacer>
        <StatRow>
          {Object.keys(stat.stats || {}).map(year =>
            <StatKey key={year}>
              <b>{year}</b>
              <StatRow>
                <StatKey>
                  {Object.keys(stat.stats[year]).filter(value => value !== 'summary').map(value => <div
                    key={value}>{value}: {stat.stats[year][value]}</div>)}
                </StatKey>
                <StatKey>
                  Totally: {stat.stats[year]['summary']}
                </StatKey>
              </StatRow>
              <StatSpacer></StatSpacer>
            </StatKey>
          )}
        </StatRow>
      </StatRow>)}
    </div>
  </div>;

interface ViewProps extends ConnectedProps
  <typeof connector> {
}

const connector = connect(
  (state: AppState) => ({
    stats: state.stats?.months?.[currentMonth]
  }),
  {}
);

export const Stats = connector(StatsView);
