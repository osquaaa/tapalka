const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Подключение к MongoDB Atlas (замените ваш URI)
const mongoURI =
	'mongodb+srv://myUser:denclassik@cluster0.1jt61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose
	.connect(mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('Подключение к базе данных успешно установлено'))
	.catch(err => console.error('Ошибка подключения к базе данных:', err))

// Определение схемы и модели пользователя
const userSchema = new mongoose.Schema({
	username: String,
	score: { type: Number, default: 0 },
	coins: { type: Number, default: 0 },
	coinsPerClick: { type: Number, default: 1 },
	multiplier: { type: Number, default: 1 },
})

const User = mongoose.model('User', userSchema)

const app = express()
app.use(cors())
app.use(express.json())

app.use(express.static(__dirname))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html') // Убедитесь, что файл существует
})

// Роут для получения данных пользователя
app.get('/user/:username', async (req, res) => {
	const { username } = req.params
	let user = await User.findOne({ username })

	if (!user) {
		user = new User({ username })
		await user.save()
	}

	res.json(user)
})

// Роут для обработки кликов
app.post('/click/:username', async (req, res) => {
	const { username } = req.params
	const user = await User.findOne({ username })

	if (!user) {
		return res.status(404).json({ message: 'Пользователь не найден' })
	}

	user.score += user.coinsPerClick * user.multiplier
	user.coins += user.coinsPerClick
	await user.save()

	res.json(user)
})

// Роут для покупки улучшения +1 к монетам за клик
app.post('/upgrade/click/:username', async (req, res) => {
	const { username } = req.params
	const user = await User.findOne({ username })

	if (!user) {
		return res.status(404).json({ message: 'Пользователь не найден' })
	}

	const upgradePrice = user.coinsPerClick * 100
	if (user.coins < upgradePrice) {
		return res
			.status(400)
			.json({ message: 'Недостаточно монет для покупки улучшения' })
	}

	user.coins -= upgradePrice
	user.coinsPerClick += 1
	await user.save()

	res.json({ message: 'Улучшение успешно куплено', user })
})

// Роут для покупки удвоения монет за клик
app.post('/upgrade/double/:username', async (req, res) => {
	const { username } = req.params
	const user = await User.findOne({ username })

	if (!user) {
		return res.status(404).json({ message: 'Пользователь не найден' })
	}

	const upgradePrice = user.multiplier * 10000
	if (user.coins < upgradePrice) {
		return res
			.status(400)
			.json({ message: 'Недостаточно монет для покупки улучшения' })
	}

	user.coins -= upgradePrice
	user.multiplier *= 2
	await user.save()

	res.json({ message: 'Улучшение успешно куплено', user })
})

// Роут для получения топа пользователей (по убыванию счета)
app.get('/top-users', async (req, res) => {
	try {
		const topUsers = await User.find()
			.sort({ score: -1 }) // Сортировка по убыванию счета
			.limit(10) // Ограничение до 10 пользователей

		res.json(topUsers)
	} catch (err) {
		res.status(500).json({ message: 'Ошибка при получении топа пользователей' })
	}
})

// Динамический порт, предоставленный Render
app.listen(process.env.PORT || 3000, () => {
	console.log('Сервер запущен')
})
