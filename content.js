// Function to create and update the floating display
function createHymnNumberDisplay() {
    // Create the container if it doesn't exist
    let display = document.getElementById('hymn-number-display');
    if (!display) {
        display = document.createElement('div');
        display.id = 'hymn-number-display';
        display.className = 'hymn-number-display';
        document.body.appendChild(display);
    }

    // Find the hymn numbers
    const labels = document.querySelectorAll('span[title="Burmese"], span[title="English"]');
    let burmeseNumber = null;
    let englishNumber = null;

    labels.forEach(label => {
        const titleAttr = label.getAttribute('title');
        if (titleAttr === 'Burmese') {
            burmeseNumber = label.textContent;
        } else if (titleAttr === 'English') {
            englishNumber = label.textContent;
        }
    });

    // Update the display
    display.innerHTML = `
        ${burmeseNumber ? `<div class="hymn-number burmese-number">${burmeseNumber}</div>` : ''}
        ${englishNumber ? `<div class="hymn-number english-number">${englishNumber}</div>` : ''}
    `;

    // Hide the display if no numbers are found
    if (!burmeseNumber && !englishNumber) {
        display.style.display = 'none';
    } else {
        display.style.display = 'flex';
    }
}

// Function to debounce the update
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create debounced version of the display update
const debouncedUpdate = debounce(createHymnNumberDisplay, 250);

// Run when the page loads
window.addEventListener('load', createHymnNumberDisplay);

// Watch for dynamic changes in the page
const observer = new MutationObserver((mutations) => {
    // Only update if the mutations affect the relevant elements
    const shouldUpdate = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
            return node.nodeType === 1 && (
                node.querySelector('span[title="Burmese"]') ||
                node.querySelector('span[title="English"]')
            );
        });
    });

    if (shouldUpdate) {
        debouncedUpdate();
    }
});

// Start observing the document with more specific parameters
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false
});