let ids = [];
let categories = [
    // {title: "", clue: "", question: "", answer: "", showing: null},
];
const BASE_URL = "http://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const $thead = $("thead");
const $tbody = $("tbody");

async function startGame() {
    if ($("#start").text() === "Restart") {
        location.reload();
    }
    $("#spin-container").show();
    await makeBoard();
    $("#start").text("Restart");
}

function randomizeId(categories) {

    for (let i = categories.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [categories[i], categories[j]] = [categories[j], categories[i]];
    }

}

async function getCategoryTitle(id) {

    const response = await axios.get(`${BASE_URL}/category?id=${id}`);
    let categoryTitle = response.data;

    // titles.push(categoryTitle.title);
    categories.push({
        title: categoryTitle.title,
        clues: [],
        });

    let index = categories.length - 1;
    for (let i=0; i<NUM_QUESTIONS_PER_CAT; i++) {
        let clue = categoryTitle.clues[i];
        categories[index].clues.push({
            question: clue.question,
            answer: clue.answer,
            showing: null
        });
    }

    console.log(categoryTitle.title);
    return categoryTitle.title;
}

async function fillTable() {

    $("#spin-container").hide();
    let $headtr = $("<tr>");

    // get category title from API, and append to table header
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        await getCategoryTitle(ids[i]);
        let newTh = $(`<th>${categories[i].title}</th>`).attr("id", `${ids[i]}`);
        $headtr.append(newTh);
    }
    $thead.append($headtr);

    // Append td to table body with text "?"
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        let $bodytr = $("<tr>");
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            $bodytr.append($("<td>").attr("id", `${i}-${j}`).text("?"));
        }
        $tbody.append($bodytr);
    }
}

async function makeBoard() {
    console.log("making game")

    // get random category ids from API with count of 100
    const response = await axios.get(`${BASE_URL}/categories?count=100`);
    let categoryMap = response.data.map((category) => category.id);

    // randomize category ids and store them in ids[]
    randomizeId(categoryMap);
    ids = categoryMap.slice(0, NUM_CATEGORIES);
    console.log(ids);
    
    fillTable();
}

// handle clicking on a clue: show the question or answer
async function clueClicked(evt) {
    
    // get id of td from DOM
    let $td = $(evt.target);
    let id = $td.attr("id");
    let [row, col] = id.split("-");
    let clue = categories[col].clues[row];

    // show the question or answer, depending on state of clue
    if (clue.showing === null) {
        clue.showing = "question";
        $td.text(clue.question);
    } else if (clue.showing === "question") {
        clue.showing = "answer";
        $td.text(clue.answer);
    };
}

// when start button is clicked, makeBoard is called
$("#start").on("click", startGame);

// when a td is clicked, clueClicked is called
$(async function() {
    $("#jeopardy").on("click", "td", clueClicked);
})