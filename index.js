import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import {validationResult} from 'express-validator';
import {registerValidation} from './validations/auth.js';
import UserModel from './modules/user.js';
import checkAuth from './utils/checkAuth.js';

// подключаемся к бд
mongoose.connect(
    `mongodb+srv://admin:wwwwww@cluster0.4wpjunr.mongodb.net/blog?retryWrites=true&w=majority`).
    then(() => {
      console.log('db ok');
    }).
    catch((err) => {
      console.log(err);
    });

// Метод обьета express. С помощью него мы осуществляем маршрутизацию. Определяем как конечные точки приложения отвечают
// на запросы клиентов
const app = express();

app.use(express.json()); // позволяет читать json

app.post('/auth/register', registerValidation, async (request, response) => {
  try {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json(errors.array());
    }

    const password = request.body.password;
    const salt = await bcrypt.genSalt(10); // алгоритм шифрования
    const hash = await bcrypt.hash(password, salt); // шифруем пароль

    const document = new UserModel({
      email: request.body.email,
      fullName: request.body.fullName,
      avatarUrl: request.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await document.save();

    const token = await jwt.sign({
          _id: user._id,
        },
        'secret123',
        {
          expiresIn: '30d',
        });

    const {passwordHash, ...userData} = user._doc;

    response.json({...userData, token});
  } catch (e) {
    response.json({
      message: `Не удалось зарегестрироваться ${e}`,
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    // ищем пользователя в базе данных по email
    const user = await UserModel.findOne({email: req.body.email});
    // на проде нельзя указывать из за чего пользователь не находится
    if (!user) {
      // останавливаем код
      return res.status(404).json({message: 'Ползователь не найден'});
    }
    ;

    const isValidPass = await bcrypt.compare(req.body.password,
        user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(404).json({message: 'Неверный логин или пароль'});
    }
    ;

    const token = await jwt.sign(
        {_id: user._id},
        'secret123',
        {expiresIn: '30d'},
    );

    const {passwordHash, ...userData} = user._doc;

    res.json({...userData, token});
  } catch (e) {
    console.log(e);
    res.status(500).json({message: 'Не удалось авторизоваться'});
  }
});

app.get('/auth/me', checkAuth, async (req, res) => {
  // Здесь расшифровываем наш токен
  // checkAuth решает выполнять ли код который находится здесь
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    console.log(user._doc)


    // 👿 error next line...
    res.json({...user._doc});
  } catch (err) {
    return res.status(500).json({
      message: 'Нет доступа',
    });
  }
});

app.listen(5555, (err) => { // запускает сервер
  if (err) {
    return console.log(err);
  }

  console.log('server ok');
});
