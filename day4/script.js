const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Function to update character and word counts + warning classes
function updateCounts() {
    const text = noteText.value;
    const currentLength = text.length;
    
    // Word count calculation (split by spaces and filter out empty strings)
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    // Update text displays
    charCount.textContent = `${currentLength} / 200 characters`;
    wordCount.textContent = `${words} words`;

    // Manage warning and over classes based on character limits
    charCount.classList.remove("warning", "over");
    if (currentLength > 200) {
        charCount.classList.add("over");
    } else if (currentLength > 180) {
        charCount.classList.add("warning");
    }
}

// Save draft and update counts on every input event
noteText.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem("noteDraft", noteText.value);
});

// Clear functionality (used by button and Escape key)
function clearNotes() {
    noteText.value = "";
    localStorage.removeItem("noteDraft");
    updateCounts();
}

clearBtn.addEventListener("click", clearNotes);

// Pressing Escape inside the textarea clears it
noteText.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        clearNotes();
    }
});

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Page load initialization: restore saved draft and theme preferences
window.addEventListener("DOMContentLoaded", () => {
    // Restore text draft
    const savedDraft = localStorage.getItem("noteDraft");
    if (savedDraft !== null) {
        noteText.value = savedDraft;
    }

    // Restore theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "Light mode";
    } else {
        themeToggle.textContent = "Dark mode";
    }

    // Initialize counts on load
    updateCounts();
});