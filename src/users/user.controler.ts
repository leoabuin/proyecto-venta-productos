import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/orm.js'
import { User } from './user.entity.js'
import { validateUser, validateUserPatch,validateUserLogIn } from './userSchema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'




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
  //more checks here
/*
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
*/
  next()
}


const SECRET_KEY = 'probando_secret_muy_segura_fwefwioefjpe5648fgsrgr9e2231##@@';

async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(User,{}, {populate:['orders']})
    res.status(200).json({message:'found all Users',data:users})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const user = await em.findOneOrFail(User,{id},{populate:['orders']})
    res.status(200).json({message:'found User',data:user})
  } catch (error: any) {
    return res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try {
    const result = validateUser(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const hashedPassword = bcrypt.hashSync(req.body.password,10)
    const user = em.create(User, {...req.body.sanitizedInput,password: hashedPassword,});
    await em.flush()
    res.status(201).json({ message: 'User created', data: user })
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}


async function update(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const user = await em.findOneOrFail(User, {id})
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
    res.status(200).json({message: 'user updated',data:user})
    console.log('updated')
   } catch(error: any){
      res.status(500).json({message: error.message})
    }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const user = em.getReference(User, id)
    await em.removeAndFlush(user)
    res.status(200).json({message: 'User deleted'})
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
}


async function logIn(req: Request, res: Response){
  try {
    const result = validateUserLogIn(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const { userName, password } = req.body;
    const user = await em.findOne(User, { userName });
    if (!user) {
      return res.status(404).json({ message: 'El nombre de usuario no existe' });
    }
    if (!user.password) {
      return res.status(401).json({ message: 'Contraseña invalida' });
    }
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid) throw new Error('la contraseña es invalida')
    const { password: _, ...userResponse } = user;
    const token = jwt.sign(
        { 
          id:user.id,
          userName: user.userName,
          mail: user.mail
        }, 
        SECRET_KEY,
        { expiresIn: '1h' });
    console.log('Token generated:', token);
    res.cookie('token', token, { secure: false });
    console.log('Login successful');
    return res.status(200).json({ message: 'Login successful', data: userResponse });
    
    
  } catch (error:any) {
    res.status(500).json({message: error.message})
  }

}


async function logOut(req: Request, res: Response) {
  try {
    res.clearCookie('token', { httpOnly: true, secure: false });
    console.log('Cookie "token" eliminada:', !req.cookies.token);
    return res.status(200).json({ message: 'Cierre de sesion exitoso' });
  } catch (error: any) {
    res.status(500).json({message: error.message})
  }
}

export { sanitizeUserInput, findAll, findOne, add, update, remove, logIn,logOut, SECRET_KEY }
