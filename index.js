import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { registerValidation } from "./validations/auth.js";
import UserModel from "./modules/user.js";

mongoose.connect(`mongodb+srv://admin:wwwwww@cluster0.4wpjunr.mongodb.net/blog?retryWrites=true&w=majority`).then(() => {
    console.log('db ok');
}).catch((err) => {
    console.log(err);
});

const app = express();

app.use(express.json()); // позволяет читать json

app.post('/auth/register', registerValidation, async (request, response) => {
    try {
        const errors = validationResult(request);

        if(!errors.isEmpty()){
            return response.status(400).json(errors.array());
        }

        console.log(request.body)

        const password = request.body.password
        const salt = await bcrypt.genSalt(10); // алгоритм шифрования
        const passwordHash = await bcrypt.hash(password, salt); // шифруем пароль

        const document = new UserModel({
            email: request.body.email,
            fullName: request.body.fullName,
            avatarUrl: request.body.avatarUrl,
            passwordHash: passwordHash
        });

        const user = await document.save();

        const token = await jwt.sign({
            _id: user._id,
        },
            'secret123',
            {
                expiresIn: '30d',
            })

        response.json({...user, token})
    } catch (e) {
        response.json({
            message: `Не удалось зарегестрироваться ${e}`
        })
    }
});

app.listen(4444, (err) => { // запускает сервер
  if(err){
      return console.log(err);
  }

  console.log('server ok');
})