import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Si el usuario existe y tiene admin: true, lo dejamos pasar
        if (user && user.admin === true) {
            return true;
        }

        // Si no, le tiramos un error de "Prohibido"
        throw new ForbiddenException('Acceso denegado: Se requieren permisos de Administrador.');
    }
}  