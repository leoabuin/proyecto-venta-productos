import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { Order } from './order.entity.js'
import { User } from '../users/user.entity.js'
import { Product } from '../products/product.entity.js'
import { OrderItem } from '../orderItems/orderItem.entity.js'



const em = orm.em

function sanitizeOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedOrderInput = {
    fecha_pedido: req.body.fecha_pedido,
    total: req.body.total,
    estado: req.body.estado,
    metodo_pago: req.body.metodo_pago,
    orderItems: Array.isArray(req.body.orderItems) ? req.body.orderItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      item_price: item.item_price
    })) : [] 
  };

  console.log('sanitize input')
  console.dir(req.body.sanitizedOrderInput.orderItems, { depth: 5 });
  
  //more checks here

  Object.keys(req.body.sanitizedOrderInput).forEach((key) => {
    if (req.body.sanitizedOrderInput[key] === undefined) {
      delete req.body.sanitizedOrderInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const orders = await em.find(Order,{},{populate:['orderItems']})
    res.status(200).json({message:'found all Orders',data:orders})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const order = await em.findOneOrFail(Order,{id},{populate:['orderItems']})
    res.status(200).json({message:'found order',data:order})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const order = em.create(Order,req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Order created', data:order})
  } catch (error:any) {
      res.status(500).json({message: error.message})
  }
}



async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const order = em.getReference(Order, id)
    await em.removeAndFlush(order)
    res.status(200).json({message: 'order deleted'})
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
}



async function placeOrder(req:Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.body.userId)
    const { orderItems} = req.body.sanitizedOrderInput
    const user = await em.findOne(User, { id: userId })
    if (!user) {
      res.status(404).json({ message: 'El usuario no existe' })
    }
 
    const order = em.create(Order, {
      ...req.body.sanitizedOrderInput,
      user 
    })
    console.log('order item')
    console.dir(orderItems,{depth:5})
    
    // for (const item of orderItems) {
      const orderItemPromise = orderItems.map(async (item: any) => {
        const product = await em.findOne(Product, { id: item.productId });
        if (!product) {
          throw new Error(`Producto con id ${item.productId} no encontrado`);
        }
  
        console.log('probando: ' + product.name);
  
        // Verificar stock
        if (product.stock < item.quantity) {
          throw new Error(`El producto ${product.name} no tiene suficiente stock`);
        }
  
        product.stock -= item.quantity;
  
        const orderItem = new OrderItem();
        orderItem.order = order; // Relacionar el item con la orden
        orderItem.product = product; // Relacionar el producto con el item
        orderItem.quantity = item.quantity;
        orderItem.item_price = item.item_price // Aquí puedes ajustar según corresponda

  
        console.dir(orderItem, { depth: 5 });
  
        return orderItem;
      });
  
      // Esperar a que todos los items se procesen correctamente
      const processedOrderItems = await Promise.all(orderItemPromise);
      console.log(processedOrderItems)
  
      processedOrderItems.forEach(item => {
        if (item) { // Asegúrate de que el item no sea undefined
          order.orderItems.add(item);
        }
      });
  
      // Eliminar OrderItem sin producto
      const orderItemsToRemove = order.orderItems.filter(item => !item.product);
      orderItemsToRemove.forEach(item => {
        order.orderItems.remove(item); // Elimina el item de la colección
      });

      console.log(order)
  
      // Guardar cambios en la base de datos
      await em.flush();
  
  //em.flush()
  /*
      const product = await em.findOneOrFail(Product,{ id: item.productId })
      console.log('probando: ' + product.name)

      if (product.stock < item.quantity) {
        res.status(400).json({ message: `El producto ${product.name} no tiene suficiente stock` })
      }
        */

     // product.stock -= item.quantity
     // console.log(product.stock)
      //em.persist(product)
      /*
      const orderItemEntity = em.create(OrderItem, {
        order,
        product,
        quantity: orderItem.quantity,
        item_price: 5000
      })
      console.log('HOLA')
      
      */
/*
      const orderItem = new OrderItem();
      orderItem.order = order; 
      console.log(orderItem.order.metodo_pago)
      orderItem.product = product;
      console.log(orderItem.product.id)
      orderItem.quantity = item.quantity;
      orderItem.item_price = 5000;
      */
     // console.dir(orderItem,{depth:5})
      //order.orderItems.add(orderItem);
      //em.persist(orderItem)
      //em.persist(product)
      //em.flush()
    //console.dir(orderItem,{depth:5})
    
    


    //console.dir(order,{depth:5})
   // await em.persistAndFlush(order)
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
  
} 

/*
async function placeOrder(req: Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.body.userId);
    const { orderItems } = req.body.sanitizedOrderInput;

    // Buscar al usuario
    const user = await em.findOne(User, { id: userId });
    if (!user) {
       res.status(404).json({ message: 'El usuario no existe' }); // Agregar return aquí
    }

    // Crear una nueva orden
    const order = em.create(Order, {
      ...req.body.sanitizedOrderInput,
      user,
    });

    // Procesar los items del pedido
    const orderItemPromises = orderItems.map(async (item: any) => {
      // Buscar el producto
      const product = await em.findOne(Product, { id: item.productId });
      if (!product) {
        throw new Error(`Producto con id ${item.productId} no encontrado`);
      }

      console.log('Producto encontrado: ' + product.name);

      // Verificar el stock del producto
      if (product.stock < item.quantity) {
        throw new Error(`El producto ${product.name} no tiene suficiente stock`);
      }

      // Reducir el stock del producto
      product.stock -= item.quantity;

      // Persistir el cambio de stock
     await em.persistAndFlush(product); // Persistir el cambio de stock

      // Crear el OrderItem
      const orderItem = em.create(OrderItem, {
        order, // Relacionar el item con la orden
        product, // Relacionar el producto con el item
        quantity: item.quantity,
        item_price: item.item_price, // Establecer el precio del producto
      });

      console.dir(orderItem, { depth: 5 });

      return orderItem;
    });

    // Esperar a que todos los items se procesen correctamente
    const processedOrderItems = await Promise.all(orderItemPromises);

    // Agregar los items procesados a la orden
    processedOrderItems.forEach(item => order.orderItems.add(item)); // Cambiar aquí

    await em.persistAndFlush(order);
    //await em.flush(); // Guardar la orden, que a su vez guarda los items

    // Responder con éxito
    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
*/





/*
  1) cliente puede agregar producto a su carrito con su cantidad (lineas de pedido)
  2) cuando el cliente decide finalizar su pedido, presiona finalizar pedido
  nota: en que momento se crea el pedido. 
  nota: en que momento se crea la linea de pedido


*/




export { sanitizeOrderInput , findAll, findOne, add, remove, placeOrder}