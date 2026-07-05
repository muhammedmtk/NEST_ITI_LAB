import { Injectable , NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    private categories = [
    { id: 1, name: 'Electronics', description: 'Electronic items' },
    { id: 2, name: 'Books', description: 'Reading materials' },
  ];
  
  private nextId = 3;

  findAll() {
    return this.categories;
  }

  findOne(id: number){
    const category = this.categories.find(cat => cat.id === id);
    if(!category){
        throw new NotFoundException('category not found');
    }
  }

  create(dto: CreateCategoryDto){
    const newCategory = {id: this.nextId++, ...dto};
   this.categories.push(newCategory);
    return newCategory;
  }

  update(id: number, dto: UpdateCategoryDto){
    const category = this.findOne(id);
    Object.assign(category, dto);
    return category;
  }

  remove(id: number){
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) throw new NotFoundException(`Category #${id} not found`);

    const removed = this.categories.splice(index, 1);
    return removed[0];
   
  }
}
