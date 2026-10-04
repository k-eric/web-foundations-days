let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
function searchNotes(word) {
    return notes.filter(note => 
        note.text.toLowerCase().includes(word.toLowerCase())
    );
}

// Tests with expected output comments
console.log(searchNotes("study")); 
// Expected output: [ { id: 2, text: 'Finish the Day 3 assignment', category: 'study' }, { id: 4, text: 'Revise JavaScript arrays', category: 'study' } ]

console.log(searchNotes("spaceship")); 
// Expected output: []


// 2. longestNote()
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
// Expected output: { id: 3, text: 'Email the project report to Grace', category: 'work' }

console.log(longestNote([])); 
// Expected output: null


// 3. countByCategory() - Syntax fixed with proper closing parenthesis
function countByCategory(arr = notes) {
    let counts = {};
    for (let note of arr) {
        let cat = note.category;
        if (counts[cat]) { // Fixed: added proper syntax
            counts[cat] += 1;
        } else {
            counts[cat] = 1;
        }
    }
    return counts;
}

console.log(countByCategory()); 
// Expected output: { personal: 2, study: 2, work: 1 }

console.log(countByCategory([])); 
// Expected output: {}


// 4. getSummary()
function getSummary() {
    let counts = countByCategory();
    let totalNotes = notes.length;
    let noteLabel = totalNotes === 1 ? "note" : "notes";
    
    let parts = [];
    for (let category in counts) {
        parts.push(`${counts[category]} ${category}`);
    }
    
    return `${totalNotes} ${noteLabel}: ${parts.join(", ")}.`;
}

console.log(getSummary()); 
// Expected output: "5 notes: 2 personal, 2 study, 1 work."


// 5. isDuplicate(text) - Renamed from isDuplicateNote to match instructions
function isDuplicate(text) {
    const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, " ");
    let cleanedInput = normalize(text);
    return notes.some(note => normalize(note.text) === cleanedInput);
}

console.log(isDuplicate("  BUY milk and  bread ")); 
// Expected output: true

console.log(isDuplicate("Learn advanced TypeScript")); 
// Expected output: false


// 6. addNote(text, category) - Added return false and fixed success log placement
function addNote(text, category) {
    if (!text || text.length < 1 || text.length > 200) {
        console.log("Validation failed: Note text must be between 1 and 200 characters.");
        return false; // Stops execution on invalid length
    }
    
    const validCategories = ["personal", "work", "study"];
    if (!validCategories.includes(category)) {
        console.log(`Validation failed: '${category}' is not a valid category.`);
        return false; // Stops execution on invalid category
    }
    
    if (isDuplicate(text)) {
        console.log("Validation failed: A note with this text already exists.");
        return false; // Stops execution on duplicate
    }
    
    let newId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;
    let newNote = {
        id: newId,
        text: text,
        category: category
    };
    
    notes.push(newNote);
    console.log("Success: Note added!"); // Placed before return so it actually prints
    return true;
}

console.log(addNote("Practice JavaScript loops", "study")); 
// Expected output: true

console.log(addNote("Buy milk and bread", "personal")); 
// Expected output: false