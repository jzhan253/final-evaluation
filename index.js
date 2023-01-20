// Constants
const editIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';

const deletIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';

const saveIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h4a1,1,0,0,1,0,2H9A1,1,0,0,1,9,8Zm7,11H8V15a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Z"/></svg>';

const cancelIcon = '<svg focusable="false" aria-hidden="true" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M19.587 16.001l6.096 6.096c0.396 0.396 0.396 1.039 0 1.435l-2.151 2.151c-0.396 0.396-1.038 0.396-1.435 0l-6.097-6.096-6.097 6.096c-0.396 0.396-1.038 0.396-1.434 0l-2.152-2.151c-0.396-0.396-0.396-1.038 0-1.435l6.097-6.096-6.097-6.097c-0.396-0.396-0.396-1.039 0-1.435l2.153-2.151c0.396-0.396 1.038-0.396 1.434 0l6.096 6.097 6.097-6.097c0.396-0.396 1.038-0.396 1.435 0l2.151 2.152c0.396 0.396 0.396 1.038 0 1.435l-6.096 6.096z"></path></svg>'

const addIcon = '<svg focusable viewBox="0 0 24 24" aria-hidden="true xmlns="http://www.w3.org/2000/svg"><path d="M12 6V18M18 12H6" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// API
API = (() => {
  const URL = 'http://localhost:3000/events';

  const getEvents = () => {
    return fetch(URL).then(res => res.json());
  }

  const postEvent = (newEvent) => {
    return fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    }).then(res => res.json());
  }

  const deleteEvent = (id) => {
    return fetch(`${URL}/${id}`, {
      method: 'DELETE',
    }).then(res => res.json())
    .catch(err => console.log(err));
  }

  const updateEvent = (id, newEvent) => {
    return fetch(`${URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    }).then(res => res.json())
    .catch(err => console.log(err));
  }

  return {
    getEvents,
    postEvent,
    deleteEvent,
    updateEvent
  }
})();

// API tests
// API.getEvents().then(res => {
//   console.log(res);
// })

// API.postEvent({'eventName': 'AAA'}).then(res => res);

// API.deleteEvent(3).then(res => res);

// API.updateEvent(2, {'eventName': 'EDC'}).then(res => res);

// Model
class EventsModel {
  #events;
  constructor() {
    this.#events = [];
    this.fetchData();
  }

  fetchData() {
    return API.getEvents().then(res => {
      console.log('fetching', res);
      this.setEvents(res);
      return res;
    });
  }

  getEvents() {
    return this.#events;
  }

  setEvents(events) {
    this.#events = events;
    console.log('after Setting:', this.#events)
  }

  addEvent(newEvent) {
    return API.postEvent(newEvent).then(res => {
      console.log('Adding', res);
      this.#events.push(newEvent);
      console.log('After adding, local storage:', this.#events);
      return res;
    });
  }

  deleteEvent(id) {
    return API.deleteEvent(id).then(res => {
      console.log('Deleting', res);
      this.#events = this.#events.filter(event => event.id !== +id);
      console.log('After deleting, local storage:', this.#events);
      return res;
    });
  }

  updateEvent(id, newEvent) {
    return API.updateEvent(id, newEvent).then(res => {
      console.log('Updating', res);
      this.#events.forEach(event => {
        if(event.id === +id) {
          event.eventName = newEvent.eventName;
          event.startDate = newEvent.startDate;
          event.endDate = newEvent.endDate;
        }
      });
      console.log('After editing, local storage:', this.#events);
      return res;
    })
  }
}

// View
class EventsView {
  constructor() {
    this.addButton = document.querySelector('.add-btn');
    this.tableBody = document.querySelector('.table-body');
  }

  renderEvent(event, adding) {
    const tableRow = document.createElement('tr');
    tableRow.classList.add('event-row');
    tableRow.id = event.id;

    const tableCol1 = document.createElement('td');
    tableCol1.classList.add('event-col-1');

    const eventTitle = document.createElement('input');

    eventTitle.classList.add('event-title');
    eventTitle.type = 'text';
    eventTitle.value = event.eventName ? event.eventName : '';
    eventTitle.readOnly = !adding;
    eventTitle.required = adding;

    tableCol1.append(eventTitle);

    const tableCol2 = document.createElement('td');
    tableCol2.classList.add('event-col-2');

    const eventStartDate = document.createElement('input');
    eventStartDate.classList.add('event-start-date');
    eventStartDate.type = 'date';
    eventStartDate.value = event.startDate;
    eventStartDate.readOnly = !adding;
    eventStartDate.required = adding;

    tableCol2.append(eventStartDate);

    const tableCol3 = document.createElement('td');
    tableCol3.classList.add('event-col-3');

    const eventEndDate = document.createElement('input');
    eventEndDate.classList.add('event-end-date');
    eventEndDate.type = 'date';
    eventEndDate.value = event.endDate;
    eventEndDate.readOnly = !adding;
    eventEndDate.required = adding;

    tableCol3.append(eventEndDate);

    const tableCol4 = document.createElement('td');
    tableCol4.classList.add('event-col-4');

    const eventActions = document.createElement('div');
    eventActions.classList.add('event-actions');

    const button1 = document.createElement('button');
    button1.classList.add('event-button-1');
    if(adding) {
      button1.innerHTML = addIcon;
      button1.setAttribute('btn_type', 'add');
    } else {
      button1.innerHTML = editIcon;
      button1.setAttribute('btn_type', 'edit');
    }
  
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.innerHTML = deletIcon;
    deleteButton.setAttribute('btn_type', 'delete')
    // deleteButton.textContent = 'Delete';

    eventActions.append(button1, deleteButton);
    tableCol4.append(eventActions);

    tableRow.append(tableCol1, tableCol2, tableCol3, tableCol4);
    this.tableBody.append(tableRow);
    return eventTitle;
  }

  renderEvents(events) {
    const headerRow = document.createElement('tr');
    headerRow.classList.add('table-header-row');
    const td1 = document.createElement('td');
    const eventHeader = document.createElement('h1');
    eventHeader.textContent = 'Event';
    td1.append(eventHeader);

    const td2 = document.createElement('td');
    const startHeader = document.createElement('h1');
    startHeader.textContent = 'Start';
    td2.append(startHeader);

    const td3 = document.createElement('td');
    const endHeader = document.createElement('h1');
    endHeader.textContent = 'End';
    td3.append(endHeader);

    const td4 = document.createElement('td');
    const actionHeader = document.createElement('h1');
    actionHeader.textContent = 'Actions';
    td4.append(actionHeader);

    headerRow.append(td1, td2, td3, td4)
    this.tableBody.append(headerRow);
    events.forEach(event => {
      this.renderEvent(event, false);
    })
  }
}

// Controller
class EventsController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.init();
  }

  init() {
    this.initData();
    this.setUpEventsListener();
  }

  initData() {
    this.model.fetchData().then(res => {
      this.view.renderEvents(res)
    });
  }

  setUpEventsListener() {
    this.setUpAddEvent();
    this.setUpBtn1Event();
  }

  setUpAddEvent() {
    this.view.addButton.addEventListener('click', e => {
      e.preventDefault();
      const eventTitle = this.view.renderEvent({}, true);
      eventTitle.focus();
    })
  }

  setUpBtn1Event() {
    this.view.tableBody.addEventListener('click', e=> {
      const thisEvent = e.target.parentNode.parentNode.parentNode;
      const domID = thisEvent.id;
      if(e.target.classList.contains('delete-btn')) {
        if(!domID || domID === 'undefined') {
          this.view.tableBody.removeChild(thisEvent);
        } else {
          this.model.deleteEvent(+domID).then(res => {
            this.view.tableBody.removeChild(thisEvent);
          })
        }
      } else if(e.target.classList.contains('event-button-1')) {
        const eventCol1 = thisEvent.querySelector('.event-col-1');
        const eventTitle = eventCol1.querySelector('.event-title');
        const eventCol2 = thisEvent.querySelector('.event-col-2');
        const eventStartDate = eventCol2.querySelector('.event-start-date');
        const eventCol3 = thisEvent.querySelector('.event-col-3');
        const eventEndDate = eventCol3.querySelector('.event-end-date');
        const eventCol4 = thisEvent.querySelector('.event-col-4');
        const eventActions = eventCol4.querySelector('.event-actions');
        const eventBtn1 = eventActions.querySelector('.event-button-1');
        const eventBtn2 = eventActions.querySelector('.delete-btn');

        if(eventTitle.readOnly) {
          eventTitle.readOnly = false;
          eventStartDate.readOnly = false;
          eventEndDate.readOnly = false;
          e.target.innerHTML = saveIcon;
          eventTitle.focus();
        } else {
          const titleValue = eventTitle.value;
          const startDateValue = eventStartDate.value;
          const endDateValue = eventEndDate.value;
          if(!titleValue || titleValue === '' || !startDateValue || startDateValue === '' || !endDateValue || !endDateValue === '') {
            alert('please enter a valid value');
          } else {
            if(eventBtn1.getAttribute('btn_type') === 'add') {
              this.model.addEvent({
                eventName: titleValue,
                startDate: startDateValue,
                endDate: endDateValue
              }).then(res => {
                console.log(res);
              })
            } else if(eventBtn1.getAttribute('btn_type') === 'edit') {
              this.model.updateEvent(+domID, {
                eventName: titleValue,
                startDate: startDateValue,
                endDate: endDateValue
              }).then(res => {
                console.log(res);
              })
            }
            eventTitle.readOnly = true;
            eventStartDate.readOnly = true;
            eventEndDate.readOnly = true;
            e.target.innerHTML = editIcon;
            e.target.setAttribute('btn_type', 'edit');
          }
        }
      } 
    })
  }
}

const model = new EventsModel();
const view = new EventsView();
const controller = new EventsController(model, view);