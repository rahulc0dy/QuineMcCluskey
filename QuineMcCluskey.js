// quine_mcclusky.js

function diffByOneBit(term1, term2) {
    let differingBitCount = 0;
    let mismatchIndex = -1;

    for (let i = 0; i < term1.length; i++) {
        if (term1[i] !== term2[i]) {
            mismatchIndex = i;
            differingBitCount += 1;

            if (differingBitCount > 1) {
                return [false, null];
            }
        }
    }

    return [true, mismatchIndex];
}

function listConvert(dictionary) {
    let convertedList = [];

    for (let key in dictionary) {
        if (dictionary.hasOwnProperty(key)) {
            convertedList = convertedList.concat(dictionary[key]);
        }
    }

    return convertedList;
}

function findMinterms(implicant) {
    let dash = implicant.split("_").length - 1;

    if (dash === 0) {
        return [parseInt(implicant, 2).toString()];
    }

    let num = Array.from({ length: Math.pow(2, dash) }, (_, i) =>
        i.toString(2).padStart(dash, "0")
    );
    let temp = [];

    for (let i = 0; i < Math.pow(2, dash); i++) {
        let temp1 = implicant;

        let index = -1;
        for (let j of num[i]) {
            if (index !== -1) {
                index += temp1.substring(index + 1).indexOf("_") + 1;
            } else {
                index = temp1.substring(index + 1).indexOf("_");
            }
            temp1 = temp1.substring(0, index) + j + temp1.substring(index + 1);
        }

        temp.push(parseInt(temp1, 2).toString());
    }

    return temp;
}

function removeDontCares(minTerms, dontCares) {
    let result = [];

    for (let term of minTerms) {
        if (!dontCares.includes(parseInt(term))) {
            result.push(term);
        }
    }

    return result;
}

// quine_mcclusky.js (continued)

function essentialPrimeImplicants(table) {
    let epi = [];

    for (let term in table) {
        if (table.hasOwnProperty(term)) {
            if (table[term].length === 1 && !epi.includes(table[term][0])) {
                epi.push(table[term][0]);
            }
        }
    }

    return epi;
}

function removeTerms(table, terms) {
    if (!terms) {
        return;
    }

    for (let term of terms) {
        for (let j of findMinterms(term)) {
            delete table[j];
        }
    }
}

function coveringPrimeImplicants(table) {
    let coveringPi = {};

    for (let terms in table) {
        if (table.hasOwnProperty(terms)) {
            for (let term of table[terms]) {
                if (!coveringPi[term]) {
                    coveringPi[term] = [terms];
                } else {
                    coveringPi[term].push(terms);
                }
            }
        }
    }

    let nonEssentialPi = [];

    for (let key1 in coveringPi) {
        if (coveringPi.hasOwnProperty(key1)) {
            for (let key2 in coveringPi) {
                if (
                    key1 !== key2 &&
                    isSubset(coveringPi[key1], coveringPi[key2])
                ) {
                    if (arraysEqual(coveringPi[key1], coveringPi[key2])) {
                        if (
                            !nonEssentialPi.includes(key1) &&
                            !nonEssentialPi.includes(key2)
                        ) {
                            nonEssentialPi.push(key2);
                            continue;
                        } else {
                            continue;
                        }
                    }
                    nonEssentialPi.push(key1);
                }
            }
        }
    }

    for (let key of nonEssentialPi) {
        delete coveringPi[key];
    }

    return Object.keys(coveringPi);
}

function isSubset(arr1, arr2) {
    return arr1.every((elem) => arr2.includes(elem));
}

function arraysEqual(arr1, arr2) {
    return (
        arr1.length === arr2.length &&
        arr1.every((value, index) => value === arr2[index])
    );
}

function makeExpression(epi) {
    let result = "";
    let temp = "";

    for (let term of epi) {
        for (let index = 0; index < term.length; index++) {
            if (term[index] === "1") {
                temp += String.fromCharCode(65 + index);
            } else if (term[index] === "0") {
                temp += String.fromCharCode(65 + index) + "'";
            }
        }
        result += temp + " + ";
        temp = "";
    }

    return result.slice(0, -3); // Remove the trailing " + "
}

function quineMcclusky(minterms, dontCare) {
    let allTerms = minterms.concat(dontCare);
    allTerms.sort();

    let size = Math.max(...minterms).toString(2).length;

    let groups = {};

    for (let term of allTerms) {
        let count = term.toString(2).split("1").length - 1;
        groups[count]
            ? groups[count].push(term.toString(2).padStart(size, "0"))
            : (groups[count] = [term.toString(2).padStart(size, "0")]);
    }

    let primeImplicants = new Set();

    while (true) {
        let temp = { ...groups };
        groups = {};
        let count = 0;
        let marked = new Set();
        let stop = true;

        let keyList = Object.keys(temp).sort((a, b) => a - b);

        for (let i = 0; i < keyList.length - 1; i++) {
            for (let term1 of temp[keyList[i]]) {
                for (let term2 of temp[keyList[i + 1]]) {
                    let result = diffByOneBit(term1, term2);
                    if (result[0]) {
                        let string =
                            term1.slice(0, result[1]) +
                            "_" +
                            term1.slice(result[1] + 1);
                        groups[count]
                            ? groups[count].push(string)
                            : (groups[count] = [string]);
                        stop = false;
                        marked.add(term1);
                        marked.add(term2);
                    }
                }
            }
            count += 1;
        }

        let unmarked = new Set(
            listConvert(temp).filter((term) => !marked.has(term))
        );
        primeImplicants = new Set([...primeImplicants, ...unmarked]);

        if (stop) break;
    }

    let chart = {};

    for (let term of primeImplicants) {
        let mergedMinterms = findMinterms(term);

        for (let t of removeDontCares(mergedMinterms, dontCare)) {
            chart[t] ? chart[t].push(term) : (chart[t] = [term]);
        }
    }

    let EPI = essentialPrimeImplicants(chart);

    if (EPI.length === 0) {
        for (let term in chart) {
            if (chart.hasOwnProperty(term)) {
                EPI.push(chart[term][0]);
                break;
            }
        }

        removeTerms(chart, EPI);
        EPI.push(...essentialPrimeImplicants(chart));
        removeTerms(chart, EPI);
        EPI.push(...coveringPrimeImplicants(chart));
        return makeExpression(EPI);
    } else {
        removeTerms(chart, EPI);
        EPI.push(...coveringPrimeImplicants(chart));
    }

    return makeExpression(EPI).length == 0 ? 1 : makeExpression(EPI);
}

console.log(quineMcclusky([2, 3, 4, 5], []));

export {
    quineMcclusky,
    makeExpression,
    arraysEqual,
    isSubset,
    coveringPrimeImplicants,
    essentialPrimeImplicants,
    removeDontCares,
    removeTerms,
    findMinterms,
    listConvert,
    diffByOneBit,
};
