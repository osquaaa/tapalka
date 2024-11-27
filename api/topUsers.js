const mongoose = require('mongoose')

if (!mongoose.connection.readyState) {
	mongoose.connect(
		'mongodb+srv://myUser:denclassik@cluster0.1jt61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
}

const User = mongoose.model(
	'User',
	new mongoose.Schema({
		username: String,
		score: { type: Number, default: 0 },
		coins: { type: Number, default: 0 },
		coinsPerClick: { type: Number, default: 1 },
		multiplier: { type: Number, default: 1 },
	})
)

module.exports = async (req, res) => {
	try {
		const topUsers = await User.find().sort({ score: -1 }).limit(10)
		res.status(200).json(topUsers)
	} catch (err) {
		res.status(500).json({ message: 'Ошибка при получении топа пользователей' })
	}
}
