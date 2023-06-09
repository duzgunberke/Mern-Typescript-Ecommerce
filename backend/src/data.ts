import { Product } from './models/productModel'
import { User } from './models/userModel'
import bcrypt from 'bcryptjs'

export const products: Product[] = [
  {
    name: 'Nike Slim Shirt',
    slug: 'nike-slim-shirt',
    category: 'Shirts',
    image: '../images/p1.jpg',
    description: 'high quality product',
    brand: 'Nike',
    price: 120,
    countInStock: 10,
    rating: 4,
    numReviews: 10,
    reviews: [
      { name: 'John', comment: 'good', rating: 4, createdAt: new Date() },
    ],
    images: ['../images/p11.jpg'],
    isFeatured: true,
    banner: '../images/b1.jpg',
  },
  {
    name: 'Adidas Fit Shirt',
    slug: 'adidas-fit-shirt',
    category: 'Shirts',
    image: '../images/p2.jpg',
    price: 100,
    countInStock: 20,
    brand: 'Adidas',
    rating: 4.0,
    numReviews: 10,
    description: 'high quality product',
    reviews: [],
    images: [],
    isFeatured: true,
    banner: '../images/b2.jpg',
  },
  {
    name: 'Lacoste Free Pants',
    slug: 'lacoste-free-pants',
    category: 'Pants',
    image: '../images/p3.jpg',
    price: 220,
    countInStock: 0,
    brand: 'Lacoste',
    rating: 4.8,
    numReviews: 17,
    description: 'high quality product',
    reviews: [],
    images: [],
    isFeatured: false,
  },
  {
    name: 'Nike Slim Pant',
    slug: 'nike-slim-pant',
    category: 'Pants',
    image: '../images/p4.jpg',
    price: 78,
    countInStock: 15,
    brand: 'Nike',
    rating: 4.5,
    numReviews: 14,
    description: 'high quality product',
    reviews: [],
    images: [],
    isFeatured: false,
  },
]

export const users: User[] = [
  {
    name: 'Joe',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456'),
    isAdmin: true,
  },
  {
    name: 'John',
    email: 'user@example.com',
    password: bcrypt.hashSync('123456'),
    isAdmin: false,
  },
]
