// Function to create and update the floating display
function createHymnNumberDisplay () {
  // Get selected languages from storage
  chrome.storage.sync.get(
    {
      selectedLanguages: ['English'] // Default to English if no languages are selected
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
      let englishNumber = null

      // Find and display numbers for each selected language
      selectedLanguages.forEach(language => {
        // Find the span element that has this language name in its title attribute
        let label = document.querySelector(`span[title="${language}"]`) || document.querySelector(`a[title="${language}"]`)
        let number = null

        if (label) {
          // Use whatever number is in the span
          number = label.textContent.trim()
          hasNumbers = true
        }

        // If Burmese is selected but not found, try concordance lookup
        if (!number && language === 'Burmese') {
          // First, try to find the English hymn number
          if (!englishNumber) {
            let englishLabel = document.querySelector('span[title="English"]') || document.querySelector('a[title="English"]')
            if (englishLabel) {
              englishNumber = parseInt(englishLabel.textContent.trim())
            } 
          }

          // If we have the English number, look it up in the concordance
          if (englishNumber && typeof lookupBurmeseNumber === 'function') {
            const concordanceNumber = lookupBurmeseNumber(englishNumber)
            if (concordanceNumber) {
              number = concordanceNumber.toString()
              hasNumbers = true
            }
          }
        }

        if (number) {
          numbersHTML += `<div class="hymn-number" title="${language}">${number}</div>`
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
