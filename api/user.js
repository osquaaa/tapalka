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
	const { username } = req.query
	let user = await User.findOne({ username })

	if (!user) {
		user = new User({ username })
		await user.save()
	}

	res.status(200).json(user)
}
