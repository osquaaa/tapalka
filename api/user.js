const { fetchUserData, updateUserData } = require('../db') // Подключаем функции для работы с MongoDB

module.exports = async (req, res) => {
	const { username } = req.query

	if (req.method === 'GET') {
		try {
			const user = await fetchUserData(username)
			return res.status(200).json(user)
		} catch (err) {
			return res.status(404).json({ message: err.message })
		}
	} else if (req.method === 'POST') {
		try {
			const user = await fetchUserData(username)
			const updatedUser = {
				score: user.score + user.coinsPerClick,
				coins: user.coins + user.coinsPerClick,
			}
			const success = await updateUserData(username, updatedUser)

			if (success) {
				return res.status(200).json(updatedUser)
			} else {
				throw new Error('Ошибка при обновлении данных')
			}
		} catch (err) {
			return res.status(500).json({ message: err.message })
		}
	}
}
