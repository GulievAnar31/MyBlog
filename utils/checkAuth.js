// Здесь функция посредник MiddleWare
import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = req.headers.authorization;

  console.log(token);

  // Некст говорит о том что нам следует идти дальше по циклу после определенных действий
  next();
}