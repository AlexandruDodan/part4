const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.length === 0
   ? null
   : blogs.reduce((max, item) => item.likes > max.likes ? item : max, blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authors = new Map()
  
  blogs.forEach(blog => {
    if (!authors.has(blog.author)) {
      authors.set(blog.author, 1)
    } else {
      const currentBlogs = authors.get(blog.author)
      authors.set(blog.author, currentBlogs + 1)
    }
  });

  let authorWithMostBlogs = {
    author: '',
    blogs: -1
  }

  authors.forEach((noBlogs, author) => {
    if (noBlogs > authorWithMostBlogs.blogs) {
      authorWithMostBlogs.author = author
      authorWithMostBlogs.blogs = noBlogs
    }
  })

  return authorWithMostBlogs
}


const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authors = new Map()
  
  blogs.forEach(blog => {
    if (!authors.has(blog.author)) {
      authors.set(blog.author, blog.likes)
    } else {
      const currentLikes = authors.get(blog.author)
      authors.set(blog.author, currentLikes + blog.likes)
    }
  });

  let authorWithMostLikes = {
    author: '',
    likes: -1
  }

  authors.forEach((noLikes, author) => {
    if (noLikes > authorWithMostLikes.likes) {
      authorWithMostLikes.author = author
      authorWithMostLikes.likes = noLikes
    }
  })

  return authorWithMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

