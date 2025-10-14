
// --- INITIAL DATA ---
const defaultResources = {
  c: [
    {name:"Learn C - Interactive", url:"https://www.learn-c.org/"},
    {name:"C Language Full Course (YouTube)", url:"https://youtu.be/KJgsSFOSQv0"},
    {name:"C Examples - Programiz", url:"https://www.programiz.com/c-programming/examples"}
  ],
};

// --- LOCAL STORAGE LOAD ---
let resources = JSON.parse(localStorage.getItem('resources')) || defaultResources;

// --- RENDER FUNCTIONS ---
const tabsContainer = document.getElementById('tabs');
const mainContent = document.getElementById('main-content');

function renderTabs() {
  tabsContainer.innerHTML = '';
  for (let subject in resources) {
    const tabWrapper = document.createElement('div');
    tabWrapper.style.display = 'inline-flex';
    tabWrapper.style.alignItems = 'center';
    tabWrapper.style.gap = '0.3rem';

    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.topic = subject;
    btn.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
    tabWrapper.appendChild(btn);

    // Delete subject button
    const delSubBtn = document.createElement('button');
    delSubBtn.textContent = '🗑';
    delSubBtn.title = `Delete entire subject "${subject}"`;
    delSubBtn.className = 'delete-subject-btn';
    delSubBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent tab switch
      if (confirm(`Are you sure you want to delete the subject "${subject}" and all its resources?`)) {
        delete resources[subject];
        localStorage.setItem('resources', JSON.stringify(resources));
        const remainingSubjects = Object.keys(resources);
        renderTabs();
        if (remainingSubjects.length > 0) {
          renderResources(remainingSubjects[0]);
        } else {
          mainContent.innerHTML = '<p>No subjects available. Add a new one!</p>';
        }
      }
    });
    tabWrapper.appendChild(delSubBtn);

    tabsContainer.appendChild(tabWrapper);
  }
}


function renderResources(activeSubject = Object.keys(resources)[0]) {
  mainContent.innerHTML = '';
  for (let subject in resources) {
    const section = document.createElement('section');
    section.id = subject;
    section.className = 'tab-content';
    if (subject === activeSubject) section.classList.add('active');

    const h2 = document.createElement('h2');
    h2.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
    section.appendChild(h2);

    const ul = document.createElement('ul');
    ul.className = 'resource-list';

    resources[subject].forEach((res, index) => {
      const li = document.createElement('li');

      const a = document.createElement('a');
      a.href = res.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = res.name;
      li.appendChild(a);

      const delBtn = document.createElement('button');
      delBtn.textContent = '❌';
      delBtn.title = 'Delete this resource';
      delBtn.className = 'delete-btn';
      delBtn.addEventListener('click', () => {
        if(confirm(`Delete "${res.name}" from ${subject}?`)) {
          resources[subject].splice(index, 1); // remove from array
          localStorage.setItem('resources', JSON.stringify(resources));
          renderResources(subject); // re-render
        }
      });
      li.appendChild(delBtn);

      ul.appendChild(li);
    });

    section.appendChild(ul);
    mainContent.appendChild(section);
  }

  activateTabs();
}


// --- TAB SWITCHING ---
function activateTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.topic).classList.add('active');

      // clear search
      document.getElementById('search').value = '';
      filterResources('');
    });
  });

  buttons[0].classList.add('active');
}

// --- SEARCH ---
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-search');

function filterResources(query) {
  const activeSection = document.querySelector('.tab-content.active');
  if (!activeSection) return;
  const items = activeSection.querySelectorAll('li');
  const q = query.trim().toLowerCase();

  items.forEach(li => {
    const text = li.innerText.toLowerCase();
    if (!q || text.includes(q)) li.style.display = '';
    else li.style.display = 'none';
  });
}

searchInput.addEventListener('input', e => filterResources(e.target.value));
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterResources('');
});

// --- DARK MODE ---
const themeToggle = document.getElementById('theme-toggle');
const DARK_KEY = 'studyhub-dark-mode';

function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

const storedTheme = localStorage.getItem(DARK_KEY);
applyTheme(storedTheme === 'true');

themeToggle.addEventListener('click', () => {
  const isDarkNow = document.documentElement.classList.toggle('dark');
  localStorage.setItem(DARK_KEY, isDarkNow ? 'true' : 'false');
  applyTheme(isDarkNow);
});

// --- ADD RESOURCE ---
const addBtn = document.getElementById('add-resource-btn');
const modal = document.getElementById('add-resource-modal');
const closeModalBtn = document.getElementById('close-modal');
const saveBtn = document.getElementById('save-resource');

addBtn.addEventListener('click', () => modal.style.display = 'flex');
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

saveBtn.addEventListener('click', () => {
  const subject = document.getElementById('new-subject').value.trim().toLowerCase();
  const name = document.getElementById('new-name').value.trim();
  const url = document.getElementById('new-link').value.trim();

  if (!subject || !name || !url) return alert('Please fill all fields!');

  if (!resources[subject]) resources[subject] = [];
  resources[subject].push({name, url});
  localStorage.setItem('resources', JSON.stringify(resources));

  renderTabs();
  renderResources(subject);

  document.getElementById('new-subject').value = '';
  document.getElementById('new-name').value = '';
  document.getElementById('new-link').value = '';
  modal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// --- INITIAL RENDER ---
renderTabs();
renderResources();
