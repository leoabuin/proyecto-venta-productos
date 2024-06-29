import { Repository } from "../shared/repository.js";
import { Distributor } from "./distributor.entify.js";



const distributors = [
    new Distributor(
        '20-422548-45',
        'davidLuis@gmail.com',
        '3414582645',
        'Av.Belgrano 330'
    )
]


export class DistributorRepository implements Repository<Distributor>{

    public findAll(): Distributor[] | undefined {
        return distributors
    }


    public findOne(item: { id: string }): Distributor | undefined {
        return distributors.find((distributor) => distributor.CUIL === item.id)
    }


    public add(item: Distributor): Distributor | undefined {
        distributors.push(item)
        return item
    }

    public update(item: Distributor): Distributor | undefined {
        const distributorCUILx = distributors.findIndex((distributor) => distributor.CUIL === item.CUIL)
    
        if (distributorCUILx !== -1) {
          distributors[distributorCUILx] = { ...distributors[distributorCUILx], ...item }
        }
        return distributors[distributorCUILx]
    }

    public delete(item: { id: string }): Distributor | undefined {
        const distributorCUILx = distributors.findIndex((distributor) => distributor.CUIL === item.id)
    
        if (distributorCUILx !== -1) {
          const deletedDistributors = distributors[distributorCUILx]
          distributors.splice(distributorCUILx, 1)
          return deletedDistributors
        }
      }

} 