// Здесь функция посредник MiddleWare
import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      // Расшифровываем токен
      const decoded = jwt.verify(token, 'secret123');

      req.userId = decoded._id;
      // Некст говорит о том что нам следует идти дальше по циклу после определенных действий
      next();
    } catch (err) {
      return res.status(403).json({
        message: "Нет доступа"
      })
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа"
    });
  }

  res.send(token);
}