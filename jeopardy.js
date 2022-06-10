// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const J_API = "http://jservice.io";
let categories = [];
const MAX_QUESTIONS = 100;
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;



//comment this
function shuffle (array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while(0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[ array[ currentIndex ], array[ randomIndex ] ] = [
			array[ randomIndex ],
			array[ currentIndex ],
		];
	}

	return array;
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds () {
	let res = await axios.get(`${J_API}/api/categories/?count=${MAX_QUESTIONS}`);

	//array object
	let categoryIds = res.data.map((category) => category.id);
	let randomIds = shuffle(categoryIds);

	return randomIds.slice(0, NUM_CATEGORIES); //this returns an array [5412, 11496, 11498, 11499, 11504, 11544]
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory (catId) {
	let res = await axios.get(`${J_API}/api/category?id=${catId}`);

	let category = res.data;
	let clues = category.clues.map((clue) => {
		return { question: clue.question, answer: clue.answer, showing: null };
	});
	// console.log({ title: category.title, clues: clues, showing: null });

	return { title: category.title, clues: clues }; //this returns an obj
}

/** Fill the HTML table #jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable () {
	//get cat ids
	let catIds = await getCategoryIds();

	//get table header and add a row
	let header = $("#game-header").get()[ 0 ];
	let headerRow = document.createElement("tr");

	//attaching the headerrow to the header
	header.append(headerRow);

	//put empty rows in the table body
	for(let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
		//inserting table row
		let tr = document.createElement("tr");

		//giving the tr an id using its index
		tr.setAttribute("id", `row-${i}`);

		//adding the tr to the body
		gameBody.append(tr);
	}

	//loop thru the catIds
	for(let categoryIndex in catIds) {
		let categoryId = catIds[ categoryIndex ];

		//getcat using current catid for titles/clues
		let category = await getCategory(categoryId);

		//creating the th(title) for the header
		let th = document.createElement("th");
		th.innerText = category.title.toUpperCase();
		th.classList.add(categoryIndex);
		headerRow.append(th);

		//loop thru to make questions body with td's
		for(let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
			let question = category.clues[ i ].question;
			let answer = category.clues[ i ].answer;

			//create a new td for this question
			let td = document.createElement("td");


			let unansweredDiv = document.createElement("div");
			unansweredDiv.classList.add("clueCell");
			unansweredDiv.innerText = "?";

			// create the div for the ques
			let questionDiv = document.createElement("div");
			questionDiv.classList.add("question", "clueCell", "hidden");
			questionDiv.innerText = question;

			//create the div for the ans
			let answerDiv = document.createElement("div");
			answerDiv.classList.add("answer", "clueCell", "hidden");
			answerDiv.innerText = answer;

			//append
			td.append(unansweredDiv);
			td.append(questionDiv);
			td.append(answerDiv);

			//put question txt into the td
			// td.innerText = category.clues[i].question;

			//targeting the row with the same index
			let row = $(`#row-${i}`);

			//append the question td to the row that matches the id
			row.append(td);

			// console.log(category.title, category.clues[i].question);
		}
	}
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick (evt) {
	evt.preventDefault();

	if(evt.target.tagName === "TD") return;

	// if(evt.target.classList.length === 3) return;


	evt.target.classList.add("hidden");
	if(evt.target.nextSibling.classList === undefined) return;

	// console.log(evt.target.nextSibling.classList);
	console.log(evt.target, 'target');
	evt.target.nextSibling.classList.remove("hidden");


}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView () {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView () { }

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart () {
	//getting random category ids
	let categoryIds = await getCategoryIds();
	// console.log(categoryIds);

	//create html table
	await fillTable();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

//target the body element
let gameBody = $("#game-body").get()[ 0 ];
gameBody.addEventListener("click", function (e) {
	handleClick(e);
});

let button = document.getElementById("reset-game");
button.addEventListener("click", function (e) {
	e.preventDefault();
	setupAndStart();
});