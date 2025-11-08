import React, { useEffect, useState } from 'react';
import api from '../services/api';
import styles from './Schedule.module.css';

interface Match {
	id: number;
	fixture: {
		id: number;
		player1: { id: number; name: string } | null;
		player2: { id: number; name: string } | null;
		round_number: number;
		match_number: number;
	};
	court_number: number | null;
	scheduled_time: string;
	status: string;
	winner: { id: number; name: string } | null;
}

const Schedule: React.FC = () => {
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'completed'>('all');
	const [sortBy, setSortBy] = useState<'time' | 'court'>('time');

	useEffect(() => {
		fetchMatches();
	}, []);

	const fetchMatches = async () => {
		try {
			const res = await api.get('/matches/');
			// Handle both paginated and non-paginated responses
			setMatches(Array.isArray(res.data) ? res.data : res.data.results || []);
			setError('');
		} catch (err) {
			console.error('Failed to fetch matches', err);
			setError('Failed to load match schedule');
		} finally {
			setLoading(false);
		}
	};

	const updateMatch = async (id: number, patch: Partial<Match>) => {
		try {
			const res = await api.patch(`/matches/${id}/`, patch);
			setMatches(prev => prev.map(m => (m.id === id ? res.data : m)));
		} catch (err) {
			console.error('Failed to update match', err);
			alert('Failed to update match. Please try again.');
		}
	};

	const filteredMatches = matches.filter(match => {
		switch (filter) {
			case 'scheduled': return match.status === 'SCHEDULED';
			case 'live': return match.status === 'LIVE';
			case 'completed': return match.status === 'COMPLETED';
			default: return true;
		}
	});

	const sortedMatches = [...filteredMatches].sort((a, b) => {
		if (sortBy === 'time') {
			return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
		} else {
			return (a.court_number || 999) - (b.court_number || 999);
		}
	});

	const getStatusBadge = (status: string) => {
		let badgeClass;
		let text;
		
		switch (status) {
			case 'LIVE':
				badgeClass = styles.statusBadgeLive;
				text = 'Live';
				break;
			case 'COMPLETED':
				badgeClass = styles.statusBadgeCompleted;
				text = 'Completed';
				break;
			default:
				badgeClass = styles.statusBadgeScheduled;
				text = 'Scheduled';
		}
		
		return (
			<span className={`${styles.statusBadgeBase} ${badgeClass}`}>
				{text}
			</span>
		);
	};

	const assignCourt = (matchId: number) => {
		const court = prompt('Assign court number (1-10):');
		if (court) {
			const courtNum = parseInt(court, 10);
			if (courtNum >= 1 && courtNum <= 10) {
				updateMatch(matchId, { court_number: courtNum });
			} else {
				alert('Please enter a valid court number (1-10)');
			}
		}
	};

	const rescheduleMatch = (matchId: number) => {
		const newTime = prompt('Enter new scheduled time (YYYY-MM-DD HH:MM):');
		if (newTime) {
			updateMatch(matchId, { scheduled_time: newTime });
		}
	};

	return (
		<div className={styles.scheduleContainer}>
			<div className={styles.card}>
				<div className="card-header">
					<h2 className="mb-0 text-center">📅 Match Schedule</h2>
					<p className="text-center text-muted mb-0 mt-2">
						Manage match schedules and court assignments
					</p>
				</div>
				<div className="card-body">
					{error && <div className="error">❌ {error}</div>}

					{loading ? (
						<div className="loading">
							<div className="spinner"></div>
							<div>Loading schedule...</div>
						</div>
					) : matches.length === 0 ? (
						<div className="empty-state">
							<div className="empty-state-icon">📅</div>
							<h3>No matches scheduled</h3>
							<p>Generate fixtures first to create match schedules</p>
						</div>
					) : (
						<div className="table-responsive">
							<table className="table">
								<thead>
									<tr>
										<th>Court</th>
										<th>Time</th>
										<th>Round</th>
										<th>Match</th>
										<th>Players</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{sortedMatches.map((match) => (
										<tr key={match.id}>
											<td>
												{match.court_number ? (
													<span className="badge badge-primary">
														Court {match.court_number}
													</span>
												) : (
													<span className="text-muted" style={{ fontStyle: 'italic' }}>Unassigned</span>
												)}
											</td>
											<td>
												<div style={{ fontSize: '0.9rem' }}>
													<div style={{ fontWeight: '500' }}>
														{new Date(match.scheduled_time).toLocaleDateString()}
													</div>
													<div className="text-muted">
														{new Date(match.scheduled_time).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit'
														})}
													</div>
												</div>
											</td>
											<td>
												<span className="badge badge-secondary">
													Round {match.fixture.round_number}
												</span>
											</td>
											<td>
												<span className="text-muted" style={{ fontWeight: '600' }}>#{match.fixture.match_number}</span>
											</td>
											<td>
												<div className={styles.flexColumn}>
													<span>{match.fixture.player1?.name || 'TBD'}</span>
													<span className={styles.vsText}>vs</span>
													<span>{match.fixture.player2?.name || 'TBD'}</span>
												</div>
											</td>
											<td>
												{getStatusBadge(match.status)}
											</td>
											<td>
												<div className={styles.flexRow}>
													{match.status === 'SCHEDULED' && (
														<button
															onClick={() => updateMatch(match.id, { status: 'LIVE' })}
															className={styles.buttonStart}
														>
															🎯 Start
														</button>
													)}
													{match.status === 'LIVE' && (
														<button
															onClick={() => updateMatch(match.id, { status: 'COMPLETED' })}
															className={styles.buttonLive}
														>
															🏁 Finish
														</button>
													)}
													<button
														onClick={() => assignCourt(match.id)}
														className={styles.buttonOutline}
													>
														🏓 Court
													</button>
													<button
														onClick={() => rescheduleMatch(match.id)}
														className={styles.buttonOutline}
													>
														📅 Time
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{matches.length > 0 && (
						<div className="mt-4">
							<div className={`${styles.card} ${styles.cardGlass}`}>
								<div className="card-body">
									<h4 className={styles.summaryTitle}>📊 Schedule Summary</h4>
									<div className="grid grid-cols-3">
										<div className="text-center">
											<div className={styles.statValue}>{matches.length}</div>
											<div className="stats-card-label">Total Matches</div>
										</div>
										<div className="text-center">
											<div className={styles.statValueLive}>
												{matches.filter(m => m.status === 'LIVE').length}
											</div>
											<div className="stats-card-label">Live Matches</div>
										</div>
										<div className="text-center">
											<div className={styles.statValueComplete}>
												{matches.filter(m => m.court_number).length}
											</div>
											<div className="stats-card-label">Assigned Courts</div>
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

export default Schedule;
