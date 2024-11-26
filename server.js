const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Жестко прописанные значения для подключения к MongoDB и фронтенд-домену
const mongoURI = 'mongodb+srv://myUser:denclassik@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority';
const frontendURL = 'https://tapalka-rho.vercel.app';  // Ваш продакшн фронтенд на Vercel

// Подключение к MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Подключение к базе данных успешно установлено'))
  .catch(err => console.error('Ошибка подключения к базе данных:', err));

// Определение схемы и модели пользователя
const userSchema = new mongoose.Schema({
  username: String,
  score: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  coinsPerClick: { type: Number, default: 1 },
  multiplier: { type: Number, default: 1 },
});

const User = mongoose.model('User', userSchema);

const app = express();

// Настройка CORS с жестко прописанным фронтенд-доменом
const corsOptions = {
  origin: frontendURL,  // Разрешаем доступ только с этого домена
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // Разрешаем передачу cookies и сессионных данных
};

app.use(cors(corsOptions));  // Применяем CORS
app.use(express.json());

// Маршрут для получения данных пользователя
app.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  let user = await User.findOne({ username });

  if (!user) {
    user = new User({ username });
    await user.save();
  }

  res.json(user);
});

// Маршрут для обработки кликов
app.post('/click/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  user.score += user.coinsPerClick * user.multiplier;
  user.coins += user.coinsPerClick;
  await user.save();

  res.json(user);
});

// Маршрут для покупки улучшения +1 к монетам за клик
app.post('/upgrade/click/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const upgradePrice = user.coinsPerClick * 100;
  if (user.coins < upgradePrice) {
    return res.status(400).json({ message: 'Недостаточно монет для покупки улучшения' });
  }

  user.coins -= upgradePrice;
  user.coinsPerClick += 1;
  await user.save();

  res.json({ message: 'Улучшение успешно куплено', user });
});

// Маршрут для покупки удвоения монет за клик
app.post('/upgrade/double/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const upgradePrice = user.multiplier * 10000;
  if (user.coins < upgradePrice) {
    return res.status(400).json({ message: 'Недостаточно монет для покупки улучшения' });
  }

  user.coins -= upgradePrice;
  user.multiplier *= 2;
  await user.save();

  res.json({ message: 'Улучшение успешно куплено', user });
});

// Маршрут для получения топа пользователей (по убыванию счета)
app.get('/top-users', async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ score: -1 }) // Сортировка по убыванию счета
      .limit(10); // Ограничение до 10 пользователей

    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении топа пользователей' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
