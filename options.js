const MAX_LANGUAGES = 4;

// Handles checkbox changes
function handleCheckboxChange(event) {
  const checkbox = event.target;
  const selectedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
  
  if (selectedCount > MAX_LANGUAGES && checkbox.checked) {
    checkbox.checked = false;
    const status = document.getElementById('status');
    status.textContent = `Maximum ${MAX_LANGUAGES} languages allowed`;
    status.style.color = '#ff0000';
    status.style.display = 'block';
    setTimeout(function() {
      status.style.display = 'none';
      status.style.color = '#4CAF50';
      status.textContent = 'Settings saved!';
    }, 2000);
    return;
  }
}

// Save the selected languages to chrome.storage
function saveOptions() {
  const selectedLanguages = Array.from(document.querySelectorAll('input[type="checkbox"]'))
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  chrome.storage.sync.set({
    selectedLanguages: selectedLanguages
  }, function() {
    // Show the "Settings saved!" message
    const status = document.getElementById('status');
    status.style.display = 'block';
    setTimeout(function() {
      status.style.display = 'none';
    }, 2000);
  });
}

// Restore the saved language selections
function restoreOptions() {
  chrome.storage.sync.get({
    selectedLanguages: ['English'] // Default to English if no languages are selected
  }, function(items) {
    const languages = items.selectedLanguages;
    languages.forEach(lang => {
      const checkbox = document.getElementById(lang);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  // Add change event listeners to all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
});
document.getElementById('save').addEventListener('click', saveOptions);