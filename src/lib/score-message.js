function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function scoreMessage(correct) {
	if (correct === 10)
		return pick([
			"Flawless. Both Kevin Powell and Adam Wathan are proud.",
			"Basically a Tailwind compiler at this point.",
			"Amazing. Did you have the docs open in another tab?",
			"Adam Wathan wants to hire you.",
			"Perfect score. You don't use autocomplete, do you?",
			"10 out of 10. The CSS gods bow.",
		]);
	if (correct === 9)
		return pick([
			"9 out of 10. One class escaped. It won't next time.",
			"So close. The missing point is haunting you, isn't it.",
			"Nearly perfect. Your muscle memory is almost there.",
			"9/10. A rounding error away from greatness.",
			"One away from flawless. Infuriating, isn't it?",
			"Silver medal CSS. Still incredibly impressive.",
		]);
	if (correct >= 8)
		return pick([
			"Certified CSS nerd. Wear it with pride.",
			"Excellent recall and blistering speed!",
			"Your brain loads faster than most websites.",
			"Really solid. Your brain is a stylesheet.",
			"Great work. Tailwind would be proud. Probably.",
			"8 out of 10. The stylesheet gods nod approvingly.",
		]);
	if (correct === 7)
		return pick([
			"7/10. Solid. The other 3 are just `flex` in a trenchcoat.",
			"Seven correct. Your CSS is stronger than your doubt.",
			"Good stuff. 7 classes mastered, 3 still plotting against you.",
			"7 out of 10. You're in the top half. Comfortably.",
			"Not bad at all. 7 is respectable territory.",
			"7/10. IntelliSense is starting to feel threatened.",
		]);
	if (correct >= 6)
		return pick([
			"Strong score. The utility classes respect you.",
			"Good effort. Still faster than reading the docs.",
			"Solid. A few classes still hiding from you.",
			"Not bad. Your co-workers are impressed (probably).",
			"Decent. You know enough to be dangerous.",
			"More than half right. IntelliSense is nervous.",
		]);
	if (correct === 5)
		return pick([
			"Exactly half. A coin flip with knowledge.",
			"5/10. You're at the crossroads of CSS enlightenment.",
			"Middle of the pack. The median is not the destination.",
			"5 right. The other 5 are just waiting to be learned.",
			"Half credit. CSS giveth and CSS taketh away.",
			"5 out of 10. The stylesheet is on the fence about you.",
		]);
	if (correct >= 4)
		return pick([
			"Getting there. Keep grinding.",
			"Statistically, not terrible.",
			"Did you Four-get some answers?",
			"Keep going. You're in the learning zone.",
			"A work in progress. Like most stylesheets.",
			"The docs are your friend. Use them.",
		]);
	if (correct === 3)
		return pick([
			"3/10. A foundation. A very small one.",
			"Three correct. The other seven are just warming up.",
			"You got 3. That's 30%. CSS curves don't exist, sorry.",
			"3 out of 10. The docs miss you. Visit them sometime.",
			"Progress! Probably. At least it's not 2.",
			"3 right. The stylesheet is rooting for you. Quietly.",
		]);
	if (correct >= 2)
		return pick([
			"Some good answers in there somewhere.",
			"You tried. The effort was visible.",
			"Hey, you showed up. That's step one.",
			"Somewhere out there, a CSS class is crying.",
			"Have you tried reading the Tailwind docs? Just once?",
			"We all started somewhere. Keep at it!",
		]);
	if (correct === 1)
		return pick([
			"One correct answer. The only way is up.",
			"Try Googling next time.",
			"Yes, centering a div is hard. Keep at it.",
			"Have you considered a career in backend?",
			"The bravery to even try — noted.",
			"One out of ten. The journey begins.",
		]);
	return pick([
		"Did the cat walk over your keyboard?",
		"Zero correct. The world stares back.",
		"Did you try typing the question as the answer?",
		"CSS is hard. This quiz is hard. Don't give up!",
		"Take up Backend development instead.",
		"Uh oh! Better brush up on your CSS and Tailwind basics.",
	]);
}
