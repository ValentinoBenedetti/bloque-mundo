import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('favoritos')
export class Favorito {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    usuarioId: number;

    @Column()
    productoId: number;
}