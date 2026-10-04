let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
    return notes.filter(note =>
        note.text.toLowerCase().includes(word.toLowerCase())
    )
}
console.log(searchNotes("study"));
console.log(searchNotes("spaceship"));

function longestNote(arr = notes) {
    if (arr.length === 0) {
        return null;
    }
    let longest = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i].text.length > longest.text.length) {
            longest = arr[i];
        }
    }
    return longest;
}
console.log(longestNote());
console.log(longestNote([]));

function countByCategory(arr = notes) {
    let counts = {};

    for (let note of arr) {
        if (counts[cat] {
            counts[cat] += 1;
        } else {
            counts[cat] = 1;
        }
    }

    return counts;
}

console.log(countByCategory());
console.log(countByCategory([]));

function getSummary() {
    let counts = countByCategory();
    let totalNotes = notes.length;
    let noteLabel = notes.length === 1 ? "note" : "notes";
    let parts = [];
    for (let category in counts) {
        parts.push(`${counts[category]} ${category}`);
    }
    return `${totalNotes} ${noteLabel} (${parts.join(", ")})`;
}
console.log(getSummary());
let tempNotes = notes;
notes = [{id:1, text: "Only one note", category: "personal"}];
console.log(getSummary());
notes = tempNotes; 

function isDuplicateNote(text) {
    const normalize =(str) => str.trim().toLowerCase().replace(/\s+/g, ' ');
    let cleanedInput = normalize(text)
    return notes.some(note => normalize(note.text) === cleanedInput);
}

function addNote(text, category) {
    if (!text|| text.length <1 || text.length > 200){
        console.log("Validation failed: Note text must be between 1 and 200 characters.");
    }
    const validCategories = ["personal", "work", "study"];
    if (!validCategories.includes(category)) {
        console.log(`Validation failed: '${category}' is not a valid category. Use personal, work, or study.`);
        return false;
    }
if (isDuplicateNote(text)) {
    console.log("Validation failed: A note with the same text already exists.");
    return false;
}
let newId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;
let newNote = {
    id: newId,
    text: text,
    category: category
}
notes.push(newNote);
return newNote;
console.log("Success: Note added successfully.");
}
