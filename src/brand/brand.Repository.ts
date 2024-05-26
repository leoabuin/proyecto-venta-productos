import { Repository } from "../shared/repository.js";
import { Brand } from "./brand.entify.js";

const brands = [
    new Brand(
      'Martin',
      'Goméz',
      'a02b91bc-3769-4221-beb1-d7a3aeba7dad' /* esto se deberia cambiar?*/
    ),
  ]
  


export class BrandRepository implements Repository<Brand>{

    public findAll(): Brand[] | undefined {
        return brands
    }

    public findOne(item: { id: string }): Brand | undefined {
        return brands.find((brand) => brand.id === item.id)
    }

    public add(item: Brand): Brand | undefined {
        brands.push(item)
        return item
    }

    public update(item: Brand): Brand | undefined {
        const brandIdx = brands.findIndex((brand) => brand.id === item.id)
    
        if (brandIdx !== -1) {
          brands[brandIdx] = { ...brands[brandIdx], ...item }
        }
        return brands[brandIdx]
    }

    public delete(item: { id: string }): Brand | undefined {
        const brandIdx = brands.findIndex((brand) => brand.id === item.id)
    
        if (brandIdx !== -1) {
          const deletedBrands = brands[brandIdx]
          brands.splice(brandIdx, 1)
          return deletedBrands
        }
      }
}