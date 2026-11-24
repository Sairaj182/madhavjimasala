import type { FastifyInstance } from 'fastify'
import { healthRoutes } from './health'
import { authRoutes } from './auth'
import { categoryRoutes } from './categories'
import { productRoutes } from './products'
import { cartRoutes } from './cart'
import { pickupRoutes } from './pickups'
import { orderRoutes } from './orders'
import { settingsRoutes } from './settings'
import { pushRoutes } from './push'
import { testimonialRoutes } from './testimonials'
import { adminUserRoutes } from './admin-users'
import { analyticsRoutes } from './analytics'

export function registerRoutes(app: FastifyInstance) {
    app.register(healthRoutes, { prefix: '/api' })
    app.register(authRoutes, { prefix: '/api/auth' })
    app.register(categoryRoutes, { prefix: '/api/categories' })
    app.register(productRoutes, { prefix: '/api/products' })
    app.register(cartRoutes, { prefix: '/api/cart' })
    app.register(pickupRoutes, { prefix: '/api/pickups' })
    app.register(orderRoutes, { prefix: '/api/orders' })
    app.register(settingsRoutes, { prefix: '/api/settings' })
    app.register(pushRoutes, { prefix: '/api/push' })
    app.register(testimonialRoutes, { prefix: '/api/testimonials' })
    app.register(adminUserRoutes, { prefix: '/api/admin/users' })
    app.register(analyticsRoutes, { prefix: '/api/admin/analytics' })
}
