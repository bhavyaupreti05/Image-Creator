# Backend API Documentation

## Endpoints

### Generate image
POST /api/v1/images/generate

Body:
{
  "prompt": "A futuristic cyberpunk city at sunset"
}

### Create post
POST /api/v1/posts

Body:
{
  "name": "Ada",
  "prompt": "A futuristic cyberpunk city at sunset",
  "photo": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
}

### Get posts
GET /api/v1/posts?page=1&limit=12

### Search posts
GET /api/v1/posts/search?q=cyberpunk
