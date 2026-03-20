
interface Product {
  name: string;
  stock: number;
  isContinued: boolean;
}

// --- LÓGICA EXTRAÍDA DE TU FUNCIÓN placeOrder ---
export const calcularPrecioConDescuento = (price: number, quantity: number) => {
  if (quantity >= 3) {
    return price * 0.8;
  }
  return price;
};

export const validarReglasNegocio = (userRol: string, product: any, quantity: number) => {
  if (userRol === 'Empleado') {
    throw new Error('Acceso denegado: Los empleados no pueden realizar compras.');
  }
  if (!product.isContinued) {
    throw new Error(`El producto ${product.name} ha sido discontinuado.`);
  }
  if (product.stock < quantity) {
    throw new Error(`El producto ${product.name} no tiene suficiente stock`);
  }
  return true;
};

// --- LOS TESTS (Evidencia para el TP) ---
describe('Tests de Ordenes - Sportify (Leonel Abuin)', () => {

  // Test 1: Validación de Rol (Requisito funcional del TP)
  it('Debería prohibir compras si el usuario es Empleado', () => {
    const product = { name: 'Botines', stock: 10, isContinued: true };
    
    expect(() => validarReglasNegocio('Empleado', product, 1))
      .toThrow('Acceso denegado: Los empleados no pueden realizar compras.');
  });

  // Test 2: Validación de Stock (Lógica de negocio)
  it('Debería fallar si la cantidad pedida supera al stock disponible', () => {
    const product = { name: 'Camiseta Estudiantes', stock: 2, isContinued: true };
    
    expect(() => validarReglasNegocio('Cliente', product, 5))
      .toThrow('no tiene suficiente stock');
  });

  // Test 3: Producto Discontinuado
  it('Debería fallar si el producto está discontinuado', () => {
    const product = { name: 'Zapatillas Retro', stock: 10, isContinued: false };
    
    expect(() => validarReglasNegocio('Cliente', product, 1))
      .toThrow('ha sido discontinuado');
  });

  // Test 4: Caso Exitoso
  it('Debería validar correctamente si el cliente es apto y hay stock', () => {
    const product: Product = { name: 'Pelota Nike', stock: 10, isContinued: true };
    const resultado = validarReglasNegocio('Cliente', product, 2);
    expect(resultado).toBe(true);
  });

  // Test 5: Descuento por Cantidad (Nuevo)
  it('Debería aplicar 20% de descuento si la cantidad es 3', () => {
    const precioBase = 100;
    const cantidad = 3;
    const precioFinal = calcularPrecioConDescuento(precioBase, cantidad);
    expect(precioFinal).toBe(80); // 100 * 0.8
  });

  it('Debería aplicar 20% de descuento si la cantidad es superior a 3', () => {
    const precioBase = 200;
    const cantidad = 5;
    const precioFinal = calcularPrecioConDescuento(precioBase, cantidad);
    expect(precioFinal).toBe(160); // 200 * 0.8
  });

  it('No debería aplicar descuento si la cantidad es menor a 3', () => {
    const precioBase = 150;
    const cantidad = 2;
    const precioFinal = calcularPrecioConDescuento(precioBase, cantidad);
    expect(precioFinal).toBe(150);
  });
});