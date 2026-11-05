import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: Entry[] }>('/api/leaderboard')
      .then(({ leaderboard: results }) => {
        if (active) setLeaderboard(results);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load the leaderboard.');
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {leaderboard === null && !error && <p role="status">Loading leaderboard...</p>}
        {error && <p role="alert">Unable to load leaderboard: {error}</p>}
        {leaderboard?.length === 0 && <p>No leaderboard scores available.</p>}
        {leaderboard && leaderboard.length > 0 && (
          <ol className="list-group list-group-numbered list-group-flush">
            {leaderboard.map((entry) => (
              <li className="list-group-item d-flex justify-content-between px-0" key={`${entry.rank}-${entry.teamName}`}>
                <span>{entry.teamName}</span>
                <span>{entry.totalPoints} points</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
