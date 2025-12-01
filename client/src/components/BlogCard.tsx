import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Badge
} from '@mui/material';
import { Visibility, ThumbUp, Comment, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { BlogListItem } from 'shared';

interface BlogCardProps {
  blog: BlogListItem;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const navigate = useNavigate();
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const readBlogs = JSON.parse(localStorage.getItem('readBlogs') || '[]');
    setIsRead(readBlogs.includes(blog.id));
  }, [blog.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isRead ? 0.7 : 1,
        position: 'relative'
      }}
      component="article"
      className="blog-post-card"
    >
      {isRead && (
        <Chip
          icon={<CheckCircle />}
          label="Read"
          size="small"
          color="success"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {blog.title}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip label={blog.category} size="small" color="primary" sx={{ mr: 1 }} />
          {blog.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mr: 0.5 }} />
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {blog.excerpt}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {formatDate(blog.createdAt)}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Visibility fontSize="small" color="action" />
            <Typography variant="caption">{blog.views}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThumbUp fontSize="small" color="action" />
            <Typography variant="caption">{blog.likes}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Comment fontSize="small" color="action" />
            <Typography variant="caption">{blog.commentCount}</Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={() => navigate(`/blog/${blog.id}`)}>
          Read More
        </Button>
      </CardActions>
    </Card>
  );
}
