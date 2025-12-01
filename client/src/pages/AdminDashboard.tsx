import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { blogApi } from '../services/api';
import type { BlogListItem } from 'shared';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogApi.getAllAdmin(page, limit);
      setBlogs(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;

    try {
      console.log('Deleting blog:', blogToDelete);
      await blogApi.delete(blogToDelete);
      console.log('Blog deleted successfully');
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
      await fetchBlogs();
      console.log('Blogs refreshed');
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete blog');
    }
  };

  const openDeleteDialog = (id: number) => {
    setBlogToDelete(id);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blog Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/blog/new')}
          aria-label="Create New Post"
        >
          Create New Post
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Views</TableCell>
                  <TableCell align="center">Likes</TableCell>
                  <TableCell align="center">Comments</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>
                      <Chip label={blog.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={blog.status}
                        size="small"
                        color={blog.status === 'published' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">{blog.views}</TableCell>
                    <TableCell align="center">{blog.likes}</TableCell>
                    <TableCell align="center">{blog.commentCount}</TableCell>
                    <TableCell>{formatDate(blog.createdAt)}</TableCell>
                    <TableCell align="right">
                      {blog.status === 'published' && (
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/blog/${blog.id}`)}
                          title="View"
                        >
                          <Visibility />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/blog/${blog.id}`)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteDialog(blog.id)}
                        title="Delete"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionProps={{
          timeout: 300
        }}
        PaperProps={{
          sx: {
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        <DialogTitle>Delete Blog Post</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this blog post? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            data-testid="confirm-delete-button"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
