function checkWorkingNode() {
    const NODES = [
        "https://golos.lexa.host",
		"https://api.golos.blckchnd.com",
		"https://api.aleksw.space",
"https://golos.solox.world",
"https://apinode.golos.today"
    ];
    let node = localStorage.getItem("golos_node") || NODES[0];
    const idx = Math.max(NODES.indexOf(node), 0);
    let checked = 0;
    const find = (idx) => {
        if (idx >= NODES.length) {
            idx = 0;
        }
        if (checked >= NODES.length) {
            alert("no working nodes found");
            return;
        }
        node = NODES[idx];
        console.log("check", idx, node);
        golos.config.set("websocket", node);
        try {
            golos.api.stop();
        } catch(e) {
        }
        
        let timeout = false;
        let timer = setTimeout(() => {
            console.log("timeout", NODES[idx])
            timeout = true;
            find(idx + 1);
        }, 3000);
        golos.api.getDynamicGlobalPropertiesAsync()
            .then(props => {
                if(!timeout) {
                    check = props.head_block_number;
                    console.log("found working node", node);
                    localStorage.setItem("golos_node", node);
                    clearTimeout(timer);
                }
            })
            .catch(e => {
                console.log("connection error", node, e);
                find(idx + 1);
            });
    }
    find(idx);
}
checkWorkingNode();

  var user_following = [];
  
  function sendDonate(author, permlink) {
	let amount = $('input[name=donate_amount]').val();
	amount = parseFloat(amount);
	amount = amount.toFixed(3) + ' GOLOS';
let user = getUserData();
	let account = user[0];
	let posting_key = user[1];
	golos.broadcast.donate(posting_key, account, author, amount, {app: 'golos-dnevnik', version: 1, comment: `Донат за запись дневника от ${permlink}`, target: {author, permlink}}, [], function(err, result) {
 if (!err) {
	 window.alert('Вы отблагодарили успешно.');
	 getUserData();
 } else {
	 window.alert('Ошибка: ' + err);
 }
	});
	}

function openURL(location, login) {
				history.pushState({},'','#'+location);
				getCurrentPage();
}

function loadContent(author, permlink, login, posting_key) {
golos.api.getContent(author, permlink, function(err, res) {
let follow = '<span id="follow" class="terms">';
			if(user_following.includes(author))
			{
				follow += "<button class='btn btn-warning' onClick='follow(\""+author+"\", \"\"); style.display=\"none\"'>Отписаться</button> ";
			}
			else
			{
			follow += "<button class='btn btn-success' onClick='follow(\""+author+"\", \"blog\"); style.display=\"none\"'>Подписаться</button> ";
			}			
			follow += '</span>';
		var content = `${follow}
<h1>Запись дневника от автора ${author}, дата: ${permlink}</h1>
`;
		if (err || res && res.body === '') {
		content += `<h2>Запись дневника не найдена</h2>
<p>Возможно, пользователь опубликовал запись вчера или в предыдущие дни.</p>`;
		} else if (res.body.indexOf('{"') > -1) {
		if (author === login) {
					content += sjcl.decrypt(author + '_cryptSingle' + posting_key, res.body);
				} else {
					content += `<h2>К сожалению, вы не являетесь автором этой записи, а она зашифрована</h2>
<p>Перейдите к предыдущей записи или выберите другого автора.</p>`;
				}
		} else {
			if (res.body.indexOf('<h2>') > -1) {
				content += res.body;
			
				}
content += `<h2>Понравилось? Отправьте донат</h2>
<form>
<p><input type="text" name="donate_amount" value="" placeholder="Сумма доната"></p>
<p><input type="button" value="Отблагодарить" onclick="sendDonate('${author}', '${permlink}')"></p>
</form>`;
				}
let prev_post = new Date(Date.parse(permlink)-86400000).toISOString().split('T')[0];
	content += `<p><a href="#@${author}/${prev_post}">Предыдущая запись</a></p>`;
	if (Date.parse(permlink)+86400000 <= Date.now()) {
	let next_post = new Date(Date.parse(permlink)+86400000).toISOString().split('T')[0];
	content += `<p><a href="#@${author}/${next_post}">Следующая запись</a></p>`;
}
				$('.content').html(content);
				});
}

function getToTipBalance(account, posting_key, balance) {
	golos.broadcast.claim(posting_key, account, account, balance, false, [], function(err, res) {
 if (!err) {
	 window.alert('Успешно.');
 getUserData();
 			$('#get_accumulative_balance').css('display', 'none');
 } else {
	 window.alert('Ошибка: ' + err);
 }
	});
 }

function showAccountBalances(login, key) {
	golos.api.getAccounts([login], function(err, result) {
		if (!err && result.length > 0) {
			$('#tip_balance').html(result[0].tip_balance);
		$('#accumulative_balance').html(result[0].accumulative_balance);
		if (result[0].accumulative_balance !== '0.000 GOLOS') {
			$('#get_accumulative_balance').css('display', 'inline');
			$('#get_accumulative_balance').html(`(<input type="button" onclick="getToTipBalance('${result[0].name}', '${key}', '${result[0].accumulative_balance}')" value="Получить">)`);
		}
		}
	});
}

function getCurrentPage() {
let user_data = getUserData();
let login = user_data[0];
let posting_key = getUserData[1];
var hash = location.hash.substring(1);
if (hash === '') {
        $('.content').html($('#home').html());
	} else if (hash === 'my_dnevnik') {
		openURL(`@${login}`, login);
	} else if (hash === 'top') {
		var query = {
  select_categories: ['golos-dnevnik'],
  limit: 100,
  truncate_body: 0
};
golos.api.getDiscussionsByDonates(query, function(err, result) {
  if (!err) {
let content = `<h1>Топ записей дневников</h1>
<ol>`;
  for (let item of result) {
content += `<li><a href="#@${item.author}/${item.permlink}">${item.title}</a> от <a href="#@${item.author}">${item.author}</a></li>`;
    }
    content += `</ol>`;
  $('.content').html(content);
  }
  else console.error(err);
  });
		} else if (hash.indexOf('@') > -1) {
		let dnevnik = hash.split('@')[1];
if (dnevnik.indexOf('/') > -1) {
	let single = dnevnik.split('/');
	loadContent(single[0], single[1], login, posting_key);
} else {
	let author = dnevnik;
let permlink = new Date().toISOString().split('T')[0];
loadContent(author, permlink, login, posting_key);
}
	} else {
        let id_in_page = document.getElementById(hash);
        if (id_in_page && login) {
            $('.content').html($(id_in_page).html());
        }
    }
}

function getUserData() {
let data = {};
data[0] = localStorage.getItem('dnevnik_login');
data[1] = '';
if (localStorage.getItem('dnevnik_posting')) {
data[1] = sjcl.decrypt('dnevnik_golos_' + data[0] + '_postingKey', localStorage.getItem('dnevnik_posting'));
}
if (data[0] && data[0] !== '' && data[1] && data[1] !== '') {
    	$('#logout').css('display', 'block');
    	$('#user_balance').css('display', 'block');
		showAccountBalances(data[0], data[1]);
        $('#auth').css('display', 'none');
$('#account_login').html(data[0]);
} else {
    $('#logout').css('display', 'none');
    	$('#user_balance').css('display', 'none');
	$('#auth').css('display', 'block');
}
return data;
}

function setUserData() {
let user = $('#user_login').val();
let posting_field = $('#user_posting').val();
    golos.api.getAccounts([user], function(err, res) {
    if (!err && res.length > 0) {
        let acc = res[0];
let posting = '';
        if (posting_field) {
    const public_wif = golos.auth.wifToPublic(posting_field);
let posting_public_keys = [];
for (key of acc.posting.key_auths) {
posting_public_keys.push(key[0]);
}
if (posting_public_keys.includes(public_wif)) {
posting = sjcl.encrypt('dnevnik_golos_' + user + '_postingKey', posting_field);
    localStorage.setItem("dnevnik_login", user);
    localStorage.setItem("dnevnik_posting", posting);
getUserData();
getCurrentPage();
}
}
}
});
}

function logoutAction() {
    localStorage.removeItem('dnevnik_login');
    localStorage.removeItem('dnevnik_posting');
    $('#logout').css('display', 'none');
$('#auth').css('display', 'block');
}

	window.addEventListener('hashchange', function(e) {
var status = getUserData();
	if (status[0] && status[1]) {
	getCurrentPage();
	}
  });
  
  // Для подписок
function follow(golos_login, posting_key, author, what)
{
	var json=JSON.stringify(['follow',{follower:golos_login,following:author,what:[what]}]);
	golos.broadcast.customJson(posting_key,[],[golos_login],'follow',json,function(err, result){
		console.log(JSON.stringify(err));
		if(!err){
console.log(JSON.stringify(result));
		}
		else{
			//user_card_action.wait=0;
			//add_notify('<strong>'+l10n.global.error_caption+'</strong> '+l10n.errors.broadcast,10000,true);
		}
	});
}


function getFollowing(login, posting_key, start, me)
{
	golos.api.getFollowing(login, start, 'blog', 100, function(err, data){
		//console.log(err, data);
		if(data && data.length > 1 && me == true){
			var i = user_following.length - 1;
			var latest = '';
			if(start != '')
			{
				data.shift();
			}
			data.forEach(function (operation){
				i++;
				user_following[i] = operation.following;
				//console.log(i, operation.follower);
				latest = operation.following;
			});
			getFollowing(login, posting_key, latest, me);
		}
	});
}

window.onFollowingLoaded = function(following, login, posting) {
	following.forEach(function (data, num){
		$("#following_table").append('<tr><td><a href="#@' + data + '">@' + data + '</a></td>\
  <td><button class="btn btn-success" id="success' + num + '" style="display:none;" onclick="follow(\''+login+'\', \''+posting+'\', \''+data+'\', \'blog\'); style.display=\'none\'; document.getElementById(\'warning' + num + '\').style.display=\'block\'; window.alert(\'Вы подписались на пользователя.\')">Подписаться</button><button class="btn btn-warning" id="warning' + num + '" onclick="follow(\''+login+'\', \''+posting+'\', \''+data+'\', \'\'); style.display=\'none\'; document.getElementById(\'success' + num + '\').style.display=\'block\'; window.alert(\'Вы отписались от пользователя.\')">Отписаться</button></td>\
          </tr>');
    });
  };

function getFollowingMe()
{
        let user = getUserData();
if (user[0] && user[1]) {
    getCurrentPage();
}
        golos.api.getFollowing(user[0], '', 'blog', 100, function(err, data){
		if(data)
		{
			var i = 0;
			data.forEach(function (operation){
				user_following[i] = operation.following;	
				i++;
                latest = operation.following;
            });
			if(latest != '' && data.length == 100)
			{
				getFollowing(user[0], user[1], latest, true);
			}

            window.onFollowingLoaded(user_following, user[0], user[1])
		}else{
			console.log(err);
		}
		
	});
}

getFollowingMe();


//Массивы
const regardsArray = [];
const progressArray = [];
const ideasArray = [];
const plansArray = [];

//Переменные
const sendForm = document.querySelector('.send-form');

//Благодарность
const regardsForm = document.forms.regards;
const regardsInput = regardsForm.elements.regards__input;

//Достижения
const progressForm = document.forms.progress;
const progressInput = progressForm.elements.progress__input;

//Идеи
const ideasForm = document.forms.ideas;
const ideasInput = ideasForm.elements.ideas__input;


//Планы
const plansForm = document.forms.plans;
const plansInput = plansForm.elements.plans__input;




//Классы

//Добавляет в контейнер
class ListCard {
  constructor(container, array) {
    this.container = container;
    this.array = array;
  }
  add(nameValue) {
    let name = nameValue;
    this.array.push(name);
    const cardElement = new Row(name, this.container, this.array);
    this.container.appendChild(cardElement.cardContainer);
  }
}


//Создает строку
class Row {
  constructor(title, container, array) {
    this.title = title;
    this.array = array;
    this.cardContainer = this.create();
    this.cardContainer.querySelector('.delete-button').addEventListener('click', (event) => {
        this.remove(event);
    })
    this.container = container;
  }
  create() {
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('row');
    const templateCards = `
      <p class="title">${this.title}</p>
      <button class='delete-button'>Удалить</button>
      `;
    cardContainer.innerHTML = templateCards;
    return cardContainer; 
  }

  remove(event) {
    let confirmDelete = confirm('Вы уверены что хотите удалить файл?');
    if (confirmDelete) {
        let result = this.array.findIndex((item) => {
            return item == this.title;
        })
        this.array.splice(result, 1);
        this.container.removeChild(event.target.parentNode);
    }
  }
}


//Проверка наличия дублирования.
class Validate {
    constructor(value, array) {
        this.value = value;
        this.array = array;

    }
    check() {
        if (this.array.includes(this.value)) {
            return false;
        } else {
            return true;
        }
    }
}

//Инициализирует все классы
class Initial {
    constructor(array, value, container) {
        this.array = array;
        this.value = value;
        this.container = container;
        this.validate = new Validate(value, array).check();
    }
    create() {
        if (this.value != '' && this.validate) {
            new ListCard(this.container, this.array).add(this.value);
        }
    }
}

//Функции
function postData(event) {
    event.preventDefault();
    var post = [i('tittle').value, i('body').value];
      console.log(post);
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(post),
    }).then(response => response.json())
    .then((data) =>  console.log(data))
}

//Слушатели
regardsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    new Initial(regardsArray, regardsInput.value, document.querySelector('.regards__container')).create();
    regardsForm.reset();
})

progressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    new Initial(progressArray, progressInput.value, document.querySelector('.progress__container')).create();
    progressForm.reset();
})

ideasForm.addEventListener('submit', (e) => {
    e.preventDefault();
    new Initial(ideasArray, ideasInput.value, document.querySelector('.ideas__container')).create();
    ideasForm.reset();
})

plansForm.addEventListener('submit', (e) => {
    e.preventDefault();
    new Initial(plansArray, plansInput.value, document.querySelector('.plans__container')).create();
    plansForm.reset();
})

sendForm.addEventListener('click', (e) => {
    e.preventDefault();
    	var crypt = document.getElementById('crypt_single');
	let data = `<h2>Благодарности</h2>
<ul>`;
for (let regard of regardsArray) {
    data += `<li>${regard}</li>
`;
}

data += `</ul>
<h2>Достижения</h2>
<ol>`;
for (let progress of progressArray) {
    data += `<li>${progress}</li>
`;
}

data += `</ol>
<h2>Идеи и мысли</h2>
<ul>`;
for (let idea of ideasArray) {
    data += `<li>${idea}</li>
`;
}

data += `</ul>
<h2>Планы на сегодня</h2>
<ol>`;
for (let plan of plansArray) {
    data += `<li>${plan}</li>
`;
}
data += `</ol>
<p>Запись дневника создана при помощи <a href="https://denis-skripnik.github.io/golos-dnevnik" target="_blank">Golos-dnevnik</a> от @denis-skripnik</p>`;
let user_data = getUserData();
var author = user_data[0];
var wif = user_data[1];
var parentAuthor = '';
var parentPermlink = 'golos-dnevnik';
var permlink = new Date().toISOString().split('T')[0];
var title = 'Дневник ' + permlink;
var jsonMetadata = '{"app": "golos-dnevnik", "version": 1.0}';
	if (crypt.checked) {
parentPermlink = 'golos-dnevnik-crypt'
	data = sjcl.encrypt(author + '_cryptSingle' + wif, data);
	}
golos.broadcast.comment(wif, parentAuthor, parentPermlink, author, permlink, title, data, jsonMetadata, function(err, result) {
  if (!err) {
$('.content').html(`<h2>Пост опубликован успешно</h2>
<p>Можно публиковать лишь одну запись дневника в сутки. Вторая и следующие публикации будут означать, что вы редактируете запись.</p>`);
  }
  else {
    $('.content').html(`<h2>Ошибка</h2>
<p>${err}</p>`);
  }

});
console.log(data);
});
