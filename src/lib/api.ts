// API utilities for KingX Package Delivery System

const API_BASE_URL = 'https://oi-server.onrender.com';

export interface ApiHeaders {
  'customerId': string;
  'Content-Type': string;
  'Authorization': string;
}

export const defaultHeaders: ApiHeaders = {
  'customerId': 'abdelhak.elassali@gmail.com',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export class ApiClient {
  private baseUrl: string;
  private headers: ApiHeaders;

  constructor(baseUrl: string = API_BASE_URL, headers: ApiHeaders = defaultHeaders) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// AI Service for route optimization using Claude Sonnet 4
export class AIService extends ApiClient {
  constructor() {
    super();
  }

  async optimizeRoute(
    startLocation: { lat: number; lng: number },
    destinations: Array<{ lat: number; lng: number; address: string }>,
    vehicleType: string = 'car'
  ): Promise<{
    optimizedOrder: number[];
    estimatedTime: number;
    estimatedDistance: number;
    reasoning: string;
  }> {
    const prompt = `As a logistics optimization AI, analyze and optimize this delivery route:

Start Location: ${startLocation.lat}, ${startLocation.lng}
Vehicle Type: ${vehicleType}

Destinations:
${destinations.map((dest, idx) => `${idx + 1}. ${dest.address} (${dest.lat}, ${dest.lng})`).join('\n')}

Please provide:
1. Optimized delivery order (array of destination indices)
2. Estimated total time in minutes
3. Estimated total distance in kilometers
4. Brief reasoning for the optimization

Respond in JSON format:
{
  "optimizedOrder": [array of indices],
  "estimatedTime": number,
  "estimatedDistance": number,
  "reasoning": "string"
}`;

    try {
      const response = await this.post<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>('/chat/completions', {
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      // Parse JSON response
      const result = JSON.parse(content);
      return result;
    } catch (error) {
      console.error('Route optimization failed:', error);
      // Fallback to simple optimization
      return {
        optimizedOrder: destinations.map((_, idx) => idx),
        estimatedTime: destinations.length * 15,
        estimatedDistance: destinations.length * 3.5,
        reasoning: 'Fallback optimization: Sequential order based on input sequence'
      };
    }
  }

  async calculateDeliveryTime(
    distance: number,
    trafficFactor: number = 1.0,
    weatherFactor: number = 1.0,
    packagePriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<{
    estimatedTime: number;
    confidence: number;
    factors: string[];
  }> {
    const prompt = `Calculate delivery time estimation:
- Distance: ${distance} km
- Traffic Factor: ${trafficFactor} (1.0 = normal, 1.5 = heavy traffic)
- Weather Factor: ${weatherFactor} (1.0 = normal, 1.3 = adverse weather)
- Package Priority: ${packagePriority}

Provide time estimation in minutes with confidence level and key factors.

Respond in JSON format:
{
  "estimatedTime": number,
  "confidence": number (0-1),
  "factors": ["list of key factors affecting delivery time"]
}`;

    try {
      const response = await this.post<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>('/chat/completions', {
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Delivery time calculation failed:', error);
      // Fallback calculation
      const baseTime = distance * 3; // 3 minutes per km
      const adjustedTime = baseTime * trafficFactor * weatherFactor;
      const priorityMultiplier = {
        urgent: 0.7,
        high: 0.8,
        medium: 1.0,
        low: 1.2
      };
      
      return {
        estimatedTime: Math.round(adjustedTime * priorityMultiplier[packagePriority]),
        confidence: 0.75,
        factors: ['Distance', 'Traffic conditions', 'Weather', 'Package priority']
      };
    }
  }
}

// Pricing calculation utilities
export class PricingService {
  private static basePrice = 5.00;
  private static pricePerKm = 1.20;
  private static pricePerKg = 2.00;
  
  static calculateDeliveryPrice(
    distance: number,
    weight: number,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    insurance: boolean = false,
    packageValue: number = 0
  ): {
    basePrice: number;
    distanceFee: number;
    weightFee: number;
    priorityFee: number;
    insuranceFee: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
  } {
    const basePrice = this.basePrice;
    const distanceFee = distance * this.pricePerKm;
    const weightFee = weight * this.pricePerKg;
    
    const priorityMultipliers = {
      low: 0.8,
      medium: 1.0,
      high: 1.5,
      urgent: 2.0
    };
    
    const priorityFee = (basePrice + distanceFee + weightFee) * (priorityMultipliers[priority] - 1);
    
    const insuranceFee = insurance ? Math.max(packageValue * 0.02, 2.00) : 0;
    const serviceFee = 0; // No service fee for now
    
    const subtotal = basePrice + distanceFee + weightFee + priorityFee + insuranceFee + serviceFee;
    const tax = subtotal * 0.08; // 8% tax
    const discount = 0; // No discounts for now
    
    const total = subtotal + tax - discount;
    
    return {
      basePrice: Number(basePrice.toFixed(2)),
      distanceFee: Number(distanceFee.toFixed(2)),
      weightFee: Number(weightFee.toFixed(2)),
      priorityFee: Number(priorityFee.toFixed(2)),
      insuranceFee: Number(insuranceFee.toFixed(2)),
      serviceFee: Number(serviceFee.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }
}

// Tracking utilities
export class TrackingService {
  static generateTrackingNumber(): string {
    const prefix = 'KX';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp.slice(-6)}${random}`;
  }

  static calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static interpolateLocation(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    progress: number // 0 to 1
  ): { lat: number; lng: number } {
    return {
      lat: start.lat + (end.lat - start.lat) * progress,
      lng: start.lng + (end.lng - start.lng) * progress
    };
  }
}

// Export default API client instance
export const apiClient = new ApiClient();
export const aiService = new AIService();