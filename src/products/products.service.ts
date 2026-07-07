import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(queryDto: QueryProductDto) {
    const { search, limit = 10, skip = 0 } = queryDto;
    const filter: any = { isDeleted: { $ne: true } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { products, total, limit, skip };
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();
    if (!product || product.isDeleted)
      throw new NotFoundException('Product not found');
    return product;
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    const product = new this.productModel({
      ...createProductDto,
      createdBy: new Types.ObjectId(userId),
    });
    return product.save();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: Types.ObjectId,
    userRole: string,
  ) {
    const product = await this.productModel
      .findById(id)
      .populate('createdBy', 'name email role')
      .exec();

    if (!product || product.isDeleted)
      throw new NotFoundException('Product not found');

    const ownerId = (product.createdBy as any)._id.toString();

    if (ownerId !== userId.toString() && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own products');
    }

    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('createdBy', 'name email')
      .exec();
  }

  async remove(
    id: string,
    userId: Types.ObjectId,
    userRole: string,
  ) {
    const product = await this.productModel
      .findById(id)
      .populate('createdBy', 'name email role')
      .exec();

    if (!product || product.isDeleted)
      throw new NotFoundException('Product not found');

    const ownerId = (product.createdBy as any)._id.toString();

    if (ownerId !== userId.toString() && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own products');
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    return product.save();
  }
}
