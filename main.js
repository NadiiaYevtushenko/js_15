/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
/* eslint-disable no-return-assign */
/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */

const { of, fromEvent, tap, map, filter, debounceTime, distinctUntilChanged, switchMap, from, catchError } = rxjs;

const moviesListElement = document.getElementById('movies-list');
const searchInput = document.getElementById('search');
const searchCheckbox = document.getElementById('checkbox');

const fetchData = (url) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!data || !data.Search) {
        throw new Error('No movies found!');
      }
      return data.Search;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      return [];
    });

const getMovies = (searchQuery) =>
  from(fetchData(`https://www.omdbapi.com/?apikey=7db3a272&s=${searchQuery}`)).pipe(
    catchError((err) => {
      console.error("Error fetching movies:", err);
      return of([]);
    })
  );

const addMoviesToList = ({ Poster: poster, Title: title, Year: year }) => {
  const item = document.createElement('div');
  const img = document.createElement('img');
  const titleElement = document.createElement('h3');
  const yearElement = document.createElement('p');

  item.classList.add('movie');

  img.classList.add('movie_image');
  img.src = /^(https?:\/\/)/i.test(poster) ? poster : 'img/no-image.png';
  img.alt = `${title} (${year})`;
  img.title = `${title} (${year})`;

  titleElement.textContent = title;
  titleElement.classList.add('movie_title');

  yearElement.textContent = `Year: ${year}`;
  yearElement.classList.add('movie_year');

  item.append(img, titleElement, yearElement);
  moviesListElement.append(item);
};

const searchMovieStream$ = fromEvent(searchInput, 'input').pipe(
  map((e) => e.target.value.trim()),
  filter((value) => value.length > 3),
  debounceTime(1000),
  distinctUntilChanged(),
  tap(() => {
    if (searchCheckbox.checked) {
      moviesListElement.innerHTML = '';
    }
  }),
  tap((searchQuery) => console.log("Searching for:", searchQuery)),
  switchMap((searchQuery) => getMovies(searchQuery)),
  tap((movies) => {
    moviesListElement.innerHTML = '';
    if (movies.length === 0) {
      const noResults = document.createElement('p');
      noResults.textContent = 'No movies found.';
      noResults.classList.add('no-results');
      moviesListElement.appendChild(noResults);
    } else {
      movies.forEach(addMoviesToList);
    }
  })
);

searchMovieStream$.subscribe();
