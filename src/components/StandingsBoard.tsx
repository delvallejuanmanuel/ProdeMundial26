import React from 'react';
import { GroupStandingsTable, GroupData } from './GroupStandingsTable';

// Mock data to illustrate the UI based on the image with 12 groups
const createEmptyTeam = (pos: number, name: string, flag: string) => ({
  pos, flag, name, played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0
});

const MOCK_GROUPS: GroupData[] = [
  {
    name: 'Grupo A',
    teams: [
      createEmptyTeam(1, 'México', 'https://api.promiedos.com.ar/images/team/fbag/1'),
      createEmptyTeam(2, 'Sudáfrica', 'https://api.promiedos.com.ar/images/team/fbad/1'),
      createEmptyTeam(3, 'Corea del Sur', 'https://api.promiedos.com.ar/images/team/cdid/1'),
      createEmptyTeam(4, 'Rep. Checa', 'https://api.promiedos.com.ar/images/team/faea/1'),
    ]
  },
  {
    name: 'Grupo B',
    teams: [
      createEmptyTeam(1, 'Canadá', 'https://api.promiedos.com.ar/images/team/cdii/1'),
      createEmptyTeam(2, 'Bosnia Herz.', 'https://api.promiedos.com.ar/images/team/faei/1'),
      createEmptyTeam(3, 'Qatar', 'https://api.promiedos.com.ar/images/team/fahj/1'),
      createEmptyTeam(4, 'Suiza', 'https://api.promiedos.com.ar/images/team/fadc/1'),
    ]
  },
  {
    name: 'Grupo C',
    teams: [
      createEmptyTeam(1, 'Brasil', 'https://api.promiedos.com.ar/images/team/cdhj/1'),
      createEmptyTeam(2, 'Marruecos', 'https://api.promiedos.com.ar/images/team/fajd/1'),
      createEmptyTeam(3, 'Haití', 'https://api.promiedos.com.ar/images/team/fecc/1'),
      createEmptyTeam(4, 'Escocia', 'https://api.promiedos.com.ar/images/team/fagj/1'),
    ]
  },
  {
    name: 'Grupo D',
    teams: [
      createEmptyTeam(1, 'Estados Unidos', 'https://api.promiedos.com.ar/images/team/cdij/1'),
      createEmptyTeam(2, 'Paraguay', 'https://api.promiedos.com.ar/images/team/faha/1'),
      createEmptyTeam(3, 'Australia', 'https://api.promiedos.com.ar/images/team/cdia/1'),
      createEmptyTeam(4, 'Turquía', 'https://api.promiedos.com.ar/images/team/faeh/1'),
    ]
  },
  {
    name: 'Grupo E',
    teams: [
      createEmptyTeam(1, 'Argentina', 'https://api.promiedos.com.ar/images/team/cdhi/1'),
      createEmptyTeam(2, 'Egipto', 'https://api.promiedos.com.ar/images/team/fbaa/1'),
      createEmptyTeam(3, 'Japón', 'https://api.promiedos.com.ar/images/team/cdic/1'),
      createEmptyTeam(4, 'Gales', 'https://api.promiedos.com.ar/images/team/faeb/1'),
    ]
  },
  {
    name: 'Grupo F',
    teams: [
      createEmptyTeam(1, 'Inglaterra', 'https://api.promiedos.com.ar/images/team/fafe/1'),
      createEmptyTeam(2, 'Senegal', 'https://api.promiedos.com.ar/images/team/fbac/1'),
      createEmptyTeam(3, 'Irán', 'https://api.promiedos.com.ar/images/team/fajb/1'),
      createEmptyTeam(4, 'Ucrania', 'https://api.promiedos.com.ar/images/team/fafh/1'),
    ]
  },
  {
    name: 'Grupo G',
    teams: [
      createEmptyTeam(1, 'Francia', 'https://api.promiedos.com.ar/images/team/fagb/1'),
      createEmptyTeam(2, 'Arabia Saudita', 'https://api.promiedos.com.ar/images/team/faih/1'),
      createEmptyTeam(3, 'Nigeria', 'https://api.promiedos.com.ar/images/team/fbcj/1'),
      createEmptyTeam(4, 'Polonia', 'https://api.promiedos.com.ar/images/team/fafc/1'),
    ]
  },
  {
    name: 'Grupo H',
    teams: [
      createEmptyTeam(1, 'España', 'https://api.promiedos.com.ar/images/team/fafa/1'),
      createEmptyTeam(2, 'Colombia', 'https://api.promiedos.com.ar/images/team/fahb/1'),
      createEmptyTeam(3, 'Túnez', 'https://api.promiedos.com.ar/images/team/fbae/1'),
      createEmptyTeam(4, 'Costa Rica', 'https://api.promiedos.com.ar/images/team/fbbj/1'),
    ]
  },
  {
    name: 'Grupo I',
    teams: [
      createEmptyTeam(1, 'Portugal', 'https://api.promiedos.com.ar/images/team/faci/1'),
      createEmptyTeam(2, 'Uruguay', 'https://api.promiedos.com.ar/images/team/fahd/1'),
      createEmptyTeam(3, 'Argelia', 'https://api.promiedos.com.ar/images/team/fbaj/1'),
      createEmptyTeam(4, 'Camerún', 'https://api.promiedos.com.ar/images/team/fbab/1'),
    ]
  },
  {
    name: 'Grupo J',
    teams: [
      createEmptyTeam(1, 'Bélgica', 'https://api.promiedos.com.ar/images/team/cdhd/1'),
      createEmptyTeam(2, 'Croacia', 'https://api.promiedos.com.ar/images/team/faff/1'),
      createEmptyTeam(3, 'Mali', 'https://api.promiedos.com.ar/images/team/fbba/1'),
      createEmptyTeam(4, 'Irak', 'https://api.promiedos.com.ar/images/team/fahi/1'),
    ]
  },
  {
    name: 'Grupo K',
    teams: [
      createEmptyTeam(1, 'Alemania', 'https://api.promiedos.com.ar/images/team/cdhc/1'),
      createEmptyTeam(2, 'Ecuador', 'https://api.promiedos.com.ar/images/team/fahf/1'),
      createEmptyTeam(3, 'Panamá', 'https://api.promiedos.com.ar/images/team/febe/1'),
      createEmptyTeam(4, 'Eslovaquia', 'https://api.promiedos.com.ar/images/team/fagf/1'),
    ]
  },
  {
    name: 'Grupo L',
    teams: [
      createEmptyTeam(1, 'Italia', 'https://api.promiedos.com.ar/images/team/fagd/1'),
      createEmptyTeam(2, 'Países Bajos', 'https://api.promiedos.com.ar/images/team/cdhh/1'),
      createEmptyTeam(3, 'C. de Marfil', 'https://api.promiedos.com.ar/images/team/cdif/1'),
      createEmptyTeam(4, 'Noruega', 'https://api.promiedos.com.ar/images/team/cdhg/1'),
    ]
  }
];

export const StandingsBoard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {MOCK_GROUPS.map(group => (
        <GroupStandingsTable key={group.name} group={group} />
      ))}
    </div>
  );
};
