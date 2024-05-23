import { Repository } from "../shared/repository.js";
import { Product } from "./product.entify.js";

const products = [
    new Product(
      'Remera',
      'mangas cortas',
      11,
      99,
      22,
      11,
      'a02b91bc-3769-4221-beb1-d7a3aeba7dad'
    ),
  ]
  


export class ProductRepository implements Repository<Product>{

    public findAll(): Product[] | undefined {
        return products
    }

    public findOne(item: { id: string }): Product | undefined {
        return products.find((product) => product.id === item.id)
    }

    public add(item: Product): Product | undefined {
        products.push(item)
        return item
    }

    public update(item: Product): Product | undefined {
        const productIdx = products.findIndex((product) => product.id === item.id)
    
        if (productIdx !== -1) {
          products[productIdx] = { ...products[productIdx], ...item }
        }
        return products[productIdx]
    }

    public delete(item: { id: string }): Product | undefined {
        const productIdx = products.findIndex((product) => product.id === item.id)
    
        if (productIdx !== -1) {
          const deletedProducts = products[productIdx]
          products.splice(productIdx, 1)
          return deletedProducts
        }
      }
}