import * as QM from "./QuineMcCluskey.js";

const minTerms = document.getElementById("minTerms");
const dontCares = document.getElementById("dontCares");
const result = document.getElementById("result");

document
    .getElementById("submit-button")
    .addEventListener("click", (e) => handleSubmit(e));
const handleSubmit = (e) => {
    e.preventDefault();
    if (minTerms.value.length == 0) result.innerText = "Please enter min terms";
    else
        result.innerText = QM.quineMcclusky(
            minTerms.value.split(",").map((elem) => parseInt(elem)),
            dontCares.value.split(",").map((elem) => parseInt(elem))
        );
    result.scrollIntoView();
};
