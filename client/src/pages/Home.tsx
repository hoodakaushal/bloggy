import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search } from '@mui/icons-material';
import BlogCard from '../components/BlogCard';
import { blogApi } from '../services/api';
import type { BlogListItem, PaginatedResponse } from 'shared';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const limit = 9;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page, searchQuery, category]);

  const fetchCategories = async () => {
    try {
      const response = await blogApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (searchQuery || category) {
        response = await blogApi.search({
          query: searchQuery,
          category: category || undefined,
          page,
          limit
        });
      } else {
        response = await blogApi.getAll(page, limit);
      }

      setBlogs(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: any) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    const params: Record<string, string> = { page: value.toString() };
    if (searchQuery) params.search = searchQuery;
    if (category) params.category = category;
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Our Blog
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={handleCategoryChange}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
      ) : blogs.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary">
          No blogs found
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {blogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id}>
                <BlogCard blog={blog} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
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
    </Container>
  );
}
