import { Provider, MediaItem } from '../types';

export function buildStreamUrl(
  provider: Provider,
  media: MediaItem,
  season: number = 1,
  episode: number = 1,
  autoplay: boolean = true
): string {
  const isTv = media.type === 'tv';
  const id = provider.idType === 'imdb' 
    ? (media.imdbId || 'tt1375666') 
    : media.id;

  switch (provider.id) {
    case 'vidlink': {
      const base = isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
      return `${base}${provider.extraParams || '?primaryColor=white&secondaryColor=white&iconColor=white&title=false&poster=true&autoplay=true'}`;
    }

    case 'videasy': {
      const base = isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
      if (isTv && autoplay) {
        return `${base}?autoplay=true&autoplay=1&autonext=true&nextEpisode=true&play=true`;
      }
      return autoplay ? `${base}?autoplay=true&autoplay=1&play=true` : base;
    }

    case 'vidplus': {
      const base = isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}`;
      return `${base}${provider.extraParams || '?autoplay=true&autonext=true&nextbutton=true&poster=true&download=true'}`;
    }

    case 'vidplus2': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}?autoplay=true`;
    }

    case 'vidfast': {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}?autoplay=true`
        : `${provider.url}/movie/${id}?autoplay=true`;
    }

    case 'vixsrc': {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
    }

    case 'nxsha_en': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}?lang=en&autoplay=true&sub=en`
        : `${provider.url}/embed/movie/${id}?lang=en&autoplay=true&sub=en`;
    }

    case 'nxsha_hindi': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}?lang=hindi&autoplay=true`
        : `${provider.url}/embed/movie/${id}?lang=hindi&autoplay=true`;
    }

    case 'nxsha_spanish': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}?lang=es&autoplay=true&sub=es`
        : `${provider.url}/embed/movie/${id}?lang=es&autoplay=true&sub=es`;
    }

    case 'primesrc': {
      return isTv 
        ? `${provider.url}/embed/tv?tmdb=${media.id}&season=${season}&episode=${episode}`
        : `${provider.url}/embed/movie?imdb=${id}`;
    }

    case 'twoembed': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}`;
    }

    case 'vidcore': {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}?autoPlay=true&sub=en`
        : `${provider.url}/movie/${id}?autoPlay=true&sub=en`;
    }

    case 'vidsuper': {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
    }

    case 'vidking': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}?autoplay=true&episodeSelector=true`
        : `${provider.url}/embed/movie/${id}?autoplay=true`;
    }

    case 'cinemaos': {
      return isTv 
        ? `${provider.url}/player/${id}/${season}/${episode}`
        : `${provider.url}/player/${id}`;
    }

    case 'moviesapi': {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
    }

    case 'frembed': {
      return isTv 
        ? `${provider.url}/api/serie.php?id=${id}&sa=${season}&epi=${episode}`
        : `${provider.url}/api/film.php?id=${id}`;
    }

    case 'superflix': {
      return isTv 
        ? `${provider.url}/serie/${id}/${season}/${episode}`
        : `${provider.url}/filme/${id}`;
    }

    case 'rivestream': {
      return isTv 
        ? `${provider.url}/embed?type=tv&id=${id}&season=${season}&episode=${episode}`
        : `${provider.url}/embed?type=movie&id=${id}`;
    }

    case 'autoembed_co': {
      return isTv 
        ? `${provider.url}/tv/tmdb/${id}-${season}-${episode}`
        : `${provider.url}/movie/tmdb/${id}`;
    }

    case 'autoembed_cc': {
      return isTv 
        ? `${provider.url}/embed/tv/${id}/${season}/${episode}`
        : `${provider.url}/embed/movie/${id}`;
    }

    default: {
      return isTv 
        ? `${provider.url}/tv/${id}/${season}/${episode}`
        : `${provider.url}/movie/${id}`;
    }
  }
}
