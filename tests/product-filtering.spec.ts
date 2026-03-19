import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

// Mock dependencies correctly for ESM
jest.unstable_mockModule('../src/shared/orm.js', () => ({
  orm: {
    em: {
      find: jest.fn()
    }
  }
}));

const { productControler } = await import('../src/products/product.controler.js');
const { orm } = await import('../src/shared/orm.js');

describe('Product Controller - Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter products by name, category, brand, and isOffer', async () => {
    const req = {
      query: { 
        name: 'test',
        category: '1',
        brand: '2',
        isOffer: 'true'
      }
    } as unknown as Request;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    
    const next = jest.fn() as NextFunction;

    const mockProducts = [{ id: 1, name: 'test product' }];
    
    (orm.em.find as jest.Mock).mockResolvedValue(mockProducts as never);

    await productControler.findAll(req, res, next);

    expect(orm.em.find).toHaveBeenCalledWith(
      expect.anything(),
      {
        name: { $like: '%test%' },
        category: 1,
        brand: 2,
        isOffer: true
      },
      { populate: ['prices', 'brand', 'category'] }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'found all Products',
      data: mockProducts
    });
  });

  it('should use empty filters when no query provided', async () => {
    const req = {
      query: {}
    } as unknown as Request;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    
    const next = jest.fn() as NextFunction;

    const mockProducts = [{ id: 1, name: 'Product 1' }];
    
    (orm.em.find as jest.Mock).mockResolvedValue(mockProducts as never);

    await productControler.findAll(req, res, next);

    expect(orm.em.find).toHaveBeenCalledWith(
      expect.anything(),
      {},
      { populate: ['prices', 'brand', 'category'] }
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
