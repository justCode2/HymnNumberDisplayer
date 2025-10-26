// Function to create and update the floating display
function createHymnNumberDisplay () {
  // Get selected languages from storage
  chrome.storage.sync.get(
    {
      selectedLanguages: ['E30'] // Default to English if no languages are selected
    },
    function (items) {
      // Create the container if it doesn't exist
      let display = document.getElementById('hymn-number-display')
      if (!display) {
        display = document.createElement('div')
        display.id = 'hymn-number-display'
        display.className = 'hymn-number-display'
        document.body.appendChild(display)
      }

      const selectedLanguages = items.selectedLanguages
      let numbersHTML = ''
      let hasNumbers = false

      // Find and display numbers for each selected language
      selectedLanguages.forEach(language => {
        // Find the span element that has this language name in its title attribute
        let label = document.querySelector(`span[title="${language}"]`)

        if (label) {
          // Use whatever number is in the span
          const number = label.textContent.trim()
          numbersHTML += `<div class="hymn-number" title="${language}">${number}</div>`
          hasNumbers = true
        } else {
          label = document.querySelector(`a[title="${language}"]`)
          if (label) {
            // Use whatever number is in the span
            const number = label.textContent.trim()
            numbersHTML += `<div class="hymn-number" title="${language}">${number}</div>`
            hasNumbers = true
          }
        }
      })

      // Update the display
      display.innerHTML = numbersHTML

      // Hide the display if no numbers are found
      display.style.display = hasNumbers ? 'flex' : 'none'

      // Adjust size based on number of languages
      const numberCount = selectedLanguages.length
      const fontSize = Math.max(14, Math.min(18, 48 / numberCount)) // Min 14px, Max 18px
      const displayItems = display.querySelectorAll('.hymn-number')
      displayItems.forEach(item => {
        item.style.fontSize = `${fontSize}px`
      })
    }
  )
}

// Function to debounce the update
function debounce (func, wait) {
  let timeout
  return function executedFunction (...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Create debounced version of the display update
const debouncedUpdate = debounce(createHymnNumberDisplay, 250)

// Run when the page loads
window.addEventListener('load', createHymnNumberDisplay)

// Watch for dynamic changes in the page
const observer = new MutationObserver(mutations => {
  // Only update if the mutations affect the relevant elements
  const shouldUpdate = mutations.some(mutation => {
    return Array.from(mutation.addedNodes).some(node => {
      if (node.nodeType !== 1) return false
      // Check for any language label
      return node.querySelector('span[class*="label"]')
    })
  })

  if (shouldUpdate) {
    debouncedUpdate()
  }
})

// Start observing the document with more specific parameters
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: false,
  attributes: false
})
