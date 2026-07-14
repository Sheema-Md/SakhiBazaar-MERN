const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a product title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price must be greater than or equal to 0'],
  },
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
    default: '',
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add a product image URL'],
  },
  images: {
    type: [String],
    default: [],
  },
  offerPercentage: {
    type: Number,
    default: 0,
  },
  stockStatus: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Low Stock'],
    default: 'In Stock',
  },
  stockQuantity: {
    type: Number,
    default: 0,
  },
  sku: {
    type: String,
    default: '',
  },
  deliveryLocations: [
    {
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      city: { type: String, default: '' }
    }
  ],
  ratings: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      userName: { type: String, default: '' },
      rating: { type: Number, default: 5 },
      comment: { type: String, default: '' },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  tags: {
    type: [String],
    default: [],
  },
  marketingCaption: {
    type: String,
    default: '',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'flagged'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Define indexes for search optimization
productSchema.index({ title: 'text', description: 'text', sku: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
