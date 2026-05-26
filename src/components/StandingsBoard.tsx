import React from 'react';
import { GroupStandingsTable, GroupData } from './GroupStandingsTable';

// Mock data to illustrate the UI based on the image
const MOCK_GROUPS: GroupData[] = [
  {
    name: 'Grupo A',
    teams: [
      { pos: 1, flag: 'https://api.promiedos.com.ar/images/team/fbag/1', name: 'MEX', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 2, flag: 'https://api.promiedos.com.ar/images/team/fbad/1', name: 'RSA', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 3, flag: 'https://api.promiedos.com.ar/images/team/cdid/1', name: 'KOR', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 4, flag: 'https://api.promiedos.com.ar/images/team/faea/1', name: 'CZE', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
    ]
  },
  {
    name: 'Grupo B',
    teams: [
      { pos: 1, flag: 'https://api.promiedos.com.ar/images/team/cdii/1', name: 'CAN', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 2, flag: 'https://api.promiedos.com.ar/images/team/faei/1', name: 'BIH', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 3, flag: 'https://api.promiedos.com.ar/images/team/fahj/1', name: 'QAT', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 4, flag: 'https://api.promiedos.com.ar/images/team/fadc/1', name: 'SUI', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
    ]
  },
  {
    name: 'Grupo C',
    teams: [
      { pos: 1, flag: 'https://api.promiedos.com.ar/images/team/cdhj/1', name: 'BRA', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 2, flag: 'https://api.promiedos.com.ar/images/team/fajd/1', name: 'MAR', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 3, flag: 'https://api.promiedos.com.ar/images/team/fecc/1', name: 'HAI', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 4, flag: 'https://api.promiedos.com.ar/images/team/fagj/1', name: 'SCO', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
    ]
  },
  {
    name: 'Grupo D',
    teams: [
      { pos: 1, flag: 'https://api.promiedos.com.ar/images/team/cdij/1', name: 'USA', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 2, flag: 'https://api.promiedos.com.ar/images/team/faha/1', name: 'PAR', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 3, flag: 'https://api.promiedos.com.ar/images/team/cdia/1', name: 'AUS', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
      { pos: 4, flag: 'https://api.promiedos.com.ar/images/team/faeh/1', name: 'TUR', played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 },
    ]
  }
];

export const StandingsBoard: React.FC = () => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-sans">Clasificación</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_GROUPS.map(group => (
          <GroupStandingsTable key={group.name} group={group} />
        ))}
      </div>
    </section>
  );
};
