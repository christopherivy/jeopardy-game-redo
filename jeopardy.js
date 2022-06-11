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

let gameBody = $("#game-body").get()[ 0 ];
let button = document.getElementById("reset-game");
let board = document.getElementById("board");

//Add handlers for the body and button
gameBody.addEventListener("click", function (e) {
	handleClick(e);
});

button.addEventListener("click", function (e) {
	e.preventDefault();
	setupAndStart();
});



//Shuffle the categories
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

/** 
 *  Gets a random number (NUM_CATEGORIES) categories from the API. 
 *  Returns: An array of category ids
 */
async function getCategoryIds () {

	//hit the api for a a group of categories
	let res = await axios.get(`${J_API}/api/categories/?count=${MAX_QUESTIONS}`);

	//shuffle the random categories
	let categoryIds = res.data.map((category) => category.id);
	let randomIds = shuffle(categoryIds);


	return randomIds.slice(0, NUM_CATEGORIES); //this returns an array [5412, 11496, 11498, 11499, 11504, 11544]
}

/** 
 *	Gets the data about a category
 *  Returns: object with category data 
 *  Example: { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory (catId) {

	//hit the api for data about the category id
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
	//get table header and add a row
	let header = $("#game-header").get()[ 0 ];

	//clear any out existing cards
	header.innerText = '';
	gameBody.innerText = '';


	//if there is a current board wipe it out
	header.innerText = '';

	//get cat ids
	let catIds = await getCategoryIds();


	//attaching the headerrow to the header
	let headerRow = document.createElement("tr");
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

	//change the start button to a restart button
	hideLoadingView();
	button.innerText = "New Game";


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

	//if they click in the body without getting a cell, do nothing
	if(!evt.target.classList.contains("clueCell")) return;

	//if there isnt another layer, do nothing
	if(evt.target.nextSibling == null || evt.target.nextSibling === undefined) return;

	//hide the current layer and show the one underneath
	evt.target.classList.add("hidden");
	evt.target.nextSibling.classList.remove("hidden");
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView () {
	//the board should be hidden and a spinner should show	
	console.log(board);
	board.classList.add('hidden');
	$('#loading').removeClass('hidden');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView () {
	//show the board, hide the spinner
	board.classList.remove('hidden');
	$('#loading').addClass('hidden');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart () {
	showLoadingView();

	//getting random category ids
	let categoryIds = await getCategoryIds();
	// console.log(categoryIds);

	//create html table
	await fillTable();


}
