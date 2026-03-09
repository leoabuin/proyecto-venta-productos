

// --- LÓGICA EXTRAÍDA DE TU FUNCIÓN placeOrder ---
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
    const product = { name: 'Pelota Nike', stock: 10, isContinued: true };
    const resultado = validarReglasNegocio('Cliente', product, 2);
    expect(resultado).toBe(true);
  });
});