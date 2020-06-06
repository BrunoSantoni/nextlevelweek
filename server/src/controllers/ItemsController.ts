import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(req: Request, res: Response) {
    //SELECT * FROM ITEMS
    const items = await knex('items').select('*');
    
  
    const serializedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.15.14:3333/uploads/${item.image}`,
      };
    })

    res.json(serializedItems);
  }
}

export default ItemsController;