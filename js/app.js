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

  // Modal functionality for support buttons
document.querySelectorAll('.support-btn').forEach(button => {
    button.addEventListener('click', () => {
      const modalId = button.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'block';
      }
    });
  });
  
  // Close modals when the close button is clicked or when clicking outside the modal content
  document.querySelectorAll('.modal').forEach(modal => {
    // When the user clicks on <span class="close">, close the modal
    modal.querySelector('.close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // When the user clicks anywhere outside of the modal content, close it
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
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
  // Enhanced Summary Generation Function: Detailed, Personalized Report Card
function generateSummary() {
    let summaryText = '<h2>Child Development Report Card</h2>';
  
    // Define each developmental area with IDs and tailored recommendations
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
  
    // Process each developmental area and build its "report card" section
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
  
    // Parenting Goals Summary with a Detailed Report
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
  