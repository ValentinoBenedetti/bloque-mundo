import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categorias')
export class Categoria {
    @PrimaryGeneratedColumn()
    idCategoria: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    nombre: string;
}
