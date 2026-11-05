import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { _id?: string; name: string; mascot?: string; members?: Array<string | { name?: string }> };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then(({ teams: results }) => {
        if (active) setTeams(results);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load teams.');
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {teams === null && !error && <p role="status">Loading teams...</p>}
        {error && <p role="alert">Unable to load teams: {error}</p>}
        {teams?.length === 0 && <p>No teams available.</p>}
        {teams && teams.length > 0 && (
          <ul className="list-group list-group-flush">
            {teams.map((team, index) => (
              <li className="list-group-item px-0" key={team._id ?? team.name ?? index}>
                <h3 className="h5">{team.name}</h3>
                {team.mascot && <p>Mascot: {team.mascot}</p>}
                <p className="mb-0">Members: {team.members?.map((member) => typeof member === 'string' ? member : member.name ?? 'Member').join(', ') || 'None'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
