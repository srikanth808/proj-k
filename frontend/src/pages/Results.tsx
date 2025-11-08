import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Results.module.css';

interface Match {
	id: number;
	fixture: {
		id: number;
		player1: { id: number; name: string } | null;
		player2: { id: number; name: string } | null;
		round_number: number;
		match_number: number;
	};
	winner: { id: number; name: string } | null;
	status: string;
	scheduled_time: string;
	court_number: number | null;
}

const Results: React.FC = () => {
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [sortBy, setSortBy] = useState<'date' | 'round'>('date');

	useEffect(() => {
		fetchResults();
	}, []);

	const fetchResults = async () => {
		try {
			const res = await api.get('/matches/?status=COMPLETED');
			setMatches(res.data);
			setError('');
		} catch (err) {
			console.error('Failed to fetch results:', err);
			setError('Failed to load match results');
		} finally {
			setLoading(false);
		}
	};

	const sortedMatches = [...matches].sort((a, b) => {
		if (sortBy === 'date') {
			return new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime();
		} else {
			return a.fixture.round_number - b.fixture.round_number;
		}
	});

	const getWinnerScore = (match: Match) => {
		// This would need to be implemented based on your scoring system
		// For now, we'll show a placeholder
		return '21-15';
	};

	return (
		<div className="p-4 fade-in">
			<div className="card">
				<div className="card-header">
					<div className={styles.header}>
						<div>
							<h2 className="mb-0">🏅 Match Results</h2>
							<p className={`text-muted mb-0 mt-1 ${styles.metaText}`}>
								View completed match results
							</p>
						</div>
						<div className={styles.actionGroup}>
							<button
								onClick={() => setSortBy('date')}
								className={`btn ${sortBy === 'date' ? 'btn-secondary' : 'btn-outline'}`}
							>
								📅 By Date
							</button>
							<button
								onClick={() => setSortBy('round')}
								className={`btn ${sortBy === 'round' ? 'btn-secondary' : 'btn-outline'}`}
							>
								🏆 By Round
							</button>
						</div>
					</div>
				</div>
				<div className="card-body">
					{error && <div className="error">❌ {error}</div>}

					{loading ? (
						<div className="loading">
							<div className="spinner"></div>
							<div>Loading results...</div>
						</div>
					) : matches.length === 0 ? (
						<div className="empty-state">
							<div className="empty-state-icon">🏓</div>
							<h3>No completed matches yet</h3>
							<p>Results will appear here once matches are finished</p>
						</div>
					) : (
						<div className="table-responsive">
							<table className="table">
								<thead>
									<tr>
										<th>Round</th>
										<th>Match</th>
										<th>Players</th>
										<th>Winner</th>
										<th>Score</th>
										<th>Date</th>
										<th>Court</th>
									</tr>
								</thead>
								<tbody>
									{sortedMatches.map((match) => (
										<tr key={match.id}>
											<td>
												<span className="badge badge-secondary">
													Round {match.fixture.round_number}
												</span>
											</td>
											<td>
												<span className="text-muted" style={{ fontWeight: '600' }}>#{match.fixture.match_number}</span>
											</td>
											<td>
												<div className={styles.playerInfo}>
													<span className={styles.playerName}>{match.fixture.player1?.name || 'TBD'}</span>
													<span className={styles.vsText}>vs</span>
													<span className={styles.playerName}>{match.fixture.player2?.name || 'TBD'}</span>
												</div>
											</td>
											<td>
												<div style={{
													display: 'flex',
													alignItems: 'center',
													gap: '0.5rem',
													fontWeight: '600',
													color: 'var(--accent-secondary)'
												}}>
													<span style={{ fontSize: '1.25rem' }}>🏆</span>
													{match.winner?.name || 'TBD'}
												</div>
											</td>
											<td>
												<span className={`badge ${styles.matchBadge}`}>
													{getWinnerScore(match)}
												</span>
											</td>
											<td>
												<div className={styles.matchTime}>
													<div className={styles.matchDate}>{new Date(match.scheduled_time).toLocaleDateString()}</div>
													<div className="text-muted">
														{new Date(match.scheduled_time).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit'
														})}
													</div>
												</div>
											</td>
											<td>
												{match.court_number ? (
													<span className="badge badge-primary">
														Court {match.court_number}
													</span>
												) : (
													<span className="text-muted">-</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{matches.length > 0 && (
						<div className="mt-4">
							<div className={`card ${styles.summaryCard}`}>
								<div className="card-body">
									<h4 className={`mb-3 text-center ${styles.summaryTitle}`}>📊 Tournament Summary</h4>
									<div className="grid grid-cols-3">
										<div className="text-center">
											<div className={`stats-card-value ${styles.statsValue}`}>{matches.length}</div>
											<div className="stats-card-label">Total Matches</div>
										</div>
										<div className="text-center">
											<div className={`stats-card-value ${styles.statsValue} ${styles.statsSecondary}`}>
											{new Set(matches.map(m => m.winner?.id).filter(Boolean)).size}
											</div>
											<div className="stats-card-label">Unique Winners</div>
										</div>
										<div className="text-center">
											<div className={`stats-card-value ${styles.statsValue} ${styles.statsTertiary}`}>
											{Math.max(...matches.map(m => m.fixture.round_number))}
											</div>
											<div className="stats-card-label">Rounds Played</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Results;
