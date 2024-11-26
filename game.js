const username = prompt('Введите ваше имя пользователя:') || 'guest'

let score = 0
let coins = 0
let coinsPerClick = 1
let multiplier = 1

// Функция для обновления данных пользователя
async function fetchUser() {
  try {
    const response = await fetch(`http://localhost:5000/user/${username}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Пользователь не найден');
    }
    const user = await response.json();
    score = user.score;
    coins = user.coins;
    coinsPerClick = user.coinsPerClick;
    multiplier = user.multiplier;
    updateUI();
  } catch (err) {
    alert(err.message);  // Показываем ошибку
  }
}

// Функция для получения топа пользователей
async function fetchTopUsers() {
	try {
		const response = await fetch('http://localhost:5000/top-users')
		if (!response.ok) {
			throw new Error('Ошибка при получении топа пользователей')
		}
		const users = await response.json()
		displayTopUsers(users) // Обновляем интерфейс с топом
	} catch (err) {
		alert(err.message)
	}
}

// Функция для отображения топа пользователей
function displayTopUsers(users) {
	const topUsersList = document.getElementById('top-users')
	topUsersList.innerHTML = '' // Очищаем текущий список

	// Для каждого пользователя из топа создаем строку
	users.forEach(user => {
		const userElement = document.createElement('p')
		userElement.textContent = `${user.username}: ${user.score} очков`
		topUsersList.appendChild(userElement)
	})
}

// Загружаем топ пользователей при загрузке страницы
fetchTopUsers()

// Функция для клика по монете
async function clickCoin() {
	try {
		const response = await fetch(`http://localhost:5000/click/${username}`, {
			method: 'POST',
		})
		if (!response.ok) {
			throw new Error('Ошибка при обработке клика')
		}
		const user = await response.json()
		score = user.score
		coins = user.coins
		updateUI()
	} catch (err) {
		alert(err.message)
	}
}

// Функция для покупки +1 к монетам за клик
async function buyClickUpgrade() {
	try {
		const response = await fetch(
			`http://localhost:5000/upgrade/click/${username}`,
			{ method: 'POST' }
		)
		if (!response.ok) {
			const data = await response.json()
			throw new Error(data.message || 'Ошибка при покупке улучшения')
		}
		const data = await response.json()
		alert(data.message)
		fetchUser() // Обновляем данные пользователя после покупки
	} catch (err) {
		alert(err.message)
	}
}

// Функция для покупки удвоения монет за клик
async function buyDoubleUpgrade() {
	try {
		const response = await fetch(
			`http://localhost:5000/upgrade/double/${username}`,
			{ method: 'POST' }
		)
		if (!response.ok) {
			const data = await response.json()
			throw new Error(data.message || 'Ошибка при покупке улучшения')
		}
		const data = await response.json()
		alert(data.message)
		fetchUser() // Обновляем данные пользователя после покупки
	} catch (err) {
		alert(err.message)
	}
}

// Функция обновления интерфейса
function updateUI() {
	document.getElementById('score').textContent = `Счет: ${score}`
	document.getElementById('coins').textContent = `Монеты: ${coins}`
	document.getElementById('upgrade-click').textContent = `+1 К КЛИКУ (${
		coinsPerClick * 100
	} монет)`
	document.getElementById('upgrade-double').textContent = `ДАБЛ КЛИК (${
		multiplier * 10000
	} монет)`
}

// Добавление обработчиков событий
document.getElementById('coin').addEventListener('click', clickCoin)
document
	.getElementById('upgrade-click')
	.addEventListener('click', buyClickUpgrade)
document
	.getElementById('upgrade-double')
	.addEventListener('click', buyDoubleUpgrade)

// Загрузка данных пользователя при входе
fetchUser()
