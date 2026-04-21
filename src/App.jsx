import { useState, useEffect, useRef } from "react";
import "./App.css";
import { POOL } from "./lib/pool.js";
import { scoreMessage } from "./lib/score-message.js";

const TOTAL_Q = window.location.hostname === "localhost" ? 10 : 10;
const TOTAL_TIME = 120;

// ─── UTILS ────────────────────────────────────────────────────────────────────

function shuffle(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// Forgiving: ignores case, spaces around :, and trailing semicolons
function normalize(s) {
	return s
		.toLowerCase()
		.trim()
		.replace(/\s*:\s*/g, ": ")
		.replace(/\s*\/\s*/g, " / ")
		.replace(/;+$/, "")
		.replace(/\s+/g, " ");
}

function checkAnswer(input, expected) {
	const n = normalize(input);
	const e = normalize(expected);
	if (n === e) return true;
	// treat "0" and "0px" (or any "0<unit>") as equivalent
	const zeroUnit = /^(.*?)\b0px\b(.*)$/;
	return n === e.replace(/\b0px\b/g, "0") || e === n.replace(/\b0px\b/g, "0");
}

function formatTime(seconds) {
	const m = String(Math.floor(seconds / 60)).padStart(2, "0");
	const s = String(seconds % 60).padStart(2, "0");
	return `${m}:${s}`;
}

// ─── AD BANNER ────────────────────────────────────────────────────────────────

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT;

function AdBanner() {
	const ref = useRef(null);

	useEffect(() => {
		if (!ADSENSE_CLIENT || !ADSENSE_SLOT || !ref.current) return;
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (_) {}
	}, []);

	if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

	return (
		<section className="ad-banner">
			<ins
				ref={ref}
				className="adsbygoogle"
				style={{ display: "block" }}
				data-ad-client={ADSENSE_CLIENT}
				data-ad-slot={ADSENSE_SLOT}
				data-ad-format="horizontal"
				data-full-width-responsive="true"
				data-color-scheme="dark"
			/>
		</section>
	);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function CSSWind() {
	const [phase, setPhase] = useState("home"); // "home" | "quiz" | "results"
	const [difficulty, setDifficulty] = useState("normal"); // "easy" | "normal" | "expert"
	const [questions, setQuestions] = useState([]);
	const [currIndex, setCurrIndex] = useState(0);
	const [input, setInput] = useState("");
	const [inputState, setInputState] = useState("idle"); // "idle" | "correct" | "wrong"
	const [hint, setHint] = useState("");
	const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
	const [results, setResults] = useState([]);
	const [timeTaken, setTimeTaken] = useState(0);

	const inputRef = useRef(null);
	const timerRef = useRef(null);

	const currentQuestion = questions[currIndex];
	// Each question has its own randomly assigned direction
	const isTW = currentQuestion?.dir === "tw2css";
	const correctAnswer = currentQuestion
		? isTW
			? currentQuestion.css
			: currentQuestion.tw
		: "";

	// Focus the input on each new question
	useEffect(() => {
		if (phase === "quiz" && inputRef.current) {
			inputRef.current.focus();
		}
	}, [phase, currIndex]);

	// Countdown timer
	useEffect(() => {
		if (phase !== "quiz") return;

		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current);
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timerRef.current);
	}, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Game flow ──────────────────────────────────────────────────────────────

	function buildPool() {
		if (difficulty === "easy") {
			return POOL.filter((q) => q.level === "easy");
		}
		if (difficulty === "normal") {
			return POOL.filter((q) => q.level === "easy" || q.level === "normal");
		}
		// expert: guarantee at least 2 expert questions, rest from any level
		const expertPool = shuffle(POOL.filter((q) => q.level === "expert"));
		const otherPool = shuffle(POOL.filter((q) => q.level !== "expert"));
		const expertPick = expertPool.slice(0, 2);
		const otherPick = otherPool.slice(0, TOTAL_Q - 2);
		return shuffle([...expertPick, ...otherPick]);
	}

	function startGame() {
		// Pick questions according to difficulty
		const pool = buildPool();
		const picked = shuffle(pool)
			.slice(0, TOTAL_Q)
			.map((q) => ({
				...q,
				dir: Math.random() < 0.5 ? "tw2css" : "css2tw",
			}));
		clearInterval(timerRef.current);
		setQuestions(picked);
		setCurrIndex(0);
		setInput("");
		setInputState("idle");
		setHint("");
		setTimeLeft(TOTAL_TIME);
		setResults([]);
		setTimeTaken(0);
		setPhase("quiz");
	}

	function handleTimeUp() {
		setResults((prev) => {
			const skipped = questions
				.slice(prev.length)
				.map((q) => ({ ...q, status: "skipped", chosen: "" }));
			const final = [...prev, ...skipped];
			endGame(final);
			return final;
		});
	}

	function endGame(final) {
		clearInterval(timerRef.current);
		setTimeTaken(TOTAL_TIME - timeLeft);
		setResults(final);
		setPhase("results");
	}

	function goHome() {
		clearInterval(timerRef.current);
		setPhase("home");
	}

	// Saves the current result then moves to the next question (or ends the game)
	function recordAndAdvance(status) {
		const newResults = [
			...results,
			{ ...currentQuestion, status, chosen: input },
		];
		setResults(newResults);

		if (currIndex + 1 >= TOTAL_Q) {
			endGame(newResults);
		} else {
			setCurrIndex(currIndex + 1);
			setInput("");
			setInputState("idle");
			setHint("");
		}
	}

	// ── Input handlers ─────────────────────────────────────────────────────────

	function handleSubmit() {
		if (inputState === "correct" || !input.trim()) return;

		if (checkAnswer(input, correctAnswer)) {
			setInputState("correct");
			setHint("✓ Correct!");
			setTimeout(() => recordAndAdvance("correct"), 700);
		} else {
			setInputState("wrong");
			setHint("✗ Not quite, try again");
			setTimeout(() => {
				setInputState("idle");
				setHint("");
			}, 1000);
		}
	}

	function handlePass() {
		if (inputState === "correct") return;
		setHint(`Answer: ${correctAnswer}`);
		setTimeout(() => recordAndAdvance("passed"), 1400);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") handleSubmit();
		if (e.key === "Escape") handlePass();
	}

	function handleInputChange(e) {
		setInput(e.target.value);
		if (inputState === "wrong") setInputState("idle");
	}

	// ── Derived values for rendering ──────────────────────────────────────────

	const timerPercent = (timeLeft / TOTAL_TIME) * 100;
	const timerMod = timeLeft <= 30 ? "danger" : timeLeft <= 60 ? "warn" : "";
	const correctCount = results.filter((r) => r.status === "correct").length;
	const wrongCount = results.filter(
		(r) => r.status === "passed" || r.status === "wrong",
	).length;
	const finalScore = correctCount * 50 + Math.max(0, TOTAL_TIME - timeTaken);
	const hintClass = `hint${inputState === "correct" ? " ok" : inputState === "wrong" ? " bad" : hint ? " pass" : ""}`;

	const shareUrl = encodeURIComponent("https://www.csswind.com");
	const homeShareText = encodeURIComponent(
		`CSSwind — the CSS and Tailwind quiz. Test your Frontend knowledge!`,
	);
	const homeEmailSubject = encodeURIComponent(
		`CSSwind — the CSS and Tailwind quiz`,
	);
	const homeEmailBody = encodeURIComponent(
		`Hey, check out CSSwind — a quiz that tests your CSS and Tailwind knowledge!\n\nhttps://www.csswind.com`,
	);
	const homeShareLinks = {
		x: `https://twitter.com/intent/tweet?text=${homeShareText}&url=${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
		email: `mailto:?subject=${homeEmailSubject}&body=${homeEmailBody}`,
	};
	const shareText = encodeURIComponent(
		`I scored ${finalScore} on CSSwind (${difficulty} mode) — the CSS and Tailwind quiz. Can you beat me?`,
	);
	const emailSubject = encodeURIComponent(
		`I scored ${finalScore} on CSSwind — can you beat me?`,
	);
	const emailBody = encodeURIComponent(
		`I just scored ${finalScore} on CSSwind (${difficulty} mode) — the CSS and Tailwind quiz. Can you beat me?\n\nhttps://www.csswind.com`,
	);
	const shareLinks = {
		x: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
		email: `mailto:?subject=${emailSubject}&body=${emailBody}`,
	};

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<>
			<div className="page">
				<div className="wrap">
					<header className="hdr">
						<span className="logo" onClick={goHome}>
							<img src="/logo.svg" alt="" className="logo-img" />
							<span className="logo-accent">CSS</span>wind
						</span>
					</header>

					<main>
						{/* HOME */}
						{phase === "home" && (
							<>
								<section className="home-section">
									<div className="hero">
										<h1>
											Know your <em>Tailwind</em>?
										</h1>
										<p>
											Each question shows either a Tailwind class or a CSS value
											you type the other side from memory.
										</p>
										<p>10 questions · 2 minutes.</p>
									</div>

									<button
										className="btn btn-primary btn-play"
										onClick={startGame}
									>
										Play →
									</button>

									<div className="level-picker">
										{["easy", "normal", "expert"].map((lvl) => (
											<button
												key={lvl}
												className={`btn btn-level${difficulty === lvl ? " active" : ""}`}
												onClick={() => setDifficulty(lvl)}
											>
												{lvl}
											</button>
										))}
									</div>

									<div className="examples">
										<div className="example-row">
											<span className="example-dir">TW → CSS</span>
											<span className="example-prompt">flex-col</span>
											<span className="example-arrow">→</span>
											<span className="example-answer">
												flex-direction: column
											</span>
										</div>
										<div className="example-row">
											<span className="example-dir">CSS → TW</span>
											<span className="example-prompt">overflow: hidden</span>
											<span className="example-arrow">→</span>
											<span className="example-answer">overflow-hidden</span>
										</div>
									</div>

									<div className="card instr-card">
										<div className="instr-title">How it works</div>
										<ul className="instr-list">
											{[
												[
													"Mixed questions",
													"each round randomly mixes Tailwind → CSS and CSS → Tailwind questions.",
												],
												[
													"Submit with Enter",
													"if you're right, you move on. If wrong, try again as many times as you like.",
												],
												[
													"Pass with Esc",
													"skip the question, the correct answer is shown before moving on.",
												],
												[
													"Forgiving checking",
													"capitalisation, spaces around : and trailing semicolons are all ignored.",
												],
												[
													"Tailwind v3 CSS values",
													"Uses fixed values like 1rem rather than Tailwind v4's calc(var(--spacing) * 4).",
												],
											].map(([bold, rest]) => (
												<li key={bold} className="instr-item">
													<span className="instr-dot">//</span>
													<div>
														<strong>{bold}</strong>: {rest}
													</div>
												</li>
											))}
										</ul>
									</div>

									<div className="share-row">
										<span className="share-label">Share</span>
										<a
											className="share-btn"
											href={homeShareLinks.facebook}
											target="_blank"
											rel="noreferrer"
										>
											Facebook
										</a>
										<a
											className="share-btn"
											href={homeShareLinks.x}
											target="_blank"
											rel="noreferrer"
										>
											X
										</a>
										<a
											className="share-btn"
											href={homeShareLinks.linkedin}
											target="_blank"
											rel="noreferrer"
										>
											LinkedIn
										</a>{" "}
										<a className="share-btn" href={homeShareLinks.email}>
											Email
										</a>{" "}
									</div>

									<div className="book-promo">
										<span className="book-promo-label">
											Recommended reading
										</span>
										<a
											className="book-promo-link"
											href="https://theosoti.com/you-dont-need-js/?utm_source=csswind&utm_medium=referral&utm_campaign=home"
											target="_blank"
											rel="noreferrer"
										>
											<span className="book-title">
												You Don&rsquo;t Need JS
											</span>
											<span className="book-author">by Theo Soti</span>
										</a>
									</div>
								</section>

								<AdBanner />
							</>
						)}

						{/* QUIZ */}
						{phase === "quiz" && currentQuestion && (
							<>
								<div className="quiz-top">
									<div className="timer">
										<div className="timer-row">
											<span className="timer-label">Time</span>
											<span className={`timer-digits ${timerMod}`}>
												{formatTime(timeLeft)}
											</span>
										</div>
										<div className="timer-track">
											<div
												className={`timer-fill ${timerMod}`}
												style={{ width: `${timerPercent}%` }}
											/>
										</div>
									</div>

									<div className="dots">
										{questions.map((_, i) => {
											const result = results[i];
											const dotClass = result
												? result.status
												: i === currIndex
													? "active"
													: "";
											return <div key={i} className={`dot ${dotClass}`} />;
										})}
									</div>
								</div>

								<div className="quiz-card-wrap">
									<div className="card">
										<div className="q-meta">
											<span className="q-count">
												<strong>{currIndex + 1}</strong> / {TOTAL_Q}
											</span>
											<span className="q-badge">
												{isTW ? "tw → css" : "css → tw"}
											</span>
										</div>

										<div className="q-label">
											{isTW ? "Tailwind class" : "CSS property"}
										</div>
										<div className="q-prompt">
											{isTW ? currentQuestion.tw : currentQuestion.css}
										</div>

										<div className="a-label">
											{isTW
												? "Type the CSS property"
												: "Type the Tailwind class"}
										</div>
										<input
											ref={inputRef}
											className={`answer ${inputState}`}
											value={input}
											onChange={handleInputChange}
											onKeyDown={handleKeyDown}
											placeholder={isTW ? "e.g. display: flex" : "e.g. flex"}
											disabled={inputState === "correct"}
											spellCheck={false}
											autoComplete="off"
											autoCorrect="off"
											autoCapitalize="off"
										/>

										<div className={hintClass}>
											{hint || "Enter to submit · Esc to pass"}
										</div>

										<div className="btn-row">
											<button
												className="btn btn-primary"
												onClick={handleSubmit}
												disabled={inputState === "correct" || !input.trim()}
											>
												Submit ↵
											</button>
											<button
												className="btn btn-secondary"
												onClick={handlePass}
												disabled={inputState === "correct"}
											>
												Pass
											</button>
										</div>
									</div>
								</div>
							</>
						)}

						{/* RESULTS */}
						{phase === "results" && (
							<>
								<section className="results-section">
									<div className="card">
										<div className="r-header">
											<div className="r-score">
												<div className="r-score-label">Score</div>
												<span className="r-num">{finalScore}</span>
											</div>
											<div className="r-msg">{scoreMessage(correctCount)}</div>
										</div>

										<div className="stats">
											<div className="stat">
												<div className="stat-n green">{correctCount}</div>
												<div className="stat-l">Correct</div>
											</div>
											<div className="stat">
												<div className="stat-n red">{wrongCount}</div>
												<div className="stat-l">Passed</div>
											</div>
											<div className="stat">
												<div className="stat-n muted">
													{formatTime(timeTaken)}
												</div>
												<div className="stat-l">Time</div>
											</div>
										</div>

										<div className="share-row">
											<span className="share-label">Share Score</span>
											<a
												className="share-btn"
												href={shareLinks.facebook}
												target="_blank"
												rel="noreferrer"
											>
												Facebook
											</a>
											<a
												className="share-btn"
												href={shareLinks.x}
												target="_blank"
												rel="noreferrer"
											>
												X
											</a>

											<a
												className="share-btn"
												href={shareLinks.linkedin}
												target="_blank"
												rel="noreferrer"
											>
												LinkedIn
											</a>
											<a className="share-btn" href={shareLinks.email}>
												Email
											</a>
										</div>

										<div className="book-promo">
											<span className="book-promo-label">
												Recommended reading
											</span>
											<a
												className="book-promo-link"
												href="https://theosoti.com/you-dont-need-js/?utm_source=csswind&utm_medium=referral&utm_campaign=results"
												target="_blank"
												rel="noreferrer"
											>
												<span className="book-title">
													You Don&rsquo;t Need JS
												</span>
												<span className="book-author">by Theo Soti</span>
											</a>
										</div>

										<div className="btn-row">
											<button className="btn btn-ghost" onClick={goHome}>
												← Home
											</button>
											<button className="btn btn-primary" onClick={startGame}>
												Play again →
											</button>
										</div>
									</div>
								</section>
								<AdBanner />
							</>
						)}
					</main>
					<footer className="footer">
						<p>Not affiliated or endorsed by Tailwind Labs, Inc.</p>
						<p>
							© {new Date().getFullYear()}{" "}
							<a href="http://www.suedeapple.co.uk" target="_blank">
								suedespple
							</a>{" "}
							|{" "}
							<a
								href="https://github.com/suedeapple/csswind"
								target="_blank"
								rel="noreferrer"
							>
								GitHub{" "}
							</a>
						</p>
					</footer>
				</div>
			</div>
		</>
	);
}
