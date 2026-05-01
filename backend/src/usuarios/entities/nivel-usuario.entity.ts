import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('niveles_usuario')
export class NivelUsuario {
    @PrimaryGeneratedColumn()
    idNivel: number; // [cite: 370]

    @Column({ type: 'varchar', length: 30 })
    nombre: string; // [cite: 371]

    @Column({ type: 'varchar', length: 100, nullable: true })
    beneficio: string; // [cite: 372]

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    montoMinimo: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    porcentajeDescuento: number; // [cite: 373]

    @OneToMany(() => Usuario, (usuario) => usuario.nivel)
    usuarios: Usuario[]; // [cite: 375]
}