
/*
import { Repository } from "../shared/repository.js";
import { Category } from "./category.entify.js";

const categories = [
    new Category(
      'Martin', /*name*/
      //'Goméz', /*description*/
      //'a02b91bc-3769-4221-beb1-d7a3aeba7dad' /* esto se deberia cambiar?*/
   // ),
 // ]
  
/*

export class CategoryRepository implements Repository<Category>{

    public findAll(): Category[] | undefined {
        return categories
    }

    public findOne(item: { id: string }): Category | undefined {
        return categories.find((category) => category.id === item.id)
    }

    public add(item: Category): Category | undefined {
        categories.push(item)
        return item
    }

    public update(item: Category): Category | undefined {
        const categoryIdx = categories.findIndex((category) => category.id === item.id)
    
        if (categoryIdx !== -1) {
          categories[categoryIdx] = { ...categories[categoryIdx], ...item }
        }
        return categories[categoryIdx]
    }

    public delete(item: { id: string }): Category | undefined {
        const categoryIdx = categories.findIndex((category) => category.id === item.id)
    
        if (categoryIdx !== -1) {
          const deletedCategories = categories[categoryIdx]
          categories.splice(categoryIdx, 1)
          return deletedCategories
        }
      }
}
      */