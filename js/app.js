// ---------------------------
// Tab Switching & Local Storage
// ---------------------------

// Function to switch active tab
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.id === tabId);
    });
  
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabId);
    });
  }
  
  // Setup tab click listeners
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', () => {
      switchTab(link.getAttribute('data-tab'));
    });
  });
  
  // Save checkbox state in localStorage (client-only)
  function saveState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
      localStorage.setItem(box.id, box.checked);
    });
    saveStateToBackend(); // Also save to backend
  }
  
  // Load checkbox state from localStorage (client-only)
  function loadState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
      const stored = localStorage.getItem(box.id);
      if (stored !== null) {
        box.checked = (stored === 'true');
      }
    });
  }
  
  // Attach change listeners to all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.addEventListener('change', saveState);
  });
  
  // ---------------------------
  // Backend Integration (Shared State Approach)
  // ---------------------------
  
  // With the shared state approach, we do not send a userId to the backend.
  async function saveStateToBackend() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let stateData = {};
    checkboxes.forEach(box => {
      stateData[box.id] = box.checked;
    });
  
    try {
      const response = await fetch('/.netlify/functions/saveState', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: stateData }) // no userId needed
      });
      const result = await response.json();
      console.log('State saved to backend:', result);
    } catch (error) {
      console.error('Error saving state to backend:', error);
    }
  }
  
  async function loadStateFromBackend() {
    try {
      const response = await fetch('/.netlify/functions/getState'); // no userId needed
      const result = await response.json();
      console.log('Loaded state:', result);
  
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(box => {
        if (result.state && result.state.hasOwnProperty(box.id)) {
          box.checked = result.state[box.id];
        }
      });
    } catch (error) {
      console.error('Error loading state from backend:', error);
    }
  }
  
  async function deleteStateFromBackend() {
    try {
      const response = await fetch('/.netlify/functions/deleteState', { // no userId needed
        method: 'DELETE'
      });
      const result = await response.json();
      console.log('State deleted from backend:', result);
  
      // Reset UI by unchecking all checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(box => box.checked = false);
    } catch (error) {
      console.error('Error deleting state from backend:', error);
    }
  }
  
  // Add reset button event listener if the element exists
  document.addEventListener("DOMContentLoaded", () => {
    loadStateFromBackend();
  
    const resetButton = document.getElementById("resetButton");
    if (resetButton) {
      resetButton.addEventListener("click", deleteStateFromBackend);
    }
  });
  
  // ---------------------------
  // Summary Generation
  // ---------------------------
  function generateSummary() {
    let summaryText = '<h2>Child Development Report Card</h2>';
  
    // Define each developmental area with expected and advanced milestone IDs and recommendations
    const devAreas = [
      {
        name: 'Gross Motor Skills',
        expected: ['gm1', 'gm2', 'gm3', 'gm4', 'gm5'],
        advanced: ['gm6', 'gm7', 'gm8'],
        recExpected: "Try fun activities like obstacle courses, dancing, or playing catch to improve balance and coordination.",
        recAdvanced: "Boost advanced skills with skipping games, hopping challenges, or targeted ball-throwing drills."
      },
      {
        name: 'Fine Motor Skills',
        expected: ['fm1', 'fm2', 'fm3'],
        advanced: ['fm4', 'fm5', 'fm6'],
        recExpected: "Encourage drawing, finger painting, and simple puzzles to strengthen hand–eye coordination.",
        recAdvanced: "Advance these skills with tracing letters, cutting out shapes, or assembling small models."
      },
      {
        name: 'Language & Communication',
        expected: ['lang1', 'lang2', 'lang3'],
        advanced: ['lang4', 'lang5', 'lang6'],
        recExpected: "Spend time reading together, storytelling, and engaging in conversation to boost vocabulary.",
        recAdvanced: "Encourage detailed retelling of events, ask 'why' questions, and expand descriptive language during daily chats."
      },
      {
        name: 'Social & Emotional Development',
        expected: ['se1', 'se2', 'se3'],
        advanced: ['se4', 'se5', 'se6'],
        recExpected: "Arrange regular playdates, role-play sharing and turn-taking, and talk about feelings to nurture basic social skills.",
        recAdvanced: "Help your child lead group activities, practice empathy in resolving conflicts, and express emotions clearly."
      },
      {
        name: 'Cognitive Development',
        expected: ['cog1', 'cog2', 'cog3'],
        advanced: ['cog4', 'cog5', 'cog6'],
        recExpected: "Incorporate matching games, counting exercises, and simple puzzles to enhance basic cognitive skills.",
        recAdvanced: "Challenge your child with multi-attribute sorting games, memory challenges, or problem-solving tasks like building structures."
      }
    ];
  
    // Build report card sections for each developmental area
    devAreas.forEach(area => {
      let expCount = 0;
      area.expected.forEach(id => {
        const chk = document.getElementById(id);
        if (chk && chk.checked) expCount++;
      });
      let advCount = 0;
      area.advanced.forEach(id => {
        const chk = document.getElementById(id);
        if (chk && chk.checked) advCount++;
      });
      
      const expectedPerc = expCount / area.expected.length;
      const advancedPerc = advCount / area.advanced.length;
      
      summaryText += `<div class="area-summary">`;
      summaryText += `<h3>${area.name}</h3>`;
      summaryText += `<p><strong>Expected Milestones:</strong> ${expCount} of ${area.expected.length} (${Math.round(expectedPerc * 100)}%)</p>`;
      
      if (expectedPerc < 0.5) {
        summaryText += `<p class="recommendation" style="color: #d9534f;">Your child is still building the basics. <br>Action: ${area.recExpected}</p>`;
      } else if (expectedPerc < 1) {
        summaryText += `<p class="recommendation" style="color: #f0ad4e;">Good progress on the basics, but there's room to improve. <br>Action: Continue reinforcing these skills through regular practice and fun challenges.</p>`;
      } else {
        summaryText += `<p class="recommendation" style="color: #5cb85c;">Excellent work on the basics! Your child has mastered the expected skills.</p>`;
      }
      
      summaryText += `<p><strong>Advanced Milestones:</strong> ${advCount} of ${area.advanced.length} (${Math.round(advancedPerc * 100)}%)</p>`;
      
      if (advancedPerc < 0.5) {
        summaryText += `<p class="recommendation" style="color: #d9534f;">Advanced skills are emerging. <br>Action: ${area.recAdvanced}</p>`;
      } else if (advancedPerc < 1) {
        summaryText += `<p class="recommendation" style="color: #f0ad4e;">Your child is making strides in advanced areas, but a few challenges remain. <br>Action: Incorporate extra practice sessions focused on these skills.</p>`;
      } else {
        summaryText += `<p class="recommendation" style="color: #5cb85c;">Outstanding advanced performance! Your child is excelling in this area.</p>`;
      }
      summaryText += `</div>`;
    });
  
    // Parenting Goals Report (tracked locally)
    const parentingGoals = [
      { id: 'par1', label: 'Establish Daily Schedule' },
      { id: 'par2', label: 'Involve Child in Decisions' },
      { id: 'par3', label: 'Give Specific Praise Daily' },
      { id: 'par4', label: 'Set Clear Boundaries' },
      { id: 'par5', label: 'Quality One-on-One Time' },
      { id: 'par6', label: 'Regular Self-Care' },
      { id: 'par7', label: 'Track Parenting Wins' },
      { id: 'par8', label: 'Monthly Goal Reviews' },
      { id: 'par9', label: 'Maintain a Win Journal' },
      { id: 'par10', label: 'Implement New Strategy Monthly' }
    ];
    
    let pgCount = 0;
    let pgDetails = '<ul class="parenting-report">';
    parentingGoals.forEach(goal => {
      const chk = document.getElementById(goal.id);
      const status = (chk && chk.checked) ? '✅ Achieved' : '❌ Pending';
      if (chk && chk.checked) { pgCount++; }
      pgDetails += `<li><strong>${goal.label}:</strong> ${status}</li>`;
    });
    pgDetails += '</ul>';
    
    summaryText += '<h2>Parenting Goals Report</h2>';
    summaryText += pgDetails;
    
    const pgRatio = pgCount / parentingGoals.length;
    summaryText += '<div class="encouragement">';
    if (pgRatio < 0.5) {
      summaryText += `<p style="color: #d9534f;">Your parenting journey is just beginning—focus on implementing one new strategy at a time and celebrate every small win. Remember, progress is progress!</p>`;
    } else if (pgRatio < 1) {
      summaryText += `<p style="color: #f0ad4e;">Great progress! You’re steadily building a strong foundation for your family. Keep refining your approach and try to add one more goal next month.</p>`;
    } else {
      summaryText += `<p style="color: #5cb85c;">Outstanding achievement! You’re consistently meeting your parenting goals. Keep up the excellent work and continue evolving your strategies as your child grows.</p>`;
    }
    summaryText += '</div>';
    
    document.getElementById('summaryContent').innerHTML = summaryText;
  }
  
  // Attach event listener to the Generate Summary button
  document.getElementById('generateSummaryBtn').addEventListener('click', generateSummary);
  
  // ---------------------------
  // Achievement Logging and Diary Functionality
  // ---------------------------
  
  let currentAchievementCheckbox = null;
  
  // When a checkbox is changed, prompt for achievement details if it’s newly checked
  function handleCheckboxForDiary(event) {
    const checkbox = event.target;
    // Only trigger if checkbox is checked and not already logged
    if (checkbox.checked && !checkbox.dataset.logged) {
      currentAchievementCheckbox = checkbox;
      // Use the text content of the parent li as the achievement description
      const achievementText = checkbox.parentElement.textContent.trim();
      document.getElementById('achievementLabel').textContent = achievementText;
      // Clear previous notes
      document.getElementById('achievementNotes').value = '';
      // Show the modal
      document.getElementById('achievementModal').style.display = 'block';
    }
  }
  
  // Attach handler to all checkboxes for diary logging
  document.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.addEventListener('change', handleCheckboxForDiary);
  });
  
  // Modal handling for achievement logging
  const achievementModal = document.getElementById('achievementModal');
  const closeModal = achievementModal.querySelector('.close');
  
  closeModal.addEventListener('click', () => {
    achievementModal.style.display = 'none';
  });
  
  document.getElementById('submitAchievement').addEventListener('click', () => {
    const notes = document.getElementById('achievementNotes').value.trim();
    logAchievement(notes);
    achievementModal.style.display = 'none';
  });
  
  document.getElementById('skipAchievement').addEventListener('click', () => {
    logAchievement('');
    achievementModal.style.display = 'none';
  });
  
  function logAchievement(notes) {
    if (!currentAchievementCheckbox) return;
    // Mark this checkbox as logged so that we do not prompt again
    currentAchievementCheckbox.dataset.logged = "true";
    // Create a diary entry with timestamp
    const timestamp = new Date().toISOString();
    const achievementText = currentAchievementCheckbox.parentElement.textContent.trim();
    const diaryEntry = {
      id: currentAchievementCheckbox.id,
      achievement: achievementText,
      note: notes,
      timestamp: timestamp
    };
    // Retrieve existing diary entries from localStorage (for local caching)
    let diaryEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    diaryEntries.push(diaryEntry);
    localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
    // Sync the diary entries with the backend
    syncDiaryToBackend(diaryEntries);
    // Update the Diary tab view
    loadDiary();
    // Clear currentAchievementCheckbox for future logging
    currentAchievementCheckbox = null;
  }
  
  // Function to sync diary entries to the backend
  async function syncDiaryToBackend(diaryEntries) {
    try {
      const response = await fetch('/.netlify/functions/saveDiary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diaryEntries })
      });
      const result = await response.json();
      console.log('Diary synced to backend:', result);
    } catch (error) {
      console.error('Error syncing diary to backend:', error);
    }
  }
  
  // Function to load diary entries from the backend
  async function loadDiaryFromBackend() {
    try {
      const response = await fetch('/.netlify/functions/getDiary');
      const result = await response.json();
      console.log('Loaded diary from backend:', result);
      if (result.diary) {
        localStorage.setItem('diaryEntries', JSON.stringify(result.diary));
      }
      loadDiary();
    } catch (error) {
      console.error('Error loading diary from backend:', error);
    }
  }
  
  // Function to load diary entries and display them in the Diary tab, grouped by date
  function loadDiary() {
    const diaryContainer = document.getElementById('diaryContent');
    let diaryEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    
    // Sort entries by timestamp ascending (oldest first)
    diaryEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Group entries by date (YYYY-MM-DD)
    const groupedEntries = {};
    diaryEntries.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      if (!groupedEntries[date]) {
        groupedEntries[date] = [];
      }
      groupedEntries[date].push(entry);
    });
    
    // Build HTML to display grouped entries
    let output = '';
    // Sort dates descending (most recent first)
    const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b) - new Date(a));
    sortedDates.forEach(date => {
      output += `<div class="diary-date-group">`;
      output += `<h3>${date}</h3>`;
      groupedEntries[date].forEach(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        output += `<div class="diary-entry">`;
        output += `<p><strong>${time}</strong>: ${entry.achievement}</p>`;
        if (entry.note) {
          output += `<p class="diary-note">Note: ${entry.note}</p>`;
        }
        output += `</div>`;
      });
      output += `</div>`;
    });
    
    diaryContainer.innerHTML = output;
  }
  
  // Load diary entries on page load (from backend sync)
  window.addEventListener('load', () => {
    loadStateFromBackend();
    loadDiaryFromBackend();
  });
  