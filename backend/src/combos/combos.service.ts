import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { Combo } from './entities/combo.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class CombosService {
  constructor(
    @InjectRepository(Combo)
    private comboRepository: Repository<Combo>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async create(createComboDto: CreateComboDto) {
    const { productosIds, ...comboData } = createComboDto;
    const combo = this.comboRepository.create(comboData);

    if (productosIds && productosIds.length > 0) {
      const numericIds = productosIds.map(id => Number(id));
      combo.productos = await this.productoRepository.findBy({
        idProducto: In(numericIds),
      });
    }

    return this.comboRepository.save(combo);
  }

  private calculateComboDynamicFields(combo: Combo) {
    if (combo.productos && combo.productos.length > 0) {
      combo.stock = Math.min(...combo.productos.map(p => p.stock));
      
      combo['cantidadPiezas'] = combo.productos.reduce((acc, p) => acc + (parseInt(p.cantidadPiezas as any) || 0), 0);
      
      const ages = ['4+', '6+', '9+', '13+', '18+'];
      let maxAgeIndex = -1;
      combo.productos.forEach(p => {
        const idx = ages.indexOf(p.rangoEdad);
        if (idx > maxAgeIndex) maxAgeIndex = idx;
      });
      combo['rangoEdad'] = maxAgeIndex >= 0 ? ages[maxAgeIndex] : '4+';
      
    } else {
      combo.stock = 0;
      combo['cantidadPiezas'] = 0;
      combo['rangoEdad'] = '';
    }
    return combo;
  }

  async findAll() {
    const combos = await this.comboRepository.find({ relations: ['productos'] });
    return combos.map(combo => this.calculateComboDynamicFields(combo));
  }

  async findOne(id: number) {
    const combo = await this.comboRepository.findOne({
      where: { idCombo: id },
      relations: ['productos']
    });
    if (!combo) throw new NotFoundException('Combo no encontrado');
    return this.calculateComboDynamicFields(combo);
  }

  async update(id: number, updateComboDto: UpdateComboDto) {
    const { productosIds, ...comboData } = updateComboDto as any;
    
    const combo = await this.findOne(id);
    Object.assign(combo, comboData);

    if (productosIds) {
      const numericIds = productosIds.map(id => Number(id));
      combo.productos = await this.productoRepository.findBy({
        idProducto: In(numericIds),
      });
    }

    return this.comboRepository.save(combo);
  }

  async remove(id: number) {
    const combo = await this.findOne(id);
    return this.comboRepository.remove(combo);
  }
}
