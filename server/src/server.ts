import cors from 'cors';
import express from 'express';
import path from 'path';
import routes from './routes';
import { errors } from 'celebrate';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors()); /* Lida com o retorno de erro para o front-end */

app.listen(3333);