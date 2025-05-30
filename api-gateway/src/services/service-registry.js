const axios = require('axios');
const logger = require('../utils/logger');

// This is a simplified service registry. In a production environment,
// you would use a dedicated service like Consul, Eureka, or etcd.
class ServiceRegistry {
  constructor() {
    this.services = {};
    this.timeout = 30000; // 30 seconds timeout for service health checks
  }

  // Register a service
  register(serviceName, serviceUrl, healthCheckPath = '/health') {
    this.services[serviceName] = {
      name: serviceName,
      url: serviceUrl,
      healthCheckPath,
      lastCheck: Date.now(),
      isAlive: true
    };
    
    logger.info(`Service registered: ${serviceName} at ${serviceUrl}`);
    
    // Start health check for the service
    this.checkServiceHealth(serviceName);
    
    return this.services[serviceName];
  }
  
  // Unregister a service
  unregister(serviceName) {
    if (this.services[serviceName]) {
      delete this.services[serviceName];
      logger.info(`Service unregistered: ${serviceName}`);
      return true;
    }
    return false;
  }
  
  // Get service details
  get(serviceName) {
    const service = this.services[serviceName];
    
    if (service && service.isAlive) {
      return service;
    }
    
    logger.warn(`Service unavailable: ${serviceName}`);
    return null;
  }
  
  // Get all services
  getAll() {
    return Object.values(this.services);
  }
  
  // Get all healthy services
  getAllHealthy() {
    return Object.values(this.services).filter(service => service.isAlive);
  }
  
  // Check health of a service
  async checkServiceHealth(serviceName) {
    const service = this.services[serviceName];
    
    if (!service) {
      return false;
    }
    
    try {
      const response = await axios.get(`${service.url}${service.healthCheckPath}`, {
        timeout: this.timeout
      });
      
      service.isAlive = response.status === 200;
      service.lastCheck = Date.now();
      
      logger.debug(`Health check for ${serviceName}: ${service.isAlive ? 'UP' : 'DOWN'}`);
      
      // Schedule next health check (every 30 seconds)
      setTimeout(() => {
        this.checkServiceHealth(serviceName);
      }, 30000);
      
      return service.isAlive;
    } catch (error) {
      service.isAlive = false;
      service.lastCheck = Date.now();
      
      logger.error(`Health check failed for ${serviceName}: ${error.message}`);
      
      // Schedule next health check (retry after 10 seconds if failed)
      setTimeout(() => {
        this.checkServiceHealth(serviceName);
      }, 10000);
      
      return false;
    }
  }
}

// Create a singleton instance
const serviceRegistry = new ServiceRegistry();

// Register known services from config
const registerInitialServices = (services = {}) => {
  Object.entries(services).forEach(([name, url]) => {
    serviceRegistry.register(name, url);
  });
};

module.exports = {
  serviceRegistry,
  registerInitialServices
};