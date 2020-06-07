import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, callback) => {
      const hash = crypto.randomBytes(4).toString('hex');

      const fileName = `${hash}-${file.originalname}`;

      /* O primeiro parâmetro é um erro, null indica que não deu nenhum erro */
      callback(null, fileName);
    }
  })
}