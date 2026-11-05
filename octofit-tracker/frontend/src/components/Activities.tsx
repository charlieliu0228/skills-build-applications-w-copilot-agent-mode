import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(({ activities: results }) => {
        if (active) setActivities(results);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load activities.');
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {activities === null && !error && <p role="status">Loading activities...</p>}
        {error && <p role="alert">Unable to load activities: {error}</p>}
        {activities?.length === 0 && <p>No activities recorded yet.</p>}
        {activities && activities.length > 0 && (
          <ul className="list-group list-group-flush">
            {activities.map((activity, index) => (
              <li className="list-group-item px-0" key={activity._id ?? `${activity.type}-${index}`}>
                <strong>{activity.type}</strong>
                <p className="mb-0">{activity.minutes} minutes · {activity.points} points</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
