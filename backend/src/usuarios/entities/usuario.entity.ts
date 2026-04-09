import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
// ¡Importante! Asegurate de que esta ruta al archivo de Nivel coincida con la tuya
import { NivelUsuario } from './nivel-usuario.entity';

@Entity('usuarios')
export class Usuario {
    @PrimaryColumn({ type: 'char', length: 5 })
    idUsuario: string;

    @Column({ type: 'varchar', length: 100, default: 'Coleccionista' })
    nombre: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar' })
    password: string;

    // Bandera de Administrador
    @Column({ type: 'boolean', default: false })
    esAdmin: boolean;

    @CreateDateColumn()
    fechaRegistro: Date;

    // --- LA RELACIÓN QUE NOS FALTABA ---
    // Un nivel puede tener muchos usuarios (ej: muchos son nivel 'Oro')
    @ManyToOne(() => NivelUsuario, (nivel) => nivel.usuarios)
    @JoinColumn({ name: 'idNivel' })
    nivel: NivelUsuario;

}