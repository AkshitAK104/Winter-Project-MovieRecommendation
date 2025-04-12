import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, StarBorder } from '@mui/icons-material';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Select,
  MenuItem,
  CircularProgress,
  Box
} from '@mui/material';

const API_KEY = '9d8e505f22d8a8ad9e37d7ca2ffad2ed';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const genreMap = {
  'Action': 28,
  'Drama': 18,
  'Sci-Fi': 878,
  'Comedy': 35,
  'Thriller': 53,
  'Horror': 27,
  'Romance': 10749,
  'Crime': 80,
  'Adventure': 12,
  'Fantasy': 14
};

function App() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratedMovies, setRatedMovies] = useState(() => {
    return JSON.parse(localStorage.getItem('ratedMovies')) || {};
  });

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  useEffect(() => {
    localStorage.setItem('ratedMovies', JSON.stringify(ratedMovies));
  }, [ratedMovies]);

  const fetchPopularMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/movie/popular`, {
        params: {
          api_key: API_KEY,
          language: 'en-US',
          page: 1
        }
      });
      setMovies(response.data.results);
    } catch (err) {
      setError('Failed to load movies. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    if (query.length < 1) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: API_KEY,
          language: 'en-US',
          query: query,
          page: 1
        }
      });
      setMovies(response.data.results);
    } catch (err) {
      setError('Failed to search movies. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (selectedGenres.length === 0) {
      alert('Please select at least one genre first!');
      return;
    }
  
    setLoading(true);
    setError(null);
    try {
      const genreIds = selectedGenres.map(genre => genreMap[genre]).join(',');
      const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: API_KEY,
          language: 'en-US',
          sort_by: 'popularity.desc',
          with_genres: genreIds,
          page: 1
        }
      });
      setMovies(response.data.results);
    } catch (err) {
      setError('Failed to get recommendations. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const handleRateMovie = (movieId, rating) => {
    setRatedMovies(prev => ({
      ...prev,
      [movieId]: rating
    }));
  };
  

  const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const debouncedSearch = debounce(searchMovies, 100);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          MOVIEREC
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}

          sx={{ mb: 3, maxWidth: 400,backgroundColor:'white' }}
        />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select your favorite genres:
          </Typography>
          <Grid container spacing={1} justifyContent="center">
            {Object.keys(genreMap).map(genre => (
              <Grid item key={genre}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedGenres.includes(genre)}
                      onChange={() => handleGenreChange(genre)}
                    />
                  }
                  label={genre}
                />
              </Grid>
            ))}
          </Grid>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={getRecommendations}
            sx={{ mt: 2 }}
          >
            Get Recommendations
          </Button>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}
        
        {!loading && movies.length === 0 && (
          <Typography variant="h6" sx={{ my: 2 }}>
            No movies found matching your criteria.
          </Typography>
        )}
        
        <Grid container spacing={3} sx={{ 
  padding: '16px', // Add padding to container
  justifyContent: 'center' // Center grid items
}}>
  {movies.map(movie => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id} sx={{
      display: 'flex',
      justifyContent: 'center', // Center card horizontally
      padding: '12px !important' // Override default padding for consistent spacing
    }}>
      <Card sx={{ 
        height: '100%', 
        width: '100%', // Ensure full width
        maxWidth: '300px', // Limit maximum width
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03)'
        }
      }}>
        <CardMedia
          component="img"
          sx={{
            height: '400px', // Fixed height
            objectFit: 'cover', // Ensure proper image fit
            width: '100%' // Full width
          }}
          image={
            movie.poster_path 
              ? `${IMAGE_BASE_URL}${movie.poster_path}`
              : 'https://via.placeholder.com/300x450?text=No+Poster'
          }
          alt={movie.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
          }}
        />
        <CardContent sx={{
          flexGrow: 1, // Allow content to grow
          display: 'flex',
          flexDirection: 'column',
          padding: '16px'
        }}>
          <Typography gutterBottom variant="h6" component="div" sx={{
            fontWeight: 'bold',
            minHeight: '64px', // Fixed height for title
            display: '-webkit-box',
            WebkitLineClamp: 2, // Limit to 2 lines
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {movie.title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star color="primary" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {movie.vote_average?.toFixed(1) || 'N/A'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {movie.release_date?.substring(0, 4) || 'N/A'}
            </Typography>
          </Box>
          <Select
            fullWidth
            size="small"
            value={ratedMovies[movie.id] || 0}
            onChange={(e) => handleRateMovie(movie.id, e.target.value)}
            sx={{ 
              mt: 'auto', // Push to bottom
              borderRadius: '8px'
            }}
          >
            <MenuItem value={0}>Rate this</MenuItem>
            <MenuItem value={1}>1 ★</MenuItem>
            <MenuItem value={2}>2 ★★</MenuItem>
            <MenuItem value={3}>3 ★★★</MenuItem>
            <MenuItem value={4}>4 ★★★★</MenuItem>
            <MenuItem value={5}>5 ★★★★★</MenuItem>
          </Select>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
      </Box>
    </Container>
  );
}

export default App;