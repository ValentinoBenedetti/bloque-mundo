import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NivelUsuario } from "./nivel-usuario.entity";

@Entity('usuarios')
export class Usuario {
    @PrimaryColumn({ type: 'char', length: 5 })
    idUsuario: string; // El ID de 5 dígitos [cite: 26, 357]

    @Column({ type: 'varchar', length: 50 })
    nombre: string; // [cite: 358]

    @Column({ type: 'varchar', length: 50 })
    apellido: string; // [cite: 359]

    @Column({ type: 'varchar', length: 100 })
    direccion: string; // [cite: 360]

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono: string; // [cite: 361]

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string; // [cite: 362]

    @Column({ type: 'boolean', default: false })
    esAdmin: boolean; // [cite: 364]

    @ManyToOne(() => NivelUsuario, (nivel) => nivel.usuarios)
    @JoinColumn({ name: 'idNivel' })
    nivel: NivelUsuario; // 
}