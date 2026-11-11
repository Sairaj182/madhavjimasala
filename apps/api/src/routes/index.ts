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
}
