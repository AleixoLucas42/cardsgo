const todo = [];
const doing = [];
const done = [];
const blocked = [];

const cardsgo_url = window.location.protocol + "//" + window.location.host

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function removeItem(list, item) {
  const index = list.findIndex(todoElement => todoElement.id == item.detail[1].id);
  if (index > -1) {
    list.splice(index, 1);
  }
}

function addItem(list, item) {
  list.push(JSON.parse(item.detail[1].alt));
  saveCards();
}

function showNotification(item, status, msg) {
  const data = item?.detail?.[1]?.alt ? JSON.parse(item?.detail?.[1]?.alt) : {};
  UIkit.notification({
    message: `${msg} ${data?.name || ""}`,
    pos: 'bottom-right',
    status,
    timeout: 5000
  });
}

function createTriggerTodo() {
  UIkit.util.on('#Todo', 'removed', function (item) {
    removeItem(todo, item);
  });

  UIkit.util.on('#Todo', 'added', function (item) {
    addItem(todo, item);
    console.log(todo)
    showNotification(item, null, "NEW ITEM");
  });
}

function createTriggerDoing() {
  UIkit.util.on('#Doing', 'removed', function (item) {
    removeItem(doing, item);
  });

  UIkit.util.on('#Doing', 'added', function (item) {
    addItem(doing, item);
    showNotification(item, "primary", "DOING");
  });
}

function createTriggerDone() {
  UIkit.util.on('#Done', 'removed', function (item) {
    removeItem(done, item);
  });

  UIkit.util.on('#Done', 'added', function (item) {
    addItem(done, item);
    showNotification(item, "success", "DONE");
  });
}

function createTriggerBlocked() {
  UIkit.util.on('#Blocked', 'removed', function (item) {
    removeItem(blocked, item);
  });

  UIkit.util.on('#Blocked', 'added', function (item) {
    addItem(blocked, item);
    showNotification(item, "danger", "BLOCKED");
  });
}

function createTriggerTrash() {
  UIkit.util.on('#Trash', 'added', function (item) {
    rm = document.getElementById('Trash');
    rm.innerHTML = '';
    UIkit.notification({
      message: `${item.detail[1].id} DELETED`,
      status: 'danger',
      pos: 'bottom-right',
      timeout: 5000
    });
  });
}

function createTriggers() {
  createTriggerTodo();
  createTriggerDoing();
  createTriggerDone();
  createTriggerBlocked();
  createTriggerTrash();
}

setTimeout(() => {
  createTriggers();
}, 1000);

async function saveCards() {
  await sleep(2000);
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let user = urlParams.get('project');

  let send_data = {
    user: user,
    todo: todo.map(t => t),
    doing: doing.map(d => d),
    done: done.map(n => n),
    blocked: blocked.map(b => b)
  }
  console.log(send_data);

  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(send_data),
    redirect: 'follow'
  };
  fetch(cardsgo_url + "/cards", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}
function getCards(user) {
  let requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  return fetch(cardsgo_url + `/cards?project=${user}`, requestOptions)
    .then(response => response.text())
    .then(result => { return result })
    .catch(error => console.log('error', error));
}
function init() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const user = urlParams.get('project');
  //tem um bug aqui que se vc apertar enter duas vezes na hora de pedir o usuário ele cria um usuário com o nome do parametro
  if (!user) {
    console.log('Project empty');
    let project = prompt("Project:");
    while (project === "null" || project === "") {
      project = prompt("Project:");
    }
    window.location.href = cardsgo_url + `?project=${project}`
  }
  let cards = null;
  let template = null;

  const rootDiv = document.getElementById('idproject');
  rootDiv.innerText = user;

  getCards(user).then(apiResult => {
    template = JSON.parse(apiResult);
    cards = JSON.parse(template[0].data);
    cards.todo.forEach(element => {
      addCard(element.name, element.weekday, 'Todo')
    });
    cards.doing.forEach(element => {
      addCard(element.name, element.weekday, 'Doing')
    });
    cards.done.forEach(element => {
      addCard(element.name, element.weekday, 'Done')
    });
    cards.blocked.forEach(element => {
      addCard(element.name, element.weekday, 'Blocked')
    });
  });
  setTimeout(() => {
    UIkit.util.on('#add-modal-prompt', 'click', function (e) {
      e.preventDefault();
      createCardForm();
    });
  }, 1000);

}
function triggerSave() {
  let input = document.getElementsByTagName('input');
  let timeout = null;
  let doc = this;
  input.addEventListener('keyup', function (e) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      doc.saveCards();
    }, 1500)
  })
}


function createCardData(cardName, weekday) {
  return {
    id: new Date().getTime() + cardName,
    name: cardName,
    weekday: weekday
  }
}

function addCard(cardName, weekday = 'Any', col) {
  let cardData = createCardData(cardName, weekday);
  if (col == 'Todo') {
    todo.push(cardData);
  } else if (col == 'Doing') {
    doing.push(cardData);
  } else if (col == 'Done') {
    done.push(cardData);
  } else if (col == 'Blocked') {
    blocked.push(cardData);
  }

  let iDiv = document.createElement('div');
  iDiv.id = cardData.id;
  iDiv.alt = JSON.stringify(cardData);
  iDiv.className = 'uk-margin';
  document.getElementById(col).appendChild(iDiv);
  let innerCard = document.createElement('div');
  innerCard.className = 'uk-card uk-card-default uk-card-body uk-card-small uk-background-primary uk-light';

  let innerCardBadge = document.createElement('div');
  innerCardBadge.className = 'uk-card-badge';
  let innerCardLabel = document.createElement('span');
  innerCardLabel.textContent = weekday;

  innerCardLabel.className = 'uk-label-success uk-label';
  innerCardBadge.appendChild(innerCardLabel);


  let innerHead = document.createElement('div');
  innerHead.className = 'uk-card-header';
  innerHead.appendChild(innerCardBadge);
  innerCard.appendChild(innerHead);

  let innerFooter = document.createElement('div');
  innerFooter.className = 'uk-card-footer';
  innerFooter.textContent = cardName;

  innerCard.appendChild(innerFooter);

  iDiv.appendChild(innerCard);

  UIkit.notification({
    message: `NEW ITEM: ${cardName}`,
    pos: 'bottom-right',
    timeout: 5000
  });

  console.log('Adedded item:', cardName);

  saveCards();
}



function createCardForm() {
  const weekdays = ["Any", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  let modalContainer = document.createElement('div');
  let modalWrapper = document.createElement('div');
  modalWrapper.id = 'modal-wrapper';
  modalWrapper.className = 'uk-modal-body';

  let form = document.createElement("div");
  form.className = 'uk-child-width-expand@s';

  let cardNameSpan = document.createElement('span');
  cardNameSpan.textContent = 'Task name';

  form.appendChild(cardNameSpan);

  let input = document.createElement("input");
  input.className = 'uk-input';
  input.placeholder = 'Item name';
  input.id = 'form-card-input';

  form.appendChild(input);

  let weekdaysSpan = document.createElement('span');
  weekdaysSpan.textContent = 'Weekday';

  form.appendChild(weekdaysSpan);

  let select = document.createElement("select");
  select.id = 'form-weekday-select';
  select.className = 'uk-select';
  for (let weekday of weekdays) {
    let option = document.createElement("option");
    option.textContent = weekday;
    select.appendChild(option);
  }

  form.appendChild(select);

  let buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'uk-text-right';

  let cancelButton = document.createElement('button');
  cancelButton.className = 'uk-button uk-button-default uk-modal-close uk-margin-left uk-margin-top';
  cancelButton.textContent = 'CANCEL';


  let saveButton = document.createElement('button');
  saveButton.id = 'save-card-btn';
  saveButton.className = 'uk-button uk-button-primary uk-margin-left uk-margin-top';
  saveButton.textContent = 'OK';

  buttonWrapper.appendChild(cancelButton);
  buttonWrapper.appendChild(saveButton);

  form.appendChild(buttonWrapper);

  modalWrapper.appendChild(form);
  modalContainer.appendChild(modalWrapper);

  let modal = UIkit.modal.dialog(modalContainer.innerHTML);

  document.getElementById('save-card-btn').addEventListener("click", () => {
    let cardName = document.getElementById('form-card-input').value;
    let weekday = document.getElementById('form-weekday-select').value;

    if (cardName.length > 0) {
      addCard(cardName, weekday, 'Todo');
      modal.hide();
    } else {
      showNotification('', 'danger', 'The field Task name is mandatory!');
    }
  });

}

function filterData(value) {

  let todoElements = document.getElementById('Todo').children;
  let doingElements = document.getElementById('Doing').children;
  let blockedElements = document.getElementById('Blocked').children;
  let doneElements = document.getElementById('Done').children;
  filterElements(todoElements, value);
  filterElements(doingElements, value);
  filterElements(blockedElements, value);
  filterElements(doneElements, value);

  document.getElementById('close-weekday-filter').click();

}

function filterElements(elements, value) {
  for (let card of elements) {
    const cardData = JSON.parse(card.alt);
    if (value != 'Any') {
      if (cardData.weekday == value) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    } else {
      card.style.display = 'block';
    }
  }
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'a') {
    event.preventDefault();
    createCardForm();
  }
});

setTimeout(() => {
  init();

  document.getElementById("form-horizontal-select").addEventListener("change", (event) => {
    filterData(event.target.value)
  });
}, 1000);
