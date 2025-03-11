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
    .then((data) => data.Search || [])
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

const createMovieElement = ({ Poster: poster, Title: title, Year: year }) => {
  const item = document.createElement('div');
  const img = document.createElement('img');
  const titleElement = document.createElement('h3');
  const yearElement = document.createElement('p');

  item.classList.add('movie');

  img.classList.add('movie_image');
  img.src = /^(https?:\/\/)/i.test(poster) ? poster : "pic/no_pic.jpg";
  img.alt = `${title} (${year})`;
  img.title = `${title} (${year})`;

  titleElement.textContent = title;
  titleElement.classList.add('movie_title');

  yearElement.textContent = `Year: ${year}`;
  yearElement.classList.add('movie_year');

  item.append(img, titleElement, yearElement);
  return item;
};

const searchMovieStream$ = fromEvent(searchInput, 'input').pipe(
  map((e) => e.target.value.trim()),
  filter((value) => value.length > 3),
  debounceTime(800),
  distinctUntilChanged(),
  switchMap((searchQuery) => getMovies(searchQuery)),
  tap((movies) => {
    document.querySelectorAll('.no-results').forEach(el => el.remove());

    if (!searchCheckbox.checked) {
      moviesListElement.innerHTML = "";
    }

    if (movies.length === 0) {
      const noResults = document.createElement('p');
      noResults.textContent = 'Нічого не знайдено.';
      noResults.classList.add('no-results');
      moviesListElement.append(noResults);
    } else {
      if (!searchCheckbox.checked) {
        moviesListElement.innerHTML = "";
      }

      // Додаємо фільми в список
      movies.forEach((movie) => {
        const movieElement = createMovieElement(movie);
        moviesListElement.append(movieElement);
      });
    }
  })
);

searchMovieStream$.subscribe();
