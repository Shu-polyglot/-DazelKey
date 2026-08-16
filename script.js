const STORAGE_KEY = 'bucket-list-life-archive-v1';
const allowedCategories = ['Travel', 'Career', 'Learning', 'Experience', 'Personal'];

const defaultBuckets = [
  {
    id: 1,
    title: 'See the Northern Lights',
    category: 'Travel',
    description: 'Experience the Northern Lights in Iceland with a slow winter road trip.',
    dateType: 'someday',
    targetDate: null,
    status: 'completed',
    completedDate: '2027-03-15',
    location: 'Iceland',
    memory: 'One of the most unreal nights of my life.',
    image: null,
  },
  {
    id: 2,
    title: 'Build my first web app',
    category: 'Career',
    description: 'Create and launch my first product with a meaningful user experience.',
    dateType: 'exact',
    targetDate: '2026-08-21',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 3,
    title: 'Visit New York',
    category: 'Travel',
    description: 'Spend a week walking the city and seeing it glow after dark.',
    dateType: 'exact',
    targetDate: '2027-04-10',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 4,
    title: 'Travel alone to another country',
    category: 'Travel',
    description: 'Take a solo trip and trust the unknown to teach me something new.',
    dateType: 'someday',
    targetDate: null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 5,
    title: 'Build my own product',
    category: 'Career',
    description: 'Design and ship something useful, beautiful, and personal.',
    dateType: 'exact',
    targetDate: '2027-01-20',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 6,
    title: 'Reach TOEFL 110',
    category: 'Learning',
    description: 'Study consistently and reach a score that opens future opportunities.',
    dateType: 'exact',
    targetDate: '2026-12-15',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 7,
    title: 'Learn React',
    category: 'Learning',
    description: 'Build a personal portfolio and become comfortable with modern front-end development.',
    dateType: 'exact',
    targetDate: '2026-06-14',
    status: 'completed',
    completedDate: '2026-06-14',
    location: 'Home studio',
    memory: 'The first time my interface felt truly my own.',
    image: null,
  },
  {
    id: 8,
    title: 'Read 100 books',
    category: 'Learning',
    description: 'Read more deeply across literature, art, and ideas.',
    dateType: 'someday',
    targetDate: null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 9,
    title: 'Go camping alone',
    category: 'Experience',
    description: 'Spend one night alone in nature and listen to the silence.',
    dateType: 'exact',
    targetDate: '2026-09-20',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 10,
    title: 'Attend a major music festival',
    category: 'Experience',
    description: 'See a live set under a night sky and let the atmosphere stay with me.',
    dateType: 'someday',
    targetDate: null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 11,
    title: 'Run a marathon',
    category: 'Personal',
    description: 'Train with patience and finish the kind of race that changes your rhythm.',
    dateType: 'exact',
    targetDate: '2027-10-30',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
];

const monthLabel = document.getElementById('monthLabel');
const calendarGrid = document.getElementById('calendarGrid');
const progressText = document.getElementById('progressText');
const bucketList = document.getElementById('bucketList');
const bucketFilters = document.getElementById('bucketFilters');
const calendarDetails = document.getElementById('calendarDetails');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const addBucketBtn = document.getElementById('addBucketBtn');
const bucketModal = document.getElementById('bucketModal');
const cancelBucketBtn = document.getElementById('cancelBucketBtn');
const bucketForm = document.getElementById('bucketForm');
const detailsModal = document.getElementById('bucketDetailsModal');
const detailContent = document.getElementById('detailContent');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const calendarDetailExpanded = document.getElementById('calendarDetailExpanded');
const calendarDetailOverlay = document.getElementById('calendarDetailOverlay');
const closeCalendarDetailBtn = document.getElementById('closeCalendarDetailBtn');
const expandedDateLabel = document.getElementById('expandedDateLabel');
const expandedCalendarDetails = document.getElementById('expandedCalendarDetails');

let bucketState = loadData();
let currentMonth = new Date(2026, 7, 1);
let activeFilter = 'All';
let selectedDate = null;
let detailsEditMode = false;
let selectedBucketId = null;
let expandedCalendarDate = null;
let detailsBucketId = null;

function normalizeBucket(bucket, index) {
  const safeStatus = ['planned', 'in-progress', 'completed'].includes(bucket.status) ? bucket.status : 'planned';
  const safeDateType = bucket.dateType === 'exact' ? 'exact' : 'someday';

  return {
    id: bucket.id || index + 1,
    title: bucket.title || 'Untitled memory',
    category: allowedCategories.includes(bucket.category) ? bucket.category : 'Personal',
    description: bucket.description || '',
    dateType: safeDateType,
    targetDate: bucket.targetDate || null,
    status: safeStatus,
    completedDate: bucket.completedDate || null,
    location: bucket.location || '',
    memory: bucket.memory || '',
    image: bucket.image || null,
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((bucket, index) => normalizeBucket(bucket, index));
      }
    }
  } catch (error) {
    console.warn('Unable to load saved bucket data.', error);
  }

  return defaultBuckets.map((bucket, index) => normalizeBucket(bucket, index));
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bucketState));
}

function formatMonth(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatDate(value) {
  if (!value) {
    return 'No date set';
  }

  const date = new Date(value + 'T12:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getStatusLabel(bucket) {
  if (bucket.status === 'completed') {
    return 'Completed';
  }

  if (bucket.dateType === 'someday') {
    return 'Someday';
  }

  return 'Planned';
}

function updateProgress() {
  const total = bucketState.length;
  const completed = bucketState.filter((bucket) => bucket.status === 'completed').length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  const ring = document.querySelector('.ring');

  if (ring) {
    ring.style.background = `conic-gradient(var(--accent) 0 ${percentage}%, rgba(180, 197, 220, 0.1) ${percentage}% 100%)`;
    const ringValue = ring.querySelector('span');
    if (ringValue) {
      ringValue.textContent = `${percentage}%`;
    }
  }

  if (progressText) {
    progressText.textContent = `${completed} / ${total} experiences completed`;
  }
}

function getBucketMatchesForDate(dateString) {
  return bucketState.filter((bucket) => {
    if (bucket.dateType === 'exact' && bucket.targetDate === dateString) {
      return true;
    }

    if (bucket.completedDate === dateString) {
      return true;
    }

    return false;
  });
}

function renderFilters() {
  if (!bucketFilters) {
    return;
  }

  const categories = ['All', ...allowedCategories];
  bucketFilters.innerHTML = '';

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-button${activeFilter === category ? ' is-active' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => {
      activeFilter = category;
      renderFilters();
      renderBuckets();
    });
    bucketFilters.appendChild(button);
  });
}

function renderBuckets() {
  if (!bucketList) {
    return;
  }

  const filteredBuckets = activeFilter === 'All'
    ? bucketState
    : bucketState.filter((bucket) => bucket.category === activeFilter);

  bucketList.innerHTML = '';

  if (!filteredBuckets.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Your next adventure starts here.';
    bucketList.appendChild(emptyState);
    return;
  }

  filteredBuckets.forEach((bucket) => {
    const card = document.createElement('article');
    card.className = 'bucket-card';
    card.dataset.id = String(bucket.id);
    card.dataset.status = bucket.status;

    card.addEventListener('click', (event) => {
      if (event.target.closest('.bucket-status-button')) {
        return;
      }
      openBucketDetails(bucket.id);
    });

    const top = document.createElement('div');
    top.className = 'bucket-card-top';

    const category = document.createElement('p');
    category.className = 'bucket-category';
    category.textContent = bucket.category;

    const status = document.createElement('span');
    status.className = 'bucket-status';
    status.textContent = getStatusLabel(bucket);

    const title = document.createElement('h3');
    title.textContent = bucket.title;

    const meta = document.createElement('div');
    meta.className = 'bucket-meta';
    meta.textContent = bucket.status === 'completed'
      ? (bucket.completedDate ? formatDate(bucket.completedDate) : 'Completed')
      : bucket.dateType === 'someday'
        ? 'Someday'
        : (bucket.targetDate ? formatDate(bucket.targetDate) : 'Date to be chosen');

    const actionWrap = document.createElement('div');
    actionWrap.className = 'bucket-card-actions';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bucket-status-button';
    button.textContent = bucket.status === 'completed' ? 'View memory' : 'Open';
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      openBucketDetails(bucket.id);
    });

    top.append(category, status);
    actionWrap.appendChild(button);
    card.append(top, title, meta, actionWrap);
    bucketList.appendChild(card);
  });
}

function renderCalendarDetails() {
  if (!calendarDetails) {
    return;
  }

  if (!selectedDate) {
    calendarDetails.innerHTML = '<h3>Life moments</h3><ul><li>Nothing planned for this day.</li></ul>';
    return;
  }

  const matches = getBucketMatchesForDate(selectedDate);

  if (!matches.length) {
    calendarDetails.innerHTML = `<h3>${formatDate(selectedDate)}</h3><ul><li>Nothing planned for this day.</li></ul>`;
    return;
  }

  const entries = matches
    .map((bucket) => `<li><button type="button" data-bucket-id="${bucket.id}" class="day-link">${bucket.title}</button> · ${getStatusLabel(bucket)}</li>`)
    .join('');

  calendarDetails.innerHTML = `<h3>${formatDate(selectedDate)}</h3><ul>${entries}</ul>`;

  calendarDetails.querySelectorAll('[data-bucket-id]').forEach((button) => {
    button.addEventListener('click', () => {
      openBucketDetails(Number(button.dataset.bucketId));
    });
  });
}

function openExpandedCalendarDetail(isoDate) {
  const matches = getBucketMatchesForDate(isoDate);
  
  expandedDateLabel.textContent = formatDate(isoDate);
  
  if (!matches.length) {
    expandedCalendarDetails.innerHTML = '<h3>No activities planned</h3><ul><li>Nothing scheduled for this day.</li></ul>';
  } else {
    const entries = matches
      .map((bucket) => `<li><button type="button" data-bucket-id="${bucket.id}" class="day-link">${bucket.title}</button><br><span style="font-size: 0.85rem; color: var(--soft);">${getStatusLabel(bucket)}</span></li>`)
      .join('');
    expandedCalendarDetails.innerHTML = `<h3>Planned activities</h3><ul>${entries}</ul>`;
    
    expandedCalendarDetails.querySelectorAll('[data-bucket-id]').forEach((button) => {
      button.addEventListener('click', () => {
        closeExpandedCalendarDetail();
        openBucketDetails(Number(button.dataset.bucketId));
      });
    });
  }
  
  calendarDetailExpanded.classList.remove('hidden');
  calendarDetailExpanded.setAttribute('aria-hidden', 'false');
  calendarDetailExpanded.classList.add('visible');
}

function closeExpandedCalendarDetail() {
  calendarDetailExpanded.classList.add('closing');
  setTimeout(() => {
    calendarDetailExpanded.classList.remove('visible', 'closing');
    calendarDetailExpanded.classList.add('hidden');
    calendarDetailExpanded.setAttribute('aria-hidden', 'true');
    expandedCalendarDate = null;
  }, 400);
}

function renderCalendar() {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const cells = [];

  if (monthLabel) {
    monthLabel.textContent = formatMonth(monthStart);
  }

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ muted: true, value: '' });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ muted: false, value: day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ muted: true, value: '' });
  }

  calendarGrid.innerHTML = '';

  cells.forEach((cell) => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    if (cell.muted) {
      dayEl.classList.add('is-muted');
      calendarGrid.appendChild(dayEl);
      return;
    }

    const dayValue = Number(cell.value);
    const isoDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayValue).padStart(2, '0')}`;
    const matches = getBucketMatchesForDate(isoDate);

    if (matches.length) {
      const hasCompleted = matches.some((bucket) => bucket.status === 'completed');
      dayEl.classList.add(hasCompleted ? 'has-event' : 'has-plan');
    }

    const today = new Date();
    if (
      today.getFullYear() === currentMonth.getFullYear() &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getDate() === dayValue
    ) {
      dayEl.classList.add('is-today');
    }

    const dateNumber = document.createElement('span');
    dateNumber.className = 'date-number';
    dateNumber.textContent = String(dayValue);
    dayEl.appendChild(dateNumber);

    if (selectedDate === isoDate) {
      dayEl.classList.add('is-selected');
    }

    dayEl.addEventListener('click', () => {
      selectedDate = isoDate;
      expandedCalendarDate = isoDate;
      renderCalendar();
      openExpandedCalendarDetail(isoDate);
    });

    calendarGrid.appendChild(dayEl);
  });

  renderCalendarDetails();
}

function openModal() {
  bucketModal.classList.remove('hidden');
  bucketModal.setAttribute('aria-hidden', 'false');
  const dateTypeField = document.getElementById('bucketDateType');
  if (dateTypeField) {
    dateTypeField.value = 'someday';
  }
  toggleDateField();

  const titleInput = document.getElementById('bucketGoal');
  if (titleInput) {
    titleInput.focus();
  }
}

function closeModal() {
  bucketModal.classList.add('hidden');
  bucketModal.setAttribute('aria-hidden', 'true');
  bucketForm.reset();
  toggleDateField();
}

function renderBucketDetailsView(bucketId) {
  const bucket = bucketState.find((item) => item.id === bucketId);
  if (!bucket) {
    return;
  }

  detailContent.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = bucket.title;

  const section = document.createElement('div');
  section.className = 'detail-section';

  const meta = document.createElement('div');
  meta.className = 'detail-meta';

  const entries = [
    ['Category', bucket.category],
    ['Date type', bucket.dateType === 'someday' ? 'SOMEDAY' : 'EXACT DATE'],
    ['Status', getStatusLabel(bucket)],
  ];

  if (bucket.targetDate) {
    entries.push(['Target date', formatDate(bucket.targetDate)]);
  }

  if (bucket.completedDate) {
    entries.push(['Completed date', formatDate(bucket.completedDate)]);
  }

  entries.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'detail-item';
    item.innerHTML = `<span class="label">${label}</span><span class="value">${value}</span>`;
    meta.appendChild(item);
  });

  const description = document.createElement('div');
  description.className = 'detail-item';
  description.innerHTML = `<span class="label">Description</span><span class="value">${bucket.description || 'No description yet.'}</span>`;

  if (bucket.location) {
    const locationWrap = document.createElement('div');
    locationWrap.className = 'detail-item';
    locationWrap.innerHTML = `<span class="label">Location</span><span class="value">${bucket.location}</span>`;
    section.appendChild(locationWrap);
  }

  if (bucket.memory) {
    const memoryWrap = document.createElement('div');
    memoryWrap.className = 'detail-item';
    memoryWrap.innerHTML = `<span class="label">Memory</span><span class="value">${bucket.memory}</span>`;
    section.appendChild(memoryWrap);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  if (bucket.status !== 'completed') {
    const actionRow = document.createElement('div');
    actionRow.className = 'detail-form';

    if (bucket.dateType === 'someday') {
      const label = document.createElement('label');
      label.textContent = 'Pick the date this experience happened';
      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.name = 'completedDate';
      dateInput.value = selectedDate || '';
      label.appendChild(dateInput);
      actionRow.appendChild(label);
    }

    const completeButton = document.createElement('button');
    completeButton.type = 'button';
    completeButton.className = 'primary-button';
    completeButton.textContent = 'Complete this experience';
    completeButton.addEventListener('click', () => {
      const chosenDate = bucket.dateType === 'someday'
        ? (actionRow.querySelector('input[name="completedDate"]')?.value || selectedDate || null)
        : (bucket.targetDate || selectedDate || null);

      if (!chosenDate) {
        if (bucket.dateType === 'someday') {
          alert('Choose the date this experience happened.');
        }
        return;
      }

      completeBucket(bucket.id, chosenDate);
    });

    actions.appendChild(completeButton);
    section.appendChild(actionRow);
  }

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'primary-button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    detailsEditMode = true;
    detailsBucketId = bucketId;
    renderBucketDetailsEdit(bucketId);
  });
  actions.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'secondary-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    if (confirm('Delete this experience?\n\nThis action cannot be undone.')) {
      deleteBucket(bucketId);
    }
  });
  actions.appendChild(deleteButton);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'secondary-button';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', closeDetailsModal);
  actions.appendChild(closeButton);

  section.append(meta, description);
  detailContent.append(title, section, actions);
  detailsModal.classList.remove('hidden');
  detailsModal.setAttribute('aria-hidden', 'false');
}

function renderBucketDetailsEdit(bucketId) {
  const bucket = bucketState.find((item) => item.id === bucketId);
  if (!bucket) {
    return;
  }

  detailContent.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = 'Edit memory';

  const form = document.createElement('form');
  form.className = 'detail-section';

  const formFields = [
    {
      label: 'Title',
      name: 'title',
      type: 'text',
      value: bucket.title,
      required: true,
    },
    {
      label: 'Category',
      name: 'category',
      type: 'select',
      options: allowedCategories,
      value: bucket.category,
    },
    {
      label: 'Description',
      name: 'description',
      type: 'textarea',
      value: bucket.description,
      placeholder: 'Experience the Northern Lights in Iceland.',
    },
    {
      label: 'Date type',
      name: 'dateType',
      type: 'select',
      options: ['someday', 'exact'],
      value: bucket.dateType,
    },
  ];

  formFields.forEach((field) => {
    const label = document.createElement('label');
    label.className = 'detail-form-label';

    const labelText = document.createElement('span');
    labelText.textContent = field.label;
    label.appendChild(labelText);

    if (field.type === 'select') {
      const select = document.createElement('select');
      select.name = field.name;
      select.value = field.value;

      field.options.forEach((option) => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        select.appendChild(optionEl);
      });

      if (field.name === 'dateType') {
        select.addEventListener('change', () => {
          const exactField = form.querySelector('[data-field="targetDate"]');
          if (select.value === 'exact') {
            exactField.style.display = 'block';
          } else {
            exactField.style.display = 'none';
          }
        });
      }

      label.appendChild(select);
    } else if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      textarea.value = field.value;
      textarea.placeholder = field.placeholder || '';
      textarea.rows = 3;
      label.appendChild(textarea);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.value = field.value;
      input.required = field.required || false;
      label.appendChild(input);
    }

    form.appendChild(label);
  });

  const targetDateLabel = document.createElement('label');
  targetDateLabel.className = 'detail-form-label';
  targetDateLabel.setAttribute('data-field', 'targetDate');
  targetDateLabel.style.display = bucket.dateType === 'exact' ? 'block' : 'none';

  const targetDateText = document.createElement('span');
  targetDateText.textContent = 'Target date';
  targetDateLabel.appendChild(targetDateText);

  const targetDateInput = document.createElement('input');
  targetDateInput.type = 'date';
  targetDateInput.name = 'targetDate';
  targetDateInput.value = bucket.targetDate || '';
  targetDateLabel.appendChild(targetDateInput);

  form.appendChild(targetDateLabel);

  const locationLabel = document.createElement('label');
  locationLabel.className = 'detail-form-label';
  const locationText = document.createElement('span');
  locationText.textContent = 'Location';
  locationLabel.appendChild(locationText);
  const locationInput = document.createElement('input');
  locationInput.type = 'text';
  locationInput.name = 'location';
  locationInput.value = bucket.location || '';
  locationInput.placeholder = 'Iceland';
  locationLabel.appendChild(locationInput);
  form.appendChild(locationLabel);

  const memoryLabel = document.createElement('label');
  memoryLabel.className = 'detail-form-label';
  const memoryText = document.createElement('span');
  memoryText.textContent = 'Memory';
  memoryLabel.appendChild(memoryText);
  const memoryTextarea = document.createElement('textarea');
  memoryTextarea.name = 'memory';
  memoryTextarea.value = bucket.memory || '';
  memoryTextarea.placeholder = 'One of the most unreal nights of my life.';
  memoryTextarea.rows = 3;
  memoryLabel.appendChild(memoryTextarea);
  form.appendChild(memoryLabel);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'primary-button';
  saveButton.textContent = 'Save changes';
  saveButton.addEventListener('click', () => {
    saveBucketEdit(bucketId, form);
  });
  actions.appendChild(saveButton);

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'secondary-button';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    detailsEditMode = false;
    renderBucketDetailsView(bucketId);
  });
  actions.appendChild(cancelButton);

  detailContent.append(title, form, actions);
  detailsModal.classList.remove('hidden');
  detailsModal.setAttribute('aria-hidden', 'false');
}

function saveBucketEdit(bucketId, form) {
  const bucket = bucketState.find((item) => item.id === bucketId);
  if (!bucket) {
    return;
  }

  const formData = new FormData(form);
  const newTitle = formData.get('title')?.toString().trim();
  const newCategory = formData.get('category')?.toString();
  const newDescription = formData.get('description')?.toString().trim() || '';
  const newDateType = formData.get('dateType')?.toString();
  const newTargetDate = formData.get('targetDate')?.toString() || null;
  const newLocation = formData.get('location')?.toString().trim() || '';
  const newMemory = formData.get('memory')?.toString().trim() || '';

  if (!newTitle) {
    alert('Please enter a title.');
    return;
  }

  if (newDateType === 'exact' && !newTargetDate) {
    alert('Please select a target date for exact-date experiences.');
    return;
  }

  const oldTargetDate = bucket.targetDate;
  const oldDateType = bucket.dateType;

  bucket.title = newTitle;
  bucket.category = newCategory;
  bucket.description = newDescription;
  bucket.location = newLocation;
  bucket.memory = newMemory;

  const dateTypeChanged = oldDateType !== newDateType;
  const targetDateChanged = oldTargetDate !== newTargetDate;

  if (dateTypeChanged) {
    bucket.dateType = newDateType;
    if (newDateType === 'someday') {
      bucket.targetDate = null;
    } else {
      bucket.targetDate = newTargetDate;
    }
  } else if (targetDateChanged) {
    bucket.targetDate = newTargetDate;
  }

  saveData();
  updateProgress();
  renderBuckets();
  renderCalendar();
  detailsEditMode = false;
  renderBucketDetailsView(bucketId);
}

function deleteBucket(bucketId) {
  const index = bucketState.findIndex((item) => item.id === bucketId);
  if (index === -1) {
    return;
  }

  bucketState.splice(index, 1);
  saveData();
  updateProgress();
  renderBuckets();
  renderCalendar();
  closeDetailsModal();
}

function openBucketDetails(bucketId) {
  detailsBucketId = bucketId;
  detailsEditMode = false;
  renderBucketDetailsView(bucketId);
}

function closeDetailsModal() {
  detailsModal.classList.add('hidden');
  detailsModal.setAttribute('aria-hidden', 'true');
}

function completeBucket(bucketId, chosenDate) {
  const bucket = bucketState.find((item) => item.id === bucketId);
  if (!bucket || !chosenDate) {
    return;
  }

  bucket.status = 'completed';
  bucket.completedDate = chosenDate;

  if (bucket.dateType === 'exact') {
    bucket.targetDate = bucket.targetDate || chosenDate;
  }

  saveData();
  updateProgress();
  renderBuckets();
  renderCalendar();
  openBucketDetails(bucket.id);
}

function addBucket(event) {
  event.preventDefault();

  const title = document.getElementById('bucketGoal').value.trim();
  const category = document.getElementById('bucketCategory').value;
  const description = document.getElementById('bucketDescription').value.trim();
  const dateType = document.getElementById('bucketDateType').value;
  const targetDate = document.getElementById('bucketDate').value;

  if (!title) {
    return;
  }

  if (dateType === 'exact' && !targetDate) {
    alert('Please select an exact date for this experience.');
    return;
  }

  const newBucket = {
    id: Date.now(),
    title,
    category,
    description,
    dateType,
    targetDate: dateType === 'exact' ? targetDate : null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  };

  bucketState.unshift(newBucket);
  saveData();
  updateProgress();
  renderFilters();
  renderBuckets();
  renderCalendar();
  closeModal();
}

function toggleDateField() {
  const dateTypeField = document.getElementById('bucketDateType');
  const exactDateField = document.getElementById('exactDateField');

  if (!dateTypeField || !exactDateField) {
    return;
  }

  exactDateField.style.display = dateTypeField.value === 'exact' ? 'grid' : 'none';
}

prevMonthBtn.addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  renderCalendar();
});

addBucketBtn.addEventListener('click', openModal);
cancelBucketBtn.addEventListener('click', closeModal);
closeDetailBtn.addEventListener('click', closeDetailsModal);
closeCalendarDetailBtn.addEventListener('click', closeExpandedCalendarDetail);
calendarDetailOverlay.addEventListener('click', closeExpandedCalendarDetail);

const dateTypeField = document.getElementById('bucketDateType');
if (dateTypeField) {
  dateTypeField.addEventListener('change', toggleDateField);
}

calendarDetails.addEventListener('click', (event) => {
  const target = event.target.closest('[data-bucket-id]');
  if (target) {
    openBucketDetails(Number(target.dataset.bucketId));
  }
});

bucketModal.addEventListener('click', (event) => {
  if (event.target === bucketModal) {
    closeModal();
  }
});

detailsModal.addEventListener('click', (event) => {
  if (event.target === detailsModal) {
    closeDetailsModal();
  }
});

bucketForm.addEventListener('submit', addBucket);
renderFilters();
renderBuckets();
updateProgress();
renderCalendar();
