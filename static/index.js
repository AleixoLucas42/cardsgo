const todo = [];
const doing = [];
const done = [];
const blocked = [];
const cardsgo_url = window.location.protocol + "//" + window.location.host

function removeItem(list, item) {
    list.splice(list.indexOf(item.detail[1].id), 1);
}

function addItem(list, item) {
    list.push(item.detail[1].id);
    saveCards();
}

function showNotification(item, status, msg) {
    UIkit.notification({
        message: `${msg}: ${item.detail[1].id}`,
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

function saveCards(){
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
    fetch( cardsgo_url + "/cards", requestOptions)
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
    if (!user){
        console.log('Project empty');
        let project = prompt("Project:");
        while (project === "null" || project === ""){
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
            addCard(element, 'Todo')
            todo.push(element)
        });
        cards.doing.forEach(element => {
            addCard(element, 'Doing')
            doing.push(element)
        });
        cards.done.forEach(element => {
            addCard(element, 'Done')
            done.push(element)
        });
        cards.blocked.forEach(element => {
            addCard(element, 'Blocked')
            blocked.push(element)
        });
    });
    setTimeout(() => {
        UIkit.util.on('#add-modal-prompt', 'click', function (e) {
            e.preventDefault();
            e.target.blur();
            UIkit.modal.prompt('Item name:', '').then(function (name) {
                if (name) {
                    todo.push(name);
                    addCard(name, 'Todo');
                };
            });
        });
    }, 1000);
    
}
function triggerSave(){
    let input = document.getElementsByTagName('input');
    let timeout = null;
    let doc = this;
    input.addEventListener('keyup', function(e){
        clearTimeout(timeout);
        timeout = setTimeout(function (){
            doc.saveCards();
        }, 1500)
    })
}
function addCard(cardName, col) {
    let iDiv = document.createElement('div');
    iDiv.id = cardName;
    iDiv.className = 'uk-margin';
    document.getElementById(col).appendChild(iDiv);

    let innerDiv = document.createElement('div');
    innerDiv.textContent = cardName;
    innerDiv.className = 'uk-card uk-card-default uk-card-body uk-card-small uk-background-primary uk-light';

    iDiv.appendChild(innerDiv);
    UIkit.notification({
        message: `NEW ITEM: ${cardName}`,
        pos: 'bottom-right',
        timeout: 5000
    });
    
    console.log('Adedded item:', cardName);
    saveCards();
}

setTimeout(() => {
    init()  
}, 1000);
