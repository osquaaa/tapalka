const mongoose = require('mongoose')

// Подключение к MongoDB
mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('Подключение к MongoDB успешно!'))
	.catch(err => console.error('Ошибка при подключении к MongoDB', err))

// Схема пользователя
const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	score: { type: Number, default: 0 },
	coins: { type: Number, default: 0 },
	coinsPerClick: { type: Number, default: 1 },
	multiplier: { type: Number, default: 1 },
})

const User = mongoose.model('User', userSchema)

// Функция для получения данных пользователя
async function fetchUserData(username) {
	try {
		const user = await User.findOne({ username })
		if (user) {
			return user
		} else {
			throw new Error('Пользователь не найден')
		}
	} catch (error) {
		throw new Error('Ошибка при получении данных')
	}
}

// Функция для обновления данных пользователя
async function updateUserData(username, update) {
	try {
		const result = await User.updateOne({ username }, { $set: update })
		return result.nModified > 0
	} catch (error) {
		throw new Error('Ошибка при обновлении данных')
	}
}

module.exports = { fetchUserData, updateUserData }
