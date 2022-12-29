import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  formEl: document.querySelector('#search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.style.visibility = 'hidden';

let numPage = 1;

let photoName = '';

const API_KEY = '32429379-576b0609fd53df0167ef76e64';

function makeMarkup(arr) {
  const markup = arr
    .map(
      el => `
		<div class="photo-card">
  <img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes ${el.likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${el.views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${el.comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${el.downloads}</b>
    </p>
  </div>
</div>
		`
    )
    .join('');

  refs.galleryEl.insertAdjacentHTML('beforeend', markup);
}

async function fetchImg(photoName, nPage) {
  const BASE_URL = 'https://pixabay.com/api/';
  const queryParams = {
    params: {
      key: API_KEY,
      q: photoName,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: 40,
      page: nPage,
    },
  };

  const res = await axios.get(`${BASE_URL}`, queryParams);
  const el = res.data;
  makeMarkup(el.hits);
  refs.loadMoreBtn.style.visibility = 'visible';
  return el;
}

refs.formEl.addEventListener('submit', async e => {
  numPage = 1;
  if (refs.loadMoreBtn.style.visibility == 'visible') {
    refs.loadMoreBtn.style.visibility = 'hidden';
  }
  refs.galleryEl.innerHTML = '';

  e.preventDefault();

  const formElement = e.currentTarget.elements;
  photoName = formElement.searchQuery.value.trim();
  if (photoName == '') {
    return;
  }
  try {
    const el = await fetchImg(photoName, numPage);
    if (el.hits.length == 0) {
      refs.loadMoreBtn.style.visibility = 'hidden';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (err) {
    console.log(err);
  }
});

refs.loadMoreBtn.addEventListener('click', async () => {
  try {
    numPage += 1;
    const el = await fetchImg(photoName, numPage);
    if (el.hits.length == 0) {
      refs.loadMoreBtn.style.visibility = 'hidden';
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch {
    refs.loadMoreBtn.style.visibility = 'hidden';
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
});
