import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then(({ suggestions: results }) => {
        if (active) setSuggestions(results);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load workout suggestions.');
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {suggestions === null && !error && <p role="status">Loading workout suggestions...</p>}
        {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
        {suggestions?.length === 0 && <p>No workout suggestions available.</p>}
        {suggestions && suggestions.length > 0 && (
          <ul className="list-group list-group-flush">
            {suggestions.map((suggestion) => (
              <li className="list-group-item px-0" key={suggestion.title}>
                <h3 className="h5">{suggestion.title}</h3>
                {suggestion.focus && <p>Focus: {suggestion.focus}</p>}
                {suggestion.minutes !== undefined && <p>Duration: {suggestion.minutes} minutes</p>}
                {suggestion.difficulty && <p>Difficulty: {suggestion.difficulty}</p>}
                {suggestion.reason && <p>{suggestion.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
