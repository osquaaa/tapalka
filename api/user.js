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

// Эта функция будет обрабатывать запросы на /api/user/:username
module.exports = async (req, res) => {
	const { username } = req.query

	let user = await User.findOne({ username })
	if (!user) {
		// Если пользователь не найден, создаем нового
		user = new User({ username })
		await user.save()
	}

	res.json(user)
}
