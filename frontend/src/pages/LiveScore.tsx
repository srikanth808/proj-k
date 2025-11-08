import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

type Match = {
	id: number;
	fixture: any;
	status: string;
};

type Game = {
	id: number;
	game_number: number;
	player1_score: number;
	player2_score: number;
	completed: boolean;
	winner: any;
};

const LiveScore: React.FC = () => {
	const [matches, setMatches] = useState<Match[]>([]);
	const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
	const [games, setGames] = useState<Game[]>([]);
	const [currentGame, setCurrentGame] = useState<Game | null>(null);

	useEffect(() => {
		fetchMatches();
	}, []);

	const fetchMatches = async () => {
		try {
			const res = await api.get('/matches/');
			setMatches(res.data);
		} catch (err) {
			console.error(err);
		}
	};

	const startLive = async (match: Match) => {
		try {
			await api.post(`/matches/${match.id}/update_status/`, { status: 'LIVE' });
			setSelectedMatch({ ...match, status: 'LIVE' });
			await fetchGames(match.id);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchGames = async (matchId: number) => {
		try {
			const res = await api.get(`/scoring/games/?match=${matchId}`);
			setGames(res.data);
			if (res.data.length > 0) {
				const activeGame = res.data.find((g: Game) => !g.completed);
				setCurrentGame(activeGame || null);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const createNewGame = async () => {
		if (!selectedMatch) return;
		try {
			const res = await api.post('/scoring/games/', {
				match: selectedMatch.id,
				game_number: games.length + 1,
				player1_score: 0,
				player2_score: 0,
				completed: false
			});
			setGames([...games, res.data]);
			setCurrentGame(res.data);
		} catch (err) {
			console.error(err);
		}
	};

	const addPoint = async (playerId: number) => {
		if (!currentGame) return;
		try {
			await api.post(`/scoring/games/${currentGame.id}/add_point/`, { player: playerId });
			await fetchGames(selectedMatch!.id);
		} catch (err) {
			console.error(err);
		}
	};

	const finishMatch = async () => {
		if (!selectedMatch) return;
		try {
			await api.post(`/matches/${selectedMatch.id}/update_status/`, { status: 'COMPLETED' });
			alert('Match completed!');
			setSelectedMatch(null);
			setGames([]);
			setCurrentGame(null);
			fetchMatches();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<motion.div
			className="p-4"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<motion.div
				className="hero mb-4"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className="hero-content">
					<motion.h1
						style={{ marginBottom: '1rem' }}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						🎯 Live Badminton Scoring
					</motion.h1>
					<motion.p
						style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						Real-time match tracking and scoring system
					</motion.p>
				</div>
			</motion.div>

			<motion.div
				style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.8 }}
			>
				{/* Matches List */}
				<motion.div
					className="card"
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 1.0 }}
				>
					<div className="card-header">
						<h3 className="mb-0">Available Matches</h3>
					</div>
					<div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
						{matches.length === 0 ? (
							<motion.div
								className="empty-state"
								style={{ padding: '2rem 1rem' }}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 1.2 }}
							>
								<motion.div
									className="empty-state-icon"
									style={{ fontSize: '3rem' }}
									animate={{
										rotate: [0, 10, -10, 0],
										scale: [1, 1.1, 1]
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										repeatDelay: 3
									}}
								>
									🏓
								</motion.div>
								<p style={{ fontSize: '0.9rem' }}>No matches available</p>
							</motion.div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
								{matches.map((m, index) => (
									<motion.div
										key={m.id}
										className="card"
										style={{
											background: m.status === 'LIVE' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
											border: m.status === 'LIVE' ? '2px solid var(--error)' : '1px solid var(--border-color)'
										}}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 1.0 + (index * 0.1) }}
										whileHover={{
											scale: 1.02,
											boxShadow: m.status === 'LIVE' ? "0 10px 30px rgba(239, 68, 68, 0.3)" : "0 10px 30px rgba(0, 0, 0, 0.1)"
										}}
									>
										<div className="card-body" style={{ padding: '1rem' }}>
											<div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
												{m.fixture?.player1?.name || 'TBD'} vs {m.fixture?.player2?.name || 'TBD'}
											</div>
											<div style={{ marginBottom: '0.75rem' }}>
												{m.status === 'LIVE' ? (
													<motion.span
														className="badge badge-error"
														animate={{
															scale: [1, 1.05, 1],
															opacity: [1, 0.8, 1]
														}}
														transition={{
															duration: 1.5,
															repeat: Infinity
														}}
													>
														<span className="live-indicator" style={{ marginRight: '0.5rem' }}></span>
														LIVE
													</motion.span>
												) : (
													<span className="badge badge-secondary">{m.status}</span>
												)}
											</div>
											<div style={{ display: 'flex', gap: '0.5rem' }}>
												<motion.button
													onClick={() => startLive(m)}
													className="btn btn-secondary"
													style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', flex: 1 }}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													Start Live
												</motion.button>
												<motion.button
													onClick={() => setSelectedMatch(m)}
													className="btn btn-tertiary"
													style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', flex: 1 }}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													Open
												</motion.button>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						)}
					</div>
				</motion.div>

				{/* Scoring Panel */}
				<motion.div
					className="card"
					initial={{ opacity: 0, x: 30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 1.2 }}
				>
					{selectedMatch ? (
						<>
							<div className="card-header">
								<h3 className="mb-0 text-center" style={{ color: 'var(--accent-primary)' }}>
									{selectedMatch.fixture?.player1?.name || 'Player 1'} vs {selectedMatch.fixture?.player2?.name || 'Player 2'}
								</h3>
							</div>
							<div className="card-body">

								{/* Games List */}
								<motion.div
									style={{ marginBottom: '1.5rem' }}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 1.4 }}
								>
									<h4 className="mb-3" style={{ color: 'var(--accent-secondary)' }}>Games</h4>
									<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
										{games.map((game, index) => (
											<motion.div
												key={game.id}
												onClick={() => setCurrentGame(game)}
												className="card"
												style={{
													background: currentGame?.id === game.id ? 'var(--accent-primary)' : 'var(--bg-glass)',
													border: currentGame?.id === game.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
													minWidth: '100px',
													textAlign: 'center',
													cursor: 'pointer'
												}}
												initial={{ opacity: 0, scale: 0.9 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ duration: 0.3, delay: 1.4 + (index * 0.1) }}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												<div className="card-body" style={{ padding: '1rem' }}>
													<div style={{ fontSize: '0.85rem', color: currentGame?.id === game.id ? 'white' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
														Game {game.game_number}
													</div>
													<div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentGame?.id === game.id ? 'white' : 'var(--text-primary)' }}>
														{game.player1_score} - {game.player2_score}
													</div>
													{game.completed && (
														<motion.div
															style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}
															initial={{ scale: 0 }}
															animate={{ scale: 1 }}
															transition={{ type: "spring", stiffness: 500 }}
														>
															✓ Complete
														</motion.div>
													)}
												</div>
											</motion.div>
										))}
										{!currentGame && (
											<motion.button
												onClick={createNewGame}
												className="btn btn-secondary"
												style={{ minWidth: '100px' }}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												transition={{ type: "spring", stiffness: 300 }}
											>
												+ New Game
											</motion.button>
										)}
									</div>
								</motion.div>

								{/* Current Game Scoring */}
								{currentGame && !currentGame.completed && (
									<motion.div
										className="card"
										style={{ background: 'var(--bg-glass)', marginBottom: '1.5rem' }}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 1.6 }}
									>
										<div className="card-header">
											<h4 className="mb-0 text-center" style={{ color: 'var(--accent-gold)' }}>
												Game {currentGame.game_number} - Live Scoring
											</h4>
										</div>
										<div className="card-body">
											<div style={{
												display: 'grid',
												gridTemplateColumns: '1fr auto 1fr',
												gap: '2rem',
												alignItems: 'center'
											}}>
												<motion.div
													style={{ textAlign: 'center' }}
													initial={{ opacity: 0, x: -30 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.5, delay: 1.8 }}
												>
													<h5 className="mb-3" style={{ color: 'var(--text-secondary)' }}>
														{selectedMatch.fixture?.player1?.name || 'Player 1'}
													</h5>
													<motion.div
														style={{
															fontSize: '4rem',
															fontWeight: 'bold',
															color: 'var(--accent-secondary)',
															marginBottom: '1.5rem',
															fontFamily: 'Playfair Display, serif'
														}}
														key={currentGame.player1_score}
														initial={{ scale: 1.2, color: 'var(--success)' }}
														animate={{ scale: 1, color: 'var(--accent-secondary)' }}
														transition={{ type: "spring", stiffness: 500 }}
													>
														{currentGame.player1_score}
													</motion.div>
													<motion.button
														onClick={() => addPoint(selectedMatch.fixture.player1.id)}
														className="btn btn-secondary"
														style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
														whileHover={{ scale: 1.05 }}
														whileTap={{ scale: 0.95 }}
														transition={{ type: "spring", stiffness: 300 }}
													>
														+ POINT
													</motion.button>
												</motion.div>

												<motion.div
													style={{
														fontSize: '2rem',
														color: 'var(--text-muted)',
														fontWeight: 'bold'
													}}
													animate={{
														scale: [1, 1.1, 1],
														rotate: [0, 5, -5, 0]
													}}
													transition={{
														duration: 2,
														repeat: Infinity,
														repeatDelay: 3
													}}
												>
													VS
												</motion.div>

												<motion.div
													style={{ textAlign: 'center' }}
													initial={{ opacity: 0, x: 30 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.5, delay: 1.8 }}
												>
													<h5 className="mb-3" style={{ color: 'var(--text-secondary)' }}>
														{selectedMatch.fixture?.player2?.name || 'Player 2'}
													</h5>
													<motion.div
														style={{
															fontSize: '4rem',
															fontWeight: 'bold',
															color: 'var(--accent-tertiary)',
															marginBottom: '1.5rem',
															fontFamily: 'Playfair Display, serif'
														}}
														key={currentGame.player2_score}
														initial={{ scale: 1.2, color: 'var(--success)' }}
														animate={{ scale: 1, color: 'var(--accent-tertiary)' }}
														transition={{ type: "spring", stiffness: 500 }}
													>
														{currentGame.player2_score}
													</motion.div>
													<motion.button
														onClick={() => addPoint(selectedMatch.fixture.player2.id)}
														className="btn btn-tertiary"
														style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
														whileHover={{ scale: 1.05 }}
														whileTap={{ scale: 0.95 }}
														transition={{ type: "spring", stiffness: 300 }}
													>
														+ POINT
													</motion.button>
												</motion.div>
											</div>
										</div>
									</motion.div>
								)}

								{/* Control Buttons */}
								<motion.div
									style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 2.0 }}
								>
									<motion.button
										onClick={finishMatch}
										className="btn"
										style={{ background: 'var(--error)' }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300 }}
									>
										🏁 Finish Match
									</motion.button>
									<motion.button
										onClick={() => {
											setSelectedMatch(null);
											setGames([]);
											setCurrentGame(null);
										}}
										className="btn btn-outline"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300 }}
									>
										✕ Close
									</motion.button>
								</motion.div>
							</div>
						</>
					) : (
						<motion.div
							className="card-body"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 1.4 }}
						>
							<div className="empty-state">
								<motion.div
									className="empty-state-icon"
									animate={{
										rotate: [0, 10, -10, 0],
										scale: [1, 1.1, 1]
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										repeatDelay: 3
									}}
								>
									🏓
								</motion.div>
								<h3>No match selected</h3>
								<p>Select a match from the list to start live scoring</p>
							</div>
						</motion.div>
					)}
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default LiveScore;
