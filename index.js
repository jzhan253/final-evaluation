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
      button1.textContent = 'Add';
    } else {
      button1.textContent = 'Edit';
    }
  
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.textContent = 'Delete';

    eventActions.append(button1, deleteButton);
    tableCol4.append(eventActions);

    tableRow.append(tableCol1, tableCol2, tableCol3, tableCol4);
    this.tableBody.append(tableRow);
  }

  renderEvents(events) {
    this.tableBody.innerHTML = `<tr class="table-header-row">
                                    <td>Event</td>
                                    <td>Start</td>
                                    <td>End</td>
                                    <td>Actions</td>
                                  </tr>`;
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
      this.view.renderEvent({}, true);
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
          e.target.textContent = 'Save';
          eventTitle.focus();
        } else {
          const titleValue = eventTitle.value;
          const startDateValue = eventStartDate.value;
          const endDateValue = eventEndDate.value;
          if(!titleValue || titleValue === '' || !startDateValue || startDateValue === '' || !endDateValue || !endDateValue === '') {
            alert('please enter a valid value');
          } else {
            if(eventBtn1.textContent === 'Add') {
              this.model.addEvent({
                eventName: titleValue,
                startDate: startDateValue,
                endDate: endDateValue
              }).then(res => {
                console.log(res);
              })
            } else if(eventBtn1.textContent === 'Save') {
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
            e.target.textContent = 'Edit';
          }
        }
      } 
    })
  }
}

const model = new EventsModel();
const view = new EventsView();
const controller = new EventsController(model, view);