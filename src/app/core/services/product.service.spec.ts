import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../interfaces/product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const dummyProducts: Product[] = [
    {
      id: 1,
      name: 'Prod 1',
      description: '',
      price: 10,
      status: 'A',
      imageUrl: '',
      category: { id: 1, name: 'Cat 1', status: 'A' }
    },
    {
      id: 2,
      name: 'Prod 2',
      description: '',
      price: 20,
      status: 'A',
      imageUrl: '',
      category: { id: 1, name: 'Cat 1', status: 'A' }
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve all products', () => {
    service.getAll().subscribe(products => {
      expect(products.length).toBe(2);
      expect(products[0].id).toBe(dummyProducts[0].id);
      expect(products[0].name).toBe(dummyProducts[0].name);
      expect(products[1].id).toBe(dummyProducts[1].id);
      expect(products[1].name).toBe(dummyProducts[1].name);
    });

    const req = httpMock.expectOne('http://localhost:8083/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProducts);
  });

  // Puedes agregar más tests para otros métodos (create, update, delete, etc.)
});
