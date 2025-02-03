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
  
  // Save checkbox state in localStorage
  function saveState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
      localStorage.setItem(box.id, box.checked);
    });
    saveStateToBackend(); // Also save to backend
  }
  
  // Load checkbox state from localStorage
  function loadState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
      const stored = localStorage.getItem(box.id);
      if (stored !== null) {
        box.checked = (stored === 'true');
      }
    });
  }
  
  // Attach change listeners to all checkboxes to save state automatically
  document.querySelectorAll('input[type="checkbox"]').forEach(box => {
    box.addEventListener('change', saveState);
  });
  
  // ---------------------------
  // Backend Integration (Netlify Functions + FaunaDB)
  // ---------------------------
  
  // Generate a simple userId if not already present.
  // In a production system, you’d use authentication.
  function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
  
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('userId', userId);
  }
  
  // Save the full state to the backend
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
        body: JSON.stringify({ userId, state: stateData })
      });
      const result = await response.json();
      console.log('State saved to backend:', result);
    } catch (error) {
      console.error('Error saving state to backend:', error);
    }
  }
  
  // Load state from the backend
  async function loadStateFromBackend() {
    try {
      const response = await fetch(`/.netlify/functions/getState?userId=${userId}`);
      if (response.status === 200) {
        const result = await response.json();
        const stateData = result.state;
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(box => {
          if (stateData.hasOwnProperty(box.id)) {
            box.checked = stateData[box.id];
          }
        });
      } else {
        console.log('No saved state found on backend');
      }
    } catch (error) {
      console.error('Error loading state from backend:', error);
    }
  }
  
  // Load backend state on page load (in addition to localStorage)
  window.addEventListener('load', () => {
    loadState();
    loadStateFromBackend();
  });
  
  // ---------------------------
  // Summary Generation
  // ---------------------------
  function generateSummary() {
    let summaryText = '<h2>Development Summary</h2>';
    const areas = [
      { name: 'Gross Motor Skills', expected: ['gm1', 'gm2', 'gm3', 'gm4', 'gm5'] },
      { name: 'Fine Motor Skills', expected: ['fm1', 'fm2', 'fm3', 'fm4'] },
      { name: 'Language & Communication', expected: ['lang1', 'lang2', 'lang3', 'lang4'] },
      { name: 'Social & Emotional Development', expected: ['se1', 'se2', 'se3', 'se4'] },
      { name: 'Cognitive Development', expected: ['cog1', 'cog2', 'cog3', 'cog4'] }
    ];
    
    areas.forEach(area => {
      let achieved = 0;
      area.expected.forEach(id => {
        const chk = document.getElementById(id);
        if (chk && chk.checked) {
          achieved++;
        }
      });
      summaryText += `<h3>${area.name}</h3>`;
      summaryText += `<p>Achieved ${achieved} out of ${area.expected.length} milestones.</p>`;
      summaryText += achieved < area.expected.length ?
        `<p class="recommendation" style="color: red;">Focus on this area by engaging in more practice and play.</p>` :
        `<p class="recommendation" style="color: green;">Great job! This area is well developed.</p>`;
    });
    
    const parentingGoals = [
      { name: 'Establish Routines', expected: ['par1', 'par2'] },
      { name: 'Positive Discipline', expected: ['par3', 'par4'] },
      { name: 'Engagement & Learning', expected: ['par5', 'par6'] },
      { name: 'Self-Care & Reflection', expected: ['par7', 'par8'] }
    ];
    
    summaryText += `<h2>Parenting Goals Summary</h2>`;
    parentingGoals.forEach(goal => {
      let achieved = 0;
      goal.expected.forEach(id => {
        const chk = document.getElementById(id);
        if (chk && chk.checked) {
          achieved++;
        }
      });
      summaryText += `<h3>${goal.name}</h3>`;
      summaryText += `<p>Achieved ${achieved} out of ${goal.expected.length} goals.</p>`;
      summaryText += achieved < goal.expected.length ?
        `<p class="recommendation" style="color: orange;">Keep working on these areas for a balanced approach.</p>` :
        `<p class="recommendation" style="color: green;">Excellent! You're hitting your parenting goals.</p>`;
    });
    
    document.getElementById('summaryContent').innerHTML = summaryText;
  }
  
  // Attach event listener to the Generate Summary button
  document.getElementById('generateSummaryBtn').addEventListener('click', generateSummary);
  