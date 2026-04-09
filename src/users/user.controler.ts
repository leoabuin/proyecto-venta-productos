import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { User } from './user.entity.js'
import { Product } from '../products/product.entity.js'
import { validateUser, validateUserPatch, validateUserLogIn } from './userSchema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const em = orm.em

function sanitizeUserInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    surname: req.body.surname,
    dni: req.body.dni,
    mail: req.body.mail,
    phoneNumber: req.body.phoneNumber,
    adress: req.body.adress,
    rol: req.body.rol,
    userName: req.body.userName,
    orders: req.body.orders
  }
  next()
}

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await em.find(User, {}, { populate: ['orders'] })
    res.status(200).json({ message: 'found all Users', data: users })
  } catch (error: any) {
    next(error)
  }
}

async function findOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const user = await em.findOneOrFail(User, { id }, { populate: ['orders'] })
    res.status(200).json({ message: 'found User', data: user })
  } catch (error: any) {
    next(error)
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateUser(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    const user = em.create(User, { ...req.body.sanitizedInput, password: hashedPassword, });
    await em.flush()
    res.status(201).json({ message: 'User created', data: user })
  } catch (error: any) {
    next(error)
  }
}

async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const user = await em.findOneOrFail(User, { id })
    let userUpdate
    if (req.method === 'PATCH') {
      userUpdate = validateUserPatch(req.body)
      if (!userUpdate.success) {
        return res.status(400).json({ error: JSON.parse(userUpdate.error.message) })
      }
    } else {
      userUpdate = validateUser(req.body)
      if (!userUpdate.success) {
        return res.status(400).json({ error: JSON.parse(userUpdate.error.message) })
      }
    }
    em.assign(user, req.body)
    await em.flush()
    res.status(200).json({ message: 'user updated', data: user })
  } catch (error: any) {
    next(error)
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number.parseInt(req.params.id)
    const user = em.getReference(User, id)
    await em.removeAndFlush(user)
    res.status(200).json({ message: 'User deleted' })
  } catch (error: any) {
    next(error)
  }
}

async function logIn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = validateUserLogIn(req.body);
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { userName, password } = req.body;
    const user = await em.findOne(User, { userName });

    if (!user) {
      return res.status(404).json({ message: 'El nombre de usuario no existe' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'El usuario no tiene una contraseña válida' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'La contraseña es invalida' });
    }

    const { password: _, ...userResponse } = user;

    const token = jwt.sign(
      {
        id: user.id,
        userName: user.userName,
        rol: user.rol,
        mail: user.mail
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 86400000,   // 24 horas
      path: '/',
    });

    return res.status(200).json({ message: 'Login successful', data: userResponse });

  } catch (error: any) {
    next(error)
  }
}

async function logOut(req: Request, res: Response, next: NextFunction) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
    return res.status(200).json({ message: 'Cierre de sesion exitoso' });
  } catch (error: any) {
    next(error)
  }
}

async function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const productId = Number.parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const user = await em.findOneOrFail(User, { id: userId }, { populate: ['favorites'] });
    const product = await em.findOneOrFail(Product, { id: productId });

    if (!user.favorites.contains(product)) {
      user.favorites.add(product);
      await em.flush();
    }

    res.status(200).json({ message: 'Producto agregado a favoritos', data: user.favorites });
  } catch (error: any) {
    next(error);
  }
}

async function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const productId = Number.parseInt(req.params.productId);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const user = await em.findOneOrFail(User, { id: userId }, { populate: ['favorites'] });
    const product = await em.findOneOrFail(Product, { id: productId });

    if (user.favorites.contains(product)) {
      user.favorites.remove(product);
      await em.flush();
    }

    res.status(200).json({ message: 'Producto removido de favoritos', data: user.favorites });
  } catch (error: any) {
    next(error);
  }
}

async function getFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const user = await em.findOneOrFail(User, { id: userId }, { populate: ['favorites.prices', 'favorites.brand'] });
    
    res.status(200).json({ message: 'Favoritos obtenidos', data: user.favorites });
  } catch (error: any) {
    next(error);
  }
}

export { sanitizeUserInput, findAll, findOne, add, update, remove, logIn, logOut, SECRET_KEY, addFavorite, removeFavorite, getFavorites }
