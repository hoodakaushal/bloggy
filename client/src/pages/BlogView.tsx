import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { ThumbUp, Visibility, Circle } from '@mui/icons-material';
import { blogApi, commentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socket';
import type { Blog, Comment } from 'shared';

export default function BlogView() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  console.log('BlogView rendered, id:', id);

  // Comment form state
  const [commentContent, setCommentContent] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const MAX_COMMENT_LENGTH = 2000;

  // Check if current user is the blog author
  const isAuthor = isAuthenticated && blog && user && blog.authorId === user.id;

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchComments();
      setupWebSocket();
    }

    return () => {
      if (id) {
        socketService.leaveBlog(parseInt(id));
      }
    };
  }, [id]);

  const setupWebSocket = () => {
    socketService.connect();
    socketService.joinBlog(parseInt(id!));
    setSocketConnected(socketService.isConnected());

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
    }

    const handleNewComment = (comment: Comment) => {
      // Only add if it's for this blog and not already in the list
      if (comment.blogId === parseInt(id!)) {
        setComments((prev) => {
          // Avoid duplicates
          if (prev.find(c => c.id === comment.id)) {
            return prev;
          }
          return [comment, ...prev];
        });
      }
    };

    socketService.onNewComment(handleNewComment);

    return () => {
      socketService.offNewComment(handleNewComment);
    };
  };

  const fetchBlog = async () => {
    console.log('Fetching blog...', id);
    try {
      setLoading(true);
      const response = await blogApi.getById(parseInt(id!));
      console.log('Blog fetched:', response.data.title);
      setBlog(response.data);

      // Mark blog as read in localStorage
      const readBlogs = JSON.parse(localStorage.getItem('readBlogs') || '[]');
      console.log('Current readBlogs:', readBlogs);
      if (!readBlogs.includes(parseInt(id!))) {
        readBlogs.push(parseInt(id!));
        localStorage.setItem('readBlogs', JSON.stringify(readBlogs));
        console.log('Marked blog as read:', id, readBlogs);
      } else {
        console.log('Blog already read:', id);
      }
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      setError(err.response?.data?.error || 'Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentApi.getByBlogId(parseInt(id!));
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleLike = async () => {
    if (liked || !blog) return;

    try {
      const response = await blogApi.like(blog.id);
      setBlog({ ...blog, likes: response.data.likes });
      setLiked(true);
    } catch (err) {
      console.error('Failed to like blog:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    // Validation: content is always required
    if (!commentContent.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    // Check length
    if (commentContent.length > MAX_COMMENT_LENGTH) {
      setCommentError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    // For non-author comments, name is required
    if (!isAuthor && !commentAuthor.trim()) {
      setCommentError('Please enter your name');
      return;
    }

    try {
      setCommentSubmitting(true);

      if (isAuthor) {
        // Post as author (no name needed)
        await commentApi.createAsAuthor({
          blogId: parseInt(id!),
          content: commentContent,
          authorName: user?.username || 'Author'
        });
      } else {
        // Post as regular user/guest
        await commentApi.create({
          blogId: parseInt(id!),
          content: commentContent,
          authorName: commentAuthor
        });
      }

      setCommentContent('');
      setCommentAuthor('');
      setCommentError(null);
      await fetchComments();
    } catch (err: any) {
      console.error('Failed to post comment:', err);
      setCommentError(err.response?.data?.error || 'Failed to post comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !blog) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Blog not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
          {blog.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Circle
            sx={{
              fontSize: 12,
              color: socketConnected ? 'success.main' : 'error.main'
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {socketConnected ? 'Live' : 'Offline'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Chip label={blog.category} color="primary" sx={{ mr: 1 }} />
        {blog.tags.map((tag) => (
          <Chip key={tag} label={tag} variant="outlined" sx={{ mr: 0.5 }} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 3, color: 'text.secondary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Visibility fontSize="small" />
          <Typography variant="body2">{blog.views} views</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleLike}
            disabled={liked}
            color={liked ? 'primary' : 'default'}
            aria-label="like this post"
          >
            <ThumbUp fontSize="small" />
          </IconButton>
          <Typography variant="body2">{blog.likes} likes</Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        Published on {formatDate(blog.createdAt)}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {blog.imageUrl && (
        <Box
          component="img"
          src={blog.imageUrl.startsWith('http') ? blog.imageUrl : `http://localhost:3001${blog.imageUrl}`}
          alt={blog.title}
          sx={{
            width: '100%',
            maxHeight: '500px',
            objectFit: 'cover',
            borderRadius: 2,
            mb: 3
          }}
        />
      )}

      <Box
        className="blog-content"
        sx={{ mb: 4 }}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Comments ({comments.length})
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {isAuthor && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Posting as Author - your comment will be highlighted
          </Alert>
        )}
        {commentError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommentError(null)}>
            {commentError}
          </Alert>
        )}
        <form onSubmit={handleCommentSubmit}>
          {!isAuthor && (
            <TextField
              fullWidth
              label="Your Name"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              required
              sx={{ mb: 2 }}
              helperText="Enter your name to post a comment"
              inputProps={{ maxLength: 100 }}
            />
          )}
          <TextField
            fullWidth
            label={isAuthor ? "Your Comment (as Author)" : "Your Comment"}
            aria-label="Your Comment"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
            error={commentContent.length > MAX_COMMENT_LENGTH}
            helperText={`${commentContent.length}/${MAX_COMMENT_LENGTH} characters ${commentContent.length > MAX_COMMENT_LENGTH ? '(Too long!)' : ''}`}
          />
          <Button
            type="submit"
            variant="contained"
            color={isAuthor ? "success" : "primary"}
            disabled={commentSubmitting || commentContent.length > MAX_COMMENT_LENGTH}
          >
            {commentSubmitting ? 'Posting...' : (isAuthor ? 'Post as Author' : 'Post Comment')}
          </Button>
        </form>
      </Paper>

      <List>
        {comments.map((comment) => (
          <ListItem
            key={comment.id}
            alignItems="flex-start"
            sx={{
              bgcolor: comment.isAuthor ? 'action.hover' : 'transparent',
              mb: 1,
              borderRadius: 1
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">{comment.authorName}</Typography>
                  {comment.isAuthor && (
                    <Chip label="Author" size="small" color="primary" />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    {comment.content}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.createdAt)}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      {comments.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Container>
  );
}
