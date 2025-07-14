import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with default values', () => {
    expect(component.productForm).toBeDefined();
    expect(component.productForm.valid).toBeFalse();
  });

  it('should validate required fields', () => {
    const nameControl = component.productForm.get('name')!;
    nameControl.setValue('');
    expect(nameControl.valid).toBeFalse();
    nameControl.setValue('Test');
    expect(nameControl.valid).toBeTrue();
  });

  it('should emit save event on valid submit', () => {
    spyOn(component.save, 'emit');

    component.productForm.setValue({
      name: 'Producto',
      description: 'Desc',
      price: 10,
      imageUrl: '',
      categoryId: 1
    });

    component.onSubmit();

    expect(component.save.emit).toHaveBeenCalled();
  });
});
