import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('lastName');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await api.get('/players', {
          params: {
            search,
            sort,
            page,
            limit
          }
        });

        setPlayers(response.data.players || []);
        setTotal(response.data.total || 0);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load players');
      }
    }

    fetchPlayers();
  }, [search, sort, page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1>Players</h1>

      <div
        style={{
          display: 'flex',
          gap: '18px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label htmlFor="search">Search by name</label>
          <br />
          <input
            id="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search players"
          />
        </div>

        <div>
          <label htmlFor="sort">Sort</label>
          <br />
          <select
            id="sort"
            value={sort}
            onChange={(event) => {
              setPage(1);
              setSort(event.target.value);
            }}
          >
            <option value="lastName">Last name A-Z</option>
            <option value="-lastName">Last name Z-A</option>
            <option value="age">Age low-high</option>
            <option value="-age">Age high-low</option>
            <option value="position">Preferred Position (GK → DEF → MID → FW)</option>
            <option value="-position">Preferred Position (FW → MID → DEF → GK)</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Preferred Position</th>
                <th>Alternative Positions</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player._id}>
                  <td>
                    <Link to={`/players/${player._id}`}>
                      {player.firstName} {player.lastName}
                    </Link>
                  </td>
                  <td>{player.age}</td>
                  <td>{player.preferredPosition || 'N/A'}</td>
                  <td>{player.alternativePositions?.join(', ') || 'None'}</td>
                  <td>{player.team?.name || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages || 1}
            </span>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}