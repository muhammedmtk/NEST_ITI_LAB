import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private products = [
    { id: 1, name: 'Laptop', price: 1200, categoryId: 1 },
    { id: 2, name: 'NestJS Book', price: 30, categoryId: 2 },
  ];
  private nextId = 3;

  findAll() { return this.products; }

  findOne(id: number) {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  create(dto: CreateProductDto) {
    const newProduct = { id: this.nextId++, ...dto };
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: number, dto: UpdateProductDto) {
    const product = this.findOne(id);
    Object.assign(product, dto);
    return product;
  }

  remove(id: number) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundException(`Product #${id} not found`);
    return this.products.splice(index, 1)[0];
  }
}