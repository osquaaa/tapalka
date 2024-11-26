const mongoose = require('mongoose')

// Строка подключения к MongoDB (используйте переменные окружения на Vercel)
const mongoURI =
	'mongodb+srv://myUser:denclassik@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority'
mongoose
	.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.error('MongoDB connection error:', err))

const userSchema = new mongoose.Schema({
	username: String,
	score: { type: Number, default: 0 },
	coins: { type: Number, default: 0 },
	coinsPerClick: { type: Number, default: 1 },
	multiplier: { type: Number, default: 1 },
})

const User = mongoose.model('User', userSchema)

// Эта функция будет обрабатывать запросы на /api/top-users
module.exports = async (req, res) => {
	try {
		const topUsers = await User.find()
			.sort({ score: -1 }) // Сортировка по убыванию счета
			.limit(10) // Ограничение до 10 пользователей

		res.json(topUsers)
	} catch (err) {
		res.status(500).json({ message: 'Ошибка при получении топа пользователей' })
	}
}
